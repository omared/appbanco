export type EstadoSesion = 'activa' | 'expirada' | 'cerrada';

export interface SessionSnapshot {
  token: string | null;
  clienteId: string | null;
  estado: EstadoSesion;
}
