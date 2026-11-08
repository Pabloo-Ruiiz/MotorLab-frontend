import { FormControl } from '@angular/forms';
import { vi } from 'vitest';

import {
  fechaHoyOPosteriorValidator,
  passwordValidator,
  telefonoValidator,
  verdaderoValidator
} from './validadores';

describe('validadores', () => {
  const control = (valor: unknown) => new FormControl(valor);

  describe('telefonoValidator', () => {
    it.each(['600000000', '+34 600 000 000', '12345678901234567890'])('acepta «%s»', (valor) => {
      expect(telefonoValidator(control(valor))).toBeNull();
    });

    it.each(['12345678', '600-000-000', 'telefono12', '123456789012345678901'])(
      'rechaza «%s»',
      (valor) => {
        expect(telefonoValidator(control(valor))).toHaveProperty('pattern');
      }
    );

    it('da por bueno un campo vacío', () => {
      expect(telefonoValidator(control(''))).toBeNull();
    });
  });

  describe('passwordValidator', () => {
    it('acepta longitudes de 8 y de 72 caracteres', () => {
      expect(passwordValidator(control('a'.repeat(8)))).toBeNull();
      expect(passwordValidator(control('a'.repeat(72)))).toBeNull();
    });

    it('rechaza menos de 8 caracteres', () => {
      expect(passwordValidator(control('a'.repeat(7)))).toHaveProperty('minlength');
    });

    it('rechaza más de 72 caracteres', () => {
      expect(passwordValidator(control('a'.repeat(73)))).toHaveProperty('maxlength');
    });
  });

  describe('verdaderoValidator', () => {
    it('acepta true', () => {
      expect(verdaderoValidator(control(true))).toBeNull();
    });

    it.each([false, null, 'true'])('rechaza %s', (valor) => {
      expect(verdaderoValidator(control(valor))).toEqual({ required: true });
    });
  });

  describe('fechaHoyOPosteriorValidator', () => {
    afterEach(() => vi.useRealTimers());

    function fijarHora(...fecha: [number, number, number, number, number]): void {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(...fecha));
    }

    it('acepta hoy y una fecha posterior, y rechaza ayer', () => {
      fijarHora(2026, 9, 12, 12, 0);

      expect(fechaHoyOPosteriorValidator(control('2026-10-12'))).toBeNull();
      expect(fechaHoyOPosteriorValidator(control('2026-10-13'))).toBeNull();
      expect(fechaHoyOPosteriorValidator(control('2026-10-11'))).toEqual({ fechaPasada: true });
    });

    it('usa la fecha local al principio y al final del día', () => {
      fijarHora(2026, 9, 12, 0, 5);
      expect(fechaHoyOPosteriorValidator(control('2026-10-12'))).toBeNull();
      expect(fechaHoyOPosteriorValidator(control('2026-10-11'))).toEqual({ fechaPasada: true });

      fijarHora(2026, 9, 12, 23, 55);
      expect(fechaHoyOPosteriorValidator(control('2026-10-12'))).toBeNull();
      expect(fechaHoyOPosteriorValidator(control('2026-10-11'))).toEqual({ fechaPasada: true });
    });

    it('da por bueno un campo vacío y rechaza otro formato', () => {
      expect(fechaHoyOPosteriorValidator(control(''))).toBeNull();
      expect(fechaHoyOPosteriorValidator(control(null))).toBeNull();
      expect(fechaHoyOPosteriorValidator(control('12/10/2099'))).toEqual({ fechaPasada: true });
    });
  });
});
