import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ETIQUETAS_ROL } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { FotoPerfilService } from '@core/services/foto-perfil.service';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { ModalConfirmacionComponent } from '@shared/components/modal-confirmacion/modal-confirmacion.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';

import { CambiarFotoComponent } from '../cambiar-foto/cambiar-foto.component';

@Component({
  selector: 'app-perfil',
  imports: [
    CambiarFotoComponent,
    LogoComponent,
    ModalConfirmacionComponent,
    RouterLink,
    VacioComponent,
  ],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerfilComponent {
  private readonly auth = inject(AuthService);

  protected readonly usuario = this.auth.usuario;
  protected readonly etiquetasRol = ETIQUETAS_ROL;
  protected readonly foto = inject(FotoPerfilService).foto;
  protected readonly confirmandoCierre = signal(false);
  protected readonly cambiandoFoto = signal(false);

  // Primera letra de las dos primeras palabras: «Pablo Ruiz Gandia» pasa a «PR»
  protected readonly iniciales = computed(() =>
    (this.usuario()?.nombre ?? '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((palabra) => [...palabra][0] ?? '')
      .join('')
      .toUpperCase(),
  );

  protected cerrarSesion(): void {
    this.confirmandoCierre.set(false);
    this.auth.cerrarSesion();
  }
}
