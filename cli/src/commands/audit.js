'use strict';

/**
 * forge audit <subcomando> [args]
 *
 * Subcomandos:
 *   new <tipo>        Crea un archivo de auditoría nuevo
 *   start <archivo>   Muestra el estado actual de una auditoría
 *   validate <archivo> Verifica coherencia del YAML
 *
 * Tipos válidos: security | perf | a11y | arch | refactor
 */

const fs = require('fs');
const path = require('path');
const { parseArgv } = require('../utils/args');
const { confirm } = require('../utils/confirm');
const { findProjectRoot } = require('../utils/fs-utils');
const { parseFrontmatter } = require('../utils/yaml');
const { toDateStamp, toTimeStamp, toISOTimestamp } = require('../utils/date');

const VALID_TYPES = ['security', 'perf', 'a11y', 'arch', 'refactor'];

// Prefijos de archivo por tipo
const TYPE_PREFIX = {
  security: 'security-audit-',
  perf: 'perf-audit-',
  a11y: 'a11y-audit-',
  arch: 'arch-audit-',
  refactor: 'refactor-audit-',
};

module.exports = async function audit(argv) {
  const { subcommand, positional, flags } = parseArgv(argv);

  if (!subcommand || flags.help || flags.h) {
    console.log(`Uso:
  forge audit new <tipo>         Crea un nuevo archivo de auditoría
  forge audit start <archivo>    Muestra el estado de una auditoría
  forge audit validate <archivo> Verifica coherencia del YAML

Tipos válidos: ${VALID_TYPES.join(' | ')}`);
    process.exit(0);
  }

  switch (subcommand) {
    case 'new':      return auditNew(positional, flags);
    case 'start':    return auditStart(positional, flags);
    case 'validate': return auditValidate(positional, flags);
    default:
      console.error(`❌ Subcomando desconocido: "${subcommand}"`);
      console.error(`   Subcomandos disponibles: new, start, validate`);
      process.exit(1);
  }
};

// ─── audit new ──────────────────────────────────────────────────────────────

