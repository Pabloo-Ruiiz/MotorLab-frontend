import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, Observable, of, startWith, Subject, switchMap } from 'rxjs';

import {
  ETIQUETAS_CONDUCCION_SEGURA,
  ETIQUETAS_CONTACTO,
  ETIQUETAS_CUANDO_OCURRE,
  ETIQUETAS_ESTADO,
  ETIQUETAS_FRANJA,
  ETIQUETAS_TIPO_SERVICIO,
  type EstadoOrden,
  type OrdenDetalle,
  type Seguimiento
} from '@core/models';
import { OrdenesService } from '@core/services/ordenes.service';
import { PresupuestosService } from '@core/services/presupuestos.service';
import { ToastService } from '@core/services/toast.service';
import { aApiError, type ApiError, type DetalleError } from '@core/util/api-error';
import { siguientesEstados, TRANSICIONES } from '@core/util/estados';
import {
  aplicarErroresServidor,
  campoConError,
  limpiarErroresServidor
} from '@core/util/formularios';
import { fechaLocalDeHoy } from '@core/util/validadores';
import { UsuariosService } from '@core/services/usuarios.service';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { ErroresCampoComponent } from '@shared/components/errores-campo/errores-campo.component';
import { LineaTiempoComponent } from '@shared/components/linea-tiempo/linea-tiempo.component';
import { MatriculaComponent } from '@shared/components/matricula/matricula.component';
import { ModalConfirmacionComponent } from '@shared/components/modal-confirmacion/modal-confirmacion.component';
import { PillEstadoComponent } from '@shared/components/pill-estado/pill-estado.component';
import { PillUrgenciaComponent } from '@shared/components/pill-urgencia/pill-urgencia.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';
import { EurosPipe } from '@shared/pipes/euros.pipe';
import { FechaHoraPipe } from '@shared/pipes/fecha-hora.pipe';

const MAX_ELEVADOR = 20;
const MAX_NOTA = 200;
const ESTADOS_CREAR_PRESUPUESTO: readonly EstadoOrden[] = [
  'solicitud_recibida',
  'pendiente_presupuesto'
];

const ACCIONES_MARCAR: Partial<Record<EstadoOrden, string>> = {
  pendiente_presupuesto: 'Marcar como pendiente de presupuesto',
  recibido: 'Marcar como recibido',
  entregado: 'Marcar como entregado'
};

interface DatosOrden {
  orden: OrdenDetalle;
  seguimiento: Seguimiento;
}

