# ⚒️ FORGE

**Framework de Orquestación para Desarrollo de Software con IA**

> *Un humano, múltiples IAs, software de calidad.*

---

FORGE es un método de desarrollo estructurado donde un humano dirige un equipo de agentes de IA para construir software. El trabajo se define completamente antes de ejecutarse, se divide en unidades explícitas, se asigna al modelo de menor costo que pueda completarlo, se ejecuta con supervisión humana, y se verifica mediante revisión inter-agente. Todo queda documentado y es trazable.

No es una librería, no es un plugin. Es un conjunto de convenciones, templates y estructura de carpetas. Se instala copiando archivos a tu repositorio. Funciona con cualquier lenguaje, cualquier framework, cualquier modelo de IA.

---

## El Problema

El desarrollo de software con IA es caótico y no reproducible. Las IAs no tienen contexto del proyecto entre sesiones, no saben qué priorizar ni qué reglas seguir, producen código que nadie revisa con rigor, y el humano pierde tiempo repitiendo contexto en cada conversación. La IA se usa como "chat", no como parte de un sistema de trabajo. Si además se usan múltiples modelos — unos baratos para tareas simples, otros caros para tareas complejas — no hay sistema para decidir cuál usar ni para rastrear qué hizo cada uno.

FORGE introduce orden: planificación completa antes de construir, descomposición explícita del trabajo, ejecución guiada por estructura, asignación por costo mínimo, y seguimiento formal del progreso. Incluye TRIBUNAL como módulo de calidad donde ningún agente evalúa su propio trabajo.

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

**Opción A — con CLI (recomendado):**

```bash
npm install -g @forge-method/cli   # Node.js >= 18 requerido

cd mi-proyecto
forge init
forge doctor   # verifica que la estructura quedó completa
```

**Opción B — copia manual:**

```bash
# 1. Copia los templates y el script a tu proyecto
cp -r forge/project/. mi-proyecto/docs/
cp -r forge/scripts/ mi-proyecto/

# 2. Genera el índice de auditorías vacío
node mi-proyecto/scripts/tribunal/update-reviews.js
```

**Symlink para auto-descubrimiento de la skill (opcional, recomendado):**

```bash
# Linux / Mac:
ln -s /ruta/mi-proyecto/docs/skill /mnt/skills/user/mi-proyecto

# Windows (requiere modo desarrollador activado o permisos de administrador):
mklink /D C:\Users\tu-usuario\.skills\mi-proyecto C:\ruta\mi-proyecto\docs\skill
```

Luego llena los documentos en `docs/` con la información de tu proyecto: tu especificación en SPEC.md, tu equipo de modelos en TEAM.md, tu plan en ROADMAP.md, y las reglas de tu proyecto en skill/SKILL.md.

**Prompt de arranque** (para entornos sin auto-descubrimiento de skills):

```
Eres el desarrollador principal de este proyecto.
Lee docs/skill/SKILL.md para orientarte.
Revisa docs/ROADMAP.md para ver la prioridad actual.
Dime qué necesitas para empezar.
```

**[→ Ver ejemplo de auditoría TRIBUNAL completa](examples/)**

---

## Estructura del Repositorio FORGE

```
forged/                              ← Este repositorio
├── project/                         # Templates que forge init copia al proyecto
│   ├── FORGE.md
│   ├── SPEC.md
│   ├── TEAM.md
│   ├── PROGRESS.md
│   ├── ROADMAP.md
│   ├── skill/
│   │   ├── SKILL.md
│   │   └── references/              # codebase-map, handbook, business, tech-stack
│   └── audits/
│       └── TEMPLATE.md
├── cli/                             # CLI @forge-method/cli (Node.js >= 18)
│   ├── bin/forge.js
│   ├── package.json
│   └── src/
│       ├── commands/                # init, doctor, audit, tribunal, session, ledger, status, prune
│       └── utils/                   # args, yaml, fs-utils, confirm, date, ledger-core
├── scripts/
│   └── tribunal/
│       └── update-reviews.js        # Genera el Ledger sin necesidad de instalar el CLI
├── docs/
│   ├── PROTOCOL.md                  # Protocolo TRIBUNAL completo
│   ├── PROGRESS.md                  # Bitácora de desarrollo del propio repo FORGE
│   └── skill/
│       └── references/
│           └── codebase-map.md      # Mapa del CLI (codebase del propio repo)
├── examples/
│   └── security-audit-20250715.md   # Ejemplo de auditoría TRIBUNAL completada
├── CLI.md                           # Referencia completa de comandos
├── METHOD.md                        # Metodología completa
└── README.md
```

