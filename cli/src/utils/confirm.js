'use strict';

const readline = require('readline');

/**
 * Muestra una pregunta de confirmación y espera respuesta s/n.
 * Retorna Promise<boolean>.
 * Si stdin no es un TTY (modo no interactivo), retorna false por defecto.
 */
function confirm(question) {
  // FORGE_YES=1 permite automatizar comandos en CI o scripts
  if (process.env.FORGE_YES === '1') {
    return Promise.resolve(true);
  }
  if (!process.stdin.isTTY) {
    return Promise.resolve(false);
  }
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(`${question} (s/n): `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 's');
    });
  });
}

module.exports = { confirm };
