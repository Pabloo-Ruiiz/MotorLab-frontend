import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal
} from '@angular/core';
import type { AbstractControl, ValidationErrors } from '@angular/forms';

type GeneradorMensaje = (detalle: ValidationErrors) => string;

const MENSAJE_GENERICO = 'Valor no válido';

const MENSAJES_POR_DEFECTO: Record<string, GeneradorMensaje> = {
  required: () => 'Este campo es obligatorio',
  email: () => 'Correo electrónico no válido',
  minlength: (detalle) => `Debe tener al menos ${detalle['requiredLength']} caracteres`,
  maxlength: (detalle) => `No puede superar los ${detalle['requiredLength']} caracteres`,
  min: (detalle) => `El valor mínimo es ${detalle['min']}`,
  max: (detalle) => `El valor máximo es ${detalle['max']}`,
  pattern: () => 'Formato no válido'
};

@Component({
  selector: 'app-errores-campo',
  templateUrl: './errores-campo.component.html',
  styleUrl: './errores-campo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErroresCampoComponent {
  readonly control = input.required<AbstractControl>();
  readonly mensajes = input<Record<string, string>>({});

  // AbstractControl no expone signals: cada evento fuerza a recalcular los errores
  private readonly cambios = signal(0);

  protected readonly errores = computed<string[]>(() => {
    this.cambios();
    const control = this.control();

    if (!control.invalid || !(control.touched || control.dirty) || control.errors === null) {
      return [];
    }

    return Object.entries(control.errors).map(([clave, detalle]) =>
      this.mensajeDe(clave, detalle)
    );
  });

  constructor() {
    effect((alLimpiar) => {
      const suscripcion = this.control().events.subscribe(() => {
        this.cambios.update((valor) => valor + 1);
      });
      alLimpiar(() => suscripcion.unsubscribe());
    });
  }

  private mensajeDe(clave: string, detalle: unknown): string {
    const personalizado = this.mensajes()[clave];
    if (personalizado !== undefined) {
      return personalizado;
    }

    if (clave === 'servidor' && typeof detalle === 'string') {
      return detalle;
    }

    return MENSAJES_POR_DEFECTO[clave]?.(detalle as ValidationErrors) ?? MENSAJE_GENERICO;
  }
}
