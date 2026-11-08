import { FechaHoraPipe } from './fecha-hora.pipe';

describe('FechaHoraPipe', () => {
  const pipe = new FechaHoraPipe();
  const FECHA_HORA = '2026-10-12T09:14:00';

  it('con «hora» devuelve «09:14»', () => {
    expect(pipe.transform(FECHA_HORA, 'hora')).toBe('09:14');
  });

  it('con «corta» devuelve dd/MM/yyyy', () => {
    expect(pipe.transform(FECHA_HORA, 'corta')).toBe('12/10/2026');
  });

  it('sin formato devuelve la fecha y la hora completas', () => {
    expect(pipe.transform(FECHA_HORA)).toBe('12/10/2026 09:14');
  });

  it('acepta una fecha sin hora', () => {
    expect(pipe.transform('2026-10-12')).toBe('12/10/2026');
    expect(pipe.transform('2026-10-12', 'hora')).toBe('—');
  });

  it('no desplaza la fecha cerca de la medianoche', () => {
    expect(pipe.transform('2026-01-01T00:00:00')).toBe('01/01/2026 00:00');
    expect(pipe.transform('2026-12-31T23:59:00')).toBe('31/12/2026 23:59');
  });

  it('devuelve «—» con null o un texto no válido', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform('mañana')).toBe('—');
  });
});
