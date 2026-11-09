import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AuthService } from './auth.service';
import { NotificacionesContadorService } from './notificaciones-contador.service';
import { NotificacionesService } from './notificaciones.service';

describe('NotificacionesContadorService', () => {
  const INTERVALO_MS = 30_000;

  let contador: ReturnType<typeof vi.fn>;
  let estaAutenticado: ReturnType<typeof signal<boolean>>;
  let visibilidad: DocumentVisibilityState;
  let servicio: NotificacionesContadorService;

  function cambiarVisibilidad(valor: DocumentVisibilityState): void {
    visibilidad = valor;
    document.dispatchEvent(new Event('visibilitychange'));
  }

  beforeEach(() => {
    vi.useFakeTimers();
    visibilidad = 'visible';
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibilidad);

    contador = vi.fn(() => of(3));
    estaAutenticado = signal(false);

    TestBed.configureTestingModule({
      providers: [
        { provide: NotificacionesService, useValue: { contador } },
        { provide: AuthService, useValue: { estaAutenticado } }
      ]
    });
    servicio = TestBed.inject(NotificacionesContadorService);

    // El effect inicial (sin sesión) debe ejecutarse antes de que cada prueba llame a iniciar
    TestBed.tick();
  });

  afterEach(() => {
    servicio.detener();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('iniciar consulta de inmediato y actualiza noLeidas', () => {
    servicio.iniciar();
    vi.advanceTimersByTime(0);

    expect(contador).toHaveBeenCalledTimes(1);
    expect(servicio.noLeidas()).toBe(3);
  });

  it('vuelve a consultar cada 30 segundos', () => {
    servicio.iniciar();
    vi.advanceTimersByTime(INTERVALO_MS * 2);

    expect(contador).toHaveBeenCalledTimes(3);
  });

  it('iniciar dos veces no duplica la consulta', () => {
    servicio.iniciar();
    servicio.iniciar();
    vi.advanceTimersByTime(0);

    expect(contador).toHaveBeenCalledTimes(1);
  });

  it('detener pone el contador a 0 y cancela la consulta', () => {
    servicio.iniciar();
    vi.advanceTimersByTime(0);
    expect(servicio.noLeidas()).toBe(3);

    servicio.detener();
    vi.advanceTimersByTime(INTERVALO_MS * 2);

    expect(servicio.noLeidas()).toBe(0);
    expect(contador).toHaveBeenCalledTimes(1);
  });

  it('un error se ignora y la consulta sigue activa', () => {
    contador.mockReturnValueOnce(throwError(() => new Error('fallo')));

    servicio.iniciar();
    vi.advanceTimersByTime(0);
    expect(servicio.noLeidas()).toBe(0);

    vi.advanceTimersByTime(INTERVALO_MS);
    expect(servicio.noLeidas()).toBe(3);
  });

  it('refrescar fuerza una consulta sin esperar al intervalo', () => {
    servicio.iniciar();
    vi.advanceTimersByTime(0);
    contador.mockReturnValue(of(7));

    servicio.refrescar();

    expect(contador).toHaveBeenCalledTimes(2);
    expect(servicio.noLeidas()).toBe(7);
  });

  it('con la pestaña oculta se pausa y al volver consulta de inmediato', () => {
    servicio.iniciar();
    vi.advanceTimersByTime(0);

    cambiarVisibilidad('hidden');
    vi.advanceTimersByTime(INTERVALO_MS * 3);
    expect(contador).toHaveBeenCalledTimes(1);

    cambiarVisibilidad('visible');
    vi.advanceTimersByTime(0);
    expect(contador).toHaveBeenCalledTimes(2);
  });

  it('se inicia con la sesión y se detiene al cerrarla', () => {
    estaAutenticado.set(true);
    TestBed.tick();
    vi.advanceTimersByTime(0);
    expect(contador).toHaveBeenCalledTimes(1);
    expect(servicio.noLeidas()).toBe(3);

    estaAutenticado.set(false);
    TestBed.tick();
    vi.advanceTimersByTime(INTERVALO_MS);
    expect(contador).toHaveBeenCalledTimes(1);
    expect(servicio.noLeidas()).toBe(0);
  });
});
