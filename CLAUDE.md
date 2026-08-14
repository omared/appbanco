# CLAUDE.md

Este archivo proporciona guía a Claude Code (claude.ai/code) al trabajar con código en este repositorio.

## Estado del proyecto

Esta es una aplicación Angular 22 recién generada (creada con Angular CLI 22.0.7) con renderizado del lado del servidor (SSR). Más allá de lo generado por defecto por el CLI, aún no se ha añadido ninguna funcionalidad, ruta o componente propio de la aplicación — `src/app/app.routes.ts` está vacío y `app.ts` solo renderiza la plantilla por defecto. Se espera construir el dominio de "appbanco" (app bancaria) desde cero.

Ya se instaló **Angular Material** (`@angular/material` + `@angular/cdk`, vía `ng add @angular/material`), por lo que los componentes de UI deberían construirse con Material en lugar de HTML/CSS a mano cuando sea posible.

## Comandos

- `ng serve` / `npm start` — levanta el servidor de desarrollo en `http://localhost:4200` con recarga en vivo.
- `ng build` — build de producción, salida en `dist/`. Usa la configuración `production` por defecto (presupuestos: 500kB warning / 1MB error para el bundle inicial; 4kB/8kB por estilos de componente).
- `ng build --watch --configuration development` (`npm run watch`) — build de desarrollo incremental.
- `ng test` — ejecuta los tests unitarios con el builder de Vitest (`@angular/build:unit-test`), no Karma/Jasmine.
- `ng test -- <patrón>` — ejecuta un subconjunto de tests por nombre/archivo (aplican los filtros de CLI de Vitest).
- `node dist/appbanco/server/server.mjs` (`npm run serve:ssr:appbanco`) — ejecuta directamente el servidor SSR ya compilado (Express, puerto 4000 por defecto, configurable con `PORT`).
- `ng generate component <nombre>` — genera un componente nuevo; SCSS es el estilo por defecto configurado para los componentes generados (ver los schematics en `angular.json`).

No hay comando de lint configurado (no hay ESLint ni `ng lint` configurado).

## Arquitectura

- **SSR vía `@angular/ssr`**: la app genera tanto un bundle de navegador como uno de servidor (`outputMode: "server"` en `angular.json`). `src/main.ts` arranca la app de navegador; `src/main.server.ts` + `src/app/app.config.server.ts` arrancan la variante de servidor combinando `appConfig` (`app.config.ts`) con providers exclusivos del servidor mediante `mergeApplicationConfig`.
- **Enrutamiento/modo de render del servidor**: `src/app/app.routes.server.ts` define la estrategia de renderizado por ruta para SSR (`RenderMode.Prerender` para todas las rutas por defecto, vía `ServerRoute`). Al añadir rutas en `app.routes.ts` que necesiten un comportamiento de renderizado distinto (p. ej. render en servidor bajo demanda vs. prerender), añade la entrada correspondiente aquí.
- **Servidor Express**: `src/server.ts` es el punto de entrada Node real usado en producción — sirve los assets estáticos desde `dist/appbanco/browser` y delega el resto de peticiones a `AngularNodeAppEngine`. Cualquier endpoint de API propio debe ir aquí (hay un ejemplo comentado que muestra el patrón: `app.get('/api/...', ...)`).
- **Hidratación en cliente**: `provideClientHydration()` está habilitado en `app.config.ts`, por lo que los componentes deben ser compatibles con hidratación (evitar manipulación directa del DOM que difiera entre el render de servidor y de cliente).
- **Componentes standalone**: el proyecto usa la API standalone de Angular (sin `NgModule`) — los componentes declaran su propio array `imports` (ver `App` en `app.ts` importando `RouterOutlet`).
- **Signals**: `App` usa `signal()` para el estado (p. ej. `title`); prefiere signals sobre `@Input`/patrones manuales de detección de cambios, en línea con los idiomas de Angular 22.
- Prefijo de selector: los componentes usan el prefijo `app` (`angular.json` → `prefix: "app"`).
- **Angular Material**: el tema se configura en `src/styles.scss` con `@use '@angular/material' as mat;` y `mat.theme(...)` (Material 3, paleta `primary: magenta`, `tertiary: violet`, tipografía Roboto, `density: 0`). Los estilos usan las variables de sistema de Material (`--mat-sys-*`) en vez de valores fijos. `src/index.html` carga la fuente Roboto y los iconos de Material (Google Fonts) — cualquier componente Material nuevo debe importarse de forma standalone (p. ej. `imports: [MatButtonModule]`).

## Testing

- El test runner es **Vitest**, integrado a través del builder de Angular `@angular/build:unit-test` — no el setup tradicional de Karma. Los archivos de test están junto al código como `*.spec.ts` (p. ej. `src/app/app.spec.ts`), usando `TestBed` de `@angular/core/testing` como es habitual.
- jsdom es el entorno de test (dependencia de desarrollo `jsdom`).

## Convenciones de formato

- Configuración de Prettier (`.prettierrc`): ancho de línea de 100 caracteres, comillas simples, y el parser `angular` para archivos `*.html` — formatea siempre las plantillas con el parser Angular de Prettier, no el parser HTML por defecto.
- `.editorconfig`: indentación de 2 espacios, comillas simples para `*.ts`, UTF-8, salto de línea final obligatorio, espacios en blanco finales recortados (excepto en Markdown).
