import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';

import { ETIQUETAS_TIPO_SERVICIO } from '@core/models';
import type { LineaDefinitiva, PresupuestoDefinitivo, TipoLinea } from '@core/models';
import { PresupuestosService } from '@core/services/presupuestos.service';
import { ToastService } from '@core/services/toast.service';
import { aApiError } from '@core/util/api-error';
import { matriculaLegible } from '@core/util/matricula';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { IconoCocheComponent } from '@shared/components/icono-coche/icono-coche.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';
import { EurosPipe } from '@shared/pipes/euros.pipe';
import { FechaHoraPipe } from '@shared/pipes/fecha-hora.pipe';

const FORMATO_NUMERO = new Intl.NumberFormat('es-ES');

interface Grupo {
  titulo: string;
  tipo: TipoLinea;
  lineas: LineaDefinitiva[];
  subtotal: number;
}

// Presupuesto emitido al finalizar la reparación: muestra lo realizado y permite descargarlo en PDF
@Component({
  selector: 'app-presupuesto-definitivo',
  imports: [
    CargandoComponent,
    EurosPipe,
    FechaHoraPipe,
    IconoCocheComponent,
    LogoComponent,
    VacioComponent
  ],
  templateUrl: './presupuesto-definitivo.component.html',
  // Mismo documento que el presupuesto previo: comparte sus estilos en lugar de duplicarlos
  styleUrls: [
    '../presupuesto-cliente/presupuesto-cliente.component.scss',
    './presupuesto-definitivo.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PresupuestoDefinitivoComponent {
  private readonly presupuestos = inject(PresupuestosService);
  private readonly toast = inject(ToastService);
  private readonly ordenId = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  protected readonly matriculaLegible = matriculaLegible;
  protected readonly servicios = ETIQUETAS_TIPO_SERVICIO;

  protected readonly cargando = signal(true);
  protected readonly noDisponible = signal(false);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly definitivo = signal<PresupuestoDefinitivo | null>(null);
  protected readonly descargando = signal(false);

  // Mano de obra primero y después piezas, como en el PDF
  protected readonly grupos = computed<Grupo[]>(() => {
    const definitivo = this.definitivo();
    if (definitivo === null) {
      return [];
    }
    const grupos: Grupo[] = [
      { titulo: 'Mano de obra', tipo: 'mano_obra', lineas: [], subtotal: definitivo.subtotalManoObra },
      { titulo: 'Piezas', tipo: 'pieza', lineas: [], subtotal: definitivo.subtotalPiezas }
    ];
    for (const linea of definitivo.lineas) {
      grupos.find((grupo) => grupo.tipo === linea.tipo)?.lineas.push(linea);
    }
    return grupos.filter((grupo) => grupo.lineas.length > 0);
  });

  constructor() {
    this.cargar();
  }

  protected numero(valor: number): string {
    return FORMATO_NUMERO.format(valor);
  }

  protected reintentar(): void {
    this.cargar();
  }

  protected descargar(): void {
    this.descargando.set(true);
    this.presupuestos
      .descargarDefinitivo(this.ordenId)
      .pipe(finalize(() => this.descargando.set(false)))
      .subscribe({
        error: () => this.toast.error('No se ha podido descargar el presupuesto. Inténtalo de nuevo')
      });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.presupuestos
      .obtenerDefinitivo(this.ordenId)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (definitivo) => this.definitivo.set(definitivo),
        error: (error: unknown) => {
          const apiError = aApiError(error);
          if (apiError.esNoEncontrado()) {
            this.noDisponible.set(true);
          } else {
            this.errorCarga.set(apiError.mensaje);
          }
        }
      });
  }
}
