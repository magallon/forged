# Mapa del Codebase — FORGE CLI

Registro central de módulos del CLI para detectar y prevenir duplicidades.

---

## Utilidades (`cli/src/utils/`)

| Nombre | Descripción | Ubicación | Estado |
|:-------|:------------|:----------|:-------|
| `parseArgv(argv)` | Parsea argv sin deps: extrae subcommand, positional, flags | `cli/src/utils/args.js` | ✅ Canónico |
| `parseFrontmatter(content)` | Parser YAML frontmatter hasta 2 niveles de nesting | `cli/src/utils/yaml.js` | ✅ Canónico |
| `setFrontmatterField(content, field, value)` | Actualiza campo de primer nivel en frontmatter | `cli/src/utils/yaml.js` | ✅ Canónico |
| `stripInlineComment(str)` | Elimina comentarios YAML inline respetando strings | `cli/src/utils/yaml.js` | ✅ Canónico |
| `findProjectRoot(startDir?)` | Sube por el árbol buscando `docs/FORGE.md` o `docs/audits/` | `cli/src/utils/fs-utils.js` | ✅ Canónico |
| `ensureDir(path)` | mkdir -p equivalente | `cli/src/utils/fs-utils.js` | ✅ Canónico |
| `copyRecursive(src, dest)` | Copia archivo o directorio recursivamente | `cli/src/utils/fs-utils.js` | ✅ Canónico |
| `listRecursive(dir)` | Lista todos los archivos en dir, rutas relativas | `cli/src/utils/fs-utils.js` | ✅ Canónico |
| `readFileSafe(path)` | Lee archivo, retorna null si no existe | `cli/src/utils/fs-utils.js` | ✅ Canónico |
| `writeFile(path, content)` | Escribe archivo creando dirs necesarios | `cli/src/utils/fs-utils.js` | ✅ Canónico |
| `confirm(question)` | Prompt s/n con readline. Soporta `FORGE_YES=1` para CI | `cli/src/utils/confirm.js` | ✅ Canónico |
| `toDateStamp(date?)` | Date → YYYYMMDD | `cli/src/utils/date.js` | ✅ Canónico |
| `toTimeStamp(date?)` | Date → HHmm | `cli/src/utils/date.js` | ✅ Canónico |
| `toISODate(date?)` | Date → YYYY-MM-DD | `cli/src/utils/date.js` | ✅ Canónico |
| `toISOTimestamp(date?)` | Date → ISO 8601 completo | `cli/src/utils/date.js` | ✅ Canónico |
| `readAudits(auditsDir)` | Lee y parsea todos los archivos .md en auditsDir | `cli/src/utils/ledger-core.js` | ✅ Canónico |
| `generateLedger(audits)` | Genera el Markdown del Ledger a partir de los metadatos | `cli/src/utils/ledger-core.js` | ✅ Canónico |

---

## Comandos (`cli/src/commands/`)

| Módulo | Subcomandos | Descripción | Ubicación |
|:-------|:------------|:------------|:----------|
| `init` | — | Copia templates a `docs/` y `scripts/`, genera Ledger inicial | `cli/src/commands/init.js` |
| `doctor` | — | Verifica archivos requeridos y placeholders sin llenar | `cli/src/commands/doctor.js` |
| `audit` | `new`, `start`, `validate` | Crea auditorías, muestra estado, valida coherencia YAML | `cli/src/commands/audit.js` |
| `tribunal` | `batch` | Cuenta validated sin reviewed, alerta por umbral | `cli/src/commands/tribunal.js` |
| `session` | `close` | Crea entrada parcial en PROGRESS.md desde git status | `cli/src/commands/session.js` |
| `ledger` | — | Regenera `docs/audits/README.md` (usa `ledger-core.js`) | `cli/src/commands/ledger.js` |
| `status` | — | Calcula métrica de retrabajo (auditorías + PROGRESS.md) | `cli/src/commands/status.js` |
| `prune` | `progress` | Archiva sesiones antiguas de PROGRESS.md | `cli/src/commands/prune.js` |

---

## Scripts existentes

| Nombre | Descripción | Ubicación | Estado |
|:-------|:------------|:----------|:-------|
| `update-reviews.js` | Genera el Ledger desde YAML frontmatter. Self-contained (sin CLI). | `scripts/tribunal/update-reviews.js` | ✅ Canónico |

---

## Estadísticas

- Total elementos registrados: 26
- Duplicados detectados: 0
- Duplicados eliminados: 0

<!-- FORGE v1.0 — Mapa del Codebase -->
