<!--
Sync Impact Report
==================
Version change: TEMPLATE → 1.0.0 (initial ratification)
Modified principles: n/a (first concrete version, all placeholders filled)
Added sections:
  - Core Principles: I. Seguridad por Defecto (NON-NEGOTIABLE), II. Angular Idiomático y Standalone-First,
    III. Trazabilidad Spec→Test (NON-NEGOTIABLE), IV. Accesibilidad y Rendimiento, V. Simplicidad (YAGNI)
  - Requisitos No Funcionales
  - Flujo de Desarrollo (Spec-Driven)
  - Governance
Removed sections: none (template placeholders only)
Deferred TODOs: none
Templates requiring alignment:
  - .specify/templates/plan-template.md: no changes required (reads constitution at runtime)
  - .specify/templates/spec-template.md: no changes required
  - .specify/templates/tasks-template.md: no changes required
-->

# appbanco Constitution

## Core Principles

### I. Seguridad por Defecto (NON-NEGOTIABLE)

Toda funcionalidad que toque credenciales, sesión, datos personales o financieros DEBE seguir
buenas prácticas de OWASP Mobile Top 10. Reglas concretas:

- Las contraseñas y datos sensibles NUNCA se registran en logs, ni se persisten en texto plano.
- El cierre de sesión (manual o por inactividad) DEBE limpiar tokens, caché local y estado en
  memoria del usuario autenticado.
- Los formularios que soliciten productos financieros DEBEN validar entradas en el cliente y
  tratar toda respuesta del backend/core bancario como no confiable (revalidar, no asumir éxito).
- Cualquier decisión de seguridad aún no definida por el negocio (p. ej. MFA/OTP, biometría,
  tiempo exacto de bloqueo o de expiración de sesión) se implementa detrás de un punto de
  configuración único y explícito, nunca hardcodeada en múltiples lugares.

Rationale: es una aplicación bancaria; un fallo de seguridad no es un bug más, es un incidente.
Definir la regla una vez y de forma explícita evita que quede diluida entre componentes.

### II. Angular Idiomático y Standalone-First

El código DEBE seguir los idiomas de Angular 22 ya establecidos en este proyecto: componentes
standalone (sin NgModule), `signal()` para estado en lugar de patrones manuales de detección de
cambios, y Angular Material para toda UI en vez de HTML/CSS a mano cuando exista un componente
Material equivalente. Los componentes nuevos DEBEN ser compatibles con hidratación de SSR
(`provideClientHydration`): sin manipulación directa del DOM que difiera entre servidor y cliente.

Rationale: mantener consistencia con la base ya generada (`CLAUDE.md`) evita mezclar estilos y
reduce la carga cognitiva al revisar código entre historias de usuario.

### III. Trazabilidad Spec→Test (NON-NEGOTIABLE)

Cada escenario Gherkin (DADO/CUANDO/ENTONCES) definido en una historia de usuario DEBE tener un
test correspondiente en Vitest antes de darse por implementado. El nombre del test o su
`describe` DEBE referenciar el identificador de la historia (p. ej. `HU-01`, `HU-03b`) para poder
rastrear cobertura. No se cierra una tarea de `/speckit-tasks` sin su test asociado en verde.

Rationale: las historias de usuario del banco ya vienen con criterios de aceptación explícitos;
ignorarlos y solo "programar a ojo" pierde la garantía de negocio que el analista funcional dejó
por escrito.

### IV. Accesibilidad y Rendimiento

La pantalla Home DEBE cargar en menos de 2 segundos en condiciones normales de red (percibido,
no solo TTFB). Los componentes interactivos (botones, checkboxes, iconos de mostrar/ocultar)
DEBEN ser operables por teclado y tener etiquetas ARIA adecuadas, apoyándose en las variables de
sistema de Material (`--mat-sys-*`) para mantener contraste y tema consistentes en claro/oscuro.

Rationale: recomendación explícita del Product Owner en las historias de usuario (performance
Home <2s, accesibilidad); en banca, la accesibilidad no es opcional.

### V. Simplicidad (YAGNI)

No se construyen abstracciones, flags de features, ni generalizaciones para historias de usuario
que aún no existen. Cada HU se implementa con el alcance mínimo que satisface sus criterios de
aceptación; los puntos "pendientes de refinamiento" señalados en las historias (p. ej. tipo de
autenticación fuerte, flujo de formulario por producto) se dejan explícitamente fuera hasta que el
negocio los defina, en vez de anticiparse con código especulativo.

Rationale: las propias historias de usuario documentan explícitamente sus pendientes; construir
de más antes de esa definición genera retrabajo, no ahorro.

## Requisitos No Funcionales

- **Seguridad**: cifrado en tránsito, cumplimiento OWASP Mobile Top 10, sin datos sensibles en
  `localStorage`/`sessionStorage` sin cifrar.
- **Rendimiento**: carga de Home < 2 s; toda llamada a backend/core bancario debe tener manejo de
  error con opción de "Reintentar" (ver HU-02 escenario 3, HU-03a escenario 4).
- **Disponibilidad**: los componentes deben degradar con gracia si el core bancario no responde
  (mensajes de error definidos por la historia correspondiente, nunca una pantalla en blanco).
- **Accesibilidad**: WCAG AA como objetivo mínimo para pantallas de login, home y formularios.

## Flujo de Desarrollo (Spec-Driven)

Este proyecto usa Spec Kit (`/speckit-*`) como flujo obligatorio para nueva funcionalidad:
`/speckit-constitution` → `/speckit-specify` → `/speckit-clarify` (si quedan ambigüedades) →
`/speckit-plan` → `/speckit-tasks` → `/speckit-implement`. Las historias de usuario entregadas por
el Product Owner son la fuente de verdad funcional; toda spec generada debe poder trazarse de
vuelta a un HU-XX. El orden de MVP sugerido por el PO (HU-01 → HU-02 → HU-04 → HU-03) se respeta
salvo decisión explícita en contrario.

## Governance

Esta constitución prevalece sobre cualquier práctica ad-hoc o preferencia individual de estilo.
Las enmiendas requieren: (1) justificación escrita del cambio, (2) actualización de esta misma
sección con el nuevo número de versión siguiendo semver (MAJOR: retiro o redefinición incompatible
de un principio; MINOR: nuevo principio o sección; PATCH: aclaración o corrección de redacción), y
(3) revisión de que las plantillas de `/speckit-plan`, `/speckit-tasks` y `/speckit-specify` sigan
siendo compatibles. Toda revisión de código o plan técnico debe verificar cumplimiento de los
principios I–V antes de aprobarse; cualquier excepción debe documentarse explícitamente en el plan
correspondiente con su motivo.

**Version**: 1.0.0 | **Ratified**: 2026-07-29 | **Last Amended**: 2026-07-29
