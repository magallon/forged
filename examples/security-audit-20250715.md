---
# FORGE / TRIBUNAL Protocol v2.0 — Ejemplo de Auditoría Completa
# Este archivo muestra cómo luce un ciclo TRIBUNAL terminado.

schema_version: "2.0"
id: "security-PaymentForm-20250715-0930"
tipo: "security"
componente: "src/components/PaymentForm.tsx"
alcance: "XSS y CSRF en formulario de pago"
max_severity: "critical"
status: "reviewed"
tags: [xss, csrf, react]
created_at: "2025-07-15T09:30:00-06:00"
updated_at: "2025-08-01T09:00:00-06:00"

auditor:
  model: "qwen-3.6"
  session_id: "abc123"
  timestamp: "2025-07-15T10:00:00-06:00"
  findings_count: 4
  confidence: "high"

executor:
  model: "claude-sonnet-4"
  session_id: "def456"
  timestamp: "2025-07-16T14:00:00-06:00"
  commit_ref: "fix/xss-payment-20250716"
  accepted_count: 3
  rejected_count: 1
  partial_count: 0
  emergent_count: 1
  waves_count: 2
  validation:
    tools_used: ["build", "tests", "linter"]
    result: "pass"
    notes: ""

judge:
  model: "claude-opus-4"
  session_id: "ghi789"
  timestamp: "2025-08-01T09:00:00-06:00"
  review_batch: "batch-2025Q3-001"
  auditor_score: 88
  executor_score: 92
  verdict: "reviewed-ok"
  drift_detected: false
  new_audit_recommended: false
  notes: "Rechazos bien argumentados. Gate de validación completo."
---

# 🏛️ Revisión: `security-PaymentForm-20250715-0930`

> **Componente:** `src/components/PaymentForm.tsx`  
> **Alcance:** XSS y CSRF en formulario de pago  
> **Tipo:** security | **Severidad máxima:** critical  
> **Estado:** reviewed

---

## Checker — Reporte de Auditoría

**Modelo:** qwen-3.6 | **Fecha:** 2025-07-15T10:00:00

### Resumen Ejecutivo

El componente PaymentForm presenta vulnerabilidades de XSS en el renderizado de mensajes de error y ausencia de protección CSRF en el envío del formulario. Se identificaron 4 hallazgos, 2 de severidad crítica.

### Hallazgos

#### [F-001] XSS reflejado en mensaje de error de validación

| Campo        | Valor       |
|:-------------|:------------|
| Severidad    | `critical`  |
| Categoría    | XSS         |
| Ubicación    | `src/components/PaymentForm.tsx:47` |
| Confianza    | `alta`      |

**Descripción:**  
El mensaje de error de validación se renderiza con `dangerouslySetInnerHTML` usando directamente el input del usuario sin sanitización.

**Evidencia / Reproducción:**  
```jsx
// Línea 47 — el valor de cardNumber llega directo del input
<div dangerouslySetInnerHTML={{ __html: `Número inválido: ${cardNumber}` }} />
```

**Sugerencia de Remediación:**  
Reemplazar `dangerouslySetInnerHTML` por renderizado de texto plano o aplicar sanitización con DOMPurify.

---

#### [F-002] Ausencia de token CSRF en envío de formulario

| Campo        | Valor       |
|:-------------|:------------|
| Severidad    | `critical`  |
| Categoría    | CSRF        |
| Ubicación    | `src/components/PaymentForm.tsx:89` |
| Confianza    | `alta`      |

**Descripción:**  
El formulario envía datos de pago al backend sin incluir token CSRF. Un atacante podría construir una página que envíe el formulario en nombre del usuario autenticado.

**Evidencia / Reproducción:**  
```jsx
// Línea 89 — fetch sin token CSRF
const response = await fetch('/api/payment', {
  method: 'POST',
  body: JSON.stringify(formData),
  headers: { 'Content-Type': 'application/json' }
});
```

**Sugerencia de Remediación:**  
Agregar token CSRF del meta tag o cookie al header de la request.

---

#### [F-003] Input de CVV sin máscara ni validación de largo

| Campo        | Valor       |
|:-------------|:------------|
| Severidad    | `medium`    |
| Categoría    | security    |
| Ubicación    | `src/components/PaymentForm.tsx:62` |
| Confianza    | `media`     |

**Descripción:**  
El campo CVV acepta cualquier longitud y no oculta los dígitos. Esto facilita shoulder surfing y no valida que el CVV tenga 3-4 dígitos.

**Evidencia / Reproducción:**  
```jsx
<input type="text" name="cvv" value={cvv} onChange={handleChange} />
```

**Sugerencia de Remediación:**  
Cambiar a `type="password"`, agregar `maxLength={4}` y validar regex de 3-4 dígitos.

---

#### [F-004] Datos de tarjeta en console.log en modo desarrollo

| Campo        | Valor       |
|:-------------|:------------|
| Severidad    | `low`       |
| Categoría    | security    |
| Ubicación    | `src/components/PaymentForm.tsx:95` |
| Confianza    | `alta`      |

