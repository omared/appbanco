# Research: Gestión de Sesión y Productos Bancarios

## 0. Desviaciones detectadas durante `/speckit-implement`

- **Render mode SSR**: `app.routes.server.ts` traía `RenderMode.Prerender` por defecto (generado
  por el CLI). Todas las rutas de esta feature dependen de sesión/cliente en tiempo de ejecución,
  así que se cambió a `RenderMode.Server` (SSR bajo demanda) para toda la app — el prerender
  estático no aplica a contenido autenticado.
- **Sin `@angular/animations`**: se evaluó `provideAnimationsAsync()` para las transiciones de
  `MatDialog`, pero el único paquete compatible con la versión de `@angular/core` instalada está
  deprecado en Angular 22. Se optó por no instalar animaciones: `MatDialog` funciona igual (sin
  transición de entrada/salida), evitando una dependencia deprecada por una mejora puramente
  cosmética (Principio V, YAGNI).

## 1. Backend / core bancario

**Decision**: Simular el core bancario con una capa mock en memoria (`core/mock-api/`), expuesta
detrás de servicios Angular (`AuthService`, `ProductsService`, `RequestsService`) que devuelven
`Observable`s con latencia simulada (`delay()`) y errores forzables (`throwError`) para poder
probar los escenarios de error de cada HU (HU-02 escenario 3, HU-03a escenario 4, HU-03c
escenario 2).

**Rationale**: El repositorio no tiene backend propio ni acceso a un core bancario real; construir
uno excede el alcance (Principio V, YAGNI). Los servicios exponen la misma forma de contrato
(`Observable<T>`, mismos DTOs) que tendría una integración HTTP real, documentada en `contracts/`,
de modo que sustituir el mock por `HttpClient` contra un backend real después sea un cambio
localizado a la implementación interna del servicio, no a sus consumidores.

**Alternatives considered**:
- *Endpoints reales en `src/server.ts` (Express)*: descartado por ahora — añadiría persistencia y
  lógica de servidor no solicitada por ninguna HU; se puede migrar a esto sin cambiar los
  contratos de los servicios Angular.
- *`HttpClient` + `HttpInterceptor` que intercepta y responde con mocks*: válido, pero añade
  complejidad de configuración de interceptores para el mismo resultado que un servicio mock
  directo; se prefiere el servicio mock directo por simplicidad.

## 2. Gestión de estado

**Decision**: `signal()` y `computed()` en servicios `providedIn: 'root'` para estado compartido
(sesión, cliente autenticado, productos); sin librería de estado adicional (sin NgRx/NGXS).

**Rationale**: Alcance de 6 HUs y estado mayormente local a cada feature; signals ya es el idioma
establecido en el proyecto (Principio II) y evita la sobrecarga conceptual de un store global
(Principio V).

**Alternatives considered**: NgRx — descartado por complejidad injustificada para este alcance.

## 3. Sesión, expiración por inactividad y limpieza de token

**Decision**: `SessionService` centraliza: token en memoria (no en `localStorage`, para reducir
superficie de robo de sesión vía XSS), un temporizador de inactividad (`setTimeout` reiniciado en
eventos `click`/`keydown`/`touchstart` a nivel de documento) fijado en 5 minutos, y un método único
`clear()` invocado tanto en logout manual como automático. El temporizador solo se arma en el
navegador (`afterNextRender` / guarda `isPlatformBrowser`) para no romper SSR/hidratación.

**Rationale**: Cumple FR-013/FR-014 y el Principio I (un solo punto de limpieza, no disperso).
Evitar `localStorage` para el token reduce riesgo OWASP Mobile M9 (almacenamiento inseguro) en la
medida de lo razonable para una SPA.

**Alternatives considered**: Guardar el token en `localStorage`/`sessionStorage` — más simple pero
peor postura de seguridad; descartado dado el Principio I (seguridad por defecto).

## 4. Bloqueo de usuario por intentos fallidos

**Decision**: `AuthService` cuenta intentos fallidos por usuario en el mock (`clientes.fixtures.ts`
simula el estado "bloqueado hasta `<timestamp>`"); tras 3 fallos consecutivos, bloquea 30 minutos
(FR-003), reseteando el contador en un login exitoso.

**Rationale**: Ya definido en el spec (FR-003); se documenta aquí solo la ubicación de la lógica
(en el mock, para que sea sustituible por la respuesta real del core bancario después).

## 5. Formularios y validación (HU-03b)

**Decision**: Angular Reactive Forms (`FormGroup`/`FormControl` + `Validators`), con validadores
custom simples para rangos numéricos de monto/ingresos por producto. Campos de datos personales
como `FormControl` deshabilitados (precargados, no editables — FR-019).

**Rationale**: Reactive Forms es el enfoque idiomático de Angular para formularios con validación
compleja y es más testeable (sin depender del DOM) que Template-driven forms.

**Alternatives considered**: Template-driven forms — descartado, menos testeable para las reglas de
validación numérica/rangos requeridas.

## 6. Accesibilidad y rendimiento

**Decision**: Rutas de features cargadas con `loadComponent` (lazy) para que el bundle inicial del
login/Home se mantenga pequeño; componentes interactivos custom (ícono de ojo para ocultar saldo,
diálogo de confirmación) con atributos ARIA explícitos (`aria-pressed`, `role="dialog"`) además de
los componentes Material ya accesibles por defecto.

**Rationale**: Cumple Principio IV (Home < 2s, accesibilidad) sin introducir herramientas nuevas.

## 7. Testing

**Decision**: Un archivo `*.spec.ts` por componente/servicio, con `describe` prefijado por HU (p.
ej. `describe('HU-01 · Login', ...)`), cubriendo cada escenario Gherkin de `spec.md` como un `it`
independiente. Mocks de `AuthService`/`ProductsService`/`RequestsService` inyectados vía `TestBed`
para aislar componentes de la capa mock real en tests de componente.

**Rationale**: Satisface el Principio III (Trazabilidad Spec→Test) de forma directa y verificable.

## Resumen de NEEDS CLARIFICATION restantes

Ninguno — todas las decisiones técnicas de esta fase tienen una elección concreta y su
justificación. Los puntos de negocio pendientes (OTP futuro, score en línea futuro, firma digital
futura) quedan fuera de alcance por decisión ya tomada en `spec.md` (Assumptions), no por
ambigüedad técnica.
