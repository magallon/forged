# ⚒️ FORGE CLI

> Referencia completa de comandos del CLI de FORGE.
> Para el método completo, ver [METHOD.md](METHOD.md).
> Para el protocolo TRIBUNAL, ver [PROTOCOL.md](docs/PROTOCOL.md).

---

## Requisitos

- **Node.js** ≥ 18.0.0
- **Git** — requerido por `forge session close` para detectar archivos modificados
- Sistema operativo: Linux, macOS, Windows (con modo desarrollador activado para symlinks)

---

## Instalación

**Global (recomendado):**
```bash
npm install -g @magallon/forge
```

Verifica que la instalación fue exitosa:
```bash
forge --version
# FORGE CLI v1.0.0
```

**Sin instalación global** — si prefieres no instalar globalmente, el CLI también puede correrse desde el directorio del proyecto usando npx:
```bash
npx @magallon/forge init
npx @magallon/forge doctor
```

**Actualizar:**
```bash
npm install -g @magallon/forge@latest
```

---

## Clasificación de Comandos

Los comandos de FORGE se dividen en dos categorías importantes:

### Solo dan información (read-only)

No modifican ningún archivo. Seguros de correr en cualquier momento.

| Comando | Qué hace |
|:--------|:---------|
| `forge doctor` | Verifica que la estructura del proyecto esté completa |
| `forge audit start [archivo]` | Muestra el estado actual de una auditoría y qué fase sigue |
| `forge audit validate [archivo]` | Verifica coherencia del YAML antes de cambiar el status |
| `forge tribunal batch` | Cuenta auditorías pendientes de revisión por el Judge |
| `forge status` | Calcula y muestra la métrica de retrabajo del proyecto |

### Ejecutan acciones (escriben archivos)

Modifican o crean archivos en el proyecto. Muestran preview y piden confirmación antes de actuar.

| Comando | Qué hace |
|:--------|:---------|
| `forge init` | Crea la estructura completa del proyecto con todos los templates |
| `forge audit new [tipo]` | Crea un archivo de auditoría con nombre, fecha e ID generados |
| `forge ledger` | Regenera el índice de auditorías en `docs/audits/README.md` |
| `forge prune progress` | Mueve sesiones antiguas de PROGRESS.md al archivo de historial |

### Mixto

Leen para informar y escriben un esqueleto parcial que el humano completa.

| Comando | Qué hace |
|:--------|:---------|
| `forge session close` | Crea entrada parcial en PROGRESS.md y avisa qué documentos actualizar |

---

## Referencia de Comandos

### `forge init`

**Tipo:** Acción — crea archivos

Inicializa la estructura completa de FORGE en el proyecto actual. Equivalente a copiar manualmente todos los templates.

```bash
cd mi-proyecto
forge init
```

**Flags:**

| Flag | Descripción |
|:-----|:------------|
| `--force` | Sobreescribe archivos existentes sin pedir confirmación |
| `--dry-run` | Muestra qué archivos se crearían sin crearlos |

**Crea:**
```
docs/
├── FORGE.md
├── TEAM.md
├── PROGRESS.md
├── ROADMAP.md
├── skill/
│   ├── SKILL.md
│   └── references/
│       ├── README.md
│       ├── codebase-map.md
│       ├── handbook.md
│       ├── business.md
│       └── tech-stack.md
└── audits/
    ├── TEMPLATE.md
    └── README.md
scripts/
└── tribunal/
    └── update-reviews.js
```

**Escenario típico:** Empiezas un proyecto nuevo desde cero y necesitas la estructura lista en segundos.

**Errores comunes:**

| Error | Causa | Solución |
|:------|:------|:---------|
| `Ya existe docs/ en este directorio` | El proyecto ya tiene estructura FORGE | Usa `--force` para sobreescribir o `--dry-run` para ver qué cambiaría |
| `Permiso denegado` | Sin permisos de escritura en el directorio | Verifica permisos o corre desde un directorio donde tengas acceso |

**Código de salida:** `0` si todo se creó correctamente, `1` si hubo errores.

---

### `forge doctor`

**Tipo:** Información — no modifica nada

