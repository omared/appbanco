import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SessionService } from './session.service';

describe('HU-04 · SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('FR-014: clear() limpia token, clienteId y marca la sesión como cerrada', () => {
    service.iniciar('cli-001', 'token-123');

    service.clear('manual');

    expect(service.session()).toEqual({ token: null, clienteId: null, estado: 'cerrada' });
  });

  it('escenario 3: expira automáticamente tras 5 minutos de inactividad', () => {
    service.iniciar('cli-001', 'token-123');
    const expiraciones: void[] = [];
    service.onExpiracionPorInactividad.subscribe(() => expiraciones.push(undefined));

    vi.advanceTimersByTime(5 * 60 * 1000 + 1);

    expect(service.session().estado).toBe('expirada');
    expect(expiraciones.length).toBe(1);
  });

  it('registrarActividad() reinicia el temporizador de inactividad', () => {
    service.iniciar('cli-001', 'token-123');

    vi.advanceTimersByTime(4 * 60 * 1000);
    service.registrarActividad();
    vi.advanceTimersByTime(4 * 60 * 1000);

    expect(service.session().estado).toBe('activa');
  });
});
