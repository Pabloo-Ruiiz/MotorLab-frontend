import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificacionesContadorService } from '@core/services/notificaciones-contador.service';
import { ToastContenedorComponent } from '@shared/components/toast-contenedor/toast-contenedor.component';

@Component({
  imports: [RouterOutlet, ToastContenedorComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('motorlab');

  constructor() {
    // Se crea aquí, tras validar el token al arrancar, para que el contador siga la sesión
    inject(NotificacionesContadorService);
  }
}
