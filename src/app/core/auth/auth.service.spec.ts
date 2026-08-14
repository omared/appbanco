import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService, LoginResult } from './auth.service';
import { CLIENTE_CON_PRODUCTOS } from '../mock-api/clientes.fixtures';
import { SessionService } from '../session/session.service';

describe('HU-01 · Login', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    service = TestBed.inject(AuthService);
    CLIENTE_CON_PRODUCTOS.intentosFallidos = 0;
    CLIENTE_CON_PRODUCTOS.bloqueadoHasta = null;
  });

  it('escenario 1: login exitoso redirige con cliente y token', async () => {
    const result = await new Promise((resolve) =>
      service.login(CLIENTE_CON_PRODUCTOS.cliente.documento, CLIENTE_CON_PRODUCTOS.password).subscribe(resolve),
    );

    expect(result).toMatchObject({ ok: true, cliente: { id: CLIENTE_CON_PRODUCTOS.cliente.id } });
  });

  it('escenario 2: credenciales incorrectas muestra error sin bloquear', async () => {
    const result = await new Promise<LoginResult>((resolve) =>
      service.login(CLIENTE_CON_PRODUCTOS.cliente.documento, 'clave-incorrecta').subscribe(resolve),
    );

    expect(result.ok).toBe(false);
    expect(result.error).toBe('credenciales_invalidas');
  });

  it('escenario 3: bloquea al cuarto intento fallido consecutivo', async () => {
    for (let i = 0; i < 3; i++) {
      await new Promise((resolve) =>
        service.login(CLIENTE_CON_PRODUCTOS.cliente.documento, 'clave-incorrecta').subscribe(resolve),
      );
    }

    const cuartoIntento = await new Promise<LoginResult>((resolve) =>
      service.login(CLIENTE_CON_PRODUCTOS.cliente.documento, 'clave-incorrecta').subscribe(resolve),
    );

    expect(cuartoIntento.error).toBe('usuario_bloqueado');
    expect(cuartoIntento.bloqueadoHasta).toBeDefined();
  });

  it('documento no registrado responde credenciales inválidas', async () => {
    const result = await new Promise<LoginResult>((resolve) =>
      service.login('0000000000', 'cualquiera').subscribe(resolve),
    );

    expect(result.ok).toBe(false);
    expect(result.error).toBe('credenciales_invalidas');
  });
});

describe('HU-04 · AuthService.logout', () => {
  it('FR-011/FR-014: limpia la sesión y redirige a /login reemplazando el historial', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const service = TestBed.inject(AuthService);
    const session = TestBed.inject(SessionService);
    const router = TestBed.inject(Router);
    const clearSpy = vi.spyOn(session, 'clear');
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');

    service.logout('manual');

    expect(clearSpy).toHaveBeenCalledWith('manual');
    expect(navigateSpy).toHaveBeenCalledWith('/login', { replaceUrl: true });
  });
});
