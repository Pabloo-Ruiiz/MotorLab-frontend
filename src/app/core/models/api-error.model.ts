// Cuerpo de las respuestas 4xx y 5xx (el OpenAPI no lo documenta)
export interface ApiErrorBody {
  error: {
    codigo: string;
    mensaje: string;
    detalles?: { campo: string; mensaje: string }[] | null;
  };
}
