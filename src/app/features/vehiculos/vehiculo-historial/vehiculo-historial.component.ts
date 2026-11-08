import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, Observable, of, shareReplay, Subject, switchMap, tap } from 'rxjs';

import {
  ETIQUETAS_TIPO_SERVICIO,
  type OrdenResumen,
  type Pagina,
  type Vehiculo
} from '@core/models';
import { VehiculosService } from '@core/services/vehiculos.service';
import { aApiError } from '@core/util/api-error';
import { matriculaLegible } from '@core/util/matricula';
import { BarraProgresoComponent } from '@shared/components/barra-progreso/barra-progreso.component';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { PaginadorComponent } from '@shared/components/paginador/paginador.component';
import { PillEstadoComponent } from '@shared/components/pill-estado/pill-estado.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';
import { FechaHoraPipe } from '@shared/pipes/fecha-hora.pipe';

const LIMITE = 10;

interface DatosHistorial {
  vehiculo: Vehiculo;
  historial: Pagina<OrdenResumen>;
}

@Component({
  selector: 'app-vehiculo-historial',
  imports: [
    BarraProgresoComponent,
    CargandoComponent,
    FechaHoraPipe,
    PaginadorComponent,
    PillEstadoComponent,
    RouterLink,
    VacioComponent
  ],
  templateUrl: './vehiculo-historial.component.html',
  styleUrl: './vehiculo-historial.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiculoHistorialComponent {
  private readonly vehiculos = inject(VehiculosService);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  // El historial no trae la matrícula si está vacío. shareReplay evita repetir la petición
  // al cambiar de página y, si falla, no guarda el error: «Reintentar» vuelve a pedirlo
  private readonly vehiculo$: Observable<Vehiculo> = this.vehiculos
    .obtener(this.id)
    .pipe(shareReplay(1));

  private readonly paginaPedida = new Subject<number>();
  private ultimaPagina = 1;

  protected readonly etiquetasServicio = ETIQUETAS_TIPO_SERVICIO;
  protected readonly matriculaLegible = matriculaLegible;

  protected readonly cargando = signal(true);
  protected readonly noEncontrado = signal(false);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly datos = signal<DatosHistorial | null>(null);

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
            historial: this.vehiculos.historial(this.id, pagina, LIMITE)
          }).pipe(
            catchError((error: unknown) => {
              this.registrarError(error);
              return of(null);
            })
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe((datos) => {
        this.datos.set(datos);
        this.cargando.set(false);
      });

    this.cargar(1);
  }

  protected cargar(pagina: number): void {
    this.ultimaPagina = pagina;
    this.paginaPedida.next(pagina);
  }

  protected reintentar(): void {
    this.cargar(this.ultimaPagina);
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
