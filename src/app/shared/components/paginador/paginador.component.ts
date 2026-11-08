import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-paginador',
  templateUrl: './paginador.component.html',
  styleUrl: './paginador.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginadorComponent {
  readonly pagina = input.required<number>();
  readonly totalPaginas = input.required<number>();
  readonly total = input.required<number>();

  readonly cambiarPagina = output<number>();
}
