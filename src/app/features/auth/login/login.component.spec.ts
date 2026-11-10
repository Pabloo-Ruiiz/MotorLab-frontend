import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import type { Usuario } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { ApiError } from '@core/util/api-error';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  const usuario: Usuario = {
    id: 3,
    nombre: 'Laura Gómez',
    email: 'laura@cliente.example',
    telefono: '600000000',
    rol: 'cliente',
    activo: true
  };

  let authSimulado: { login: ReturnType<typeof vi.fn> };
  let navegar: ReturnType<typeof vi.spyOn>;
  let fixture: ComponentFixture<LoginComponent>;
  let elemento: HTMLElement;

  function escribir(selector: string, valor: string): void {
    const campo = elemento.querySelector(selector) as HTMLInputElement;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
  }

  async function enviar(): Promise<void> {
    elemento
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
  }

  async function rellenarYEnviar(): Promise<void> {
    escribir('#login-email', usuario.email);
    escribir('#login-password', 'secreto123');
    await enviar();
  }

  beforeEach(async () => {
    authSimulado = { login: vi.fn() };

    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authSimulado }]
    });

    navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(LoginComponent);
    elemento = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('no se envía vacío y muestra los errores', async () => {
    await enviar();

    expect(authSimulado.login).not.toHaveBeenCalled();
    expect(elemento.querySelectorAll('.campo__error').length).toBe(2);
    expect(elemento.textContent).toContain('Este campo es obligatorio');
  });

  it('un login correcto navega a pantallaInicio del rol', async () => {
    authSimulado.login.mockReturnValue(of(usuario));

    await rellenarYEnviar();

    expect(authSimulado.login).toHaveBeenCalledWith(usuario.email, 'secreto123');
    expect(navegar).toHaveBeenCalledWith('/cliente/ordenes');
  });

  it('un 401 muestra «Credenciales incorrectas» y no navega', async () => {
    authSimulado.login.mockReturnValue(
      throwError(() => new ApiError(401, 'NO_AUTENTICADO', 'Credenciales incorrectas'))
    );

    await rellenarYEnviar();

    expect(elemento.querySelector('.aviso--rojo')?.textContent).toContain(
      'Credenciales incorrectas'
    );
    expect(navegar).not.toHaveBeenCalled();
  });

  it('sin correo confirmado ofrece reenviarlo', async () => {
    const mensaje = 'Debes confirmar tu correo antes de iniciar sesión.';
    authSimulado.login.mockReturnValue(
      throwError(() => new ApiError(403, 'EMAIL_NO_VERIFICADO', mensaje))
    );

    await rellenarYEnviar();

    expect(elemento.querySelector('.aviso--rojo')?.textContent).toContain(mensaje);
    expect(elemento.querySelector('app-reenviar-correo')).not.toBeNull();
  });

  it('con credenciales incorrectas no ofrece reenviar el correo', async () => {
    authSimulado.login.mockReturnValue(
      throwError(() => new ApiError(401, 'NO_AUTENTICADO', 'Credenciales incorrectas'))
    );

    await rellenarYEnviar();

    expect(elemento.querySelector('app-reenviar-correo')).toBeNull();
  });
});
