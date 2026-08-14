# Data Model: Gestión de Sesión y Productos Bancarios

Modelos de datos consumidos por los componentes/servicios Angular. Reflejan la forma de los DTOs
que expondría el mock (`core/mock-api/`) y, más adelante, un core bancario real — ver
`contracts/`.

## Cliente

Representa al cliente autenticado.

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `string` | Identificador único del cliente. |
| `documento` | `string` | Documento de identidad, usado para login (FR-001). |
| `nombre` | `string` | Nombre completo, precargado en formularios (FR-019). |
| `celular` | `string` | Precargado en formularios. |
| `correo` | `string` | Precargado en formularios. |
| `intentosFallidos` | `number` | Contador de intentos de login fallidos consecutivos (FR-003). |
| `bloqueadoHasta` | `string \| null` (ISO 8601) | `null` si no está bloqueado; timestamp de fin de bloqueo (30 min tras 3 fallos). |

**Reglas de validación**: `documento` y `nombre` no vacíos. `intentosFallidos` se reinicia a `0` en
login exitoso o al expirar `bloqueadoHasta`.

## Sesión

Estado de la sesión activa en el cliente Angular (no persiste en backend).

| Campo | Tipo | Notas |
|-------|------|-------|
| `token` | `string \| null` | Token de sesión en memoria; `null` si no hay sesión activa. |
| `clienteId` | `string \| null` | Referencia al `Cliente` autenticado. |
| `ultimaActividad` | `number` (epoch ms) | Actualizado en cada interacción del usuario; base para el cierre por inactividad (FR-013). |
| `estado` | `'activa' \| 'expirada' \| 'cerrada'` | `'expirada'` = cierre automático por inactividad; `'cerrada'` = cierre manual. |

**Transiciones de estado**: `activa → expirada` (temporizador de inactividad de 5 min sin
interacción) · `activa → cerrada` (logout manual confirmado) · `expirada/cerrada → activa` (nuevo
login exitoso, con `token`/`clienteId` nuevos).

## Producto Financiero (del cliente)

Producto que el cliente ya posee, mostrado en el Home (HU-02).

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `string` | Identificador único del producto del cliente. |
| `tipo` | `'cuenta' \| 'tarjeta' \| 'credito' \| ...` | Tipo de producto. |
| `nombre` | `string` | Nombre visible (p. ej. "Cuenta de Ahorros"). |
| `saldoOCupoDisponible` | `number` | Valor monetario mostrado en el Home. |
| `saldoVisible` | `boolean` | Estado de UI (mostrado/oculto con `***`); no persiste entre sesiones (FR-010). |

## Producto Disponible (catálogo)

Producto que el cliente puede solicitar (HU-03a).

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `string` | Identificador del producto ofertado (p. ej. `credito-rotativo`). |
| `nombre` | `string` | Nombre del producto. |
| `descripcion` | `string` | Descripción breve. |
| `icono` | `string` | Referencia a ícono/imagen (Material icon name o ruta de asset). |
| `montoMinimo` / `montoMaximo` | `number` | Rango válido de monto/cupo solicitado (FR-020), específico por producto. |
| `estadoParaCliente` | `'disponible' \| 'ya_lo_tienes' \| 'en_tramite'` | Determina si se puede iniciar una nueva solicitud (FR-016 y edge case de solicitud duplicada). |

## Solicitud de Producto

Trámite de adquisición de un Producto Disponible (HU-03b, HU-03c).

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` / `radicado` | `string` | Número de radicado único y trazable (FR-025), asignado solo al enviar exitosamente. |
| `clienteId` | `string` | Cliente solicitante. |
| `productoId` | `string` | Producto solicitado (`Producto Disponible.id`). |
| `datosPersonales` | `{ nombre, documento, celular, correo }` | Precargados de `Cliente`, de solo lectura (FR-019). |
| `datosSocioeconomicos` | `{ ingresos: number, ocupacion: string, egresos: number, montoSolicitado: number }` | Validados como numéricos y dentro de rango (FR-020). |
| `aceptaTerminos` | `boolean` | Debe ser `true` para habilitar envío (FR-022). |
| `aceptaAutorizacionCentralRiesgo` | `boolean` | Debe ser `true` para habilitar envío (FR-022). |
| `estado` | `'borrador' \| 'en_estudio' \| 'aprobado' \| 'rechazado'` | Toda solicitud enviada válida inicia en `'en_estudio'` (FR-024); no hay decisión en línea. |
| `fechaEnvio` | `string` (ISO 8601) | Momento del envío exitoso. |

**Reglas de validación**: `aceptaTerminos` y `aceptaAutorizacionCentralRiesgo` obligatorios en
`true` antes de habilitar envío. `datosSocioeconomicos.montoSolicitado` debe estar entre
`montoMinimo` y `montoMaximo` del `Producto Disponible` correspondiente.

**Transiciones de estado**: `borrador → en_estudio` (envío exitoso, FR-025) · `borrador` se
descarta sin transición si el cliente abandona sin enviar (ver Assumptions en `spec.md`) ·
`en_estudio → aprobado | rechazado` (fuera de alcance de esta épica: lo resuelve el core bancario;
la consulta en "Mis solicitudes" solo lee el estado, FR-027).

## Relaciones

```text
Cliente 1───* Producto Financiero (del cliente)
Cliente 1───* Solicitud de Producto
Producto Disponible 1───* Solicitud de Producto
Cliente 1───1 Sesión (activa a la vez)
```
