import {
  agruparPrazos,
  diasAte,
  proximosPrazos,
  rotuloPrazo,
  rotuloTipo,
  urgenciaDoPrazo,
  validarCompromisso,
} from './prazos';
import { Compromisso } from './tipos';

const c = (id: string, prazo: string, concluido = false, criadoEm = '2026-10-01T10:00:00.000Z'): Compromisso => ({
  id,
  disciplinaId: 'd1',
  tipo: 'prova',
  descricao: `Item ${id}`,
  prazo,
  concluido,
  criadoEm,
});

describe('diasAte', () => {
  it('conta dias de calendário', () => {
    expect(diasAte('2026-11-10', '2026-11-03')).toBe(7);
    expect(diasAte('2026-11-03', '2026-11-03')).toBe(0);
    expect(diasAte('2026-11-01', '2026-11-03')).toBe(-2);
  });
  it('atravessa fim de mês e de ano', () => {
    expect(diasAte('2026-11-02', '2026-10-30')).toBe(3);
    expect(diasAte('2027-01-02', '2026-12-30')).toBe(3);
  });
  it('não se perde com a mudança do horário de verão', () => {
    expect(diasAte('2026-11-02', '2026-10-31')).toBe(2);
    expect(diasAte('2027-03-01', '2027-02-27')).toBe(2);
  });
});

describe('rotuloPrazo', () => {
  it.each([
    [0, 'Hoje'],
    [1, 'Amanhã'],
    [5, 'Em 5 dias'],
    [-1, 'Atrasado há 1 dia'],
    [-4, 'Atrasado há 4 dias'],
  ])('%i -> %s', (dias, esperado) => {
    expect(rotuloPrazo(dias)).toBe(esperado);
  });
});

describe('rotuloTipo', () => {
  it('traduz o tipo', () => {
    expect(rotuloTipo('prova')).toBe('Prova');
    expect(rotuloTipo('trabalho')).toBe('Trabalho');
  });
});

describe('urgenciaDoPrazo', () => {
  const hoje = '2026-11-03';
  it.each([
    ['2026-11-01', false, 'atrasado'],
    ['2026-11-03', false, 'hoje'],
    ['2026-11-04', false, 'breve'],
    ['2026-11-06', false, 'breve'],
    ['2026-11-07', false, 'normal'],
    ['2026-11-01', true, 'concluido'],
  ] as const)('prazo %s (concluído: %s) -> %s', (prazo, concluido, esperado) => {
    expect(urgenciaDoPrazo(c('x', prazo, concluido), hoje)).toBe(esperado);
  });
});

describe('agruparPrazos e proximosPrazos (US06)', () => {
  const hoje = '2026-11-03';
  const itens = [
    c('a', '2026-11-20'),
    c('b', '2026-11-05'),
    c('c', '2026-10-30'),
    c('d', '2026-11-03'),
    c('e', '2026-10-20', true),
    c('f', '2026-11-05', false, '2026-10-02T10:00:00.000Z'),
  ];

  it('ordena os próximos por data (e por criação no empate)', () => {
    expect(proximosPrazos(itens, hoje).map((x) => x.id)).toEqual(['d', 'b', 'f', 'a']);
  });
  it('separa os atrasados, do mais atrasado ao menos', () => {
    const g = agruparPrazos([...itens, c('g', '2026-10-25')], hoje);
    expect(g.atrasados.map((x) => x.id)).toEqual(['g', 'c']);
  });
  it('não mistura concluídos com pendentes', () => {
    const g = agruparPrazos(itens, hoje);
    expect(g.concluidos.map((x) => x.id)).toEqual(['e']);
    expect([...g.atrasados, ...g.proximos].some((x) => x.concluido)).toBe(false);
  });
  it('lida com lista vazia', () => {
    expect(agruparPrazos([], hoje)).toEqual({ atrasados: [], proximos: [], concluidos: [] });
  });
});

describe('validarCompromisso', () => {
  const hoje = '2026-11-03';
  const entrada = (p = {}) => ({ tipo: 'prova' as const, descricao: 'Prova 1', disciplinaId: 'd1', prazo: '2026-11-10', ...p });

  it('aceita dados válidos', () => {
    const r = validarCompromisso(entrada({ descricao: '  Prova 1  ' }), hoje);
    expect(r.valida).toBe(true);
    if (r.valida) expect(r.valores).toEqual({ tipo: 'prova', descricao: 'Prova 1', disciplinaId: 'd1', prazo: '2026-11-10' });
  });
  it('aceita prazo de hoje', () => {
    expect(validarCompromisso(entrada({ prazo: '2026-11-03' }), hoje).valida).toBe(true);
  });
  it('exige descrição e disciplina', () => {
    const r = validarCompromisso(entrada({ descricao: '  ', disciplinaId: null }), hoje);
    expect(r.valida).toBe(false);
    if (!r.valida) expect(Object.keys(r.erros).sort()).toEqual(['descricao', 'disciplinaId']);
  });
  it('rejeita prazo no passado no cadastro, mas aceita na edição', () => {
    const passado = entrada({ prazo: '2026-11-02' });
    const cadastro = validarCompromisso(passado, hoje);
    expect(cadastro.valida).toBe(false);
    if (!cadastro.valida) expect(cadastro.erros.prazo).toBe('O prazo não pode estar no passado.');
    expect(validarCompromisso(passado, hoje, true).valida).toBe(true);
  });
  it.each(['', '03/11/2026', '2026-13-01', '2026-02-30'])('rejeita data inválida "%s"', (prazo) => {
    const r = validarCompromisso(entrada({ prazo }), hoje, true);
    expect(r.valida).toBe(false);
    if (!r.valida) expect(r.erros.prazo).toBe('Informe uma data válida.');
  });
});
