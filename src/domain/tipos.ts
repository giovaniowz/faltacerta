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
};

export type Config = { nivelAlerta: number };

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
export const AULAS_POR_NOITE_PADRAO = 3;
export const PERCENTUAL_MAXIMO_FALTAS = 0.25;
export const CONFIG_PADRAO: Config = { nivelAlerta: NIVEL_ALERTA_PADRAO };