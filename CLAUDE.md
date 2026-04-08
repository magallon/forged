# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

FORGE is a **process framework** (not a library/CLI/plugin) for orchestrating AI agents to build software under human direction. It consists of Markdown templates, conventions, and a folder structure that projects copy into their repos. It is language-, framework-, and model-agnostic.

## Repository Structure

- `Project/` — Template files that users copy into their projects (`SPEC.md`, `TEAM.md`, `ROADMAP.md`, `PROGRESS.md`, `FORGE.md`, `skill/SKILL.md`, `audits/TEMPLATE.md`)
- `docs/PROTOCOL.md` — Full TRIBUNAL QA protocol documentation
- `scripts/tribunal/update-reviews.js` — Zero-dependency Node.js script that generates the audit ledger (`README.md`) from YAML frontmatter in audit files
- `examples/` — Example filled-out audit files
- `METHOD.md` — Complete methodology documentation
- `README.md` — Project pitch and quick-start guide

## Key Concepts

**FORGE flow:** Especificar (SPEC) -> Planificar (ROADMAP) -> Asignar (TEAM) -> Ejecutar (PROGRESS) -> Auditar (TRIBUNAL)

**TRIBUNAL** is the QA module with three independent roles:
- **Checker** (Auditor): analyzes code, produces numbered findings (F-001, F-002...)
- **Maker** (Executor): implements or rejects findings with technical justification, validates changes
- **Judge**: periodic governance every 5-10 audits, scores Checker/Maker, detects patterns

**Audit states:** `draft -> audited -> validated | blocked -> reviewed`

**Cardinal rule:** No agent evaluates its own work. Checker != Maker != Judge.

**Three distinct config files in target projects:**
- `SKILL.md` — operational router ("I'm doing X, which file do I read?")
- `FORGE.md` — method manifesto (how work is done)
- `AGENTS.md` — code rules (project-specific conventions, written by the user, lives at repo root)

## Scripts

```bash
# Generate the audit ledger index from YAML frontmatter in audit files
node scripts/tribunal/update-reviews.js

# Watch mode — regenerates on file changes
node scripts/tribunal/update-reviews.js --watch
```

The script requires Node.js >= 16 and has zero external dependencies. It reads `docs/audits/*.md`, parses YAML frontmatter, and writes `docs/audits/README.md`.

## Language

All documentation is written in Spanish. Maintain Spanish for all template content, comments, and documentation.

## When Editing Templates

Template files in `Project/` contain placeholder markers like `{Nombre del Proyecto}`, `{Modelo Ejemplo}`, and HTML comments with instructions (`<!-- INSTRUCCIONES: ... -->`). These are intentional — they guide users who copy the templates. Do not fill them in or remove them unless specifically asked.