Verifica que la estructura del proyecto esté completa y que los documentos clave no tengan placeholders sin llenar.

```bash
forge doctor
# ✅ TEAM.md — existe
# ✅ ROADMAP.md — existe
# ⚠️  AGENTS.md — no encontrado en raíz
# ⚠️  codebase-map.md — contiene placeholders sin llenar ({Nombre del Proyecto})
# ❌ docs/audits/TEMPLATE.md — no encontrado
```

**Flags:**

| Flag | Descripción |
|:-----|:------------|
| `--strict` | Trata las advertencias (`⚠️`) como errores y retorna código `1` |

**Verifica:**
- Existencia de TEAM, ROADMAP, PROGRESS, SKILL, AGENTS, codebase-map, TEMPLATE
- Que los documentos no contengan placeholders del tipo `{Nombre del Proyecto}`
- Que la estructura de directorios sea correcta

**Escenario típico:** Onboardeas una IA nueva al proyecto y quieres confirmar que nada falta antes de empezar la sesión.

**Errores comunes:**

| Error | Causa | Solución |
|:------|:------|:---------|
| `No se encontró estructura FORGE en este directorio` | No estás en un proyecto FORGE | Navega a la raíz del proyecto o corre `forge init` primero |

**Código de salida:** `0` si todo está correcto, `1` si hay errores (`❌`). Las advertencias (`⚠️`) no afectan el código de salida a menos que uses `--strict`.

---

### `forge audit new [tipo]`

**Tipo:** Acción — crea un archivo

Crea un nuevo archivo de auditoría con nombre correcto, fecha de hoy e ID generado automáticamente. Copia TEMPLATE.md como base.

```bash
forge audit new security
# Crea: docs/audits/security-audit-20260411.md
# ID generado: security-audit-20260411-1430
# Status: draft — listo para pasarle al Checker
```

**Flags:**

| Flag | Descripción |
|:-----|:------------|
| `--component [ruta]` | Pre-rellena el campo `componente` en el YAML |
| `--scope [texto]` | Pre-rellena el campo `alcance` en el YAML |

**Ejemplo con flags:**
```bash
forge audit new security --component "src/components/PaymentForm.tsx" --scope "XSS y CSRF"
# Crea: docs/audits/security-audit-20260411.md
# componente: src/components/PaymentForm.tsx
# alcance: XSS y CSRF
```

**Tipos válidos:** `security` | `perf` | `a11y` | `arch` | `refactor`

**Escenario típico:** Terminaste de implementar un módulo crítico y vas a iniciar un ciclo TRIBUNAL. En lugar de copiar y renombrar TEMPLATE.md manualmente, el comando lo hace con el formato correcto.

**Errores comunes:**

| Error | Causa | Solución |
|:------|:------|:---------|
| `Tipo inválido: [tipo]` | El tipo no está en la lista de válidos | Usa uno de: `security`, `perf`, `a11y`, `arch`, `refactor` |
| `Ya existe una auditoría para hoy de ese tipo` | Ya creaste una auditoría del mismo tipo hoy | El archivo generado incluye la hora — revisa si realmente necesitas una segunda |
| `TEMPLATE.md no encontrado` | La plantilla no existe en `docs/audits/` | Corre `forge doctor` para diagnosticar qué falta |

**Código de salida:** `0` si el archivo se creó correctamente, `1` si hubo errores.

---

### `forge audit start [archivo]`

**Tipo:** Información — no modifica nada

Abre una auditoría existente y muestra un resumen del estado actual: en qué fase está, cuántos hallazgos hay, qué campos del YAML faltan completar.

```bash
forge audit start security-audit-20260411.md
# Estado actual: audited
# Fase siguiente: MAKER
# Hallazgos reportados: 5 (3 critical, 2 medium)
# Campos faltantes en YAML:
#   - executor.model
#   - executor.timestamp
#   - executor.commit_ref
```

**Escenario típico:** Retomas una auditoría que dejaste a medias ayer y no recuerdas en qué fase estaba ni qué falta hacer.

**Errores comunes:**

