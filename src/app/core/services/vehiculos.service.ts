import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { OrdenResumen, Pagina, Vehiculo, VehiculoRequest } from '@core/models';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class VehiculosService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/vehiculos`;

  listar(pagina: number, limite: number): Observable<Pagina<Vehiculo>> {
    return this.http.get<Pagina<Vehiculo>>(this.url, { params: { pagina, limite } });
  }

  obtener(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.url}/${id}`);
  }

  crear(datos: VehiculoRequest): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.url, datos);
  }

  actualizar(id: number, datos: VehiculoRequest): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.url}/${id}`, datos);
  }

  darDeBaja(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  historial(id: number, pagina: number, limite: number): Observable<Pagina<OrdenResumen>> {
    return this.http.get<Pagina<OrdenResumen>>(`${this.url}/${id}/historial`, {
      params: { pagina, limite }
    });
  }
}
