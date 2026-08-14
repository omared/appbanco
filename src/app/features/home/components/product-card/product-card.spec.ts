import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { ProductCard } from './product-card';
import { ProductoCliente } from '../../../../shared/models/producto.model';

const PRODUCTO: ProductoCliente = {
  id: 'p1',
  tipo: 'cuenta',
  nombre: 'Cuenta de Ahorros',
  saldoOCupoDisponible: 100_000,
};

describe('HU-02 · ProductCard (ocultar/mostrar saldo)', () => {
  it('escenario 4: oculta el saldo con asteriscos y lo vuelve a mostrar', () => {
    TestBed.configureTestingModule({ imports: [ProductCard] });
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('producto', PRODUCTO);
    fixture.detectChanges();

    expect(fixture.componentInstance.saldoMostrado()).not.toBe('***');

    fixture.componentInstance.toggleSaldoVisible();
    expect(fixture.componentInstance.saldoMostrado()).toBe('***');

    fixture.componentInstance.toggleSaldoVisible();
    expect(fixture.componentInstance.saldoMostrado()).not.toBe('***');
  });
});
