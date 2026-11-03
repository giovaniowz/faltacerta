import { ehFutura, formatarDataBR, hojeISO, paraDataISO } from './datas';

describe('datas', () => {
  it('usa a data local, mesmo à noite (sem virar o dia por causa do UTC)', () => {
    // 26/10/2026 às 23:30 no horário local do aparelho
    expect(paraDataISO(new Date(2026, 9, 26, 23, 30))).toBe('2026-10-26');
  });

  it('completa mês e dia com zero', () => {
    expect(paraDataISO(new Date(2026, 0, 5, 12, 0))).toBe('2026-01-05');
  });

  it('hojeISO usa a data informada', () => {
    expect(hojeISO(new Date(2026, 10, 3, 21, 50))).toBe('2026-11-03');
  });

  it('formata no padrão brasileiro', () => {
    expect(formatarDataBR('2026-10-26')).toBe('26/10/2026');
  });

  it('identifica datas futuras', () => {
    expect(ehFutura('2026-10-27', '2026-10-26')).toBe(true);
    expect(ehFutura('2026-10-26', '2026-10-26')).toBe(false);
    expect(ehFutura('2026-10-25', '2026-10-26')).toBe(false);
  });
});
