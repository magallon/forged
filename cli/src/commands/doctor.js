'use strict';

/**
 * forge doctor
 *
 * Verifica que la estructura del proyecto FORGE esté completa y que los
 * documentos clave no contengan placeholders sin llenar.
 *
 * Flags:
 *   --strict    Trata las advertencias como errores (exit code 1)
 */

const fs = require('fs');
const path = require('path');
const { parseArgv } = require('../utils/args');
const { findProjectRoot } = require('../utils/fs-utils');

// Archivos obligatorios: [ruta-relativa-al-root, tipo]
// tipo: 'error' → ❌ si falta | 'warn' → ⚠️ si falta
const REQUIRED_FILES = [
  { rel: 'docs/SPEC.md',                         level: 'error', check: true },
  { rel: 'docs/TEAM.md',                         level: 'error', check: true },
  { rel: 'docs/ROADMAP.md',                      level: 'error', check: true },
  { rel: 'docs/PROGRESS.md',                     level: 'error', check: true },
  { rel: 'docs/FORGE.md',                        level: 'error', check: true },
  { rel: 'docs/skill/SKILL.md',                  level: 'error', check: true },
  { rel: 'docs/audits/TEMPLATE.md',              level: 'error', check: false }, // template tiene placeholders intencionales
  { rel: 'docs/skill/references/codebase-map.md', level: 'warn',  check: true },
  { rel: 'AGENTS.md',                            level: 'warn',  check: true },  // lo crea el usuario
];

// Regex para detectar placeholders sin llenar: {Texto en mayúsculas o con espacios}
const PLACEHOLDER_RE = /\{[^}]{2,60}\}/g;

module.exports = async function doctor(argv) {
  const { flags } = parseArgv(argv);
  const strict = flags.strict === true;

  const root = findProjectRoot();
  if (!root) {
    console.error(`❌ No se encontró estructura FORGE en este directorio`);
    console.error(`   Ejecuta "forge init" para inicializar la estructura.`);
    process.exit(1);
  }

  let errors = 0;
  let warnings = 0;

  for (const { rel, level, check } of REQUIRED_FILES) {
    const filePath = path.join(root, rel);
    const exists = fs.existsSync(filePath);

    if (!exists) {
      if (level === 'error') {
        console.log(`❌ ${rel} — no encontrado`);
        errors++;
      } else {
        console.log(`⚠️  ${rel} — no encontrado`);
        warnings++;
      }
      continue;
    }

    // Verificar placeholders sin llenar
    if (check) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const matches = content.match(PLACEHOLDER_RE);
      // Filtrar falsos positivos comunes en templates
      const realMatches = matches
        ? matches.filter(
            (m) =>
              !m.startsWith('{Ej.') &&
              !m.startsWith('{YYYY') &&
              m !== '{tipo}' &&
              m !== '{status}' &&
              m !== '{id}'
          )
        : null;

      if (realMatches && realMatches.length > 0) {
        console.log(`⚠️  ${rel} — contiene placeholders sin llenar (${realMatches.slice(0, 3).join(', ')}${realMatches.length > 3 ? '...' : ''})`);
        warnings++;
      } else {
        console.log(`✅ ${rel} — existe`);
      }
    } else {
      console.log(`✅ ${rel} — existe`);
    }
  }

  // Verificar que docs/audits/README.md existe (Ledger generado)
  const ledgerPath = path.join(root, 'docs/audits/README.md');
  if (!fs.existsSync(ledgerPath)) {
    console.log(`⚠️  docs/audits/README.md — no generado (ejecuta "forge ledger")`);
    warnings++;
  } else {
    console.log(`✅ docs/audits/README.md — existe`);
  }

  // Resumen
  console.log();
  if (errors === 0 && warnings === 0) {
    console.log(`✅ Todo en orden.`);
    process.exit(0);
  }

  if (errors > 0) {
    console.log(`${errors} error(es), ${warnings} advertencia(s).`);
  } else {
    console.log(`${warnings} advertencia(s).`);
  }

  const shouldFail = errors > 0 || (strict && warnings > 0);
  process.exit(shouldFail ? 1 : 0);
};
