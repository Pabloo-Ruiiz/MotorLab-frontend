import { ChangeDetectionStrategy, Component } from '@angular/core';

import { LogoComponent } from '@shared/components/logo/logo.component';

// Sustituir cada valor entre corchetes por el dato real: mientras tanto se muestra resaltado
const RESPONSABLE: readonly { dato: string; valor: string }[] = [
  { dato: 'Razón social', valor: '[Razón social del taller]' },
  { dato: 'NIF', valor: '[NIF]' },
  { dato: 'Domicilio', valor: '[Domicilio completo]' },
  { dato: 'Correo electrónico de contacto', valor: '[Correo de privacidad]' },
  { dato: 'Teléfono', valor: '[Teléfono]' },
  { dato: 'Delegado de protección de datos', valor: '[Datos del DPD, si se ha designado]' },
];

@Component({
  selector: 'app-politica-privacidad',
  imports: [LogoComponent],
  templateUrl: './politica-privacidad.component.html',
  styleUrl: './politica-privacidad.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoliticaPrivacidadComponent {
  protected readonly responsable = RESPONSABLE;
}
