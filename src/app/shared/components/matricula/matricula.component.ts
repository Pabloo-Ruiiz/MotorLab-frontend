import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { matriculaLegible } from '@core/util/matricula';

@Component({
  selector: 'app-matricula',
  templateUrl: './matricula.component.html',
  styleUrl: './matricula.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatriculaComponent {
  readonly matricula = input.required<string>();

  protected readonly legible = computed(() => matriculaLegible(this.matricula()));
}
