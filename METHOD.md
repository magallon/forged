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

## El Flujo de 5 Pasos

```
Especificar → Planificar → Asignar → Ejecutar → Auditar
```

No todos los pasos aplican en cada tarea. Un fix trivial puede ir directo a Ejecutar. Una feature crítica pasa por los 5. El flujo completo es la referencia — cada tarea usa los pasos que necesita.

### 1. Especificar

Antes de que cualquier IA escriba una línea de código, debe existir una especificación clara de qué se va a construir. Esto vive en `docs/SPEC.md`.

La especificación no es un documento de arquitectura ni un manual técnico. Es una definición funcional: qué módulos tiene el sistema, qué debe hacer cada uno (requerimientos funcionales numerados como RF-XXX-01), qué reglas de negocio aplican, y qué queda explícitamente fuera del alcance (exclusiones).

El nivel de detalle importa. Una especificación demasiado vaga produce implementaciones que hay que re-hacer. Una demasiado detallada prescribe la solución y le quita a la IA la capacidad de proponer enfoques mejores. El punto ideal es: lo suficientemente detallada para que no haya ambigüedad sobre *qué* debe pasar, pero sin dictar *cómo* debe implementarse.

Las reglas irrompibles del proyecto también van en el SPEC: "nunca eliminar datos físicamente", "nunca responder con información que no venga de las fuentes", etc. Son los invariantes que ninguna implementación puede violar.

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

Cada sesión de trabajo se registra con: fecha, qué se hizo, decisiones técnicas tomadas, y resultado de validación (build, tests). Cuando una sesión involucra una auditoría TRIBUNAL, PROGRESS.md la referencia con un enlace a la bitácora en lugar de duplicar el contenido:

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

**PROGRESS.md:** Mantener solo las últimas sesiones activas. Las sesiones anteriores se mueven a `references/progress-archive.md`. Así el diario siempre es ligero y la IA solo ve lo reciente y relevante.

**ROADMAP.md:** Mantener solo las fases activas y las inmediatas siguientes. Las fases completadas se marcan como tales, pero si el archivo crece demasiado, las fases antiguas se pueden archivar.

**SPEC.md:** Crece con el proyecto a medida que se agregan módulos, pero las IAs lo consultan por sección, no completo. SKILL.md dirige a la IA al módulo relevante para la tarea en curso.

Cada proyecto define su umbral de poda. FORGE sugiere la práctica, no prescribe números. Lo importante es que los documentos que las IAs cargan frecuentemente se mantengan dentro de un tamaño razonable.

---

## Medición

FORGE sugiere una sola métrica: **porcentaje de tareas que pasan sin retrabajo**.

Se calcula desde dos fuentes:
- El Ledger de TRIBUNAL: auditorías que llegaron a `validated` sin pasar por `blocked` vs las que sí pasaron por `blocked` antes.
- PROGRESS.md: fases o sesiones que se registraron como completadas sin necesidad de re-ejecución.

Esta métrica indica si los modelos están bien asignados (un modelo inadecuado produce retrabajo), si el SPEC está bien escrito (ambigüedad produce implementaciones incorrectas), y si el proceso de auditoría es efectivo (un buen Checker reduce retrabajo del Maker).

No se requiere tooling para calcularla — es un conteo manual que se revisa periódicamente.

---

<p align="center">
  <strong>FORGE v1.0</strong>
</p>
