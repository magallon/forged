# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

FORGE is a **process framework** (not a library/CLI/plugin) for orchestrating AI agents to build software under human direction. It consists of Markdown templates, conventions, and a folder structure that projects copy into their repos. It is language-, framework-, and model-agnostic.

It also ships a CLI (`@magallon/forge`) that automates file creation and reporting tasks.

## Repository Structure

- `project/` — Template files that users copy into their projects (`TEAM.md`, `ROADMAP.md`, `PROGRESS.md`, `FORGE.md`, `skill/SKILL.md`, `audits/TEMPLATE.md`)
- `docs/PROTOCOL.md` — Full TRIBUNAL QA protocol documentation
- `docs/ORCHESTRATOR.md` — Optional Orchestrator role documentation (meta-layer above FORGE agents)
- `scripts/tribunal/update-reviews.js` — Zero-dependency Node.js script that generates the audit ledger (`docs/audits/README.md`) from YAML frontmatter in audit files
- `examples/` — Example filled-out audit files
- `METHOD.md` — Complete methodology documentation
- `CLI.md` — Full CLI reference (`forge` commands)
- `README.md` — Project pitch and quick-start guide

## Key Concepts

**FORGE flow:** Especificar (Kiro Triad) -> Planificar (ROADMAP) -> Asignar (TEAM) -> Ejecutar (PROGRESS) -> Auditar (TRIBUNAL)

**TRIBUNAL** is the QA module with three independent roles:
- **Checker** (Auditor): analyzes code, produces numbered findings (F-001, F-002...)
- **Maker** (Executor): implements or rejects findings with technical justification, validates changes
- **Judge**: periodic governance every 5-10 audits, scores Checker/Maker, detects patterns

**Audit states:** `draft -> audited -> validated | blocked -> reviewed`

**Cardinal rule:** No agent evaluates its own work. Checker != Maker != Judge.

**Orchestrator** (optional extension): meta-role above FORGE agents that handles requirements engineering (Kiro Triad: `requirements.md` + `design.md` + `tasks.md` per phase), scaffolding, prompt engineering, and flow control. Not part of TRIBUNAL. Documented in `docs/ORCHESTRATOR.md`. `requirements.md` per phase is the tactical specification; `ROADMAP.md` stays as strategic map.

**Three distinct config files in target projects:**
- `SKILL.md` — operational router ("I'm doing X, which file do I read?")
- `FORGE.md` — method manifesto (how work is done)
- `AGENTS.md` — code rules (project-specific conventions, written by the user, lives at repo root)

## CLI (forge commands)

Install globally (requires Node.js >= 18):

```bash
npm install -g @magallon/forge
```

### Common commands

```bash
forge init                        # Bootstrap full FORGE structure in a project
forge doctor                      # Check structure completeness and unfilled placeholders
forge audit new [tipo]            # Create a new audit file (tipos: security | perf | a11y | arch | refactor)
forge audit start [archivo]       # Show current audit phase and missing YAML fields
forge audit validate [archivo]    # Verify YAML coherence before changing status (also useful in CI)
forge tribunal batch              # Count validated audits pending Judge review
forge session close               # Create a partial PROGRESS.md entry from git-tracked changes
forge ledger                      # Regenerate docs/audits/README.md from YAML frontmatter
forge ledger --watch              # Regenerate on every file change
forge status                      # Show the rework metric (target: ≥85%)
forge prune progress              # Archive old sessions from PROGRESS.md
```

All action commands show a preview and ask for confirmation before writing files. See `CLI.md` for flags and error codes.

## Scripts (without CLI)

```bash
# Equivalent to `forge ledger` — no CLI installation required
node scripts/tribunal/update-reviews.js

# Watch mode
node scripts/tribunal/update-reviews.js --watch
```

Requires Node.js >= 16, zero external dependencies. Reads `docs/audits/*.md`, writes `docs/audits/README.md`.

## Language

All documentation is written in Spanish. Maintain Spanish for all template content, comments, and documentation.

## When Editing Templates

Template files in `Project/` contain placeholder markers like `{Nombre del Proyecto}`, `{Modelo Ejemplo}`, and HTML comments with instructions (`<!-- INSTRUCCIONES: ... -->`). These are intentional — they guide users who copy the templates. Do not fill them in or remove them unless specifically asked.
