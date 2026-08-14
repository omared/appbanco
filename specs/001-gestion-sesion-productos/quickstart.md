# Quickstart: Gestión de Sesión y Productos Bancarios

Guía de validación manual end-to-end una vez implementadas las tareas de `tasks.md`. No sustituye
los tests unitarios (Vitest) descritos en `research.md` §7 — es la validación de que el flujo
completo funciona en el navegador.

## Prerrequisitos

- `npm install` ya ejecutado.
- Cliente mock disponible en `core/mock-api/clientes.fixtures.ts` (documento + contraseña de
  prueba, definidos al implementar HU-01).

## Levantar la app

```powershell
npm start
```

Abrir `http://localhost:4200`.

## Escenarios a validar

1. **HU-01 · Login exitoso**: ingresar el documento/contraseña de prueba → se redirige a `/home`
   mostrando productos. Corresponde a `spec.md` User Story 1, escenario 1.
2. **HU-01 · Credenciales incorrectas**: ingresar una contraseña incorrecta → mensaje "Usuario o
   contraseña incorrectos", sin salir de `/login`.
3. **HU-01 · Bloqueo**: fallar el login 4 veces seguidas con el mismo usuario → al cuarto intento,
   mensaje "Usuario bloqueado, contacte a su banco / recupere su clave".
4. **HU-02 · Home con productos**: tras login exitoso, verificar que cada producto muestra su
   saldo/cupo, y que el ícono de ojo alterna entre el valor real y `***`.
5. **HU-02 · Cliente sin productos**: usar el fixture de cliente sin productos → mensaje "Aún no
   tienes productos" + botón para adquirir.
6. **HU-04 · Cierre de sesión manual**: presionar "Cerrar sesión" → aparece el diálogo de
   confirmación; al confirmar, se redirige a `/login` y el botón "atrás" del navegador no vuelve al
   Home.
7. **HU-04 · Cierre por inactividad**: dejar la app abierta y autenticada sin interactuar 5 minutos
   → se cierra la sesión automáticamente con el mensaje "Tu sesión ha expirado por inactividad".
8. **HU-03a · Catálogo**: desde el Home, presionar "Adquirir producto" → se muestra el catálogo con
   nombre/ícono/descripción; un producto ya adquirido aparece marcado "Ya lo tienes".
9. **HU-03b · Formulario**: seleccionar un producto disponible → los datos personales aparecen
   precargados y de solo lectura; intentar continuar sin aceptar los checkboxes obligatorios debe
   bloquear el avance con el mensaje correspondiente.
10. **HU-03c · Envío y confirmación**: completar el formulario válidamente y enviar → mensaje
    "Solicitud enviada exitosamente" con número de radicado; luego, en "Mis solicitudes", verificar
    que el radicado aparece con estado "en estudio".

## Tests automatizados

```powershell
npm test           # Vitest en modo watch
npx ng test --watch=false   # una sola corrida (usado en CI)
npx ng lint
```

Cada escenario Gherkin listado arriba debe tener su `it` correspondiente en el `*.spec.ts` del
componente/servicio asociado (Principio III de la constitución) — ver mapeo en `tasks.md`.
