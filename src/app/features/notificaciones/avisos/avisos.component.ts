import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, finalize, Observable, of, startWith, Subject, switchMap } from 'rxjs';

import type { Notificacion, Pagina, TipoNotificacion } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { NotificacionesContadorService } from '@core/services/notificaciones-contador.service';
import { NotificacionesService } from '@core/services/notificaciones.service';
import { ToastService } from '@core/services/toast.service';
import { aApiError, mensajeDeError } from '@core/util/api-error';
import { FocoTrasCarga } from '@core/util/foco';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { PaginadorComponent } from '@shared/components/paginador/paginador.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';
import { FechaHoraPipe } from '@shared/pipes/fecha-hora.pipe';

type Filtro = 'todas' | 'sin_leer';

const LIMITE = 20;

// Atributo «d» de cada SVG, sobre una cuadrícula de 24x24
const ICONOS: Record<TipoNotificacion, string> = {
  solicitud_nueva: 'M4 13l3-8h10l3 8v6H4v-6ZM4 13h5l1.5 2.5h3L15 13h5',
  presupuesto_listo: 'M6 3h8l4 4v14H6V3ZM14 3v4h4M9 12h6M9 16h6',
  presupuesto_respondido: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12l3 3 5-6',
  cambio_estado: 'M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5',
  vehiculo_listo:
    'M5.5 17H3v-5l2.5-6h13l2.5 6v5h-2.5M9.5 17h5M3 12h18M9.5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM18.5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z'
};

@Component({
  selector: 'app-avisos',
  imports: [CargandoComponent, FechaHoraPipe, PaginadorComponent, VacioComponent],
  templateUrl: './avisos.component.html',
  styleUrl: './avisos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvisosComponent {
  private readonly notificaciones = inject(NotificacionesService);
  private readonly contador = inject(NotificacionesContadorService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly foco = new FocoTrasCarga();

  private readonly peticiones = new Subject<void>();

  protected readonly iconos = ICONOS;
  protected readonly filtros: readonly { valor: Filtro; texto: string }[] = [
    { valor: 'todas', texto: 'Todas' },
    { valor: 'sin_leer', texto: 'Sin leer' }
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

  protected readonly tituloVacio = computed(() =>
    this.filtro() === 'sin_leer' ? 'No tienes avisos sin leer' : 'No tienes avisos'
  );

  constructor() {
    // switchMap descarta la respuesta anterior si se cambia de filtro o de página antes de que llegue
    this.peticiones
      .pipe(
        startWith(undefined),
        switchMap(() => this.pedirListado()),
        takeUntilDestroyed()
      )
      .subscribe((resultado) => this.mostrar(resultado));
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
      error: (error: unknown) => this.mostrarError(error)
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
        error: (error: unknown) => this.mostrarError(error)
      });
  }

  private pedirListado(): Observable<Pagina<Notificacion> | null> {
    const leida = this.filtro() === 'sin_leer' ? false : null;

    return this.notificaciones.listar({ leida, pagina: this.pagina(), limite: LIMITE }).pipe(
      catchError((error: unknown) => {
        this.errorCarga.set(mensajeDeError(error));
        return of(null);
      })
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
      this.resultado.set(resultado);
      this.errorCarga.set(null);
    }
    this.foco.restaurar();
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
