# Especificación de Requerimientos — {Nombre del Proyecto}

<!-- ================================================================
     INSTRUCCIONES:
     1. Reemplaza {Nombre del Proyecto} con el nombre real
     2. Llena la descripción general
     3. Completa "Qué es / Qué no es"
     4. Agrega un bloque de Módulo por cada componente del sistema
     5. Define las reglas irrompibles de tu proyecto
     6. Borra este comentario y los ejemplos pre-llenados cuando tengas tu contenido
     ================================================================ -->

## Descripción General

{Descripción en un párrafo de qué es el proyecto, qué problema resuelve, y para quién.}

---

## Qué es / Qué no es

### Qué es
- {Definición positiva del producto}
- {Otra definición}

### Qué no es
- {Qué explícitamente NO hace}
- {Otra exclusión}

---

## Módulos

<!-- Repite este bloque por cada módulo del sistema.
     Cada módulo tiene: requerimientos funcionales, reglas de negocio, exclusiones.
     Los RFs usan el formato RF-[MÓDULO]-[NÚMERO]: RF-AUTH-01, RF-CHAT-01, etc. -->

### Módulo 1. Autenticación

<!-- EJEMPLO PRE-LLENADO — reemplaza con tu contenido real -->

#### Requerimientos Funcionales

**RF-AUTH-01** El sistema debe permitir registro de usuarios mediante email y contraseña.

**RF-AUTH-02** El sistema debe verificar la dirección de email antes de activar la cuenta.

**RF-AUTH-03** El sistema debe soportar autenticación con proveedores externos (Google, GitHub).

#### Reglas de Negocio

- Las cuentas deshabilitadas se desactivan lógicamente, nunca se eliminan físicamente.

#### Exclusiones

- No se incluye autenticación biométrica en esta versión.

---

### Módulo 2. {Nombre del módulo}

#### Requerimientos Funcionales

**RF-XXX-01** {Descripción del requerimiento.}

**RF-XXX-02** {Descripción del requerimiento.}

#### Reglas de Negocio

- {Regla de negocio del módulo.}

#### Exclusiones

- {Qué queda fuera del alcance de este módulo.}

---

<!-- Agrega más módulos repitiendo el bloque anterior -->

## Reglas Irrompibles

<!-- Estas son las reglas que NINGUNA implementación puede violar,
     independientemente del módulo. Son los invariantes del proyecto. -->

1. {Ejemplo: Nunca eliminar datos físicamente. Siempre deshabilitación lógica.}
2. {Ejemplo: Nunca responder con información que no venga de las fuentes del sistema.}
3. {Agrega las tuyas}

---

<!-- FORGE v1.0 — Especificación de Requerimientos -->
