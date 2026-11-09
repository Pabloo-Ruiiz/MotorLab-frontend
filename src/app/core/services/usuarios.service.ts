import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import type {
  Pagina,
  Rol,
  Usuario,
  UsuarioCreateRequest,
  UsuarioUpdateRequest
} from '@core/models';
import { environment } from '@env/environment';

export interface FiltrosUsuarios {
  rol?: Rol | null;
  pagina?: number | null;
  limite?: number | null;
}

const LIMITE_MECANICOS = 100;

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/usuarios`;

  listar(filtros: FiltrosUsuarios = {}): Observable<Pagina<Usuario>> {
    let params = new HttpParams();
    for (const [nombre, valor] of Object.entries(filtros)) {
      if (valor !== null && valor !== undefined) {
        params = params.set(nombre, valor);
      }
    }

    return this.http.get<Pagina<Usuario>>(this.url, { params });
  }

  crear(datos: UsuarioCreateRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, datos);
  }

  actualizar(id: number, datos: UsuarioUpdateRequest): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.url}/${id}`, datos);
  }

  listarMecanicos(): Observable<Usuario[]> {
    return this.listar({ rol: 'mecanico', limite: LIMITE_MECANICOS }).pipe(
      map(({ datos }) => datos.filter((usuario) => usuario.activo))
    );
  }
}
