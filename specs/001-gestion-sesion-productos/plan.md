# Implementation Plan: Gestión de Sesión y Productos Bancarios

**Branch**: `001-gestion-sesion-productos` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-gestion-sesion-productos/spec.md`

## Summary

Construir, dentro de la SPA/SSR Angular ya generada (`appbanco`), el flujo completo de sesión y
productos de la app bancaria: login (HU-01), Home con productos/saldos (HU-02), cierre de sesión
manual y por inactividad (HU-04), y el flujo de adquisición de un nuevo producto en tres pasos —
catálogo (HU-03a), formulario de solicitud (HU-03b) y envío/confirmación con consulta de estado
(HU-03c). No existe un core bancario real disponible en este repositorio; el enfoque técnico usa
una **capa de datos simulada (mock) en memoria**, detrás de interfaces de servicio con la misma
forma que tendría una integración real, para poder sustituirla después sin tocar los componentes.

## Technical Context

**Language/Version**: TypeScript ~6.0.2, Angular 22 (standalone components, signals)

**Primary Dependencies**: `@angular/core`, `@angular/router`, `@angular/forms` (Reactive Forms),
`@angular/material` + `@angular/cdk`, `@angular/platform-browser` (`provideClientHydration`),
`@angular/ssr` + Express (servidor ya existente en `src/server.ts`), RxJS.

**Storage**: N/A (no hay base de datos ni core bancario real en este repositorio). Estado de
cliente/productos/solicitudes servido por una capa mock en memoria (ver `research.md`), pensada
para reemplazarse por llamadas HTTP reales sin cambiar los componentes que la consumen.

**Testing**: Vitest vía `@angular/build:unit-test` (builder ya configurado), `TestBed` de
`@angular/core/testing`. Un `describe`/test por escenario Gherkin de cada HU (Principio III de la
constitución).

**Target Platform**: Web (navegador + SSR con hidratación), diseño responsive mobile-first (la
épica original es "app móvil", entregada aquí como SPA Angular con Material).

**Project Type**: Aplicación web única (frontend Angular con SSR); no aplica "Option 2/3" del
template porque no hay un backend propio que desarrollar en este repo — la Express app existente
sólo sirve la SPA y, opcionalmente, endpoints mock (ver `research.md`).

**Performance Goals**: Carga percibida del Home < 2s (SC-002); login → Home en < 10s en condiciones
normales de red (SC-001).

**Constraints**: Compatibilidad con hidratación SSR (nada de acceso directo a `window`/`localStorage`
sin guardas de plataforma); cumplimiento OWASP Mobile básico (sin credenciales en logs, limpieza de
token/caché al cerrar sesión); accesibilidad WCAG AA en login/Home/formulario (Principio IV).

**Scale/Scope**: 1 aplicación cliente, 6 historias de usuario, ~7 pantallas/vistas (login, Home,
catálogo, formulario de solicitud, confirmación, mis solicitudes, diálogo de confirmación de
logout).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Notas |
|-----------|------------|-------|
| I. Seguridad por Defecto | **PASS** | Login sin OTP y bloqueo/expiración con tiempos fijos ya decididos en el spec; `SessionService` centraliza limpieza de token/caché (un solo punto, no disperso). |
| II. Angular Idiomático y Standalone-First | **PASS** | Todos los componentes nuevos son standalone, usan `signal()` para estado local, y Angular Material para UI. Sin `NgModule`. |
| III. Trazabilidad Spec→Test | **PASS** | `tasks.md` (siguiente comando) deberá generar un test por escenario Gherkin; se planifica un spec por componente/servicio nombrado con su HU-XX. |
| IV. Accesibilidad y Rendimiento | **PASS** | Uso de variables `--mat-sys-*`, componentes Material accesibles por defecto, lazy loading de rutas de features para mantener el Home ligero. |
| V. Simplicidad (YAGNI) | **PASS** | Sin NgRx ni librerías de estado adicionales (signals + servicios bastan para este alcance); mock en memoria en vez de backend real; no se implementan los puntos que el spec dejó fuera (OTP, score en línea, firma digital). |

Sin violaciones — no se requiere la tabla de Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-gestion-sesion-productos/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── app.ts / app.html / app.scss / app.routes.ts / app.config.ts   # ya existentes
│   ├── core/
│   │   ├── auth/
│   │   │   ├── auth.service.ts          # login, logout, estado de bloqueo (HU-01, HU-04)
│   │   │   ├── auth.guard.ts            # CanActivateFn para rutas autenticadas
│   │   │   └── auth.service.spec.ts
│   │   ├── session/
│   │   │   ├── session.service.ts       # token/caché en memoria, expiración por inactividad (HU-04)
│   │   │   └── session.service.spec.ts
│   │   └── mock-api/
│   │       ├── mock-backend.service.ts  # simula latencia/errores del core bancario
│   │       ├── clientes.fixtures.ts
│   │       ├── productos.fixtures.ts
│   │       └── solicitudes.fixtures.ts
│   ├── features/
│   │   ├── login/
│   │   │   ├── login.page.ts/.html/.scss/.spec.ts        # HU-01
│   │   ├── home/
│   │   │   ├── home.page.ts/.html/.scss/.spec.ts         # HU-02
│   │   │   └── components/product-card/                 # tarjeta de producto + ocultar saldo
│   │   ├── products-catalog/
│   │   │   ├── products-catalog.page.ts/.html/.scss/.spec.ts   # HU-03a
│   │   ├── product-request/
│   │   │   ├── product-request-form.page.ts/.html/.scss/.spec.ts  # HU-03b
│   │   │   └── product-request-confirmation.page.ts/.html/.scss/.spec.ts  # HU-03c
│   │   └── my-requests/
│   │       ├── my-requests.page.ts/.html/.scss/.spec.ts  # HU-03c (consulta de estado)
│   └── shared/
│       ├── components/
│       │   ├── retry-banner/            # mensaje de error + botón "Reintentar" (HU-02, HU-03a, HU-03c)
│       │   └── confirm-dialog/          # diálogo "¿Seguro que deseas...? Sí/No" (HU-04)
│       └── models/
│           ├── cliente.model.ts
│           ├── producto.model.ts
│           └── solicitud.model.ts
└── server.ts              # ya existente; sin endpoints propios (mock vive en el cliente)
```

**Structure Decision**: aplicación Angular única dentro de `src/app/`, organizada por *feature
folders* (`core/`, `features/<HU>/`, `shared/`) en vez de por tipo técnico, siguiendo el patrón
`Option 1` del template adaptado a Angular. No se crea un proyecto `backend/` separado: el mock de
"core bancario" vive dentro del propio Angular app (`core/mock-api/`) para no construir
infraestructura de servidor que el alcance actual no requiere (Principio V).

## Complexity Tracking

*No aplica — el Constitution Check no reportó violaciones.*
