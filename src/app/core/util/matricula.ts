import type { ValidatorFn } from '@angular/forms';

const FORMATO_MATRICULA = /^[0-9]{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$/;

export function normalizarMatricula(valor: string): string {
  return valor.replace(/[\s-]/g, '').toUpperCase();
}

// Como el resto de validadores, da por bueno un campo vacío y reutiliza la clave «pattern».
// Un valor con solo espacios no cuenta como vacío: Validators.required no lo rechazaría.
export const matriculaValidator: ValidatorFn = (control) => {
  const valor: unknown = control.value;
  if (valor === null || valor === undefined || valor === '') {
    return null;
  }

  const esValida = typeof valor === 'string' && FORMATO_MATRICULA.test(normalizarMatricula(valor));
  return esValida ? null : { pattern: true };
};
