import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';

@Component({
  selector: 'app-barra-progreso',
  templateUrl: './barra-progreso.component.html',
  styleUrl: './barra-progreso.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarraProgresoComponent {
  readonly progreso = input.required<number>();
  readonly mostrarPorcentaje = input(false, { transform: booleanAttribute });
  readonly etiqueta = input('Progreso');

  protected readonly valor = computed(() => Math.min(100, Math.max(0, this.progreso())));
}
