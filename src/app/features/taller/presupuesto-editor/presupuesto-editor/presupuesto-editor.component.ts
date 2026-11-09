import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  finalize,
  forkJoin,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  tap,
  throwError
} from 'rxjs';

import type {
  AvisoStock,
  Linea,
  LineaRequest,
  OrdenDetalle,
  Presupuesto,
  PresupuestoUpdateRequest,
  TipoLinea
} from '@core/models';
import { OrdenesService } from '@core/services/ordenes.service';
import { PresupuestosService } from '@core/services/presupuestos.service';
import { ToastService } from '@core/services/toast.service';
import { aApiError } from '@core/util/api-error';
import { FocoTrasCarga } from '@core/util/foco';
import {
  aplicarErroresServidor,
  campoConError,
  limpiarErroresServidor
} from '@core/util/formularios';
import { matriculaLegible } from '@core/util/matricula';
import { mayorQueCeroValidator } from '@core/util/validadores';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { ErroresCampoComponent } from '@shared/components/errores-campo/errores-campo.component';
import { ModalConfirmacionComponent } from '@shared/components/modal-confirmacion/modal-confirmacion.component';
import { PillEstadoComponent } from '@shared/components/pill-estado/pill-estado.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';
import { EurosPipe } from '@shared/pipes/euros.pipe';
import { LineaDialogComponent } from '../linea-dialog/linea-dialog.component';

const MAX_HORAS = 99.9;
const MAX_GARANTIA = 120;

interface DatosEditor {
  orden: OrdenDetalle;
  presupuesto: Presupuesto | null;
}

