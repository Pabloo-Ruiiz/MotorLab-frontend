import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { finalize, Subscription } from 'rxjs';

import type { Notificacion } from '@core/models';
import { NotificacionesContadorService } from '@core/services/notificaciones-contador.service';
import { NotificacionesService } from '@core/services/notificaciones.service';
import { FechaHoraPipe } from '@shared/pipes/fecha-hora.pipe';
import { ICONOS_NOTIFICACION, TITULOS_NOTIFICACION } from '@shared/util/notificaciones';

const LIMITE = 5;
const ICONO_CAMPANA = 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4l2-2ZM10 21h4';
const MINUTO = 60_000;

// La API envía las fechas sin zona horaria: se interpretan como hora local, igual que se muestran
function tiempoTranscurrido(fecha: string, ahora: number): string | null {
  const instante = new Date(fecha).getTime();
  if (Number.isNaN(instante)) {
    return null;
  }

  const minutos = Math.floor((ahora - instante) / MINUTO);
  if (minutos < 0) {
    return null;
  }
  if (minutos < 1) {
    return 'Ahora';
  }
  if (minutos < 60) {
    return `Hace ${minutos} min`;
  }

  const horas = Math.floor(minutos / 60);
  if (horas < 24) {
    return `Hace ${horas} h`;
  }

  const dias = Math.floor(horas / 24);
  if (dias === 1) {
    return 'Ayer';
  }
  return dias < 7 ? `Hace ${dias} días` : null; // null: se muestra la fecha
}

// Campana de la cabecera con un desplegable de los últimos avisos. Al elegir uno se marca como
// leído (si no lo estaba) y se abre en la pantalla Avisos
@Component({
  selector: 'app-campana-avisos',
  imports: [FechaHoraPipe, RouterLink],
  templateUrl: './campana-avisos.component.html',
  styleUrl: './campana-avisos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'alPulsarFuera($event)',
    '(keydown.escape)': 'cerrar(true)',
  },
})
export class CampanaAvisosComponent {
  private readonly notificaciones = inject(NotificacionesService);
  private readonly contador = inject(NotificacionesContadorService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly boton = viewChild.required<ElementRef<HTMLButtonElement>>('boton');

  private peticion: Subscription | null = null;

  protected readonly iconoCampana = ICONO_CAMPANA;
  protected readonly iconos = ICONOS_NOTIFICACION;
  protected readonly titulos = TITULOS_NOTIFICACION;

  protected readonly noLeidas = this.contador.noLeidas;
  protected readonly abierto = signal(false);
  protected readonly cargando = signal(false);
  protected readonly error = signal(false);
  protected readonly avisos = signal<Notificacion[]>([]);
  protected readonly ahora = signal(Date.now());

  protected readonly transcurrido = tiempoTranscurrido;

  protected alternar(): void {
    if (this.abierto()) {
      this.cerrar(false);
    } else {
      this.abrir();
    }
  }

  protected cargar(): void {
    this.peticion?.unsubscribe();
    this.cargando.set(true);
    this.error.set(false);

    this.peticion = this.notificaciones
      .listar({ limite: LIMITE })
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ datos }) => this.avisos.set(datos),
        error: () => this.error.set(true),
      });
  }

  protected elegir(aviso: Notificacion): void {
    this.cerrar(false);

    if (aviso.leida) {
      this.irAAvisos(aviso.id);
      return;
    }

    // Se navega también si falla: el aviso sigue disponible en la lista, sin leer
    this.notificaciones.marcarLeida(aviso.id).subscribe({
      next: () => {
        this.contador.refrescar();
        this.irAAvisos(aviso.id);
      },
      error: () => this.irAAvisos(aviso.id),
    });
  }

  protected cerrar(devolverFoco: boolean): void {
    if (!this.abierto()) {
      return;
    }

    this.abierto.set(false);
    this.peticion?.unsubscribe();
    if (devolverFoco) {
      this.boton().nativeElement.focus();
    }
  }

  protected alPulsarFuera(evento: MouseEvent): void {
    if (this.abierto() && !this.elemento.nativeElement.contains(evento.target as Node)) {
      this.cerrar(false);
    }
  }

  private abrir(): void {
    this.ahora.set(Date.now());
    this.abierto.set(true);
    this.contador.refrescar();
    this.cargar();
  }

  private irAAvisos(id: number): void {
    void this.router.navigate(['/cliente/avisos'], { queryParams: { aviso: id } });
  }
}
