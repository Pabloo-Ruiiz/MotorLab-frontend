import { Injectable, signal } from '@angular/core';

export type TipoToast = 'exito' | 'error' | 'info';

export interface Toast {
  id: number;
  tipo: TipoToast;
  mensaje: string;
}

const DURACION_MS = 5000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private siguienteId = 1;

  readonly avisos = signal<Toast[]>([]);

  exito(mensaje: string): void {
    this.anadir('exito', mensaje);
  }

  error(mensaje: string): void {
    this.anadir('error', mensaje);
  }

  info(mensaje: string): void {
    this.anadir('info', mensaje);
  }

  quitar(id: number): void {
    this.avisos.update((avisos) => avisos.filter((aviso) => aviso.id !== id));
  }

  private anadir(tipo: TipoToast, mensaje: string): void {
    const id = this.siguienteId++;
    this.avisos.update((avisos) => [...avisos, { id, tipo, mensaje }]);
    setTimeout(() => this.quitar(id), DURACION_MS);
  }
}
