import { ChangeDetectionStrategy, Component } from '@angular/core';

// Logo del taller: tuerca hexagonal con la «M» calada. Es decorativo porque siempre acompaña al
// nombre del taller. Toma el color de `color` y el tamaño del elemento que lo contiene.
@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' }
})
export class LogoComponent {}
