import { Compromisso, TipoCompromisso } from './tipos';

const MS_POR_DIA = 86_400_000;

// Diferença em dias de calendário entre duas datas AAAA-MM-DD.
// Usa Date.UTC só para contar dias (sem horário de verão nem fuso).
export function diasAte(prazo: string, hoje: string): number {
  const [pa, pm, pd] = prazo.split('-').map(Number);
  const [ha, hm, hd] = hoje.split('-').map(Number);
  return Math.round((Date.UTC(pa, pm - 1, pd) - Date.UTC(ha, hm - 1, hd)) / MS_POR_DIA);
}

export function rotuloPrazo(dias: number): string {
  if (dias === 0) return 'Hoje';
  if (dias === 1) return 'Amanhã';
  if (dias > 1) return `Em ${dias} dias`;
  const atraso = -dias;
  return atraso === 1 ? 'Atrasado há 1 dia' : `Atrasado há ${atraso} dias`;
}

export function rotuloTipo(tipo: TipoCompromisso): string {
  return tipo === 'prova' ? 'Prova' : 'Trabalho';
}

export type Urgencia = 'atrasado' | 'hoje' | 'breve' | 'normal' | 'concluido';

// "breve" = de 1 a 3 dias.
export function urgenciaDoPrazo(c: Compromisso, hoje: string): Urgencia {
  if (c.concluido) return 'concluido';
  const dias = diasAte(c.prazo, hoje);
  if (dias < 0) return 'atrasado';
  if (dias === 0) return 'hoje';
  if (dias <= 3) return 'breve';
  return 'normal';
}

function comparaPorPrazo(a: Compromisso, b: Compromisso): number {
  if (a.prazo !== b.prazo) return a.prazo < b.prazo ? -1 : 1;
  if (a.criadoEm !== b.criadoEm) return a.criadoEm < b.criadoEm ? -1 : 1;
  return 0;
}

export type GruposDePrazos = {
  atrasados: Compromisso[]; // pendentes com prazo vencido, o mais atrasado primeiro
  proximos: Compromisso[]; // pendentes de hoje em diante, por data
  concluidos: Compromisso[]; // concluídos, o de prazo mais recente primeiro
};

export function agruparPrazos(compromissos: Compromisso[], hoje: string): GruposDePrazos {
  const pendentes = compromissos.filter((c) => !c.concluido);
  return {
    atrasados: pendentes.filter((c) => c.prazo < hoje).sort(comparaPorPrazo),
    proximos: pendentes.filter((c) => c.prazo >= hoje).sort(comparaPorPrazo),
    concluidos: compromissos.filter((c) => c.concluido).sort((a, b) => comparaPorPrazo(b, a)),
  };
}

// US06: próximos prazos em ordem de data (pendentes, de hoje em diante).
export function proximosPrazos(compromissos: Compromisso[], hoje: string): Compromisso[] {
  return agruparPrazos(compromissos, hoje).proximos;
}

export type EntradaCompromisso = {
  tipo: TipoCompromisso;
  descricao: string;
  disciplinaId: string | null;
  prazo: string; // AAAA-MM-DD
};

export type ErrosCompromisso = Partial<Record<'descricao' | 'disciplinaId' | 'prazo', string>>;

export type ResultadoCompromisso =
  | {
      valida: true;
      valores: { tipo: TipoCompromisso; descricao: string; disciplinaId: string; prazo: string };
    }
  | { valida: false; erros: ErrosCompromisso };

function dataISOValida(texto: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const [a, m, d] = texto.split('-').map(Number);
  const data = new Date(Date.UTC(a, m - 1, d));
  return data.getUTCFullYear() === a && data.getUTCMonth() === m - 1 && data.getUTCDate() === d;
}

// No cadastro o prazo não pode estar no passado; na edição ele pode
// (um item atrasado continua podendo ser corrigido ou concluído).
export function validarCompromisso(
  e: EntradaCompromisso,
  hoje: string,
  permitirPassado = false
): ResultadoCompromisso {
  const erros: ErrosCompromisso = {};

  const descricao = e.descricao.trim();
  if (descricao === '') erros.descricao = 'Informe a descrição (ex.: Prova 1 ou Trabalho final).';

  if (!e.disciplinaId) erros.disciplinaId = 'Escolha a disciplina.';

  if (!dataISOValida(e.prazo)) {
    erros.prazo = 'Informe uma data válida.';
  } else if (!permitirPassado && e.prazo < hoje) {
    erros.prazo = 'O prazo não pode estar no passado.';
  }

  if (Object.keys(erros).length > 0 || !e.disciplinaId) return { valida: false, erros };
  return {
    valida: true,
    valores: { tipo: e.tipo, descricao, disciplinaId: e.disciplinaId, prazo: e.prazo },
  };
}
