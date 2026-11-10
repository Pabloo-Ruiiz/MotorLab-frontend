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
import { VacioComponent } from '@shared/components/vacio/vacio.component';
import { EurosPipe } from '@shared/pipes/euros.pipe';

// Cada estado conserva su color aunque cambien los demás. El color acompaña: el nombre y el
// recuento de cada barra están siempre en texto.
const COLORES_ESTADO: Record<EstadoOrden, string> = {
  solicitud_recibida: 'var(--mo-tinta)',
  pendiente_presupuesto: 'var(--mo-acero)',
  presupuesto_enviado: 'var(--mo-acero)',
  presupuesto_autorizado: 'var(--mo-tinta)',
  recibido: 'var(--mo-acero)',
  en_preparacion: 'var(--mo-acero)',
  esperando_pieza: 'var(--mo-acero)',
  arreglando: 'var(--mo-tinta)',
  listo: 'var(--mo-tinta)',
  entregado: 'var(--mo-niebla)',
  rechazada: 'var(--mo-peltre)',
  cancelada: 'var(--mo-peltre)'
};

@Component({
  selector: 'app-panel',
  imports: [CargandoComponent, EurosPipe, RouterLink, VacioComponent],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelComponent {
  private readonly panel = inject(PanelService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly mes = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date());

  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly metricas = signal<Metricas | null>(null);

  // Siguen el orden del proceso: el JSON no garantiza el orden de las claves
  protected readonly barras = computed(() => {
    const porEstado = this.metricas()?.ordenesPorEstado ?? {};
    const estados = (Object.keys(ETIQUETAS_ESTADO) as EstadoOrden[]).flatMap((estado) => {
      const total = porEstado[estado];
      return total === undefined ? [] : [{ estado, total }];
    });
    const maximo = Math.max(...estados.map(({ total }) => total), 1);

    return estados.map(({ estado, total }) => ({
      estado,
      total,
      etiqueta: ETIQUETAS_ESTADO[estado],
      color: COLORES_ESTADO[estado],
      ancho: (total / maximo) * 100
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
