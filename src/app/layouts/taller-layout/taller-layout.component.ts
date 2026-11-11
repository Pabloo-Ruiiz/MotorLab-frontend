import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { ETIQUETAS_ROL, type Rol } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { FotoPerfilService } from '@core/services/foto-perfil.service';
import { enfocarPrincipal } from '@core/util/foco';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import {
  type PersonaVisor,
  VisorFotoComponent
} from '@shared/components/visor-foto/visor-foto.component';

interface Opcion {
  ruta: string;
  texto: string;
  icono: string; // atributo «d» del SVG, sobre una cuadrícula de 24x24
}

const PIEZAS: Opcion = {
  ruta: '/taller/piezas',
  texto: 'Piezas',
  icono: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
};

const AVISOS: Opcion = {
  ruta: '/taller/avisos',
  texto: 'Avisos',
  icono: 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4l2-2ZM10 21h4'
};

const OPCIONES_ADMIN: readonly Opcion[] = [
  {
    ruta: '/taller/solicitudes',
    texto: 'Solicitudes',
    icono: 'M4 13l3-8h10l3 8v6H4v-6ZM4 13h5l1.5 2.5h3L15 13h5'
  },
  PIEZAS,
  { ruta: '/taller/panel', texto: 'Panel', icono: 'M4 20h16M7 20v-7M12 20V5M17 20V10' },
  {
    ruta: '/taller/usuarios',
    texto: 'Usuarios',
    icono:
      'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM3 20a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14.5a6 6 0 0 1 3 5.5'
  },
  AVISOS
];

const OPCIONES_MECANICO: readonly Opcion[] = [
  {
    ruta: '/taller/mis-ordenes',
    texto: 'Mis órdenes',
    icono: 'M9 3h6v4H9zM9 5H5v16h14V5h-4M9 12h6M9 16h6'
  },
  PIEZAS,
  AVISOS,
  {
    ruta: '/taller/perfil',
    texto: 'Perfil',
    icono: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0'
  }
];

@Component({
  selector: 'app-taller-layout',
  imports: [
    AvatarComponent,
    LogoComponent,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    VisorFotoComponent
  ],
  templateUrl: './taller-layout.component.html',
  styleUrl: './taller-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TallerLayoutComponent {
  protected readonly auth = inject(AuthService);

  protected readonly etiquetasRol = ETIQUETAS_ROL;
  protected readonly foto = inject(FotoPerfilService).foto;
  protected readonly personaVisor = signal<PersonaVisor | null>(null);

  protected readonly opciones = computed<readonly Opcion[]>(() => {
    switch (this.auth.rol()) {
      case 'admin':
        return OPCIONES_ADMIN;
      case 'mecanico':
        return OPCIONES_MECANICO;
      default:
        return [];
    }
  });

  protected verFoto(nombre: string, rol: Rol): void {
    this.personaVisor.set({ nombre, rol, foto: this.foto() });
  }

  protected irAlContenido(): void {
    enfocarPrincipal();
  }
}
