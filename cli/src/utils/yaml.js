'use strict';

/**
 * Parser de YAML frontmatter sin dependencias externas.
 * Soporta nesting de hasta 2 niveles (ej. executor.validation.result).
 *
 * Extraído y adaptado de scripts/tribunal/update-reviews.js
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = {};
  const lines = match[1].split('\n');
  let parentKey = null;
  let grandparentKey = null;

  for (const line of lines) {
    if (line.trim().startsWith('#') || line.trim() === '') continue;

    const indent = line.search(/\S/);
    const trimmed = line.trim();

    const kvMatch = trimmed.match(/^([a-z_]+)\s*:\s*(.*)$/);
    if (!kvMatch) continue;

    const [, key, rawValue] = kvMatch;
    let value = stripInlineComment(rawValue).trim();

    // Limpiar comillas
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Parsear valores especiales
    if (value === 'null' || value === '') value = null;
    else if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (value === '[]') value = [];
    else if (/^\d+$/.test(value)) value = parseInt(value, 10);

    if (indent === 0) {
      if (value === null && rawValue.trim() === '') {
        parentKey = key;
        grandparentKey = null;
        yaml[key] = yaml[key] || {};
      } else {
        yaml[key] = value;
        parentKey = null;
        grandparentKey = null;
      }
    } else if (indent >= 4 && grandparentKey && parentKey) {
      if (!yaml[grandparentKey][parentKey]) {
        yaml[grandparentKey][parentKey] = {};
      }
      yaml[grandparentKey][parentKey][key] = value;
    } else if (indent >= 2 && parentKey) {
      if (value === null && rawValue.trim() === '') {
        grandparentKey = parentKey;
        parentKey = key;
        yaml[grandparentKey][key] = yaml[grandparentKey][key] || {};
      } else {
        yaml[parentKey][key] = value;
      }
    }
  }

  return yaml;
}

/**
 * Reemplaza el valor de un campo de primer nivel en el bloque YAML frontmatter.
 * Solo funciona con campos simples (no anidados).
 * Retorna el nuevo contenido del archivo.
 */
function setFrontmatterField(content, field, value) {
  const formatted = typeof value === 'string' ? `"${value}"` : String(value);
  // Match "field: anything_until_newline" inside the frontmatter block
  return content.replace(
    new RegExp(`(^---[\\s\\S]*?^${field}\\s*:)([^\\n]*)`, 'm'),
    `$1 ${formatted}`
  );
}

/**
 * Elimina comentarios inline de YAML (#...) respetando strings entre comillas.
 * Ejemplo: `"draft"  # draft → audited` → `"draft"`
 */
function stripInlineComment(str) {
  let inQuote = false;
  let quoteChar = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (!inQuote && (ch === '"' || ch === "'")) {
      inQuote = true;
      quoteChar = ch;
    } else if (inQuote && ch === quoteChar) {
      inQuote = false;
    } else if (!inQuote && ch === '#') {
      return str.slice(0, i).trimEnd();
    }
  }
  return str;
}

module.exports = { parseFrontmatter, setFrontmatterField };
