import { HttpErrorResponse } from '@angular/common/http';

import type { ApiErrorBody } from '@core/models';

export type DetalleError = NonNullable<ApiErrorBody['error']['detalles']>[number];

const MENSAJE_SIN_CONEXION = 'No se puede conectar con el servidor';
const MENSAJE_INESPERADO = 'Ha ocurrido un error inesperado';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly codigo: string,
    readonly mensaje: string,
    readonly detalles: DetalleError[] = []
  ) {
    super(mensaje);
    this.name = 'ApiError';
  }

  esValidacion(): boolean {
    return this.status === 400;
  }

  esNoAutenticado(): boolean {
    return this.status === 401;
  }

  esSinPermiso(): boolean {
    return this.status === 403;
  }

  esNoEncontrado(): boolean {
    return this.status === 404;
  }

  esConflicto(): boolean {
    return this.status === 409;
  }

  detalleDe(campo: string): string | null {
    return this.detalles.find((detalle) => detalle.campo === campo)?.mensaje ?? null;
  }
}

// El cuerpo puede no ser JSON (por ejemplo, un error del proxy o de red)
function esCuerpoDeError(cuerpo: unknown): cuerpo is ApiErrorBody {
  const error = (cuerpo as Partial<ApiErrorBody> | null)?.error;
  return typeof error?.codigo === 'string' && typeof error.mensaje === 'string';
}

export function aApiError(err: unknown): ApiError {
  if (err instanceof ApiError) {
    return err;
  }

  if (!(err instanceof HttpErrorResponse)) {
    return new ApiError(0, 'ERROR_INESPERADO', MENSAJE_INESPERADO);
  }

  if (esCuerpoDeError(err.error)) {
    const { codigo, mensaje, detalles } = err.error.error;
    return new ApiError(err.status, codigo, mensaje, detalles ?? []);
  }

  return err.status === 0
    ? new ApiError(0, 'SIN_CONEXION', MENSAJE_SIN_CONEXION)
    : new ApiError(err.status, 'ERROR_INESPERADO', MENSAJE_INESPERADO);
}

export function mensajeDeError(err: unknown): string {
  return aApiError(err).mensaje;
}
