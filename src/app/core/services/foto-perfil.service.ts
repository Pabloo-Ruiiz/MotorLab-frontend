import { inject, Injectable, linkedSignal } from '@angular/core';

import { AuthService } from './auth.service';

const PREFIJO_CLAVE = 'motorlab.foto.';

// La API no admite fotos de perfil: se guardan en este navegador, una por cada usuario
@Injectable({ providedIn: 'root' })
export class FotoPerfilService {
  private readonly auth = inject(AuthService);

  readonly foto = linkedSignal<string | null>(() => this.fotoDe(this.auth.usuario()?.id ?? null));

  guardar(foto: string): void {
    this.foto.set(foto);

    const id = this.auth.usuario()?.id;
    if (id === undefined) {
      return;
    }

    try {
      localStorage.setItem(PREFIJO_CLAVE + id, foto);
    } catch {
      // Sin almacenamiento, la foto dura hasta que se recargue la página
    }
  }

  eliminar(): void {
    this.foto.set(null);

    const id = this.auth.usuario()?.id;
    if (id === undefined) {
      return;
    }

    try {
      localStorage.removeItem(PREFIJO_CLAVE + id);
    } catch {
      // Sin almacenamiento no hay ninguna foto guardada que borrar
    }
  }

  // Foto de cualquier usuario, si la subió desde este mismo navegador (p. ej. el directorio de usuarios)
  fotoDe(id: number | null): string | null {
    if (id === null) {
      return null;
    }

    try {
      return localStorage.getItem(PREFIJO_CLAVE + id);
    } catch {
      return null;
    }
  }
}
