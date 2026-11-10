import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  ETIQUETAS_ESTADO,
  ETIQUETAS_TIPO_SERVICIO,
  type OrdenResumen,
  type TipoServicio,
} from '@core/models';
import { esEstadoFinal } from '@core/util/estados';
import { matriculaLegible } from '@core/util/matricula';
import { FechaHoraPipe } from '@shared/pipes/fecha-hora.pipe';
import { TONOS_ESTADO } from '@shared/util/tonos';

// Iconos de trazo (24x24, stroke-width 2) para cada tipo de servicio
const ICONOS_SERVICIO: Record<TipoServicio, string> = {
  frenos:
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM12 6v.01M18 12v.01M12 18v.01M6 12v.01',
  motor: 'M4 10v6M4 13h2M6 9h3V6h6v3h2l2 2h2v6h-2l-2 2H9l-3-3V9ZM10 6V4h4v2',
  aceite_filtros: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11ZM9.5 14.5a2.5 2.5 0 0 0 2.5 2.5',
  neumaticos:
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 3v5M12 16v5M3 12h5M16 12h5',
  electricidad: 'M13 2 4 14h7l-1 8 9-12h-7l1-8Z',
  itv: 'M9 3h6v3H9ZM7 4.5H5V21h14V4.5h-2M9 13.5l2 2 4-4',
  otro: 'M15 5a4 4 0 0 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3 3-3Z',
};

const ICONO_CALENDARIO = 'M4 6h16v14H4ZM4 10h16M8 3v4M16 3v4';
const ICONO_BANDERA = 'M5 21V4M5 4h11l-2 4 2 4H5';

// Tarjeta de una orden del historial de un vehículo. Solo presenta los datos que recibe;
// toda la tarjeta enlaza con el detalle de la orden
@Component({
  selector: 'app-tarjeta-orden',
  imports: [FechaHoraPipe, NgTemplateOutlet, RouterLink],
  templateUrl: './tarjeta-orden.component.html',
  styleUrl: './tarjeta-orden.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarjetaOrdenComponent {
  readonly orden = input.required<OrdenResumen>();

  protected readonly matriculaLegible = matriculaLegible;
  protected readonly iconoCalendario = ICONO_CALENDARIO;
  protected readonly iconoBandera = ICONO_BANDERA;

  protected readonly tono = computed(() => TONOS_ESTADO[this.orden().estado]);
  protected readonly estado = computed(() => ETIQUETAS_ESTADO[this.orden().estado]);
  protected readonly servicio = computed(() => ETIQUETAS_TIPO_SERVICIO[this.orden().tipoServicio]);
  protected readonly iconoServicio = computed(() => ICONOS_SERVICIO[this.orden().tipoServicio]);
  protected readonly finalizada = computed(() => esEstadoFinal(this.orden().estado));
}
