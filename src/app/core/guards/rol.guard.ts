import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import type { Rol } from '@core/models';
import { AuthService } from '@core/services/auth.service';

export function rolGuard(rolesPermitidos: Rol[]): CanActivateFn {
  return () => {
    const rol = inject(AuthService).rol();

    if (rol !== null && rolesPermitidos.includes(rol)) {
      return true;
    }

    return inject(Router).createUrlTree(['/403']);
  };
}
