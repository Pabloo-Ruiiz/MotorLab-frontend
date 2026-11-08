import { FormControl } from '@angular/forms';

import { matriculaValidator, normalizarMatricula } from './matricula';

describe('matricula', () => {
  const control = (valor: unknown) => new FormControl(valor);

  describe('normalizarMatricula', () => {
    it.each([
      ['  4821 KLB  ', '4821KLB'],
      ['4821-klb', '4821KLB'],
      ['48 21 - k l b', '4821KLB'],
      ['1234BCD', '1234BCD']
    ])('convierte «%s» en «%s»', (valor, esperado) => {
      expect(normalizarMatricula(valor)).toBe(esperado);
    });
  });

  describe('matriculaValidator', () => {
    it.each(['4821 KLB', '4821-klb', '1234BCD'])('acepta «%s»', (valor) => {
      expect(matriculaValidator(control(valor))).toBeNull();
    });

    it.each(['4821 AEI', '123 ABC', '4821KL', '   '])('rechaza «%s»', (valor) => {
      expect(matriculaValidator(control(valor))).toHaveProperty('pattern');
    });

    it('da por bueno un campo vacío', () => {
      expect(matriculaValidator(control(''))).toBeNull();
      expect(matriculaValidator(control(null))).toBeNull();
    });
  });
});
