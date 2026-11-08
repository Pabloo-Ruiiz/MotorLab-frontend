import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';

export const authGuard: CanActivateFn = (_ruta, estado) => {
  if (inject(AuthService).estaAutenticado()) {
    return true;
  }

  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: estado.url } });
};
