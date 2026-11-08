import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import type { LoginResponse, RegistroRequest, Usuario } from '@core/models';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const CLAVE_TOKEN = 'motorlab.token';
  const usuario: Usuario = {
    id: 3,
    nombre: 'Laura Gómez',
    email: 'laura@cliente.example',
    telefono: '600000000',
    rol: 'cliente',
    activo: true
  };

  let routerSimulado: { navigate: ReturnType<typeof vi.fn> };
  let httpSimulado: HttpTestingController;

  // El servicio lee el token al crearse: hay que preparar localStorage antes de llamar a esta función
  function crearServicio(): AuthService {
    const servicio = TestBed.inject(AuthService);
    httpSimulado = TestBed.inject(HttpTestingController);
    return servicio;
  }

  beforeEach(() => {
    localStorage.clear();
    routerSimulado = { navigate: vi.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSimulado }
      ]
    });
  });

  afterEach(() => {
    httpSimulado.verify();
    localStorage.clear();
  });

  it('login guarda el token y el usuario y los expone en los signals', () => {
    const servicio = crearServicio();
    const respuesta: LoginResponse = { token: 'token-de-prueba', usuario };
    let emitido: Usuario | undefined;

    servicio.login(usuario.email, 'secreto123').subscribe((valor) => (emitido = valor));

    const peticion = httpSimulado.expectOne('/api/v1/auth/login');
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual({ email: usuario.email, password: 'secreto123' });
    peticion.flush(respuesta);

    expect(emitido).toEqual(usuario);
    expect(servicio.token()).toBe('token-de-prueba');
    expect(servicio.usuario()).toEqual(usuario);
    expect(servicio.estaAutenticado()).toBe(true);
    expect(servicio.rol()).toBe('cliente');
    expect(localStorage.getItem(CLAVE_TOKEN)).toBe('token-de-prueba');
  });

  it('login con 401 no guarda nada', () => {
    const servicio = crearServicio();
    let estadoError: number | undefined;

    servicio.login(usuario.email, 'incorrecta').subscribe({
      error: (error: { status: number }) => (estadoError = error.status)
    });

    httpSimulado.expectOne('/api/v1/auth/login').flush(
      { error: { codigo: 'NO_AUTENTICADO', mensaje: 'Credenciales incorrectas', detalles: [] } },
      { status: 401, statusText: 'Unauthorized' }
    );

    expect(estadoError).toBe(401);
    expect(servicio.token()).toBeNull();
    expect(servicio.usuario()).toBeNull();
    expect(servicio.estaAutenticado()).toBe(false);
    expect(localStorage.getItem(CLAVE_TOKEN)).toBeNull();
  });

  it('registro hace el POST correcto', () => {
    const servicio = crearServicio();
    const datos: RegistroRequest = {
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono,
      password: 'secreto123',
      aceptaPrivacidad: true
    };
    let emitido: Usuario | undefined;

    servicio.registro(datos).subscribe((valor) => (emitido = valor));

    const peticion = httpSimulado.expectOne('/api/v1/auth/registro');
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual(datos);
    peticion.flush(usuario);

    expect(emitido).toEqual(usuario);
  });

  it('cargarUsuario sin token no hace peticiones', () => {
    const servicio = crearServicio();

    servicio.cargarUsuario().subscribe();

    httpSimulado.expectNone('/api/v1/auth/yo');
    expect(servicio.usuario()).toBeNull();
  });

  it('cargarUsuario con token llama a /auth/yo y actualiza el usuario', () => {
    localStorage.setItem(CLAVE_TOKEN, 'token-guardado');
    const servicio = crearServicio();

    servicio.cargarUsuario().subscribe();

    const peticion = httpSimulado.expectOne('/api/v1/auth/yo');
    expect(peticion.request.method).toBe('GET');
    peticion.flush(usuario);

    expect(servicio.token()).toBe('token-guardado');
    expect(servicio.usuario()).toEqual(usuario);
  });

  it('cargarUsuario con 401 cierra la sesión sin navegar', () => {
    localStorage.setItem(CLAVE_TOKEN, 'token-caducado');
    const servicio = crearServicio();

    servicio.cargarUsuario().subscribe();

    httpSimulado
      .expectOne('/api/v1/auth/yo')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(servicio.token()).toBeNull();
    expect(localStorage.getItem(CLAVE_TOKEN)).toBeNull();
    expect(routerSimulado.navigate).not.toHaveBeenCalled();
  });

  it('cerrarSesion borra el token de localStorage y navega a /login', () => {
    localStorage.setItem(CLAVE_TOKEN, 'token-guardado');
    const servicio = crearServicio();

    servicio.cerrarSesion();

    expect(localStorage.getItem(CLAVE_TOKEN)).toBeNull();
    expect(servicio.token()).toBeNull();
    expect(servicio.usuario()).toBeNull();
    expect(routerSimulado.navigate).toHaveBeenCalledWith(['/login']);
  });
});
