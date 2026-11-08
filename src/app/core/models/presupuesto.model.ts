import type { EstadoPresupuesto, TipoLinea } from './tipos.model';

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
  avisosStock: AvisoStock[]; // solo se rellena para admin y mecánico
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
