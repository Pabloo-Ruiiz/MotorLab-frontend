import type { EstadoOrden, Rol } from '@core/models';

// Transiciones permitidas de una orden (sección 4 de docs/Motorlab_Api.md)
export const TRANSICIONES: Record<EstadoOrden, EstadoOrden[]> = {
  solicitud_recibida: ['pendiente_presupuesto', 'cancelada'],
  pendiente_presupuesto: ['presupuesto_enviado', 'cancelada'],
  presupuesto_enviado: ['presupuesto_autorizado', 'rechazada', 'cancelada'],
  presupuesto_autorizado: ['recibido', 'cancelada'],
  recibido: ['en_preparacion'],
  en_preparacion: ['esperando_pieza', 'arreglando'],
  esperando_pieza: ['arreglando'],
  arreglando: ['esperando_pieza', 'listo'],
  listo: ['entregado'],
  entregado: [],
  rechazada: [],
  cancelada: []
};

export const ESTADOS_FINALES: EstadoOrden[] = ['entregado', 'rechazada', 'cancelada'];

export const ESTADOS_ACTIVOS: EstadoOrden[] = (Object.keys(TRANSICIONES) as EstadoOrden[]).filter(
  (estado) => !ESTADOS_FINALES.includes(estado)
);

// Únicos estados que puede fijar un mecánico
export const ESTADOS_MECANICO: EstadoOrden[] = [
  'en_preparacion',
  'esperando_pieza',
  'arreglando',
  'listo'
];

// Estados a los que se llega con su propia acción; PATCH /estado los rechaza
export const ESTADOS_AUTOMATICOS: EstadoOrden[] = [
  'presupuesto_enviado',
  'presupuesto_autorizado',
  'rechazada',
  'cancelada'
];

export function esEstadoFinal(estado: EstadoOrden): boolean {
  return ESTADOS_FINALES.includes(estado);
}

// Estados que el rol puede elegir a continuación mediante PATCH /estado
export function siguientesEstados(estado: EstadoOrden, rol: Rol): EstadoOrden[] {
  const transiciones = TRANSICIONES[estado];

  switch (rol) {
    case 'admin':
      return transiciones.filter((siguiente) => !ESTADOS_AUTOMATICOS.includes(siguiente));
    case 'mecanico':
      return transiciones.filter((siguiente) => ESTADOS_MECANICO.includes(siguiente));
    case 'cliente':
      return [];
  }
}