---

## Estructura del Proyecto (después de instalar)

Después de `forge init`, tu proyecto queda así:

```
mi-proyecto/
├── docs/
│   ├── FORGE.md                     # Manifiesto del método
│   ├── SPEC.md                      # Especificación de requerimientos
│   ├── TEAM.md                      # Catálogo de agentes IA + costos
│   ├── PROGRESS.md                  # Diario del proyecto + métricas
│   ├── ROADMAP.md                   # Plan de hitos y prioridades
│   ├── skill/
│   │   ├── SKILL.md                 # Router operativo para IAs
│   │   └── references/
│   │       ├── README.md            # Guía de qué documentar aquí
│   │       ├── codebase-map.md      # Inventario de componentes existentes
│   │       ├── handbook.md          # Visión, arquitectura, historia
│   │       ├── business.md          # Modelo de negocio, pricing, políticas
│   │       └── tech-stack.md        # Stack técnico, infraestructura
│   └── audits/
│       ├── TEMPLATE.md              # Plantilla de auditoría TRIBUNAL
│       ├── README.md                # Ledger — índice generado automáticamente
│       └── *.md                     # Auditorías individuales
├── scripts/
│   └── tribunal/
│       └── update-reviews.js        # Genera el Ledger (alternativa al CLI)
├── src/                             # Tu código — no lo toca FORGE
└── AGENTS.md                        # Lo creas tú — convenciones de código del proyecto
```

---

## Documentos

| Documento | Propósito |
|:----------|:----------|
| **FORGE.md** | Manifiesto del método. Declara que el proyecto usa FORGE, resume los principios, el flujo operativo y las reglas de TRIBUNAL. |
| **SPEC.md** | Especificación de requerimientos. Define qué se construye, módulo por módulo, con requerimientos funcionales numerados, reglas de negocio y exclusiones. |
| **TEAM.md** | Catálogo de agentes IA. Documenta fortalezas, limitaciones, costos de cada modelo y la regla de asignación por costo mínimo. Incluye comparativa de costos IA vs humano. |
| **PROGRESS.md** | Diario del proyecto. Registro cronológico de sesiones de trabajo, decisiones técnicas, referencias cruzadas a auditorías, y revisiones periódicas de la métrica de retrabajo. |
| **ROADMAP.md** | Plan de hitos. Qué falta por construir, en qué orden, con qué dependencias y prioridades. Las features futuras van aquí como fases de baja prioridad. |
| **skill/SKILL.md** | Router operativo. Archivo corto que las IAs cargan siempre al abrir el proyecto. Contiene la tabla de consulta (qué archivo leer según la tarea), prohibiciones absolutas y comandos obligatorios. |
| **skill/references/** | Documentación bajo demanda. Contiene el mapa del codebase (inventario de componentes existentes para prevenir reimplementación), handbook del proyecto, modelo de negocio y stack técnico. Las IAs consultan estos archivos solo cuando necesitan información específica. |
| **audits/TEMPLATE.md** | Plantilla de auditoría TRIBUNAL. Se copia para cada nueva auditoría. Contiene el YAML v2.0, instrucciones embebidas por rol (Checker, Maker, Judge) y tablas de disposición. |
| **audits/README.md** | Ledger de auditorías. Índice generado automáticamente por `forge ledger` o `update-reviews.js`. Tabla de todas las auditorías con estado, veredicto y trazabilidad. |
| **AGENTS.md** | Reglas de código del proyecto. Convenciones de sintaxis, arquitectura de módulos, comandos de build/test. Lo escribe el usuario en la raíz del repositorio — cada proyecto es diferente. |

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

**Dependencias:** Ninguna. FORGE son archivos Markdown planos. Opcionalmente, Node.js ≥ 16 para `update-reviews.js`. El CLI requiere Node.js ≥ 18.

---

## Métrica

FORGE sugiere una sola métrica: **porcentaje de tareas que pasan sin retrabajo**. Se calcula desde dos fuentes: el Ledger de TRIBUNAL (auditorías `validated` a la primera vs las que pasaron por `blocked`) y PROGRESS.md (fases completadas sin necesidad de rehacerlas). Un porcentaje alto indica que los modelos están bien asignados, el SPEC es claro y el proceso de auditoría funciona. Un porcentaje bajo señala dónde ajustar: asignación de modelos, claridad del spec o rigor de validación. Se registra periódicamente en PROGRESS.md.

Con el CLI instalado, `forge status` calcula y muestra la tasa combinada directamente.

**[→ Ver cómo calcularla paso a paso](METHOD.md#medición)**

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
