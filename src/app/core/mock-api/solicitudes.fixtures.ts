import { SolicitudResumen } from '../../shared/models/solicitud.model';

export const SOLICITUDES_CLIENTE: Record<string, SolicitudResumen[]> = {
  'cli-001': [
    {
      radicado: 'RAD-2026-0001',
      productoNombre: 'Tarjeta de Crédito',
      estado: 'en_estudio',
      fechaEnvio: '2026-07-20T10:00:00.000Z',
    },
  ],
  'cli-002': [],
};
