export type Disciplina = {
  id: string;
  nome: string;
  professor?: string;
  cargaHoraria: number; // horas, inteiro > 0
  aulasPorNoite: number; // inteiro de 1 a 6, padrão 3
  criadaEm: string; // ISO
};

export type Falta = {
  id: string;
  disciplinaId: string;
  data: string; // AAAA-MM-DD
  quantidade: number; // aulas perdidas, 1 até aulasPorNoite
};

export type TipoCompromisso = 'prova' | 'trabalho';

export type Compromisso = {
  id: string;
  disciplinaId: string;
  tipo: TipoCompromisso;
  descricao: string;
  prazo: string; // AAAA-MM-DD
  concluido: boolean;
  criadoEm: string; // ISO
  // Guardados pelo app para controlar o lembrete agendado no celular (US07).
  notificacaoId?: string;
  lembreteEm?: string; // ISO do horário em que o aviso foi agendado
};

export type Config = {
  nivelAlerta: number; // avisa quando restarem N faltas ou menos
  lembreteAtivo: boolean; // avisar antes de provas e trabalhos
  lembreteDiasAntes: number; // 0 = no dia do prazo
  lembreteHora: number; // hora cheia do aviso, de 0 a 23
};

export type Status = 'ok' | 'alerta' | 'limite' | 'excedido';

export type Resumo = {
  limite: number;
  faltasRegistradas: number;
  faltasRestantes: number; // pode ser negativo internamente
  noitesRestantes: number;
  excedidoEm: number; // 0 se não excedeu
  status: Status;
};

export const NIVEL_ALERTA_PADRAO = 3;
export const NIVEL_ALERTA_MIN = 1;
export const NIVEL_ALERTA_MAX = 30;
export const LEMBRETE_ATIVO_PADRAO = true;
export const LEMBRETE_DIAS_ANTES_PADRAO = 1;
export const LEMBRETE_DIAS_ANTES_MIN = 0;
export const LEMBRETE_DIAS_ANTES_MAX = 14;
export const LEMBRETE_HORA_PADRAO = 8;
export const LEMBRETE_HORA_MIN = 0;
export const LEMBRETE_HORA_MAX = 23;
export const AULAS_POR_NOITE_PADRAO = 3;
export const PERCENTUAL_MAXIMO_FALTAS = 0.25;
export const CONFIG_PADRAO: Config = {
  nivelAlerta: NIVEL_ALERTA_PADRAO,
  lembreteAtivo: LEMBRETE_ATIVO_PADRAO,
  lembreteDiasAntes: LEMBRETE_DIAS_ANTES_PADRAO,
  lembreteHora: LEMBRETE_HORA_PADRAO,
};