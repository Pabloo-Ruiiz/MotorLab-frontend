import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import { authGuard } from '@core/guards/auth.guard';
import { invitadoGuard } from '@core/guards/invitado.guard';
import { rolGuard } from '@core/guards/rol.guard';
import { AuthService } from '@core/services/auth.service';
import { pantallaInicio } from '@core/util/rutas';

// Pantallas que aún no existen: cada una se sustituye en su paso
const pendiente = () =>
  import('@shared/components/pendiente/pendiente.component').then((m) => m.PendienteComponent);

const soloAdmin = rolGuard(['admin']);
const soloMecanico = rolGuard(['mecanico']);

function rutaDeInicio(): string {
  const rol = inject(AuthService).rol();
  return rol === null ? '/login' : pantallaInicio(rol);
}

// Las redirecciones se resuelven antes que los guards: el destino debe seguir protegido por ellos
function rutaDeInicioTaller(): string {
  return inject(AuthService).rol() === 'admin' ? 'solicitudes' : 'mis-ordenes';
}

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: rutaDeInicio },

  { path: 'login', canActivate: [invitadoGuard], loadComponent: pendiente },
  { path: 'registro', canActivate: [invitadoGuard], loadComponent: pendiente },

  // Sin componente hasta que exista el layout: los hijos se muestran directamente
  {
    path: 'cliente',
    canActivate: [authGuard, rolGuard(['cliente'])],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'ordenes' },
      { path: 'vehiculos', loadComponent: pendiente },
      { path: 'vehiculos/nuevo', loadComponent: pendiente },
      { path: 'vehiculos/:id/editar', loadComponent: pendiente },
      { path: 'vehiculos/:id/historial', loadComponent: pendiente },
      { path: 'solicitud/nueva', loadComponent: pendiente },
      { path: 'ordenes', loadComponent: pendiente },
      { path: 'ordenes/:id', loadComponent: pendiente },
      { path: 'ordenes/:id/presupuesto', loadComponent: pendiente },
      { path: 'avisos', loadComponent: pendiente },
      { path: 'perfil', loadComponent: pendiente }
    ]
  },

  {
    path: 'taller',
    canActivate: [authGuard, rolGuard(['admin', 'mecanico'])],
    children: [
      { path: '', pathMatch: 'full', redirectTo: rutaDeInicioTaller },
      { path: 'solicitudes', canActivate: [soloAdmin], loadComponent: pendiente },
      { path: 'ordenes/:id', canActivate: [soloAdmin], loadComponent: pendiente },
      { path: 'ordenes/:id/presupuesto', canActivate: [soloAdmin], loadComponent: pendiente },
      { path: 'piezas', loadComponent: pendiente },
      { path: 'usuarios', canActivate: [soloAdmin], loadComponent: pendiente },
      { path: 'panel', canActivate: [soloAdmin], loadComponent: pendiente },
      { path: 'mis-ordenes', canActivate: [soloMecanico], loadComponent: pendiente },
      { path: 'mis-ordenes/:id', canActivate: [soloMecanico], loadComponent: pendiente }
    ]
  },

  { path: '403', loadComponent: pendiente },
  { path: '404', loadComponent: pendiente },

  // TODO: esta ruta solo existe en desarrollo y se elimina en el paso de errores globales (F26).
  {
    path: 'estilos',
    loadComponent: () =>
      import('@features/estilos/estilos.component').then((m) => m.EstilosComponent)
  },

  { path: '**', redirectTo: '/404' }
];
