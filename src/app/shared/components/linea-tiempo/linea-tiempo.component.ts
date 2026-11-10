import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';

import { ETIQUETAS_ESTADO, type EstadoOrden, type EventoSeguimiento } from '@core/models';
import { FechaHoraPipe } from '@shared/pipes/fecha-hora.pipe';

interface PasoEjecucion {
  estado: EstadoOrden;
  titulo: string;
  descripcion: string;
  icono: string; // atributo «d» del SVG, sobre una cuadrícula de 24x24
}

interface PasoVista extends PasoEjecucion {
  fechaHora: string | null;
  hecho: boolean;
  actual: boolean;
  lineaHecha: boolean; // el tramo hasta el paso siguiente
  lectura: string; // el estado del paso sin depender del color
}

const PASOS_EJECUCION: readonly PasoEjecucion[] = [
  {
    estado: 'recibido',
    titulo: 'Recibido',
    descripcion: 'Hemos recibido tu coche',
    icono: 'M4 13l3-8h10l3 8v6H4v-6ZM4 13h5l1.5 2.5h3L15 13h5'
  },
  {
    estado: 'en_preparacion',
    titulo: 'En preparación',
    descripcion: 'Diagnóstico y revisión',
    icono: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM21 21l-4.5-4.5'
  },
  {
    estado: 'esperando_pieza',
    titulo: 'Esperando pieza',
    descripcion: 'Piezas necesarias para la reparación',
    icono: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
  },
  {
    estado: 'arreglando',
    titulo: 'Arreglando',
    descripcion: 'Trabajos de reparación en curso',
    icono: 'M15 5a4 4 0 0 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3 3-3Z'
  },
  {
    estado: 'listo',
    titulo: 'Listo',
    descripcion: 'El vehículo ya se puede recoger',
    icono: 'M5 21V4h13l-3 4 3 4H5'
  }
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.linea--destacada]': 'destacada()' }
})
export class LineaTiempoComponent {
  readonly eventos = input.required<EventoSeguimiento[]>();
  readonly estado = input.required<EstadoOrden>();
  // Presentación ampliada, con un icono por fase, para la pantalla de seguimiento del cliente
  readonly destacada = input(false, { transform: booleanAttribute });

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
