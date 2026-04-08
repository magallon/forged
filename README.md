# ⚒️ FORGE

**Framework de Orquestación para Desarrollo de Software con IA**

> *Un humano, múltiples IAs, software de calidad.*

---

FORGE es un framework de proceso para construir software donde un humano dirige un equipo de agentes de IA como desarrolladores principales. No es una librería, no es un CLI, no es un plugin. Es un conjunto de convenciones, templates y estructura de carpetas que establece cómo organizar un proyecto, especificar qué se va a construir, asignar trabajo a los modelos correctos por costo mínimo, registrar el progreso, y asegurar la calidad del código producido.

Se instala copiando archivos a tu repositorio. Funciona con cualquier lenguaje, cualquier framework, cualquier modelo de IA.

---

## El Problema

Cuando un humano trabaja con IA para construir software, enfrenta problemas recurrentes: las IAs no tienen contexto del proyecto entre sesiones, no saben qué priorizar ni qué reglas seguir, producen código que nadie revisa con rigor, y el humano pierde tiempo repitiendo contexto en cada conversación. Si además usa múltiples modelos — unos baratos para tareas simples, otros caros para tareas complejas — no hay sistema para decidir cuál usar ni para rastrear qué hizo cada uno.

FORGE resuelve esto con una estructura de documentación que actúa como memoria persistente del proyecto, un catálogo de agentes con regla de asignación por costo mínimo, y un sistema de revisión de calidad (TRIBUNAL) donde ningún agente evalúa su propio trabajo.

---

## Flujo Operativo

FORGE opera en 5 pasos. No todos aplican en cada tarea — un fix trivial no necesita pasar por los 5 — pero el flujo completo es la referencia.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  ESPECIFICAR │────▸│  PLANIFICAR  │────▸│   ASIGNAR    │────▸│   EJECUTAR   │────▸│   AUDITAR    │
│              │     │              │     │              │     │              │     │              │
│  Definir qué │     │ Descomponer  │     │ Elegir el    │     │ La IA trabaja│     │ TRIBUNAL:    │
│  se construye│     │ en fases con │     │ modelo más   │     │ el humano    │     │ otra IA      │
│  sin ambigüe-│     │ orden y      │     │ barato que   │     │ supervisa y  │     │ revisa el    │
│  dad (SPEC)  │     │ dependencias │     │ pueda hacerlo│     │ registra     │     │ código       │
│              │     │ (ROADMAP)    │     │ (TEAM)       │     │ (PROGRESS)   │     │ (si aplica)  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

**[→ Ver el método completo](METHOD.md)**

---

## Inicio Rápido

```bash
# 1. Copia los archivos de FORGE a tu proyecto
cp -r forge/project/ mi-proyecto/docs/
cp -r forge/scripts/ mi-proyecto/

# 2. (Recomendado) Crea el symlink para auto-descubrimiento de la skill
ln -s /ruta/mi-proyecto/docs/skill /mnt/skills/user/mi-proyecto
```

Luego llena los documentos en `docs/` con la información de tu proyecto: tu especificación en SPEC.md, tu equipo de modelos en TEAM.md, tu plan en ROADMAP.md, y las reglas de tu proyecto en skill/SKILL.md.

**Prompt de arranque** (para entornos sin auto-descubrimiento de skills):

```
Eres el desarrollador principal de este proyecto.
Lee docs/skill/SKILL.md para orientarte.
Revisa docs/ROADMAP.md para ver la prioridad actual.
Dime qué necesitas para empezar.
```

**[→ Ver un proyecto de ejemplo con todos los documentos llenos](examples/)**

---

## Cómo se Usa en la Práctica

### 1. Arranque

Clonas FORGE, copias `project/` a tu `docs/`, copias `scripts/` a tu raíz, y opcionalmente creas el symlink. Creas `AGENTS.md` en la raíz de tu repo con las reglas de código de tu proyecto.

### 2. Especificación y Planificación

Le pides a una IA que llene `SPEC.md` basándose en tu documento de requerimientos. Luego llenas `TEAM.md` con los modelos que vas a usar y construyes `ROADMAP.md` descomponiendo el SPEC en fases con dependencias.

### 3. Ejecución

Empiezas a construir. Asignas las fases del roadmap a los modelos según TEAM.md — siempre el más barato que pueda completar la tarea. La IA escribe código, tú supervisas, y registras cada sesión en `PROGRESS.md`. Fase por fase, vas construyendo el proyecto.

### 4. Auditoría (sobre código que ya existe)

Cuando terminas un componente sensible (autenticación, pagos, permisos) o sospechas que la IA cometió errores, activas TRIBUNAL. Abres otra sesión con otro modelo como **Checker**, le pasas el código ya escrito y le pides que lo audite. El Checker produce hallazgos. Luego otro modelo como **Maker** implementa o rechaza las correcciones con justificación técnica.

Las auditorías no se crean por adelantado del roadmap. El roadmap te dice qué construir; las auditorías te dicen si lo construido está bien.

### 5. Gobernanza (el Judge)

Después de 5–10 auditorías completadas, activas al **Judge** — un modelo frontera que revisa el lote, califica al Checker y al Maker, detecta patrones y emite directrices para futuras sesiones.

---

## Estructura del Proyecto

Después de instalar FORGE, tu proyecto queda así:

