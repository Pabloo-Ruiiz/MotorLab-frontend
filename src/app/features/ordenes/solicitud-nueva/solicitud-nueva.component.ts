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
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, merge } from 'rxjs';

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
  type Vehiculo,
} from '@core/models';
import { OrdenesService } from '@core/services/ordenes.service';
import { VehiculosService } from '@core/services/vehiculos.service';
import { aApiError, ApiError, mensajeDeError } from '@core/util/api-error';
import {
  aplicarErroresServidor,
  campoConError,
  limpiarErroresServidor,
} from '@core/util/formularios';
import { matriculaLegible } from '@core/util/matricula';
import {
  fechaHoyOPosteriorValidator,
  fechaLocalDeHoy,
  verdaderoValidator,
} from '@core/util/validadores';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { ErroresCampoComponent } from '@shared/components/errores-campo/errores-campo.component';
import { IconoCocheComponent } from '@shared/components/icono-coche/icono-coche.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { PillUrgenciaComponent } from '@shared/components/pill-urgencia/pill-urgencia.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';

import { FichaVehiculoComponent } from './ficha-vehiculo/ficha-vehiculo.component';
import { IndicadorPasosComponent } from './indicador-pasos/indicador-pasos.component';
import {
  type GrupoResumen,
  ResumenSolicitudComponent,
} from './resumen-solicitud/resumen-solicitud.component';
import { SolicitudEnviadaComponent } from './solicitud-enviada/solicitud-enviada.component';

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
  3: ['fechaPreferida', 'franjaPreferida', 'contactoPreferido', 'aceptaPrivacidad'],
};

// Atributo «d» de cada icono, sobre una cuadrícula de 24x24
const ICONOS_SERVICIO: Record<TipoServicio, string> = {
  frenos: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  motor: 'M4 10v6M4 13h3M7 9h3V6h4v3h3l3 3v6h-3l-2 2H9l-2-2V9Z',
  aceite_filtros: 'M12 3s7 7.2 7 12a7 7 0 0 1-14 0c0-4.8 7-12 7-12Z',
  neumaticos:
    'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 3v5M12 16v5M3 12h5M16 12h5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  electricidad: 'M13 3 5 14h6l-1 7 8-11h-6l1-7Z',
  itv: 'M9 3h6v4H9zM9 5H5v16h14V5h-4M9 14l2 2 4-4',
  otro: 'M15 5a4 4 0 0 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3 3-3Z',
};

