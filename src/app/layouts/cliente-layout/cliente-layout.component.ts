import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  Data,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { ETIQUETAS_ROL } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { FotoPerfilService } from '@core/services/foto-perfil.service';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { ICONO_COCHE_CONTORNO } from '@shared/components/icono-coche/icono-coche.component';

import { CampanaAvisosComponent } from './campana-avisos/campana-avisos.component';

interface Pestana {
  ruta: string;
  texto: string;
  icono: string; // atributo «d» del SVG, sobre una cuadrícula de 24x24
}

const ICONO_CAMPANA = 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4l2-2ZM10 21h4';

@Component({
  selector: 'app-cliente-layout',
  imports: [CampanaAvisosComponent, LogoComponent, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './cliente-layout.component.html',
  styleUrl: './cliente-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClienteLayoutComponent {
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly auth = inject(AuthService);

  protected readonly etiquetasRol = ETIQUETAS_ROL;

  protected readonly pestanas: readonly Pestana[] = [
    {
      ruta: '/cliente/vehiculos',
      texto: 'Vehículos',
      icono: ICONO_COCHE_CONTORNO,
    },
    {
      ruta: '/cliente/ordenes',
      texto: 'Órdenes',
      icono: 'M9 3h6v4H9zM9 5H5v16h14V5h-4M9 12h6M9 16h6',
    },
    { ruta: '/cliente/avisos', texto: 'Avisos', icono: ICONO_CAMPANA },
    {
      ruta: '/cliente/perfil',
      texto: 'Perfil',
      icono: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0',
    },
  ];

  protected readonly foto = inject(FotoPerfilService).foto;

  private readonly datosDeRuta = toSignal(
    this.router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      startWith(null),
      map(() => this.datosDeLaRutaActual()),
    ),
    { requireSync: true },
  );

  protected readonly titulo = computed<string>(() => this.datosDeRuta()['titulo'] ?? '');
  // La pantalla pinta su propio título dentro de una ficha blanca, sobre fondo crema
  protected readonly fichaPropia = computed(() => this.datosDeRuta()['fichaPropia'] === true);

  private datosDeLaRutaActual(): Data {
    let actual = this.ruta.snapshot;
    while (actual.firstChild) {
      actual = actual.firstChild;
    }
    return actual.data;
  }
}
