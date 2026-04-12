'use strict';

/**
 * Formatea una fecha como YYYYMMDD.
 */
function toDateStamp(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * Formatea una fecha como HHmm (hora y minuto).
 */
function toTimeStamp(date = new Date()) {
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${h}${min}`;
}

/**
 * Formatea una fecha como YYYY-MM-DD.
 */
function toISODate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Retorna un timestamp ISO 8601 completo.
 */
function toISOTimestamp(date = new Date()) {
  return date.toISOString().replace('T', 'T').slice(0, 19) + 'Z';
}

/**
 * Parsea YYYYMMDD a Date. Retorna null si el formato es inválido.
 */
function fromDateStamp(stamp) {
  const match = stamp.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (!match) return null;
  return new Date(`${match[1]}-${match[2]}-${match[3]}`);
}

module.exports = { toDateStamp, toTimeStamp, toISODate, toISOTimestamp, fromDateStamp };
