import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  ETIQUETAS_ESTADO,
  ETIQUETAS_TIPO_SERVICIO,
  ETIQUETAS_URGENCIA,
  type OrdenResumen
} from '@core/models';
import { matriculaLegible } from '@core/util/matricula';
import { FechaHoraPipe } from '@shared/pipes/fecha-hora.pipe';
import { TONOS_ESTADO, TONOS_URGENCIA } from '@shared/util/tonos';

@Component({
  selector: 'app-lista-ordenes-mecanico',
  imports: [FechaHoraPipe, RouterLink],
  templateUrl: './lista-ordenes-mecanico.component.html',
  styleUrl: './lista-ordenes-mecanico.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.lista--finalizadas]': 'finalizadas()' }
})
export class ListaOrdenesMecanicoComponent {
  readonly ordenes = input.required<OrdenResumen[]>();
  // Historial: tarjetas atenuadas para distinguirlas de un vistazo de las tareas activas
  readonly finalizadas = input(false, { transform: booleanAttribute });

  protected readonly etiquetasServicio = ETIQUETAS_TIPO_SERVICIO;
  protected readonly etiquetasEstado = ETIQUETAS_ESTADO;
  protected readonly etiquetasUrgencia = ETIQUETAS_URGENCIA;
  protected readonly tonosEstado = TONOS_ESTADO;
  protected readonly tonosUrgencia = TONOS_URGENCIA;
  protected readonly matriculaLegible = matriculaLegible;
}
