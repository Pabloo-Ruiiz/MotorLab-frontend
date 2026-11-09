import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ETIQUETAS_ROL, type Rol, type UsuarioCreateRequest } from '@core/models';
import { aApiError, ApiError } from '@core/util/api-error';
import {
  aplicarErroresServidor,
  campoConError,
  limpiarErroresServidor
} from '@core/util/formularios';
import { passwordValidator, telefonoValidator } from '@core/util/validadores';
import { ErroresCampoComponent } from '@shared/components/errores-campo/errores-campo.component';

@Component({
  selector: 'app-usuario-dialog',
  imports: [ErroresCampoComponent, ReactiveFormsModule],
  templateUrl: './usuario-dialog.component.html',
  styleUrl: './usuario-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuarioDialogComponent {
  private readonly cambios = inject(ChangeDetectorRef);

  readonly abierto = input(false, { transform: booleanAttribute });
  readonly guardando = input(false, { transform: booleanAttribute });

  readonly guardar = output<UsuarioCreateRequest>();
  readonly cancelar = output<void>();

  protected readonly campoConError = campoConError;
  protected readonly opcionesRol = Object.entries(ETIQUETAS_ROL).map(([valor, texto]) => ({
    valor,
    texto
  }));

  // Mismas reglas que el registro, más el rol, que no tiene valor por defecto: se elige siempre
  protected readonly form = inject(NonNullableFormBuilder).group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: ['', [Validators.required, telefonoValidator]],
    password: ['', [Validators.required, passwordValidator]],
    rol: ['' as Rol | '', [Validators.required]]
  });

  protected readonly errorGeneral = signal<string | null>(null);

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  constructor() {
    // También al cerrar: la contraseña no debe quedarse en un formulario oculto
    effect(() => {
      this.abierto();
      untracked(() => this.vaciar());
    });

    // showModal mueve el foco al diálogo y close lo devuelve al elemento que lo tenía antes
    afterRenderEffect(() => {
      const dialogo = this.dialogo().nativeElement;

      if (this.abierto() && !dialogo.open) {
        dialogo.showModal();
      } else if (!this.abierto() && dialogo.open) {
        dialogo.close();
      }
    });
  }

  // Lo llama la pantalla que hace la petición, con el error que le devuelva el servidor
  mostrarErrorServidor(error: unknown): void {
    const apiError = conCampoEmail(aApiError(error));

    // El interceptor ya avisa de los fallos de conexión y de los errores 5xx
    if (apiError.status >= 400 && apiError.status < 500) {
      const resto = aplicarErroresServidor(this.form, apiError);

      if (resto.length > 0 || apiError.detalles.length === 0) {
        this.errorGeneral.set([apiError.mensaje, ...resto.map((d) => d.mensaje)].join(' · '));
      }
    }

    // La llamada llega desde fuera de la plantilla: sin esto, OnPush no pintaría las clases de error
    this.cambios.markForCheck();
  }

  protected enviar(): void {
    if (this.guardando()) {
      return;
    }

    limpiarErroresServidor(this.form);
    this.errorGeneral.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardar.emit(this.form.getRawValue() as UsuarioCreateRequest);
  }

  // Si sigue abierto para el componente padre, el cierre viene del navegador (tecla Escape)
  protected alCerrar(): void {
    if (this.abierto()) {
      this.cancelar.emit();
    }
  }

  private vaciar(): void {
    this.errorGeneral.set(null);
    this.form.reset();
  }
}

// EMAIL_DUPLICADO llega sin detalles: se expresa como detalle para que lo asigne aplicarErroresServidor
function conCampoEmail(error: ApiError): ApiError {
  return error.codigo === 'EMAIL_DUPLICADO' && error.detalles.length === 0
    ? new ApiError(error.status, error.codigo, error.mensaje, [
        { campo: 'email', mensaje: error.mensaje }
      ])
    : error;
}
