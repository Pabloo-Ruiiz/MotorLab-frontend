import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { mensajeDeError } from '@core/util/api-error';

@Component({
  selector: 'app-reenviar-correo',
  templateUrl: './reenviar-correo.component.html',
  styleUrl: './reenviar-correo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReenviarCorreoComponent {
  private readonly auth = inject(AuthService);

  readonly email = input.required<string>();

  protected readonly enviando = signal(false);
  protected readonly resultado = signal<string | null>(null);

  protected reenviar(): void {
    this.enviando.set(true);
    this.resultado.set(null);

    this.auth
      .reenviarVerificacion(this.email())
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => this.resultado.set('Te hemos enviado un nuevo correo si la cuenta sigue sin confirmar.'),
        error: (error: unknown) => this.resultado.set(mensajeDeError(error))
      });
  }
}
