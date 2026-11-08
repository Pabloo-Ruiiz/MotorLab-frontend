import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type {
  EstadoOrden,
  OrdenCreateRequest,
  OrdenCreateResponse,
  OrdenDetalle,
  OrdenResumen,
  Pagina,
  Seguimiento,
  Urgencia
} from '@core/models';
import { environment } from '@env/environment';

export interface FiltrosOrdenes {
  estado?: EstadoOrden | null;
  urgencia?: Urgencia | null;
  mecanicoId?: number | null;
  q?: string | null;
  pagina?: number | null;
  limite?: number | null;
}

@Injectable({ providedIn: 'root' })
export class OrdenesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/ordenes`;

  crear(datos: OrdenCreateRequest): Observable<OrdenCreateResponse> {
    return this.http.post<OrdenCreateResponse>(this.url, datos);
  }

  listar(filtros: FiltrosOrdenes): Observable<Pagina<OrdenResumen>> {
    return this.http.get<Pagina<OrdenResumen>>(this.url, { params: soloConValor(filtros) });
  }

  obtener(id: number): Observable<OrdenDetalle> {
    return this.http.get<OrdenDetalle>(`${this.url}/${id}`);
  }

  seguimiento(id: number): Observable<Seguimiento> {
    return this.http.get<Seguimiento>(`${this.url}/${id}/seguimiento`);
  }

  cancelar(id: number): Observable<OrdenDetalle> {
    return this.http.post<OrdenDetalle>(`${this.url}/${id}/cancelar`, null);
  }
}

// Un 0 sí es un valor; un texto solo con espacios, no
function soloConValor(filtros: FiltrosOrdenes): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  for (const [nombre, valor] of Object.entries(filtros)) {
    if (valor !== null && valor !== undefined && String(valor).trim() !== '') {
      params[nombre] = valor;
    }
  }

  return params;
}
