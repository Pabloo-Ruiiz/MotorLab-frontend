import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  catchError,
  forkJoin,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  throwError
} from 'rxjs';

import type {
  EstadoOrden,
  OrdenDetalle,
  Presupuesto,
  Seguimiento
} from '@core/models';
import { OrdenesService } from '@core/services/ordenes.service';
import { PiezasService } from '@core/services/piezas.service';
import { PresupuestosService } from '@core/services/presupuestos.service';
import { ToastService } from '@core/services/toast.service';
import { aApiError, type DetalleError } from '@core/util/api-error';
import { ESTADOS_MECANICO, siguientesEstados } from '@core/util/estados';
import {
  aplicarErroresServidor,
  campoConError,
  limpiarErroresServidor
} from '@core/util/formularios';
import { fechaLocalDeHoy } from '@core/util/validadores';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { ErroresCampoComponent } from '@shared/components/errores-campo/errores-campo.component';
import { LineaTiempoComponent } from '@shared/components/linea-tiempo/linea-tiempo.component';
import { MatriculaComponent } from '@shared/components/matricula/matricula.component';
import { PillEstadoComponent } from '@shared/components/pill-estado/pill-estado.component';
import { PillUrgenciaComponent } from '@shared/components/pill-urgencia/pill-urgencia.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';
import { FechaHoraPipe } from '@shared/pipes/fecha-hora.pipe';

const MAX_NOTA = 200;

const TEXTOS_ESTADO: Partial<Record<EstadoOrden, string>> = {
  en_preparacion: 'Preparación',
  esperando_pieza: 'Esperando pieza',
  arreglando: 'Arreglando',
  listo: 'Listo'
};

interface DatosOrden {
  orden: OrdenDetalle;
  seguimiento: Seguimiento;
  presupuesto: Presupuesto | null;
  stocks: Map<number, number | null>;
}

interface ErrorEstado {
  mensaje: string;
  detalles: DetalleError[];
}

