import { test, expect } from '@playwright/test';
import { CLIENTE_CON_PRODUCTOS, gotoAndHydrate } from './helpers';

test.describe('HU-01 · Inicio de sesión', () => {
  test('escenario 1 / FR-001: credenciales válidas redirige al Home con productos', async ({
    page,
  }) => {
    await gotoAndHydrate(page, '/login');
    await page.locator('input[formcontrolname="documento"]').fill(CLIENTE_CON_PRODUCTOS.documento);
    await page.locator('input[formcontrolname="password"]').fill(CLIENTE_CON_PRODUCTOS.password);
    await page.getByRole('button', { name: 'Ingresar' }).click();

    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByRole('heading', { name: 'Tus productos' })).toBeVisible();
    await expect(page.locator('.product-card')).toHaveCount(2);
  });

  test('escenario 2 / FR-002: credenciales incorrectas muestra mensaje y permanece en login', async ({
    page,
  }) => {
    await gotoAndHydrate(page, '/login');
    await page.locator('input[formcontrolname="documento"]').fill(CLIENTE_CON_PRODUCTOS.documento);
    await page.locator('input[formcontrolname="password"]').fill('clave-incorrecta');
    await page.getByRole('button', { name: 'Ingresar' }).click();

    await expect(page.locator('.login-page__error')).toHaveText('Usuario o contraseña incorrectos');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('escenario 3 / FR-003: 3 intentos fallidos consecutivos bloquea el usuario', async ({
    page,
  }) => {
    await gotoAndHydrate(page, '/login');
    const documento = page.locator('input[formcontrolname="documento"]');
    const password = page.locator('input[formcontrolname="password"]');
    const ingresar = page.getByRole('button', { name: 'Ingresar' });

    // Intentos 1 y 2: credenciales incorrectas normales (aún no alcanzan el umbral de bloqueo).
    for (let intento = 1; intento <= 2; intento++) {
      await documento.fill(CLIENTE_CON_PRODUCTOS.documento);
      await password.fill('clave-incorrecta');
      await ingresar.click();
      await expect(page.locator('.login-page__error')).toHaveText(
        'Usuario o contraseña incorrectos',
      );
    }

    // Intento 3: alcanza el umbral (BLOQUEO_TRAS_INTENTOS = 3) y bloquea de inmediato.
    await documento.fill(CLIENTE_CON_PRODUCTOS.documento);
    await password.fill('clave-incorrecta');
    await ingresar.click();
    await expect(page.locator('.login-page__error')).toHaveText(
      'Usuario bloqueado, contacte a su banco / recupere su clave',
    );

    // El bloqueo también aplica con la contraseña correcta (bloqueo por usuario, no por intento).
    await password.fill(CLIENTE_CON_PRODUCTOS.password);
    await ingresar.click();
    await expect(page.locator('.login-page__error')).toHaveText(
      'Usuario bloqueado, contacte a su banco / recupere su clave',
    );
  });

  test('escenario 4 / FR-004: envío con campos vacíos muestra validación sin llamar al backend', async ({
    page,
  }) => {
    await gotoAndHydrate(page, '/login');

    await page.getByRole('button', { name: 'Ingresar' }).click();

    await expect(page.locator('mat-error')).toHaveCount(2);
    await expect(page.getByText('Ingresa tu usuario o documento')).toBeVisible();
    await expect(page.getByText('Ingresa tu contraseña')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('FR-005: el campo de contraseña oculta el valor y puede alternarse con el ícono', async ({
    page,
  }) => {
    await gotoAndHydrate(page, '/login');
    const password = page.locator('input[formcontrolname="password"]');
    const toggle = page.getByRole('button', { name: 'Mostrar u ocultar contraseña' });

    await password.fill('Banco2026!');
    await expect(password).toHaveAttribute('type', 'password');

    await toggle.click();
    await expect(password).toHaveAttribute('type', 'text');

    await toggle.click();
    await expect(password).toHaveAttribute('type', 'password');
  });
});
