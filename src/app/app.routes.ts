import { Routes } from '@angular/router';

export const routes: Routes = [
  // TODO: esta ruta solo existe en desarrollo y se elimina en el paso de errores globales (F26).
  {
    path: 'estilos',
    loadComponent: () =>
      import('@features/estilos/estilos.component').then((m) => m.EstilosComponent)
  }
];
