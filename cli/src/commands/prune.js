'use strict';

/**
 * forge prune progress [--keep N] [--before YYYY-MM-DD] [--dry-run]
 *
 * Archiva sesiones antiguas de PROGRESS.md en
 * docs/skill/references/progress-archive.md para mantener el archivo ligero.
 *
 * Flags:
 *   --keep N             Mantiene las últimas N sesiones, archiva el resto
 *   --before YYYY-MM-DD  Archiva sesiones anteriores a esa fecha
 *   --dry-run            Muestra qué se archivaría sin mover nada
 */

const fs = require('fs');
const path = require('path');
const { parseArgv } = require('../utils/args');
const { confirm } = require('../utils/confirm');
const { findProjectRoot, ensureDir } = require('../utils/fs-utils');
const { toISODate } = require('../utils/date');

// Umbral automático: si PROGRESS.md tiene más de este número de sesiones, sugiere podar
const AUTO_THRESHOLD = 20;

module.exports = async function prune(argv) {
  const { subcommand, flags } = parseArgv(argv);

  if (!subcommand) {
    console.error(`❌ Debes especificar un subcomando.`);
    console.error(`   Uso: forge prune progress [--keep N] [--before YYYY-MM-DD] [--dry-run]`);
    process.exit(1);
  }

  if (subcommand !== 'progress') {
    console.error(`❌ Subcomando desconocido: "${subcommand}"`);
    console.error(`   Subcomandos disponibles: progress`);
    process.exit(1);
  }

  const dryRun = flags['dry-run'] === true;
  const keepN = flags.keep ? parseInt(flags.keep, 10) : null;
  const beforeDate = flags.before || null;

  const root = findProjectRoot();
  if (!root) {
    console.error(`❌ No se encontró estructura FORGE en este directorio`);
    process.exit(1);
  }

  const progressPath = path.join(root, 'docs', 'PROGRESS.md');
  if (!fs.existsSync(progressPath)) {
    console.error(`❌ PROGRESS.md no encontrado`);
    console.error(`   Ejecuta "forge init" o crea PROGRESS.md manualmente.`);
    process.exit(1);
  }

  const content = fs.readFileSync(progressPath, 'utf-8');
  const { header, sessions, footer } = parseProgress(content);

  if (sessions.length === 0) {
    console.log(`ℹ️  Nada que archivar — PROGRESS.md no tiene sesiones registradas.`);
    process.exit(0);
  }

  // Estimar "tokens" (palabras × 1.3 ≈ tokens)
  const estimatedTokens = Math.round(content.split(/\s+/).length * 1.3);
  console.log(`PROGRESS.md tiene ${sessions.length} sesión(es) (~${estimatedTokens} tokens estimados)\n`);

  // Determinar qué sesiones archivar
  let toArchive = [];
  let toKeep = [];

  if (keepN !== null) {
    // Mantener las últimas N, archivar el resto
    if (keepN >= sessions.length) {
      console.log(`ℹ️  Nada que archivar — hay ${sessions.length} sesión(es) y --keep es ${keepN}.`);
      process.exit(0);
    }
    toKeep = sessions.slice(-keepN);
    toArchive = sessions.slice(0, sessions.length - keepN);
  } else if (beforeDate !== null) {
    // Archivar sesiones anteriores a la fecha
    toArchive = sessions.filter((s) => s.date && s.date < beforeDate);
    toKeep = sessions.filter((s) => !s.date || s.date >= beforeDate);
  } else {
    // Automático: archivar si hay más de AUTO_THRESHOLD sesiones
    if (sessions.length <= AUTO_THRESHOLD) {
      console.log(`ℹ️  Nada que archivar — hay ${sessions.length} sesión(es) (umbral: ${AUTO_THRESHOLD}).`);
      console.log(`   Usa --keep N o --before YYYY-MM-DD para forzar la poda.`);
      process.exit(0);
    }
    // Mantener las últimas 10, archivar el resto
    toKeep = sessions.slice(-10);
    toArchive = sessions.slice(0, sessions.length - 10);
  }

  if (toArchive.length === 0) {
    console.log(`ℹ️  Nada que archivar.`);
    process.exit(0);
  }

  // Preview
  console.log(`Sesiones a archivar (${toArchive.length}):`);
  toArchive.forEach((s) => {
    console.log(`  - ${s.date || '(sin fecha)'} — ${s.title}`);
  });
  console.log(`\nSesiones que se mantienen: ${toKeep.length}`);

  if (dryRun) {
    console.log(`\nℹ️  Modo dry-run — no se movió nada.`);
    process.exit(0);
  }

  const ok = await confirm('\n¿Continuar?');
  if (!ok) {
    console.log('Cancelado.');
    process.exit(0);
  }

  // Mover al archivo
  const archivePath = path.join(root, 'docs', 'skill', 'references', 'progress-archive.md');
  ensureDir(path.dirname(archivePath));

  let archiveContent = '';
  if (fs.existsSync(archivePath)) {
    archiveContent = fs.readFileSync(archivePath, 'utf-8').trimEnd() + '\n\n';
  } else {
    archiveContent = `# Archivo de Progreso — Sesiones Antiguas\n\n> Generado por \`forge prune progress\`\n\n---\n\n`;
  }

  archiveContent += toArchive.map((s) => s.raw).join('\n\n---\n\n') + '\n';
  fs.writeFileSync(archivePath, archiveContent, 'utf-8');

  // Reescribir PROGRESS.md sin las sesiones archivadas
  const keptTokens = Math.round(
    toKeep.map((s) => s.raw).join(' ').split(/\s+/).length * 1.3
  );
  const newProgressContent = rebuildProgress(header, toKeep, footer);
  fs.writeFileSync(progressPath, newProgressContent, 'utf-8');

  console.log(`\n✅ ${toArchive.length} sesión(es) movida(s) a ${path.relative(root, archivePath)}`);
  console.log(`✅ PROGRESS.md ahora tiene ${toKeep.length} sesión(es) (~${keptTokens} tokens estimados)`);
};

