import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, forkJoin, Observable, of, startWith, Subject, switchMap } from 'rxjs';

import { ETIQUETAS_TIPO_SERVICIO } from '@core/models';
import type {
  EstadoPresupuesto,
  MetodoPago,
  OrdenDetalle,
  Presupuesto,
  TipoLinea,
} from '@core/models';
import { OrdenesService } from '@core/services/ordenes.service';
import { PresupuestosService } from '@core/services/presupuestos.service';
import { ToastService } from '@core/services/toast.service';
import { aApiError } from '@core/util/api-error';
import { matriculaLegible } from '@core/util/matricula';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { ErroresCampoComponent } from '@shared/components/errores-campo/errores-campo.component';
import { ModalConfirmacionComponent } from '@shared/components/modal-confirmacion/modal-confirmacion.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { EurosPipe } from '@shared/pipes/euros.pipe';
import { FechaHoraPipe } from '@shared/pipes/fecha-hora.pipe';
import { IconoCocheComponent } from '@shared/components/icono-coche/icono-coche.component';
import { TONOS_URGENCIA } from '@shared/util/tonos';

const MAX_MOTIVO = 255;
const FORMATO_NUMERO = new Intl.NumberFormat('es-ES');

// Al volver de Stripe, el aviso que confirma el cobro puede llegar unos segundos después
const ESPERA_CONFIRMACION_MS = 3000;
const MAX_COMPROBACIONES_PAGO = 5;

// Etiqueta y tono (data-tono) del estado del presupuesto en la cabecera del documento
const ESTADOS_PRESUPUESTO: Record<EstadoPresupuesto, { texto: string; tono: string }> = {
  borrador: { texto: 'Borrador', tono: 'neutro' },
  enviado: { texto: 'Pendiente de aprobación', tono: 'aviso' },
  autorizado: { texto: 'Autorizado', tono: 'exito' },
  rechazado: { texto: 'Rechazado', tono: 'error' },
};

const TIPOS_LINEA: Record<TipoLinea, string> = {
  pieza: 'Pieza',
  mano_obra: 'Mano de obra',
};

interface DatosPresupuesto {
  presupuesto: Presupuesto;
  orden: OrdenDetalle;
}

