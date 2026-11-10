import { FREQUENCIA_MINIMA, formatarPercentual, frequenciaDe } from './frequencia';

describe('frequenciaDe', () => {
  it.each([
    [60, 0, 100],
    [60, 3, 95],
    [60, 12, 80],
    [60, 15, 75], // exatamente no mínimo
    [60, 18, 70],
    [45, 11, 75.5], // 34/45 = 75,55...: arredonda para baixo
    [80, 8, 90],
    [30, 7, 76.6], // 23/30 = 76,66...
  ])('%ih com %i faltas -> %f%%', (carga, faltas, esperado) => {
    expect(frequenciaDe(carga, faltas)).toBe(esperado);
  });

  it('nunca fica abaixo de zero', () => {
    expect(frequenciaDe(10, 50)).toBe(0);
  });

  it('o limite de 25% corresponde à frequência mínima de 75%', () => {
    expect(frequenciaDe(60, 15)).toBe(FREQUENCIA_MINIMA);
  });
});

describe('formatarPercentual', () => {
  it('usa vírgula e omite o decimal quando é inteiro', () => {
    expect(formatarPercentual(80)).toBe('80%');
    expect(formatarPercentual(86.7)).toBe('86,7%');
    expect(formatarPercentual(0)).toBe('0%');
  });
});
