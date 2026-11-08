import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-toast-contenedor',
  templateUrl: './toast-contenedor.component.html',
  styleUrl: './toast-contenedor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastContenedorComponent {
  protected readonly toast = inject(ToastService);
}