**Descripción:**  
En modo desarrollo, los datos completos de la tarjeta se imprimen en consola.

**Evidencia / Reproducción:**  
```jsx
if (process.env.NODE_ENV === 'development') {
  console.log('Payment data:', formData);  // Incluye cardNumber y CVV
}
```

**Sugerencia de Remediación:**  
Eliminar el log o redactar campos sensibles antes de imprimir.

---

## Maker — Tabla de Disposición

**Modelo:** claude-sonnet-4 | **Fecha:** 2025-07-16T14:00:00  
**Commit/Tag:** `fix/xss-payment-20250716`

### Cambios Ejecutados

| # Hallazgo | Acción Tomada          | Archivo(s) Modificado(s) | Notas |
|:-----------|:-----------------------|:-------------------------|:------|
| F-001      | Implementado tal cual  | `src/components/PaymentForm.tsx` | Reemplazado `dangerouslySetInnerHTML` por `<span>{errorMsg}</span>` |
| F-003      | Implementado con variación | `src/components/PaymentForm.tsx` | Usado `inputMode="numeric"` + `pattern` en lugar de `type="password"` para mejor UX móvil |
| F-004      | Implementado tal cual  | `src/components/PaymentForm.tsx` | Log eliminado completamente, no solo redactado |

### Cambios Rechazados

| # Hallazgo | Motivo de Rechazo (Refutación Técnica)                   |
|:-----------|:---------------------------------------------------------|
| F-002      | Falso positivo: el backend usa SameSite=Strict en la cookie de sesión y valida el header Origin. Verificado en `backend/middleware/csrf.ts:15`. El framework ya protege contra CSRF sin token explícito. Evidencia: test `test/csrf.spec.ts` pasa con request cross-origin bloqueada. |

### Cambios Parciales

| # Hallazgo | Qué se implementó | Qué quedó pendiente y por qué |
|:-----------|:-------------------|:------------------------------|
| — | — | — |

### Hallazgos Emergentes

| # Hallazgo | Severidad | Descripción | Acción Tomada |
|:-----------|:----------|:------------|:--------------|
| E-001      | `medium`  | Al eliminar `dangerouslySetInnerHTML`, se descubrió que el componente hermano `PaymentConfirmation.tsx:23` usa el mismo patrón con datos del backend. No estaba en el alcance del Checker pero es el mismo vector. | Corregido en el mismo commit. |

### Registro de Validación

| Validación | Comando / Método | Resultado | Notas |
|:-----------|:-----------------|:----------|:------|
| Build      | `npm run build`  | ✅ Pass   | |
| Tests      | `npm test`       | ✅ Pass   | 47 tests, 0 failures |
| Linter     | `eslint src/`    | ✅ Pass   | 0 warnings |
| Integridad | `grep -n "dangerouslySetInnerHTML" src/components/` | ✅ Pass | 0 ocurrencias restantes |

### Notas del Maker

El hallazgo emergente E-001 refuerza la utilidad de buscar patrones similares al corregir un hallazgo. El rechazo de F-002 está soportado por el test existente — si el framework cambia su política de CSRF en el futuro, el test lo detectaría.

---

## Judge — Evaluación Periódica

**Modelo:** claude-opus-4 | **Fecha:** 2025-08-01T09:00:00  
**Lote de revisión:** batch-2025Q3-001

### Calificaciones

| Agente   | Puntuación | Evaluación |
|:---------|:-----------|:-----------|
| Checker  | 88/100     | Reporte exhaustivo con evidencia reproducible. El hallazgo F-002 fue un falso positivo legítimo — el Checker no tenía visibilidad del middleware CSRF, lo cual es esperado dado que solo analiza el componente aislado. Severidades bien calibradas. |
| Maker    | 92/100     | Implementaciones precisas sin regresiones. Rechazo de F-002 bien argumentado con referencia al test existente. Hallazgo emergente E-001 demuestra buen criterio — buscó patrones similares proactivamente. Gate de validación completo. |

### Veredicto

**REVIEWED-OK**

### Diagnóstico

El Checker generó un falso positivo (F-002) pero fue un error razonable dado su alcance limitado al componente. No indica sesgo ni patrón de inflación de severidad. El Maker rechazó con evidencia sólida (test existente + configuración del middleware). El hallazgo emergente E-001 reveló un punto ciego legítimo — el Checker auditó solo PaymentForm pero el patrón inseguro existía en un componente hermano. Esto sugiere que futuras auditorías de seguridad deberían incluir componentes relacionados en el alcance. No se detectó desviación arquitectónica. El diff es limpio y coherente con los hallazgos documentados.

### Líneas Rectoras

1. En auditorías de seguridad de componentes React, incluir componentes hermanos y padres en el alcance — los patrones inseguros se replican.
2. Mantener el test de CSRF (`test/csrf.spec.ts`) como parte de la suite obligatoria — es la defensa contra regresiones si el framework cambia su política.

---

<!-- Fin del documento. No editar debajo de esta línea. -->
<!-- FORGE / TRIBUNAL Protocol v2.0 -->
