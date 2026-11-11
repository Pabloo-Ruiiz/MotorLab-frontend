import { ETIQUETAS_ESTADO } from '@core/models';
import type { EstadoOrden, Notificacion } from '@core/models';
import { ICONO_COCHE_CONTORNO } from '@shared/components/icono-coche/icono-coche.component';
import { ICONOS_NOTIFICACION, TITULOS_NOTIFICACION } from '@shared/util/notificaciones';

// Solo presentación: deriva el icono, el título y el tono de cada aviso a partir de sus datos reales.
// No cambia el aviso ni su comportamiento.

export type TonoAviso = 'informativo' | 'exito' | 'aviso' | 'neutro';

export interface AvisoPresentado {
  aviso: Notificacion;
  titulo: string;
  descripcion: string;
  icono: string; // atributo «d» del SVG, sobre una cuadrícula de 24x24
  tono: TonoAviso;
}

// Iconos de trazo sobre una cuadrícula de 24x24
export const ICONOS_AVISOS = {
  actualizacion: ICONOS_NOTIFICACION.cambio_estado,
  herramienta: 'M15 5a4 4 0 0 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3 3-3Z',
  paquete: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3ZM4 7.5l8 4.5 8-4.5M12 12v9M8 5.3l8 4.5',
  verificado: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12l3 3 5-6',
  documento: ICONOS_NOTIFICACION.presupuesto_listo,
  documentoVerificado: 'M6 3h8l4 4v14H6V3ZM14 3v4h4M9 14l2 2 4-4',
  cerrado: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9 9l6 6M15 9l-6 6',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 8h.01',
  coche: ICONO_COCHE_CONTORNO,
  campana: 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4l2-2ZM10 21h4',
  dobleCheck: 'M18 6 7 17l-5-5M22 10l-7.5 7.5L13 16',
  reloj: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  flecha: 'M9 6l6 6-6 6',
} as const;

interface EstiloEstado {
  titulo: string;
  icono: string;
  tono: TonoAviso;
}

// Cada nuevo estado de la orden, con el aspecto que se le da en la lista
const ESTILOS_ESTADO: Record<EstadoOrden, EstiloEstado> = {
  solicitud_recibida: { titulo: 'Solicitud recibida', icono: ICONOS_AVISOS.info, tono: 'informativo' },
  pendiente_presupuesto: { titulo: 'Preparando tu presupuesto', icono: ICONOS_AVISOS.documento, tono: 'informativo' },
  presupuesto_enviado: { titulo: 'Presupuesto enviado', icono: ICONOS_AVISOS.documento, tono: 'aviso' },
  presupuesto_autorizado: { titulo: 'Presupuesto autorizado', icono: ICONOS_AVISOS.documentoVerificado, tono: 'exito' },
  recibido: { titulo: 'Vehículo recibido en el taller', icono: ICONOS_AVISOS.coche, tono: 'informativo' },
  en_preparacion: { titulo: 'Vehículo en preparación', icono: ICONOS_AVISOS.actualizacion, tono: 'informativo' },
  esperando_pieza: { titulo: 'Esperando piezas', icono: ICONOS_AVISOS.paquete, tono: 'aviso' },
  arreglando: { titulo: 'Reparación iniciada', icono: ICONOS_AVISOS.herramienta, tono: 'informativo' },
  listo: { titulo: 'Vehículo reparado', icono: ICONOS_AVISOS.verificado, tono: 'exito' },
  entregado: { titulo: 'Vehículo entregado', icono: ICONOS_AVISOS.verificado, tono: 'neutro' },
  rechazada: { titulo: 'Presupuesto rechazado', icono: ICONOS_AVISOS.cerrado, tono: 'neutro' },
  cancelada: { titulo: 'Orden cancelada', icono: ICONOS_AVISOS.cerrado, tono: 'neutro' },
};

const ESTILOS_TIPO: Record<Notificacion['tipo'], Omit<EstiloEstado, 'titulo'>> = {
  solicitud_nueva: { icono: ICONOS_NOTIFICACION.solicitud_nueva, tono: 'informativo' },
  presupuesto_listo: { icono: ICONOS_AVISOS.documento, tono: 'aviso' },
  presupuesto_respondido: { icono: ICONOS_AVISOS.documentoVerificado, tono: 'informativo' },
  cambio_estado: { icono: ICONOS_AVISOS.actualizacion, tono: 'informativo' },
  vehiculo_listo: { icono: ICONOS_AVISOS.verificado, tono: 'exito' },
};

// El backend redacta los cambios de estado como «La orden ha cambiado al estado <estado>»
const PATRON_CAMBIO_ESTADO = /al estado\s+([a-z_]+)\s*\.?$/i;

function estadoDelMensaje(mensaje: string): EstadoOrden | null {
  const estado = PATRON_CAMBIO_ESTADO.exec(mensaje.trim())?.[1]?.toLowerCase();
  return estado !== undefined && estado in ESTILOS_ESTADO ? (estado as EstadoOrden) : null;
}

export function presentarAviso(aviso: Notificacion): AvisoPresentado {
  const estado = aviso.tipo === 'cambio_estado' ? estadoDelMensaje(aviso.mensaje) : null;

  if (estado !== null) {
    const estilo = ESTILOS_ESTADO[estado];
    return {
      aviso,
      titulo: estilo.titulo,
      descripcion: `Tu orden ha pasado al estado «${ETIQUETAS_ESTADO[estado]}».`,
      icono: estilo.icono,
      tono: estilo.tono,
    };
  }

  return {
    aviso,
    titulo: TITULOS_NOTIFICACION[aviso.tipo],
    descripcion: aviso.mensaje,
    ...ESTILOS_TIPO[aviso.tipo],
  };
}
