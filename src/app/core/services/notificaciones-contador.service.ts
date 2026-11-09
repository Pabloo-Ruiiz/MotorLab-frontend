import { DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import {
  catchError,
  distinctUntilChanged,
  EMPTY,
  fromEvent,
  map,
  merge,
  Observable,
  startWith,
  Subject,
  Subscription,
  switchMap,
  timer
} from 'rxjs';

import { AuthService } from './auth.service';
import { NotificacionesService } from './notificaciones.service';

const INTERVALO_MS = 30_000;

@Injectable({ providedIn: 'root' })
export class NotificacionesContadorService {
  private readonly auth = inject(AuthService);
  private readonly notificaciones = inject(NotificacionesService);
  private readonly documento = inject(DOCUMENT);

  private readonly forzado = new Subject<void>();
  private suscripcion: Subscription | null = null;

  readonly noLeidas = signal(0);

  constructor() {
    effect(() => {
      if (this.auth.estaAutenticado()) {
        this.iniciar();
      } else {
        this.detener();
      }
    });
  }

  iniciar(): void {
    if (this.suscripcion !== null) {
      return;
    }

    this.suscripcion = merge(this.consultasPeriodicas(), this.forzado)
      .pipe(
        // Un fallo se ignora para que la consulta siga activa en el siguiente ciclo
        switchMap(() => this.notificaciones.contador().pipe(catchError(() => EMPTY)))
      )
      .subscribe((noLeidas) => this.noLeidas.set(noLeidas));
  }

  detener(): void {
    this.suscripcion?.unsubscribe();
    this.suscripcion = null;
    this.noLeidas.set(0);
  }

  refrescar(): void {
    this.forzado.next();
  }

  // Al volver a la pestaña el temporizador se reinicia, así que se consulta en ese momento
  private consultasPeriodicas(): Observable<number> {
    return fromEvent(this.documento, 'visibilitychange').pipe(
      startWith(undefined),
      map(() => this.documento.visibilityState !== 'hidden'),
      distinctUntilChanged(),
      switchMap((visible) => (visible ? timer(0, INTERVALO_MS) : EMPTY))
    );
  }
}
