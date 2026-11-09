import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import type { Notificacion, Pagina } from '@core/models';
import { environment } from '@env/environment';

export interface FiltrosNotificaciones {
  leida?: boolean | null;
  pagina?: number | null;
  limite?: number | null;
}

// La referencia documenta un número, pero el backend envuelve el valor en un objeto
type RespuestaContador = number | { no_leidas: number };
type RespuestaMarcadas = number | { marcadas: number };

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/notificaciones`;

  listar(filtros: FiltrosNotificaciones = {}): Observable<Pagina<Notificacion>> {
    // leida = false sí es un filtro: solo se omiten los parámetros sin valor
    let params = new HttpParams();
    for (const [nombre, valor] of Object.entries(filtros)) {
      if (valor !== null && valor !== undefined) {
        params = params.set(nombre, valor);
      }
    }

    return this.http.get<Pagina<Notificacion>>(this.url, { params });
  }

  marcarLeida(id: number): Observable<Notificacion> {
    return this.http.patch<Notificacion>(`${this.url}/${id}/leida`, null);
  }

  marcarTodas(): Observable<number> {
    return this.http
      .post<RespuestaMarcadas>(`${this.url}/marcar-todas`, null)
      .pipe(map((respuesta) => (typeof respuesta === 'number' ? respuesta : respuesta.marcadas)));
  }

  contador(): Observable<number> {
    return this.http
      .get<RespuestaContador>(`${this.url}/contador`)
      .pipe(map((respuesta) => (typeof respuesta === 'number' ? respuesta : respuesta.no_leidas)));
  }
}
