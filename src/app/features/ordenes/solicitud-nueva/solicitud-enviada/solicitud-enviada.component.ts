import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  ETIQUETAS_TIPO_SERVICIO,
  ETIQUETAS_URGENCIA,
  type OrdenCreateResponse,
  type TipoServicio,
  type Vehiculo,
} from '@core/models';
import { matriculaLegible } from '@core/util/matricula';
import { TONOS_URGENCIA } from '@shared/util/tonos';

// Iconos de trazo sobre una cuadrícula de 24x24
const ICONOS = {
  orden: 'M7 3h7l5 5v13H7ZM14 3v5h5M10 13h6M10 17h4',
  lista: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  hecho: 'M5 12l5 5 9-10',
  revision: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4-4',
  seguimiento: 'M3 12h4l3-8 4 16 3-8h4',
};

// Confirmación tras crear la solicitud: datos reales de la orden creada y de lo que se pidió
@Component({
  selector: 'app-solicitud-enviada',
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './solicitud-enviada.component.html',
  styleUrl: './solicitud-enviada.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolicitudEnviadaComponent {
  readonly orden = input.required<OrdenCreateResponse>();
  readonly vehiculo = input<Vehiculo>();
  readonly tipoServicio = input<TipoServicio | null>(null);

  protected readonly iconos = ICONOS;
  protected readonly matriculaLegible = matriculaLegible;

  protected readonly urgencia = computed(() => ETIQUETAS_URGENCIA[this.orden().urgencia]);
  protected readonly tonoUrgencia = computed(() => TONOS_URGENCIA[this.orden().urgencia]);
  protected readonly servicio = computed(() => {
    const tipo = this.tipoServicio();
    return tipo === null ? null : ETIQUETAS_TIPO_SERVICIO[tipo];
  });

  // Lo que pasa después de enviar, en el orden en que lo verá el cliente
  protected readonly siguientes = [
    {
      icono: ICONOS.hecho,
      titulo: 'Solicitud registrada',
      texto: 'Ya la tenemos en el sistema.',
      hecho: true,
    },
    {
      icono: ICONOS.revision,
      titulo: 'Revisión del taller',
      texto: 'Valoramos el problema y preparamos el presupuesto.',
      hecho: false,
    },
    {
      icono: ICONOS.seguimiento,
      titulo: 'Seguimiento',
      texto: 'Consulta el estado y el progreso en Mis órdenes.',
      hecho: false,
    },
  ];
}
