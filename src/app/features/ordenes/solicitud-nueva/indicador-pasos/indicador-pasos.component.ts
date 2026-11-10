import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface PasoIndicador {
  numero: number;
  nombre: string;
}

// Indicador visual de los pasos de la solicitud: completados, actual y pendientes.
// Solo presenta: el paso actual lo decide el formulario
@Component({
  selector: 'app-indicador-pasos',
  template: `
    <ol class="pasos" [style.--avance]="avance()">
      @for (p of pasos(); track p.numero) {
        <li
          class="pasos__paso"
          [class.pasos__paso--hecho]="paso() > p.numero"
          [attr.aria-current]="paso() === p.numero ? 'step' : null"
        >
          <span class="pasos__marca" aria-hidden="true">
            @if (paso() > p.numero) {
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M5 12l5 5 9-10" />
              </svg>
            } @else {
              {{ p.numero }}
            }
          </span>
          <span class="pasos__nombre">
            {{ p.nombre }}
            @if (paso() > p.numero) {
              <span class="sr-only">(completado)</span>
            }
          </span>
        </li>
      }
    </ol>
  `,
  styleUrl: './indicador-pasos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicadorPasosComponent {
  readonly pasos = input.required<readonly PasoIndicador[]>();
  readonly paso = input.required<number>();

  // Fracción de la línea que se rellena: 0 en el primer paso y 1 desde el último
  protected readonly avance = computed(() => {
    const total = this.pasos().length;
    return total > 1 ? (Math.min(this.paso(), total) - 1) / (total - 1) : 1;
  });
}
