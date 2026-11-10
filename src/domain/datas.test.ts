import { ehFutura, formatarDataBR, hojeISO, isoParaData, paraDataISO, somarDias } from './datas';

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

  it('converte AAAA-MM-DD em Date local e volta sem mudar o dia', () => {
    const data = isoParaData('2026-11-10');
    expect(data.getFullYear()).toBe(2026);
    expect(data.getMonth()).toBe(10);
    expect(data.getDate()).toBe(10);
    expect(paraDataISO(data)).toBe('2026-11-10');
  });

  it('soma e subtrai dias, atravessando mês e ano', () => {
    expect(somarDias('2026-11-03', 7)).toBe('2026-11-10');
    expect(somarDias('2026-11-03', -3)).toBe('2026-10-31');
    expect(somarDias('2026-12-30', 3)).toBe('2027-01-02');
    expect(somarDias('2026-03-01', -1)).toBe('2026-02-28');
    expect(somarDias('2026-11-03', 0)).toBe('2026-11-03');
  });
});
