import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-vacio',
  templateUrl: './vacio.component.html',
  styleUrl: './vacio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VacioComponent {
  readonly titulo = input.required<string>();
  readonly texto = input<string>();
}
