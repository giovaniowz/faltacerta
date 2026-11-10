import {
  dataDoLembrete,
  descreverLembrete,
  estadoDoLembrete,
  planejarLembretes,
  rotuloHora,
  textoEstadoLembrete,
  textoLembrete,
} from './lembretes';
import { CONFIG_PADRAO, Compromisso, Config } from './tipos';

const c = (id: string, prazo: string, extra: Partial<Compromisso> = {}): Compromisso => ({
  id,
  disciplinaId: 'd1',
  tipo: 'prova',
  descricao: 'Prova 1',
  prazo,
  concluido: false,
  criadoEm: '2026-11-01T10:00:00.000Z',
  ...extra,
});
const cfg = (extra: Partial<Config> = {}): Config => ({ ...CONFIG_PADRAO, ...extra }); // 1 dia antes, 08:00
const agora = new Date(2026, 10, 9, 12, 0); // 09/11/2026 12:00

describe('dataDoLembrete', () => {
  it('1 dia antes às 8h', () => {
    expect(dataDoLembrete('2026-11-10', 1, 8)).toEqual(new Date(2026, 10, 9, 8, 0));
  });
  it('no dia do prazo (0 dias antes)', () => {
    expect(dataDoLembrete('2026-11-10', 0, 19)).toEqual(new Date(2026, 10, 10, 19, 0));
  });
  it('atravessa o início do mês e do ano', () => {
    expect(dataDoLembrete('2026-11-01', 2, 8)).toEqual(new Date(2026, 9, 30, 8, 0));
    expect(dataDoLembrete('2027-01-01', 1, 8)).toEqual(new Date(2026, 11, 31, 8, 0));
  });
});

describe('textos', () => {
  it('formata a hora', () => {
    expect(rotuloHora(8)).toBe('08:00');
    expect(rotuloHora(19)).toBe('19:00');
  });
  it('descreve o lembrete', () => {
    expect(descreverLembrete(1, 8)).toBe('1 dia antes, às 08:00');
    expect(descreverLembrete(3, 19)).toBe('3 dias antes, às 19:00');
    expect(descreverLembrete(0, 8)).toBe('No dia do prazo, às 08:00');
  });
  it('monta o título e o corpo da notificação', () => {
    expect(textoLembrete(c('a', '2026-11-10'), 'Redes', 1)).toEqual({
      titulo: 'Prova: Prova 1',
      corpo: 'Redes · prazo amanhã (10/11/2026)',
    });
    expect(textoLembrete(c('a', '2026-11-10', { tipo: 'trabalho', descricao: 'Relatório' }), 'BD', 0)).toEqual({
      titulo: 'Trabalho: Relatório',
      corpo: 'BD · prazo hoje (10/11/2026)',
    });
    expect(textoLembrete(c('a', '2026-11-10'), 'Redes', 3).corpo).toBe('Redes · prazo em 3 dias (10/11/2026)');
  });
});

describe('estadoDoLembrete', () => {
  it('agendável quando o horário do aviso ainda não chegou', () => {
    expect(estadoDoLembrete(c('a', '2026-11-11'), cfg(), agora)).toBe('agendavel'); // aviso em 10/11 08:00
  });
  it('"passou" quando o horário do aviso já ficou para trás', () => {
    expect(estadoDoLembrete(c('a', '2026-11-10'), cfg(), agora)).toBe('passou'); // aviso era 09/11 08:00
  });
  it('desativado e concluído têm prioridade', () => {
    expect(estadoDoLembrete(c('a', '2026-11-20'), cfg({ lembreteAtivo: false }), agora)).toBe('desativado');
    expect(estadoDoLembrete(c('a', '2026-11-20', { concluido: true }), cfg(), agora)).toBe('concluido');
  });
  it('a frase do formulário descreve cada estado', () => {
    expect(textoEstadoLembrete('agendavel', cfg(), '2026-11-11')).toBe('Lembrete: 10/11/2026 às 08:00.');
    expect(textoEstadoLembrete('passou', cfg(), '2026-11-10')).toMatch(/já passou/);
    expect(textoEstadoLembrete('desativado', cfg(), '2026-11-10')).toMatch(/desativados/);
  });
});

