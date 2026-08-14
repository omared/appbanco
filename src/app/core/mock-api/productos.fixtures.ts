import { ProductoCatalogo, ProductoCliente } from '../../shared/models/producto.model';

export const PRODUCTOS_CLIENTE: Record<string, ProductoCliente[]> = {
  'cli-001': [
    { id: 'prod-cta-001', tipo: 'cuenta', nombre: 'Cuenta de Ahorros', saldoOCupoDisponible: 2_450_000 },
    { id: 'prod-tc-001', tipo: 'tarjeta', nombre: 'Tarjeta de Crédito Clásica', saldoOCupoDisponible: 1_800_000 },
  ],
  'cli-002': [],
};

export const CATALOGO_PRODUCTOS: ProductoCatalogo[] = [
  {
    id: 'credito-rotativo',
    nombre: 'Crédito Rotativo',
    descripcion: 'Cupo de libre inversión disponible cuando lo necesites.',
    icono: 'account_balance_wallet',
    montoMinimo: 500_000,
    montoMaximo: 20_000_000,
    estadoParaCliente: 'disponible',
  },
  {
    id: 'tarjeta-credito',
    nombre: 'Tarjeta de Crédito',
    descripcion: 'Tarjeta de crédito con cupo revolvente y beneficios exclusivos.',
    icono: 'credit_card',
    montoMinimo: 500_000,
    montoMaximo: 15_000_000,
    estadoParaCliente: 'ya_lo_tienes',
  },
  {
    id: 'cdt',
    nombre: 'CDT',
    descripcion: 'Certificado de depósito a término con tasa fija.',
    icono: 'savings',
    montoMinimo: 1_000_000,
    montoMaximo: 100_000_000,
    estadoParaCliente: 'disponible',
  },
];
