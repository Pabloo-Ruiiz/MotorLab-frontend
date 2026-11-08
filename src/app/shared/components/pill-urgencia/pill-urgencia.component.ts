import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ETIQUETAS_URGENCIA, type Urgencia } from '@core/models';

const CLASES_URGENCIA: Record<Urgencia, string> = {
  baja: 'pill--gris',
  media: 'pill--ambar',
  alta: 'pill--rojo'
};

@Component({
  selector: 'app-pill-urgencia',
  templateUrl: './pill-urgencia.component.html',
  styleUrl: './pill-urgencia.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PillUrgenciaComponent {
  readonly urgencia = input.required<Urgencia>();

  protected readonly clase = computed(() => CLASES_URGENCIA[this.urgencia()]);
  protected readonly texto = computed(() => ETIQUETAS_URGENCIA[this.urgencia()]);
}
