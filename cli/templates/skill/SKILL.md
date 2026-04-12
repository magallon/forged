---
name: "{Nombre del Proyecto}"
description: "This skill should be used when working on the {Nombre del Proyecto} project. Provides project-specific rules, references, and workflow guidance."
version: 1.0.0
---

# {Nombre del Proyecto} — Skill

> Las reglas de código están en `AGENTS.md` en la raíz del repositorio. Léelas primero.
> Las reglas del método están en `docs/FORGE.md`. Léelas después.

---

## Consulta según lo que estés haciendo

| Tarea | Archivo de referencia |
|:------|:----------------------|
| **Siempre** | `AGENTS.md` en la raíz — reglas de código del proyecto |
| Implementando una feature | `docs/SPEC.md` — requerimientos funcionales, reglas de negocio |
| Antes de crear componentes | `docs/skill/references/codebase-map.md` — qué ya existe en el proyecto |
| Necesitas saber qué sigue | `docs/ROADMAP.md` — fases, prioridades, dependencias |
| Auditando código | `docs/audits/TEMPLATE.md` — plantilla y proceso TRIBUNAL |
| Contexto general del proyecto | `docs/skill/references/` — documentación bajo demanda |
| Reglas del método de trabajo | `docs/FORGE.md` — principios, flujo, TRIBUNAL y comandos CLI |

---

## Prohibiciones Absolutas

<!-- Reemplaza con las reglas irrompibles de tu proyecto.
     Estas se cargan en cada sesión — mantenlas cortas y críticas. -->

- Nunca reimplementar un componente, hook o utilidad que ya existe en el proyecto sin verificar primero en `references/codebase-map.md`
- {Ej. Nunca eliminar datos físicamente — siempre deshabilitación lógica}
- {Ej. Nunca exponer API keys en el código fuente}
- {Ej. Nunca modificar código en producción directamente}

---

## Comandos Obligatorios

Ejecuta siempre después de cambiar código:

| Componente | Comando |
|:-----------|:--------|
| {Ej. Backend} | {Ej. `ruff . && pytest`} |
| {Ej. Frontend} | {Ej. `npm run lint && npm test`} |

---

## Mantenimiento

Cuando completes una fase o sesión de trabajo:
1. Actualizar `docs/ROADMAP.md` — marcar la fase como completada
2. Registrar la sesión en `docs/PROGRESS.md` — o ejecuta `forge session close` si el CLI está disponible
3. Si hay nuevos requerimientos, actualizar `docs/SPEC.md`
4. Si creaste componentes, hooks o utilidades nuevas, actualizar `docs/skill/references/codebase-map.md`
5. Si creaste documentación de referencia, agregarla a `docs/skill/references/`

---

<!-- FORGE v1.0 — Skill del Proyecto -->
