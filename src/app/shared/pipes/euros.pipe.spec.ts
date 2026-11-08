import { EurosPipe } from './euros.pipe';

describe('EurosPipe', () => {
  const pipe = new EurosPipe();

  // Intl separa el importe del símbolo con un espacio duro ( )
  it('formatea 256.52 como «256,52 €»', () => {
    expect(pipe.transform(256.52)).toBe('256,52 €');
  });

  it('formatea 0 como «0,00 €»', () => {
    expect(pipe.transform(0)).toBe('0,00 €');
  });

  it('devuelve «—» con null o undefined', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
  });
});
