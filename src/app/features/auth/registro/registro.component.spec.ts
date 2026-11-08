import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { throwError } from 'rxjs';
import { vi } from 'vitest';

import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { ApiError } from '@core/util/api-error';
import { RegistroComponent } from './registro.component';

describe('RegistroComponent', () => {
  let authSimulado: { registro: ReturnType<typeof vi.fn> };
  let fixture: ComponentFixture<RegistroComponent>;
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

  beforeEach(async () => {
    authSimulado = { registro: vi.fn() };

    TestBed.configureTestingModule({
      imports: [RegistroComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSimulado },
        { provide: ToastService, useValue: { exito: vi.fn() } }
      ]
    });

    fixture = TestBed.createComponent(RegistroComponent);
    elemento = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('una contraseña corta y un teléfono inválido muestran errores', async () => {
    escribir('#registro-telefono', '12-34');
    escribir('#registro-password', 'corta');
    await fixture.whenStable();

    expect(elemento.textContent).toContain('Formato no válido');
    expect(elemento.textContent).toContain('Debe tener al menos 8 caracteres');

    await enviar();

    expect(authSimulado.registro).not.toHaveBeenCalled();
  });

  it('un 409 EMAIL_DUPLICADO deja el error de servidor en el control email', async () => {
    const mensaje = 'El email ya está registrado';
    authSimulado.registro.mockReturnValue(
      throwError(() => new ApiError(409, 'EMAIL_DUPLICADO', mensaje))
    );
    escribir('#registro-nombre', 'Laura Gómez');
    escribir('#registro-email', 'laura@cliente.example');
    escribir('#registro-telefono', '600 000 000');
    escribir('#registro-password', 'secreto123');
    (elemento.querySelector('input[type=checkbox]') as HTMLInputElement).click();

    await enviar();

    expect(authSimulado.registro).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance['form'].controls.email.errors).toEqual({ servidor: mensaje });
    expect(elemento.textContent).toContain(mensaje);
    expect(elemento.querySelector('.aviso--rojo')).toBeNull();
  });
});
