import type { TipoNotificacion } from './tipos.model';

// OpenAPI: NotificacionResponse
export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  mensaje: string;
  ordenId: number | null;
  leida: boolean;
  creadaEn: string; // date-time
}
