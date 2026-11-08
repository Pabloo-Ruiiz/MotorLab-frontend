import type {
  ConduccionSegura,
  ContactoPreferido,
  CuandoOcurre,
  EstadoOrden,
  EstadoPresupuesto,
  FranjaPreferida,
  Rol,
  TipoServicio,
  Urgencia
} from './tipos.model';

export const ETIQUETAS_ESTADO: Record<EstadoOrden, string> = {
  solicitud_recibida: 'Solicitud recibida',
  pendiente_presupuesto: 'Pendiente de presupuesto',
  presupuesto_enviado: 'Presupuesto enviado',
  presupuesto_autorizado: 'Presupuesto autorizado',
  recibido: 'Recibido',
  en_preparacion: 'En preparación',
  esperando_pieza: 'Esperando pieza',
  arreglando: 'Arreglando',
  listo: 'Listo para recoger',
  entregado: 'Entregado',
  rechazada: 'Presupuesto rechazado',
  cancelada: 'Cancelada'
};

export const ETIQUETAS_URGENCIA: Record<Urgencia, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta'
};

export const ETIQUETAS_TIPO_SERVICIO: Record<TipoServicio, string> = {
  frenos: 'Frenos',
  motor: 'Motor',
  aceite_filtros: 'Aceite y filtros',
  neumaticos: 'Neumáticos',
  electricidad: 'Electricidad',
  itv: 'ITV',
  otro: 'Otro'
};

export const ETIQUETAS_CUANDO_OCURRE: Record<CuandoOcurre, string> = {
  al_frenar: 'Al frenar',
  al_arrancar: 'Al arrancar',
  en_marcha: 'En marcha',
  siempre: 'Siempre',
  otro: 'Otro'
};

export const ETIQUETAS_CONDUCCION_SEGURA: Record<ConduccionSegura, string> = {
  si: 'Sí',
  no: 'No',
  no_se: 'No lo sé'
};

export const ETIQUETAS_FRANJA: Record<FranjaPreferida, string> = {
  manana: 'Mañana',
  tarde: 'Tarde'
};

export const ETIQUETAS_CONTACTO: Record<ContactoPreferido, string> = {
  telefono: 'Teléfono',
  email: 'Correo electrónico'
};

export const ETIQUETAS_ESTADO_PRESUPUESTO: Record<EstadoPresupuesto, string> = {
  borrador: 'Borrador',
  enviado: 'Enviado',
  autorizado: 'Autorizado',
  rechazado: 'Rechazado'
};

export const ETIQUETAS_ROL: Record<Rol, string> = {
  cliente: 'Cliente',
  mecanico: 'Mecánico',
  admin: 'Administrador'
};