| Error | Causa | Solución |
|:------|:------|:---------|
| `Archivo no encontrado` | El nombre está mal escrito o el archivo no existe | Verifica con `ls docs/audits/` |
| `Sin frontmatter YAML válido` | El archivo no tiene el bloque `---` al inicio | El archivo puede estar corrupto — revísalo manualmente |

**Código de salida:** `0` si el archivo existe y es parseable, `1` si no existe o tiene YAML inválido.

---

### `forge audit validate [archivo]`

**Tipo:** Información — no modifica nada

Verifica que el YAML de una auditoría sea coherente y esté completo antes de cambiar el status manualmente. Detecta inconsistencias que causarían datos incorrectos en el Ledger.

```bash
forge audit validate security-audit-20260411.md
# ✅ findings_count (5) = accepted(3) + rejected(1) + partial(1)
# ✅ validation.result: pass
# ✅ max_severity: critical — coherente con hallazgos
# ❌ executor.commit_ref está vacío
#    No puedes marcar status: validated sin commit de referencia
```

**Verifica:**
- Que `accepted_count + rejected_count + partial_count` sume igual a `findings_count`
- Que `validation.result` sea `pass` o `fail`
- Que no haya campos obligatorios vacíos según el status actual
- Que `max_severity` sea coherente con los hallazgos del reporte

**Escenario típico:** El Maker terminó su trabajo y antes de cambiar el status a `validated` quieres confirmar que el YAML está correcto y el Ledger va a reflejar datos precisos.

**Integración CI/CD:** Por su código de salida, este comando puede usarse en pipelines para bloquear merges si una auditoría tiene YAML incoherente:
```yaml
# .github/workflows/tribunal-check.yml
- run: forge audit validate docs/audits/security-audit-20260411.md
```

**Errores comunes:**

| Error | Causa | Solución |
|:------|:------|:---------|
| `findings_count no coincide` | Los contadores de accepted/rejected/partial no suman el total | Corrige los valores en el YAML manualmente |
| `max_severity incoherente` | La severidad declarada no coincide con los hallazgos del reporte | Revisa los hallazgos y actualiza `max_severity` |

**Código de salida:** `0` si el YAML es válido y coherente, `1` si hay errores. Útil para CI/CD.

---

### `forge tribunal batch`

**Tipo:** Información — no modifica nada

Lista las auditorías en estado `validated` que aún no tienen `reviewed`, y avisa si ya llegaste al umbral para activar el Judge.

```bash
forge tribunal batch
# Auditorías validated sin reviewed: 7
# ⚠️  Superaste el umbral de 5 — es momento de activar el Judge
#
# Pendientes de revisión:
#   - security-audit-20260411.md (2026-04-11)
#   - perf-audit-20260318.md (2026-03-18)
#   - arch-audit-20260401.md (2026-04-01)
#   - refactor-audit-20260325.md (2026-03-25)
#   - a11y-audit-20260308.md (2026-03-08)
#   - security-audit-20260215.md (2026-02-15)
#   - perf-audit-20260201.md (2026-02-01)
```

**Flags:**

| Flag | Descripción |
|:-----|:------------|
| `--threshold [n]` | Cambia el umbral de alerta (default: `5`) |

**Ejemplo:**
```bash
forge tribunal batch --threshold 10
# Solo avisa cuando hay más de 10 auditorías sin reviewed
```

**Escenario típico:** Llevas varias semanas trabajando y no recuerdas cuándo fue el último Judge ni cuántas auditorías han acumulado sin revisión periódica.

**Código de salida:** `0` siempre (es solo lectura).

---

### `forge session close`

**Tipo:** Mixto — lee git, crea esqueleto en PROGRESS.md

Crea una entrada parcial en PROGRESS.md con lo que puede inferir automáticamente (fecha, archivos modificados, estructura), y avisa qué documentos adicionales necesitan atención. El humano completa el título y las decisiones técnicas.

```bash
forge session close
# Generando entrada en PROGRESS.md...
#
# ## Sesión 2026-04-11 — [TÍTULO PENDIENTE]
# Archivos modificados: src/auth/login.ts, src/auth/jwt.ts
# Validación: [pendiente]
#
# ✅ Entrada creada en PROGRESS.md
# ✅ Tabla resumen actualizada
#
# Completa manualmente:
#   - Título de la sesión
#   - Decisiones técnicas tomadas
#   - Resultado de validación
#
# ⚠️  ROADMAP.md no fue tocado — ¿completaste alguna fase?
# ⚠️  codebase-map.md — se detectaron archivos nuevos, actualiza el mapa
```

