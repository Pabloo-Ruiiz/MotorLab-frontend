// OpenAPI: PiezaResponse
export interface Pieza {
  id: number;
  referencia: string;
  nombre: string;
  precio: number;
  stock: number;
  activa: boolean;
  stockBajo: boolean;
}

export interface PiezaRequest {
  referencia: string;
  nombre: string;
  precio: number;
  stock?: number;
}

export interface StockDeltaRequest {
  delta: number;
  motivo?: string | null;
}
