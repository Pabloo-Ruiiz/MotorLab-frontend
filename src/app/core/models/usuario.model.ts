import type { Rol } from './tipos.model';

// OpenAPI: UsuarioResponse
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  rol: Rol;
  activo: boolean;
}

// OpenAPI: UsuarioResumenResponse
export interface UsuarioResumen {
  id: number;
  nombre: string;
  telefono: string;
}

export interface RegistroRequest {
  nombre: string;
  email: string;
  telefono: string;
  password: string;
  aceptaPrivacidad?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface UsuarioCreateRequest {
  nombre: string;
  email: string;
  telefono: string;
  password: string;
  rol: Rol;
}

export interface UsuarioUpdateRequest {
  rol?: Rol;
  activo?: boolean;
}
