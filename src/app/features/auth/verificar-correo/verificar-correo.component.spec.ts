import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AuthService } from '@core/services/auth.service';
import { ApiError } from '@core/util/api-error';
import { VerificarCorreoComponent } from './verificar-correo.component';

describe('VerificarCorreoComponent', () => {
  let verificarEmail: ReturnType<typeof vi.fn>;

  async function abrir(consulta: Record<string, string>): Promise<HTMLElement> {
    TestBed.configureTestingModule({
      imports: [VerificarCorreoComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { verificarEmail } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(consulta) } }
        }
      ]
    });

    const fixture = TestBed.createComponent(VerificarCorreoComponent);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(() => {
    verificarEmail = vi.fn();
  });

  it('confirma el correo con el token del enlace', async () => {
    verificarEmail.mockReturnValue(of(undefined));

    const elemento = await abrir({ token: 'abc' });

    expect(verificarEmail).toHaveBeenCalledWith('abc');
    expect(elemento.textContent).toContain('Correo confirmado');
  });

  it('muestra el mensaje del servidor si el token ha caducado', async () => {
    const mensaje = 'El enlace no es válido o ha caducado.';
    verificarEmail.mockReturnValue(throwError(() => new ApiError(400, 'TOKEN_INVALIDO', mensaje)));

    const elemento = await abrir({ token: 'abc' });

    expect(elemento.textContent).toContain(mensaje);
  });

  it('sin token no llama al servidor', async () => {
    const elemento = await abrir({});

    expect(verificarEmail).not.toHaveBeenCalled();
    expect(elemento.textContent).toContain('No hemos podido confirmarlo');
  });
});