describe('planejarLembretes', () => {
  const quando = (prazo: string, config = cfg()) =>
    dataDoLembrete(prazo, config.lembreteDiasAntes, config.lembreteHora).toISOString();

  it('agenda prazos novos e futuros', () => {
    const plano = planejarLembretes([c('a', '2026-11-20'), c('b', '2026-11-25')], cfg(), agora, []);
    expect(plano).toEqual({ cancelar: [], agendar: ['a', 'b'], limpar: [] });
  });

  it('não repete o que já está agendado certo', () => {
    const ja = c('a', '2026-11-20', { notificacaoId: 'n1', lembreteEm: quando('2026-11-20') });
    expect(planejarLembretes([ja], cfg(), agora, ['n1'])).toEqual({ cancelar: [], agendar: [], limpar: [] });
  });

  it('reagenda quando a data do prazo mudou', () => {
    const velho = c('a', '2026-11-22', { notificacaoId: 'n1', lembreteEm: quando('2026-11-20') });
    expect(planejarLembretes([velho], cfg(), agora, ['n1'])).toEqual({ cancelar: ['n1'], agendar: ['a'], limpar: [] });
  });

  it('reagenda quando a configuração mudou (dias antes ou hora)', () => {
    const feito = c('a', '2026-11-20', { notificacaoId: 'n1', lembreteEm: quando('2026-11-20') });
    expect(planejarLembretes([feito], cfg({ lembreteDiasAntes: 2 }), agora, ['n1']).agendar).toEqual(['a']);
    expect(planejarLembretes([feito], cfg({ lembreteHora: 20 }), agora, ['n1']).cancelar).toEqual(['n1']);
  });

  it('cancela e limpa quando o item foi concluído', () => {
    const feito = c('a', '2026-11-20', { concluido: true, notificacaoId: 'n1', lembreteEm: quando('2026-11-20') });
    expect(planejarLembretes([feito], cfg(), agora, ['n1'])).toEqual({ cancelar: ['n1'], agendar: [], limpar: ['a'] });
  });

  it('cancela tudo quando os lembretes são desativados', () => {
    const lista = [
      c('a', '2026-11-20', { notificacaoId: 'n1', lembreteEm: quando('2026-11-20') }),
      c('b', '2026-11-25', { notificacaoId: 'n2', lembreteEm: quando('2026-11-25') }),
    ];
    const plano = planejarLembretes(lista, cfg({ lembreteAtivo: false }), agora, ['n1', 'n2']);
    expect(plano.cancelar.sort()).toEqual(['n1', 'n2']);
    expect(plano.limpar.sort()).toEqual(['a', 'b']);
    expect(plano.agendar).toEqual([]);
  });

  it('cancela notificações órfãs (o prazo foi excluído)', () => {
    expect(planejarLembretes([], cfg(), agora, ['sobrou'])).toEqual({ cancelar: ['sobrou'], agendar: [], limpar: [] });
  });

  it('limpa os dados de um aviso que já disparou, sem tentar cancelar', () => {
    const disparou = c('a', '2026-11-10', { notificacaoId: 'n1', lembreteEm: new Date(2026, 10, 9, 8).toISOString() });
    expect(planejarLembretes([disparou], cfg(), agora, [])).toEqual({ cancelar: [], agendar: [], limpar: ['a'] });
  });

  it('não agenda prazos cujo horário do aviso já passou', () => {
    expect(planejarLembretes([c('a', '2026-11-10')], cfg(), agora, [])).toEqual({ cancelar: [], agendar: [], limpar: [] });
  });

  it('reagenda se o aviso sumiu do celular (ex.: dados do sistema limpos)', () => {
    const sumiu = c('a', '2026-11-20', { notificacaoId: 'n1', lembreteEm: quando('2026-11-20') });
    expect(planejarLembretes([sumiu], cfg(), agora, [])).toEqual({ cancelar: [], agendar: ['a'], limpar: [] });
  });
});
