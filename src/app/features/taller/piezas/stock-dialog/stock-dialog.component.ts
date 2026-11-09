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

import type { Pieza, StockDeltaRequest } from '@core/models';
import { aApiError } from '@core/util/api-error';
import {
  aplicarErroresServidor,
  campoConError,
  limpiarErroresServidor
} from '@core/util/formularios';
import { ErroresCampoComponent } from '@shared/components/errores-campo/errores-campo.component';

const MAX_MOTIVO = 200;

@Component({
  selector: 'app-stock-dialog',
  imports: [ErroresCampoComponent, ReactiveFormsModule],
  templateUrl: './stock-dialog.component.html',
  styleUrl: '../piezas-dialogo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockDialogComponent {
  private readonly cambios = inject(ChangeDetectorRef);

  readonly abierto = input(false, { transform: booleanAttribute });
  readonly pieza = input<Pieza | null>(null);
  readonly guardando = input(false, { transform: booleanAttribute });

  readonly guardar = output<StockDeltaRequest>();
  readonly cancelar = output<void>();

  protected readonly campoConError = campoConError;
  protected readonly maxMotivo = MAX_MOTIVO;
  protected readonly mensajesDelta = { pattern: 'Debe ser un número entero distinto de 0' };

  // Un solo patrón cubre las dos reglas: número entero y distinto de cero
  protected readonly form = inject(NonNullableFormBuilder).group({
    delta: [null as number | null, [Validators.required, Validators.pattern(/^-?[1-9][0-9]*$/)]],
    motivo: ['', [Validators.maxLength(MAX_MOTIVO)]]
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

    // STOCK_INSUFICIENTE trae campo = referencia, que no es un control: va al mensaje general
    const resto = aplicarErroresServidor(this.form, apiError);

    // También los 5xx y los fallos de conexión: el toast del interceptor queda tapado por el modal
    if (resto.length > 0 || apiError.detalles.length === 0) {
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

    const { delta, motivo } = this.form.getRawValue();
    this.guardar.emit({ delta: delta as number, motivo: motivo.trim() || null });
  }

  // Si sigue abierto para el componente padre, el cierre viene del navegador (tecla Escape)
  protected alCerrar(): void {
    if (this.abierto()) {
      this.cancelar.emit();
    }
  }

  private preparar(): void {
    this.errorGeneral.set(null);
    this.form.reset({ delta: null, motivo: '' });
  }
}
