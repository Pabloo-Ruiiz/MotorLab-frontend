import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import type { Pieza, PiezaRequest } from '@core/models';
import { aApiError } from '@core/util/api-error';
import {
  aplicarErroresServidor,
  campoConError,
  limpiarErroresServidor
} from '@core/util/formularios';
import { ErroresCampoComponent } from '@shared/components/errores-campo/errores-campo.component';

const MAX_REFERENCIA = 30;
const MAX_NOMBRE = 120;

@Component({
  selector: 'app-pieza-dialog',
  imports: [ErroresCampoComponent, ReactiveFormsModule],
  templateUrl: './pieza-dialog.component.html',
  styleUrl: '../piezas-dialogo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PiezaDialogComponent {
  private readonly cambios = inject(ChangeDetectorRef);

  readonly abierto = input(false, { transform: booleanAttribute });
  readonly pieza = input<Pieza | null>(null);
  readonly guardando = input(false, { transform: booleanAttribute });

  readonly guardar = output<PiezaRequest>();
  readonly cancelar = output<void>();

  protected readonly campoConError = campoConError;
  protected readonly maxReferencia = MAX_REFERENCIA;
  protected readonly maxNombre = MAX_NOMBRE;
  protected readonly mensajesTexto = { pattern: 'Este campo es obligatorio' };
  protected readonly mensajesPrecio = { min: 'No puede ser negativo' };
  protected readonly mensajesStock = {
    min: 'No puede ser negativo',
    pattern: 'Debe ser un número entero'
  };

  protected readonly form = inject(NonNullableFormBuilder).group({
    referencia: [
      '',
      [Validators.required, Validators.pattern(/\S/), Validators.maxLength(MAX_REFERENCIA)]
    ],
    nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(MAX_NOMBRE)]],
    precio: [null as number | null, [Validators.required, Validators.min(0)]],
    stock: [null as number | null, [Validators.min(0), Validators.pattern(/^-?[0-9]+$/)]]
  });

  protected readonly errorGeneral = signal<string | null>(null);

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  constructor() {
    // Solo depende de «abierto»: el formulario se prepara cada vez que se abre el diálogo
    effect(() => {
      if (this.abierto()) {
        untracked(() => this.preparar());
      }
    });

    // showModal mueve el foco al diálogo y close lo devuelve al elemento que lo tenía antes
    afterRenderEffect(() => {
      const dialogo = this.dialogo().nativeElement;

      if (this.abierto() && !dialogo.open) {
        dialogo.showModal();
      } else if (!this.abierto() && dialogo.open) {
        dialogo.close();
      }
    });
  }

  // Lo llama la pantalla que hace la petición, con el error que le devuelva el servidor
  mostrarErrorServidor(error: unknown): void {
    const apiError = aApiError(error);
    const resto = aplicarErroresServidor(this.form, apiError);

    // En el catálogo, el único conflicto al guardar es una referencia repetida
    if (apiError.codigo === 'CONFLICTO' && apiError.detalles.length === 0) {
      const { referencia } = this.form.controls;
      referencia.setErrors({ servidor: apiError.mensaje });
      referencia.markAsTouched();
    } else if (resto.length > 0 || apiError.detalles.length === 0) {
      // También los 5xx y los fallos de conexión: el toast del interceptor queda tapado por el modal
      this.errorGeneral.set([apiError.mensaje, ...resto.map((d) => d.mensaje)].join(' · '));
    }

    // La llamada llega desde fuera de la plantilla: sin esto, OnPush no pintaría las clases de error
    this.cambios.markForCheck();
  }

  protected enviar(): void {
    if (this.guardando()) {
      return;
    }

    limpiarErroresServidor(this.form);
    this.errorGeneral.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardar.emit(this.peticion());
  }

  // Si sigue abierto para el componente padre, el cierre viene del navegador (tecla Escape)
  protected alCerrar(): void {
    if (this.abierto()) {
      this.cancelar.emit();
    }
  }

  private peticion(): PiezaRequest {
    const { referencia, nombre, precio, stock } = this.form.getRawValue();
    const datos: PiezaRequest = {
      referencia: referencia.trim(),
      nombre: nombre.trim(),
      precio: precio as number
    };

    return this.pieza() === null && stock !== null ? { ...datos, stock } : datos;
  }

  private preparar(): void {
    const pieza = this.pieza();

    this.errorGeneral.set(null);
    this.form.reset({
      referencia: pieza?.referencia ?? '',
      nombre: pieza?.nombre ?? '',
      precio: pieza?.precio ?? null,
      stock: null
    });
  }
}
