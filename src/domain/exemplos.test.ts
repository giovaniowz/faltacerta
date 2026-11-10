import { resumoDaDisciplina } from './calculo';
import { ehFutura } from './datas';
import { gerarDadosDeExemplo } from './exemplos';
import { agruparPrazos } from './prazos';

const hoje = '2026-11-10';

describe('gerarDadosDeExemplo', () => {
  const dados = gerarDadosDeExemplo(hoje);

  it('mostra uma disciplina em cada situação', () => {
    const status = dados.disciplinas.map((d) => resumoDaDisciplina(d, dados.faltas, 3).status);
    expect(status).toEqual(['alerta', 'ok', 'ok', 'limite', 'excedido']);
  });

  it('usa ids únicos e ligações válidas', () => {
    const ids = [...dados.disciplinas, ...dados.faltas, ...dados.compromissos].map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
    const disciplinas = new Set(dados.disciplinas.map((d) => d.id));
    expect(dados.faltas.every((f) => disciplinas.has(f.disciplinaId))).toBe(true);
    expect(dados.compromissos.every((c) => disciplinas.has(c.disciplinaId))).toBe(true);
  });

  it('não tem faltas no futuro e respeita as aulas por noite', () => {
    expect(dados.faltas.some((f) => ehFutura(f.data, hoje))).toBe(false);
    const porId = new Map(dados.disciplinas.map((d) => [d.id, d]));
    expect(dados.faltas.every((f) => f.quantidade <= (porId.get(f.disciplinaId)?.aulasPorNoite ?? 0))).toBe(true);
  });

  it('traz prazos de hoje, próximos, atrasado e concluído', () => {
    const g = agruparPrazos(dados.compromissos, hoje);
    expect(g.atrasados.length).toBe(1);
    expect(g.concluidos.length).toBe(1);
    expect(g.proximos.map((c) => c.prazo)).toEqual(['2026-11-10', '2026-11-12', '2026-11-17', '2026-11-24']);
  });

  it('é relativo à data informada', () => {
    const outro = gerarDadosDeExemplo('2027-02-01');
    expect(agruparPrazos(outro.compromissos, '2027-02-01').proximos[0].prazo).toBe('2027-02-01');
  });
});
