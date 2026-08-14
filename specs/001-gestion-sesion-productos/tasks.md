---

description: "Task list template for feature implementation"
---

# Tasks: Gestión de Sesión y Productos Bancarios

**Input**: Design documents from `/specs/001-gestion-sesion-productos/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: incluidos y obligatorios — el Principio III de la constitución ("Trazabilidad
Spec→Test") exige un test por escenario Gherkin de cada HU antes de darla por implementada.

**Organization**: Tasks agrupadas por historia de usuario (US1–US6, en el orden de prioridad de
`spec.md`), para que cada una sea implementable y probable de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario a la que pertenece (US1..US6)
- Todas las rutas de archivo son relativas a `src/app/` salvo que se indique lo contrario

## Path Conventions

Aplicación Angular única (`src/app/`), organizada por *feature folders* — ver "Project Structure"
en `plan.md`. No hay `backend/` ni `frontend/` separados.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Estructura de carpetas y modelos compartidos, sin lógica todavía.

- [x] T001 Crear la estructura de carpetas de `plan.md` (`core/auth`, `core/session`,
      `core/products`, `core/requests`, `core/mock-api`, `features/login`, `features/home`,
      `features/products-catalog`, `features/product-request`, `features/my-requests`,
      `shared/components`, `shared/models`) dentro de `src/app/`
- [x] T002 [P] Crear interfaces de modelo (`Cliente`, `ProductoCliente`, `ProductoCatalogo`,
      `SolicitudProducto`, `SessionSnapshot`) en `src/app/shared/models/*.model.ts`, según
      `data-model.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura que TODAS las historias necesitan antes de poder empezar.

**⚠️ CRITICAL**: Ninguna historia de usuario puede implementarse hasta completar esta fase.

- [x] T003 Implementar simulación de latencia/errores del core bancario en
      `src/app/core/mock-api/mock-backend.service.ts` (helpers `delay()`/`throwError()` — ver
      `research.md` §1)
- [x] T004 [P] Crear fixtures de clientes (incl. uno bloqueado y uno sin productos) en
      `src/app/core/mock-api/clientes.fixtures.ts`
- [x] T005 [P] Crear fixtures de productos del cliente y catálogo (con estados `disponible` /
      `ya_lo_tienes` / `en_tramite`) en `src/app/core/mock-api/productos.fixtures.ts`
- [x] T006 [P] Crear fixtures de solicitudes (incl. una ya "en_estudio") en
      `src/app/core/mock-api/solicitudes.fixtures.ts`
- [x] T007 Implementar `SessionService` (señal `session`, `registrarActividad()`, `clear()`) en
      `src/app/core/session/session.service.ts`, token solo en memoria — ver
      `contracts/auth.contract.md`
- [x] T008 Implementar `auth.guard.ts` (`CanActivateFn` basado en `SessionService.session`) en
      `src/app/core/auth/auth.guard.ts`
- [x] T009 Configurar el esqueleto de `src/app/app.routes.ts`: ruta pública `/login` por defecto,
      resto de rutas protegidas con `authGuard` y `loadComponent` (lazy) — ver `research.md` §6

**Checkpoint**: Fundación lista — las historias de usuario pueden empezar.

---

## Phase 3: User Story 1 - Inicio de sesión (HU-01) (Priority: P1) 🎯 MVP

**Goal**: Un cliente registrado puede iniciar sesión y llegar al Home; ver credenciales
incorrectas, bloqueo tras 3 fallos y validación de campos vacíos.

**Independent Test**: Con la fundación lista, ingresar credenciales válidas/ inválidas/ vacías
contra los fixtures de `clientes.fixtures.ts` y verificar redirección, mensajes de error y bloqueo.

### Tests for User Story 1 ⚠️

> Escribir estos tests PRIMERO y verificar que fallan antes de implementar.

- [x] T010 [P] [US1] Test de `AuthService.login` cubriendo los 4 escenarios de HU-01 (éxito,
      credenciales incorrectas, bloqueo al 4º intento, reset de intentos) en
      `src/app/core/auth/auth.service.spec.ts`
- [x] T011 [P] [US1] Test de componente `LoginPage` (validación de campos vacíos, mensaje de error,
      redirección a `/home` en éxito) en `src/app/features/login/login.page.spec.ts`

### Implementation for User Story 1

- [x] T012 [US1] Implementar `AuthService.login()` con conteo de intentos fallidos y bloqueo de 30
      min (FR-001 a FR-003) en `src/app/core/auth/auth.service.ts` (depende de T003, T004)
- [x] T013 [US1] Implementar `LoginPage` (Reactive Form, ícono mostrar/ocultar contraseña,
      mensajes de validación) en `src/app/features/login/login.page.ts` + `.html` + `.scss`
      (depende de T012)
- [x] T014 [US1] Registrar la ruta pública `/login` (por defecto) en `src/app/app.routes.ts`
      (depende de T009, T013)

**Checkpoint**: US1 funcional e independientemente probable.

---

## Phase 4: User Story 2 - Home con productos y saldos (HU-02) (Priority: P2)

**Goal**: Un cliente autenticado ve sus productos y saldos, con estados de vacío, error+reintentar
y ocultar/mostrar saldo.

**Independent Test**: Con sesión activa (fixture), cargar `/home` y verificar listado, estado
vacío, estado de error con "Reintentar", y el toggle de saldo oculto/visible.

### Tests for User Story 2 ⚠️

- [x] T015 [P] [US2] Test de `ProductsService.getProductosDelCliente` (con productos, vacío, error)
      en `src/app/core/products/products.service.spec.ts`
- [x] T016 [P] [US2] Test de componente `HomePage` cubriendo los 4 escenarios de HU-02 en
      `src/app/features/home/home.page.spec.ts`

### Implementation for User Story 2

- [x] T017 [P] [US2] Implementar `ProductsService.getProductosDelCliente()` en
      `src/app/core/products/products.service.ts` (depende de T003, T005)
- [x] T018 [P] [US2] Crear componente compartido `RetryBanner` (mensaje + botón "Reintentar",
      reutilizable por US2/US4/US6) en `src/app/shared/components/retry-banner/retry-banner.ts` +
      `.html` + `.scss`
- [x] T019 [US2] Crear `ProductCardComponent` (saldo/cupo + ícono de ojo → `***`) en
      `src/app/features/home/components/product-card/product-card.ts` + `.html` + `.scss`
- [x] T020 [US2] Implementar `HomePage` (listado, estado sin productos, estado error+retry,
      integrando `ProductCardComponent` y `RetryBanner`) en `src/app/features/home/home.page.ts` +
      `.html` + `.scss` (depende de T017, T018, T019)
- [x] T021 [US2] Registrar la ruta protegida `/home` con `authGuard` en `src/app/app.routes.ts`
      (depende de T008, T009, T020)

**Checkpoint**: US1 + US2 funcionan de forma independiente y encadenada (login → Home).

---

## Phase 5: User Story 3 - Cierre de sesión (HU-04) (Priority: P3)

**Goal**: El cliente puede cerrar sesión manualmente (con confirmación) o automáticamente por
inactividad, limpiando siempre el token/caché.

**Independent Test**: Con sesión activa, cerrar sesión manualmente y verificar el diálogo de
confirmación, la redirección y que "atrás" no vuelve al Home; simular 5 min de inactividad y
verificar el cierre automático.

### Tests for User Story 3 ⚠️

- [x] T022 [P] [US3] Test de `SessionService` (temporizador de inactividad de 5 min, `clear()`
      limpia token/caché) en `src/app/core/session/session.service.spec.ts` (HU-04 escenario 3,
      FR-013/FR-014)
- [x] T023 [P] [US3] Test de logout manual + diálogo de confirmación + bloqueo de navegación
      "atrás" (HU-04 escenarios 1 y 2) en
      `src/app/shared/components/confirm-dialog/confirm-dialog.spec.ts` y
      `src/app/features/home/home.page.spec.ts`

### Implementation for User Story 3

- [x] T024 [US3] Implementar `AuthService.logout(motivo)` invocando `SessionService.clear()` y
      redirigiendo a `/login` reemplazando el historial (FR-011, FR-014) en
      `src/app/core/auth/auth.service.ts` (depende de T012)
- [x] T025 [US3] Implementar el temporizador de inactividad en `SessionService` (listener global de
      `click`/`keydown`/`touchstart`, solo en navegador vía `afterNextRender`) en
      `src/app/core/session/session.service.ts` (depende de T007)
- [x] T026 [P] [US3] Crear componente compartido `ConfirmDialog` (Sí/No) en
      `src/app/shared/components/confirm-dialog/confirm-dialog.ts` + `.html` + `.scss`
- [x] T027 [US3] Integrar botón "Cerrar sesión" + `ConfirmDialog` + suscripción a expiración por
      inactividad en `HomePage` (`src/app/features/home/home.page.ts`, depende de T020, T024,
      T025, T026)

**Checkpoint**: Flujo MVP completo (login → Home → logout) funcional, según la priorización del
Product Owner.

---

## Phase 6: User Story 4 - Catálogo de productos disponibles (HU-03a) (Priority: P4)

**Goal**: El cliente ve el catálogo de productos que puede adquirir, con productos ya adquiridos o
en trámite marcados, y puede seleccionar uno o reintentar ante error.

**Independent Test**: Desde el Home, abrir el catálogo y verificar listado, marca "Ya lo tienes",
marca "Solicitud en trámite", selección que navega al formulario, y estado de error+retry.

### Tests for User Story 4 ⚠️

- [x] T028 [P] [US4] Test de `ProductsService.getCatalogo` (estados `disponible`/`ya_lo_tienes`/
      `en_tramite`, error) en `src/app/core/products/products.service.spec.ts`
- [x] T029 [P] [US4] Test de componente `ProductsCatalogPage` cubriendo los 4 escenarios de HU-03a
      en `src/app/features/products-catalog/products-catalog.page.spec.ts`

### Implementation for User Story 4

- [x] T030 [US4] Implementar `ProductsService.getCatalogo()` en
      `src/app/core/products/products.service.ts` (depende de T017, T005)
- [x] T031 [US4] Implementar `ProductsCatalogPage` (listado con nombre/ícono/descripción, estados
      "Ya lo tienes"/"Solicitud en trámite", `RetryBanner` en error) en
      `src/app/features/products-catalog/products-catalog.page.ts` + `.html` + `.scss` (depende de
      T018, T030)
- [x] T032 [US4] Conectar el botón "Adquirir producto" / "+" del `HomePage` para navegar a
      `/productos` en `src/app/features/home/home.page.ts` (depende de T020, T031)
- [x] T033 [US4] Registrar la ruta protegida `/productos` en `src/app/app.routes.ts` (depende de
      T008, T031)

**Checkpoint**: Catálogo navegable de forma independiente desde el Home.

---

## Phase 7: User Story 5 - Formulario de solicitud de producto (HU-03b) (Priority: P5)

**Goal**: El cliente diligencia el formulario de solicitud con datos precargados, validación
numérica por rango, resaltado de errores y checkboxes obligatorios de T&C/autorización.

**Independent Test**: Abrir el formulario para un producto de prueba y verificar precarga de datos
personales de solo lectura, validación de rangos, resaltado de errores, y bloqueo de avance sin
checkboxes — sin necesidad de enviar la solicitud todavía.

### Tests for User Story 5 ⚠️

- [x] T034 [P] [US5] Test de `RequestsService.getDatosPrecargados` en
      `src/app/core/requests/requests.service.spec.ts`
- [x] T035 [P] [US5] Test de componente `ProductRequestFormPage` cubriendo los 5 escenarios de
      HU-03b (precarga, validación numérica/rangos, resaltado de errores, checkboxes obligatorios,
      habilitación del botón continuar) en
      `src/app/features/product-request/product-request-form.page.spec.ts`

### Implementation for User Story 5

- [x] T036 [P] [US5] Implementar `RequestsService.getDatosPrecargados()` en
      `src/app/core/requests/requests.service.ts` (depende de T003)
- [x] T037 [US5] Implementar `ProductRequestFormPage` (Reactive Form: datos personales de solo
      lectura, datos socioeconómicos con validadores de rango por producto, checkboxes de T&C y
      autorización de central de riesgo, botón "Continuar" habilitado solo si todo es válido) en
      `src/app/features/product-request/product-request-form.page.ts` + `.html` + `.scss` (depende
      de T036, T030 para `montoMinimo`/`montoMaximo` del producto)
- [x] T038 [US5] Registrar la ruta protegida `/productos/:productoId/solicitud` en
      `src/app/app.routes.ts` (depende de T008, T037)

**Checkpoint**: Formulario alcanzable y validable de forma independiente.

---

## Phase 8: User Story 6 - Envío y confirmación de la solicitud (HU-03c) (Priority: P6)

**Goal**: El cliente envía la solicitud completa y recibe confirmación con radicado, con manejo de
error que conserva los datos, y puede consultar el estado en "Mis solicitudes".

**Independent Test**: Enviar un formulario ya válido (fixture) y verificar el mensaje de
confirmación con radicado, el manejo de error de envío conservando los datos, y la consulta
posterior del estado por número de radicado.

### Tests for User Story 6 ⚠️

- [x] T039 [P] [US6] Test de `RequestsService.enviarSolicitud` (éxito con radicado, error de
      comunicación) en `src/app/core/requests/requests.service.spec.ts`
- [x] T040 [P] [US6] Test de `RequestsService.getMisSolicitudes` en
      `src/app/core/requests/requests.service.spec.ts`
- [x] T041 [P] [US6] Test de `ProductRequestConfirmationPage` (mensaje + radicado, error conserva
      datos diligenciados) en
      `src/app/features/product-request/product-request-confirmation.page.spec.ts`
- [x] T042 [P] [US6] Test de `MyRequestsPage` (listado por radicado y estado) en
      `src/app/features/my-requests/my-requests.page.spec.ts`

### Implementation for User Story 6

- [x] T043 [US6] Implementar `RequestsService.enviarSolicitud()` y `getMisSolicitudes()` en
      `src/app/core/requests/requests.service.ts` (depende de T036, T006)
- [x] T044 [US6] Conectar el envío desde `ProductRequestFormPage` (botón "Enviar solicitud",
      manejo de error conservando los datos diligenciados) en
      `src/app/features/product-request/product-request-form.page.ts` (depende de T037, T043)
- [x] T045 [US6] Implementar `ProductRequestConfirmationPage` (mensaje de éxito + radicado) en
      `src/app/features/product-request/product-request-confirmation.page.ts` + `.html` + `.scss`
      (depende de T043)
- [x] T046 [US6] Implementar `MyRequestsPage` (listado de solicitudes con estado por radicado) en
      `src/app/features/my-requests/my-requests.page.ts` + `.html` + `.scss` (depende de T043)
- [x] T047 [US6] Registrar las rutas protegidas `/solicitudes/confirmacion` y `/mis-solicitudes` en
      `src/app/app.routes.ts` (depende de T008, T045, T046)

**Checkpoint**: Flujo completo de adquisición de producto (catálogo → formulario → envío →
consulta) funcional end-to-end.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Mejoras transversales que afectan a varias historias.

- [x] T048 [P] Verificar accesibilidad (atributos ARIA, contraste vía `--mat-sys-*`) en
      login/Home/formulario, según Principio IV de la constitución
- [x] T049 [P] Ejecutar `npx ng lint` y corregir los hallazgos
- [x] T050 Ejecutar `npx ng test --watch=false` y confirmar que cada escenario Gherkin de
      `spec.md` tiene su `it` correspondiente (Principio III)
- [x] T051 Ejecutar manualmente los 10 escenarios de `quickstart.md` end-to-end
- [x] T052 Revisar compatibilidad SSR/hidratación (sin acceso directo a `window`/`localStorage`
      fuera de guardas de plataforma) en `SessionService` y componentes con íconos interactivos

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — puede iniciar de inmediato.
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA todas las historias.
- **User Stories (Phase 3-8)**: todas dependen de Foundational.
  - Pueden avanzar en paralelo si hay varios desarrolladores, o en orden de prioridad
    (US1 → US2 → US3 → US4 → US5 → US6, que es también el orden de dependencia funcional real).
- **Polish (Phase 9)**: depende de las historias que se hayan completado.

### User Story Dependencies

- **US1 (P1 - Login)**: solo depende de Foundational.
- **US2 (P2 - Home)**: depende de Foundational; funcionalmente requiere sesión iniciada (US1) para
  probarse en el navegador, aunque sus tests unitarios pueden aislarse con un fixture de sesión.
- **US3 (P3 - Logout)**: depende de Foundational y de `AuthService`/`HomePage` creados en US1/US2.
- **US4 (P4 - Catálogo)**: depende de Foundational y de `HomePage` (US2) para el punto de entrada
  "Adquirir producto".
- **US5 (P5 - Formulario)**: depende de US4 (llega desde la selección del catálogo).
- **US6 (P6 - Envío)**: depende de US5 (envía el formulario ya construido).

### Within Each User Story

- Tests primero, deben fallar antes de implementar.
- Modelos/servicios antes que componentes de página.
- Componentes de página antes que el registro de rutas.
- Historia completa y verificada antes de pasar a la siguiente.

### Parallel Opportunities

- Todas las tareas `[P]` de Setup y Foundational pueden correr en paralelo entre sí.
- Los tests `[P]` de cada historia pueden escribirse en paralelo.
- US4, US5 y US6 son secuenciales entre sí (catálogo → formulario → envío) y no paralelizables
  entre ellas, aunque sí lo son respecto a US2/US3 si hay más de un desarrollador.

---

## Parallel Example: User Story 1

```bash
# Lanzar juntos los tests de la Historia 1:
Task: "Test de AuthService.login en src/app/core/auth/auth.service.spec.ts"
Task: "Test de componente LoginPage en src/app/features/login/login.page.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 solamente)

1. Completar Fase 1: Setup
2. Completar Fase 2: Foundational (crítico — bloquea todas las historias)
3. Completar Fase 3: User Story 1 (Login)
4. **DETENER y VALIDAR**: probar login de forma independiente
5. Demo si está listo

### Incremental Delivery (orden recomendado por el Product Owner)

1. Setup + Foundational → fundación lista
2. US1 (Login) → probar independientemente → demo (MVP mínimo de autenticación)
3. US2 (Home) → probar independientemente → demo (MVP funcional: login + visualización)
4. US3 (Logout) → probar independientemente → demo (**MVP completo del PO**: login → home →
   logout)
5. US4 (Catálogo) → US5 (Formulario) → US6 (Envío) → cada una probada y demostrada antes de seguir
   con la siguiente (flujo de adquisición, iterado después del MVP)

### Parallel Team Strategy

Con más de un desarrollador, tras completar Foundational:

- Developer A: US1 → US3 (login y logout comparten `AuthService`)
- Developer B: US2 (Home), en paralelo, integrando con US1 cuando esté listo
- Developer C: US4 → US5 → US6 (flujo de adquisición completo, secuencial internamente)

---

## Notes

- `[P]` = archivos distintos, sin dependencias pendientes entre sí.
- La etiqueta `[USn]` mapea cada tarea a su historia de usuario para trazabilidad.
- Cada historia debe quedar completable y probable de forma independiente.
- Verificar que los tests fallan antes de implementar (Principio III, TDD implícito).
- Detenerse en cada checkpoint para validar la historia de forma aislada antes de continuar.
