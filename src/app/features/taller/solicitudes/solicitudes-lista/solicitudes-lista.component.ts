import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import {
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  forkJoin,
  map,
  merge,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  tap
} from 'rxjs';

import {
  ETIQUETAS_ESTADO,
  ETIQUETAS_TIPO_SERVICIO,
  ETIQUETAS_URGENCIA,
  type EstadoOrden,
  type OrdenResumen,
  type Pagina,
  type Urgencia
} from '@core/models';
import { OrdenesService } from '@core/services/ordenes.service';
import { UsuariosService } from '@core/services/usuarios.service';
import { mensajeDeError } from '@core/util/api-error';
import { FocoTrasCarga } from '@core/util/foco';
import { matriculaLegible } from '@core/util/matricula';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { PaginadorComponent } from '@shared/components/paginador/paginador.component';
import { PillPagoComponent } from '@shared/components/pill-pago/pill-pago.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';
import { FechaHoraPipe } from '@shared/pipes/fecha-hora.pipe';
import { TONOS_ESTADO, TONOS_URGENCIA } from '@shared/util/tonos';

const LIMITE = 20;
const DEBOUNCE_MS = 300;
const MAX_BUSQUEDA = 120;

// Atajos de la tira de indicadores: cada uno aplica un filtro de estado o de urgencia
export type Atajo = 'nuevas' | 'alta' | 'pendientes' | 'todas';

interface Resumen {
  nuevas: number | null;
  alta: number | null;
  pendientes: number | null;
  total: number | null;
}

const FILTROS_ATAJO: Record<Atajo, { estado: EstadoOrden | ''; urgencia: Urgencia | '' }> = {
  nuevas: { estado: 'solicitud_recibida', urgencia: '' },
  alta: { estado: '', urgencia: 'alta' },
  pendientes: { estado: 'pendiente_presupuesto', urgencia: '' },
  todas: { estado: '', urgencia: '' }
};

interface FiltrosUrl {
  q: string;
  estado: EstadoOrden | '';
  urgencia: Urgencia | '';
  mecanicoId: string;
  pagina: number;
}

function opcionesDe<T extends string>(etiquetas: Record<T, string>): { valor: T; texto: string }[] {
  return (Object.entries(etiquetas) as [T, string][]).map(([valor, texto]) => ({ valor, texto }));
}

function valorValido<T extends string>(valor: string | null, etiquetas: Record<T, string>): T | '' {
  return valor !== null && Object.hasOwn(etiquetas, valor) ? (valor as T) : '';
}