**Lo que hace automáticamente:**
- Crea la entrada en PROGRESS.md con fecha y archivos modificados
- Actualiza la tabla resumen al inicio de PROGRESS.md
- Avisa si ROADMAP.md o codebase-map.md no fueron tocados

**Lo que deja para completar manualmente:**
- El título de la sesión
- Las decisiones técnicas tomadas
- El resultado de validación (build, tests)

**Escenario típico:** Terminaste una sesión de trabajo, estás por cerrar la terminal. En lugar de escribir la entrada de PROGRESS.md desde cero, el comando crea el esqueleto y tú completas solo lo que requiere criterio humano.

**Errores comunes:**

| Error | Causa | Solución |
|:------|:------|:---------|
| `No es un repositorio git` | El proyecto no tiene git inicializado | Corre `git init` o verifica que estés en la raíz correcta |
| `PROGRESS.md no encontrado` | El archivo no existe | Corre `forge init` o crea PROGRESS.md manualmente |

**Código de salida:** `0` si la entrada se creó correctamente, `1` si hubo errores.

---

### `forge ledger`

**Tipo:** Acción — sobreescribe `docs/audits/README.md`

Regenera el índice de auditorías leyendo el YAML de todos los archivos en `docs/audits/`. Equivalente a correr `node scripts/tribunal/update-reviews.js` pero sin recordar el path.

```bash
forge ledger
# ✅ docs/audits/README.md generado — 8 revisiones
```

**Flags:**

| Flag | Descripción |
|:-----|:------------|
| `--watch` | Regenera automáticamente al detectar cambios en `docs/audits/` |

**Ejemplo:**
```bash
forge ledger --watch
# 👁️  Modo watch activo. Ctrl+C para salir.
# 📝 Cambio detectado: security-audit-20260411.md
# ✅ Ledger actualizado.
```

