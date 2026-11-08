import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, Subject, switchMap, tap } from 'rxjs';

import type { Pagina, Vehiculo } from '@core/models';
import { ToastService } from '@core/services/toast.service';
import { VehiculosService } from '@core/services/vehiculos.service';
import { aApiError, mensajeDeError } from '@core/util/api-error';
import { matriculaLegible } from '@core/util/matricula';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { ModalConfirmacionComponent } from '@shared/components/modal-confirmacion/modal-confirmacion.component';
import { PaginadorComponent } from '@shared/components/paginador/paginador.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';

const LIMITE = 10;

@Component({
  selector: 'app-vehiculos-lista',
  imports: [
    CargandoComponent,
    DecimalPipe,
    ModalConfirmacionComponent,
    PaginadorComponent,
    RouterLink,
    VacioComponent
  ],
  templateUrl: './vehiculos-lista.component.html',
  styleUrl: './vehiculos-lista.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiculosListaComponent {
  private readonly vehiculos = inject(VehiculosService);
  private readonly toast = inject(ToastService);

  private readonly paginaPedida = new Subject<number>();

  protected readonly matriculaLegible = matriculaLegible;

  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly resultado = signal<Pagina<Vehiculo> | null>(null);
  protected readonly aDarDeBaja = signal<Vehiculo | null>(null);

  protected readonly mensajeBaja = computed(() => {
    const vehiculo = this.aDarDeBaja();
    return vehiculo === null
      ? ''
      : `¿Seguro que quieres dar de baja el ${vehiculo.marca} ${vehiculo.modelo} (${this.matriculaLegible(vehiculo.matricula)})?`;
  });

  constructor() {
    // switchMap descarta la respuesta anterior si se cambia de página antes de que llegue
    this.paginaPedida
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.errorCarga.set(null);
        }),
        switchMap((pagina) =>
          this.vehiculos.listar(pagina, LIMITE).pipe(
            catchError((error: unknown) => {
              this.errorCarga.set(mensajeDeError(error));
              return of(null);
            })
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe((resultado) => {
        this.resultado.set(resultado);
        this.cargando.set(false);
      });

    this.cargar(1);
  }

  protected cargar(pagina: number): void {
    this.paginaPedida.next(pagina);
  }

  protected reintentar(): void {
    this.cargar(this.resultado()?.pagina ?? 1);
  }

  protected confirmarBaja(): void {
    const vehiculo = this.aDarDeBaja();
    if (vehiculo === null) {
      return;
    }

    this.aDarDeBaja.set(null);

    this.vehiculos.darDeBaja(vehiculo.id).subscribe({
      next: () => {
        this.toast.exito('Vehículo dado de baja');
        this.cargar(this.paginaTrasBaja());
      },
      error: (error: unknown) => {
        // El interceptor ya avisa de los fallos de conexión y de los errores 5xx
        const apiError = aApiError(error);
        if (apiError.status >= 400 && apiError.status < 500) {
          this.toast.error(apiError.mensaje);
        }
      }
    });
  }

  // Si se da de baja el único vehículo de la última página, esa página deja de existir
  private paginaTrasBaja(): number {
    const actual = this.resultado();
    if (actual === null) {
      return 1;
    }
    return actual.datos.length === 1 && actual.pagina > 1 ? actual.pagina - 1 : actual.pagina;
  }
}
