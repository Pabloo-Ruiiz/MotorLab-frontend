import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { filter, map, startWith } from 'rxjs';

interface Pestana {
  ruta: string;
  texto: string;
  icono: string; // atributo «d» del SVG, sobre una cuadrícula de 24x24
}

const ICONO_CAMPANA = 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4l2-2ZM10 21h4';

@Component({
  selector: 'app-cliente-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './cliente-layout.component.html',
  styleUrl: './cliente-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClienteLayoutComponent {
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly iconoCampana = ICONO_CAMPANA;

  protected readonly pestanas: readonly Pestana[] = [
    {
      ruta: '/cliente/vehiculos',
      texto: 'Vehículos',
      icono:
        'M5.5 17H3v-5l2.5-6h13l2.5 6v5h-2.5M9.5 17h5M3 12h18M9.5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM18.5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z'
    },
    {
      ruta: '/cliente/ordenes',
      texto: 'Órdenes',
      icono: 'M9 3h6v4H9zM9 5H5v16h14V5h-4M9 12h6M9 16h6'
    },
    { ruta: '/cliente/avisos', texto: 'Avisos', icono: ICONO_CAMPANA },
    {
      ruta: '/cliente/perfil',
      texto: 'Perfil',
      icono: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0'
    }
  ];

  // TODO: se conecta con el servicio de avisos en el paso de notificaciones
  protected readonly noLeidas = signal(0);

  protected readonly titulo = toSignal(
    this.router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      startWith(null),
      map(() => this.tituloDeLaRutaActual())
    ),
    { requireSync: true }
  );

  private tituloDeLaRutaActual(): string {
    let actual = this.ruta.snapshot;
    while (actual.firstChild) {
      actual = actual.firstChild;
    }
    return actual.data['titulo'] ?? '';
  }
}
