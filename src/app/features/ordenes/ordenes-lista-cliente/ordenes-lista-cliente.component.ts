import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ETIQUETAS_TIPO_SERVICIO, type OrdenResumen } from '@core/models';
import { OrdenesService } from '@core/services/ordenes.service';
import { mensajeDeError } from '@core/util/api-error';
import { esEstadoFinal } from '@core/util/estados';
import { matriculaLegible } from '@core/util/matricula';
import { BarraProgresoComponent } from '@shared/components/barra-progreso/barra-progreso.component';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { PillEstadoComponent } from '@shared/components/pill-estado/pill-estado.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';
import { EurosPipe } from '@shared/pipes/euros.pipe';
import { FechaHoraPipe } from '@shared/pipes/fecha-hora.pipe';

type Pestana = 'activas' | 'historial';

const LIMITE = 100;

@Component({
  selector: 'app-ordenes-lista-cliente',
  imports: [
    BarraProgresoComponent,
    CargandoComponent,
    EurosPipe,
    FechaHoraPipe,
    PillEstadoComponent,
    RouterLink,
    VacioComponent
  ],
  templateUrl: './ordenes-lista-cliente.component.html',
  styleUrl: './ordenes-lista-cliente.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdenesListaClienteComponent {
  private readonly ordenes = inject(OrdenesService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly etiquetasServicio = ETIQUETAS_TIPO_SERVICIO;
  protected readonly matriculaLegible = matriculaLegible;

  protected readonly pestanas: readonly { valor: Pestana; texto: string }[] = [
    { valor: 'activas', texto: 'Activas' },
    { valor: 'historial', texto: 'Historial' }
  ];

  protected readonly pestana = signal<Pestana>('activas');
  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal<string | null>(null);
  private readonly todas = signal<OrdenResumen[]>([]);

  protected readonly visibles = computed(() => {
    const quiereFinales = this.pestana() === 'historial';
    return this.todas().filter(({ estado }) => esEstadoFinal(estado) === quiereFinales);
  });

  protected readonly tituloVacio = computed(() =>
    this.pestana() === 'activas'
      ? 'No tienes órdenes activas'
      : 'Todavía no hay órdenes en el historial'
  );

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.ordenes
      .listar({ limite: LIMITE })
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ datos }) => this.todas.set(datos),
        error: (error: unknown) => this.errorCarga.set(mensajeDeError(error))
      });
  }

  protected presupuestoListo(orden: OrdenResumen): boolean {
    return orden.presupuestoEstado === 'enviado';
  }
}
