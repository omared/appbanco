export interface DatosPersonales {
  nombre: string;
  documento: string;
  celular: string;
  correo: string;
}

export type EstadoSolicitud = 'en_estudio' | 'aprobado' | 'rechazado';

export interface SolicitudInput {
  clienteId: string;
  productoId: string;
  ingresos: number;
  ocupacion: string;
  egresos: number;
  montoSolicitado: number;
  aceptaTerminos: boolean;
  aceptaAutorizacionCentralRiesgo: boolean;
}

export interface SolicitudResumen {
  radicado: string;
  productoNombre: string;
  estado: EstadoSolicitud;
  fechaEnvio: string;
}
