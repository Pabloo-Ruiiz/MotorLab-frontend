import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild
} from '@angular/core';

let siguienteId = 1;

@Component({
  selector: 'app-modal-confirmacion',
  templateUrl: './modal-confirmacion.component.html',
  styleUrl: './modal-confirmacion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalConfirmacionComponent {
  readonly abierto = input(false, { transform: booleanAttribute });
  readonly titulo = input.required<string>();
  readonly mensaje = input('');
  readonly textoConfirmar = input('Confirmar');
  readonly textoCancelar = input('Cancelar');
  readonly peligro = input(false, { transform: booleanAttribute });

  readonly confirmar = output<void>();
  readonly cancelar = output<void>();

  protected readonly idTitulo = `modal-titulo-${siguienteId}`;
  protected readonly idMensaje = `modal-mensaje-${siguienteId++}`;

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  constructor() {
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

  // Si sigue abierto para el componente padre, el cierre viene del navegador (tecla Escape)
  protected alCerrar(): void {
    if (this.abierto()) {
      this.cancelar.emit();
    }
  }
}
