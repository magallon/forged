'use strict';

/**
 * forge tribunal batch [--threshold N]
 *
 * Lista las auditorías en estado validated que aún no tienen reviewed,
 * y avisa si se superó el umbral para activar el Judge.
 *
 * Flags:
 *   --threshold N    Umbral de alerta (default: 5)
 */

const path = require('path');
const { parseArgv } = require('../utils/args');
const { findProjectRoot } = require('../utils/fs-utils');
const { readAudits } = require('../utils/ledger-core');

module.exports = async function tribunal(argv) {
  const { subcommand, flags } = parseArgv(argv);

  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    console.log(`Uso: forge tribunal batch [--threshold N]`);
    process.exit(0);
  }

  if (subcommand !== 'batch') {
    console.error(`❌ Subcomando desconocido: "${subcommand}"`);
    console.error(`   Subcomandos disponibles: batch`);
    process.exit(1);
  }

  const threshold = flags.threshold ? parseInt(flags.threshold, 10) : 5;

  const root = findProjectRoot();
  if (!root) {
    console.error(`❌ No se encontró estructura FORGE en este directorio`);
    process.exit(1);
  }

  const auditsDir = path.join(root, 'docs', 'audits');
  let audits;
  try {
    audits = readAudits(auditsDir);
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }

  // validated sin reviewed = status validated Y judge.verdict vacío/null
  const pending = audits.filter(
    (a) =>
      (a.status === 'validated') &&
      (!a.judge || !a.judge.verdict)
  );

  console.log(`Auditorías validated sin reviewed: ${pending.length}`);

  if (pending.length >= threshold) {
    console.log(`⚠️  Superaste el umbral de ${threshold} — es momento de activar el Judge\n`);
  } else {
    console.log(`ℹ️  Por debajo del umbral de ${threshold} — aún no es necesario activar el Judge\n`);
  }

  if (pending.length > 0) {
    console.log(`Pendientes de revisión:`);
    for (const a of pending) {
      const date = (a.created_at || '').slice(0, 10) || '(sin fecha)';
      console.log(`  - ${a.file} (${date})`);
    }
  }
};
