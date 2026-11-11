import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { Rol } from '@core/models';
import { LogoComponent } from '@shared/components/logo/logo.component';

// «María José López» → «ML»: primera letra del nombre y de la última palabra
export function inicialesDe(nombre: string): string {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  const primera = palabras[0]?.charAt(0) ?? '';
  const ultima = palabras.length > 1 ? palabras[palabras.length - 1].charAt(0) : '';
  return (primera + ultima).toUpperCase() || '?';
}

// Foto de perfil circular. Sin foto, el administrador lleva el logo del taller y el resto sus
// iniciales. Es decorativo: el nombre siempre aparece al lado. El tamaño lo da --avatar-tamano.
@Component({
  selector: 'app-avatar',
  imports: [LogoComponent],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[attr.data-rol]': 'rol()' }
})
export class AvatarComponent {
  readonly nombre = input.required<string>();
  readonly rol = input<Rol | null>(null);
  readonly foto = input<string | null>(null);

  protected readonly iniciales = computed(() => inicialesDe(this.nombre()));
}
