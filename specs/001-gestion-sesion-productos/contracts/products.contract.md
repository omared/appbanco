# Contract: Productos (`ProductsService`)

Consumido por: `features/home` (HU-02), `features/products-catalog` (HU-03a).
Respaldado hoy por: `core/mock-api/mock-backend.service.ts` (ver `research.md` §1).

## `ProductsService.getProductosDelCliente(clienteId: string): Observable<ProductoCliente[]>`

```ts
interface ProductoCliente {
  id: string;
  tipo: 'cuenta' | 'tarjeta' | 'credito';
  nombre: string;
  saldoOCupoDisponible: number;
}
```

- Lista vacía → el componente Home muestra "Aún no tienes productos" + botón de adquirir (FR-008).
- Error simulado (latencia/`throwError` del mock) → el componente Home muestra "No pudimos cargar
  tu información, intenta nuevamente" + botón "Reintentar" (FR-009), reintentando esta misma
  llamada.
- El estado `saldoVisible` (mostrar/ocultar) es puramente de UI (FR-010) y no se persiste vía este
  contrato.

## `ProductsService.getCatalogo(clienteId: string): Observable<ProductoCatalogo[]>`

```ts
interface ProductoCatalogo {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  montoMinimo: number;
  montoMaximo: number;
  estadoParaCliente: 'disponible' | 'ya_lo_tienes' | 'en_tramite';
}
```

- `estadoParaCliente !== 'disponible'` → el componente catálogo deshabilita la selección y muestra
  la etiqueta correspondiente ("Ya lo tienes" / "Solicitud en trámite") en vez de permitir una
  solicitud duplicada (FR-016, edge case de solicitud en trámite).
- Error simulado → "No pudimos cargar los productos disponibles" + botón "Reintentar" (FR-018).
- Selección de un producto con `estadoParaCliente === 'disponible'` → el componente navega a
  `/productos/:productoId/solicitud` (FR-017).
