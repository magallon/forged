# El Orchestrator — Rol de Orquestación

> *Extensión opcional de FORGE para proyectos de múltiples fases.*

---

## ¿Qué es?

El **Orchestrator** es un meta-rol opcional de FORGE. No pertenece a TRIBUNAL — no audita código, no implementa, no evalúa hallazgos. Opera un nivel por encima: convierte la visión estratégica del Director Humano en especificaciones ejecutables, genera el contexto que necesitan los agentes antes de cada sesión, y administra el flujo del proyecto de fase en fase.

Si FORGE es la fábrica y TRIBUNAL es el departamento de calidad, el Orchestrator es el Jefe de Operaciones: toma las decisiones del Director y las convierte en órdenes de trabajo claras.

---

## Posición en el Framework

```
Director Humano
      │  visión, prioridades, veto
      ▼
  Orchestrator  ←── meta-rol: logística, especificación, orquestación
      │
      ├──▸ Maker (Ejecutor)       ← FORGE: implementa código
      ├──▸ Checker (Auditor)      ← TRIBUNAL: audita
      └──▸ Judge (Juez)           ← TRIBUNAL: gobierna
```

El Director define qué se construye y por qué. El Orchestrator traduce esas decisiones en artefactos ejecutables. Los agentes FORGE implementan, auditan y validan — sin necesidad de que el Director gestione el detalle de cada sesión.

---

## Cuándo Activar el Orchestrator

**Recomendado cuando:**
- El proyecto tiene 4+ fases con dependencias entre ellas
- Se usan múltiples modelos con diferentes capacidades y costos
- El Director quiere operar a nivel estratégico sin gestionar el detalle de cada sesión
- La complejidad del dominio justifica requirements engineering riguroso

**No necesario cuando:**
- El proyecto es pequeño (1–3 fases, un solo componente)
- El Director prefiere gestionar cada agente directamente
- La especificación es simple y el scope está bien delimitado

---

## Responsabilidades

| Área | Descripción |
|:-----|:------------|
| **Requirements Engineering** | Genera la Tríada Kiro por fase: `requirements.md`, `design.md`, `tasks.md` |
| **QA Strategy** | Decide cuándo activar TRIBUNAL, qué componente auditar, con qué tipo |
| **Scaffolding** | Crea estructura de directorios y archivos base antes de que el Maker ejecute |
| **Prompt Engineering** | Genera el prompt de contexto completo para cada sesión de agente |
| **Flow Control** | Registra progreso, actualiza estados en ROADMAP.md, ejecuta `forge prune` cuando aplica |

---

## La Tríada Kiro

Por cada feature del ROADMAP, el Orchestrator genera tres artefactos en `.kiro/specs/[nombre-feature]/` — el mismo formato y ubicación que usa Kiro nativamente:

### requirements.md

Define **qué** se construye. La estructura es fija: User Story (valor de negocio), requerimientos con lenguaje RFC 2119 (`THE [Sistema] SHALL` / `SHALL NOT`), y Criterios de Aceptación en GIVEN/WHEN/THEN. El objetivo es eliminar toda ambigüedad antes de escribir código.

```markdown
## User Story

**Como** usuario nuevo, **quiero** registrarme con mi email y contraseña
**para** acceder a la plataforma sin depender de proveedores externos.

---

## Requerimientos

**THE System SHALL** permitir el registro de usuarios con email y contraseña válidos.
**THE System SHALL** verificar el email antes de activar la cuenta.
**THE System SHALL NOT** revelar si un email ya existe en la base de datos.

---

## Criterios de Aceptación

**AC-01 — Registro exitoso**
- GIVEN un email válido y contraseña de mínimo 8 caracteres
  WHEN el usuario envía el formulario de registro
  THEN se crea la cuenta en estado `unverified` y se envía email de verificación

**AC-02 — Email duplicado**
- GIVEN un email ya registrado en el sistema
  WHEN el usuario intenta registrarse con ese email
  THEN el sistema retorna un error genérico sin confirmar si el email existe
```

