import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContenedorComponent } from '@shared/components/toast-contenedor/toast-contenedor.component';

@Component({
  imports: [RouterOutlet, ToastContenedorComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('motorlab');
}
