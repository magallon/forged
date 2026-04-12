# Progreso del Proyecto — FORGE CLI

## Resumen de Sesiones

| Fecha | Sesión | Estado |
|:------|:-------|:-------|
| 2026-04-11 | Implementación inicial del CLI (forge-cli v1.0.0) | ✅ Completada |

---

## Sesión 2026-04-11 — Implementación inicial del CLI (forge-cli v1.0.0)

### Cambios realizados
- Estructura `cli/` creada con `package.json`, `bin/forge.js` y módulos en `src/`
- 6 utilidades: `args.js`, `yaml.js`, `fs-utils.js`, `confirm.js`, `date.js`, `ledger-core.js`
- 8 comandos implementados: `init`, `doctor`, `audit`, `tribunal`, `session`, `ledger`, `status`, `prune`
- Lógica central del Ledger extraída a `src/utils/ledger-core.js` (compartida con `update-reviews.js`)
- Fix: parser YAML no eliminaba comentarios inline (`# ...`) en valores — corregido en `yaml.js`
- Fix: `forge status` calculaba tasa con denominador cero — corregido en `status.js`
- `confirm.js` soporta `FORGE_YES=1` para entornos CI/no-TTY

### Decisiones técnicas

| Decisión | Razonamiento |
|:---------|:-------------|
| Zero dependencias externas | Consistente con `update-reviews.js`. Node.js 18 tiene todas las APIs necesarias. |
| Templates en `project/` (no duplicadas en `cli/`) | En dev, `init.js` lee desde `../../project`. En producción (npm), fallback a `cli/templates/`. Evita duplicación durante desarrollo. |
| `ledger-core.js` como módulo compartido | `update-reviews.js` queda self-contained para usuarios sin CLI; el CLI reutiliza la misma lógica. |
| `FORGE_YES=1` para bypass de confirmaciones | Permite usar el CLI en CI sin TTY sin cambiar la lógica de confirmación interactiva. |

### Validación
- Todos los comandos probados manualmente en `/tmp/forge-test`
- `forge init --force` ✅
- `forge doctor` ✅ (detecta placeholders y archivos faltantes)
- `forge audit new security` ✅
- `forge audit start` ✅
- `forge audit validate` ✅
- `forge tribunal batch` ✅
- `forge session close` ✅
- `forge ledger` ✅
- `forge status` ✅
- `forge prune progress --dry-run` ✅
- Mensajes de error exactos según CLI.md ✅

---

<!-- FORGE v1.0 — Progreso del Proyecto FORGE CLI -->
