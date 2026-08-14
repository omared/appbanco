import { test, expect } from '@playwright/test';
import { login, CLIENTE_CON_PRODUCTOS, irAlFormulario } from './helpers';

async function irAFormularioCreditoRotativo(page: import('@playwright/test').Page) {
  await login(page, CLIENTE_CON_PRODUCTOS);
  await irAlFormulario(page, 'Crédito Rotativo');
}

test.describe('HU-03b · Formulario de solicitud de producto', () => {
  test('escenario 1 / FR-019: precarga los datos personales de solo lectura', async ({ page }) => {
    await irAFormularioCreditoRotativo(page);

    const nombre = page.locator('input[formcontrolname="nombre"]');
    const documento = page.locator('input[formcontrolname="documento"]');
    const celular = page.locator('input[formcontrolname="celular"]');
    const correo = page.locator('input[formcontrolname="correo"]');

    await expect(nombre).toHaveValue('Ana María Gómez');
    await expect(documento).toHaveValue('1000000001');
    await expect(celular).toHaveValue('3001234567');
    await expect(correo).toHaveValue('ana.gomez@example.com');

    for (const campo of [nombre, documento, celular, correo]) {
      await expect(campo).toHaveAttribute('readonly', 'true');
    }
  });

  test('escenario 2 / FR-020: rechaza un monto fuera del rango permitido por el producto', async ({
    page,
  }) => {
    await irAFormularioCreditoRotativo(page);

    const monto = page.locator('input[formcontrolname="montoSolicitado"]');
    await monto.fill('999999999');
    await monto.blur();

    await expect(page.getByText(/Ingresa un monto entre 500000 y 20000000/)).toBeVisible();
  });

  test('escenario 3 / FR-021: resalta como inválido un campo obligatorio vacío al tocarlo', async ({
    page,
  }) => {
    await irAFormularioCreditoRotativo(page);

    const ocupacion = page.locator('input[formcontrolname="ocupacion"]');
    await ocupacion.click();
    await ocupacion.blur();

    await expect(page.getByText('Ingresa tu ocupación')).toBeVisible();
  });

  test('escenario 4 / FR-022: bloquea el envío si faltan los checkboxes obligatorios', async ({
    page,
  }) => {
    await irAFormularioCreditoRotativo(page);

    await page.locator('input[formcontrolname="ingresos"]').fill('3000000');
    await page.locator('input[formcontrolname="ocupacion"]').fill('Ingeniera');
    await page.locator('input[formcontrolname="egresos"]').fill('1000000');
    await page.locator('input[formcontrolname="montoSolicitado"]').fill('2000000');

    const terminos = page.getByRole('checkbox', { name: 'Acepto los Términos y Condiciones' });
    await terminos.check();
    await terminos.uncheck(); // marca y desmarca -> inválido
    await page.getByRole('heading', { name: 'Información socioeconómica' }).click(); // blur -> touched=true

    await expect(page.getByText('Debes aceptar los términos para continuar')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enviar solicitud' })).toBeDisabled();
  });

  test('escenario 5 / FR-023: habilita el envío cuando todo es válido', async ({ page }) => {
    await irAFormularioCreditoRotativo(page);

    await page.locator('input[formcontrolname="ingresos"]').fill('3000000');
    await page.locator('input[formcontrolname="ocupacion"]').fill('Ingeniera');
    await page.locator('input[formcontrolname="egresos"]').fill('1000000');
    await page.locator('input[formcontrolname="montoSolicitado"]').fill('2000000');
    await page.getByRole('checkbox', { name: 'Acepto los Términos y Condiciones' }).check();
    await page
      .getByRole('checkbox', { name: 'Autorizo la consulta en centrales de riesgo' })
      .check();

    await expect(page.getByRole('button', { name: 'Enviar solicitud' })).toBeEnabled();
  });
});
