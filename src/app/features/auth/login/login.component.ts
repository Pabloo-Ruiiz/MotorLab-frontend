import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { mensajeDeError } from '@core/util/api-error';
import { campoConError } from '@core/util/formularios';
import { pantallaInicio } from '@core/util/rutas';
import { ErroresCampoComponent } from '@shared/components/errores-campo/errores-campo.component';

@Component({
  selector: 'app-login',
  imports: [ErroresCampoComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly campoConError = campoConError;

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  protected readonly enviando = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);

  protected enviar(): void {
    this.errorGeneral.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    const { email, password } = this.form.getRawValue();

    this.auth
      .login(email, password)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (usuario) => {
          const returnUrl = this.ruta.snapshot.queryParamMap.get('returnUrl');
          void this.router.navigateByUrl(returnUrl ?? pantallaInicio(usuario.rol));
        },
        error: (error: unknown) => this.errorGeneral.set(mensajeDeError(error))
      });
  }
}
