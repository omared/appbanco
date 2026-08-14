import { Page, expect } from '@playwright/test';

export const CLIENTE_CON_PRODUCTOS = { documento: '1000000001', password: 'Banco2026!' };
export const CLIENTE_SIN_PRODUCTOS = { documento: '1000000002', password: 'Banco2026!' };

/**
 * La app usa SSR + hydration (provideClientHydration). Si se interactúa con el DOM
 * justo después de `page.goto`, el HTML ya está pintado pero Angular aún no adjuntó
 * los event listeners, y los clics/inputs se pierden en silencio. Esperar 'networkidle'
 * da tiempo a que el bundle termine de cargar e hidratar antes de interactuar.
 */
export async function gotoAndHydrate(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

export async function login(
  page: Page,
  credenciales: { documento: string; password: string } = CLIENTE_CON_PRODUCTOS,
): Promise<void> {
  await gotoAndHydrate(page, '/login');
  await page.locator('input[formcontrolname="documento"]').fill(credenciales.documento);
  await page.locator('input[formcontrolname="password"]').fill(credenciales.password);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL(/\/home$/);
}

/**
 * SessionService guarda la sesión solo en memoria (un signal, sin localStorage/cookie).
 * Navegar a una ruta protegida con page.goto() hace una recarga completa del navegador
 * y pierde la sesión (authGuard redirige a /login). Por eso, para movernos entre páginas
 * protegidas dentro de un mismo test SIEMPRE hay que navegar haciendo clic en la UI
 * (routing de Angular, sin recarga) en vez de usar gotoAndHydrate.
 */
export async function irACatalogo(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'Adquirir producto' }).click();
  await expect(page).toHaveURL(/\/productos$/);
}

export async function irAlFormulario(page: Page, nombreProducto: string): Promise<void> {
  await irACatalogo(page);
  await page.locator('.products-catalog-page__item').filter({ hasText: nombreProducto }).click();
}
