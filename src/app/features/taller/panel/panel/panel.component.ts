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

import { ETIQUETAS_ESTADO, type EstadoOrden, type Metricas } from '@core/models';
import { PanelService } from '@core/services/panel.service';
import { mensajeDeError } from '@core/util/api-error';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';
import { EurosPipe } from '@shared/pipes/euros.pipe';
import { TONOS_ESTADO } from '@shared/util/tonos';

// Iconos de trazo (atributo «d» sobre una cuadrícula de 24x24); el trazo lo pone .ico
const ICONOS = {
  calendario: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  ordenes: 'M9 3h6v4H9zM9 5H5v16h14V5h-4M9 12h6M9 16h6',
  presupuestos: 'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z',
  euro: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM15.5 8.5a4.5 4.5 0 1 0 0 7M7 10.5h6M7 13.5h6',
  piezas: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  flecha: 'M5 12h14M13 6l6 6-6 6',
  barras: 'M4 20h16M7 20v-7M12 20V5M17 20V10'
} as const;

@Component({
  selector: 'app-panel',
  imports: [CargandoComponent, EurosPipe, LogoComponent, RouterLink, VacioComponent],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelComponent {
  private readonly panel = inject(PanelService);
  private readonly destroyRef = inject(DestroyRef);

  // La API devuelve siempre las métricas del mes en curso
  private readonly hoy = new Date();
  protected readonly mes = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(this.hoy);
  protected readonly periodo = new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric'
  }).format(this.hoy);
  protected readonly iconos = ICONOS;

  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly metricas = signal<Metricas | null>(null);

  // Siguen el orden del proceso: el JSON no garantiza el orden de las claves
  private readonly estados = computed(() => {
    const porEstado = this.metricas()?.ordenesPorEstado ?? {};
    return (Object.keys(ETIQUETAS_ESTADO) as EstadoOrden[]).flatMap((estado) => {
      const total = porEstado[estado];
      return total === undefined ? [] : [{ estado, total }];
    });
  });

  protected readonly totalOrdenes = computed(() =>
    this.estados().reduce((suma, { total }) => suma + total, 0)
  );

  // El color acompaña: el nombre, el recuento y el porcentaje de cada barra están en texto
  protected readonly barras = computed(() => {
    const estados = this.estados();
    const maximo = Math.max(...estados.map(({ total }) => total), 1);
    const suma = Math.max(this.totalOrdenes(), 1);

    return estados.map(({ estado, total }) => ({
      estado,
      total,
      etiqueta: ETIQUETAS_ESTADO[estado],
      tono: TONOS_ESTADO[estado],
      proporcion: total / maximo,
      porcentaje: Math.round((total / suma) * 100)
    }));
  });

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.panel
      .metricas()
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (metricas) => this.metricas.set(metricas),
        error: (error: unknown) => this.errorCarga.set(mensajeDeError(error))
      });
  }
}
