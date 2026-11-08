import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { pantallaInicio } from '@core/util/rutas';

export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const rol = auth.rol();

  // Puede haber token sin usuario si /auth/yo falló por un error de red: sin rol no se sabe adónde ir
  if (auth.estaAutenticado() && rol !== null) {
    return inject(Router).createUrlTree([pantallaInicio(rol)]);
  }

  return true;
};