async function auditNew(positional, flags) {
  const tipo = positional[0];

  if (!tipo) {
    console.error(`❌ Debes especificar un tipo. Válidos: ${VALID_TYPES.join(', ')}`);
    process.exit(1);
  }

  if (!VALID_TYPES.includes(tipo)) {
    console.error(`❌ Tipo inválido: ${tipo}`);
    console.error(`   Tipos válidos: ${VALID_TYPES.join(', ')}`);
    process.exit(1);
  }

  const root = findProjectRoot();
  if (!root) {
    console.error(`❌ No se encontró estructura FORGE en este directorio`);
    process.exit(1);
  }

  const auditsDir = path.join(root, 'docs', 'audits');
  const templatePath = path.join(auditsDir, 'TEMPLATE.md');

  if (!fs.existsSync(templatePath)) {
    console.error(`❌ TEMPLATE.md no encontrado`);
    console.error(`   Ejecuta "forge doctor" para diagnosticar qué falta.`);
    process.exit(1);
  }

  const now = new Date();
  const dateStamp = toDateStamp(now);
  const timeStamp = toTimeStamp(now);
  const prefix = TYPE_PREFIX[tipo];
  const filename = `${prefix}${dateStamp}.md`;
  const destPath = path.join(auditsDir, filename);
  const auditId = `${prefix}${dateStamp}-${timeStamp}`;

  if (fs.existsSync(destPath)) {
    console.error(`❌ Ya existe una auditoría para hoy de ese tipo`);
    console.error(`   Archivo: ${filename}`);
    console.error(`   El ID incluye la hora — revisa si realmente necesitas una segunda auditoría.`);
    process.exit(1);
  }

  // Leer template y personalizar
  let content = fs.readFileSync(templatePath, 'utf-8');

  // Actualizar campos del YAML frontmatter
  content = content.replace(/(^id:\s*)""/m, `$1"${auditId}"`);
  content = content.replace(/(^tipo:\s*)""/m, `$1"${tipo}"`);
  content = content.replace(/(^created_at:\s*)""/m, `$1"${toISOTimestamp(now)}"`);
  content = content.replace(/(^updated_at:\s*)""/m, `$1"${toISOTimestamp(now)}"`);
  content = content.replace(/(^status:\s*)"draft"/m, `$1"draft"`);

  // Reemplazar opciones de tipo en el YAML comment line si existen
  // Pre-rellenar --component y --scope si se pasaron
  if (flags.component) {
    content = content.replace(/(^componente:\s*)""/m, `$1"${flags.component}"`);
  }
  if (flags.scope) {
    content = content.replace(/(^alcance:\s*)""/m, `$1"${flags.scope}"`);
  }

  // Actualizar el título del documento
  content = content.replace(/# 🏛️ Revisión: `\{id\}`/, `# 🏛️ Revisión: \`${auditId}\``);

  // Preview y confirmación
  console.log(`\nSe creará:\n  ${path.relative(root, destPath)}`);
  console.log(`  ID: ${auditId}`);
  console.log(`  Status: draft — listo para pasarle al Checker\n`);

  const ok = await confirm('¿Continuar?');
  if (!ok) {
    console.log('Cancelado.');
    process.exit(0);
  }

  fs.writeFileSync(destPath, content, 'utf-8');
  console.log(`\n✅ Creado: ${filename}`);
  console.log(`   Próximo paso: pásaselo al Checker (Auditor)`);
  process.exit(0);
}

// ─── audit start ────────────────────────────────────────────────────────────

async function auditStart(positional, flags) {
  const filename = positional[0];

  if (!filename) {
    console.error(`❌ Debes especificar el archivo de auditoría.`);
    console.error(`   Uso: forge audit start <archivo>`);
    process.exit(1);
  }

  const root = findProjectRoot();
  if (!root) {
    console.error(`❌ No se encontró estructura FORGE en este directorio`);
    process.exit(1);
  }

  const filePath = path.join(root, 'docs', 'audits', path.basename(filename));

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Archivo no encontrado`);
    console.error(`   Verifica con: ls docs/audits/`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const meta = parseFrontmatter(content);

  if (!meta) {
    console.error(`❌ Sin frontmatter YAML válido`);
    console.error(`   El archivo puede estar corrupto — revísalo manualmente.`);
    process.exit(1);
  }

  const status = meta.status || 'draft';
  const nextPhase = nextPhaseFor(status);
  const missing = missingFieldsFor(meta, status);

  console.log(`\nArchivo:   ${path.basename(filePath)}`);
  console.log(`ID:        ${meta.id || '(sin ID)'}`);
  console.log(`Tipo:      ${meta.tipo || '(sin tipo)'}`);
  console.log(`Estado:    ${status}`);
  console.log(`Fase siguiente: ${nextPhase}`);

  if (meta.auditor?.findings_count != null) {
    const { accepted_count = 0, rejected_count = 0, partial_count = 0 } = meta.executor || {};
    console.log(`Hallazgos reportados: ${meta.auditor.findings_count} (implementados: ${accepted_count}, rechazados: ${rejected_count}, parciales: ${partial_count})`);
  }

  if (missing.length > 0) {
    console.log(`\nCampos faltantes en YAML:`);
    missing.forEach((f) => console.log(`  - ${f}`));
  } else {
    console.log(`\n✅ Todos los campos requeridos para el estado actual están completos.`);
  }

  process.exit(0);
}

function nextPhaseFor(status) {
  const phases = {
    draft: 'CHECKER — El Auditor debe analizar el código y producir hallazgos',
    audited: 'MAKER — El Ejecutor debe implementar o rechazar cada hallazgo',
    validated: 'JUDGE (cuando se acumulen 5+ auditorías validated) o CERRADA',
    blocked: 'MAKER — El Ejecutor debe resolver los bloqueos pendientes',
    reviewed: 'CERRADA — El ciclo completo ha terminado',
  };
  return phases[status] || 'DESCONOCIDA';
}

function missingFieldsFor(meta, status) {
  const missing = [];

  if (status === 'draft') {
    // draft: no hay campos obligatorios todavía
    return [];
  }

  if (['audited', 'validated', 'blocked', 'reviewed'].includes(status)) {
    if (!meta.auditor?.model) missing.push('auditor.model');
    if (!meta.auditor?.timestamp) missing.push('auditor.timestamp');
    if (!meta.auditor?.findings_count) missing.push('auditor.findings_count');
  }

  if (['validated', 'blocked', 'reviewed'].includes(status)) {
    if (!meta.executor?.model) missing.push('executor.model');
    if (!meta.executor?.timestamp) missing.push('executor.timestamp');
    if (!meta.executor?.commit_ref && status === 'validated') missing.push('executor.commit_ref');
    if (!meta.executor?.validation?.result) missing.push('executor.validation.result');
  }

  if (status === 'reviewed') {
    if (!meta.judge?.model) missing.push('judge.model');
    if (!meta.judge?.timestamp) missing.push('judge.timestamp');
    if (!meta.judge?.verdict) missing.push('judge.verdict');
  }

  return missing;
}

// ─── audit validate ──────────────────────────────────────────────────────────

async function auditValidate(positional, flags) {
  const filename = positional[0];

  if (!filename) {
    console.error(`❌ Debes especificar el archivo de auditoría.`);
    console.error(`   Uso: forge audit validate <archivo>`);
    process.exit(1);
  }

  const root = findProjectRoot();
  if (!root) {
    console.error(`❌ No se encontró estructura FORGE en este directorio`);
    process.exit(1);
  }

  const filePath = path.join(root, 'docs', 'audits', path.basename(filename));

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Archivo no encontrado`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const meta = parseFrontmatter(content);

  if (!meta) {
    console.error(`❌ Sin frontmatter YAML válido`);
    process.exit(1);
  }

  const checks = [];

  // 1. Coherencia de contadores
  if (meta.executor && meta.auditor?.findings_count != null) {
    const total = meta.auditor.findings_count;
    const accepted = meta.executor.accepted_count || 0;
    const rejected = meta.executor.rejected_count || 0;
    const partial = meta.executor.partial_count || 0;
    const sum = accepted + rejected + partial;

    if (sum === total) {
      checks.push({ ok: true, msg: `findings_count (${total}) = accepted(${accepted}) + rejected(${rejected}) + partial(${partial})` });
    } else {
      checks.push({ ok: false, msg: `findings_count no coincide: ${total} ≠ ${accepted}+${rejected}+${partial} (=${sum})` });
    }
  }

  // 2. validation.result válido
  const validResult = meta.executor?.validation?.result;
  if (validResult !== null && validResult !== undefined) {
    if (validResult === 'pass' || validResult === 'fail') {
      checks.push({ ok: true, msg: `validation.result: ${validResult}` });
    } else {
      checks.push({ ok: false, msg: `validation.result inválido: "${validResult}" (debe ser pass | fail)` });
    }
  }

  // 3. max_severity válido
  const validSeverities = ['critical', 'high', 'medium', 'low'];
  if (meta.max_severity) {
    if (validSeverities.includes(meta.max_severity)) {
      checks.push({ ok: true, msg: `max_severity: ${meta.max_severity}` });
    } else {
      checks.push({ ok: false, msg: `max_severity inválido: "${meta.max_severity}" (debe ser: ${validSeverities.join(' | ')})` });
    }
  }

  // 4. Campos obligatorios según el status al que se quiere transicionar
  const status = meta.status || 'draft';

  if (status === 'validated' || status === 'blocked') {
    if (!meta.executor?.commit_ref && status === 'validated') {
      checks.push({ ok: false, msg: `executor.commit_ref está vacío\n   No puedes marcar status: validated sin commit de referencia` });
    } else if (status === 'validated') {
      checks.push({ ok: true, msg: `executor.commit_ref: presente` });
    }

    if (!meta.executor?.validation?.result) {
      checks.push({ ok: false, msg: `executor.validation.result está vacío` });
    }
  }

  // Mostrar resultados
  let hasErrors = false;
  for (const { ok, msg } of checks) {
    if (ok) {
      console.log(`✅ ${msg}`);
    } else {
      console.log(`❌ ${msg}`);
      hasErrors = true;
    }
  }

  if (checks.length === 0) {
    console.log(`ℹ️  No hay datos suficientes para validar (status: ${status})`);
    process.exit(0);
  }

  if (hasErrors) {
    console.log(`\n❌ El YAML tiene inconsistencias — corrígelas antes de cambiar el status.`);
    process.exit(1);
  } else {
    console.log(`\n✅ YAML coherente — puedes cambiar el status con seguridad.`);
    process.exit(0);
  }
}