@Component({
  selector: 'app-orden-detalle-taller',
  imports: [
    CargandoComponent,
    DecimalPipe,
    ErroresCampoComponent,
    EurosPipe,
    FechaHoraPipe,
    LineaTiempoComponent,
    MatriculaComponent,
    ModalConfirmacionComponent,
    PillEstadoComponent,
    PillUrgenciaComponent,
    ReactiveFormsModule,
    RouterLink,
    VacioComponent
  ],
  templateUrl: './orden-detalle-taller.component.html',
  styleUrl: './orden-detalle-taller.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdenDetalleTallerComponent {
  private readonly ordenes = inject(OrdenesService);
  private readonly presupuestos = inject(PresupuestosService);
  private readonly usuarios = inject(UsuariosService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  private readonly recarga = new Subject<void>();

  protected readonly etiquetasServicio = ETIQUETAS_TIPO_SERVICIO;
  protected readonly etiquetasCuando = ETIQUETAS_CUANDO_OCURRE;
  protected readonly etiquetasConduccion = ETIQUETAS_CONDUCCION_SEGURA;
  protected readonly etiquetasContacto = ETIQUETAS_CONTACTO;
  protected readonly etiquetasFranja = ETIQUETAS_FRANJA;
  protected readonly maxElevador = MAX_ELEVADOR;
  protected readonly maxNota = MAX_NOTA;
  protected readonly campoConError = campoConError;

  protected readonly asignacion = inject(NonNullableFormBuilder).group({
    mecanicoId: ['', Validators.required],
    elevador: ['', Validators.maxLength(MAX_ELEVADOR)],
    fechaEstimada: ['']
  });
  protected readonly nota = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(MAX_NOTA)]
  });

  protected readonly cargando = signal(true);
  protected readonly noEncontrada = signal(false);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly datos = signal<DatosOrden | null>(null);
  protected readonly confirmandoCancelacion = signal(false);
  protected readonly procesando = signal(false);

  private readonly mecanicos = toSignal(
    this.usuarios.listarMecanicos().pipe(catchError(() => of([]))),
    { initialValue: [] }
  );

  // El mecánico asignado puede estar ya inactivo: sin su opción, el select aparecería en blanco
  protected readonly opcionesMecanico = computed(() => {
    const asignado = this.datos()?.orden.mecanico;
    const activos = this.mecanicos().map(({ id, nombre }) => ({ id, nombre }));

    return asignado && !activos.some(({ id }) => id === asignado.id)
      ? [{ id: asignado.id, nombre: asignado.nombre }, ...activos]
      : activos;
  });

  protected readonly creada = computed(() => {
    const [primera] = (this.datos()?.seguimiento.eventos ?? [])
      .map(({ fechaHora }) => fechaHora)
      .sort();

    return primera === undefined
      ? null
      : { fechaHora: primera, esHoy: primera.startsWith(fechaLocalDeHoy()) };
  });

  protected readonly siguientes = computed(() => {
    const datos = this.datos();
    return datos === null ? [] : siguientesEstados(datos.orden.estado, 'admin');
  });

  protected readonly cancelable = computed(() => {
    const datos = this.datos();
    return datos !== null && TRANSICIONES[datos.orden.estado].includes('cancelada');
  });

  protected readonly puedeCrearPresupuesto = computed(() => {
    const orden = this.datos()?.orden;
    return (
      orden !== undefined &&
      orden.presupuesto === null &&
      ESTADOS_CREAR_PRESUPUESTO.includes(orden.estado)
    );
  });

  protected readonly reglaAutomatica = computed(() => {
    const orden = this.datos()?.orden;
    return orden?.tipoServicio === 'frenos' || orden?.conduccionSegura === 'no';
  });

  constructor() {
    // Cada recarga descarta la petición que estuviera en curso
    this.recarga
      .pipe(
        startWith(undefined),
        switchMap(() => this.pedirDatos()),
        takeUntilDestroyed()
      )
      .subscribe((datos) => {
        this.cargando.set(false);
        this.procesando.set(false);
        if (datos !== null) {
          this.datos.set(datos);
          this.errorCarga.set(null);
          this.rellenarAsignacion(datos.orden);
        }
      });
  }

  protected textoAccion(estado: EstadoOrden): string {
    return ACCIONES_MARCAR[estado] ?? `Pasar a ${ETIQUETAS_ESTADO[estado]}`;
  }

  protected reintentar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.recarga.next();
  }

  protected guardarAsignacion(): void {
    limpiarErroresServidor(this.asignacion);
    if (this.asignacion.invalid) {
      this.asignacion.markAllAsTouched();
      return;
    }

    const { mecanicoId, elevador, fechaEstimada } = this.asignacion.getRawValue();

    this.ejecutar(
      this.ordenes.asignar(this.id, {
        mecanicoId: Number(mecanicoId),
        elevador: elevador.trim() || null,
        fechaEstimada: fechaEstimada ? `${fechaEstimada}:00` : null
      }),
      'Asignación guardada',
      () => this.asignacion.markAsPristine()
    );
  }

  protected cambiarEstado(estado: EstadoOrden): void {
    if (this.nota.invalid) {
      this.nota.markAsTouched();
      return;
    }

    const descripcion = this.nota.value.trim() || undefined;
    this.ejecutar(
      this.ordenes.cambiarEstado(this.id, { estado, descripcion }),
      'Estado actualizado',
      () => this.nota.reset()
    );
  }

  protected confirmarCancelacion(): void {
    this.confirmandoCancelacion.set(false);
    this.ejecutar(this.ordenes.cancelar(this.id), 'Orden cancelada');
  }

  protected crearPresupuesto(): void {
    this.procesando.set(true);

    this.presupuestos.crear(this.id).subscribe({
      next: () => void this.router.navigate(['/taller/ordenes', this.id, 'presupuesto']),
      error: (error: unknown) => this.mostrarError(error)
    });
  }

  // Los botones siguen deshabilitados hasta que la recarga muestra el nuevo estado
  private ejecutar(peticion: Observable<unknown>, exito: string, alCompletar?: () => void): void {
    this.procesando.set(true);

    peticion.subscribe({
      next: () => {
        this.toast.exito(exito);
        alCompletar?.();
        this.recarga.next();
      },
      error: (error: unknown) => this.mostrarError(error)
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

  // Si ya hay datos en pantalla, un fallo al recargar no los sustituye
  private registrarErrorDeCarga(error: unknown): void {
    const apiError = aApiError(error);
    if (apiError.esNoEncontrado()) {
      this.noEncontrada.set(true);
    } else if (this.datos() === null) {
      this.errorCarga.set(apiError.mensaje);
    }
  }

  // Una recarga provocada por otra acción no debe borrar lo que se esté escribiendo
  private rellenarAsignacion(orden: OrdenDetalle): void {
    if (this.asignacion.pristine) {
      this.asignacion.setValue({
        mecanicoId: orden.mecanico?.id.toString() ?? '',
        elevador: orden.elevador ?? '',
        fechaEstimada: orden.fechaEstimada?.slice(0, 16) ?? ''
      });
    }
  }

  private mostrarError(error: unknown): void {
    const apiError = aApiError(error);

    // El interceptor ya avisa de los fallos de conexión y de los errores 5xx
    if (apiError.status >= 400 && apiError.status < 500) {
      this.toast.error(textoDeError(apiError, aplicarErroresServidor(this.asignacion, apiError)));
    }

    // Un 409 indica que el estado de la orden no es el que se ve en pantalla
    if (apiError.esConflicto()) {
      this.recarga.next();
    } else {
      this.procesando.set(false);
    }
  }
}

function textoDeError(error: ApiError, detalles: DetalleError[]): string {
  const textos = detalles.map(({ campo, mensaje }) => `${campo}: ${mensaje}`);
  return textos.length > 0 ? `${error.mensaje} (${textos.join('; ')})` : error.mensaje;
}
