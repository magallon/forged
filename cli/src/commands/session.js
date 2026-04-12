'use strict';

/**
 * forge session close
 *
 * Crea una entrada parcial en PROGRESS.md con los archivos modificados
 * según git status. El humano completa el título y las decisiones técnicas.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { parseArgv } = require('../utils/args');
const { findProjectRoot } = require('../utils/fs-utils');
const { toISODate } = require('../utils/date');

module.exports = async function session(argv) {
  const { subcommand } = parseArgv(argv);

  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    console.log(`Uso: forge session close`);
    process.exit(0);
  }

  if (subcommand !== 'close') {
    console.error(`❌ Subcomando desconocido: "${subcommand}"`);
    console.error(`   Subcomandos disponibles: close`);
    process.exit(1);
  }

  const root = findProjectRoot();
  if (!root) {
    console.error(`❌ No se encontró estructura FORGE en este directorio`);
    process.exit(1);
  }

  // Verificar que es un repositorio git
  let gitStatus = '';
  try {
    gitStatus = execSync('git status --porcelain', {
      encoding: 'utf-8',
      cwd: root,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch {
    console.error(`❌ No es un repositorio git`);
    console.error(`   Ejecuta "git init" o verifica que estés en la raíz correcta.`);
    process.exit(1);
  }

  const progressPath = path.join(root, 'docs', 'PROGRESS.md');
  if (!fs.existsSync(progressPath)) {
    console.error(`❌ PROGRESS.md no encontrado`);
    console.error(`   Ejecuta "forge init" o crea PROGRESS.md manualmente.`);
    process.exit(1);
  }

  // Parsear archivos modificados
  const modifiedFiles = gitStatus
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => line.slice(3).trim())
    .filter((f) => f.length > 0);

  const today = toISODate();

  // Construir entrada parcial
  const filesSection = modifiedFiles.length > 0
    ? modifiedFiles.map((f) => `- \`${f}\``).join('\n')
    : '- (sin archivos modificados detectados en git)';

  const newEntry = `
## Sesión ${today} — [TÍTULO PENDIENTE]

### Cambios realizados
${filesSection}

### Decisiones técnicas

| Decisión | Razonamiento |
|:---------|:-------------|
| [pendiente] | |

### Validación
- Build: [pendiente]
- Tests: [pendiente]

---
`;

  // Actualizar tabla resumen al inicio de PROGRESS.md
  let progressContent = fs.readFileSync(progressPath, 'utf-8');
  progressContent = insertSummaryRow(progressContent, today);

  // Agregar la entrada al final (antes del comentario de cierre si existe)
  const closingComment = `<!-- FORGE v1.0 — Diario del Proyecto -->`;
  if (progressContent.includes(closingComment)) {
    progressContent = progressContent.replace(
      closingComment,
      `${newEntry}\n${closingComment}`
    );
  } else {
    progressContent = progressContent.trimEnd() + '\n' + newEntry;
  }

  fs.writeFileSync(progressPath, progressContent, 'utf-8');

  console.log(`✅ Entrada creada en PROGRESS.md`);
  console.log(`✅ Tabla resumen actualizada`);
  console.log(`\nArchivos modificados detectados: ${modifiedFiles.length}`);
  if (modifiedFiles.length > 0) {
    modifiedFiles.forEach((f) => console.log(`  - ${f}`));
  }

  console.log(`\nCompleta manualmente:`);
  console.log(`  - Título de la sesión`);
  console.log(`  - Decisiones técnicas tomadas`);
  console.log(`  - Resultado de validación`);

  // Advertencias
  const roadmapTouched = modifiedFiles.some((f) => f.includes('ROADMAP.md'));
  const codemapTouched = modifiedFiles.some((f) => f.includes('codebase-map.md'));
  const hasNewFiles = gitStatus.split('\n').some((line) => line.startsWith('?? '));

  if (!roadmapTouched) {
    console.log(`\n⚠️  ROADMAP.md no fue tocado — ¿completaste alguna fase?`);
  }
  if (!codemapTouched && hasNewFiles) {
    console.log(`⚠️  codebase-map.md — se detectaron archivos nuevos, actualiza el mapa`);
  }
};

/**
 * Inserta una nueva fila en la tabla "## Resumen de Sesiones" de PROGRESS.md.
 */
function insertSummaryRow(content, date) {
  // Buscar la tabla de resumen y agregar una fila
  const tableHeaderRe = /(\| Fecha \| Sesión \| Estado \|\n\|[:\-| ]+\|\n)/;
  const newRow = `| ${date} | [TÍTULO PENDIENTE] | ⏳ En progreso |\n`;

  if (tableHeaderRe.test(content)) {
    return content.replace(tableHeaderRe, `$1${newRow}`);
  }
  // Si no encuentra la tabla, retorna el contenido sin cambios
  return content;
}
