import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { ProductsService } from './products.service';
import { CLIENTE_CON_PRODUCTOS, CLIENTE_SIN_PRODUCTOS } from '../mock-api/clientes.fixtures';

describe('HU-02 · ProductsService.getProductosDelCliente', () => {
  it('escenario 1: devuelve los productos activos del cliente', async () => {
    const service = TestBed.inject(ProductsService);

    const productos = await new Promise((resolve) =>
      service.getProductosDelCliente(CLIENTE_CON_PRODUCTOS.cliente.id).subscribe(resolve),
    );

    expect(Array.isArray(productos)).toBe(true);
    expect((productos as unknown[]).length).toBeGreaterThan(0);
  });

  it('escenario 2: devuelve lista vacía si el cliente no tiene productos', async () => {
    const service = TestBed.inject(ProductsService);

    const productos = await new Promise((resolve) =>
      service.getProductosDelCliente(CLIENTE_SIN_PRODUCTOS.cliente.id).subscribe(resolve),
    );

    expect(productos).toEqual([]);
  });

  it('escenario 3: propaga el error simulado del backend', async () => {
    const service = TestBed.inject(ProductsService);

    await expect(
      new Promise((_resolve, reject) =>
        service
          .getProductosDelCliente(CLIENTE_CON_PRODUCTOS.cliente.id, { fail: true })
          .subscribe({ error: reject }),
      ),
    ).rejects.toBeInstanceOf(Error);
  });
});

describe('HU-03a · ProductsService.getCatalogo', () => {
  it('escenario 1: devuelve el catálogo con nombre, ícono y descripción', async () => {
    const service = TestBed.inject(ProductsService);

    const catalogo = await new Promise((resolve) =>
      service.getCatalogo(CLIENTE_CON_PRODUCTOS.cliente.id).subscribe(resolve),
    );

    expect(Array.isArray(catalogo)).toBe(true);
    const primero = (catalogo as { nombre: string; icono: string; descripcion: string }[])[0];
    expect(primero.nombre).toBeDefined();
    expect(primero.icono).toBeDefined();
    expect(primero.descripcion).toBeDefined();
  });

  it('escenario 2: incluye productos marcados como ya adquiridos', async () => {
    const service = TestBed.inject(ProductsService);

    const catalogo = await new Promise((resolve) =>
      service.getCatalogo(CLIENTE_CON_PRODUCTOS.cliente.id).subscribe(resolve),
    );

    expect(
      (catalogo as { estadoParaCliente: string }[]).some((p) => p.estadoParaCliente === 'ya_lo_tienes'),
    ).toBe(true);
  });

  it('escenario 4: propaga el error simulado del backend', async () => {
    const service = TestBed.inject(ProductsService);

    await expect(
      new Promise((_resolve, reject) =>
        service.getCatalogo(CLIENTE_CON_PRODUCTOS.cliente.id, { fail: true }).subscribe({ error: reject }),
      ),
    ).rejects.toBeInstanceOf(Error);
  });
});