@Component({
  selector: 'app-presupuesto-cliente',
  imports: [
    CargandoComponent,
    ErroresCampoComponent,
    EurosPipe,
    FechaHoraPipe,
    IconoCocheComponent,
    LogoComponent,
    ModalConfirmacionComponent,
    ReactiveFormsModule,
    VacioComponent
  ],
  templateUrl: './presupuesto-cliente.component.html',
  styleUrl: './presupuesto-cliente.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PresupuestoClienteComponent {
  private readonly presupuestos = inject(PresupuestosService);
  private readonly ordenes = inject(OrdenesService);
  private readonly toast = inject(ToastService);
  private readonly documento = inject(DOCUMENT);
  private readonly ruta = inject(ActivatedRoute).snapshot;
  private readonly ordenId = Number(this.ruta.paramMap.get('id'));
  // Stripe devuelve al cliente con ?pago=ok o ?pago=cancelado
  private readonly vueltaDelPago = this.ruta.queryParamMap.get('pago');

  private readonly recarga = new Subject<void>();
  private comprobacionesPago = 0;

  protected readonly matriculaLegible = matriculaLegible;
  protected readonly estados = ESTADOS_PRESUPUESTO;
  protected readonly tiposLinea = TIPOS_LINEA;
  protected readonly servicios = ETIQUETAS_TIPO_SERVICIO;
  protected readonly tonosUrgencia = TONOS_URGENCIA;
  protected readonly motivo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(MAX_MOTIVO)],
  });

  protected readonly cargando = signal(true);
  protected readonly sinPresupuesto = signal(false);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly datos = signal<DatosPresupuesto | null>(null);
  protected readonly modal = signal<'autorizar' | 'rechazar' | null>(null);
  protected readonly procesando = signal(false);
  protected readonly pagando = signal(false);
  protected readonly confirmandoPago = signal(false);

  // Método elegido en el selector. Si el cliente ya se comprometió a pagar en efectivo, parte de él
  protected readonly metodo = linkedSignal<DatosPresupuesto | null, MetodoPago>({
    source: this.datos,
    computation: (datos) =>
      datos?.presupuesto.estadoPago === 'pendiente_efectivo' ? 'efectivo' : 'tarjeta',
  });

  constructor() {
    if (this.vueltaDelPago === 'cancelado') {
      this.toast.info('Has cancelado el pago. Puedes pagar cuando quieras.');
    }

    // Cada recarga descarta la petición que estuviera en curso
    this.recarga
      .pipe(
        startWith(undefined),
        switchMap(() => this.pedirDatos()),
        takeUntilDestroyed(),
      )
      .subscribe((datos) => {
        this.cargando.set(false);
        this.procesando.set(false);
        if (datos !== null) {
          this.datos.set(datos);
          this.sinPresupuesto.set(false);
          this.errorCarga.set(null);
          this.esperarConfirmacionDelPago(datos.presupuesto);
        }
      });
  }

  protected pagar(): void {
    const datos = this.datos();
    if (datos === null) {
      return;
    }

    this.pagando.set(true);
    this.presupuestos.iniciarPago(datos.presupuesto.id).subscribe({
      // Se sale de la aplicación: el botón sigue deshabilitado mientras carga la página de Stripe
      next: ({ url }) => this.documento.location.assign(url),
      error: (error: unknown) => {
        this.pagando.set(false);
        this.mostrarErrorRespuesta(error);
      },
    });
  }

  // Sin pasar por Stripe: el taller cobrará el importe al entregar el vehículo
  protected confirmarEfectivo(): void {
    const datos = this.datos();
    if (datos === null) {
      return;
    }

    this.procesando.set(true);
    this.presupuestos.elegirEfectivo(datos.presupuesto.id).subscribe({
      next: () => {
        this.toast.exito('Has seleccionado pagar en efectivo al retirar tu vehículo en el taller');
        this.recarga.next();
      },
      error: (error: unknown) => this.mostrarErrorRespuesta(error),
    });
  }

  // El pago solo se da por hecho cuando el backend lo confirma, nunca por volver con ?pago=ok
  private esperarConfirmacionDelPago(presupuesto: Presupuesto): void {
    const pendiente =
      this.vueltaDelPago === 'ok' && presupuesto.estado === 'autorizado' && presupuesto.pagadoEn === null;
    this.confirmandoPago.set(pendiente);
    if (pendiente && this.comprobacionesPago < MAX_COMPROBACIONES_PAGO) {
      this.comprobacionesPago++;
      setTimeout(() => this.recarga.next(), ESPERA_CONFIRMACION_MS);
    }
  }

  protected numero(valor: number): string {
    return FORMATO_NUMERO.format(valor);
  }

  protected reintentar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.recarga.next();
  }

  protected abrirRechazo(): void {
    this.motivo.reset();
    this.modal.set('rechazar');
  }

  protected autorizar(): void {
    this.responder((id) => this.presupuestos.autorizar(id));
  }

  protected rechazar(): void {
    // El modal no puede deshabilitar su botón: si el motivo no es válido, sigue abierto con el error
    if (this.motivo.invalid) {
      this.motivo.markAsTouched();
      return;
    }

    const motivo = this.motivo.value.trim() || undefined;
    this.responder((id) => this.presupuestos.rechazar(id, motivo));
  }

  // Los botones siguen deshabilitados hasta que la recarga muestra el nuevo estado
  private responder(accion: (id: number) => Observable<Presupuesto>): void {
    const datos = this.datos();
    if (datos === null) {
      return;
    }

    this.modal.set(null);
    this.procesando.set(true);

    accion(datos.presupuesto.id).subscribe({
      next: () => this.recarga.next(),
      error: (error: unknown) => this.mostrarErrorRespuesta(error),
    });
  }

  private pedirDatos(): Observable<DatosPresupuesto | null> {
    return forkJoin({
      presupuesto: this.presupuestos.obtenerPorOrden(this.ordenId),
      orden: this.ordenes.obtener(this.ordenId),
    }).pipe(
      catchError((error: unknown) => {
        this.registrarErrorDeCarga(error);
        return of(null);
      }),
    );
  }

  // Si ya hay datos en pantalla, un fallo al recargar no los sustituye
  private registrarErrorDeCarga(error: unknown): void {
    const apiError = aApiError(error);
    if (apiError.esNoEncontrado()) {
      this.sinPresupuesto.set(true);
    } else if (this.datos() === null) {
      this.errorCarga.set(apiError.mensaje);
    }
  }

  private mostrarErrorRespuesta(error: unknown): void {
    // El interceptor ya avisa de los fallos de conexión y de los errores 5xx
    const apiError = aApiError(error);
    if (apiError.status >= 400 && apiError.status < 500) {
      this.toast.error(apiError.mensaje);
    }

    // Un 409 indica que el presupuesto cambió: se actualiza para que deje de ofrecerse la respuesta
    if (apiError.esConflicto()) {
      this.recarga.next();
    } else {
      this.procesando.set(false);
    }
  }
}
