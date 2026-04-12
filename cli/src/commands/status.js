'use strict';

/**
 * forge status [--period Nd]
 *
 * Calcula y muestra la métrica de retrabajo leyendo los archivos de auditoría
 * y el Ledger. Indica si el porcentaje está por encima o debajo del 85%.
 *
 * Flags:
 *   --period Nd    Período de análisis en días (default: 28d)
 */

const fs = require('fs');
const path = require('path');
const { parseArgv } = require('../utils/args');
const { findProjectRoot } = require('../utils/fs-utils');
const { readAudits } = require('../utils/ledger-core');

const THRESHOLD = 85;

module.exports = async function status(argv) {
  const { flags } = parseArgv(argv);

  const periodStr = flags.period || '28d';
  const periodDays = parsePeriod(periodStr);
  if (periodDays === null) {
    console.error(`❌ Período inválido: "${periodStr}" — usa formato como 7d, 28d, 90d`);
    process.exit(1);
  }

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

  // Filtrar por período
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - periodDays);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const inPeriod = audits.filter((a) => {
    const d = (a.created_at || '').slice(0, 10);
    return d >= cutoffStr;
  });

  // Calcular métricas de auditorías
  const totalAudits = inPeriod.length;
  const validatedAudits = inPeriod.filter((a) => a.status === 'validated' || a.status === 'reviewed').length;
  const blockedAudits = inPeriod.filter((a) => a.status === 'blocked').length;
  const closedAudits = validatedAudits + blockedAudits;
  // Solo calculamos tasa cuando hay suficientes auditorías cerradas
  const auditRate = closedAudits >= 3 ? Math.round((validatedAudits / closedAudits) * 100) : null;

  // Leer últimas métricas de PROGRESS.md
  const progressPath = path.join(root, 'docs', 'PROGRESS.md');
  const progressMetrics = fs.existsSync(progressPath)
    ? parseLastProgressMetrics(fs.readFileSync(progressPath, 'utf-8'))
    : null;

  const periodLabel = `${periodDays} días`;
  console.log(`\nPeríodo: últimos ${periodLabel}\n`);

  // Tabla de métricas
  const col1 = 'Fuente';
  const col2 = 'Total';
  const col3 = 'Exitosas';
  const col4 = 'Retrabajo';
  const col5 = 'Tasa';

  console.log(`${pad(col1, 24)} ${pad(col2, 8)} ${pad(col3, 10)} ${pad(col4, 10)} ${col5}`);
  console.log('─'.repeat(62));

  if (totalAudits >= 3) {
    const rework = blockedAudits;
    const rate = auditRate !== null ? `${auditRate}%` : '—';
    console.log(`${pad('Auditorías (Ledger)', 24)} ${pad(String(totalAudits), 8)} ${pad(String(validatedAudits), 10)} ${pad(String(rework), 10)} ${rate}`);
  } else {
    console.log(`${pad('Auditorías (Ledger)', 24)} ${pad(String(totalAudits), 8)} ${pad('—', 10)} ${pad('—', 10)} — (datos insuficientes)`);
  }

  if (progressMetrics) {
    const { total, exitosas, retrabajo, tasa } = progressMetrics;
    console.log(`${pad('Fases (PROGRESS.md)', 24)} ${pad(String(total), 8)} ${pad(String(exitosas), 10)} ${pad(String(retrabajo), 10)} ${tasa}%`);
  }

  console.log('─'.repeat(62));

  // Tasa combinada
  let combinedRate = null;
  if (auditRate !== null && progressMetrics) {
    combinedRate = Math.round((auditRate + progressMetrics.tasa) / 2);
  } else if (auditRate !== null) {
    combinedRate = auditRate;
  } else if (progressMetrics) {
    combinedRate = progressMetrics.tasa;
  }

  if (combinedRate !== null) {
    console.log(`${pad('Tasa combinada', 54)} ${combinedRate}%\n`);
    if (combinedRate >= THRESHOLD) {
      console.log(`✅ Por encima del ${THRESHOLD}% — el proceso está funcionando bien`);
    } else if (combinedRate >= 70) {
      console.log(`⚠️  Por debajo del ${THRESHOLD}% — revisar asignación de modelos en TEAM.md`);
    } else {
      console.log(`❌ Por debajo del 70% — revisar SPEC.md (ambigüedades) y TEAM.md (asignación de modelos)`);
    }
  } else {
    console.log(`\nℹ️  Sin datos suficientes para calcular la tasa combinada.`);
    console.log(`   Necesitas al menos 3 auditorías o una entrada de métricas en PROGRESS.md.`);
  }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parsePeriod(str) {
  const match = str.match(/^(\d+)d$/);
  if (!match) return null;
  return parseInt(match[1], 10);
}

function pad(str, len) {
  return str.length >= len ? str : str + ' '.repeat(len - str.length);
}

/**
 * Extrae la última tabla de métricas de PROGRESS.md.
 * Busca el patrón de tabla con filas "Fases (ROADMAP)" o "Fases (PROGRESS".
 */
function parseLastProgressMetrics(content) {
  // Buscar tablas de métricas: busca líneas con "Fases (ROADMAP" o "Fases (PROGRESS"
  const lines = content.split('\n');
  let lastMetrics = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('Fases (ROADMAP)') || line.includes('Fases (PROGRESS')) {
      // Parsear la fila de la tabla
      const parts = line.split('|').map((s) => s.trim()).filter(Boolean);
      // Expected: [label, total, exitosas, retrabajo, tasa]
      if (parts.length >= 5) {
        const total = parseInt(parts[1], 10);
        const exitosas = parseInt(parts[3], 10); // "17 a la primera" → 17
        const retrabajo = parseInt(parts[4], 10); // "3 rehechas" → 3
        const tasaMatch = parts[5] ? parts[5].match(/(\d+)%/) : null;
        const tasa = tasaMatch ? parseInt(tasaMatch[1], 10) : null;

        if (!isNaN(total) && tasa !== null) {
          lastMetrics = { total, exitosas: isNaN(exitosas) ? 0 : exitosas, retrabajo: isNaN(retrabajo) ? 0 : retrabajo, tasa };
        }
      }
    }
  }

  return lastMetrics;
}
