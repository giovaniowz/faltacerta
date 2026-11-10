import { simularNoitesFaltando, textoSimulacao } from './simulacao';
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
