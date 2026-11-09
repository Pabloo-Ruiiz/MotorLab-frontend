import { afterNextRender, inject, Injector } from '@angular/core';

// Destino del foco cuando el elemento que lo tenía deja de existir. preventScroll conserva la
// posición de la pantalla: mover el foco no debe notarse para quien usa el ratón.
export function enfocarPrincipal(): void {
  const principal = document.querySelector<HTMLElement>('main');

  if (principal !== null) {
    principal.tabIndex = -1;
    principal.focus({ preventScroll: true });
  }
}

// Si el elemento con el foco se ha deshabilitado o eliminado, el foco ha caído en <body>
export function recuperarFoco(): void {
  const activo = document.activeElement;

  if (activo === null || activo === document.body) {
    enfocarPrincipal();
  }
}

// Para las recargas que sustituyen el contenido: solo actúa tras una acción del usuario, para
// no mover el foco en la carga inicial de la pantalla. Debe crearse en un contexto de inyección.
export class FocoTrasCarga {
  private readonly injector = inject(Injector);
  private pendiente = false;

  marcar(): void {
    this.pendiente = true;
  }

  restaurar(): void {
    if (this.pendiente) {
      this.pendiente = false;
      afterNextRender(() => recuperarFoco(), { injector: this.injector });
    }
  }
}
