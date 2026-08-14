import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('HU-04 · Cierre de sesión', () => {
  test('escenario 2 / FR-012: pedir "Cerrar sesión" muestra el diálogo de confirmación', async ({
    page,
  }) => {
    await login(page);

    await page.getByRole('button', { name: 'Cerrar sesión' }).click();

    await expect(page.getByRole('heading', { name: '¿Seguro que deseas cerrar sesión?' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sí' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'No' })).toBeVisible();
  });

  test('cancelar el diálogo ("No") mantiene la sesión activa en el Home', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await page.getByRole('button', { name: 'No' }).click();

    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page).toHaveURL(/\/home$/);
  });

  test('escenario 1 / FR-011 / FR-014: confirmar cierra la sesión, redirige a login y bloquea "atrás"', async ({
    page,
  }) => {
    await login(page);

    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await page.getByRole('button', { name: 'Sí' }).click();

    await expect(page).toHaveURL(/\/login$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('escenario 3 / FR-013: inactividad de 5 minutos cierra la sesión automáticamente', async ({
    page,
  }) => {
    await page.clock.install();
    await login(page);

    await page.clock.fastForward('05:01');

    await expect(page).toHaveURL(/\/login\?motivo=inactividad$/);
    await expect(page.locator('.login-page__info')).toHaveText(
      'Tu sesión ha expirado por inactividad',
    );
  });
});
