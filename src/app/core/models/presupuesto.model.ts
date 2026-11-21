import type {
  EstadoPago,
  EstadoPresupuesto,
  MetodoPago,
  TipoLinea,
  TipoServicio
} from './tipos.model';

// OpenAPI: LineaResponse
export interface Linea {
  id: number;
  tipo: TipoLinea;
  piezaId: number | null;
  referencia: string | null;
  concepto: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
}

// OpenAPI: TotalesResponse
export interface Totales {
  subtotal: number;
  ivaPorcentaje: number;
  iva: number;
  total: number;
}

// OpenAPI: AvisoStockResponse
export interface AvisoStock {
  piezaId: number;
  referencia: string;
  stock: number;
  necesarias: number;
}

// OpenAPI: PresupuestoResponse
export interface Presupuesto {
  id: number;
  ordenId: number;
  estado: EstadoPresupuesto;
  lineas: Linea[];
  subtotal: number;
  ivaPorcentaje: number;
  iva: number;
  total: number;
  tiempoEstimadoHoras: number | null;
  garantiaMeses: number;
  motivoRechazo: string | null;
  enviadoEn: string | null; // date-time
  respondidoEn: string | null; // date-time
  pagadoEn: string | null; // date-time; aviso de Stripe o cobro en el taller
  metodoPago: MetodoPago | null;
  estadoPago: EstadoPago | null;
  avisosStock: AvisoStock[]; // solo se rellena para admin y mecánico
}

// OpenAPI: SesionPagoResponse
export interface SesionPago {
  url: string; // página de pago de Stripe
}

export interface LineaRequest {
  tipo: TipoLinea;
  piezaId?: number;
  concepto?: string;
  cantidad: number;
  precioUnitario?: number;
}

// OpenAPI: LineaCreadaResponse
export interface LineaCreada {
  linea: Linea;
  totales: Totales;
  avisoStock: AvisoStock | null;
}

export interface PresupuestoUpdateRequest {
  tiempoEstimadoHoras?: number | null;
  garantiaMeses?: number | null;
}

export interface RechazoRequest {
  motivo?: string | null;
}

// OpenAPI: PresupuestoDefinitivoResponse. Se emite al finalizar la reparación y sus importes no cambian
export interface PresupuestoDefinitivo {
  id: number;
  numero: string; // PD-2026-00012
  ordenId: number;
  presupuestoId: number;
  emitidoEn: string; // date-time
  tipoServicio: TipoServicio;
  cliente: { nombre: string; email: string; telefono: string };
  vehiculo: {
    matricula: string;
    marca: string;
    modelo: string;
    version: string | null;
    anio: number;
    kilometros: number;
  };
  // Los datos del taller sin configurar llegan como null
  taller: {
    nombre: string;
    direccion: string | null;
    telefono: string | null;
    email: string | null;
    cif: string | null;
  };
  lineas: LineaDefinitiva[];
  subtotalManoObra: number;
  subtotalPiezas: number;
  subtotal: number;
  ivaPorcentaje: number;
  iva: number;
  total: number;
}

export interface LineaDefinitiva {
  posicion: number;
  tipo: TipoLinea;
  referencia: string | null;
  concepto: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
}
