import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, map, Observable, of, tap } from 'rxjs';

import type {
  LoginRequest,
  LoginResponse,
  ReenviarVerificacionRequest,
  RegistroRequest,
  Rol,
  Usuario,
  VerificarEmailRequest
} from '@core/models';
import { environment } from '@env/environment';

const CLAVE_TOKEN = 'motorlab.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly usuario = signal<Usuario | null>(null);
  readonly token = signal<string | null>(this.leerToken());

  readonly estaAutenticado = computed<boolean>(() => this.token() !== null);
  readonly rol = computed<Rol | null>(() => this.usuario()?.rol ?? null);

  login(email: string, password: string): Observable<Usuario> {
    const cuerpo: LoginRequest = { email, password };

    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, cuerpo).pipe(
      tap((respuesta) => {
        this.guardarToken(respuesta.token);
        this.token.set(respuesta.token);
        this.usuario.set(respuesta.usuario);
      }),
      map((respuesta) => respuesta.usuario)
    );
  }

  registro(datos: RegistroRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${environment.apiUrl}/auth/registro`, datos);
  }

  verificarEmail(token: string): Observable<void> {
    const cuerpo: VerificarEmailRequest = { token };

    return this.http.post<void>(`${environment.apiUrl}/auth/verificar-email`, cuerpo);
  }

  reenviarVerificacion(email: string): Observable<void> {
    const cuerpo: ReenviarVerificacionRequest = { email };

    return this.http.post<void>(`${environment.apiUrl}/auth/reenviar-verificacion`, cuerpo);
  }

  // Nunca emite un error: un fallo aquí no debe impedir que arranque la aplicación
  cargarUsuario(): Observable<void> {
    if (this.token() === null) {
      return of(undefined);
    }

    return this.http.get<Usuario>(`${environment.apiUrl}/auth/yo`).pipe(
      map((usuario) => this.usuario.set(usuario)),
      catchError((error: { status?: number }) => {
        if (error.status === 401) {
          this.cerrarSesion(false);
        }
        return EMPTY;
      })
    );
  }

  cerrarSesion(navegar = true): void {
    this.borrarToken();
    this.token.set(null);
    this.usuario.set(null);

    if (navegar) {
      void this.router.navigate(['/login']);
    }
  }

  private leerToken(): string | null {
    try {
      return localStorage.getItem(CLAVE_TOKEN);
    } catch {
      return null;
    }
  }

  private guardarToken(token: string): void {
    try {
      localStorage.setItem(CLAVE_TOKEN, token);
    } catch {
      // Sin almacenamiento, la sesión dura hasta que se recargue la página
    }
  }

  private borrarToken(): void {
    try {
      localStorage.removeItem(CLAVE_TOKEN);
    } catch {
      // Sin almacenamiento no hay ningún token que borrar
    }
  }
}
