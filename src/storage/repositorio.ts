import AsyncStorage from '@react-native-async-storage/async-storage';
import { removerPorId, substituirPorId } from '../domain/listas';
import {
  CONFIG_PADRAO,
  Compromisso,
  Config,
  Disciplina,
  Falta,
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

function configValida(c: unknown): c is Config {
  if (typeof c !== 'object' || c === null) return false;
  const nivel = (c as Config).nivelAlerta;
  return Number.isInteger(nivel) && nivel >= NIVEL_ALERTA_MIN && nivel <= NIVEL_ALERTA_MAX;
}

export async function lerConfig(): Promise<Config> {
  const lida = await lerJSON<unknown>(CHAVE_CONFIG, CONFIG_PADRAO);
  return configValida(lida) ? { ...CONFIG_PADRAO, ...lida } : CONFIG_PADRAO;
}

export async function salvarConfig(c: Config): Promise<Config> {
  await gravarJSON(CHAVE_CONFIG, c);
  return c;
}
