# FORGE — El Método

> Documentación completa del framework de orquestación.
> Para inicio rápido y pitch, ver [README.md](README.md).
> Para el proceso de auditoría TRIBUNAL, ver [docs/PROTOCOL.md](docs/PROTOCOL.md).

---

## Visión

Un humano con conocimiento técnico dirige un equipo de agentes de IA para construir software de calidad profesional. El humano define qué se construye, decide quién lo hace, supervisa la ejecución y asegura la calidad. Las IAs ejecutan: escriben código, implementan features, corrigen bugs, auditan el trabajo de otras IAs.

Este modelo funciona porque el humano aporta lo que las IAs no tienen: visión de producto, criterio de negocio, contexto persistente entre sesiones, y la capacidad de decidir cuándo algo está "bien" o cuándo necesita otra iteración. Las IAs aportan lo que el humano no puede hacer solo: velocidad de ejecución, disponibilidad 24/7, conocimiento técnico amplio, y capacidad de procesar grandes cantidades de código.

FORGE formaliza esta dinámica en un proceso reproducible.

---

## Arranque de un Proyecto Nuevo

Esta sección describe paso a paso cómo iniciar un proyecto desde cero con FORGE. Antes de escribir la primera línea de código, los documentos fundacionales deben estar llenos. Esto toma entre 1 y 2 sesiones con una IA capaz.

### Paso 0 — Preparar la estructura

**Opción A — con CLI (recomendado):**

```bash
npm install -g @magallon/forge   # Node.js >= 18

cd mi-proyecto
forge init
```

`forge init` copia los templates, genera el Ledger inicial y muestra un resumen de lo que creó. Si el directorio ya tiene contenido, pide confirmación antes de sobrescribir.

**Opción B — copia manual:**

```bash
# Clonar FORGE
git clone https://github.com/tu-org/forge.git

# Copiar los templates y el script a tu proyecto
cp -r forge/project/. mi-proyecto/docs/
cp -r forge/scripts/ mi-proyecto/

# Generar el Ledger inicial
node mi-proyecto/scripts/tribunal/update-reviews.js
```

**Symlink para auto-descubrimiento de la skill (opcional, recomendado):**

```bash
# Linux / Mac:
ln -s /ruta/mi-proyecto/docs/skill /mnt/skills/user/mi-proyecto
# Windows (modo desarrollador o administrador):
mklink /D C:\Users\tu-usuario\.skills\mi-proyecto C:\ruta\mi-proyecto\docs\skill
```

Después de este paso, tu proyecto tiene la estructura completa de FORGE con todos los templates vacíos listos para llenar. Ejecuta `forge doctor` para verificar que todo esté en orden.

### Paso 1 — Generar la especificación de requerimientos

La especificación define exactamente qué se construye por fase. No avances a la implementación sin ella — la ambigüedad aquí produce retrabajo multiplicado.

