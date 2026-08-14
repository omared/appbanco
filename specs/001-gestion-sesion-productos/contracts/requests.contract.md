# Contract: Solicitudes de Producto (`RequestsService`)

Consumido por: `features/product-request` (HU-03b, HU-03c), `features/my-requests` (HU-03c).
Respaldado hoy por: `core/mock-api/mock-backend.service.ts` (ver `research.md` §1).

## `RequestsService.getDatosPrecargados(clienteId: string): Observable<DatosPersonales>`

```ts
interface DatosPersonales {
  nombre: string;
  documento: string;
  celular: string;
  correo: string;
}
```

- Usado para precargar y bloquear (solo lectura) los campos de datos personales del formulario
  (FR-019).

## `RequestsService.enviarSolicitud(solicitud: SolicitudInput): Observable<EnvioResult>`

```ts
interface SolicitudInput {
  clienteId: string;
  productoId: string;
  ingresos: number;
  ocupacion: string;
  egresos: number;
  montoSolicitado: number;
  aceptaTerminos: boolean;
  aceptaAutorizacionCentralRiesgo: boolean;
}

interface EnvioResult {
  ok: boolean;
  radicado?: string;       // presente solo si ok === true
  error?: 'error_comunicacion';
}
```

- **Éxito** (HU-03c escenario 1): `ok: true`, `radicado` presente → mostrar "Solicitud enviada
  exitosamente" + el radicado (FR-025). La solicitud queda internamente en estado `'en_estudio'`
  (FR-024) — este contrato no expone un veredicto inmediato.
- **Error de comunicación** (HU-03c escenario 2): `ok: false`, `error: 'error_comunicacion'` →
  mostrar "No pudimos procesar tu solicitud, intenta nuevamente"; el componente conserva los
  valores ya diligenciados en el formulario (FR-026) sin volver a llamar a
  `getDatosPrecargados`.
- El componente valida `aceptaTerminos`/`aceptaAutorizacionCentralRiesgo` **antes** de invocar este
  método (FR-022, FR-023); el servicio no reevalúa esas reglas de UI.

## `RequestsService.getMisSolicitudes(clienteId: string): Observable<SolicitudResumen[]>`

```ts
interface SolicitudResumen {
  radicado: string;
  productoNombre: string;
  estado: 'en_estudio' | 'aprobado' | 'rechazado';
  fechaEnvio: string; // ISO 8601
}
```

- Usado por `features/my-requests` para listar el histórico de solicitudes del cliente y su estado
  actual por radicado (FR-027).