// ─── Parser de PROGRESS.md ───────────────────────────────────────────────────

/**
 * Divide PROGRESS.md en:
 * - header: todo hasta la primera sesión
 * - sessions: array de { date, title, raw }
 * - footer: contenido después de la última sesión (comentarios de cierre)
 */
function parseProgress(content) {
  const SESSION_RE = /^## Sesión (\d{4}-\d{2}-\d{2}) — (.+)$/m;
  const lines = content.split('\n');

  let headerLines = [];
  let footerLines = [];
  let sessions = [];
  let currentSession = null;
  let inSessions = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^## Sesión (\d{4}-\d{2}-\d{2}) — (.+)$/);

    if (match) {
      inSessions = true;
      if (currentSession) {
        sessions.push(finishSession(currentSession));
      }
      currentSession = { date: match[1], title: match[2], lines: [line] };
    } else if (inSessions && currentSession) {
      // Líneas del comentario de cierre (al final del archivo) van al footer
      if (line.startsWith('<!-- FORGE')) {
        sessions.push(finishSession(currentSession));
        currentSession = null;
        footerLines.push(line);
      } else {
        currentSession.lines.push(line);
      }
    } else if (!inSessions) {
      headerLines.push(line);
    } else {
      footerLines.push(line);
    }
  }

  if (currentSession) {
    sessions.push(finishSession(currentSession));
  }

  return {
    header: headerLines.join('\n'),
    sessions,
    footer: footerLines.join('\n'),
  };
}

function finishSession(session) {
  // Trim trailing empty lines from session content
  const lines = session.lines;
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }
  return {
    date: session.date,
    title: session.title,
    raw: lines.join('\n'),
  };
}

function rebuildProgress(header, sessions, footer) {
  const parts = [header.trimEnd()];
  for (const s of sessions) {
    parts.push('\n\n' + s.raw);
  }
  if (footer.trim()) {
    parts.push('\n\n' + footer.trim());
  }
  return parts.join('') + '\n';
}
