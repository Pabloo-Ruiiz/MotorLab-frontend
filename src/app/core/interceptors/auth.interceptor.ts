import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '@core/services/auth.service';
import { environment } from '@env/environment';

export const URL_LOGIN = `${environment.apiUrl}/auth/login`;
export const URL_REGISTRO = `${environment.apiUrl}/auth/registro`;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const esPublica = req.url === URL_LOGIN || req.url === URL_REGISTRO;
  if (!req.url.startsWith(environment.apiUrl) || esPublica) {
    return next(req);
  }

  const token = inject(AuthService).token();
  if (token === null) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