### design.md

Define **cómo** se construye. No es una sugerencia — es una orden para el Maker. Incluye el DDL exacto de base de datos, políticas RLS, estructura de componentes UI, y los **Correctness Properties** (invariantes que ninguna implementación puede violar).

```markdown
## Correctness Properties (Invariantes)

- El campo `password_hash` nunca aparece en respuestas de API bajo ninguna circunstancia.
- Las cuentas se desactivan con `deleted_at` — nunca con `DELETE` físico.
- Los tokens de verificación expiran en 24 horas sin excepción.

---

## Base de Datos

```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  verified    BOOLEAN DEFAULT false,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_data" ON users
  USING (id = auth.uid());
```

---

## Estructura de Componentes

```
src/features/auth/
├── RegisterForm.tsx       # formulario controlado con react-hook-form
├── useRegister.ts         # lógica de mutación + manejo de errores
└── api/
    └── register.ts        # POST /api/auth/register
```
```

### tasks.md

Pasos atómicos de ingeniería agrupados en fases lógicas. Cada tarea termina con la referencia al requerimiento que satisface: `_Requirements: X.X_`.

```markdown
## Fase 1: Infraestructura

- [ ] T-01 Crear tabla `users` con DDL exacto de design.md y migrar — _Requirements: 1.1_
- [ ] T-02 Configurar RLS y política `users_own_data` — _Requirements: 1.1_
- [ ] T-03 Implementar generación y envío de token de verificación — _Requirements: 1.2_

## Fase 2: Implementación

- [ ] T-04 Implementar `RegisterForm.tsx` con validación client-side — _Requirements: 1.1, AC-01_
- [ ] T-05 Implementar `useRegister.ts` con manejo de error genérico — _Requirements: 1.3, AC-02_
- [ ] T-06 Implementar endpoint POST /api/auth/register — _Requirements: 1.1, 1.2_

## Fase 3: QA

- [ ] T-07 Tests BDD para AC-01 y AC-02 — _Requirements: 1.1, 1.2, 1.3_
- [ ] T-08 Integration test contra instancia real de base de datos — _Requirements: 1.1_
- [ ] T-09 Verificar que `password_hash` nunca aparece en ninguna respuesta — _Requirements: 1.1_
```


---

## Estructura de Archivos

Con Orchestrator activo, las specs viven en `.kiro/specs/` — el directorio nativo de Kiro:

La convención de nombres de carpetas es `n<nivel>-<secuencia>-<slug-de-feature>`:
- `n1` = features de nivel 1 (core), `n2` = features de nivel 2 (extensiones), etc.
- `<secuencia>` = número de dos dígitos para ordenar dentro del nivel

```
.kiro/
└── specs/
    ├── n1-00-autenticacion/
    │   ├── .config.kiro             # { specId, workflowType, specType }
    │   ├── requirements.md
    │   ├── design.md
    │   └── tasks.md
    ├── n1-01-pagos/
    │   ├── .config.kiro
    │   ├── requirements.md
    │   ├── design.md
    │   └── tasks.md
    └── n2-02-panel-admin/
        └── ...
docs/
├── ROADMAP.md                       # estratégico — el Director lo escribe
├── FORGE.md                         # manifiesto del método
├── TEAM.md                          # catálogo de modelos
├── PROGRESS.md                      # bitácora del proyecto
├── audits/                          # TRIBUNAL — no cambia
└── skill/                           # skill — no cambia
```

**`.config.kiro`** — registro de la spec para herramientas de automatización:

```json
{
  "specId": "550e8400-e29b-41d4-a716-446655440000",
  "workflowType": "requirements-first",
  "specType": "feature"
}
```

---

## Flujo Operativo

El Orchestrator opera en 7 fases por cada ciclo de trabajo:

### 1. Discovery

