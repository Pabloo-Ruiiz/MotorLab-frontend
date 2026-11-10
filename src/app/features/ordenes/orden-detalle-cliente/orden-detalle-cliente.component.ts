import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  catchError,
  finalize,
  forkJoin,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  takeWhile,
  timer
} from 'rxjs';

import {
  ETIQUETAS_CUANDO_OCURRE,
  ETIQUETAS_ESTADO,
  ETIQUETAS_TIPO_SERVICIO,
  ETIQUETAS_URGENCIA,
  type EstadoOrden,
  type OrdenDetalle,
  type Seguimiento
} from '@core/models';
import { OrdenesService } from '@core/services/ordenes.service';
import { ToastService } from '@core/services/toast.service';
import { aApiError } from '@core/util/api-error';
import { esEstadoFinal } from '@core/util/estados';
import { matriculaLegible } from '@core/util/matricula';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { IconoCocheComponent } from '@shared/components/icono-coche/icono-coche.component';
import { LineaTiempoComponent } from '@shared/components/linea-tiempo/linea-tiempo.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { MatriculaComponent } from '@shared/components/matricula/matricula.component';
import { ModalConfirmacionComponent } from '@shared/components/modal-confirmacion/modal-confirmacion.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';
import { EurosPipe } from '@shared/pipes/euros.pipe';
import { FechaHoraPipe } from '@shared/pipes/fecha-hora.pipe';
import { TONOS_ESTADO, TONOS_URGENCIA } from '@shared/util/tonos';

const INTERVALO_MS = 30_000;
const ESTADOS_CANCELABLES: readonly EstadoOrden[] = [
  'solicitud_recibida',
  'pendiente_presupuesto',
  'presupuesto_enviado'
];

// Atributo «d» de cada icono, sobre una cuadrícula de 24x24
const ICONOS = {
  numero: 'M5 9h14M5 15h14M10 4 8 20M16 4l-2 16',
  servicio: 'M15 5a4 4 0 0 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3 3-3Z',
  sintoma: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z',
  cuando: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2',
  urgencia: 'M12 3 2 20h20L12 3ZM12 10v4M12 17h.01',
  mecanico: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0',
  elevador: 'M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4',
  cancelar: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM15 9l-6 6M9 9l6 6'
} as const;

interface DatosOrden {
  orden: OrdenDetalle;
  seguimiento: Seguimiento;
}

@Component({
  selector: 'app-orden-detalle-cliente',
  imports: [
    CargandoComponent,
    EurosPipe,
    FechaHoraPipe,
    IconoCocheComponent,
    LineaTiempoComponent,
    LogoComponent,
    MatriculaComponent,
    ModalConfirmacionComponent,
    NgTemplateOutlet,
    RouterLink,
    VacioComponent
  ],
  templateUrl: './orden-detalle-cliente.component.html',
  styleUrl: './orden-detalle-cliente.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdenDetalleClienteComponent {
  private readonly ordenes = inject(OrdenesService);
  private readonly toast = inject(ToastService);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  private readonly recarga = new Subject<void>();

  protected readonly etiquetasServicio = ETIQUETAS_TIPO_SERVICIO;
  protected readonly etiquetasCuando = ETIQUETAS_CUANDO_OCURRE;
  protected readonly etiquetasEstado = ETIQUETAS_ESTADO;
  protected readonly etiquetasUrgencia = ETIQUETAS_URGENCIA;
  protected readonly tonosEstado = TONOS_ESTADO;
  protected readonly tonosUrgencia = TONOS_URGENCIA;
  protected readonly iconos = ICONOS;
  protected readonly matriculaLegible = matriculaLegible;

  protected readonly cargando = signal(true);
  protected readonly noEncontrada = signal(false);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly datos = signal<DatosOrden | null>(null);
  protected readonly confirmandoCancelacion = signal(false);
  protected readonly cancelando = signal(false);

  protected readonly cancelable = computed(() => {
    const datos = this.datos();
    return datos !== null && ESTADOS_CANCELABLES.includes(datos.orden.estado);
  });

  constructor() {
    // Cada recarga reinicia el temporizador y descarta la petición que estuviera en curso
    this.recarga
      .pipe(
        startWith(undefined),
        switchMap(() =>
          timer(0, INTERVALO_MS).pipe(
            switchMap(() => this.pedirDatos()),
            takeWhile((datos) => this.debeActualizarse(datos), true)
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe((datos) => {
        this.cargando.set(false);
        if (datos !== null) {
          this.datos.set(datos);
          this.errorCarga.set(null);
        }
      });
  }

  protected reintentar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.recarga.next();
  }

  protected confirmarCancelacion(): void {
    this.confirmandoCancelacion.set(false);
    this.cancelando.set(true);

    this.ordenes
      .cancelar(this.id)
      .pipe(finalize(() => this.cancelando.set(false)))
      .subscribe({
        next: () => {
          this.toast.exito('Orden cancelada');
          this.recarga.next();
        },
        error: (error: unknown) => this.mostrarErrorCancelacion(error)
      });
  }

  private pedirDatos(): Observable<DatosOrden | null> {
    return forkJoin({
      orden: this.ordenes.obtener(this.id),
      seguimiento: this.ordenes.seguimiento(this.id)
    }).pipe(
      catchError((error: unknown) => {
        this.registrarErrorDeCarga(error);
        return of(null);
      })
    );
  }

  private debeActualizarse(datos: DatosOrden | null): boolean {
    return !this.noEncontrada() && (datos === null || !esEstadoFinal(datos.orden.estado));
  }

  // Si ya hay datos en pantalla, un fallo puntual no los sustituye: se reintenta en el siguiente ciclo
  private registrarErrorDeCarga(error: unknown): void {
    const apiError = aApiError(error);
    if (apiError.esNoEncontrado()) {
      this.noEncontrada.set(true);
    } else if (this.datos() === null) {
      this.errorCarga.set(apiError.mensaje);
    }
  }

  private mostrarErrorCancelacion(error: unknown): void {
    // El interceptor ya avisa de los fallos de conexión y de los errores 5xx
    const apiError = aApiError(error);
    if (apiError.status >= 400 && apiError.status < 500) {
      this.toast.error(apiError.mensaje);
    }

    // Un 409 indica que el estado cambió: se actualiza para que deje de ofrecerse la cancelación
    if (apiError.esConflicto()) {
      this.recarga.next();
    }
  }
}
