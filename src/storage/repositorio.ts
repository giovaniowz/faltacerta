import AsyncStorage from '@react-native-async-storage/async-storage';
import { removerPorId, substituirPorId } from '../domain/listas';
import {
  CONFIG_PADRAO,
  Compromisso,
  Config,
  Disciplina,
  Falta,
  LEMBRETE_DIAS_ANTES_MAX,
  LEMBRETE_DIAS_ANTES_MIN,
  LEMBRETE_HORA_MAX,
  LEMBRETE_HORA_MIN,
  NIVEL_ALERTA_MAX,
  NIVEL_ALERTA_MIN,
} from '../domain/tipos';

const CHAVE_DISCIPLINAS = 'faltacerta:disciplinas';
const CHAVE_FALTAS = 'faltacerta:faltas';
const CHAVE_COMPROMISSOS = 'faltacerta:compromissos';
const CHAVE_CONFIG = 'faltacerta:config';

// Lê um JSON do armazenamento. Se algo der errado (chave vazia ou JSON
// inválido), devolve o valor padrão para o app não cair.
async function lerJSON<T>(chave: string, padrao: T): Promise<T> {
  try {
    const texto = await AsyncStorage.getItem(chave);
    if (texto === null) return padrao;
    return JSON.parse(texto) as T;
  } catch {
    return padrao;
  }
}

// Listas só valem se o JSON for realmente uma lista.
async function lerLista<T>(chave: string): Promise<T[]> {
  const valor = await lerJSON<unknown>(chave, []);
  return Array.isArray(valor) ? (valor as T[]) : [];
}

async function gravarJSON<T>(chave: string, valor: T): Promise<void> {
  await AsyncStorage.setItem(chave, JSON.stringify(valor));
}

// ---------- disciplinas ----------

export async function listarDisciplinas(): Promise<Disciplina[]> {
  return lerLista<Disciplina>(CHAVE_DISCIPLINAS);
}

export async function salvarDisciplina(d: Disciplina): Promise<Disciplina[]> {
  const novas = [...(await listarDisciplinas()), d];
  await gravarJSON(CHAVE_DISCIPLINAS, novas);
  return novas;
}

export async function atualizarDisciplina(d: Disciplina): Promise<Disciplina[]> {
  const novas = substituirPorId(await listarDisciplinas(), d);
  await gravarJSON(CHAVE_DISCIPLINAS, novas);
  return novas;
}

export type DadosAposRemocao = {
  disciplinas: Disciplina[];
  faltas: Falta[];
  compromissos: Compromisso[];
};

// Excluir uma disciplina apaga também as faltas e os prazos dela.
export async function removerDisciplina(id: string): Promise<DadosAposRemocao> {
  const disciplinas = removerPorId(await listarDisciplinas(), id);
  const faltas = (await listarFaltas()).filter((f) => f.disciplinaId !== id);
  const compromissos = (await listarCompromissos()).filter((c) => c.disciplinaId !== id);
  await gravarJSON(CHAVE_DISCIPLINAS, disciplinas);
  await gravarJSON(CHAVE_FALTAS, faltas);
  await gravarJSON(CHAVE_COMPROMISSOS, compromissos);
  return { disciplinas, faltas, compromissos };
}

// ---------- faltas ----------

export async function listarFaltas(disciplinaId?: string): Promise<Falta[]> {
  const todas = await lerLista<Falta>(CHAVE_FALTAS);
  return disciplinaId ? todas.filter((f) => f.disciplinaId === disciplinaId) : todas;
}

export async function registrarFalta(f: Falta): Promise<Falta[]> {
  const novas = [...(await listarFaltas()), f];
  await gravarJSON(CHAVE_FALTAS, novas);
  return novas;
}

export async function atualizarFalta(f: Falta): Promise<Falta[]> {
  const novas = substituirPorId(await listarFaltas(), f);
  await gravarJSON(CHAVE_FALTAS, novas);
  return novas;
}

export async function removerFalta(id: string): Promise<Falta[]> {
  const novas = removerPorId(await listarFaltas(), id);
  await gravarJSON(CHAVE_FALTAS, novas);
  return novas;
}

// ---------- provas e trabalhos ----------

export async function listarCompromissos(): Promise<Compromisso[]> {
  return lerLista<Compromisso>(CHAVE_COMPROMISSOS);
}

export async function salvarCompromisso(c: Compromisso): Promise<Compromisso[]> {
  const novos = [...(await listarCompromissos()), c];
  await gravarJSON(CHAVE_COMPROMISSOS, novos);
  return novos;
}

export async function atualizarCompromisso(c: Compromisso): Promise<Compromisso[]> {
  const novos = substituirPorId(await listarCompromissos(), c);
  await gravarJSON(CHAVE_COMPROMISSOS, novos);
  return novos;
}

export async function removerCompromisso(id: string): Promise<Compromisso[]> {
  const novos = removerPorId(await listarCompromissos(), id);
  await gravarJSON(CHAVE_COMPROMISSOS, novos);
  return novos;
}

// ---------- configurações ----------

function inteiroEntre(valor: unknown, min: number, max: number, padrao: number): number {
  return typeof valor === 'number' && Number.isInteger(valor) && valor >= min && valor <= max ? valor : padrao;
}

// Cada campo é validado sozinho: uma configuração antiga (só com o nível de alerta)
// ou parcialmente corrompida continua valendo no que está certo.
export async function lerConfig(): Promise<Config> {
  const lida = await lerJSON<unknown>(CHAVE_CONFIG, null);
  if (typeof lida !== 'object' || lida === null) return CONFIG_PADRAO;
  const l = lida as Partial<Record<keyof Config, unknown>>;
  return {
    nivelAlerta: inteiroEntre(l.nivelAlerta, NIVEL_ALERTA_MIN, NIVEL_ALERTA_MAX, CONFIG_PADRAO.nivelAlerta),
    lembreteAtivo: typeof l.lembreteAtivo === 'boolean' ? l.lembreteAtivo : CONFIG_PADRAO.lembreteAtivo,
    lembreteDiasAntes: inteiroEntre(
      l.lembreteDiasAntes,
      LEMBRETE_DIAS_ANTES_MIN,
      LEMBRETE_DIAS_ANTES_MAX,
      CONFIG_PADRAO.lembreteDiasAntes
    ),
    lembreteHora: inteiroEntre(l.lembreteHora, LEMBRETE_HORA_MIN, LEMBRETE_HORA_MAX, CONFIG_PADRAO.lembreteHora),
  };
}

export async function salvarConfig(c: Config): Promise<Config> {
  await gravarJSON(CHAVE_CONFIG, c);
  return c;
}

// ---------- operações em bloco ----------

// Regrava todos os prazos de uma vez (usado ao sincronizar os lembretes).
export async function gravarCompromissos(lista: Compromisso[]): Promise<Compromisso[]> {
  await gravarJSON(CHAVE_COMPROMISSOS, lista);
  return lista;
}

export type DadosCompletos = {
  disciplinas: Disciplina[];
  faltas: Falta[];
  compromissos: Compromisso[];
};

// Troca TODOS os dados (usado pelos dados de exemplo). A configuração não muda.
export async function substituirTudo(dados: DadosCompletos): Promise<DadosCompletos> {
  await gravarJSON(CHAVE_DISCIPLINAS, dados.disciplinas);
  await gravarJSON(CHAVE_FALTAS, dados.faltas);
  await gravarJSON(CHAVE_COMPROMISSOS, dados.compromissos);
  return dados;
}

export async function apagarTudo(): Promise<DadosCompletos> {
  return substituirTudo({ disciplinas: [], faltas: [], compromissos: [] });
}
