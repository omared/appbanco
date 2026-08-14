import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockBackendService } from './mock-backend.service';

describe('MockBackendService', () => {
  let service: MockBackendService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockBackendService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('emite el valor recibido tras la latencia simulada por defecto', () => {
    let resultado: string | undefined;
    service.respond('ok').subscribe((valor) => (resultado = valor));

    expect(resultado).toBeUndefined();
    vi.advanceTimersByTime(400);

    expect(resultado).toBe('ok');
  });

  it('respeta una latencia personalizada', () => {
    let resultado: string | undefined;
    service.respond('ok', { latencyMs: 1000 }).subscribe((valor) => (resultado = valor));

    vi.advanceTimersByTime(400);
    expect(resultado).toBeUndefined();

    vi.advanceTimersByTime(600);
    expect(resultado).toBe('ok');
  });

  it('emite un error cuando fail está activo', () => {
    let error: unknown;
    service.respond('ok', { fail: true }).subscribe({ error: (err) => (error = err) });

    vi.advanceTimersByTime(400);

    expect((error as Error).message).toBe('mock_backend_error');
  });
});
