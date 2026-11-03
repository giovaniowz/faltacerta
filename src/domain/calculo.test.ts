import { faltasDaDisciplina, limiteDeFaltas, previaDoLimite, resumoDaDisciplina } from './calculo';
import { Disciplina, Falta } from './tipos';

const disciplina = (cargaHoraria: number, aulasPorNoite = 3): Disciplina => ({
  id: 'd1',
  nome: 'Teste',
  cargaHoraria,
  aulasPorNoite,
  criadaEm: '2026-10-01T00:00:00.000Z',
});

const faltas = (...quantidades: number[]): Falta[] =>
  quantidades.map((quantidade, i) => ({
    id: String(i),
    disciplinaId: 'd1',
    data: '2026-10-01',
    quantidade,
  }));

describe('limiteDeFaltas', () => {
  it.each([
    [60, 15],
    [30, 7],
    [45, 11],
    [80, 20],
  ])('%ih tem limite de %i faltas', (carga, esperado) => {
    expect(limiteDeFaltas(carga)).toBe(esperado);
  });
});

describe('resumoDaDisciplina', () => {
  it.each([
    // carga, aulas/noite, faltas, limite, restantes, noites, status
    [60, 3, [], 15, 15, 5, 'ok'],
    [60, 3, [3, 3, 2], 15, 7, 2, 'ok'],
    [60, 3, [3, 3, 3, 3], 15, 3, 1, 'alerta'],
    [60, 3, [3, 3, 3, 3, 3], 15, 0, 0, 'limite'],
    [60, 3, [3, 3, 3, 3, 3, 3], 15, -3, 0, 'excedido'],
    [30, 3, [], 7, 7, 2, 'ok'],
    [45, 3, [3, 3, 3, 2], 11, 0, 0, 'limite'],
    [80, 4, [], 20, 20, 5, 'ok'],
  ] as const)(
    '%ih, %i aulas/noite, faltas %j',
    (carga, aulas, regs, limite, restantes, noites, status) => {
      const r = resumoDaDisciplina(disciplina(carga, aulas), faltas(...regs));
      expect(r.limite).toBe(limite);
      expect(r.faltasRestantes).toBe(restantes);
      expect(r.noitesRestantes).toBe(noites);
      expect(r.status).toBe(status);
    }
  );

  it('informa em quantas faltas o limite foi excedido', () => {
    const r = resumoDaDisciplina(disciplina(60), faltas(3, 3, 3, 3, 3, 3));
    expect(r.excedidoEm).toBe(3);
  });

  it('ignora faltas de outras disciplinas', () => {
    const outras: Falta[] = [{ id: 'x', disciplinaId: 'outra', data: '2026-10-01', quantidade: 9 }];
    const r = resumoDaDisciplina(disciplina(60), outras);
    expect(r.faltasRegistradas).toBe(0);
    expect(r.status).toBe('ok');
  });

  it('usa o nível de alerta informado', () => {
    // 15 - 6 = 9 faltas restantes: ok com nível 3, alerta com nível 9
    expect(resumoDaDisciplina(disciplina(60), faltas(3, 3), 3).status).toBe('ok');
    expect(resumoDaDisciplina(disciplina(60), faltas(3, 3), 9).status).toBe('alerta');
  });

  it('carga horária muito baixa já nasce no limite (limite 0)', () => {
    expect(resumoDaDisciplina(disciplina(3), []).status).toBe('limite');
  });
});

describe('previaDoLimite', () => {
  it('60h com 3 aulas por noite: 15 faltas e 5 noites', () => {
    expect(previaDoLimite(60, 3)).toEqual({ limite: 15, noites: 5 });
  });
  it('45h com 3 aulas por noite: 11 faltas e 3 noites', () => {
    expect(previaDoLimite(45, 3)).toEqual({ limite: 11, noites: 3 });
  });
});

describe('faltasDaDisciplina', () => {
  const f = (id: string, disciplinaId: string, data: string, quantidade = 3): Falta => ({
    id,
    disciplinaId,
    data,
    quantidade,
  });

  it('ordena da mais recente para a mais antiga e filtra por disciplina', () => {
    const todas = [f('1', 'a', '2026-10-01'), f('2', 'b', '2026-10-09'), f('3', 'a', '2026-10-08')];
    expect(faltasDaDisciplina(todas, 'a').map((x) => x.id)).toEqual(['3', '1']);
  });

  it('na mesma data, mostra primeiro a registrada por último', () => {
    const todas = [f('1', 'a', '2026-10-05'), f('2', 'a', '2026-10-05')];
    expect(faltasDaDisciplina(todas, 'a').map((x) => x.id)).toEqual(['2', '1']);
  });

  it('devolve lista vazia quando não há faltas', () => {
    expect(faltasDaDisciplina([], 'a')).toEqual([]);
  });
});