@Component({
  selector: 'app-presupuesto-editor',
  imports: [
    CargandoComponent,
    DecimalPipe,
    ErroresCampoComponent,
    EurosPipe,
    LineaDialogComponent,
    ModalConfirmacionComponent,
    PillEstadoComponent,
    ReactiveFormsModule,
    VacioComponent
  ],
  templateUrl: './presupuesto-editor.component.html',
  styleUrl: './presupuesto-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PresupuestoEditorComponent {
  private readonly presupuestos = inject(PresupuestosService);
  private readonly ordenes = inject(OrdenesService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly ordenId = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  private readonly foco = new FocoTrasCarga();

  private readonly recarga = new Subject<void>();
  private readonly dialogo = viewChild.required(LineaDialogComponent);

  protected readonly campoConError = campoConError;
  protected readonly matriculaLegible = matriculaLegible;
  protected readonly mensajesHoras = { min: 'Debe ser mayor que cero' };
  protected readonly mensajesGarantia = {
    min: 'No puede ser negativa',
    pattern: 'Debe ser un número entero'
  };

  protected readonly resumen = inject(NonNullableFormBuilder).group({
    tiempoEstimadoHoras: [
      null as number | null,
      [mayorQueCeroValidator, Validators.max(MAX_HORAS)]
    ],
    garantiaMeses: [
      null as number | null,
      [Validators.min(0), Validators.max(MAX_GARANTIA), Validators.pattern(/^-?[0-9]+$/)]
    ]
  });

  protected readonly cargando = signal(true);
  protected readonly noEncontrada = signal(false);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly datos = signal<DatosEditor | null>(null);
  protected readonly procesando = signal(false);
  protected readonly confirmandoEnvio = signal(false);

  protected readonly dialogoAbierto = signal(false);
  protected readonly lineaEditada = signal<Linea | null>(null);
  protected readonly tipoNueva = signal<TipoLinea>('pieza');
  protected readonly guardandoLinea = signal(false);

  protected readonly presupuesto = computed(() => this.datos()?.presupuesto ?? null);
  protected readonly editable = computed(() => this.presupuesto()?.estado === 'borrador');

  // Una misma pieza puede estar en varias líneas: el servidor agrupa sus avisos por pieza
  protected readonly stock = computed(() => {
    const presupuesto = this.presupuesto();
    if (presupuesto === null) {
      return null;
    }

    const piezas = presupuesto.lineas.filter(({ piezaId }) => piezaId !== null);
    const total = new Set(piezas.map(({ piezaId }) => piezaId)).size;

    return total === 0 ? null : { disponibles: total - presupuesto.avisosStock.length, total };
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
          this.rellenarResumen(datos.presupuesto);
        }
        this.foco.restaurar();
      });
  }

  protected avisoDe(presupuesto: Presupuesto, linea: Linea): AvisoStock | undefined {
    return presupuesto.avisosStock.find(({ piezaId }) => piezaId === linea.piezaId);
  }

  protected reintentar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.recarga.next();
  }

  protected crearPresupuesto(): void {
    this.ejecutar(this.presupuestos.crear(this.ordenId));
  }

  protected nuevaLinea(tipo: TipoLinea): void {
    this.lineaEditada.set(null);
    this.tipoNueva.set(tipo);
    this.dialogoAbierto.set(true);
  }

  protected editarLinea(linea: Linea): void {
    this.lineaEditada.set(linea);
    this.dialogoAbierto.set(true);
  }

  protected guardarLinea(datos: LineaRequest): void {
    const presupuesto = this.presupuesto();
    if (presupuesto === null) {
      return;
    }

    const linea = this.lineaEditada();
    const peticion =
      linea === null
        ? this.presupuestos.anadirLinea(presupuesto.id, datos)
        : this.presupuestos.modificarLinea(presupuesto.id, linea.id, datos);

    this.guardandoLinea.set(true);
    peticion.pipe(finalize(() => this.guardandoLinea.set(false))).subscribe({
      next: () => {
        this.dialogoAbierto.set(false);
        this.recarga.next();
      },
      error: (error: unknown) => {
        this.dialogo().mostrarErrorServidor(error);

        // Otro usuario ha podido enviar el presupuesto: la pantalla debe pasar a solo lectura
        if (aApiError(error).esConflicto()) {
          this.recarga.next();
        }
      }
    });
  }

  protected eliminarLinea(linea: Linea): void {
    const presupuesto = this.presupuesto();
    if (presupuesto !== null) {
      // El botón pulsado se deshabilita y, al recargar, desaparece con su línea
      this.foco.marcar();
      this.ejecutar(this.presupuestos.eliminarLinea(presupuesto.id, linea.id));
    }
  }

  protected guardarResumen(): void {
    const presupuesto = this.presupuesto();
    limpiarErroresServidor(this.resumen);

    if (presupuesto === null || !this.resumenValido()) {
      return;
    }

    this.ejecutar(this.actualizarResumen(presupuesto), 'Datos del presupuesto guardados');
  }

  protected pedirConfirmacionEnvio(): void {
    limpiarErroresServidor(this.resumen);
    if (this.resumenValido()) {
      this.confirmandoEnvio.set(true);
    }
  }

  protected enviar(): void {
    const presupuesto = this.presupuesto();
    if (presupuesto === null) {
      return;
    }

    this.confirmandoEnvio.set(false);
    this.procesando.set(true);

    // Un cambio aún sin guardar en el tiempo o la garantía no debe perderse al enviar
    const previo: Observable<unknown> = this.resumen.dirty
      ? this.actualizarResumen(presupuesto)
      : of(null);

    previo.pipe(switchMap(() => this.presupuestos.enviar(presupuesto.id))).subscribe({
      next: () => {
        this.toast.exito('Presupuesto enviado al cliente');
        void this.router.navigate(['/taller/ordenes', this.ordenId]);
      },
      error: (error: unknown) => this.mostrarError(error)
    });
  }

  private resumenValido(): boolean {
    if (this.resumen.invalid) {
      this.resumen.markAllAsTouched();
    }
    return this.resumen.valid;
  }

  private actualizarResumen(presupuesto: Presupuesto): Observable<Presupuesto> {
    const datos: PresupuestoUpdateRequest = this.resumen.getRawValue();

    return this.presupuestos
      .actualizar(presupuesto.id, datos)
      .pipe(tap(() => this.resumen.markAsPristine()));
  }

  // Los botones siguen deshabilitados hasta que la recarga muestra el resultado
  private ejecutar(peticion: Observable<unknown>, exito?: string): void {
    this.procesando.set(true);

    peticion.subscribe({
      next: () => {
        if (exito !== undefined) {
          this.toast.exito(exito);
        }
        this.recarga.next();
      },
      error: (error: unknown) => this.mostrarError(error)
    });
  }

  private pedirDatos(): Observable<DatosEditor | null> {
    return forkJoin({
      orden: this.ordenes.obtener(this.ordenId),
      presupuesto: this.obtenerPresupuesto()
    }).pipe(
      catchError((error: unknown) => {
        this.registrarErrorDeCarga(error);
        return of(null);
      })
    );
  }

  // Un 404 aquí no es un fallo: significa que la orden aún no tiene presupuesto
  private obtenerPresupuesto(): Observable<Presupuesto | null> {
    return this.presupuestos
      .obtenerPorOrden(this.ordenId)
      .pipe(
        catchError((error: unknown) =>
          aApiError(error).esNoEncontrado() ? of(null) : throwError(() => error)
        )
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

  // Una recarga por un cambio en las líneas no debe borrar lo que se esté escribiendo
  private rellenarResumen(presupuesto: Presupuesto | null): void {
    if (presupuesto !== null && this.resumen.pristine) {
      this.resumen.setValue({
        tiempoEstimadoHoras: presupuesto.tiempoEstimadoHoras,
        garantiaMeses: presupuesto.garantiaMeses
      });
    }
  }

  private mostrarError(error: unknown): void {
    const apiError = aApiError(error);

    // El interceptor ya avisa de los fallos de conexión y de los errores 5xx
    if (apiError.status >= 400 && apiError.status < 500) {
      const resto = aplicarErroresServidor(this.resumen, apiError);
      this.toast.error([apiError.mensaje, ...resto.map(({ mensaje }) => mensaje)].join(' · '));
    }

    // Un 409 indica que el presupuesto ya no está como se ve en pantalla
    if (apiError.esConflicto()) {
      this.recarga.next();
    } else {
      this.procesando.set(false);
      this.foco.restaurar();
    }
  }
}
