import { test, expect } from '@playwright/test';
import { login, CLIENTE_CON_PRODUCTOS, irACatalogo } from './helpers';

test.describe('HU-03a · Catálogo de productos disponibles', () => {
  test('escenario 1 / FR-015: "Adquirir producto" muestra el catálogo con nombre, ícono y descripción', async ({
    page,
  }) => {
    await login(page, CLIENTE_CON_PRODUCTOS);

    await page.getByRole('link', { name: 'Adquirir producto' }).click();

    await expect(page).toHaveURL(/\/productos$/);
    await expect(page.getByRole('heading', { name: 'Adquirir producto' })).toBeVisible();
    const tarjetas = page.locator('.products-catalog-page__item');
    await expect(tarjetas).toHaveCount(3);
    await expect(tarjetas.filter({ hasText: 'Crédito Rotativo' })).toContainText(
      'Cupo de libre inversión disponible cuando lo necesites.',
    );
  });

  test('escenario 2 / FR-016: un producto ya adquirido aparece marcado "Ya lo tienes"', async ({
    page,
  }) => {
    await login(page, CLIENTE_CON_PRODUCTOS);
    await irACatalogo(page);

    const tarjetaTdC = page.locator('.products-catalog-page__item').filter({
      hasText: 'Tarjeta de Crédito',
    });
    await expect(tarjetaTdC.locator('.products-catalog-page__etiqueta')).toHaveText('Ya lo tienes');
    await expect(tarjetaTdC).toHaveClass(/products-catalog-page__item--deshabilitado/);
  });

  test('escenario 3 / FR-017: seleccionar un producto disponible redirige al formulario', async ({
    page,
  }) => {
    await login(page, CLIENTE_CON_PRODUCTOS);
    await irACatalogo(page);

    await page.locator('.products-catalog-page__item').filter({ hasText: 'CDT' }).click();

    await expect(page).toHaveURL(/\/productos\/cdt\/solicitud$/);
    await expect(page.getByRole('heading', { name: 'Solicitud de CDT' })).toBeVisible();
  });

  test('un producto marcado "Ya lo tienes" no navega al hacer click', async ({ page }) => {
    await login(page, CLIENTE_CON_PRODUCTOS);
    await irACatalogo(page);

    await page.locator('.products-catalog-page__item').filter({ hasText: 'Tarjeta de Crédito' }).click();

    await expect(page).toHaveURL(/\/productos$/);
  });

  test.skip(
    'escenario 4 / FR-018: error de backend muestra RetryBanner con "Reintentar"',
    async () => {
      // Igual que HU-02 escenario 3: no hay disparador real de fallo en la UI.
      // Cubierto por ProductsCatalogPage.spec.ts
      // ("escenario 4: muestra RetryBanner y reintenta la carga en error").
    },
  );
});
