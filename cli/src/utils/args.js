'use strict';

/**
 * Parsea un array argv sin dependencias externas.
 *
 * Retorna: { subcommand, positional, flags }
 *
 * Ejemplos:
 *   ['--force']                   → { subcommand: null, positional: [], flags: { force: true } }
 *   ['new', 'security']           → { subcommand: 'new', positional: ['security'], flags: {} }
 *   ['progress', '--keep', '10']  → { subcommand: 'progress', positional: [], flags: { keep: '10' } }
 *   ['--period', '90d']           → { subcommand: null, positional: [], flags: { period: '90d' } }
 */
function parseArgv(argv) {
  const flags = {};
  const positional = [];
  let subcommand = null;

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];

    if (arg === '--') {
      // Everything after -- is positional
      i++;
      while (i < argv.length) {
        positional.push(argv[i]);
        i++;
      }
      break;
    }

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('-')) {
        flags[key] = next;
        i += 2;
      } else {
        flags[key] = true;
        i++;
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      // Short flag: -f, -h, -v
      const key = arg.slice(1);
      flags[key] = true;
      i++;
    } else {
      // Positional: first is subcommand, rest are args
      if (subcommand === null) {
        subcommand = arg;
      } else {
        positional.push(arg);
      }
      i++;
    }
  }

  return { subcommand, positional, flags };
}

module.exports = { parseArgv };
