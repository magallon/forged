'use strict';

/**
 * forge init
 *
 * Inicializa la estructura completa de FORGE en el proyecto actual.
 * Copia los templates de project/ a docs/ y scripts/tribunal/ al proyecto.
 *
 * Flags:
 *   --force      Sobreescribe archivos existentes sin pedir confirmación
 *   --dry-run    Muestra qué se crearía sin crear nada
 */

const fs = require('fs');
const path = require('path');
const { parseArgv } = require('../utils/args');
const { confirm } = require('../utils/confirm');
const { copyRecursive, listRecursive, ensureDir } = require('../utils/fs-utils');
const { readAudits, generateLedger } = require('../utils/ledger-core');

// En dev: templates en project/ (sibling del repo).
// En producción (npm global): templates bundleados en cli/templates/.
const DEV_TEMPLATES = path.resolve(__dirname, '../../../project');
const PROD_TEMPLATES = path.resolve(__dirname, '../../templates');
const TEMPLATES_DIR = fs.existsSync(DEV_TEMPLATES) ? DEV_TEMPLATES : PROD_TEMPLATES;

const DEV_SCRIPTS = path.resolve(__dirname, '../../../scripts');
const PROD_SCRIPTS = path.resolve(__dirname, '../../scripts-bundle');
const SCRIPTS_SRC = fs.existsSync(DEV_SCRIPTS) ? DEV_SCRIPTS : PROD_SCRIPTS;

module.exports = async function init(argv) {
  const { flags } = parseArgv(argv);
  const force = flags.force === true;
  const dryRun = flags['dry-run'] === true;
  const cwd = process.cwd();
  const docsDir = path.join(cwd, 'docs');
  const scriptsDir = path.join(cwd, 'scripts');

  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.error(`❌ No se encontraron los templates en: ${TEMPLATES_DIR}`);
    process.exit(1);
  }

  // Construir lista de archivos a crear
  const templateFiles = listRecursive(TEMPLATES_DIR).filter((f) => !f.endsWith('.gitkeep'));
  const scriptFiles = listRecursive(SCRIPTS_SRC);

  // Detectar archivos existentes
  const existing = templateFiles.filter((f) => fs.existsSync(path.join(docsDir, f)));

  if (existing.length > 0 && !force && !dryRun) {
    console.error(`❌ Ya existe docs/ en este directorio`);
    console.error(`   Archivos que serían sobreescritos:`);
    existing.forEach((f) => console.error(`   - docs/${f}`));
    console.error(`\n   Usa --force para sobreescribir o --dry-run para ver qué cambiaría.`);
    process.exit(1);
  }

  // Mostrar preview
  console.log(`\n📁 Archivos que se crearán:\n`);
  templateFiles.forEach((f) => console.log(`   docs/${f}`));
  scriptFiles.forEach((f) => console.log(`   scripts/${f}`));
  console.log(`   docs/audits/README.md  (generado por ledger)`);
  console.log();

  if (dryRun) {
    console.log(`ℹ️  Modo dry-run — no se creó ningún archivo.`);
    process.exit(0);
  }

  if (!force) {
    const ok = await confirm('¿Continuar?');
    if (!ok) {
      console.log('Cancelado.');
      process.exit(0);
    }
    console.log();
  }

  // Copiar templates
  let failures = 0;
  for (const f of templateFiles) {
    const src = path.join(TEMPLATES_DIR, f);
    const dest = path.join(docsDir, f);
    try {
      ensureDir(path.dirname(dest));
      fs.copyFileSync(src, dest);
    } catch (err) {
      console.error(`   ❌ docs/${f}: ${err.message}`);
      failures++;
    }
  }

  // Copiar scripts
  try {
    copyRecursive(SCRIPTS_SRC, scriptsDir);
  } catch (err) {
    console.error(`   ❌ scripts/: ${err.message}`);
    failures++;
  }

  if (failures > 0) {
    console.error(`\n❌ Hubo ${failures} error(es) durante la copia.`);
    process.exit(1);
  }

  // Generar Ledger inicial (vacío)
  const auditsDir = path.join(docsDir, 'audits');
  try {
    const audits = readAudits(auditsDir);
    const ledgerContent = generateLedger(audits);
    fs.writeFileSync(path.join(auditsDir, 'README.md'), ledgerContent, 'utf-8');
  } catch {
    // No fatal — se puede generar después con forge ledger
  }

  console.log(`✅ Estructura FORGE creada exitosamente.\n`);
  console.log(`Siguientes pasos:`);
  console.log(`  1. Llena docs/TEAM.md con los modelos de IA que usarás`);
  console.log(`  2. Llena docs/ROADMAP.md con las fases del proyecto`);
  console.log(`  3. Genera la Tríada Kiro (requirements.md + design.md + tasks.md) para cada fase con Kiro: https://kiro.dev/`);
  console.log(`  4. Crea AGENTS.md en la raíz con las reglas de código`);
  console.log(`  5. Ejecuta "forge doctor" para verificar que todo está en orden`);
};
