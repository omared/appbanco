import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { describe, it, expect, vi } from 'vitest';
import { LoginPage } from './login.page';
import { AuthService } from '../../core/auth/auth.service';

function setup(
  loginResult: unknown,
  options?: { queryParams?: Record<string, string>; login$?: Observable<unknown> },
) {
  const authServiceStub = {
    login: vi.fn().mockReturnValue(options?.login$ ?? of(loginResult)),
  };
  TestBed.configureTestingModule({
    imports: [LoginPage],
    providers: [
      provideRouter([]),
      { provide: AuthService, useValue: authServiceStub },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { queryParamMap: convertToParamMap(options?.queryParams ?? {}) },
        },
      },
    ],
  });
  const fixture = TestBed.createComponent(LoginPage);
  fixture.detectChanges();
  return { fixture, authServiceStub };
}

describe('HU-01 · LoginPage', () => {
  it('escenario 4: no envía y marca los campos si están vacíos', () => {
    const { fixture, authServiceStub } = setup({ ok: true });

    fixture.componentInstance.submit();

    expect(authServiceStub.login).not.toHaveBeenCalled();
    expect(fixture.componentInstance.form.controls.documento.touched).toBe(true);
    expect(fixture.componentInstance.form.controls.password.touched).toBe(true);
  });

  it('escenario 2: muestra mensaje de credenciales incorrectas', () => {
    const { fixture } = setup({ ok: false, error: 'credenciales_invalidas' });
    fixture.componentInstance.form.setValue({ documento: '123', password: 'malo' });

    fixture.componentInstance.submit();

    expect(fixture.componentInstance.errorMensaje()).toBe('Usuario o contraseña incorrectos');
  });

  it('escenario 3: muestra mensaje de usuario bloqueado', () => {
    const { fixture } = setup({ ok: false, error: 'usuario_bloqueado' });
    fixture.componentInstance.form.setValue({ documento: '123', password: 'malo' });

    fixture.componentInstance.submit();

    expect(fixture.componentInstance.errorMensaje()).toBe(
      'Usuario bloqueado, contacte a su banco / recupere su clave',
    );
  });

  it('escenario 1: navega a /home en login exitoso', () => {
    const { fixture } = setup({ ok: true, cliente: { id: 'cli-001' }, token: 't' });
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.componentInstance.form.setValue({ documento: '123', password: 'bueno' });

    fixture.componentInstance.submit();

    expect(navigateSpy).toHaveBeenCalledWith('/home');
  });

  it('togglePasswordVisible() alterna la visibilidad de la contraseña', () => {
    const { fixture } = setup({ ok: true });

    expect(fixture.componentInstance.passwordVisible()).toBe(false);
    fixture.componentInstance.togglePasswordVisible();
    expect(fixture.componentInstance.passwordVisible()).toBe(true);
    fixture.componentInstance.togglePasswordVisible();
    expect(fixture.componentInstance.passwordVisible()).toBe(false);
  });

  it('el botón de mostrar/ocultar contraseña alterna el tipo del input en el DOM', () => {
    const { fixture } = setup({ ok: true });
    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[formcontrolname="password"]',
    );
    const toggleButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[aria-label="Mostrar u ocultar contraseña"]',
    );

    expect(input.type).toBe('password');
    toggleButton.click();
    fixture.detectChanges();

    expect(input.type).toBe('text');
  });

  it('muestra el mensaje de sesión expirada por inactividad cuando llega motivo=inactividad', () => {
    const { fixture } = setup({ ok: true }, { queryParams: { motivo: 'inactividad' } });

    const mensaje: HTMLElement = fixture.nativeElement.querySelector('.login-page__info');

    expect(mensaje.textContent).toContain('Tu sesión ha expirado por inactividad');
  });

  it('no muestra el mensaje de sesión expirada sin el query param', () => {
    const { fixture } = setup({ ok: true });

    const mensaje = fixture.nativeElement.querySelector('.login-page__info');

    expect(mensaje).toBeNull();
  });

  it('escenario 4 (DOM): resalta los campos requeridos vacíos con mat-error', () => {
    const { fixture } = setup({ ok: true });

    fixture.componentInstance.submit();
    fixture.detectChanges();

    const errores = fixture.nativeElement.querySelectorAll('mat-error');
    expect(errores.length).toBe(2);
  });

  it('escenario 2 (DOM): pinta el mensaje de credenciales incorrectas en el DOM', () => {
    const { fixture } = setup({ ok: false, error: 'credenciales_invalidas' });
    fixture.componentInstance.form.setValue({ documento: '123', password: 'malo' });

    fixture.componentInstance.submit();
    fixture.detectChanges();

    const error: HTMLElement = fixture.nativeElement.querySelector('.login-page__error');
    expect(error.textContent).toContain('Usuario o contraseña incorrectos');
  });

  it('muestra el spinner mientras la solicitud de login está en curso', () => {
    const login$ = new Subject<unknown>();
    const { fixture } = setup(undefined, { login$ });
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture.componentInstance.form.setValue({ documento: '123', password: 'bueno' });

    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mat-spinner')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);

    login$.next({ ok: true, cliente: { id: 'cli-001' }, token: 't' });
    login$.complete();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();
  });
});
