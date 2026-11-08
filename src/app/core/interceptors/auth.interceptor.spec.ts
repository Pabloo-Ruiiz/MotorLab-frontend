import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AuthService } from '@core/services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const token = signal<string | null>(null);
  let http: HttpClient;
  let httpSimulado: HttpTestingController;

  beforeEach(() => {
    token.set(null);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { token } }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpSimulado = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpSimulado.verify();
  });

  it('con token añade Authorization a /api/v1/vehiculos', () => {
    token.set('token-de-prueba');

    http.get('/api/v1/vehiculos').subscribe();

    const peticion = httpSimulado.expectOne('/api/v1/vehiculos');
    expect(peticion.request.headers.get('Authorization')).toBe('Bearer token-de-prueba');
    peticion.flush({});
  });

  it('sin token no añade Authorization', () => {
    http.get('/api/v1/vehiculos').subscribe();

    const peticion = httpSimulado.expectOne('/api/v1/vehiculos');
    expect(peticion.request.headers.has('Authorization')).toBe(false);
    peticion.flush({});
  });

  it('no añade Authorization a /auth/login aunque haya token', () => {
    token.set('token-de-prueba');

    http.post('/api/v1/auth/login', {}).subscribe();

    const peticion = httpSimulado.expectOne('/api/v1/auth/login');
    expect(peticion.request.headers.has('Authorization')).toBe(false);
    peticion.flush({});
  });
});
