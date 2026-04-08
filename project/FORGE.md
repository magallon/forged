# ⚒️ FORGE — Manifiesto del Proyecto

**Este proyecto sigue el método FORGE v1.0.**

FORGE es un framework de proceso donde un humano dirige agentes de IA para construir software. Este archivo describe las reglas del método. Para saber qué archivo consultar según la tarea, ver `skill/SKILL.md`. Para reglas de código del proyecto, ver `AGENTS.md` en la raíz.

---

## Flujo Operativo

```
Especificar → Planificar → Asignar → Ejecutar → Auditar
```

1. **Especificar:** Definir qué se construye sin ambigüedad → `SPEC.md`
2. **Planificar:** Descomponer en fases con orden y dependencias → `ROADMAP.md`
3. **Asignar:** Elegir el modelo más barato que pueda completar la tarea → `TEAM.md`
4. **Ejecutar:** La IA implementa, el humano supervisa, se registra → `PROGRESS.md`
5. **Auditar:** Si aplica, otra IA revisa el código → `audits/TEMPLATE.md`

No todos los pasos aplican en cada tarea. Un fix trivial puede ir directo a Ejecutar. Una feature crítica pasa por los 5.

---

## Principios Fundamentales

1. **Spec antes que código.** Ninguna IA empieza sin especificación clara.
2. **El modelo correcto para la tarea correcta.** Menor costo que pueda completarla.
3. **Ningún agente juzga su propio trabajo.** La revisión la hace otro agente.
4. **Todo queda en la bitácora.** Cada decisión, cambio y validación se documenta.
5. **Agnóstico por diseño.** Cualquier lenguaje, framework, modelo, IDE o plataforma.

---

## TRIBUNAL — Quality Assurance

TRIBUNAL es el componente de calidad de FORGE. Establece revisión de código entre agentes independientes.

### Flujo Operativo — Checker → Maker

El **Checker** (Auditor) analiza código y produce hallazgos numerados con severidad y evidencia. El **Maker** (Ejecutor) implementa o rechaza cada hallazgo con justificación técnica, valida sus cambios con los mecanismos del proyecto, y documenta todo en la bitácora. Este ciclo es autocontenido.

### Gobernanza Periódica — Judge

El **Judge** (Juez) no opera en cada auditoría. Se ejecuta cada 5–10 auditorías para evaluar la calidad del Checker y del Maker, detectar patrones y emitir líneas rectoras.

### Flujo de Estados

```
draft → audited → validated | blocked → reviewed
```

| Estado | Significado |
|:-------|:------------|
| `draft` | Plantilla copiada, sin iniciar |
| `audited` | Reporte del Checker listo |
| `validated` | Maker implementó y pasó validación |
| `blocked` | Maker no pudo completar — validación falla |
| `reviewed` | Judge revisó esta auditoría periódicamente |

### Regla Fundamental

Ningún agente evalúa su propio trabajo. El Checker no implementa. El Maker no audita. El Judge no codifica.

### Referencia

Para reglas completas por rol, ver las instrucciones embebidas en `audits/TEMPLATE.md`. Para documentación profunda del proceso, ver `PROTOCOL.md` en el repositorio de FORGE.

---

## Regla de Escalación

Si un hallazgo rechazado por el Maker reaparece en un segundo ciclo de auditoría, el desacuerdo lo resuelve el humano — no se abren más ciclos de IAs debatiendo.

---

<!-- FORGE v1.0 — Manifiesto del Método -->
