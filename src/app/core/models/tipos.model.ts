// Enumerados de la API (valores en minúscula, idénticos a la base de datos)

export type Rol = 'cliente' | 'mecanico' | 'admin';

export type TipoServicio =
  | 'frenos'
  | 'motor'
  | 'aceite_filtros'
  | 'neumaticos'
  | 'electricidad'
  | 'itv'
  | 'otro';

export type CuandoOcurre = 'al_frenar' | 'al_arrancar' | 'en_marcha' | 'siempre' | 'otro';

export type ConduccionSegura = 'si' | 'no' | 'no_se';

export type Urgencia = 'baja' | 'media' | 'alta';

export type FranjaPreferida = 'manana' | 'tarde';

export type ContactoPreferido = 'telefono' | 'email';

export type EstadoOrden =
  | 'solicitud_recibida'
  | 'pendiente_presupuesto'
  | 'presupuesto_enviado'
  | 'presupuesto_autorizado'
  | 'recibido'
  | 'en_preparacion'
  | 'esperando_pieza'
  | 'arreglando'
  | 'listo'
  | 'entregado'
  | 'rechazada'
  | 'cancelada';

export type EstadoPresupuesto = 'borrador' | 'enviado' | 'autorizado' | 'rechazado';

export type TipoLinea = 'pieza' | 'mano_obra';

export type TipoNotificacion =
  | 'solicitud_nueva'
  | 'presupuesto_listo'
  | 'presupuesto_respondido'
  | 'cambio_estado'
  | 'vehiculo_listo';
