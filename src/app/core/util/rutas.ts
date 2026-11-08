import type { Rol } from '@core/models';

const PANTALLAS_INICIO: Record<Rol, string> = {
  cliente: '/cliente/ordenes',
  admin: '/taller/solicitudes',
  mecanico: '/taller/mis-ordenes'
};

export function pantallaInicio(rol: Rol): string {
  return PANTALLAS_INICIO[rol];
}
