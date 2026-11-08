import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ETIQUETAS_ESTADO, type EstadoOrden, type EventoSeguimiento } from '@core/models';
import { FechaHoraPipe } from '@shared/pipes/fecha-hora.pipe';

interface PasoEjecucion {
  estado: EstadoOrden;
  titulo: string;
  descripcion: string;
}

interface PasoVista extends PasoEjecucion {
  fechaHora: string | null;
  hecho: boolean;
  actual: boolean;
  lineaHecha: boolean; // el tramo hasta el paso siguiente
  lectura: string; // el estado del paso sin depender del color
}

const PASOS_EJECUCION: readonly PasoEjecucion[] = [
  { estado: 'recibido', titulo: 'Recibido', descripcion: 'Hemos recibido tu coche' },
  { estado: 'en_preparacion', titulo: 'En preparación', descripcion: 'Diagnóstico y revisión' },
  { estado: 'esperando_pieza', titulo: 'Esperando pieza', descripcion: 'Pastillas pedidas…' },
  { estado: 'arreglando', titulo: 'Arreglando', descripcion: 'Cambio de pastillas y discos' },
  { estado: 'listo', titulo: 'Listo', descripcion: 'Ya puedes recogerlo' }
];

// «entregado» ocurre después de «Listo»: no puede aparecer entre los eventos previos
const NO_PREVIOS: readonly EstadoOrden[] = [
  ...PASOS_EJECUCION.map(({ estado }) => estado),
  'entregado'
];

// Las fechas llegan en ISO sin zona horaria: el orden alfabético coincide con el cronológico
function cronologicamente(a: EventoSeguimiento, b: EventoSeguimiento): number {
  return a.fechaHora.localeCompare(b.fechaHora);
}

@Component({
  selector: 'app-linea-tiempo',
  imports: [FechaHoraPipe],
  templateUrl: './linea-tiempo.component.html',
  styleUrl: './linea-tiempo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineaTiempoComponent {
  readonly eventos = input.required<EventoSeguimiento[]>();
  readonly estado = input.required<EstadoOrden>();

  protected readonly etiquetas = ETIQUETAS_ESTADO;

  private readonly ordenados = computed(() => [...this.eventos()].sort(cronologicamente));

  protected readonly previos = computed(() =>
    this.ordenados().filter(({ estado }) => !NO_PREVIOS.includes(estado))
  );

  protected readonly pasos = computed<PasoVista[]>(() => {
    // Una orden puede volver a un estado: al estar ordenados, prevalece su último evento
    const eventoDe = new Map(this.ordenados().map((evento) => [evento.estado, evento]));
    const estadoActual = this.estado();

    return PASOS_EJECUCION.map((paso, indice) => {
      const evento = eventoDe.get(paso.estado);
      const siguiente = PASOS_EJECUCION[indice + 1];
      const hecho = evento !== undefined;
      const actual = paso.estado === estadoActual;

      return {
        ...paso,
        descripcion: evento?.descripcion || paso.descripcion,
        fechaHora: evento?.fechaHora ?? null,
        hecho,
        actual,
        lineaHecha: siguiente !== undefined && eventoDe.has(siguiente.estado),
        lectura: actual ? 'Paso actual' : hecho ? 'Completado' : 'Pendiente'
      };
    });
  });
}
