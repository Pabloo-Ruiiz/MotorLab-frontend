import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import type { VehiculoRequest } from '@core/models';
import { ToastService } from '@core/services/toast.service';
import { VehiculosService } from '@core/services/vehiculos.service';
import { aApiError, ApiError, mensajeDeError } from '@core/util/api-error';
import {
  aplicarErroresServidor,
  campoConError,
  limpiarErroresServidor
} from '@core/util/formularios';
import { matriculaValidator, normalizarMatricula } from '@core/util/matricula';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { ErroresCampoComponent } from '@shared/components/errores-campo/errores-campo.component';

const ANIO_MINIMO = 1980;
const enteroValidator = Validators.pattern(/^-?\d+$/);

@Component({
  selector: 'app-vehiculo-form',
  imports: [CargandoComponent, ErroresCampoComponent, ReactiveFormsModule],
  templateUrl: './vehiculo-form.component.html',
  styleUrl: './vehiculo-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiculoFormComponent {
  private readonly vehiculos = inject(VehiculosService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');

  protected readonly campoConError = campoConError;
  protected readonly esEdicion = this.id !== null;
  protected readonly mensajesMatricula = { pattern: 'Formato no válido. Ejemplo: 4821 KLB' };
  protected readonly mensajesEntero = { pattern: 'Debe ser un número entero' };

  protected readonly form = inject(NonNullableFormBuilder).group({
    matricula: ['', [Validators.required, matriculaValidator]],
    marca: ['', [Validators.required, Validators.maxLength(50)]],
    modelo: ['', [Validators.required, Validators.maxLength(80)]],
    version: ['', [Validators.maxLength(80)]],
    anio: [
      null as number | null,
      [
        Validators.required,
        enteroValidator,
        Validators.min(ANIO_MINIMO),
        Validators.max(new Date().getFullYear())
      ]
    ],
    kilometros: [null as number | null, [Validators.required, enteroValidator, Validators.min(0)]]
  });

  protected readonly cargando = signal(this.esEdicion);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly enviando = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);

  constructor() {
    if (this.id === null) {
      return;
    }

    this.vehiculos
      .obtener(Number(this.id))
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed()
      )
      .subscribe({
        next: ({ matricula, marca, modelo, version, anio, kilometros }) =>
          this.form.setValue({
            matricula,
            marca,
            modelo,
            version: version ?? '',
            anio,
            kilometros
          }),
        error: (error: unknown) => this.errorCarga.set(mensajeDeError(error))
      });
  }

  protected enviar(): void {
    this.errorGeneral.set(null);
    // Un error anterior del servidor no debe impedir volver a enviar
    limpiarErroresServidor(this.form);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = this.datosDelFormulario();
    const peticion =
      this.id === null
        ? this.vehiculos.crear(datos)
        : this.vehiculos.actualizar(Number(this.id), datos);

    this.enviando.set(true);

    peticion.pipe(finalize(() => this.enviando.set(false))).subscribe({
      next: () => {
        this.toast.exito(this.esEdicion ? 'Vehículo actualizado' : 'Vehículo añadido');
        void this.router.navigate(['/cliente/vehiculos']);
      },
      error: (error: unknown) => this.mostrarError(aApiError(error))
    });
  }

  private datosDelFormulario(): VehiculoRequest {
    const { matricula, marca, modelo, version, anio, kilometros } = this.form.getRawValue();

    return {
      matricula: normalizarMatricula(matricula),
      marca: marca.trim(),
      modelo: modelo.trim(),
      version: version.trim() || null,
      // El formulario es válido: Validators.required garantiza que no son null
      anio: anio as number,
      kilometros: kilometros as number
    };
  }

  private mostrarError(error: ApiError): void {
    const sinCampo = aplicarErroresServidor(this.form, this.conCampoDeMatricula(error));

    if (sinCampo.length > 0) {
      this.errorGeneral.set(sinCampo.map((detalle) => detalle.mensaje).join('. '));
    } else if (error.detalles.length === 0 && error.codigo !== 'MATRICULA_DUPLICADA') {
      this.errorGeneral.set(error.mensaje);
    }
  }

  // Este 409 no trae «detalles»: se le añade el campo para tratarlo como un error de validación
  private conCampoDeMatricula(error: ApiError): ApiError {
    return error.codigo === 'MATRICULA_DUPLICADA'
      ? new ApiError(error.status, error.codigo, error.mensaje, [
          { campo: 'matricula', mensaje: error.mensaje }
        ])
      : error;
  }
}
