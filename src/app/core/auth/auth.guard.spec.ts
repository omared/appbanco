import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { describe, it, expect } from 'vitest';
import { authGuard } from './auth.guard';
import { SessionService } from '../session/session.service';

describe('HU-02/HU-04 · authGuard', () => {
  function setup(estado: 'activa' | 'cerrada' | 'expirada') {
    TestBed.configureTestingModule({});
    const session = TestBed.inject(SessionService);
    if (estado === 'activa') {
      session.iniciar('cli-001', 'token-123');
    } else if (estado === 'expirada') {
      session.iniciar('cli-001', 'token-123');
      session.clear('inactividad');
    }
    return { router: TestBed.inject(Router) };
  }

  it('permite el acceso cuando la sesión está activa', () => {
    setup('activa');

    const resultado = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    );

    expect(resultado).toBe(true);
  });

  it('FR-011: redirige a /login cuando no hay sesión activa (cerrada)', () => {
    const { router } = setup('cerrada');

    const resultado = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    ) as UrlTree;

    expect(router.serializeUrl(resultado)).toBe('/login');
  });

  it('FR-011: redirige a /login cuando la sesión expiró por inactividad', () => {
    const { router } = setup('expirada');

    const resultado = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    ) as UrlTree;

    expect(router.serializeUrl(resultado)).toBe('/login');
  });
});