```
mi-proyecto/
├── docs/
│   ├── FORGE.md                     # Manifiesto: "este proyecto usa FORGE"
│   ├── SPEC.md                      # Especificación de requerimientos
│   ├── TEAM.md                      # Catálogo de agentes IA + costos
│   ├── PROGRESS.md                  # Diario del proyecto
│   ├── ROADMAP.md                   # Plan de hitos y prioridades
│   ├── skill/
│   │   ├── SKILL.md                 # Reglas irrompibles (auto-descubrible)
│   │   └── references/              # Documentación bajo demanda
│   └── audits/
│       ├── TEMPLATE.md              # Plantilla de auditoría TRIBUNAL
│       ├── README.md                # Índice de auditorías (auto-generado)
│       └── *.md                     # Auditorías individuales
├── src/                             # Tu código
├── AGENTS.md                        # Reglas de código (lo escribe el usuario)
└── scripts/
    └── tribunal/
        └── update-reviews.js        # Genera el índice de auditorías (opcional)
```

---

## Documentos

| Documento | Propósito |
|:----------|:----------|
| **FORGE.md** | Manifiesto del método. Le dice a cualquier IA que el proyecto usa FORGE y resume las reglas del proceso. |
| **SPEC.md** | Especificación de requerimientos. Define qué se construye, módulo por módulo, sin ambigüedad. |
| **TEAM.md** | Catálogo de agentes IA. Fortalezas, limitaciones, costos y regla de asignación por costo mínimo. |
| **PROGRESS.md** | Diario del proyecto. Registro cronológico de sesiones, cambios y decisiones técnicas. |
| **ROADMAP.md** | Plan de hitos. Qué falta, en qué orden, con qué dependencias. |
| **skill/SKILL.md** | Router operativo. Archivo corto que las IAs cargan siempre y que las dirige al documento correcto según la tarea. |
| **skill/references/** | Documentación bajo demanda. Las IAs consultan estos archivos solo cuando necesitan información específica. |
| **audits/TEMPLATE.md** | Plantilla de auditoría TRIBUNAL. Se copia para cada nueva auditoría. Instrucciones por rol embebidas. |
| **AGENTS.md** | Reglas de código del proyecto. Convenciones, arquitectura, comandos. Lo escribe el usuario en la raíz del repo. |

---

## Principios Fundamentales

1. **Spec antes que código.** Ninguna IA empieza a trabajar sin una especificación clara de qué construir.
2. **El modelo correcto para la tarea correcta.** Siempre asignar al modelo de menor costo que pueda completar la tarea satisfactoriamente.
3. **Ningún agente juzga su propio trabajo.** La revisión de código la hace un agente diferente al que lo escribió.
4. **Todo queda en la bitácora.** Cada decisión, cambio, rechazo y validación se documenta.
5. **Agnóstico por diseño.** Funciona con cualquier lenguaje, framework, modelo de IA, IDE o plataforma.

---

## TRIBUNAL — Módulo de QA

TRIBUNAL es el componente de calidad dentro de FORGE. Establece un sistema de revisión de código entre agentes de IA independientes donde ninguno evalúa su propio trabajo.

### Flujo Operativo — Checker → Maker

El ciclo estándar de toda auditoría. El **Checker** (Auditor) analiza código crudo y produce hallazgos. El **Maker** (Ejecutor) implementa o rechaza cada hallazgo con justificación técnica, valida sus cambios, y documenta todo en la bitácora. Este ciclo es autocontenido — no requiere aprobación externa.

### Gobernanza Periódica — El Judge

El **Judge** (Juez) no forma parte del flujo diario. Se ejecuta cada 5–10 auditorías para evaluar la calidad del Checker y del Maker, detectar patrones, sesgos y desviaciones, y emitir líneas rectoras.

**Flujo de estados:** `draft → audited → validated | blocked → reviewed`

**[→ Ver TRIBUNAL en detalle](docs/PROTOCOL.md)**

---

## Cuándo Usar FORGE

FORGE está diseñado para proyectos de software donde la IA es el desarrollador principal y un humano con conocimiento técnico dirige. Especialmente útil cuando el proyecto tiene múltiples componentes, se usan varios modelos de IA con costos diferentes, el riesgo de errores es alto, o se necesita trazabilidad del proceso.

No es necesario para scripts rápidos, proyectos triviales de un solo archivo, o equipos donde no se usa IA para desarrollar.

---

## Agnóstico por Diseño

| Dimensión | FORGE es compatible con... |
|:----------|:--------------------------|
| **Lenguaje** | Cualquiera. Python, JavaScript, TypeScript, Go, Rust, Java, o lo que uses. |
| **Framework** | React, Next.js, Vue, Django, FastAPI, Rails, Spring, o código sin framework. |
| **Modelo de IA** | Claude, GPT, Gemini, Qwen, Llama, Mistral, DeepSeek, o cualquier LLM. |
| **IDE / Herramienta** | Cursor, Windsurf, Cline, OpenCode, Claude Code, chat web, API directa, o terminal. |
| **Hosting** | GitHub, GitLab, Bitbucket, o cualquier repositorio Git. |

**Dependencias:** Ninguna. FORGE son archivos Markdown planos. Opcionalmente, Node.js ≥ 16 para el script del índice de auditorías.

---

## Métrica

FORGE sugiere una sola métrica: **porcentaje de tareas que pasan sin retrabajo**. Se deriva del índice de auditorías (auditorías `validated` a la primera vs las que pasaron por `blocked`) y del diario del proyecto (fases que se re-hicieron). Simple, accionable, y no requiere tooling adicional.

---

## Contribuir

FORGE está versionado para permitir evolución. Si quieres contribuir: nuevos templates, mejoras a TRIBUNAL, traducciones, o integraciones con IDEs. Para cambios a la estructura o los principios del método, abre un issue primero.

---

## Licencia

MIT

---

<p align="center">
  <strong>FORGE v1.0</strong>
</p>
