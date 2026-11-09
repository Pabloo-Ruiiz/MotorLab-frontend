import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ETIQUETAS_TIPO_SERVICIO, type OrdenResumen } from '@core/models';
import { matriculaLegible } from '@core/util/matricula';
import { BarraProgresoComponent } from '@shared/components/barra-progreso/barra-progreso.component';
import { PillEstadoComponent } from '@shared/components/pill-estado/pill-estado.component';
import { PillUrgenciaComponent } from '@shared/components/pill-urgencia/pill-urgencia.component';

@Component({
  selector: 'app-lista-ordenes-mecanico',
  imports: [BarraProgresoComponent, PillEstadoComponent, PillUrgenciaComponent, RouterLink],
  templateUrl: './lista-ordenes-mecanico.component.html',
  styleUrl: './lista-ordenes-mecanico.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListaOrdenesMecanicoComponent {
  readonly ordenes = input.required<OrdenResumen[]>();

  protected readonly etiquetasServicio = ETIQUETAS_TIPO_SERVICIO;
  protected readonly matriculaLegible = matriculaLegible;
}
