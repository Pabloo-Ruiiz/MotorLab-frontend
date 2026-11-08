import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-pendiente',
  templateUrl: './pendiente.component.html',
  styleUrl: './pendiente.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendienteComponent {}
