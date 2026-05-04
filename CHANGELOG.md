# Changelog

Todos los cambios notables de FORGE y `@magallon/forge` se documentan aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).
El versionado sigue [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.1.0] — 2026-05-04

### Añadido

- **`PROTOCOL.md` se instala con `forge init`** — antes solo existía en el repositorio FORGE. Ahora se copia a `docs/PROTOCOL.md` del proyecto. El enlace `../PROTOCOL.md` en `TEMPLATE.md` ya resuelve correctamente.
- **Rol de Orchestrator documentado** (`docs/ORCHESTRATOR.md`) — extensión opcional de FORGE para proyectos con múltiples fases. Meta-rol entre el Director Humano y los agentes de implementación. Genera la Tríada Kiro por fase, produce prompts de contexto, administra el flujo del proyecto. No forma parte de TRIBUNAL.
- **Tríada Kiro integrada al método** — `METHOD.md`, `README.md` y todos los templates ahora documentan el flujo real de especificación: `requirements.md` + `design.md` + `tasks.md` en `.kiro/specs/[nombre-feature]/`. Formato RFC 2119, criterios BDD (GIVEN/WHEN/THEN), diseño prescriptivo con DDL, tareas con trazabilidad `_Requirements: X.X_`.

### Cambiado

- **`SPEC.md` eliminado** — reemplazado por la Tríada Kiro (`.kiro/specs/`). La especificación de cada feature vive en tres archivos por carpeta, no en un documento monolítico. `forge doctor` ya no verifica `SPEC.md`.
- **`forge init` — pasos actualizados** — los siguientes pasos post-instalación ahora incluyen referencia a Kiro y eliminan la mención de `SPEC.md`.
- **`forge status` — mensaje de diagnóstico actualizado** — el mensaje de tasa baja ahora apunta a `requirements.md` de las fases en lugar de `SPEC.md`.
- **`FORGE.md` (template)** — referencia a `PROTOCOL.md` ahora apunta al archivo local en lugar del repositorio externo.
- **`PROGRESS.md` (template)** — comentario de métricas ahora apunta a `forge status` en lugar de `METHOD.md` (externo).
- **`SKILL.md` (template)** — tabla de consulta actualizada: `docs/SPEC.md` → `.kiro/specs/[feature]/requirements.md`.

### Corregido

- **Enlace roto en Ledger** — `update-reviews.js` generaba `[TRIBUNAL Protocol](./PROTOCOL.md)` que resolvía a `docs/audits/PROTOCOL.md` (inexistente). Corregido a `../PROTOCOL.md`.
- **`FORGE flow` en `CLAUDE.md`** — `Especificar (SPEC)` → `Especificar (Kiro Triad)`.
- **Links a `PROTOCOL.md` en `CLI.md`** — dos referencias usaban ruta relativa incorrecta (`PROTOCOL.md` en lugar de `docs/PROTOCOL.md`).

---

## [1.0.0] — 2026-04-11

### Añadido

- CLI `@magallon/forge` v1.0.0 publicado en npm
- 8 comandos: `init`, `doctor`, `audit`, `tribunal`, `session`, `ledger`, `status`, `prune`
- 6 utilidades internas: `args`, `yaml`, `fs-utils`, `confirm`, `date`, `ledger-core`
- Templates bundleados en `cli/templates/` para distribución npm
- `FORGE_YES=1` para entornos CI/no-TTY
- TRIBUNAL Protocol v2.0 — flujo de estados `draft → audited → validated | blocked → reviewed`
- Script standalone `update-reviews.js` (sin dependencias, Node.js ≥ 16)

<!-- FORGE v1.1.0 — Changelog -->
