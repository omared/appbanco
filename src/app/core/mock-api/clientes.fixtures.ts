import { Cliente } from '../../shared/models/cliente.model';

export interface ClienteFixture {
  cliente: Cliente;
  password: string;
  intentosFallidos: number;
  bloqueadoHasta: string | null;
}

/** Documento/contraseña de prueba: cliente con productos activos. */
export const CLIENTE_CON_PRODUCTOS: ClienteFixture = {
  cliente: {
    id: 'cli-001',
    documento: '1000000001',
    nombre: 'Ana María Gómez',
    celular: '3001234567',
    correo: 'ana.gomez@example.com',
  },
  password: 'Banco2026!',
  intentosFallidos: 0,
  bloqueadoHasta: null,
};

/** Documento/contraseña de prueba: cliente sin productos activos (HU-02 escenario 2). */
export const CLIENTE_SIN_PRODUCTOS: ClienteFixture = {
  cliente: {
    id: 'cli-002',
    documento: '1000000002',
    nombre: 'Carlos Ruiz',
    celular: '3007654321',
    correo: 'carlos.ruiz@example.com',
  },
  password: 'Banco2026!',
  intentosFallidos: 0,
  bloqueadoHasta: null,
};

export const CLIENTES_FIXTURES: ClienteFixture[] = [CLIENTE_CON_PRODUCTOS, CLIENTE_SIN_PRODUCTOS];
