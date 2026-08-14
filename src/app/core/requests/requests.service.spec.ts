import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { RequestsService } from './requests.service';
import { CLIENTE_CON_PRODUCTOS } from '../mock-api/clientes.fixtures';
import { SolicitudInput } from '../../shared/models/solicitud.model';

describe('HU-03b · RequestsService.getDatosPrecargados', () => {
  it('escenario 1: devuelve los datos personales del cliente autenticado', async () => {
    const service = TestBed.inject(RequestsService);

    const datos = await new Promise((resolve) =>
      service.getDatosPrecargados(CLIENTE_CON_PRODUCTOS.cliente.id).subscribe(resolve),
    );

    expect(datos).toEqual({
      nombre: CLIENTE_CON_PRODUCTOS.cliente.nombre,
      documento: CLIENTE_CON_PRODUCTOS.cliente.documento,
      celular: CLIENTE_CON_PRODUCTOS.cliente.celular,
      correo: CLIENTE_CON_PRODUCTOS.cliente.correo,
    });
  });
});

describe('HU-03c · RequestsService.enviarSolicitud', () => {
  const solicitud: SolicitudInput = {
    clienteId: 'cli-001',
    productoId: 'credito-rotativo',
    ingresos: 2_000_000,
    ocupacion: 'Empleado',
    egresos: 500_000,
    montoSolicitado: 1_000_000,
    aceptaTerminos: true,
    aceptaAutorizacionCentralRiesgo: true,
  };

  it('escenario 1: envío exitoso devuelve un radicado único', async () => {
    const service = TestBed.inject(RequestsService);

    const resultado = await new Promise((resolve) => service.enviarSolicitud(solicitud).subscribe(resolve));

    expect(resultado).toMatchObject({ ok: true });
    expect((resultado as { radicado: string }).radicado).toMatch(/^RAD-2026-\d{4}$/);
  });

  it('escenario 2: error de comunicación no lanza, responde ok:false', async () => {
    const service = TestBed.inject(RequestsService);

    const resultado = await new Promise((resolve) =>
      service.enviarSolicitud(solicitud, { fail: true }).subscribe(resolve),
    );

    expect(resultado).toEqual({ ok: false, error: 'error_comunicacion' });
  });
});

describe('HU-03c · RequestsService.getMisSolicitudes', () => {
  it('escenario 3: devuelve las solicitudes registradas del cliente por radicado', async () => {
    const service = TestBed.inject(RequestsService);

    const solicitudes = await new Promise((resolve) =>
      service.getMisSolicitudes(CLIENTE_CON_PRODUCTOS.cliente.id).subscribe(resolve),
    );

    expect((solicitudes as { radicado: string }[]).length).toBeGreaterThan(0);
  });
});
