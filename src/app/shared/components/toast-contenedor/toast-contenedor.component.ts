import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ToastService, type TipoToast } from '@core/services/toast.service';

// Distinguen el tipo de aviso sin depender del color
const ICONOS: Record<TipoToast, string> = {
  exito: 'M5 12l5 5 9-10',
  error: 'M12 6v8M12 18h.01',
  info: 'M12 11v7M12 6h.01',
};

@Component({
  selector: 'app-toast-contenedor',
  templateUrl: './toast-contenedor.component.html',
  styleUrl: './toast-contenedor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContenedorComponent {
  protected readonly toast = inject(ToastService);

  protected readonly iconos = ICONOS;

  protected readonly regiones = computed(() => {
    const avisos = this.toast.avisos();

    return [
      { rol: 'status', avisos: avisos.filter(({ tipo }) => tipo !== 'error') },
      { rol: 'alert', avisos: avisos.filter(({ tipo }) => tipo === 'error') },
    ];
  });
}
