import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  GuardResult,
  MaybeAsync,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';

import type { Rol } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { pantallaInicio } from '@core/util/rutas';
import { authGuard } from './auth.guard';
import { invitadoGuard } from './invitado.guard';
import { rolGuard } from './rol.guard';

describe('guards', () => {
  const rol = signal<Rol | null>(null);
  const estaAutenticado = computed(() => rol() !== null);

  function ejecutar(guard: CanActivateFn, url = '/cliente/ordenes'): MaybeAsync<GuardResult> {
    return TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot)
    );
  }

  function rutaDe(resultado: MaybeAsync<GuardResult>): string {
    expect(resultado).toBeInstanceOf(UrlTree);
    return TestBed.inject(Router)
      .serializeUrl(resultado as UrlTree)
      .split('?')[0];
  }

  beforeEach(() => {
    rol.set(null);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { rol, estaAutenticado } }
      ]
    });
  });

  describe('authGuard', () => {
    it('sin sesión redirige a /login con returnUrl', () => {
      const resultado = ejecutar(authGuard, '/cliente/ordenes?pagina=2');

      expect(rutaDe(resultado)).toBe('/login');
      expect((resultado as UrlTree).queryParams['returnUrl']).toBe('/cliente/ordenes?pagina=2');
    });

    it('con sesión permite el acceso', () => {
      rol.set('cliente');

      expect(ejecutar(authGuard)).toBe(true);
    });
  });

  describe('rolGuard', () => {
    it('con rol cliente, rolGuard([admin]) redirige a /403', () => {
      rol.set('cliente');

      expect(rutaDe(ejecutar(rolGuard(['admin'])))).toBe('/403');
    });

    it('permite el acceso si el rol está en la lista', () => {
      rol.set('mecanico');

      expect(ejecutar(rolGuard(['admin', 'mecanico']))).toBe(true);
    });
  });

  describe('invitadoGuard', () => {
    it('con sesión de admin redirige a /taller/solicitudes', () => {
      rol.set('admin');

      expect(rutaDe(ejecutar(invitadoGuard))).toBe('/taller/solicitudes');
    });

    it('sin sesión permite el acceso', () => {
      expect(ejecutar(invitadoGuard)).toBe(true);
    });
  });

  describe('pantallaInicio', () => {
    it('devuelve la pantalla de cada rol', () => {
      expect(pantallaInicio('cliente')).toBe('/cliente/ordenes');
      expect(pantallaInicio('admin')).toBe('/taller/solicitudes');
      expect(pantallaInicio('mecanico')).toBe('/taller/mis-ordenes');
    });
  });
});
