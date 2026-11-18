import { faltaNaMesmaData, previaDoRegistro, simularNoitesFaltando, textoPrevia, textoSimulacao } from './simulacao';
import { Disciplina, Falta } from './tipos';

const disciplina: Disciplina = {
  id: 'd1',
  nome: 'Redes',
  cargaHoraria: 60,
  aulasPorNoite: 3,
  criadaEm: '2026-10-01T00:00:00.000Z',
};
const faltas = (n: number): Falta[] =>
  Array.from({ length: n }, (_, i) => ({ id: String(i), disciplinaId: 'd1', data: '2026-10-01', quantidade: 3 }));

describe('simularNoitesFaltando', () => {
  it('calcula como ficaria depois de faltar mais N noites', () => {
    const s = simularNoitesFaltando(disciplina, faltas(1), 2, 3); // 3 + 6 = 9 faltas
    expect(s.faltasAdicionais).toBe(6);
    expect(s.antes.faltasRestantes).toBe(12);
    expect(s.depois.faltasRestantes).toBe(6);
    expect(s.depois.noitesRestantes).toBe(2);
    expect(s.depois.status).toBe('ok');
  });

  it('não altera as faltas reais', () => {
    const lista = faltas(1);
    simularNoitesFaltando(disciplina, lista, 3, 3);
    expect(lista.length).toBe(1);
  });

  it('respeita o número de aulas por noite da disciplina', () => {
    const quatro = { ...disciplina, cargaHoraria: 80, aulasPorNoite: 4 };
    expect(simularNoitesFaltando(quatro, [], 2, 3).faltasAdicionais).toBe(8);
  });

  it('passa a alertar perto do limite', () => {
    expect(simularNoitesFaltando(disciplina, faltas(3), 1, 3).depois.status).toBe('alerta'); // 12 faltas
  });

  it('detecta chegar exatamente ao limite e ultrapassá-lo', () => {
    expect(simularNoitesFaltando(disciplina, faltas(4), 1, 3).depois.status).toBe('limite'); // 15
    const s = simularNoitesFaltando(disciplina, faltas(4), 2, 3); // 18
    expect(s.depois.status).toBe('excedido');
    expect(s.depois.excedidoEm).toBe(3);
  });
});

describe('textoSimulacao', () => {
  it('descreve o resultado em cada situação', () => {
    expect(textoSimulacao(simularNoitesFaltando(disciplina, faltas(1), 2, 3))).toBe(
      'Faltando 2 noites (6 faltas), restariam 6 faltas (2 noites).'
    );
    expect(textoSimulacao(simularNoitesFaltando(disciplina, faltas(4), 1, 3))).toBe(
      'Faltando 1 noite (3 faltas), você chega exatamente ao limite. Uma nova falta reprova.'
    );
    expect(textoSimulacao(simularNoitesFaltando(disciplina, faltas(4), 2, 3))).toBe(
      'Faltando 2 noites (6 faltas), você ultrapassa o limite em 3 faltas e reprova.'
    );
  });
});

describe('previaDoRegistro', () => {
  it('mostra como fica depois de registrar uma falta nova', () => {
    const p = previaDoRegistro(disciplina, faltas(1), 3, 3); // 3 + 3 = 6 faltas
    expect(p.antes.faltasRestantes).toBe(12);
    expect(p.depois.faltasRestantes).toBe(9);
    expect(p.depois.noitesRestantes).toBe(3);
  });

  it('ao editar, a falta em edição sai da conta (não conta duas vezes)', () => {
    const lista = faltas(2); // ids '0' e '1', 3 faltas cada = 6
    const p = previaDoRegistro(disciplina, lista, 1, 3, '1'); // a falta '1' passa a valer 1: 3 + 1 = 4
    expect(p.depois.faltasRegistradas).toBe(4);
    expect(p.depois.faltasRestantes).toBe(11);
  });

  it('avisa quando o registro leva ao alerta, ao limite ou além', () => {
    expect(previaDoRegistro(disciplina, faltas(3), 3, 3).depois.status).toBe('alerta'); // 9 + 3 = 12
    expect(previaDoRegistro(disciplina, faltas(4), 3, 3).depois.status).toBe('limite'); // 12 + 3 = 15
    expect(previaDoRegistro(disciplina, faltas(5), 3, 3).depois.status).toBe('excedido'); // 15 + 3 = 18
    expect(previaDoRegistro(disciplina, faltas(5), 0, 3).depois.status).toBe('limite'); // 15
  });
});

describe('faltaNaMesmaData', () => {
  const lista: Falta[] = [
    { id: 'a', disciplinaId: 'd1', data: '2026-11-10', quantidade: 3 },
    { id: 'b', disciplinaId: 'd2', data: '2026-11-11', quantidade: 3 },
  ];
  it('detecta duplicidade só na mesma disciplina e data', () => {
    expect(faltaNaMesmaData(lista, 'd1', '2026-11-10')).toBe(true);
    expect(faltaNaMesmaData(lista, 'd1', '2026-11-11')).toBe(false);
    expect(faltaNaMesmaData(lista, 'd2', '2026-11-10')).toBe(false);
  });
  it('ignora a própria falta quando está editando', () => {
    expect(faltaNaMesmaData(lista, 'd1', '2026-11-10', 'a')).toBe(false);
  });
});

describe('textoPrevia', () => {
  it('descreve o efeito do registro em cada situação', () => {
    expect(textoPrevia(previaDoRegistro(disciplina, faltas(1), 3, 3))).toBe('Depois deste registro, restarão 9 faltas (3 noites).');
    expect(textoPrevia(previaDoRegistro(disciplina, faltas(4), 3, 3))).toBe(
      'Com este registro você chega exatamente ao limite. Uma nova falta reprova.'
    );
    expect(textoPrevia(previaDoRegistro(disciplina, faltas(5), 3, 3))).toBe(
      'Com este registro você ultrapassa o limite em 3 faltas e reprova.'
    );
    expect(textoPrevia(previaDoRegistro(disciplina, faltas(5), 1, 3))).toBe(
      'Com este registro você ultrapassa o limite em 1 falta e reprova.'
    );
  });
});
