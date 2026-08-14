import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, vi } from 'vitest';
import { ProductsCatalogPage } from './products-catalog.page';
import { ProductsService } from '../../core/products/products.service';
import { SessionService } from '../../core/session/session.service';
import { ProductoCatalogo } from '../../shared/models/producto.model';

const CATALOGO: ProductoCatalogo[] = [
  {
    id: 'credito-rotativo',
    nombre: 'Crédito Rotativo',
    descripcion: 'desc',
    icono: 'account_balance_wallet',
    montoMinimo: 100,
    montoMaximo: 1000,
    estadoParaCliente: 'disponible',
  },
  {
    id: 'tarjeta-credito',
    nombre: 'Tarjeta de Crédito',
    descripcion: 'desc',
    icono: 'credit_card',
    montoMinimo: 100,
    montoMaximo: 1000,
    estadoParaCliente: 'ya_lo_tienes',
  },
];

function setup(productsService: Partial<ProductsService>) {
  const sessionStub = { session: () => ({ token: 't', clienteId: 'cli-001', estado: 'activa' as const }) };
  TestBed.configureTestingModule({
    imports: [ProductsCatalogPage],
    providers: [
      provideRouter([]),
      { provide: ProductsService, useValue: productsService },
      { provide: SessionService, useValue: sessionStub },
    ],
  });
  const fixture = TestBed.createComponent(ProductsCatalogPage);
  fixture.detectChanges();
  return fixture;
}

describe('HU-03a · ProductsCatalogPage', () => {
  it('escenario 1: muestra el catálogo disponible', () => {
    const fixture = setup({ getCatalogo: () => of(CATALOGO) });

    expect(fixture.componentInstance.estado()).toBe('lista');
    expect(fixture.componentInstance.catalogo().length).toBe(2);
  });

  it('escenario 2: marca "Ya lo tienes" en productos ya adquiridos', () => {
    const fixture = setup({ getCatalogo: () => of(CATALOGO) });

    expect(fixture.componentInstance.etiquetaEstado(CATALOGO[1])).toBe('Ya lo tienes');
    expect(fixture.componentInstance.etiquetaEstado(CATALOGO[0])).toBeNull();
  });

  it('escenario 3: navega al formulario al seleccionar un producto disponible', () => {
    const fixture = setup({ getCatalogo: () => of(CATALOGO) });
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    fixture.componentInstance.seleccionar(CATALOGO[0]);

    expect(navigateSpy).toHaveBeenCalledWith(['/productos', 'credito-rotativo', 'solicitud']);
  });

  it('escenario 3: no navega si el producto ya fue adquirido', () => {
    const fixture = setup({ getCatalogo: () => of(CATALOGO) });
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    fixture.componentInstance.seleccionar(CATALOGO[1]);

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('escenario 4: muestra estado de error si falla la carga del catálogo', () => {
    const fixture = setup({ getCatalogo: () => throwError(() => new Error('fail')) });

    expect(fixture.componentInstance.estado()).toBe('error');
  });
});
