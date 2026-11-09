import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  merge,
  Observable,
  of,
  Subject,
  switchMap,
  tap
} from 'rxjs';

import type { Pagina, Pieza, PiezaRequest, StockDeltaRequest } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { PiezasService } from '@core/services/piezas.service';
import { ToastService } from '@core/services/toast.service';
import { aApiError, mensajeDeError } from '@core/util/api-error';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { ModalConfirmacionComponent } from '@shared/components/modal-confirmacion/modal-confirmacion.component';
import { PaginadorComponent } from '@shared/components/paginador/paginador.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';
import { EurosPipe } from '@shared/pipes/euros.pipe';
import { PiezaDialogComponent } from '../pieza-dialog/pieza-dialog.component';
import { StockDialogComponent } from '../stock-dialog/stock-dialog.component';

const LIMITE = 20;
const DEBOUNCE_MS = 300;
const MAX_BUSQUEDA = 120;

interface FiltrosUrl {
  q: string;
  soloActivas: boolean;
  stockBajo: boolean;
  pagina: number;
}

// La URL se puede editar a mano: un valor que el servidor rechazaría se trata como si no estuviera
function leerFiltros(params: ParamMap): FiltrosUrl {
  const pagina = Number(params.get('pagina'));

  return {
    q: (params.get('q') ?? '').trim().slice(0, MAX_BUSQUEDA),
    soloActivas: params.get('soloActivas') !== 'false',
    stockBajo: params.get('stockBajo') === 'true',
    pagina: Number.isInteger(pagina) && pagina > 0 ? pagina : 1
  };
}

