import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  linkedSignal,
  output,
  viewChild
} from '@angular/core';

import { ETIQUETAS_ROL, type Rol } from '@core/models';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';

export interface PersonaVisor {
  nombre: string;
  rol: Rol | null;
  foto: string | null;
}

let siguienteId = 1;

// Muestra en grande la foto de perfil de una persona. Se abre al recibir una persona y se cierra
// con la X, con Escape o pulsando fuera de la imagen
@Component({
  selector: 'app-visor-foto',
  imports: [AvatarComponent],
  templateUrl: './visor-foto.component.html',
  styleUrl: './visor-foto.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisorFotoComponent {
  readonly persona = input<PersonaVisor | null>(null);
  readonly cerrar = output<void>();

  // Conserva la última persona mientras el diálogo se desvanece al cerrarse
  protected readonly mostrada = linkedSignal<PersonaVisor | null, PersonaVisor | null>({
    source: this.persona,
    computation: (persona, anterior) => persona ?? anterior?.value ?? null
  });

  protected readonly etiquetasRol = ETIQUETAS_ROL;
  protected readonly idTitulo = `visor-foto-titulo-${siguienteId++}`;

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  constructor() {
    // showModal mueve el foco al diálogo y close lo devuelve al avatar que lo abrió
    afterRenderEffect(() => {
      const dialogo = this.dialogo().nativeElement;

      if (this.persona() !== null && !dialogo.open) {
        dialogo.showModal();
      } else if (this.persona() === null && dialogo.open) {
        dialogo.close();
      }
    });
  }

  // Un clic sobre el propio <dialog> (y no sobre su contenido) es un clic en el fondo
  protected alPulsar(evento: MouseEvent): void {
    if (evento.target === this.dialogo().nativeElement) {
      this.cerrar.emit();
    }
  }

  // Si sigue abierto para el componente padre, el cierre viene del navegador (tecla Escape)
  protected alCerrar(): void {
    if (this.persona() !== null) {
      this.cerrar.emit();
    }
  }
}
