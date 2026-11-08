import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

// Como los validadores de Angular, estos dan por bueno un campo vacío: eso lo comprueba Validators.required.
// Reutilizan sus claves de error para que ErroresCampoComponent muestre el mensaje adecuado.

export const telefonoValidator: ValidatorFn = Validators.pattern(/^[0-9 +]{9,20}$/);

export const passwordValidator: ValidatorFn = Validators.compose([
  Validators.minLength(8),
  Validators.maxLength(72)
]) as ValidatorFn;

export function verdaderoValidator(control: AbstractControl): ValidationErrors | null {
  return control.value === true ? null : { required: true };
}

export function fechaHoyOPosteriorValidator(control: AbstractControl): ValidationErrors | null {
  const valor: unknown = control.value;
  if (valor === null || valor === undefined || valor === '') {
    return null;
  }

  // En formato YYYY-MM-DD, el orden alfabético coincide con el cronológico
  const esValida = typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor);
  return esValida && valor >= fechaLocalDeHoy() ? null : { fechaPasada: true };
}

// toISOString no sirve: usa UTC y de madrugada devolvería el día anterior
export function fechaLocalDeHoy(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}
