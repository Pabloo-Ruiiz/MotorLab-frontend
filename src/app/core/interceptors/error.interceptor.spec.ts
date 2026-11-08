import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { ApiError } from '@core/util/api-error';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  const NO_AUTENTICADO = { status: 401, statusText: 'Unauthorized' };
  const cuerpo401 = {
    error: { codigo: 'NO_AUTENTICADO', mensaje: 'Autenticación requerida', detalles: [] }
  };

  let authSimulado: { cerrarSesion: ReturnType<typeof vi.fn> };
  let routerSimulado: { url: string; navigate: ReturnType<typeof vi.fn> };
  let toastSimulado: { error: ReturnType<typeof vi.fn> };
  let http: HttpClient;
  let httpSimulado: HttpTestingController;
  let recibido: unknown;

  function capturarError(url: string): void {
    http.get(url).subscribe({ error: (error: unknown) => (recibido = error) });
  }

  beforeEach(() => {
    recibido = undefined;
    authSimulado = { cerrarSesion: vi.fn() };
    routerSimulado = {
      url: '/cliente/vehiculos?pagina=2',
      navigate: vi.fn().mockResolvedValue(true)
    };
    toastSimulado = { error: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authSimulado },
        { provide: Router, useValue: routerSimulado },
        { provide: ToastService, useValue: toastSimulado }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpSimulado = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpSimulado.verify();
  });

  it('un 400 con detalles llega al suscriptor como ApiError con codigo VALIDACION', () => {
    const detalles = [{ campo: 'matricula', mensaje: 'La matrícula no es válida' }];

    capturarError('/api/v1/vehiculos');
    httpSimulado
      .expectOne('/api/v1/vehiculos')
      .flush(
        { error: { codigo: 'VALIDACION', mensaje: 'Hay campos con errores', detalles } },
        { status: 400, statusText: 'Bad Request' }
      );

    expect(recibido).toBeInstanceOf(ApiError);
    const error = recibido as ApiError;
    expect(error.status).toBe(400);
    expect(error.codigo).toBe('VALIDACION');
    expect(error.detalles).toEqual(detalles);
    expect(error.detalleDe('matricula')).toBe('La matrícula no es válida');
    expect(authSimulado.cerrarSesion).not.toHaveBeenCalled();
    expect(toastSimulado.error).not.toHaveBeenCalled();
  });

  it('un 401 en /api/v1/vehiculos cierra la sesión y navega a /login con returnUrl', () => {
    capturarError('/api/v1/vehiculos');
    httpSimulado.expectOne('/api/v1/vehiculos').flush(cuerpo401, NO_AUTENTICADO);

    expect(authSimulado.cerrarSesion).toHaveBeenCalledTimes(1);
    expect(routerSimulado.navigate).toHaveBeenCalledTimes(1);
    expect(routerSimulado.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/cliente/vehiculos?pagina=2' }
    });
    expect(recibido).toBeInstanceOf(ApiError);
  });

  it('un 401 en /auth/login NO cierra la sesión', () => {
    http.post('/api/v1/auth/login', {}).subscribe({
      error: (error: unknown) => (recibido = error)
    });
    httpSimulado.expectOne('/api/v1/auth/login').flush(cuerpo401, NO_AUTENTICADO);

    expect(authSimulado.cerrarSesion).not.toHaveBeenCalled();
    expect(routerSimulado.navigate).not.toHaveBeenCalled();
    expect(recibido).toBeInstanceOf(ApiError);
  });

  it('un 401 en /auth/yo no redirige: lo gestiona AuthService.cargarUsuario', () => {
    capturarError('/api/v1/auth/yo');
    httpSimulado.expectOne('/api/v1/auth/yo').flush(cuerpo401, NO_AUTENTICADO);

    expect(authSimulado.cerrarSesion).not.toHaveBeenCalled();
    expect(routerSimulado.navigate).not.toHaveBeenCalled();
  });

  it('un status 0 produce el mensaje «No se puede conectar con el servidor»', () => {
    capturarError('/api/v1/vehiculos');
    httpSimulado.expectOne('/api/v1/vehiculos').error(new ProgressEvent('error'));

    expect(recibido).toBeInstanceOf(ApiError);
    const error = recibido as ApiError;
    expect(error.status).toBe(0);
    expect(error.mensaje).toBe('No se puede conectar con el servidor');
    expect(toastSimulado.error).toHaveBeenCalledWith('No se puede conectar con el servidor');
  });

  it('un 500 muestra un toast y el error llega igualmente al suscriptor', () => {
    capturarError('/api/v1/vehiculos');
    httpSimulado
      .expectOne('/api/v1/vehiculos')
      .flush(
        { error: { codigo: 'ERROR_INTERNO', mensaje: 'Error interno del servidor', detalles: [] } },
        { status: 500, statusText: 'Internal Server Error' }
      );

    expect(toastSimulado.error).toHaveBeenCalledWith('Error interno del servidor');
    expect(recibido).toBeInstanceOf(ApiError);
  });
});
