import type { AbstractControl, FormGroup } from '@angular/forms';

import type { ApiError, DetalleError } from './api-error';

// Mismo criterio que ErroresCampoComponent para decidir si se muestra el error
export function campoConError(control: AbstractControl): boolean {
  return control.invalid && (control.touched || control.dirty);
}

// Devuelve los detalles sin control asociado, para mostrarlos como mensaje general
export function aplicarErroresServidor(form: FormGroup, error: ApiError): DetalleError[] {
  return error.detalles.filter((detalle) => {
    const control = form.get(detalle.campo);
    if (control === null) {
      return true;
    }

    control.setErrors({ ...control.errors, servidor: detalle.mensaje });
    control.markAsTouched();
    return false;
  });
}

export function limpiarErroresServidor(form: FormGroup): void {
  for (const control of Object.values(form.controls)) {
    if (control.errors?.['servidor'] === undefined) {
      continue;
    }

    const { servidor: _servidor, ...resto } = control.errors;
    control.setErrors(Object.keys(resto).length > 0 ? resto : null);
  }
}
