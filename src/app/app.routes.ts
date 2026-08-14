import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'productos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/products-catalog/products-catalog.page').then((m) => m.ProductsCatalogPage),
  },
  {
    path: 'productos/:productoId/solicitud',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/product-request/product-request-form.page').then(
        (m) => m.ProductRequestFormPage,
      ),
  },
  {
    path: 'solicitudes/confirmacion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/product-request/product-request-confirmation.page').then(
        (m) => m.ProductRequestConfirmationPage,
      ),
  },
  {
    path: 'mis-solicitudes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/my-requests/my-requests.page').then((m) => m.MyRequestsPage),
  },
];
