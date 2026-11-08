import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { aApiError, ApiError } from '@core/util/api-error';
import {
  aplicarErroresServidor,
  campoConError,
  limpiarErroresServidor
} from '@core/util/formularios';
import {
  passwordValidator,
  telefonoValidator,
  verdaderoValidator
} from '@core/util/validadores';
import { ErroresCampoComponent } from '@shared/components/errores-campo/errores-campo.component';

@Component({
  selector: 'app-registro',
  imports: [ErroresCampoComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistroComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly campoConError = campoConError;

  protected readonly form = inject(NonNullableFormBuilder).group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: ['', [Validators.required, telefonoValidator]],
    password: ['', [Validators.required, passwordValidator]],
    aceptaPrivacidad: [false, [verdaderoValidator]]
  });

  protected readonly enviando = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);

  protected enviar(): void {
    this.errorGeneral.set(null);
    // Un error anterior del servidor no debe impedir volver a enviar
    limpiarErroresServidor(this.form);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);

    this.auth
      .registro(this.form.getRawValue())
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          this.toast.exito('Cuenta creada. Ya puedes iniciar sesión');
          void this.router.navigate(['/login']);
        },
        error: (error: unknown) => this.mostrarError(aApiError(error))
      });
  }

  private mostrarError(error: ApiError): void {
    if (error.codigo === 'EMAIL_DUPLICADO') {
      this.form.controls.email.setErrors({ servidor: error.mensaje });
      this.form.controls.email.markAsTouched();
      return;
    }

    const sinCampo = aplicarErroresServidor(this.form, error);

    if (sinCampo.length > 0) {
      this.errorGeneral.set(sinCampo.map((detalle) => detalle.mensaje).join('. '));
    } else if (error.detalles.length === 0) {
      this.errorGeneral.set(error.mensaje);
    }
  }
}
