# Contract: Autenticación y Sesión (`AuthService`, `SessionService`)

Consumido por: `features/login`, `core/auth/auth.guard.ts`, `features/home` (logout).
Respaldado hoy por: `core/mock-api/mock-backend.service.ts` (ver `research.md` §1).

## `AuthService.login(documento: string, password: string): Observable<LoginResult>`

```ts
interface LoginResult {
  ok: boolean;
  cliente?: Cliente;       // presente solo si ok === true
  token?: string;          // presente solo si ok === true
  error?: 'credenciales_invalidas' | 'usuario_bloqueado';
  bloqueadoHasta?: string; // ISO 8601, presente solo si error === 'usuario_bloqueado'
}
```

- **Éxito** (HU-01 escenario 1): `ok: true`, `cliente` y `token` presentes → el componente navega a
  `/home`.
- **Credenciales inválidas** (HU-01 escenario 2): `ok: false`, `error: 'credenciales_invalidas'` →
  mostrar "Usuario o contraseña incorrectos".
- **Usuario bloqueado** (HU-01 escenario 3): `ok: false`, `error: 'usuario_bloqueado'`,
  `bloqueadoHasta` → mostrar "Usuario bloqueado, contacte a su banco / recupere su clave".
- Validación de campos vacíos (HU-01 escenario 4) ocurre en el componente (Reactive Forms) antes de
  llamar a este método.

## `AuthService.logout(motivo: 'manual' | 'inactividad'): void`

- Invoca `SessionService.clear()` (limpia token/caché — FR-014) y navega a `/login`, reemplazando
  el historial para que "atrás" no vuelva al Home (FR-011).
- `motivo: 'inactividad'` es invocado internamente por `SessionService` cuando expira el
  temporizador; el componente que escucha el evento de expiración muestra "Tu sesión ha expirado
  por inactividad" (FR-013).

## `SessionService`

```ts
interface SessionSnapshot {
  token: string | null;
  clienteId: string | null;
  estado: 'activa' | 'expirada' | 'cerrada';
}
```

- `session: Signal<SessionSnapshot>` — estado reactivo consumido por `auth.guard.ts` y componentes
  que necesiten saber si hay sesión activa.
- `clear(): void` — único punto de limpieza de token/caché (Principio I de la constitución).
- `registrarActividad(): void` — reinicia el temporizador de inactividad; se llama desde un
  listener global de eventos de usuario (click/keydown/touchstart), solo en navegador.
- `onExpiracionPorInactividad: Observable<void>` — emite cuando se cumplen los 5 minutos sin
  actividad, para que el componente activo muestre el mensaje antes/al redirigir.
