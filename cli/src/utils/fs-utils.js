'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Sube por el árbol de directorios desde startDir buscando una raíz FORGE.
 * Una raíz FORGE se identifica por tener docs/FORGE.md o docs/audits/.
 * Retorna la ruta absoluta o null si no se encontró.
 */
function findProjectRoot(startDir = process.cwd()) {
  let dir = startDir;
  while (true) {
    if (
      fs.existsSync(path.join(dir, 'docs', 'FORGE.md')) ||
      fs.existsSync(path.join(dir, 'docs', 'audits'))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Crea un directorio y todos los padres necesarios (mkdir -p).
 */
function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Copia recursivamente src → dest.
 * Si src es un archivo, copia el archivo.
 * Si src es un directorio, copia el contenido recursivamente.
 */
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    ensureDir(dest);
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
  }
}

/**
 * Lista todos los archivos en un directorio de forma recursiva.
 * Retorna rutas relativas a dir.
 */
function listRecursive(dir, base = '') {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const relPath = base ? `${base}/${entry}` : entry;
    if (fs.statSync(fullPath).isDirectory()) {
      results.push(...listRecursive(fullPath, relPath));
    } else {
      results.push(relPath);
    }
  }
  return results;
}

/**
 * Lee un archivo de texto. Retorna null si no existe.
 */
function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Escribe un archivo creando los directorios necesarios.
 */
function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}

module.exports = {
  findProjectRoot,
  ensureDir,
  copyRecursive,
  listRecursive,
  readFileSafe,
  writeFile,
};
