import { disciplinasEmAtencao, resumoDoPainel, resumosDasDisciplinas } from './painel';
import { Compromisso, Disciplina, Falta } from './tipos';

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

describe('resumoDoPainel', () => {
  const hoje = '2026-11-16';
  const comp = (id: string, prazo: string, descricao = 'Prova 1'): Compromisso => ({
    id,
    disciplinaId: 'a',
    tipo: 'prova',
    descricao,
    prazo,
    concluido: false,
    criadoEm: '2026-11-01T00:00:00.000Z',
  });
  const ds = [d('a', 'Redes'), d('b', 'BD'), d('c', 'Auditoria')];
  const atencao = (faltas: Falta[]) => disciplinasEmAtencao(ds, faltas, 3);

  it('tudo certo quando nada pede atenção e não há prazos', () => {
    expect(resumoDoPainel([], [], [], hoje)).toEqual({
      titulo: 'Tudo certo por aqui',
      subtitulo: 'Nenhum prazo pendente',
      tom: 'ok',
    });
  });

  it('conta as disciplinas em atenção e usa o tom de atenção para alerta', () => {
    const r = resumoDoPainel(atencao(noites('a', 4)), [], [comp('x', '2026-11-18')], hoje);
    expect(r.titulo).toBe('1 disciplina precisa de atenção');
    expect(r.subtitulo).toBe('Próximo prazo: Prova 1, em 2 dias');
    expect(r.tom).toBe('atencao');
  });

  it('usa o tom crítico para limite atingido ou excedido', () => {
    const r = resumoDoPainel(atencao([...noites('a', 5), ...noites('b', 4)]), [], [], hoje);
    expect(r.titulo).toBe('2 disciplinas precisam de atenção');
    expect(r.tom).toBe('critico');
  });

  it('prazos atrasados têm prioridade no subtítulo e deixam o tom crítico', () => {
    const r = resumoDoPainel([], [comp('x', '2026-11-14'), comp('y', '2026-11-10')], [comp('z', '2026-11-20')], hoje);
    expect(r.subtitulo).toBe('2 prazos atrasados');
    expect(r.tom).toBe('critico');
    expect(resumoDoPainel([], [comp('x', '2026-11-14')], [], hoje).subtitulo).toBe('1 prazo atrasado');
  });

  it('descreve o próximo prazo de hoje e de amanhã', () => {
    expect(resumoDoPainel([], [], [comp('x', hoje, 'Seminário')], hoje).subtitulo).toBe('Próximo prazo: Seminário, hoje');
    expect(resumoDoPainel([], [], [comp('x', '2026-11-17')], hoje).subtitulo).toBe('Próximo prazo: Prova 1, amanhã');
  });
});
