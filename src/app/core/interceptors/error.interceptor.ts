import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { aApiError } from '@core/util/api-error';
import { environment } from '@env/environment';
import { URL_LOGIN, URL_REGISTRO } from './auth.interceptor';

// AuthService.cargarUsuario ya gestiona su 401 sin navegar, durante el arranque de la aplicación
const URL_USUARIO_ACTUAL = `${environment.apiUrl}/auth/yo`;
const URLS_SIN_REDIRECCION = [URL_LOGIN, URL_REGISTRO, URL_USUARIO_ACTUAL];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      const apiError = aApiError(error);

      if (apiError.esNoAutenticado() && !URLS_SIN_REDIRECCION.includes(req.url)) {
        const returnUrl = router.url;
        auth.cerrarSesion(false);
        void router.navigate(['/login'], { queryParams: { returnUrl } });
      }

      return throwError(() => apiError);
    })
  );
};
