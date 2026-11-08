// OpenAPI: PageResponse* (respuesta paginada de los listados)
export interface Pagina<T> {
  datos: T[];
  pagina: number; // empieza en 1
  limite: number;
  total: number;
  totalPaginas: number;
}