// Iconos de la interfaz: cabecera de cada paso, navegación y opciones
const ICONOS = {
  problema: 'M12 3 2 20h20L12 3ZM12 10v4M12 17v.01',
  cita: 'M4 6h16v14H4ZM4 10h16M8 3v4M16 3v4',
  resumen: 'M9 3h6v3H9ZM7 4.5H5V21h14V4.5h-2M9 12h6M9 16h4',
  hecho: 'M5 12l5 5 9-10',
  anterior: 'M15 18l-6-6 6-6',
  siguiente: 'M9 18l6-6-6-6',
  enviar: 'M4 12 20 4l-6 16-3-7-7-1Z',
  manana: 'M12 4v2M4.9 7.9l1.4 1.4M2 15h2M20 15h2M17.7 9.3l1.4-1.4M7 15a5 5 0 0 1 10 0M2 19h20',
  tarde:
    'M12 3v2M5 12H3M21 12h-2M6.3 6.3 4.9 4.9M17.7 6.3l1.4-1.4M8 12a4 4 0 0 1 8 0M3 16h18M7 20h10',
  telefono:
    'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z',
  email: 'M3 5h18v14H3ZM3 7l9 6 9-6',
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
    CargandoComponent,
    ErroresCampoComponent,
    FichaVehiculoComponent,
    IconoCocheComponent,
    IndicadorPasosComponent,
    LogoComponent,
    NgTemplateOutlet,
    PillUrgenciaComponent,
    ReactiveFormsModule,
    ResumenSolicitudComponent,
    RouterLink,
    SolicitudEnviadaComponent,
    VacioComponent,
  ],
  templateUrl: './solicitud-nueva.component.html',
  styleUrl: './solicitud-nueva.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolicitudNuevaComponent {
  private readonly vehiculosService = inject(VehiculosService);
  private readonly ordenes = inject(OrdenesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly locale = inject(LOCALE_ID);
  private readonly indicadorPaso = viewChild<ElementRef<HTMLElement>>('indicadorPaso');
  private readonly vehiculoPedido = Number(
    inject(ActivatedRoute).snapshot.queryParamMap.get('vehiculo'),
  );

  protected readonly campoConError = campoConError;
  protected readonly etiquetaVehiculo = etiquetaVehiculo;
  protected readonly hoy = fechaLocalDeHoy();
  protected readonly mensajesFecha = { fechaPasada: 'La fecha debe ser hoy o posterior' };

  protected readonly iconosServicio = ICONOS_SERVICIO;
  protected readonly iconos = ICONOS;
  protected readonly pasos = PASOS_CON_CAMPOS.map((numero) => ({
    numero,
    nombre: NOMBRES_PASO[numero],
  }));
  protected readonly opcionesServicio = opcionesDe(ETIQUETAS_TIPO_SERVICIO);
  protected readonly opcionesCuando = opcionesDe(ETIQUETAS_CUANDO_OCURRE);
  protected readonly opcionesConduccion = opcionesDe(ETIQUETAS_CONDUCCION_SEGURA);
  protected readonly opcionesUrgencia = opcionesDe(ETIQUETAS_URGENCIA);
  protected readonly opcionesFranja = opcionesDe(ETIQUETAS_FRANJA);
  protected readonly opcionesContacto: Opcion<ContactoPreferido>[] = [
    { valor: 'telefono', texto: ETIQUETAS_CONTACTO.telefono },
    { valor: 'email', texto: 'Correo' },
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
    aceptaPrivacidad: [false, [verdaderoValidator]],
  });

  protected readonly paso = signal<Paso>(1);
  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly vehiculos = signal<Vehiculo[]>([]);
  protected readonly enviando = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);
  protected readonly creada = signal<OrdenCreateResponse | null>(null);
  protected readonly motivoUrgencia = signal<string | null>(null);

  // La elegida a mano, para devolverla si el caso deja de ser crítico
  private urgenciaManual: Urgencia | null = null;

  protected readonly indicador = computed(() => {
    const paso = this.paso();
    return paso === 4 ? 'Resumen' : `Paso ${paso} de 3 · ${NOMBRES_PASO[paso]}`;
  });

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
        valor: datos.cuandoOcurre ? ETIQUETAS_CUANDO_OCURRE[datos.cuandoOcurre] : 'Sin indicar',
      },
      {
        etiqueta: '¿Se puede conducir con seguridad?',
        valor: ETIQUETAS_CONDUCCION_SEGURA[datos.conduccionSegura],
      },
      { etiqueta: 'Urgencia que percibes', valor: ETIQUETAS_URGENCIA[datos.urgencia] },
      {
        etiqueta: 'Fecha preferida',
        valor: formatDate(datos.fechaPreferida, 'longDate', this.locale),
      },
      { etiqueta: 'Franja', valor: ETIQUETAS_FRANJA[datos.franjaPreferida] },
      { etiqueta: 'Contacto', valor: ETIQUETAS_CONTACTO[datos.contactoPreferido] },
    ];
  });

  // Las mismas filas, agrupadas por el paso en el que se rellenan
  protected readonly gruposResumen = computed<GrupoResumen[]>(() => {
    const filas = this.filasResumen();
    return [
      { titulo: NOMBRES_PASO[1], filas: filas.slice(0, 1) },
      { titulo: NOMBRES_PASO[2], filas: filas.slice(1, 6) },
      { titulo: NOMBRES_PASO[3], filas: filas.slice(6) },
    ];
  });

  constructor() {
    const { tipoServicio, conduccionSegura } = this.form.controls;

    merge(tipoServicio.valueChanges, conduccionSegura.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.aplicarUrgenciaAutomatica());

    this.cargarVehiculos();
  }

  private aplicarUrgenciaAutomatica(): void {
    const { tipoServicio, conduccionSegura, urgencia } = this.form.controls;
    const motivo =
      tipoServicio.value === 'frenos'
        ? 'Alta automática: es un problema de frenos'
        : conduccionSegura.value === 'no'
          ? 'Alta automática: no es seguro conducir'
          : null;
    const eraCritico = this.motivoUrgencia() !== null;

    this.motivoUrgencia.set(motivo);

    if (motivo !== null && !eraCritico) {
      this.urgenciaManual = urgencia.value;
      urgencia.setValue('alta');
      urgencia.disable();
    } else if (motivo === null && eraCritico) {
      urgencia.setValue(this.urgenciaManual);
      urgencia.enable();
    }
  }

  protected cargarVehiculos(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.vehiculosService
      .listar(1, LIMITE_VEHICULOS)
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ datos }) => {
          this.vehiculos.set(datos);
          if (datos.some(({ id }) => id === this.vehiculoPedido)) {
            this.form.controls.vehiculoId.setValue(this.vehiculoPedido);
          }
        },
        error: (error: unknown) => this.errorCarga.set(mensajeDeError(error)),
      });
  }

  protected vehiculoPorId(id: number | null): Vehiculo | undefined {
    return this.vehiculos().find((vehiculo) => vehiculo.id === id);
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
    const controles = this.controlesDe(paso);

    // Revalidar descarta los errores anteriores del servidor solo en los campos de este paso
    controles.forEach((control) => control.updateValueAndValidity());

    if (controles.some((control) => control.invalid)) {
      controles.forEach((control) => control.markAsTouched());
      return;
    }

    this.irAPaso((paso + 1) as Paso);
  }

  // Intro avanza solo con el paso completo. Los botones conservan su propio Intro y en el síntoma
  // hace falta Ctrl o Cmd para poder escribir varias líneas. Sin repeat, mantener la tecla pulsada
  // podría saltar del paso 3 al envío
  protected alPulsarTecla(evento: KeyboardEvent): void {
    const destino = evento.target as HTMLElement;

    if (
      evento.key !== 'Enter' ||
      evento.repeat ||
      destino.closest('button, a') !== null ||
      (destino instanceof HTMLTextAreaElement && !evento.ctrlKey && !evento.metaKey)
    ) {
      return;
    }

    evento.preventDefault();

    const paso = this.paso();
    if (paso === 4 || this.controlesDe(paso).every((control) => !control.invalid)) {
      this.avanzar();
    }
  }

  private controlesDe(paso: PasoConCampos) {
    return CAMPOS_POR_PASO[paso].map((campo) => this.form.controls[campo]);
  }

  // El foco va al indicador y no a un campo, para no abrir el teclado del móvil: así el
  // siguiente Tab entra en el primer control del paso y se anuncia en qué paso se está
  private irAPaso(paso: Paso): void {
    this.paso.set(paso);
    afterNextRender(() => this.indicadorPaso()?.nativeElement.focus(), {
      injector: this.injector,
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
        error: (error: unknown) => this.mostrarError(aApiError(error)),
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
