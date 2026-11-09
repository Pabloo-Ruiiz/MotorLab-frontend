import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { ETIQUETAS_ROL } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { ModalConfirmacionComponent } from '@shared/components/modal-confirmacion/modal-confirmacion.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';

@Component({
  selector: 'app-perfil',
  imports: [ModalConfirmacionComponent, VacioComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerfilComponent {
  private readonly auth = inject(AuthService);

  protected readonly usuario = this.auth.usuario;
  protected readonly etiquetasRol = ETIQUETAS_ROL;
  protected readonly confirmandoCierre = signal(false);

  protected cerrarSesion(): void {
    this.confirmandoCierre.set(false);
    this.auth.cerrarSesion();
  }
}
