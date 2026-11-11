import type {
  ConduccionSegura,
  ContactoPreferido,
  CuandoOcurre,
  EstadoOrden,
  EstadoPago,
  EstadoPresupuesto,
  FranjaPreferida,
  TipoServicio,
  Urgencia
} from './tipos.model';
import type { UsuarioResumen } from './usuario.model';
import type { Vehiculo } from './vehiculo.model';

export interface OrdenCreateRequest {
  vehiculoId: number;
  tipoServicio: TipoServicio;
  sintoma: string;
  cuandoOcurre?: CuandoOcurre | null;
  conduccionSegura: ConduccionSegura;
  urgencia: Urgencia;
  fechaPreferida: string; // date
  franjaPreferida: FranjaPreferida;
  contactoPreferido: ContactoPreferido;
  aceptaPrivacidad?: boolean;
}

export interface OrdenCreateResponse {
  id: number;
  estado: EstadoOrden;
  urgencia: Urgencia;
  mensaje: string;
}

// OpenAPI: OrdenResumenResponse
export interface OrdenResumen {
  ordenId: number;
  estado: EstadoOrden;
  progreso: number;
  urgencia: Urgencia;
  tipoServicio: TipoServicio;
  matricula: string;
  marca: string;
  modelo: string;
  clienteNombre: string;
  mecanicoNombre: string | null;
  elevador: string | null;
  fechaEntrada: string | null; // date-time
  fechaEstimada: string | null; // date-time
  presupuestoEstado: EstadoPresupuesto | null;
  presupuestoTotal: number | null;
  presupuestoEstadoPago: EstadoPago | null;
}

// OpenAPI: PresupuestoResumenResponse
export interface PresupuestoResumen {
  id: number;
  estado: EstadoPresupuesto;
  total: number;
  estadoPago: EstadoPago | null;
}

// OpenAPI: OrdenDetalleResponse
export interface OrdenDetalle {
  id: number;
  estado: EstadoOrden;
  progreso: number;
  urgencia: Urgencia;
  tipoServicio: TipoServicio;
  sintoma: string;
  cuandoOcurre: CuandoOcurre | null;
  conduccionSegura: ConduccionSegura;
  fechaPreferida: string; // date
  franjaPreferida: FranjaPreferida;
  contactoPreferido: ContactoPreferido;
  elevador: string | null;
  fechaEntrada: string | null; // date-time
  fechaEstimada: string | null; // date-time
  vehiculo: Vehiculo;
  cliente: UsuarioResumen;
  mecanico: UsuarioResumen | null;
  presupuesto: PresupuestoResumen | null;
}

export interface AsignacionRequest {
  mecanicoId: number;
  elevador?: string | null;
  fechaEstimada?: string | null; // date-time
}

export interface CambioEstadoRequest {
  estado: EstadoOrden;
  descripcion?: string | null;
}

// OpenAPI: EventoResponse
export interface EventoSeguimiento {
  estado: EstadoOrden;
  descripcion: string | null;
  fechaHora: string; // date-time
}

// OpenAPI: SeguimientoResponse
export interface Seguimiento {
  ordenId: number;
  vehiculo: string; // «Seat León 1.5 TSI · 4821KLB»
  estado: EstadoOrden;
  progreso: number;
  listoEstimado: string | null; // date-time
  eventos: EventoSeguimiento[];
}
