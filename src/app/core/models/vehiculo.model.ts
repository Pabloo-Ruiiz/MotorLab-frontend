// OpenAPI: VehiculoResponse
export interface Vehiculo {
  id: number;
  usuarioId: number;
  matricula: string;
  marca: string;
  modelo: string;
  version: string | null;
  anio: number;
  kilometros: number;
  activo: boolean;
}

export interface VehiculoRequest {
  matricula: string;
  marca: string;
  modelo: string;
  version?: string | null;
  anio: number;
  kilometros: number;
  usuarioId?: number; // solo lo usa un administrador
}
