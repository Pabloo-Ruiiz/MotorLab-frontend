import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ApiError } from './api-error';
import { aplicarErroresServidor, limpiarErroresServidor } from './formularios';

describe('formularios', () => {
  function crearFormulario(): FormGroup {
    return new FormGroup({
      email: new FormControl('ana@correo.es'),
      tipoServicio: new FormControl('', [Validators.required])
    });
  }

  function errorConDetalles(detalles: { campo: string; mensaje: string }[]): ApiError {
    return new ApiError(400, 'VALIDACION', 'Hay campos con errores', detalles);
  }

  describe('aplicarErroresServidor', () => {
    it('añade el error del servidor al control y lo marca como touched', () => {
      const form = crearFormulario();

      aplicarErroresServidor(form, errorConDetalles([{ campo: 'email', mensaje: 'Ya registrado' }]));

      const control = form.get('email');
      expect(control?.errors).toEqual({ servidor: 'Ya registrado' });
      expect(control?.touched).toBe(true);
    });

    it('conserva los errores que ya tenía el control', () => {
      const form = crearFormulario();

      aplicarErroresServidor(
        form,
        errorConDetalles([{ campo: 'tipoServicio', mensaje: 'No válido' }])
      );

      expect(form.get('tipoServicio')?.errors).toEqual({ required: true, servidor: 'No válido' });
    });

    it('devuelve solo los detalles sin control asociado', () => {
      const form = crearFormulario();
      const sinControl = { campo: 'DS-118', mensaje: 'Stock 1, necesarias 2' };

      const resto = aplicarErroresServidor(
        form,
        errorConDetalles([{ campo: 'email', mensaje: 'Ya registrado' }, sinControl])
      );

      expect(resto).toEqual([sinControl]);
    });
  });

  describe('limpiarErroresServidor', () => {
    it('quita el error del servidor y el control vuelve a ser válido', () => {
      const form = crearFormulario();
      aplicarErroresServidor(form, errorConDetalles([{ campo: 'email', mensaje: 'Ya registrado' }]));

      limpiarErroresServidor(form);

      expect(form.get('email')?.errors).toBeNull();
      expect(form.get('email')?.valid).toBe(true);
    });

    it('mantiene los errores de validación del propio formulario', () => {
      const form = crearFormulario();
      aplicarErroresServidor(
        form,
        errorConDetalles([{ campo: 'tipoServicio', mensaje: 'No válido' }])
      );

      limpiarErroresServidor(form);

      expect(form.get('tipoServicio')?.errors).toEqual({ required: true });
    });
  });
});
