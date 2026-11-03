import { plural, rotuloStatus, textoStatus } from './textos';
import { Resumo } from './tipos';

const resumo = (parcial: Partial<Resumo>): Resumo => ({
  limite: 15,
  faltasRegistradas: 0,
  faltasRestantes: 15,
  noitesRestantes: 5,
  excedidoEm: 0,
  status: 'ok',
  ...parcial,
});

describe('plural', () => {
  it('usa singular para 1 e plural nos demais', () => {
    expect(plural(1, 'falta', 'faltas')).toBe('1 falta');
    expect(plural(0, 'falta', 'faltas')).toBe('0 faltas');
    expect(plural(2, 'noite', 'noites')).toBe('2 noites');
  });
});

describe('textoStatus', () => {
  it('ok', () => {
    expect(textoStatus(resumo({}))).toBe('Você ainda pode faltar 15 aulas (5 noites).');
  });
  it('ok no singular', () => {
    expect(textoStatus(resumo({ faltasRestantes: 4, noitesRestantes: 1 }))).toBe(
      'Você ainda pode faltar 4 aulas (1 noite).'
    );
  });
  it('alerta', () => {
    expect(textoStatus(resumo({ status: 'alerta', faltasRestantes: 3, noitesRestantes: 1 }))).toBe(
      'Atenção: você está perto do limite. Restam 3 faltas.'
    );
  });
  it('alerta com 1 falta', () => {
    expect(textoStatus(resumo({ status: 'alerta', faltasRestantes: 1, noitesRestantes: 0 }))).toBe(
      'Atenção: você está perto do limite. Resta 1 falta.'
    );
  });
  it('limite', () => {
    expect(textoStatus(resumo({ status: 'limite', faltasRestantes: 0, noitesRestantes: 0 }))).toBe(
      'Limite atingido. Uma nova falta reprova a disciplina.'
    );
  });
  it('excedido', () => {
    expect(
      textoStatus(resumo({ status: 'excedido', faltasRestantes: -3, noitesRestantes: 0, excedidoEm: 3 }))
    ).toBe('Limite excedido em 3 faltas.');
    expect(textoStatus(resumo({ status: 'excedido', faltasRestantes: -1, excedidoEm: 1 }))).toBe(
      'Limite excedido em 1 falta.'
    );
  });
});

describe('rotuloStatus', () => {
  it('tem um rótulo para cada status', () => {
    expect(rotuloStatus('ok')).toBe('Dentro do limite');
    expect(rotuloStatus('alerta')).toBe('Perto do limite');
    expect(rotuloStatus('limite')).toBe('Limite atingido');
    expect(rotuloStatus('excedido')).toBe('Limite excedido');
  });
});
