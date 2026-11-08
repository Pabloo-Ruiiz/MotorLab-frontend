import type { EstadoOrden, Rol } from '@core/models';
import { siguientesEstados, TRANSICIONES } from './estados';

describe('siguientesEstados', () => {
  const estados = Object.keys(TRANSICIONES) as EstadoOrden[];
  const roles: Rol[] = ['admin', 'mecanico', 'cliente'];

  it('desde arreglando, un mecánico puede ir a esperando_pieza y listo', () => {
    expect(siguientesEstados('arreglando', 'mecanico')).toEqual(['esperando_pieza', 'listo']);
  });

  it('desde presupuesto_autorizado, un administrador solo puede ir a recibido', () => {
    expect(siguientesEstados('presupuesto_autorizado', 'admin')).toEqual(['recibido']);
  });

  it('desde entregado no hay ningún estado siguiente', () => {
    for (const rol of roles) {
      expect(siguientesEstados('entregado', rol)).toEqual([]);
    }
  });

  it('un cliente nunca tiene estados siguientes', () => {
    for (const estado of estados) {
      expect(siguientesEstados(estado, 'cliente')).toEqual([]);
    }
  });
});
