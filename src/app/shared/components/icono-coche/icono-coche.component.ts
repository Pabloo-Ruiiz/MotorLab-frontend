import { ChangeDetectionStrategy, Component } from '@angular/core';

// Para las listas de iconos de trazo (menú, avisos): misma geometría que la silueta sólida.
// Atributo «d» sobre una cuadrícula de 24x24, con stroke-width 2
export const ICONO_COCHE_CONTORNO =
  'M4 15.5H2.6c-.6 0-1.1-.5-1.1-1.1v-2.2c0-.8.5-1.5 1.3-1.8l2-.7 3-2.6c.4-.3.9-.5 1.4-.5h4c.6 0 1.1.2 1.5.6l2.8 2.7 3.9 1c.9.2 1.5 1 1.5 1.9v1.6c0 .6-.5 1.1-1.1 1.1H20M8 15.5h8M4.8 9.7h12.7M11.5 6.6v3.1M8 15.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM20 15.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z';

// Silueta sólida con los cristales y los bujes calados, como el logo. Es decorativa: siempre
// acompaña a los datos del vehículo. Toma el color de `color` y el tamaño del elemento que la contiene
@Component({
  selector: 'app-icono-coche',
  template: `
    <svg viewBox="0 0 24 24" focusable="false">
      <path
        fill="currentColor"
        fill-rule="evenodd"
        d="M2.2 15.5H3.1A2.9 2.9 0 0 1 8.9 15.5H15.1A2.9 2.9 0 0 1 20.9 15.5H21.8Q22.6 15.5 22.6 14.7V12.9Q22.6 11.5 21.2 11.1L17.6 10.1 14.6 7.2Q14 6.6 13.1 6.6H9.2Q8.4 6.6 7.7 7.1L4.4 9.6 2.6 10.3Q1.4 10.8 1.4 12.1V14.7Q1.4 15.5 2.2 15.5ZM6.6 9.9 8.9 8.1Q9.3 7.8 9.7 7.8H11V9.9ZM12 7.8H13Q13.5 7.8 13.9 8.2L15.6 9.9H12ZM8 15.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM6.8 15.5a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0ZM20 15.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM18.8 15.5a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0Z"
      />
    </svg>
  `,
  styles: `
    :host {
      display: block;
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' }
})
export class IconoCocheComponent {}
