import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { describe, it, expect, vi } from 'vitest';
import { HomePage } from './home.page';
import { ProductsService } from '../../core/products/products.service';
import { SessionService } from '../../core/session/session.service';
import { AuthService } from '../../core/auth/auth.service';
import { ProductoCliente } from '../../shared/models/producto.model';

const PRODUCTOS: ProductoCliente[] = [
  { id: 'p1', tipo: 'cuenta', nombre: 'Cuenta de Ahorros', saldoOCupoDisponible: 100_000 },
];

function setup(productosService: Partial<ProductsService>) {
  const sessionStub = { session: () => ({ token: 't', clienteId: 'cli-001', estado: 'activa' as const }) };
  TestBed.configureTestingModule({
    imports: [HomePage],
    providers: [
      provideRouter([]),
      { provide: ProductsService, useValue: productosService },
      { provide: SessionService, useValue: sessionStub },
    ],
  });
  const fixture = TestBed.createComponent(HomePage);
  fixture.detectChanges();
  return fixture;
}

describe('HU-02 · HomePage', () => {
  it('escenario 1: muestra el listado de productos activos', () => {
    const fixture = setup({ getProductosDelCliente: () => of(PRODUCTOS) });

    expect(fixture.componentInstance.estado()).toBe('lista');
    expect(fixture.componentInstance.productos()).toEqual(PRODUCTOS);
  });

  it('escenario 2: muestra estado vacío si no hay productos', () => {
    const fixture = setup({ getProductosDelCliente: () => of([]) });

    expect(fixture.componentInstance.estado()).toBe('vacio');
  });

  it('escenario 3: muestra estado de error si falla la carga', () => {
    const fixture = setup({ getProductosDelCliente: () => throwError(() => new Error('fail')) });

    expect(fixture.componentInstance.estado()).toBe('error');
  });

  it('escenario 3: reintentar vuelve a cargar los productos', () => {
    let intentos = 0;
    const fixture = setup({
      getProductosDelCliente: () => {
        intentos += 1;
        return intentos === 1 ? throwError(() => new Error('fail')) : of(PRODUCTOS);
      },
    });

    expect(fixture.componentInstance.estado()).toBe('error');
    fixture.componentInstance.cargarProductos();
    expect(fixture.componentInstance.estado()).toBe('lista');
  });
});

describe('HU-04 · HomePage (cierre de sesión)', () => {
  function setupLogout(confirmado: boolean) {
    const sessionStub = { session: () => ({ token: 't', clienteId: 'cli-001', estado: 'activa' as const }) };
    const authServiceStub = { logout: vi.fn() };
    const dialogStub = { open: vi.fn().mockReturnValue({ afterClosed: () => of(confirmado) }) };
    TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        { provide: ProductsService, useValue: { getProductosDelCliente: () => of(PRODUCTOS) } },
        { provide: SessionService, useValue: sessionStub },
        { provide: AuthService, useValue: authServiceStub },
        { provide: MatDialog, useValue: dialogStub },
      ],
    });
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    return { fixture, authServiceStub, dialogStub };
  }

  it('escenario 1 y 2: pide confirmación y cierra sesión si el usuario confirma', () => {
    const { fixture, authServiceStub, dialogStub } = setupLogout(true);

    fixture.componentInstance.cerrarSesion();

    expect(dialogStub.open).toHaveBeenCalled();
    expect(authServiceStub.logout).toHaveBeenCalledWith('manual');
  });

  it('no cierra sesión si el usuario cancela la confirmación', () => {
    const { fixture, authServiceStub } = setupLogout(false);

    fixture.componentInstance.cerrarSesion();

    expect(authServiceStub.logout).not.toHaveBeenCalled();
  });
});
