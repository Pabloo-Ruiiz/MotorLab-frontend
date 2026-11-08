import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import {
  ETIQUETAS_ESTADO,
  ETIQUETAS_ESTADO_PRESUPUESTO,
  type EstadoOrden,
  type EstadoPresupuesto
} from '@core/models';

const CLASES_ESTADO: Record<EstadoOrden, string> = {
  solicitud_recibida: 'pill--naranja',
  pendiente_presupuesto: 'pill--azul',
  presupuesto_enviado: 'pill--ambar',
  presupuesto_autorizado: 'pill--verde',
  recibido: 'pill--azul',
  en_preparacion: 'pill--azul',
  esperando_pieza: 'pill--ambar',
  arreglando: 'pill--verde',
  listo: 'pill--verde',
  entregado: 'pill--gris',
  rechazada: 'pill--rojo',
  cancelada: 'pill--rojo'
};

const CLASES_ESTADO_PRESUPUESTO: Record<EstadoPresupuesto, string> = {
  borrador: 'pill--gris',
  enviado: 'pill--ambar',
  autorizado: 'pill--verde',
  rechazado: 'pill--rojo'
};

@Component({
  selector: 'app-pill-estado',
  templateUrl: './pill-estado.component.html',
  styleUrl: './pill-estado.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PillEstadoComponent {
  readonly estado = input<EstadoOrden>();
  readonly estadoPresupuesto = input<EstadoPresupuesto>();

  protected readonly pill = computed(() => {
    const estado = this.estado();
    if (estado) {
      return { clase: CLASES_ESTADO[estado], texto: ETIQUETAS_ESTADO[estado] };
    }

    const estadoPresupuesto = this.estadoPresupuesto();
    if (estadoPresupuesto) {
      return {
        clase: CLASES_ESTADO_PRESUPUESTO[estadoPresupuesto],
        texto: ETIQUETAS_ESTADO_PRESUPUESTO[estadoPresupuesto]
      };
    }

    return null;
  });
}