@Component({
  selector: 'app-orden-mecanico',
  imports: [
    CargandoComponent,
    ErroresCampoComponent,
    FechaHoraPipe,
    LineaTiempoComponent,
    MatriculaComponent,
    PillEstadoComponent,
    PillUrgenciaComponent,
    ReactiveFormsModule,
    RouterLink,
    VacioComponent
  ],
  templateUrl: './orden-mecanico.component.html',
  styleUrl: './orden-mecanico.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdenMecanicoComponent {
  private readonly ordenes = inject(OrdenesService);
  private readonly presupuestos = inject(PresupuestosService);
  private readonly piezas = inject(PiezasService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  private readonly recarga = new Subject<void>();

  protected readonly campoConError = campoConError;
  protected readonly maxNota = MAX_NOTA;

  // El control se llama como el campo de la API para que le lleguen sus errores de validación
  protected readonly form = inject(NonNullableFormBuilder).group({
    descripcion: ['', Validators.maxLength(MAX_NOTA)]
  });

  protected readonly cargando = signal(true);
  protected readonly noEncontrada = signal(false);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly datos = signal<DatosOrden | null>(null);
  protected readonly procesando = signal(false);
  protected readonly seleccionado = signal<EstadoOrden | null>(null);
  protected readonly errorEstado = signal<ErrorEstado | null>(null);

  private readonly siguientes = computed(() => {
    const orden = this.datos()?.orden;
    return orden === undefined ? [] : siguientesEstados(orden.estado, 'mecanico');
  });

  protected readonly hayOpciones = computed(() => this.siguientes().length > 0);

  protected readonly opciones = computed(() => {
    const datos = this.datos();
    const siguientes = this.siguientes();

    return ESTADOS_MECANICO.map((estado) => {
      const actual = datos?.orden.estado === estado;
      const permitida = siguientes.includes(estado);
      const recorrido = datos?.seguimiento.eventos.some((evento) => evento.estado === estado);

      return {
        estado,
        texto: TEXTOS_ESTADO[estado] ?? estado,
        actual,
        permitida,
        hecha: !actual && !permitida && recorrido === true
      };
    });
  });

  protected readonly entrada = computed(() => {
    const fechaHora = this.datos()?.orden.fechaEntrada ?? null;
    return fechaHora === null ? null : { fechaHora, esHoy: fechaHora.startsWith(fechaLocalDeHoy()) };
  });

  protected readonly lineasPieza = computed(() => {
    const datos = this.datos();
    if (datos === null || datos.presupuesto === null) {
      return [];
    }

    const { lineas, avisosStock } = datos.presupuesto;

    return lineas
      .filter(({ tipo }) => tipo === 'pieza')
      .map(({ id, concepto, cantidad, piezaId }) => {
        // El servidor agrupa los avisos por pieza: «necesarias» suma todas sus líneas
        const aviso = avisosStock.find((candidato) => candidato.piezaId === piezaId);
        const stock = piezaId === null ? null : (datos.stocks.get(piezaId) ?? null);

        return {
          id,
          concepto,
          cantidad,
          falta: aviso !== undefined,
          textoStock:
            aviso !== undefined
              ? `Stock ${aviso.stock} · faltan ${aviso.necesarias - aviso.stock}`
              : stock !== null
                ? `Stock ${stock}`
                : 'Con stock'
        };
      });
  });

  protected readonly referenciasSinStock = computed(() => {
    const avisos = this.datos()?.presupuesto?.avisosStock ?? [];
    return this.siguientes().includes('arreglando')
      ? avisos.map(({ referencia }) => referencia).join(', ')
      : '';
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
        }
      });
  }

  protected reintentar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.recarga.next();
  }

  protected elegir(estado: EstadoOrden): void {
    this.seleccionado.set(estado);
    this.errorEstado.set(null);
  }

  protected guardar(): void {
    const estado = this.seleccionado();
    if (estado === null || this.procesando()) {
      return;
    }

    limpiarErroresServidor(this.form);
    this.errorEstado.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const descripcion = this.form.getRawValue().descripcion.trim() || undefined;

    // Los botones siguen deshabilitados hasta que la recarga muestra el nuevo estado
    this.procesando.set(true);
    this.ordenes.cambiarEstado(this.id, { estado, descripcion }).subscribe({
      next: () => {
        this.toast.exito('Estado actualizado');
        this.form.reset();
        this.seleccionado.set(null);
        this.recarga.next();
      },
      error: (error: unknown) => this.mostrarErrorEstado(error)
    });
  }

  private pedirDatos(): Observable<DatosOrden | null> {
    return forkJoin({
      orden: this.ordenes.obtener(this.id),
      seguimiento: this.ordenes.seguimiento(this.id),
      presupuesto: this.obtenerPresupuesto()
    }).pipe(
      switchMap((datos) =>
        this.pedirStocks(datos.presupuesto).pipe(map((stocks) => ({ ...datos, stocks })))
      ),
      catchError((error: unknown) => {
        this.registrarErrorDeCarga(error);
        return of(null);
      })
    );
  }

  // Un 404 aquí no es un fallo: significa que la orden aún no tiene presupuesto
  private obtenerPresupuesto(): Observable<Presupuesto | null> {
    return this.presupuestos
      .obtenerPorOrden(this.id)
      .pipe(
        catchError((error: unknown) =>
          aApiError(error).esNoEncontrado() ? of(null) : throwError(() => error)
        )
      );
  }

  // Las líneas no traen el stock y avisosStock solo incluye las piezas que faltan.
  // Sin el dato de una pieza la pantalla sigue siendo útil: se indica que hay stock, sin cifra.
  private pedirStocks(presupuesto: Presupuesto | null): Observable<Map<number, number | null>> {
    const conAviso = new Set(presupuesto?.avisosStock.map(({ piezaId }) => piezaId));
    const ids = new Set(
      (presupuesto?.lineas ?? []).flatMap(({ tipo, piezaId }) =>
        tipo === 'pieza' && piezaId !== null && !conAviso.has(piezaId) ? [piezaId] : []
      )
    );

    if (ids.size === 0) {
      return of(new Map());
    }

    return forkJoin(
      [...ids].map((id) =>
        this.piezas.obtener(id).pipe(
          map(({ stock }): [number, number | null] => [id, stock]),
          catchError(() => of<[number, number | null]>([id, null]))
        )
      )
    ).pipe(map((entradas) => new Map(entradas)));
  }

  // Si ya hay datos en pantalla, un fallo al recargar no los sustituye
  private registrarErrorDeCarga(error: unknown): void {
    const apiError = aApiError(error);

    if (apiError.esSinPermiso()) {
      this.irASinPermiso();
    } else if (apiError.esNoEncontrado()) {
      this.noEncontrada.set(true);
    } else if (this.datos() === null) {
      this.errorCarga.set(apiError.mensaje);
    }
  }

  // No se recarga: la pantalla conserva el estado, la nota y la opción elegida para reintentar
  private mostrarErrorEstado(error: unknown): void {
    const apiError = aApiError(error);
    this.procesando.set(false);

    if (apiError.esSinPermiso()) {
      this.irASinPermiso();
      return;
    }

    // El interceptor ya avisa de los fallos de conexión y de los errores 5xx
    if (apiError.status >= 400 && apiError.status < 500) {
      const detalles = aplicarErroresServidor(this.form, apiError);

      if (detalles.length > 0 || apiError.detalles.length === 0) {
        this.errorEstado.set({ mensaje: apiError.mensaje, detalles });
      }
    }
  }

  // replaceUrl: si no, el botón Atrás volvería a la orden y de nuevo a /403
  private irASinPermiso(): void {
    void this.router.navigate(['/403'], { replaceUrl: true });
  }
}
