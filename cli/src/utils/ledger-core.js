'use strict';

/**
 * Lógica central del Ledger de TRIBUNAL.
 * Compartida por cli/src/commands/ledger.js y (si se migra) scripts/tribunal/update-reviews.js.
 */

const fs = require('fs');
const path = require('path');
const { parseFrontmatter } = require('./yaml');

const TEMPLATE_FILE = 'TEMPLATE.md';
const PROTOCOL_FILE = 'PROTOCOL.md';
const IGNORED_FILES = new Set(['README.md', TEMPLATE_FILE, PROTOCOL_FILE, '.gitkeep']);

const STATUS_BADGE = {
  draft: '⬜ Draft',
  audited: '🔍 Audited',
  validated: '✅ Validated',
  blocked: '🚫 Blocked',
  reviewed: '🏛️ Reviewed',
  // v1.x compatibilidad
  implemented: '🔧 Implemented',
  verified: '✅ Verified',
  rejected: '❌ Rejected',
  escalated: '⚠️ Escalated',
};

const VERDICT_BADGE = {
  'reviewed-ok': '✅ OK',
  'reviewed-issues': '🟡 Issues',
  'reviewed-escalated': '⚠️ Escalated',
  approved: '✅ Approved',
  'conditionally-approved': '🟡 Conditionally Approved',
  rejected: '❌ Rejected',
  escalated: '⚠️ Escalated',
};

const VALIDATION_BADGE = {
  pass: '✅ Pass',
  fail: '❌ Fail',
};

const TYPE_EMOJI = {
  security: '🔒',
  performance: '⚡',
  perf: '⚡',
  accessibility: '♿',
  a11y: '♿',
  architecture: '🏗️',
  arch: '🏗️',
  refactor: '🔄',
};

/**
 * Lee todos los archivos de auditoría en auditsDir y retorna sus metadatos.
 * Emite advertencias en stderr para archivos sin frontmatter.
 */
function readAudits(auditsDir) {
  if (!fs.existsSync(auditsDir)) {
    throw new Error(`docs/audits/ no existe`);
  }

  const files = fs
    .readdirSync(auditsDir)
    .filter((f) => f.endsWith('.md') && !IGNORED_FILES.has(f));

  const audits = [];

  for (const file of files) {
    const filePath = path.join(auditsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const meta = parseFrontmatter(content);

    if (!meta) {
      process.stderr.write(`⚠️  Sin frontmatter YAML en ${file}\n`);
      continue;
    }

    audits.push({
      file,
      ...meta,
      _sortDate: meta.created_at || meta.updated_at || '0000-00-00',
    });
  }

  audits.sort((a, b) => (b._sortDate > a._sortDate ? 1 : -1));
  return audits;
}

/**
 * Genera el contenido Markdown del Ledger.
 */
function generateLedger(audits) {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  let md = `# 🏛️ TRIBUNAL — Registro de Revisiones (The Ledger)

> Índice auto-generado por \`forge ledger\`
> Última actualización: ${now} UTC
> Total de revisiones: **${audits.length}**

---

`;

  if (audits.length === 0) {
    md += `*No hay revisiones registradas. Usa \`forge audit new <tipo>\` para iniciar una auditoría.*\n`;
    return md;
  }

  // Resumen por estado
  const statusCounts = {};
  for (const r of audits) {
    const s = r.status || 'unknown';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  }

  md += `## Resumen\n\n`;
  md += `| Estado | Cantidad |\n|:-------|:---------|\n`;
  for (const [status, count] of Object.entries(statusCounts)) {
    md += `| ${STATUS_BADGE[status] || status} | ${count} |\n`;
  }
  md += `\n---\n\n`;

  // Tabla principal
  md += `## Registro Cronológico\n\n`;
  md += `| Fecha | Tipo | Componente | Checker | Maker | Validación | Estado | Judge | Archivo |\n`;
  md += `|:------|:-----|:-----------|:--------|:------|:-----------|:-------|:------|:--------|\n`;

  for (const r of audits) {
    const date = (r.created_at || '—').slice(0, 10);
    const tipo = `${TYPE_EMOJI[r.tipo] || '📋'} ${r.tipo || '—'}`;
    const comp = r.componente ? `\`${r.componente}\`` : '—';
    const checker = r.auditor?.model || '—';
    const maker = r.executor?.model || '—';
    const validation = r.executor?.validation?.result
      ? VALIDATION_BADGE[r.executor.validation.result] || r.executor.validation.result
      : '—';
    const status = STATUS_BADGE[r.status] || r.status || '—';
    const judge = r.judge?.verdict
      ? VERDICT_BADGE[r.judge.verdict] || r.judge.verdict
      : '—';
    const link = `[${r.file}](./${r.file})`;

    md += `| ${date} | ${tipo} | ${comp} | ${checker} | ${maker} | ${validation} | ${status} | ${judge} | ${link} |\n`;
  }

  md += `\n---\n\n`;

  // Auditorías bloqueadas
  const blocked = audits.filter((r) => r.status === 'blocked');
  if (blocked.length > 0) {
    md += `## ⚠️ Auditorías Bloqueadas\n\n`;
    md += `| Fecha | Componente | Maker | Notas | Archivo |\n`;
    md += `|:------|:-----------|:------|:------|:--------|\n`;
    for (const r of blocked) {
      const date = (r.created_at || '—').slice(0, 10);
      const comp = r.componente ? `\`${r.componente}\`` : '—';
      const maker = r.executor?.model || '—';
      const notes = r.executor?.validation?.notes || '—';
      const link = `[${r.file}](./${r.file})`;
      md += `| ${date} | ${comp} | ${maker} | ${notes} | ${link} |\n`;
    }
    md += `\n---\n\n`;
  }

  // Evaluaciones del Judge
  const reviewed = audits.filter((r) => r.status === 'reviewed');
  if (reviewed.length > 0) {
    const batches = {};
    for (const r of reviewed) {
      const batch = r.judge?.review_batch || 'sin-lote';
      if (!batches[batch]) batches[batch] = [];
      batches[batch].push(r);
    }

    md += `## 🏛️ Evaluaciones del Judge\n\n`;
    for (const [batch, items] of Object.entries(batches)) {
      md += `### Lote: \`${batch}\`\n\n`;
      md += `| Componente | Checker Score | Maker Score | Veredicto | Archivo |\n`;
      md += `|:-----------|:-------------|:------------|:----------|:--------|\n`;
      for (const r of items) {
        const comp = r.componente ? `\`${r.componente}\`` : '—';
        const cScore = r.judge?.auditor_score != null ? `${r.judge.auditor_score}/100` : '—';
        const mScore = r.judge?.executor_score != null ? `${r.judge.executor_score}/100` : '—';
        const verdict = r.judge?.verdict
          ? VERDICT_BADGE[r.judge.verdict] || r.judge.verdict
          : '—';
        const link = `[${r.file}](./${r.file})`;
        md += `| ${comp} | ${cScore} | ${mScore} | ${verdict} | ${link} |\n`;
      }
      md += `\n`;
    }
    md += `---\n\n`;
  }

  md += `*Generado automáticamente por [TRIBUNAL Protocol](./PROTOCOL.md). No editar manualmente.*\n`;
  return md;
}

module.exports = { readAudits, generateLedger };
