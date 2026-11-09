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

const vehiculoForm = () =>
  import('@features/vehiculos/vehiculo-form/vehiculo-form.component').then(
    (m) => m.VehiculoFormComponent,
  );

// La misma pantalla para el cliente y para el taller
const avisos = () =>
  import('@features/notificaciones/avisos/avisos.component').then((m) => m.AvisosComponent);

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

  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () =>
      import('@features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'registro',
    canActivate: [invitadoGuard],
    loadComponent: () =>
      import('@features/auth/registro/registro.component').then((m) => m.RegistroComponent),
  },

  {
    path: 'cliente',
    canActivate: [authGuard, rolGuard(['cliente'])],
    loadComponent: () =>
      import('@layouts/cliente-layout/cliente-layout.component').then(
        (m) => m.ClienteLayoutComponent,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'ordenes' },
      {
        path: 'vehiculos',
        data: { titulo: 'Mis vehículos' },
        loadComponent: () =>
          import('@features/vehiculos/vehiculos-lista/vehiculos-lista.component').then(
            (m) => m.VehiculosListaComponent,
          ),
      },
      {
        path: 'vehiculos/nuevo',
        data: { titulo: 'Nuevo vehículo' },
        loadComponent: vehiculoForm,
      },
      {
        path: 'vehiculos/:id/editar',
        data: { titulo: 'Editar vehículo' },
        loadComponent: vehiculoForm,
      },
      {
        path: 'vehiculos/:id/historial',
        data: { titulo: 'Historial del vehículo' },
        loadComponent: () =>
          import('@features/vehiculos/vehiculo-historial/vehiculo-historial.component').then(
            (m) => m.VehiculoHistorialComponent,
          ),
      },
      {
        path: 'solicitud/nueva',
        data: { titulo: 'Nueva solicitud' },
        loadComponent: () =>
          import('@features/ordenes/solicitud-nueva/solicitud-nueva.component').then(
            (m) => m.SolicitudNuevaComponent,
          ),
      },
      {
        path: 'ordenes',
        data: { titulo: 'Mis órdenes' },
        loadComponent: () =>
          import('@features/ordenes/ordenes-lista-cliente/ordenes-lista-cliente.component').then(
            (m) => m.OrdenesListaClienteComponent,
          ),
      },
      {
        path: 'ordenes/:id',
        data: { titulo: 'Seguimiento' },
        loadComponent: () =>
          import('@features/ordenes/orden-detalle-cliente/orden-detalle-cliente.component').then(
            (m) => m.OrdenDetalleClienteComponent,
          ),
      },
      {
        path: 'ordenes/:id/presupuesto',
        data: { titulo: 'Presupuesto' },
        loadComponent: () =>
          import('@features/presupuestos/presupuesto-cliente/presupuesto-cliente.component').then(
            (m) => m.PresupuestoClienteComponent,
          ),
      },
      { path: 'avisos', data: { titulo: 'Avisos' }, loadComponent: avisos },
      {
        path: 'perfil',
        data: { titulo: 'Perfil' },
        loadComponent: () =>
          import('@features/perfil/perfil/perfil.component').then((m) => m.PerfilComponent),
      },
    ],
  },

  {
    path: 'taller',
    canActivate: [authGuard, rolGuard(['admin', 'mecanico'])],
    loadComponent: () =>
      import('@layouts/taller-layout/taller-layout.component').then((m) => m.TallerLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: rutaDeInicioTaller },
      {
        path: 'solicitudes',
        canActivate: [soloAdmin],
        loadComponent: () =>
          import('@features/taller/solicitudes/solicitudes-lista/solicitudes-lista.component').then(
            (m) => m.SolicitudesListaComponent,
          ),
      },
      {
        path: 'ordenes/:id',
        canActivate: [soloAdmin],
        loadComponent: () =>
          import('@features/taller/orden-detalle/orden-detalle-taller/orden-detalle-taller.component').then(
            (m) => m.OrdenDetalleTallerComponent,
          ),
      },
      {
        path: 'ordenes/:id/presupuesto',
        canActivate: [soloAdmin],
        loadComponent: () =>
          import('@features/taller/presupuesto-editor/presupuesto-editor/presupuesto-editor.component').then(
            (m) => m.PresupuestoEditorComponent,
          ),
      },
      { path: 'piezas', loadComponent: pendiente },
      { path: 'avisos', loadComponent: avisos },
      { path: 'usuarios', canActivate: [soloAdmin], loadComponent: pendiente },
      { path: 'panel', canActivate: [soloAdmin], loadComponent: pendiente },
      { path: 'mis-ordenes', canActivate: [soloMecanico], loadComponent: pendiente },
      { path: 'mis-ordenes/:id', canActivate: [soloMecanico], loadComponent: pendiente },
    ],
  },

  { path: '403', loadComponent: pendiente },
  { path: '404', loadComponent: pendiente },

  // TODO: esta ruta solo existe en desarrollo y se elimina en el paso de errores globales (F26).
  {
    path: 'estilos',
    loadComponent: () =>
      import('@features/estilos/estilos.component').then((m) => m.EstilosComponent),
  },

  { path: '**', redirectTo: '/404' },
];
