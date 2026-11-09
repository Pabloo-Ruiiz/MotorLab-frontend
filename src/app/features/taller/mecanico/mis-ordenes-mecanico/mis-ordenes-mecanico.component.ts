import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, map, Observable, of, switchMap } from 'rxjs';

import type { OrdenResumen } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { OrdenesService } from '@core/services/ordenes.service';
import { mensajeDeError } from '@core/util/api-error';
import { esEstadoFinal } from '@core/util/estados';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';
import { ListaOrdenesMecanicoComponent } from '../lista-ordenes-mecanico/lista-ordenes-mecanico.component';

const LIMITE = 100;

@Component({
  selector: 'app-mis-ordenes-mecanico',
  imports: [CargandoComponent, ListaOrdenesMecanicoComponent, VacioComponent],
  templateUrl: './mis-ordenes-mecanico.component.html',
  styleUrl: './mis-ordenes-mecanico.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MisOrdenesMecanicoComponent {
  private readonly ordenes = inject(OrdenesService);
  private readonly usuario = inject(AuthService).usuario;
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal<string | null>(null);
  private readonly todas = signal<OrdenResumen[]>([]);

  protected readonly activas = computed(() =>
    this.todas().filter(({ estado }) => !esEstadoFinal(estado))
  );
  protected readonly finalizadas = computed(() =>
    this.todas().filter(({ estado }) => esEstadoFinal(estado))
  );

  // El número solo se muestra cuando se conoce: durante la carga o tras un error no sería cierto
  protected readonly subtitulo = computed(() => {
    const total = this.activas().length;
    const partes = [
      this.usuario()?.nombre,
      this.cargando() || this.errorCarga() !== null
        ? undefined
        : `${total} ${total === 1 ? 'orden activa' : 'órdenes activas'}`
    ];

    return partes.filter((parte) => parte !== undefined).join(' · ');
  });

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.pedirDesde(1)
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (ordenes) => this.todas.set(ordenes),
        error: (error: unknown) => this.errorCarga.set(mensajeDeError(error))
      });
  }

  // Las finalizadas se acumulan: con una sola página podrían dejar fuera órdenes activas
  private pedirDesde(pagina: number): Observable<OrdenResumen[]> {
    return this.ordenes.listar({ pagina, limite: LIMITE }).pipe(
      switchMap(({ datos, totalPaginas }) =>
        pagina >= totalPaginas
          ? of(datos)
          : this.pedirDesde(pagina + 1).pipe(map((resto) => [...datos, ...resto]))
      )
    );
  }
}