**Integración CI/CD:** Ver ejemplo completo en [PROTOCOL.md](docs/PROTOCOL.md#integración-cicd).

**Escenario típico:** Completaste o actualizaste una auditoría y quieres que el Ledger refleje el nuevo estado inmediatamente.

**Errores comunes:**

| Error | Causa | Solución |
|:------|:------|:---------|
| `docs/audits/ no existe` | La estructura de auditorías no está creada | Corre `forge init` primero |
| `Sin frontmatter YAML en [archivo]` | Un archivo de auditoría tiene YAML malformado | Abre el archivo y verifica el bloque `---` |

**Código de salida:** `0` si el Ledger se generó correctamente, `1` si hubo errores.

---

### `forge status`

**Tipo:** Información — no modifica nada

Calcula y muestra la métrica de retrabajo de FORGE leyendo el Ledger y PROGRESS.md. Indica si el porcentaje está por encima o debajo del umbral recomendado (85%).

```bash
forge status
# Período: últimas 4 semanas
#
# Fuente              Total   Exitosas   Retrabajo   Tasa
# Auditorías (Ledger)   8        6           2        75%
# Fases (ROADMAP)      12       10           2        83%
# ─────────────────────────────────────────────────────
# Tasa combinada                                      79%
#
# ⚠️  Por debajo del 85% — revisar asignación de modelos en TEAM.md
```

**Flags:**

| Flag | Descripción |
|:-----|:------------|
| `--period [nd]` | Cambia el período de análisis (default: `28d`). Ejemplos: `7d`, `30d`, `90d` |

**Ejemplo:**
```bash
forge status --period 90d
# Período: últimos 90 días
# ...
```

**Escenario típico:** Antes de una revisión del proyecto o al cerrar un hito del ROADMAP, quieres saber objetivamente cómo está funcionando el proceso sin hacer el conteo manualmente.

**Errores comunes:**

| Error | Causa | Solución |
|:------|:------|:---------|
| `Sin datos suficientes para calcular` | Menos de 3 auditorías o fases registradas | El comando necesita datos mínimos para que el porcentaje sea significativo |

**Código de salida:** `0` siempre (es solo lectura).

---

### `forge prune progress`

**Tipo:** Acción — mueve contenido entre archivos

Cuando PROGRESS.md crece demasiado, mueve las sesiones más antiguas a `docs/skill/references/progress-archive.md` para mantener el archivo ligero y dentro de un tamaño razonable de contexto para las IAs.

```bash
forge prune progress
# PROGRESS.md tiene 38 sesiones (~4,200 tokens estimados)
#
# Sesiones a archivar (anteriores a 2026-02-01):
#   - Sesión 2026-01-15 — Scaffolding inicial
#   - Sesión 2026-01-18 — Módulo de autenticación
#   - [29 sesiones más...]
#
# ¿Continuar? (s/n): s
#
# ✅ 31 sesiones movidas a references/progress-archive.md
# ✅ PROGRESS.md ahora tiene 7 sesiones (~780 tokens estimados)
```

**Flags:**

| Flag | Descripción |
|:-----|:------------|
| `--before [YYYY-MM-DD]` | Archiva sesiones anteriores a esa fecha (default: automático según tamaño) |
| `--keep [n]` | Mantiene las últimas N sesiones, archiva el resto |
| `--dry-run` | Muestra qué se archivaría sin mover nada |

**Ejemplos:**
```bash
forge prune progress --keep 10
# Mantiene las últimas 10 sesiones, archiva el resto

forge prune progress --before 2026-01-01 --dry-run
# Muestra preview sin modificar nada
```

**Escenario típico:** Las IAs están tardando más o el contexto de PROGRESS.md ya supera lo razonable. El comando archiva lo antiguo sin perderlo.

**Errores comunes:**

| Error | Causa | Solución |
|:------|:------|:---------|
| `PROGRESS.md no encontrado` | El archivo no existe | Corre `forge init` o crea PROGRESS.md manualmente |
| `Nada que archivar` | PROGRESS.md tiene pocas sesiones | No es necesario podar aún |

**Código de salida:** `0` si la operación fue exitosa o no había nada que archivar, `1` si hubo errores.

---

## Flujo Típico de una Semana

```
Lunes — inicio de semana
  forge doctor                          # Verificar que todo esté en orden

Lunes a viernes — trabajo diario
  forge session close                   # Al terminar cada sesión de trabajo

Al completar un módulo importante
  forge audit new security              # Iniciar ciclo TRIBUNAL
  forge audit start [archivo]           # Retomar auditoría en curso
  forge audit validate [archivo]        # Antes de cambiar status a validated
  forge ledger                          # Después de completar una auditoría

Viernes — cierre de semana
  forge tribunal batch                  # ¿Es momento de activar el Judge?
  forge status                          # ¿Cómo va la métrica de retrabajo?

Cuando PROGRESS.md crezca demasiado
  forge prune progress                  # Archivar sesiones antiguas
```

---

## Referencia Rápida

Para cuando ya conoces el CLI y solo necesitas recordar un comando o flag.

| Comando | Flags disponibles | Tipo | Código de salida |
|:--------|:------------------|:-----|:-----------------|
| `forge init` | `--force`, `--dry-run` | Acción | `0` ok / `1` error |
| `forge doctor` | `--strict` | Lectura | `0` ok / `1` errores críticos |
| `forge audit new [tipo]` | `--component`, `--scope` | Acción | `0` ok / `1` error |
| `forge audit start [archivo]` | — | Lectura | `0` ok / `1` no parseable |
| `forge audit validate [archivo]` | — | Lectura | `0` válido / `1` inválido |
| `forge tribunal batch` | `--threshold [n]` | Lectura | `0` siempre |
| `forge session close` | — | Mixto | `0` ok / `1` error |
| `forge ledger` | `--watch` | Acción | `0` ok / `1` error |
| `forge status` | `--period [nd]` | Lectura | `0` siempre |
| `forge prune progress` | `--before`, `--keep`, `--dry-run` | Acción | `0` ok / `1` error |

---

<!-- FORGE v1.0 — Referencia del CLI -->
