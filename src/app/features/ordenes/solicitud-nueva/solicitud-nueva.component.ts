import { formatDate, NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  LOCALE_ID,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import {
  ETIQUETAS_CONDUCCION_SEGURA,
  ETIQUETAS_CONTACTO,
  ETIQUETAS_CUANDO_OCURRE,
  ETIQUETAS_FRANJA,
  ETIQUETAS_TIPO_SERVICIO,
  ETIQUETAS_URGENCIA,
  type ConduccionSegura,
  type ContactoPreferido,
  type CuandoOcurre,
  type FranjaPreferida,
  type OrdenCreateRequest,
  type OrdenCreateResponse,
  type TipoServicio,
  type Urgencia,
  type Vehiculo
} from '@core/models';
import { OrdenesService } from '@core/services/ordenes.service';
import { VehiculosService } from '@core/services/vehiculos.service';
import { aApiError, ApiError, mensajeDeError } from '@core/util/api-error';
import {
  aplicarErroresServidor,
  campoConError,
  limpiarErroresServidor
} from '@core/util/formularios';
import { matriculaLegible } from '@core/util/matricula';
import {
  fechaHoyOPosteriorValidator,
  fechaLocalDeHoy,
  verdaderoValidator
} from '@core/util/validadores';
import { BarraProgresoComponent } from '@shared/components/barra-progreso/barra-progreso.component';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { ErroresCampoComponent } from '@shared/components/errores-campo/errores-campo.component';
import { PillUrgenciaComponent } from '@shared/components/pill-urgencia/pill-urgencia.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';

type PasoConCampos = 1 | 2 | 3;
type Paso = PasoConCampos | 4; // el 4 es el resumen
type Campo = keyof OrdenCreateRequest;

interface Opcion<T> {
  valor: T;
  texto: string;
}

interface FilaResumen {
  etiqueta: string;
  valor: string;
}

const LIMITE_VEHICULOS = 100;
const PASOS_CON_CAMPOS: readonly PasoConCampos[] = [1, 2, 3];
const NOMBRES_PASO: Record<PasoConCampos, string> = { 1: 'Vehículo', 2: 'Problema', 3: 'Cita' };

const CAMPOS_POR_PASO: Record<PasoConCampos, readonly Campo[]> = {
  1: ['vehiculoId'],
  2: ['tipoServicio', 'sintoma', 'cuandoOcurre', 'conduccionSegura', 'urgencia'],
  3: ['fechaPreferida', 'franjaPreferida', 'contactoPreferido', 'aceptaPrivacidad']
};

function opcionesDe<T extends string>(etiquetas: Record<T, string>): Opcion<T>[] {
  return (Object.keys(etiquetas) as T[]).map((valor) => ({ valor, texto: etiquetas[valor] }));
}

function etiquetaVehiculo(vehiculo: Vehiculo): string {
  return `${vehiculo.marca} ${vehiculo.modelo} · ${matriculaLegible(vehiculo.matricula)}`;
}

@Component({
  selector: 'app-solicitud-nueva',
  imports: [
    BarraProgresoComponent,
    CargandoComponent,
    ErroresCampoComponent,
    NgTemplateOutlet,
    PillUrgenciaComponent,
    ReactiveFormsModule,
    RouterLink,
    VacioComponent
  ],
  templateUrl: './solicitud-nueva.component.html',
  styleUrl: './solicitud-nueva.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SolicitudNuevaComponent {
  private readonly vehiculosService = inject(VehiculosService);
  private readonly ordenes = inject(OrdenesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly locale = inject(LOCALE_ID);
  private readonly indicadorPaso = viewChild<ElementRef<HTMLElement>>('indicadorPaso');
  private readonly vehiculoPedido = Number(
    inject(ActivatedRoute).snapshot.queryParamMap.get('vehiculo')
  );

  protected readonly campoConError = campoConError;
  protected readonly etiquetaVehiculo = etiquetaVehiculo;
  protected readonly hoy = fechaLocalDeHoy();
  protected readonly mensajesFecha = { fechaPasada: 'La fecha debe ser hoy o posterior' };

  protected readonly opcionesServicio = opcionesDe(ETIQUETAS_TIPO_SERVICIO);
  protected readonly opcionesCuando = opcionesDe(ETIQUETAS_CUANDO_OCURRE);
  protected readonly opcionesConduccion = opcionesDe(ETIQUETAS_CONDUCCION_SEGURA);
  protected readonly opcionesUrgencia = opcionesDe(ETIQUETAS_URGENCIA);
  protected readonly opcionesFranja = opcionesDe(ETIQUETAS_FRANJA);
  protected readonly opcionesContacto: Opcion<ContactoPreferido>[] = [
    { valor: 'telefono', texto: ETIQUETAS_CONTACTO.telefono },
    { valor: 'email', texto: 'Correo' }
  ];

  protected readonly form = inject(NonNullableFormBuilder).group({
    vehiculoId: [null as number | null, [Validators.required]],
    tipoServicio: [null as TipoServicio | null, [Validators.required]],
    sintoma: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
    cuandoOcurre: [null as CuandoOcurre | null],
    conduccionSegura: [null as ConduccionSegura | null, [Validators.required]],
    urgencia: [null as Urgencia | null, [Validators.required]],
    fechaPreferida: ['', [Validators.required, fechaHoyOPosteriorValidator]],
    franjaPreferida: [null as FranjaPreferida | null, [Validators.required]],
    contactoPreferido: [null as ContactoPreferido | null, [Validators.required]],
    aceptaPrivacidad: [false, [verdaderoValidator]]
  });

  protected readonly paso = signal<Paso>(1);
  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly vehiculos = signal<Vehiculo[]>([]);
  protected readonly enviando = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);
  protected readonly creada = signal<OrdenCreateResponse | null>(null);

  protected readonly indicador = computed(() => {
    const paso = this.paso();
    return paso === 4 ? 'Resumen' : `Paso ${paso} de 3 · ${NOMBRES_PASO[paso]}`;
  });

  // Como en la maqueta: «Vehículo ✓ · Cita» mientras se está en el paso 2
  protected readonly otrosPasos = computed(() => {
    const actual = this.paso();
    return PASOS_CON_CAMPOS.filter((paso) => paso !== actual)
      .map((paso) => (paso < actual ? `${NOMBRES_PASO[paso]} ✓` : NOMBRES_PASO[paso]))
      .join(' · ');
  });

  protected readonly progreso = computed(() => Math.round((Math.min(this.paso(), 3) / 3) * 100));

  // Se recalcula al llegar al resumen: en ese paso el formulario ya no se puede modificar
  protected readonly filasResumen = computed<FilaResumen[]>(() => {
    if (this.paso() !== 4) {
      return [];
    }

    const datos = this.datosDelFormulario();
    const vehiculo = this.vehiculos().find(({ id }) => id === datos.vehiculoId);

    return [
      { etiqueta: 'Vehículo', valor: vehiculo === undefined ? '' : etiquetaVehiculo(vehiculo) },
      { etiqueta: 'Servicio', valor: ETIQUETAS_TIPO_SERVICIO[datos.tipoServicio] },
      { etiqueta: 'Síntoma', valor: datos.sintoma },
      {
        etiqueta: 'Cuándo ocurre',
        valor: datos.cuandoOcurre ? ETIQUETAS_CUANDO_OCURRE[datos.cuandoOcurre] : 'Sin indicar'
      },
      {
        etiqueta: '¿Se puede conducir con seguridad?',
        valor: ETIQUETAS_CONDUCCION_SEGURA[datos.conduccionSegura]
      },
      { etiqueta: 'Urgencia que percibes', valor: ETIQUETAS_URGENCIA[datos.urgencia] },
      {
        etiqueta: 'Fecha preferida',
        valor: formatDate(datos.fechaPreferida, 'longDate', this.locale)
      },
      { etiqueta: 'Franja', valor: ETIQUETAS_FRANJA[datos.franjaPreferida] },
      { etiqueta: 'Contacto', valor: ETIQUETAS_CONTACTO[datos.contactoPreferido] }
    ];
  });

  constructor() {
    this.cargarVehiculos();
  }

  protected cargarVehiculos(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.vehiculosService
      .listar(1, LIMITE_VEHICULOS)
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ datos }) => {
          this.vehiculos.set(datos);
          if (datos.some(({ id }) => id === this.vehiculoPedido)) {
            this.form.controls.vehiculoId.setValue(this.vehiculoPedido);
          }
        },
        error: (error: unknown) => this.errorCarga.set(mensajeDeError(error))
      });
  }

  protected elegir<T>(control: FormControl<T>, valor: T): void {
    control.setValue(valor);
    control.markAsDirty();
    control.markAsTouched();
  }

  protected atras(): void {
    const paso = this.paso();
    if (paso > 1) {
      this.errorGeneral.set(null);
      this.irAPaso((paso - 1) as Paso);
    }
  }

  protected avanzar(): void {
    const paso = this.paso();
    if (paso === 4) {
      this.enviar();
      return;
    }

    this.errorGeneral.set(null);
    const controles = CAMPOS_POR_PASO[paso].map((campo) => this.form.controls[campo]);

    // Revalidar descarta los errores anteriores del servidor solo en los campos de este paso
    controles.forEach((control) => control.updateValueAndValidity());

    if (controles.some((control) => control.invalid)) {
      controles.forEach((control) => control.markAsTouched());
      return;
    }

    this.irAPaso((paso + 1) as Paso);
  }

  // El foco va al indicador y no a un campo, para no abrir el teclado del móvil: así el
  // siguiente Tab entra en el primer control del paso y se anuncia en qué paso se está
  private irAPaso(paso: Paso): void {
    this.paso.set(paso);
    afterNextRender(() => this.indicadorPaso()?.nativeElement.focus(), {
      injector: this.injector
    });
  }

  private enviar(): void {
    if (this.enviando()) {
      return;
    }

    this.errorGeneral.set(null);
    limpiarErroresServidor(this.form);

    // Solo ocurre si el formulario caduca en el resumen (por ejemplo, la fecha al cambiar de día)
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.volverAlPrimerPasoCon((campo) => this.form.controls[campo].invalid);
      return;
    }

    this.enviando.set(true);

    this.ordenes
      .crear(this.datosDelFormulario())
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (respuesta) => this.creada.set(respuesta),
        error: (error: unknown) => this.mostrarError(aApiError(error))
      });
  }

  // Solo se llama con los pasos validados: Validators.required garantiza que no hay nulos
  private datosDelFormulario(): OrdenCreateRequest {
    const datos = this.form.getRawValue() as OrdenCreateRequest;
    return { ...datos, sintoma: datos.sintoma.trim() };
  }

  private mostrarError(error: ApiError): void {
    const sinCampo = aplicarErroresServidor(this.form, error);

    if (sinCampo.length > 0) {
      this.errorGeneral.set(sinCampo.map((detalle) => detalle.mensaje).join('. '));
    } else if (error.detalles.length === 0) {
      this.errorGeneral.set(error.mensaje);
    }

    this.volverAlPrimerPasoCon((campo) => error.detalleDe(campo) !== null);
  }

  private volverAlPrimerPasoCon(condicion: (campo: Campo) => boolean): void {
    const paso = PASOS_CON_CAMPOS.find((candidato) => CAMPOS_POR_PASO[candidato].some(condicion));
    if (paso !== undefined) {
      this.irAPaso(paso);
    }
  }
}
