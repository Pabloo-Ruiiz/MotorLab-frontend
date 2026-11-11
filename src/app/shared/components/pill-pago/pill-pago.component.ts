import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ETIQUETAS_ESTADO_PAGO, type EstadoPago } from '@core/models';
import { TONOS_ESTADO_PAGO } from '@shared/util/tonos';

// Iconos de 24x24: tarjeta, billete y reloj (pendiente de cobro)
const ICONOS: Record<EstadoPago, string> = {
  pagado_tarjeta: 'M3 6h18v12H3zM3 10h18M7 15h3',
  pagado_efectivo: 'M3 7h18v10H3zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 12h.01M18 12h.01',
  pendiente_efectivo: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2'
};

// Estado del pago de un presupuesto autorizado. Sin estado, «Sin pagar» en gris
@Component({
  selector: 'app-pill-pago',
  templateUrl: './pill-pago.component.html',
  styleUrl: './pill-pago.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PillPagoComponent {
  readonly estado = input<EstadoPago | null>(null);

  protected readonly tono = computed(() => {
    const estado = this.estado();
    return estado ? TONOS_ESTADO_PAGO[estado] : 'neutro';
  });

  protected readonly texto = computed(() => {
    const estado = this.estado();
    return estado ? ETIQUETAS_ESTADO_PAGO[estado] : 'Sin pagar';
  });

  protected readonly icono = computed(
    () => ICONOS[this.estado() ?? 'pendiente_efectivo']
  );
}
