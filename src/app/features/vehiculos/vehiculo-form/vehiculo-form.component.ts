import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { IconoCocheComponent } from '@shared/components/icono-coche/icono-coche.component';
import { LogoComponent } from '@shared/components/logo/logo.component';

import { buscarEnCatalogo, MARCAS, modelosDe } from './catalogo-vehiculos';

const ANIO_MINIMO = 1980;
const enteroValidator = Validators.pattern(/^-?\d+$/);

// Un vehículo guardado puede tener un valor fuera del catálogo: sin esta opción se perdería al editar
function conValorGuardado(opciones: readonly string[], valor?: string): readonly string[] {
  return valor === undefined || opciones.includes(valor) ? opciones : [...opciones, valor];
}

@Component({
  selector: 'app-vehiculo-form',
  imports: [
    CargandoComponent,
    ErroresCampoComponent,
    IconoCocheComponent,
    LogoComponent,
    ReactiveFormsModule,
    RouterLink
  ],
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
  protected readonly titulo = this.esEdicion ? 'Editar vehículo' : 'Nuevo vehículo';
  protected readonly mensajesMatricula = { pattern: 'Formato no válido. Ejemplo: 4821 KLB' };
  protected readonly mensajesEntero = { pattern: 'Debe ser un número entero' };

  protected readonly form = inject(NonNullableFormBuilder).group({
    matricula: ['', [Validators.required, matriculaValidator]],
    marca: ['', [Validators.required, Validators.maxLength(50)]],
    modelo: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(80)]],
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
  // Refleja lo guardado, no lo que se está escribiendo: indica qué vehículo se edita
  protected readonly resumen = signal<string | null>(null);

  private readonly guardado = signal<{ marca: string; modelo: string } | null>(null);

  protected readonly marcaElegida = toSignal(this.form.controls.marca.valueChanges, {
    initialValue: ''
  });
  protected readonly marcas = computed(() => conValorGuardado(MARCAS, this.guardado()?.marca));
  protected readonly modelos = computed(() => {
    const marca = this.marcaElegida();
    const guardado = this.guardado();

    return conValorGuardado(
      modelosDe(marca),
      guardado?.marca === marca ? guardado.modelo : undefined
    );
  });

  constructor() {
    const { marca: controlMarca, modelo: controlModelo } = this.form.controls;

    controlMarca.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((marca) => (marca ? controlModelo.enable() : controlModelo.disable()));

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
        next: ({ matricula, marca, modelo, version, anio, kilometros }) => {
          const marcaCatalogo = buscarEnCatalogo(MARCAS, marca) ?? marca;
          const modeloCatalogo = buscarEnCatalogo(modelosDe(marcaCatalogo), modelo) ?? modelo;

          this.guardado.set({ marca: marcaCatalogo, modelo: modeloCatalogo });
          this.resumen.set(`${marcaCatalogo} ${modeloCatalogo} · ${anio}`);
          this.form.setValue({
            matricula,
            marca: marcaCatalogo,
            modelo: modeloCatalogo,
            version: version ?? '',
            anio,
            kilometros
          });
        },
        error: (error: unknown) => this.errorCarga.set(mensajeDeError(error))
      });
  }

  // Solo al elegir el usuario: el modelo anterior no existe en la marca nueva
  protected alCambiarMarca(): void {
    this.form.controls.modelo.reset();
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
