export type TipoProducto = 'cuenta' | 'tarjeta' | 'credito';

export interface ProductoCliente {
  id: string;
  tipo: TipoProducto;
  nombre: string;
  saldoOCupoDisponible: number;
}

export type EstadoProductoParaCliente = 'disponible' | 'ya_lo_tienes' | 'en_tramite';

export interface ProductoCatalogo {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  montoMinimo: number;
  montoMaximo: number;
  estadoParaCliente: EstadoProductoParaCliente;
}
