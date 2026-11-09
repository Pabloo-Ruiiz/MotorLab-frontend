import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { Pagina, Pieza, PiezaRequest, StockDeltaRequest } from '@core/models';
import { environment } from '@env/environment';

export interface FiltrosPiezas {
  q?: string | null;
  soloActivas?: boolean | null;
  stockBajo?: boolean | null;
  pagina?: number | null;
  limite?: number | null;
}

@Injectable({ providedIn: 'root' })
export class PiezasService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/piezas`;

  listar(filtros: FiltrosPiezas = {}): Observable<Pagina<Pieza>> {
    // false sí es un valor: el servidor toma soloActivas = true si no se envía
    let params = new HttpParams();
    for (const [nombre, valor] of Object.entries(filtros)) {
      if (valor !== null && valor !== undefined && String(valor).trim() !== '') {
        params = params.set(nombre, valor);
      }
    }

    return this.http.get<Pagina<Pieza>>(this.url, { params });
  }

  crear(datos: PiezaRequest): Observable<Pieza> {
    return this.http.post<Pieza>(this.url, datos);
  }

  obtener(id: number): Observable<Pieza> {
    return this.http.get<Pieza>(`${this.url}/${id}`);
  }

  // El servidor ignora el stock en el PUT: para cambiarlo, usar ajustarStock
  actualizar(id: number, datos: PiezaRequest): Observable<Pieza> {
    return this.http.put<Pieza>(`${this.url}/${id}`, datos);
  }

  darDeBaja(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  ajustarStock(id: number, datos: StockDeltaRequest): Observable<Pieza> {
    return this.http.patch<Pieza>(`${this.url}/${id}/stock`, datos);
  }
}
