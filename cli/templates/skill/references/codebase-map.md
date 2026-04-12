# Mapa del Codebase — {Nombre del Proyecto}

<!-- ================================================================
     INSTRUCCIONES:
     1. Registra aquí los componentes, funciones, hooks y utilidades
        que creas durante el desarrollo
     2. Antes de crear algo nuevo, verifica que no exista ya en este archivo
     3. Actualiza este archivo al final de cada sesión de trabajo
     4. Marca duplicados cuando los detectes para eliminarlos después
     ================================================================ -->

Registro central de elementos del sistema para detectar y prevenir duplicidades.

---

## Funciones

| Nombre | Descripción | Ubicación | Estado |
|:-------|:------------|:----------|:-------|
| `sanitizeInput()` | Limpia input de usuario antes de procesar | `src/utils/sanitize.ts` | ✅ Canónico |
| `formatDate()` | Formato de fecha consistente en toda la app | `src/utils/helpers.ts` | ✅ Canónico |

<!-- Agrega funciones nuevas aquí. Si detectas una función duplicada,
     márcala como ⚠️ Duplicado y registra cuál es la versión canónica. -->

---

## Componentes

| Nombre | Descripción | Ubicación | Estado |
|:-------|:------------|:----------|:-------|
| `DataTable` | Tabla genérica con filtros y paginación | `src/components/common/DataTable.tsx` | ✅ Canónico |

<!-- Registra componentes reutilizables. Si un componente existe aquí,
     NO crear uno nuevo — importar el existente. -->

---

## Hooks / Utilidades

| Nombre | Descripción | Ubicación | Estado |
|:-------|:------------|:----------|:-------|
| `useAuth()` | Hook de autenticación y permisos | `src/hooks/useAuth.ts` | ✅ Canónico |

<!-- Hooks y utilidades compartidas. Son los elementos que más
     se reimplementan por accidente — mantener esta lista actualizada. -->

---

## Variables / Constantes Globales

| Nombre | Descripción | Ubicación | Estado |
|:-------|:------------|:----------|:-------|
| `API_BASE_URL` | URL base del backend | `src/config.ts` | ✅ Canónico |

<!-- Variables y constantes que se usan en múltiples archivos.
     Duplicar constantes causa bugs silenciosos cuando se actualiza una pero no la otra. -->

---

## Estadísticas

- Total elementos registrados: 0
- Duplicados detectados: 0
- Duplicados eliminados: 0

<!-- Actualiza estos contadores periódicamente. Una tasa alta de
     duplicados detectados indica que los agentes no están consultando
     este archivo antes de implementar. -->

---

<!-- FORGE v1.0 — Mapa del Codebase -->