**Input:** brief del Director, contexto de negocio, documentos previos  
**Output:** mapa de fases propuesto para ROADMAP.md, preguntas de clarificación  
**Punto de aprobación:** el Director valida el mapa antes de avanzar

### 2. Requirements Engineering

Por cada fase del ROADMAP: genera los tres artefactos de la Tríada Kiro. Cada `requirements.md` necesita revisión y aprobación explícita del Director antes de pasarse al Maker. No avanza sin ese veto o aprobación.

### 3. Scaffolding

Crea la estructura de directorios, archivos base vacíos y dependencias de proyecto. No escribe lógica de negocio. Prepara el entorno para que el Maker pueda ejecutar desde el primer prompt.

### 4. Prompt Engineering

Por cada sesión de agente planificada, genera el prompt de arranque completo:
- Qué construir (referencia a `requirements.md` y `tasks.md` de la fase)
- Qué reglas seguir (referencias a `SKILL.md` y `AGENTS.md`)
- Qué archivos leer (referencias específicas — no "lee el proyecto completo")
- Cómo validar (comandos exactos del gate de validación)

### 5. QA Strategy

Evalúa el output del Maker y decide si este componente necesita ciclo TRIBUNAL, qué tipo de auditoría aplicar, y qué modelo proponer como Checker. No participa en la auditoría — solo la planifica y activa.

### 6. Tracking

Al cierre de cada tarea o sesión:
- Marca ítems de `tasks.md` como completados
- Genera la entrada de `PROGRESS.md` (usa `forge session close` como base)
- Actualiza el estado en `ROADMAP.md`
- Ejecuta `forge prune progress` cuando `PROGRESS.md` supera el umbral de contexto

### 7. Resolution / Close

Al completar una fase:
- Verifica que todos los `tasks.md` estén cerrados o explícitamente diferidos
- Genera resumen de la fase en `PROGRESS.md`
- Propone si hay hallazgos que justifiquen un ciclo TRIBUNAL adicional antes de avanzar
- Actualiza `ROADMAP.md` marcando la fase como completada

---

## Reglas del Orchestrator

1. **No escribe código de producción.** Scaffolding (estructura de carpetas, archivos vacíos) sí. Lógica de negocio no.
2. **No participa en TRIBUNAL.** No tiene rol de Checker, Maker ni Judge. Cuando activa una auditoría, se retira del ciclo.
3. **Requiere aprobación del Director en tres hitos:** mapa de fases (Discovery), cada `requirements.md` generado, y estrategia de QA de la fase.
4. **No asume contexto de sesiones anteriores.** Cada ciclo comienza leyendo el estado actual de `ROADMAP.md` y `tasks.md` — no confía en su propia memoria de sesión.

---

## Relación con TRIBUNAL

El Orchestrator y TRIBUNAL son capas ortogonales: el Orchestrator gestiona el flujo del proyecto, TRIBUNAL asegura la calidad del código.

- El Orchestrator decide **si** y **cuándo** se activa TRIBUNAL
- El Orchestrator no tiene voto en el veredicto de TRIBUNAL
- Si TRIBUNAL emite hallazgos que requieren cambiar `requirements.md` o `design.md`, el Orchestrator gestiona esa actualización — pero el Director aprueba el cambio

---

## Modelos Recomendados

| Preferencia | Modelo | Razón |
|:------------|:-------|:------|
| Ideal | Claude Sonnet 4.6 | Razonamiento estructurado, output largo y coherente, excelente para requirements engineering y prompt engineering |
| Alta complejidad | Claude Opus 4.7 | Mayor capacidad analítica para proyectos con dominio complejo o requisitos ambiguos |
| Alternativa | Gemini 2.5 Pro | Ventana de contexto larga, útil para revisar proyectos grandes antes de especificar |

No usar modelos rápidos/baratos como Orchestrator. Su valor está en la precisión del lenguaje contractual — una `requirements.md` ambigua reproduce exactamente el problema que FORGE intenta resolver.

---

<!-- FORGE v1.0 — El Orchestrator (Extensión Opcional) -->