function enteroPositivo(valor: string | null): number | null {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

// La URL se puede editar a mano: un valor que el servidor rechazaría se trata como si no estuviera
function leerFiltros(params: ParamMap): FiltrosUrl {
  return {
    q: (params.get('q') ?? '').trim().slice(0, MAX_BUSQUEDA),
    estado: valorValido(params.get('estado'), ETIQUETAS_ESTADO),
    urgencia: valorValido(params.get('urgencia'), ETIQUETAS_URGENCIA),
    mecanicoId: enteroPositivo(params.get('mecanicoId'))?.toString() ?? '',
    pagina: enteroPositivo(params.get('pagina')) ?? 1
  };
}

@Component({
  selector: 'app-solicitudes-lista',
  imports: [
    AvatarComponent,
    CargandoComponent,
    FechaHoraPipe,
    LogoComponent,
    PaginadorComponent,
    PillPagoComponent,
    ReactiveFormsModule,
    RouterLink,
    VacioComponent
  ],
  templateUrl: './solicitudes-lista.component.html',
  styleUrl: './solicitudes-lista.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SolicitudesListaComponent {
  private readonly ordenes = inject(OrdenesService);
  private readonly usuarios = inject(UsuariosService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);
  private readonly foco = new FocoTrasCarga();

  private readonly reintentos = new Subject<void>();

  protected readonly etiquetasServicio = ETIQUETAS_TIPO_SERVICIO;
  protected readonly etiquetasEstado = ETIQUETAS_ESTADO;
  protected readonly etiquetasUrgencia = ETIQUETAS_URGENCIA;
  protected readonly tonosEstado = TONOS_ESTADO;
  protected readonly tonosUrgencia = TONOS_URGENCIA;
  protected readonly matriculaLegible = matriculaLegible;
  protected readonly maxBusqueda = MAX_BUSQUEDA;
  protected readonly opcionesEstado = opcionesDe(ETIQUETAS_ESTADO);
  protected readonly opcionesUrgencia = opcionesDe(ETIQUETAS_URGENCIA);

  protected readonly form = inject(NonNullableFormBuilder).group({
    q: '',
    estado: '' as EstadoOrden | '',
    urgencia: '' as Urgencia | '',
    mecanicoId: ''
  });

  protected readonly mecanicos = toSignal(
    this.usuarios.listarMecanicos().pipe(catchError(() => of([]))),
    { initialValue: [] }
  );

  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly resultado = signal<Pagina<OrdenResumen> | null>(null);
  protected readonly resumen = signal<Resumen | null>(null);
  private readonly filtros = signal<FiltrosUrl>(leerFiltros(this.ruta.snapshot.queryParamMap));

  protected readonly tituloVacio = computed(() => {
    const { q, estado, urgencia, mecanicoId } = this.filtros();
    return q || estado || urgencia || mecanicoId
      ? 'No hay órdenes con estos filtros'
      : 'Todavía no hay órdenes';
  });

  protected readonly filtrosActivos = computed(() => {
    const { q, estado, urgencia, mecanicoId } = this.filtros();
    return [q, estado, urgencia, mecanicoId].filter(Boolean).length;
  });

  // El atajo resaltado es el que coincide exactamente con los filtros de la URL
  protected readonly atajoActivo = computed<Atajo | null>(() => {
    const { q, estado, urgencia, mecanicoId } = this.filtros();
    if (q || mecanicoId) {
      return null;
    }
    const atajo = (Object.keys(FILTROS_ATAJO) as Atajo[]).find(
      (clave) => FILTROS_ATAJO[clave].estado === estado && FILTROS_ATAJO[clave].urgencia === urgencia
    );
    return atajo ?? null;
  });

  constructor() {
    const filtrosUrl$ = this.ruta.queryParamMap.pipe(map(leerFiltros));

    // La URL manda: cualquier cambio de filtro o de página llega aquí a través de ella
    combineLatest([filtrosUrl$, this.reintentos.pipe(startWith(undefined))])
      .pipe(
        map(([filtros]) => filtros),
        tap((filtros) => this.prepararCarga(filtros)),
        switchMap((filtros) => this.pedirOrdenes(filtros)),
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

    merge(
      this.form.controls.estado.valueChanges,
      this.form.controls.urgencia.valueChanges,
      this.form.controls.mecanicoId.valueChanges
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.aplicarFiltros());

    this.cargarResumen();
  }

  protected aplicarAtajo(atajo: Atajo): void {
    this.navegar({ q: '', mecanicoId: '', pagina: 1, ...FILTROS_ATAJO[atajo] });
  }

  protected limpiarFiltros(): void {
    this.aplicarAtajo('todas');
  }

  protected actualizar(): void {
    this.cargarResumen();
    this.reintentos.next();
  }

  protected cambiarPagina(pagina: number): void {
    this.foco.marcar();
    this.navegar({ ...this.filtros(), pagina });
  }

  protected reintentar(): void {
    this.foco.marcar();
    this.cargarResumen();
    this.reintentos.next();
  }

  protected abrir(orden: OrdenResumen): void {
    void this.router.navigate(['/taller/ordenes', orden.ordenId]);
  }

  private aplicarFiltros(): void {
    const { q, estado, urgencia, mecanicoId } = this.form.getRawValue();
    this.navegar({ q: q.trim(), estado, urgencia, mecanicoId, pagina: 1 });
  }

  // replaceUrl evita que cada búsqueda añada una entrada más al historial del navegador
  private navegar({ q, estado, urgencia, mecanicoId, pagina }: FiltrosUrl): void {
    void this.router.navigate([], {
      relativeTo: this.ruta,
      replaceUrl: true,
      queryParams: {
        q: q || null,
        estado: estado || null,
        urgencia: urgencia || null,
        mecanicoId: mecanicoId || null,
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

  private restaurarFormulario({ q, estado, urgencia, mecanicoId }: FiltrosUrl): void {
    const { controls } = this.form;

    // Sin esta comprobación se borraría el espacio final mientras se escribe «Juan Pérez»
    if (controls.q.value.trim() !== q) {
      controls.q.setValue(q, { emitEvent: false });
    }
    controls.estado.setValue(estado, { emitEvent: false });
    controls.urgencia.setValue(urgencia, { emitEvent: false });
    controls.mecanicoId.setValue(mecanicoId, { emitEvent: false });
  }

  private pedirOrdenes(filtros: FiltrosUrl): Observable<Pagina<OrdenResumen> | null> {
    const { q, estado, urgencia, mecanicoId, pagina } = filtros;

    return this.ordenes
      .listar({
        q,
        estado: estado || null,
        urgencia: urgencia || null,
        mecanicoId: mecanicoId ? Number(mecanicoId) : null,
        pagina,
        limite: LIMITE
      })
      .pipe(
        catchError((error: unknown) => {
          this.errorCarga.set(mensajeDeError(error));
          return of(null);
        })
      );
  }

  private mostrar(resultado: Pagina<OrdenResumen> | null): void {
    // Un enlace antiguo puede apuntar a una página que ya no existe
    const pagina = this.filtros().pagina;
    if (resultado !== null && resultado.datos.length === 0 && pagina > 1) {
      this.cambiarPagina(Math.max(1, Math.min(resultado.totalPaginas, pagina - 1)));
      return;
    }

    this.cargando.set(false);
    if (resultado !== null) {
      this.resultado.set(resultado);
    }
    this.foco.restaurar();
  }

  // Independiente de los filtros de la tabla: basta el total de consultas de un elemento
  private cargarResumen(): void {
    const contar = (filtros: { estado?: EstadoOrden; urgencia?: Urgencia }) =>
      this.ordenes.listar({ ...filtros, limite: 1 }).pipe(
        map(({ total }) => total),
        catchError(() => of(null))
      );

    forkJoin({
      nuevas: contar({ estado: 'solicitud_recibida' }),
      alta: contar({ urgencia: 'alta' }),
      pendientes: contar({ estado: 'pendiente_presupuesto' }),
      total: contar({})
    }).subscribe((resumen) => this.resumen.set(resumen));
  }
}
