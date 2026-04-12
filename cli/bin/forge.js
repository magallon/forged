#!/usr/bin/env node
'use strict';

const VERSION = '1.0.0';

const HELP = `⚒️  FORGE CLI v${VERSION}

Uso: forge <comando> [subcomando] [opciones]

Comandos de información (no modifican archivos):
  doctor                       Verifica que la estructura del proyecto esté completa
  audit start <archivo>        Muestra el estado actual de una auditoría
  audit validate <archivo>     Verifica coherencia del YAML antes de cambiar status
  tribunal batch               Cuenta auditorías pendientes de revisión por el Judge
  status                       Calcula y muestra la métrica de retrabajo

Comandos de acción (escriben archivos):
  init                         Crea la estructura completa del proyecto
  audit new <tipo>             Crea un archivo de auditoría nuevo
  ledger                       Regenera docs/audits/README.md
  prune progress               Archiva sesiones antiguas de PROGRESS.md

Mixto:
  session close                Crea entrada parcial en PROGRESS.md desde git

Opciones globales:
  --version, -v                Muestra la versión
  --help, -h                   Muestra esta ayuda`;

const COMMANDS = {
  init: require('../src/commands/init'),
  doctor: require('../src/commands/doctor'),
  audit: require('../src/commands/audit'),
  tribunal: require('../src/commands/tribunal'),
  session: require('../src/commands/session'),
  ledger: require('../src/commands/ledger'),
  status: require('../src/commands/status'),
  prune: require('../src/commands/prune'),
};

async function main() {
  const argv = process.argv.slice(2);

  if (argv.length === 0) {
    console.log(HELP);
    process.exit(0);
  }

  const first = argv[0];

  if (first === '--version' || first === '-v') {
    console.log(`FORGE CLI v${VERSION}`);
    process.exit(0);
  }

  if (first === '--help' || first === '-h') {
    console.log(HELP);
    process.exit(0);
  }

  const command = first;
  const commandArgv = argv.slice(1);

  if (!COMMANDS[command]) {
    console.error(`❌ Comando desconocido: "${command}"`);
    console.error(`   Ejecuta "forge --help" para ver los comandos disponibles.`);
    process.exit(1);
  }

  try {
    await COMMANDS[command](commandArgv);
  } catch (err) {
    console.error(`❌ Error inesperado: ${err.message}`);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(1);
  }
}

main();
