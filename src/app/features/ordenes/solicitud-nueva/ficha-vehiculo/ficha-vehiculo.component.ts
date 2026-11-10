import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { Vehiculo } from '@core/models';
import { matriculaLegible } from '@core/util/matricula';
import { IconoCocheComponent } from '@shared/components/icono-coche/icono-coche.component';

// Ficha del vehículo elegido, para confirmar de un vistazo que es el correcto
@Component({
  selector: 'app-ficha-vehiculo',
  imports: [DecimalPipe, IconoCocheComponent],
  template: `
    @let v = vehiculo();
    <div class="vehiculo">
      <span class="vehiculo__icono"><app-icono-coche /></span>
      <div>
        <p class="vehiculo__nombre">{{ v.marca }} {{ v.modelo }}</p>
        <p class="vehiculo__detalle">
          @if (v.version; as version) {
            {{ version }} ·
          }
          {{ v.anio }} · {{ v.kilometros | number: '1.0-0' }} km
        </p>
      </div>
      <span class="placa">
        <span class="placa__banda" aria-hidden="true">E</span>
        {{ matriculaLegible(v.matricula) }}
      </span>
    </div>
  `,
  styleUrl: './ficha-vehiculo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FichaVehiculoComponent {
  readonly vehiculo = input.required<Vehiculo>();

  protected readonly matriculaLegible = matriculaLegible;
}
