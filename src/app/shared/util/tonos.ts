import type { EstadoOrden, EstadoPresupuesto, Urgencia } from '@core/models';

// Color con el que se presenta cada situación: se aplica con el atributo data-tono (_componentes.scss)
export type Tono = 'informativo' | 'exito' | 'aviso' | 'error' | 'neutro';

export const TONOS_ESTADO: Record<EstadoOrden, Tono> = {
  solicitud_recibida: 'informativo',
  pendiente_presupuesto: 'informativo',
  presupuesto_enviado: 'aviso',
  presupuesto_autorizado: 'exito',
  recibido: 'informativo',
  en_preparacion: 'informativo',
  esperando_pieza: 'aviso',
  arreglando: 'exito',
  listo: 'exito',
  entregado: 'neutro',
  rechazada: 'error',
  cancelada: 'error'
};

export const TONOS_URGENCIA: Record<Urgencia, Tono> = {
  baja: 'exito',
  media: 'aviso',
  alta: 'error'
};

export const TONOS_ESTADO_PRESUPUESTO: Record<EstadoPresupuesto, Tono> = {
  borrador: 'neutro',
  enviado: 'aviso',
  autorizado: 'exito',
  rechazado: 'error'
};
