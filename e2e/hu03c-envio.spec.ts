import { test, expect } from '@playwright/test';
import { login, CLIENTE_CON_PRODUCTOS, irAlFormulario } from './helpers';

test.describe('HU-03c · Envío y confirmación de la solicitud', () => {
  test('escenario 1 / FR-025: envío exitoso muestra confirmación con número de radicado', async ({
    page,
  }) => {
    await login(page, CLIENTE_CON_PRODUCTOS);
    await irAlFormulario(page, 'Crédito Rotativo');

    await page.locator('input[formcontrolname="ingresos"]').fill('3000000');
    await page.locator('input[formcontrolname="ocupacion"]').fill('Ingeniera');
    await page.locator('input[formcontrolname="egresos"]').fill('1000000');
    await page.locator('input[formcontrolname="montoSolicitado"]').fill('2000000');
    await page.getByRole('checkbox', { name: 'Acepto los Términos y Condiciones' }).check();
    await page
      .getByRole('checkbox', { name: 'Autorizo la consulta en centrales de riesgo' })
      .check();

    await page.getByRole('button', { name: 'Enviar solicitud' }).click();

    await expect(page).toHaveURL(/\/solicitudes\/confirmacion\?radicado=RAD-2026-\d{4}$/);
    await expect(page.getByRole('heading', { name: 'Solicitud enviada exitosamente' })).toBeVisible();
    await expect(page.getByText(/Número de radicado: RAD-2026-\d{4}/)).toBeVisible();
  });

  test('escenario 3 / FR-027: "Mis solicitudes" muestra el trámite recién enviado por radicado', async ({
    page,
  }) => {
    await login(page, CLIENTE_CON_PRODUCTOS);
    await irAlFormulario(page, 'Crédito Rotativo');
    await page.locator('input[formcontrolname="ingresos"]').fill('3000000');
    await page.locator('input[formcontrolname="ocupacion"]').fill('Ingeniera');
    await page.locator('input[formcontrolname="egresos"]').fill('1000000');
    await page.locator('input[formcontrolname="montoSolicitado"]').fill('2000000');
    await page.getByRole('checkbox', { name: 'Acepto los Términos y Condiciones' }).check();
    await page
      .getByRole('checkbox', { name: 'Autorizo la consulta en centrales de riesgo' })
      .check();
    await page.getByRole('button', { name: 'Enviar solicitud' }).click();
    await page.waitForURL(/\/solicitudes\/confirmacion\?radicado=/);
    const url = new URL(page.url());
    const radicado = url.searchParams.get('radicado');

    await page.getByRole('link', { name: 'Ver mis solicitudes' }).click();

    await expect(page).toHaveURL(/\/mis-solicitudes$/);
    const item = page.locator('mat-list-item').filter({ hasText: radicado! });
    await expect(item).toContainText('Crédito Rotativo');
    await expect(item).toContainText('En estudio');

    // La solicitud preexistente del fixture (RAD-2026-0001) también debe seguir visible.
    await expect(page.locator('mat-list-item').filter({ hasText: 'RAD-2026-0001' })).toContainText(
      'Tarjeta de Crédito',
    );
  });

  test.skip(
    'escenario 2 / FR-026: error de comunicación muestra mensaje y conserva los datos',
    async () => {
      // No hay disparador real de fallo en la UI (RequestsService.enviarSolicitud solo falla
      // si se le pasa { fail: true }, y el formulario nunca lo hace). Cubierto por
      // product-request-form.page.spec.ts ("escenario 2: error de envío muestra mensaje y
      // conserva los datos diligenciados").
    },
  );
});
