import { test, expect } from '@playwright/test';
import { login, CLIENTE_CON_PRODUCTOS, CLIENTE_SIN_PRODUCTOS } from './helpers';

test.describe('HU-02 · Home con productos y saldos', () => {
  test('escenario 1 / FR-006 / FR-007: lista los productos activos con su saldo', async ({
    page,
  }) => {
    await login(page, CLIENTE_CON_PRODUCTOS);

    const tarjetas = page.locator('.product-card');
    await expect(tarjetas).toHaveCount(2);
    await expect(tarjetas.nth(0)).toContainText('Cuenta de Ahorros');
    await expect(tarjetas.nth(0).locator('.product-card__saldo')).toContainText('$');
    await expect(tarjetas.nth(1)).toContainText('Tarjeta de Crédito Clásica');
  });

  test('escenario 2 / FR-008: cliente sin productos ve el mensaje y la opción de adquirir', async ({
    page,
  }) => {
    await login(page, CLIENTE_SIN_PRODUCTOS);

    await expect(page.getByText('Aún no tienes productos')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Adquirir producto' })).toBeVisible();
  });

  test('escenario 4 / FR-010: el ícono de ojo oculta y vuelve a mostrar el saldo', async ({
    page,
  }) => {
    await login(page, CLIENTE_CON_PRODUCTOS);

    const primeraTarjeta = page.locator('.product-card').first();
    const saldo = primeraTarjeta.locator('.product-card__saldo');
    const toggle = primeraTarjeta.getByRole('button', { name: 'Mostrar u ocultar saldo' });

    const saldoVisibleInicial = await saldo.textContent();
    expect(saldoVisibleInicial).toContain('$');

    await toggle.click();
    await expect(saldo).toHaveText('***');

    await toggle.click();
    await expect(saldo).toHaveText(saldoVisibleInicial ?? '');
  });

  test.skip(
    'escenario 3 / FR-009: error de backend muestra RetryBanner con "Reintentar"',
    async () => {
      // No hay disparador en la UI real para forzar el fallo del mock backend
      // (MockBackendService.respond solo falla si se le pasa { fail: true }, y
      // HomePage nunca lo hace). Cubierto por HomePage.spec.ts
      // ("escenario 3: muestra RetryBanner y reintenta la carga en error").
    },
  );
});
