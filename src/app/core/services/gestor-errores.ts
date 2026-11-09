import { ErrorHandler, inject, Injectable } from '@angular/core';

import { ToastService } from '@core/services/toast.service';
import { ApiError } from '@core/util/api-error';

const MENSAJE_INESPERADO = 'Ha ocurrido un error inesperado';

@Injectable()
export class GestorErrores implements ErrorHandler {
  private readonly toast = inject(ToastService);

  handleError(error: unknown): void {
    console.error(error);

    // Los ApiError ya los avisan el interceptor o la pantalla que hizo la petición
    if (error instanceof ApiError || this.yaVisible()) {
      return;
    }

    this.toast.error(MENSAJE_INESPERADO);
  }

  // Un fallo que se repite al repintar no debe llenar la pantalla con el mismo aviso
  private yaVisible(): boolean {
    return this.toast.avisos().some(({ mensaje }) => mensaje === MENSAJE_INESPERADO);
  }
}