La especificación vive en `.kiro/specs/[nombre-feature]/` como la **Tríada Kiro**: tres archivos que juntos definen qué, cómo y en qué tareas se divide el trabajo. La herramienta recomendada para generarla es **[Kiro](https://kiro.dev/)** — un IDE especializado en requirements engineering con lenguaje contractual (SHALL/MUST) y criterios BDD (Given/When/Then).

Si usas el Orchestrator, él genera la Tríada automáticamente. Si la escribes manualmente, los tres archivos son:

- `requirements.md` — User Story + requerimientos RFC 2119 (`THE System SHALL` / `SHALL NOT`) + Criterios de Aceptación GIVEN/WHEN/THEN
- `design.md` — prescriptivo total: DDL exacto de base de datos, políticas RLS, estructura de componentes, y **Correctness Properties** (invariantes que ninguna implementación puede violar)
- `tasks.md` — tareas atómicas agrupadas en fases (Infraestructura, Implementación, QA), cada una con referencia `_Requirements: X.X_`

Las carpetas siguen la convención `n<nivel>-<secuencia>-<slug>` (ej. `n1-00-autenticacion`, `n2-16-panel-admin`).

No avances a la siguiente fase hasta que el Director haya revisado y aprobado los tres archivos.

### Paso 2 — Llenar TEAM.md

Define con qué modelos de IA vas a trabajar. En la misma sesión o en una nueva, dile a la IA qué modelos tienes disponibles y pídele que investigue sus especificaciones.

Ejemplo de prompt:

```
Lee el template en docs/TEAM.md.
Voy a trabajar con estos modelos: [lista tus modelos].
Para cada uno, investiga: contexto máximo, velocidad aproximada,
precio por token (input y output), fortalezas principales y limitaciones conocidas.
Llena TEAM.md con la información. Incluye la tabla de comparación rápida
y la sección de costos IA vs Humano con salarios de [tu región].
```

Revisa los datos. Ajusta las secciones de "Asignar" y "Nunca asignar" basándote en tu experiencia real con cada modelo. Los benchmarks y specs públicos son una referencia, pero tu experiencia directa vale más.

### Paso 3 — Llenar ROADMAP.md

Descompón el proyecto en fases con orden y dependencias. El ROADMAP es el mapa estratégico del proyecto — por cada fase, el Paso 1 generará su Tríada Kiro antes de ejecutar.

Ejemplo de prompt:

```
Lee docs/ROADMAP.md y el brief del proyecto que te adjunto.
Descompón el proyecto en fases de implementación.
Para cada fase define: nombre descriptivo, duración estimada,
qué fases deben completarse antes (dependencias), y prioridad.
Ordena de mayor a menor prioridad.
Las fases con dependencias no resueltas no pueden empezar.
```

Revisa el orden. Tú decides las prioridades — la IA propone pero el humano define qué es urgente vs qué puede esperar. Valida que las dependencias tengan sentido. Si una fase dice "depende de Fase 3" pero realmente podría empezar en paralelo, corrígelo.

### Paso 4 — Llenar SKILL.md y references

Abre docs/skill/SKILL.md y llena las secciones específicas de tu proyecto:

**Prohibiciones absolutas:** Las reglas que ningún agente puede violar jamás. Piensa en qué errores serían catastróficos si una IA los cometiera. "Nunca eliminar datos físicamente", "nunca hacer deploy a producción sin aprobación", "nunca exponer API keys en el código".

**Comandos obligatorios:** Los comandos de validación que toda IA debe correr después de cambiar código. Son específicos de tu stack: `npm run build && npm test`, `ruff . && pytest`, o lo que aplique.

**Referencias:** Crea los archivos de referencia que tu proyecto necesite en `docs/skill/references/`. Como mínimo:

- `handbook.md` — si ya tienes claro la visión y arquitectura general, llénalo. Si no, créalo cuando lo tengas.
- `tech-stack.md` — si ya decidiste el stack técnico, documéntalo con las razones de cada decisión. La IA futura necesita saber *por qué* se eligió cada tecnología para no proponer cambiarla.
- `business.md` — si tu proyecto tiene modelo de negocio, planes, pricing o políticas comerciales, documéntalo para que las IAs lo respeten al implementar.
- `codebase-map.md` — empieza vacío. Se llena conforme construyes. Cada sesión que cree componentes nuevos debe actualizar este archivo.

### Paso 5 — Escribir AGENTS.md

Crea `AGENTS.md` en la raíz de tu repositorio con las reglas de código del proyecto. Este archivo no es un template de FORGE — lo escribes tú porque cada proyecto es radicalmente diferente.

Incluye: convenciones de sintaxis (ES modules, async/await, nomenclatura), arquitectura de módulos (estructura de directorios, dónde va cada cosa), comandos de build, test y deploy, manejo de errores, reglas de seguridad, y cualquier convención que toda IA deba seguir al escribir código.

Si aún no tienes el stack definido, escribe las reglas que ya sepas y completa el resto cuando hagas el scaffolding del proyecto.

### Paso 6 — Empezar a construir

Con TEAM, ROADMAP, SKILL y AGENTS listos, genera la Tríada Kiro para la primera fase, toma la primera tarea, consulta TEAM.md para elegir el modelo más barato que pueda completarla, y empieza a ejecutar.

A partir de aquí, el flujo de 5 pasos se repite para cada fase: especificar (generar Tríada Kiro para la fase), planificar (ya está en ROADMAP), asignar (consultar TEAM), ejecutar (la IA trabaja, registrar en PROGRESS), y auditar (si el componente lo amerita, activar TRIBUNAL).

`FORGE.md` no se toca — ya viene con las reglas del método y funciona tal cual.

---

## El Flujo de 5 Pasos

```
Especificar → Planificar → Asignar → Ejecutar → Auditar
```

No todos los pasos aplican en cada tarea. Un fix trivial puede ir directo a Ejecutar. Una feature crítica pasa por los 5. El flujo completo es la referencia — cada tarea usa los pasos que necesita.

### 1. Especificar

Antes de que cualquier IA escriba una línea de código, debe existir una especificación clara de qué se va a construir. Esto vive en `.kiro/specs/[nombre-feature]/` como la **Tríada Kiro**: `requirements.md`, `design.md` y `tasks.md`.

`requirements.md` define *qué* debe comportarse el sistema: User Story, requerimientos RFC 2119 (`THE System SHALL` / `SHALL NOT`), y Criterios de Aceptación GIVEN/WHEN/THEN. `design.md` define *cómo* — prescriptivo total: DDL de base de datos, políticas RLS, estructura de componentes, y **Correctness Properties** (invariantes). `tasks.md` desglosa el trabajo en tareas atómicas por fases (Infraestructura, Implementación, QA), cada una trazable a su requerimiento. La herramienta recomendada para generarlos es **[Kiro](https://kiro.dev/)**.

El nivel de detalle importa. Una especificación demasiado vaga produce retrabajo. Una demasiado prescriptiva le quita a la IA la capacidad de proponer mejores enfoques. El punto ideal: suficientemente detallada para que no haya ambigüedad sobre *qué* debe pasar, sin dictar *cómo*.

Las reglas irrompibles del proyecto van en `requirements.md`: "nunca eliminar datos físicamente", "nunca exponer tokens en respuestas", etc. Son los invariantes que ninguna implementación puede violar.

### 2. Planificar

El trabajo se descompone en fases con orden y dependencias. Esto vive en `docs/ROADMAP.md`.

Cada fase tiene: nombre, descripción breve, duración estimada, dependencias (qué fases deben completarse antes), y estado (pendiente, en progreso, completada). Las fases se ordenan por prioridad y dependencias — no se empieza una fase si sus dependencias no están resueltas.

Features futuras y mejoras de menor prioridad también van en el ROADMAP como fases de baja prioridad. No existe un documento separado de "features futuras" — son fases que aún no tienen fecha.

### 3. Asignar

Cada tarea se asigna al modelo de IA de menor costo que pueda completarla satisfactoriamente. El catálogo de agentes vive en `docs/TEAM.md`.

**La regla de oro:** No uses el modelo más caro para todo. Un modelo barato y rápido es perfecto para tareas mecánicas (formateo, tests unitarios, limpieza de código). Un modelo de rango medio maneja features bien especificadas, debugging estándar y refactorizaciones. Los modelos caros se reservan para arquitectura, debugging de problemas complejos, auditorías de seguridad, y decisiones de diseño donde un error cuesta caro.

TEAM.md documenta para cada modelo: sus fortalezas, sus limitaciones, qué tareas asignarle, y qué tareas nunca asignarle. También incluye precios por token o por uso, y una tabla de equivalencia con roles humanos y salarios referenciales para estimar el ahorro.

**Estimación de costos IA vs Humano:** Cuando el proyecto lo justifica (presupuestos, justificación ante stakeholders), la estimación se calcula como: costo humano = (salario mensual ÷ horas laborales) × horas estimadas. Costo IA = precio por token × tokens estimados de la tarea. TEAM.md tiene los datos de referencia para ambos cálculos. Las auditorías TRIBUNAL pueden incluir una estimación de costo en su bitácora si el proyecto lo requiere.

**Nota importante:** Los modelos y sus precios cambian rápidamente. TEAM.md debe actualizarse periódicamente. No se recomienda usar modelos que tienden a duplicar bloques de código como Maker (Ejecutor) en TRIBUNAL, independientemente de su capacidad analítica — pueden ser excelentes como Checker o Judge.

### 4. Ejecutar

La IA implementa. El humano supervisa. Todo se registra en `docs/PROGRESS.md`.

**Reutilización antes que reimplementación.** Cada agente de IA empieza sin contexto de lo que ya existe en el codebase. Esto produce un patrón destructivo: la IA crea componentes, hooks y utilidades que ya existen en el proyecto. Para evitarlo, FORGE recomienda mantener un mapa del codebase en `docs/skill/references/codebase-map.md` — un inventario breve de los módulos, componentes reutilizables, hooks y utilidades que ya existen, con su ubicación. La IA consulta este archivo antes de implementar y solo crea algo nuevo si no existe ya. Al final de cada sesión, la IA actualiza el mapa con lo que creó.

Cada sesión de trabajo se registra con: fecha, qué se hizo, decisiones técnicas tomadas, y resultado de validación (build, tests). Si el CLI está disponible, `forge session close` crea la entrada automáticamente desde los archivos modificados en git — útil como punto de partida que luego el humano completa con decisiones técnicas y contexto. Cuando una sesión involucra una auditoría TRIBUNAL, PROGRESS.md la referencia con un enlace a la bitácora en lugar de duplicar el contenido:

```markdown
## Sesión 2025-07-16 — Auditoría de seguridad PaymentForm

Se ejecutó ciclo TRIBUNAL (Checker → Maker). 4 hallazgos, 3 implementados, 1 rechazado.
Validación: build + tests passing.
Bitácora: [docs/audits/security-audit-20250715.md](audits/security-audit-20250715.md)
```

**El rol del humano en la validación.** La validación de cambios (build, tests, linters) la ejecuta quien tenga acceso a terminal. Si la IA trabaja en un entorno con acceso a terminal (Claude Code, Cursor, Windsurf, Cline), ejecuta el gate de validación directamente y documenta los resultados. Si la IA está en un chat web sin acceso a terminal, el humano ejecuta los comandos, pega los resultados en la conversación, y la IA los documenta en la bitácora. Lo importante es que la evidencia de validación quede registrada, independientemente de quién la ejecute.

### 5. Auditar

No todo necesita auditoría. Las auditorías se activan cuando un componente maneja datos sensibles, se hace un refactor arquitectónico, un módulo tiene problemas de rendimiento, o se sospecha que la IA está confirmando sus propios errores.

Cuando se activa, se usa TRIBUNAL: un Checker analiza el código y produce hallazgos, un Maker implementa o rechaza con justificación. Cada 5-10 auditorías, un Judge evalúa la calidad del proceso. El detalle completo de TRIBUNAL está en [docs/PROTOCOL.md](docs/PROTOCOL.md).

---

## La Skill del Proyecto

La skill es el mecanismo que resuelve el problema de contexto entre sesiones. Es un archivo corto (~150 líneas) que contiene las reglas irrompibles del proyecto y que las IAs cargan automáticamente al abrir el repositorio.

### Qué es y por qué existe

Cada vez que abres una sesión nueva con una IA, esa IA no sabe nada del proyecto. La skill le da orientación inmediata: qué reglas seguir, qué archivos consultar según la tarea, qué nunca hacer. Sin la skill, el humano tiene que repetir este contexto manualmente en cada sesión.

La skill vive en `docs/skill/SKILL.md` y se complementa con un directorio `docs/skill/references/` que contiene documentación detallada bajo demanda — handbook del proyecto, modelo de negocio, stack técnico, etc. La skill no carga estos archivos completos; solo apunta a ellos para que la IA los consulte cuando necesite información específica.

### SKILL.md vs FORGE.md vs AGENTS.md

Tres archivos con propósitos distintos que no deben confundirse:

**SKILL.md** es el router operativo para las IAs. Responde la pregunta "estoy haciendo X, ¿qué archivo leo?". Contiene la tabla de consulta, las prohibiciones absolutas del proyecto, y los comandos obligatorios post-cambio. Es lo primero que carga la IA.

**FORGE.md** es el manifiesto del método. Responde la pregunta "¿cómo se trabaja en este proyecto?". Contiene los principios de FORGE, el resumen de TRIBUNAL, y el flujo de estados. Es referencia del proceso, no router de archivos.

**AGENTS.md** son las reglas de código del proyecto. Responde la pregunta "¿cómo escribo código aquí?". Contiene convenciones de sintaxis, arquitectura de módulos, comandos de build/test, manejo de errores. Lo escribe el usuario — cada proyecto es radicalmente diferente. Vive en la raíz del repositorio, no dentro de docs/.

### Setup del Symlink

Para que las IAs auto-descubran la skill sin intervención del humano, se crea un symlink desde la ubicación de skills de la herramienta hacia el directorio de la skill en el proyecto:

**Linux / Mac:**
```bash
ln -s /ruta/mi-proyecto/docs/skill /mnt/skills/user/mi-proyecto
```

**Windows** (requiere modo desarrollador activado o ejecutar como administrador):
```cmd
mklink /D C:\Users\tu-usuario\.skills\mi-proyecto C:\ruta\mi-proyecto\docs\skill
```

Esto es recomendado pero no obligatorio. No todas las herramientas buscan skills en la misma ubicación. En entornos sin auto-descubrimiento, el prompt de arranque en el README sirve como fallback.

La ventaja del symlink: una sola fuente de verdad. Si actualizas la skill en el repo, la herramienta ve los cambios inmediatamente. Sin duplicación, sin sincronización manual.

---

## Mantenimiento y Poda de Contexto

Los documentos que crecen con el tiempo — especialmente PROGRESS.md y ROADMAP.md — deben mantenerse compactos. Si una IA carga un PROGRESS.md de 500 líneas para cambiar un botón, está desperdiciando ventana de contexto y arriesgando que el modelo olvide instrucciones clave.

**PROGRESS.md:** Mantener solo las últimas sesiones activas. Las sesiones anteriores se mueven a `references/progress-archive.md`. Si el CLI está disponible, `forge prune progress` automatiza este proceso — previsualiza con `--dry-run` antes de ejecutar. Así el diario siempre es ligero y la IA solo ve lo reciente y relevante.

**ROADMAP.md:** Mantener solo las fases activas y las inmediatas siguientes. Las fases completadas se marcan como tales, pero si el archivo crece demasiado, las fases antiguas se pueden archivar.

**.kiro/specs/:** Cada carpeta de feature contiene su propia Tríada Kiro. Las specs completadas se pueden archivar — el Maker solo necesita la Tríada del feature activo.

Cada proyecto define su umbral de poda. FORGE sugiere la práctica, no prescribe números. Lo importante es que los documentos que las IAs cargan frecuentemente se mantengan dentro de un tamaño razonable.

---

## El Orchestrator (Extensión Opcional)

Para proyectos con 4+ fases complejas o múltiples modelos de IA con diferentes capacidades, FORGE permite delegar la gestión operativa del flujo a un agente especializado — el **Orchestrator**.

El Orchestrator no forma parte del flujo base de 5 pasos ni de TRIBUNAL. Opera como una capa de meta-orquestación entre el Director Humano y los agentes especializados: convierte las decisiones estratégicas del Director en especificaciones ejecutables, genera prompts de contexto para cada agente, decide cuándo activar TRIBUNAL, y administra el estado del proyecto fase a fase.

Su artefacto central es la **Tríada Kiro**: por cada fase del ROADMAP, el Orchestrator genera `requirements.md` (qué SHALL construirse, con criterios BDD), `design.md` (cómo, como contrato de arquitectura), y `tasks.md` (lista atómica de tareas para el Maker). Estos tres archivos son la fuente de especificación ejecutable por fase.

**[→ Ver el Orchestrator en detalle](docs/ORCHESTRATOR.md)**

---

## Medición

FORGE sugiere una sola métrica: **porcentaje de tareas que pasan sin retrabajo**.

### Qué mide

Si una tarea se completa a la primera sin necesidad de rehacerla, el proceso funcionó. Si hay que rehacerla, algo falló: el spec era ambiguo, el modelo asignado no era capaz, o la implementación tenía errores que no se detectaron a tiempo. Esta métrica te dice qué tan bien está funcionando tu proceso como un todo.

### Cómo calcularla

**Con CLI** — cálculo automatizado (recomendado si está instalado):

```bash
forge status            # últimos 28 días
forge status --period 7d   # período personalizado
```

`forge status` lee el Ledger y PROGRESS.md, calcula la tasa de cada fuente y muestra la tasa combinada con un indicador visual respecto al umbral del 85%.

**Sin CLI** — cálculo manual desde dos fuentes:

**Fuente 1 — El Ledger de TRIBUNAL (`docs/audits/README.md`):**

El Ledger es un índice auto-generado de todas las auditorías. Genera o actualiza el Ledger con:

```bash
forge ledger                            # con CLI
node scripts/tribunal/update-reviews.js   # sin CLI (Node.js >= 16)
```

Córrelo cada vez que completes una auditoría, o configúralo como hook de git para que se actualice automáticamente (ver [PROTOCOL.md](docs/PROTOCOL.md) para integración CI/CD).

Una vez generado, abre el Ledger y cuenta:
- Auditorías que llegaron a `validated` directo = tareas exitosas
- Auditorías que pasaron por `blocked` antes de llegar a `validated` = retrabajo

```
Ejemplo: 10 auditorías totales, 8 validated directo, 2 pasaron por blocked
Tasa TRIBUNAL = 8 ÷ 10 = 80%
```

**Fuente 2 — PROGRESS.md:**

Revisa el diario del proyecto y cuenta:
- Fases o sesiones registradas como completadas a la primera = tareas exitosas
- Fases que tuvieron que rehacerse, corregirse o volver a ejecutarse = retrabajo

```
Ejemplo: 20 fases totales, 17 completadas a la primera, 3 rehechas
Tasa PROGRESS = 17 ÷ 20 = 85%
```

**Tasa combinada:** Promedia ambas fuentes para obtener tu porcentaje general. Si solo usas una fuente (por ejemplo, no todas las tareas pasan por TRIBUNAL), usa esa sola.

### Cuándo revisarla

No hay frecuencia obligatoria. Opciones razonables: al final de cada semana de trabajo, cuando el Judge haga su revisión periódica de lote, o al cerrar un hito importante del ROADMAP.

### Qué te dice el resultado

Si el porcentaje es alto (>85%), el proceso está funcionando bien: los modelos están bien asignados, las specs son claras, y las auditorías detectan problemas a tiempo.

Si el porcentaje es bajo (<70%), algo falla y puedes diagnosticar qué:
- ¿Las tareas que fallaron usaban un modelo barato para algo complejo? → TEAM.md necesita ajustes en la asignación.
- ¿La IA implementó algo diferente a lo pedido? → `requirements.md` de la fase tiene ambigüedades que corregir.
- ¿Las auditorías detectan muchos problemas graves? → El modelo que construyó no es confiable para ese tipo de tarea.
- ¿El Maker pasa por `blocked` frecuentemente? → O el Checker infla severidades, o el Maker no valida antes de declarar implementado.

### Dónde registrarla

`forge status` muestra la tasa en pantalla pero no la persiste — es una vista de solo lectura. Registra el resultado como una entrada periódica en PROGRESS.md, que ya incluye una sección de ejemplo para revisión de métricas:

```markdown
## Revisión de métricas — 2025-08-01

Período: Julio 2025
- Auditorías: 12 total, 10 validated directo, 2 con blocked → 83%
- Fases ROADMAP: 8 completadas, 7 a la primera, 1 rehecha → 87%
- Tasa combinada: 85%
- Diagnóstico: La fase rehecha (Auth) usó Flash para lógica compleja.
  Ajuste: asignar mínimo Sonnet para módulos de autenticación.
```

---

<p align="center">
  <strong>FORGE v1.0</strong>
</p>