import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, Observable, of, shareReplay, Subject, switchMap, tap } from 'rxjs';

import { type OrdenResumen, type Pagina, type Vehiculo } from '@core/models';
import { VehiculosService } from '@core/services/vehiculos.service';
import { aApiError } from '@core/util/api-error';
import { esEstadoFinal } from '@core/util/estados';
import { FocoTrasCarga } from '@core/util/foco';
import { matriculaLegible } from '@core/util/matricula';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { IconoCocheComponent } from '@shared/components/icono-coche/icono-coche.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { PaginadorComponent } from '@shared/components/paginador/paginador.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';

import { TarjetaOrdenComponent } from './tarjeta-orden/tarjeta-orden.component';

const LIMITE = 10;

interface DatosHistorial {
  vehiculo: Vehiculo;
  historial: Pagina<OrdenResumen>;
}

type Filtro = 'todas' | 'activas' | 'finalizadas';
type Orden = 'recientes' | 'antiguas';

// Iconos de trazo (24x24, stroke-width 2)
const ICONOS = {
  orden: 'M12 3 4 7.5v9L12 21l8-4.5v-9L12 3ZM4 7.5l8 4.5 8-4.5M12 12v9',
  activa: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l3 2',
  finalizada: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM8 12l3 3 5-6',
  ordenar: 'M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4',
};

// Fecha de entrada como texto ISO: se compara tal cual, sin pasar por Date (fecha-hora.pipe)
function compararPorFecha(a: OrdenResumen, b: OrdenResumen): number {
  if (a.fechaEntrada !== b.fechaEntrada) {
    if (a.fechaEntrada === null) return 1;
    if (b.fechaEntrada === null) return -1;
    return a.fechaEntrada < b.fechaEntrada ? -1 : 1;
  }
  return a.ordenId - b.ordenId;
}

@Component({
  selector: 'app-vehiculo-historial',
  imports: [
    CargandoComponent,
    IconoCocheComponent,
    LogoComponent,
    NgTemplateOutlet,
    PaginadorComponent,
    RouterLink,
    TarjetaOrdenComponent,
    VacioComponent,
  ],
  templateUrl: './vehiculo-historial.component.html',
  styleUrl: './vehiculo-historial.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehiculoHistorialComponent {
  private readonly vehiculos = inject(VehiculosService);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  private readonly foco = new FocoTrasCarga();

  // El historial no trae la matrícula si está vacío. shareReplay evita repetir la petición
  // al cambiar de página y, si falla, no guarda el error: «Reintentar» vuelve a pedirlo
  private readonly vehiculo$: Observable<Vehiculo> = this.vehiculos
    .obtener(this.id)
    .pipe(shareReplay(1));

  private readonly paginaPedida = new Subject<number>();
  private ultimaPagina = 1;

  protected readonly iconos = ICONOS;
  protected readonly matriculaLegible = matriculaLegible;

  protected readonly cargando = signal(true);
  protected readonly noEncontrado = signal(false);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly datos = signal<DatosHistorial | null>(null);

  protected readonly filtro = signal<Filtro>('todas');
  protected readonly orden = signal<Orden>('recientes');

  // Recuentos y filtro sobre la página cargada: no se piden más datos a la API
  private readonly ordenesPagina = computed(() => this.datos()?.historial.datos ?? []);

  protected readonly recuento = computed(() => {
    const ordenes = this.ordenesPagina();
    const finalizadas = ordenes.filter(({ estado }) => esEstadoFinal(estado)).length;
    return { todas: ordenes.length, activas: ordenes.length - finalizadas, finalizadas };
  });

  protected readonly filtros = computed(() => {
    const recuento = this.recuento();
    return [
      { valor: 'todas' as const, texto: 'Todas', total: recuento.todas },
      { valor: 'activas' as const, texto: 'Activas', total: recuento.activas },
      { valor: 'finalizadas' as const, texto: 'Finalizadas', total: recuento.finalizadas },
    ];
  });

  protected readonly visibles = computed(() => {
    const filtro = this.filtro();
    const sentido = this.orden() === 'recientes' ? -1 : 1;

    return this.ordenesPagina()
      .filter(
        ({ estado }) => filtro === 'todas' || esEstadoFinal(estado) === (filtro === 'finalizadas'),
      )
      .sort((a, b) => compararPorFecha(a, b) * sentido);
  });

  protected readonly tituloVacioFiltro = computed(() =>
    this.filtro() === 'activas'
      ? 'No hay órdenes activas en esta página'
      : 'No hay órdenes finalizadas en esta página',
  );

  constructor() {
    // switchMap descarta la respuesta anterior si se cambia de página antes de que llegue
    this.paginaPedida
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.errorCarga.set(null);
        }),
        switchMap((pagina) =>
          forkJoin({
            vehiculo: this.vehiculo$,
            historial: this.vehiculos.historial(this.id, pagina, LIMITE),
          }).pipe(
            catchError((error: unknown) => {
              this.registrarError(error);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((datos) => {
        this.datos.set(datos);
        this.cargando.set(false);
        this.foco.restaurar();
      });

    this.cargar(1);
  }

  protected cargar(pagina: number): void {
    this.ultimaPagina = pagina;
    this.paginaPedida.next(pagina);
  }

  protected cambiarPagina(pagina: number): void {
    this.foco.marcar();
    this.cargar(pagina);
  }

  protected reintentar(): void {
    this.cambiarPagina(this.ultimaPagina);
  }

  protected alternarOrden(): void {
    this.orden.update((actual) => (actual === 'recientes' ? 'antiguas' : 'recientes'));
  }

  private registrarError(error: unknown): void {
    const apiError = aApiError(error);
    if (apiError.esNoEncontrado()) {
      this.noEncontrado.set(true);
    } else {
      this.errorCarga.set(apiError.mensaje);
    }
  }
}
