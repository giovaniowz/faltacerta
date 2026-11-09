import { disciplinasEmAtencao, resumosDasDisciplinas } from './painel';
import { Disciplina, Falta } from './tipos';

const d = (id: string, nome: string, carga = 60): Disciplina => ({
  id,
  nome,
  cargaHoraria: carga,
  aulasPorNoite: 3,
  criadaEm: '2026-10-01T00:00:00.000Z',
});
const f = (disciplinaId: string, quantidade: number, i = 0): Falta => ({
  id: `${disciplinaId}-${i}`,
  disciplinaId,
  data: '2026-10-01',
  quantidade,
});
const noites = (id: string, n: number) => Array.from({ length: n }, (_, i) => f(id, 3, i));

describe('painel', () => {
  const ds = [d('a', 'Redes'), d('b', 'Banco de Dados'), d('c', 'Auditoria'), d('d', 'Gestão')];
  const faltas = [
    ...noites('a', 4), // 12 faltas: restam 3 -> alerta
    ...noites('b', 6), // 18 faltas: excedido
    ...noites('c', 5), // 15 faltas: limite
    // d: sem faltas -> ok
  ];

  it('calcula o resumo de todas, na ordem das disciplinas', () => {
    const r = resumosDasDisciplinas(ds, faltas, 3);
    expect(r.map((x) => x.resumo.status)).toEqual(['alerta', 'excedido', 'limite', 'ok']);
  });

  it('lista só as que pedem atenção, da mais grave para a menos grave', () => {
    const r = disciplinasEmAtencao(ds, faltas, 3);
    expect(r.map((x) => x.disciplina.nome)).toEqual(['Banco de Dados', 'Auditoria', 'Redes']);
  });

  it('desempata por faltas restantes e depois por nome', () => {
    const duas = [d('x', 'Zeta'), d('y', 'Alfa')];
    const fs = [...noites('x', 4), ...noites('y', 4)];
    expect(disciplinasEmAtencao(duas, fs, 3).map((x) => x.disciplina.nome)).toEqual(['Alfa', 'Zeta']);
  });

  it('respeita o nível de alerta configurado', () => {
    // 'd' sem faltas tem 15 restantes: só entra com nível 15 ou mais
    expect(disciplinasEmAtencao([d('d', 'Gestão')], [], 3)).toEqual([]);
    expect(disciplinasEmAtencao([d('d', 'Gestão')], [], 15).length).toBe(1);
  });

  it('devolve lista vazia quando está tudo certo', () => {
    expect(disciplinasEmAtencao(ds, [], 3)).toEqual([]);
  });
});
