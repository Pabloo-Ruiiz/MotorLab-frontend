import type { TipoNotificacion } from '@core/models';
import { ICONO_COCHE_CONTORNO } from '@shared/components/icono-coche/icono-coche.component';

// Atributo «d» del icono de cada tipo de aviso, sobre una cuadrícula de 24x24
export const ICONOS_NOTIFICACION: Record<TipoNotificacion, string> = {
  solicitud_nueva: 'M4 13l3-8h10l3 8v6H4v-6ZM4 13h5l1.5 2.5h3L15 13h5',
  presupuesto_listo: 'M6 3h8l4 4v14H6V3ZM14 3v4h4M9 12h6M9 16h6',
  presupuesto_respondido: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12l3 3 5-6',
  cambio_estado: 'M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5',
  vehiculo_listo: ICONO_COCHE_CONTORNO,
};

// Título breu de cada tipo: el aviso solo trae el mensaje, el título se deduce del tipo
export const TITULOS_NOTIFICACION: Record<TipoNotificacion, string> = {
  solicitud_nueva: 'Solicitud recibida',
  presupuesto_listo: 'Presupuesto listo',
  presupuesto_respondido: 'Presupuesto respondido',
  cambio_estado: 'Actualización de la orden',
  vehiculo_listo: 'Vehículo listo',
};
