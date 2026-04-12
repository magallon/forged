'use strict';

/**
 * forge ledger [--watch]
 *
 * Regenera docs/audits/README.md leyendo el YAML frontmatter de todos los
 * archivos en docs/audits/.
 *
 * Flags:
 *   --watch    Regenera automáticamente al detectar cambios en docs/audits/
 */

const fs = require('fs');
const path = require('path');
const { parseArgv } = require('../utils/args');
const { findProjectRoot } = require('../utils/fs-utils');
const { readAudits, generateLedger } = require('../utils/ledger-core');

module.exports = async function ledger(argv) {
  const { flags } = parseArgv(argv);
  const watchMode = flags.watch === true;

  const root = findProjectRoot();
  if (!root) {
    console.error(`❌ No se encontró estructura FORGE en este directorio`);
    process.exit(1);
  }

  const auditsDir = path.join(root, 'docs', 'audits');
  const outputFile = path.join(auditsDir, 'README.md');

  function regenerate() {
    const audits = readAudits(auditsDir);
    const content = generateLedger(audits);
    fs.writeFileSync(outputFile, content, 'utf-8');
    console.log(`✅ ${outputFile} generado — ${audits.length} revisión(es).`);
    return audits.length;
  }

  try {
    regenerate();
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }

  if (watchMode) {
    console.log(`\n👁️  Modo watch activo. Ctrl+C para salir.\n`);
    fs.watch(auditsDir, (eventType, filename) => {
      if (filename && filename.endsWith('.md') && filename !== 'README.md') {
        console.log(`📝 Cambio detectado: ${filename}`);
        try {
          regenerate();
        } catch (err) {
          console.error(`❌ ${err.message}`);
        }
      }
    });
  }
};
