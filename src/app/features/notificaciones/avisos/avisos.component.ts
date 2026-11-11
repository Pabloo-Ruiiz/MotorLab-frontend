import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  skip,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';

import type { Notificacion, Pagina } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { NotificacionesContadorService } from '@core/services/notificaciones-contador.service';
import { NotificacionesService } from '@core/services/notificaciones.service';
import { ToastService } from '@core/services/toast.service';
import { aApiError, mensajeDeError } from '@core/util/api-error';
import { FocoTrasCarga } from '@core/util/foco';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { PaginadorComponent } from '@shared/components/paginador/paginador.component';
import { FechaHoraPipe } from '@shared/pipes/fecha-hora.pipe';

import { ICONOS_AVISOS, presentarAviso } from './avisos.presentacion';

type Filtro = 'todas' | 'sin_leer';

const LIMITE = 20;

@Component({
  selector: 'app-avisos',
  imports: [CargandoComponent, FechaHoraPipe, LogoComponent, PaginadorComponent],
  templateUrl: './avisos.component.html',
  styleUrl: './avisos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvisosComponent {
  private readonly notificaciones = inject(NotificacionesService);
  private readonly contador = inject(NotificacionesContadorService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly foco = new FocoTrasCarga();
  private readonly injector = inject(Injector);
  private readonly ruta = inject(ActivatedRoute);

  private readonly peticiones = new Subject<void>();

  protected readonly iconos = ICONOS_AVISOS;

  // Aviso elegido en el desplegable de la campana (?aviso=id): se resalta en la lista
  protected readonly destacado = toSignal(
    this.ruta.queryParamMap.pipe(map((params) => Number(params.get('aviso')) || null)),
    { initialValue: null },
  );
  protected readonly filtros: readonly { valor: Filtro; texto: string }[] = [
    { valor: 'todas', texto: 'Todas' },
    { valor: 'sin_leer', texto: 'Sin leer' },
  ];

  protected readonly filtro = signal<Filtro>('todas');
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly resultado = signal<Pagina<Notificacion> | null>(null);
  protected readonly marcandoTodas = signal(false);

  // El layout del taller no tiene cabecera con el título de la pantalla
  protected readonly enTaller = computed(() => {
    const rol = this.auth.rol();
    return rol === 'admin' || rol === 'mecanico';
  });

  // Avisos de la página actual con su icono, título y tono (solo presentación)
  protected readonly avisos = computed(() => this.resultado()?.datos.map(presentarAviso) ?? []);

  // Resumen con valores reales: el total sale del listado sin filtrar y las no leídas del contador
  protected readonly noLeidas = this.contador.noLeidas;
  private readonly totalAvisos = signal<number | null>(null);
  protected readonly resumen = computed(() => {
    const total = this.totalAvisos();
    if (total === null || total === 0) {
      return null;
    }
    const noLeidas = Math.min(this.noLeidas(), total);
    return { total, noLeidas, leidas: total - noLeidas };
  });

  // Solo tiene sentido marcar todas si queda alguna sin leer (según el contador o la página visible)
  protected readonly hayNoLeidas = computed(
    () => this.noLeidas() > 0 || (this.resultado()?.datos.some((aviso) => !aviso.leida) ?? false),
  );

  protected readonly vacio = computed(() => {
    if (this.filtro() === 'sin_leer') {
      return { titulo: 'Estás al día', texto: 'No tienes avisos pendientes de leer.' };
    }
    return {
      titulo: 'No tienes avisos por el momento',
      texto: this.enTaller()
        ? 'Te avisaremos cuando haya novedades en el taller.'
        : 'Te avisaremos cuando haya novedades sobre tus vehículos.',
    };
  });

  constructor() {
    // switchMap descarta la respuesta anterior si se cambia de filtro o de página antes de que llegue
    this.peticiones
      .pipe(
        startWith(undefined),
        switchMap(() => this.pedirListado()),
        takeUntilDestroyed(),
      )
      .subscribe((resultado) => this.mostrar(resultado));

    // Si ya se está en Avisos, elegir otro aviso en la campana solo cambia el parámetro:
    // se vuelve a pedir la lista para reflejar que se ha marcado como leído
    this.ruta.queryParamMap.pipe(skip(1), takeUntilDestroyed()).subscribe(() => {
      this.peticiones.next();
    });
  }

  protected cambiarFiltro(filtro: Filtro): void {
    if (filtro !== this.filtro()) {
      this.filtro.set(filtro);
      this.cambiarPagina(1);
    }
  }

  protected cambiarPagina(pagina: number): void {
    this.pagina.set(pagina);
    this.cargar();
  }

  protected cargar(): void {
    this.foco.marcar();
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.peticiones.next();
  }

  protected abrir(aviso: Notificacion): void {
    if (aviso.leida) {
      this.irAOrden(aviso.ordenId);
      return;
    }

    this.notificaciones.marcarLeida(aviso.id).subscribe({
      next: () => {
        this.contador.refrescar();
        this.peticiones.next();
        this.irAOrden(aviso.ordenId);
      },
      error: (error: unknown) => this.mostrarError(error),
    });
  }

  protected marcarTodas(): void {
    this.marcandoTodas.set(true);

    this.notificaciones
      .marcarTodas()
      .pipe(finalize(() => this.marcandoTodas.set(false)))
      .subscribe({
        next: () => {
          this.contador.refrescar();
          this.peticiones.next();
        },
        error: (error: unknown) => this.mostrarError(error),
      });
  }

  private pedirListado(): Observable<Pagina<Notificacion> | null> {
    const leida = this.filtro() === 'sin_leer' ? false : null;

    return this.notificaciones.listar({ leida, pagina: this.pagina(), limite: LIMITE }).pipe(
      catchError((error: unknown) => {
        this.errorCarga.set(mensajeDeError(error));
        return of(null);
      }),
    );
  }

  private mostrar(resultado: Pagina<Notificacion> | null): void {
    // Con el filtro «Sin leer», marcar avisos puede dejar vacía la página actual
    if (resultado !== null && resultado.datos.length === 0 && this.pagina() > 1) {
      this.pagina.set(Math.max(1, Math.min(resultado.totalPaginas, this.pagina() - 1)));
      this.peticiones.next();
      return;
    }

    this.cargando.set(false);
    if (resultado !== null) {
      if (this.filtro() === 'todas') {
        this.totalAvisos.set(resultado.total);
      }
      this.resultado.set(resultado);
      this.errorCarga.set(null);
    }
    this.foco.restaurar();
    this.mostrarDestacado();
  }

  private mostrarDestacado(): void {
    const id = this.destacado();
    if (id === null) {
      return;
    }

    afterNextRender(
      () => document.getElementById(`aviso-${id}`)?.scrollIntoView({ block: 'nearest' }),
      { injector: this.injector },
    );
  }

  private irAOrden(ordenId: number | null): void {
    if (ordenId === null) {
      return;
    }

    switch (this.auth.rol()) {
      case 'cliente':
        void this.router.navigate(['/cliente/ordenes', ordenId]);
        break;
      case 'admin':
        void this.router.navigate(['/taller/ordenes', ordenId]);
        break;
      case 'mecanico':
        void this.router.navigate(['/taller/mis-ordenes', ordenId]);
        break;
    }
  }

  private mostrarError(error: unknown): void {
    // El interceptor ya avisa de los fallos de conexión y de los errores 5xx
    const apiError = aApiError(error);
    if (apiError.status >= 400 && apiError.status < 500) {
      this.toast.error(apiError.mensaje);
    }
  }
}
