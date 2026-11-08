import type { EstadoOrden } from './tipos.model';

// OpenAPI: MetricasResponse
export interface Metricas {
  ordenesActivas: number;
  ordenesPorEstado: Partial<Record<EstadoOrden, number>>;
  ingresosMes: number;
  presupuestosSinRespuesta: number;
  piezasStockBajo: number;
}
