import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../session/session.service';

export const authGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (session.session().estado === 'activa') {
    return true;
  }
  return router.createUrlTree(['/login']);
};