@Component({
  selector: 'app-piezas-lista',
  imports: [
    CargandoComponent,
    EurosPipe,
    ModalConfirmacionComponent,
    PaginadorComponent,
    PiezaDialogComponent,
    ReactiveFormsModule,
    StockDialogComponent,
    VacioComponent
  ],
  templateUrl: './piezas-lista.component.html',
  styleUrl: './piezas-lista.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PiezasListaComponent {
  private readonly piezas = inject(PiezasService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);
  private readonly rol = inject(AuthService).rol;

  private readonly recargas = new Subject<void>();
  private readonly dialogoPieza = viewChild.required(PiezaDialogComponent);
  private readonly dialogoStock = viewChild.required(StockDialogComponent);

  protected readonly maxBusqueda = MAX_BUSQUEDA;

  protected readonly form = inject(NonNullableFormBuilder).group({
    q: '',
    soloActivas: true,
    stockBajo: false
  });

  protected readonly esAdmin = computed(() => this.rol() === 'admin');

  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly resultado = signal<Pagina<Pieza> | null>(null);
  private readonly filtros = signal<FiltrosUrl>(leerFiltros(this.ruta.snapshot.queryParamMap));

  protected readonly dialogoPiezaAbierto = signal(false);
  protected readonly piezaEditada = signal<Pieza | null>(null);
  protected readonly guardandoPieza = signal(false);

  protected readonly piezaStock = signal<Pieza | null>(null);
  protected readonly guardandoStock = signal(false);

  protected readonly piezaBaja = signal<Pieza | null>(null);
  protected readonly bajaEnCurso = signal(false);

  protected readonly tituloVacio = computed(() => {
    const { q, stockBajo } = this.filtros();
    return q || stockBajo ? 'No hay piezas con estos filtros' : 'No hay piezas en el catálogo';
  });

  protected readonly mensajeBaja = computed(() => {
    const pieza = this.piezaBaja();
    return pieza === null
      ? ''
      : `La pieza ${pieza.referencia} · ${pieza.nombre} dejará de estar disponible para nuevos presupuestos.`;
  });

  constructor() {
    const filtrosUrl$ = this.ruta.queryParamMap.pipe(map(leerFiltros));

    // Una recarga tras un cambio no pasa por prepararCarga: la tabla sigue en pantalla
    // y el foco puede volver al botón que abrió el diálogo
    merge(
      filtrosUrl$.pipe(tap((filtros) => this.prepararCarga(filtros))),
      this.recargas.pipe(map(() => this.filtros()))
    )
      .pipe(
        switchMap((filtros) => this.pedirPiezas(filtros)),
        takeUntilDestroyed()
      )
      .subscribe((resultado) => this.mostrar(resultado));

    // Lo que viene de la URL también pasa por distinctUntilChanged: si no, tras restaurar un
    // filtro, volver a escribir el último texto buscado se descartaría por repetido
    merge(
      filtrosUrl$.pipe(map(({ q }) => q)),
      this.form.controls.q.valueChanges.pipe(
        debounceTime(DEBOUNCE_MS),
        map((q) => q.trim())
      )
    )
      .pipe(
        distinctUntilChanged(),
        filter((q) => q !== this.filtros().q),
        takeUntilDestroyed()
      )
      .subscribe(() => this.aplicarFiltros());

    merge(this.form.controls.soloActivas.valueChanges, this.form.controls.stockBajo.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.aplicarFiltros());
  }

  protected cambiarPagina(pagina: number): void {
    this.navegar({ ...this.filtros(), pagina });
  }

  protected reintentar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.recargas.next();
  }

  protected nuevaPieza(): void {
    this.piezaEditada.set(null);
    this.dialogoPiezaAbierto.set(true);
  }

  protected editarPieza(pieza: Pieza): void {
    this.piezaEditada.set(pieza);
    this.dialogoPiezaAbierto.set(true);
  }

  protected guardarPieza(datos: PiezaRequest): void {
    const pieza = this.piezaEditada();
    const peticion =
      pieza === null ? this.piezas.crear(datos) : this.piezas.actualizar(pieza.id, datos);

    this.guardandoPieza.set(true);
    peticion.pipe(finalize(() => this.guardandoPieza.set(false))).subscribe({
      next: () => {
        this.dialogoPiezaAbierto.set(false);
        this.toast.exito(pieza === null ? 'Pieza creada' : 'Pieza actualizada');
        this.recargas.next();
      },
      error: (error: unknown) => this.dialogoPieza().mostrarErrorServidor(error)
    });
  }

  protected guardarStock(datos: StockDeltaRequest): void {
    const pieza = this.piezaStock();
    if (pieza === null) {
      return;
    }

    this.guardandoStock.set(true);
    this.piezas
      .ajustarStock(pieza.id, datos)
      .pipe(finalize(() => this.guardandoStock.set(false)))
      .subscribe({
        next: () => {
          this.piezaStock.set(null);
          this.toast.exito('Stock actualizado');
          this.recargas.next();
        },
        error: (error: unknown) => this.dialogoStock().mostrarErrorServidor(error)
      });
  }

  protected confirmarBaja(): void {
    const pieza = this.piezaBaja();
    if (pieza === null) {
      return;
    }

    this.piezaBaja.set(null);
    this.bajaEnCurso.set(true);
    this.piezas
      .darDeBaja(pieza.id)
      .pipe(finalize(() => this.bajaEnCurso.set(false)))
      .subscribe({
        next: () => {
          this.toast.exito('Pieza dada de baja');
          this.recargas.next();
        },
        error: (error: unknown) => this.avisarErrorBaja(error)
      });
  }

  private avisarErrorBaja(error: unknown): void {
    const apiError = aApiError(error);

    // El interceptor ya avisa de los fallos de conexión y de los errores 5xx
    if (apiError.status >= 400 && apiError.status < 500) {
      this.toast.error(apiError.mensaje);
    }
  }

  private aplicarFiltros(): void {
    const { q, soloActivas, stockBajo } = this.form.getRawValue();
    this.navegar({ q: q.trim(), soloActivas, stockBajo, pagina: 1 });
  }

  // replaceUrl evita que cada búsqueda añada una entrada más al historial del navegador
  private navegar({ q, soloActivas, stockBajo, pagina }: FiltrosUrl): void {
    void this.router.navigate([], {
      relativeTo: this.ruta,
      replaceUrl: true,
      queryParams: {
        q: q || null,
        soloActivas: soloActivas ? null : false,
        stockBajo: stockBajo ? true : null,
        pagina: pagina > 1 ? pagina : null
      }
    });
  }

  private prepararCarga(filtros: FiltrosUrl): void {
    this.filtros.set(filtros);
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.restaurarFormulario(filtros);
  }

  private restaurarFormulario({ q, soloActivas, stockBajo }: FiltrosUrl): void {
    const { controls } = this.form;

    // Sin esta comprobación se borraría el espacio final mientras se escribe «Aceite 5W»
    if (controls.q.value.trim() !== q) {
      controls.q.setValue(q, { emitEvent: false });
    }
    controls.soloActivas.setValue(soloActivas, { emitEvent: false });
    controls.stockBajo.setValue(stockBajo, { emitEvent: false });
  }

  private pedirPiezas(filtros: FiltrosUrl): Observable<Pagina<Pieza> | null> {
    const { q, soloActivas, stockBajo, pagina } = filtros;

    return this.piezas.listar({ q, soloActivas, stockBajo, pagina, limite: LIMITE }).pipe(
      catchError((error: unknown) => {
        this.errorCarga.set(mensajeDeError(error));
        return of(null);
      })
    );
  }

  private mostrar(resultado: Pagina<Pieza> | null): void {
    // Dar de baja la última pieza de una página, o un enlace antiguo, deja una página vacía
    const pagina = this.filtros().pagina;
    if (resultado !== null && resultado.datos.length === 0 && pagina > 1) {
      this.cambiarPagina(Math.max(1, Math.min(resultado.totalPaginas, pagina - 1)));
      return;
    }

    this.cargando.set(false);
    if (resultado !== null) {
      this.resultado.set(resultado);
    }
  }
}
