import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG_PADRAO, Config, Disciplina, Falta } from '../domain/tipos';

const CHAVE_DISCIPLINAS = 'faltacerta:disciplinas';
const CHAVE_FALTAS = 'faltacerta:faltas';
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

async function gravarJSON<T>(chave: string, valor: T): Promise<void> {
  await AsyncStorage.setItem(chave, JSON.stringify(valor));
}

export async function listarDisciplinas(): Promise<Disciplina[]> {
  return lerJSON<Disciplina[]>(CHAVE_DISCIPLINAS, []);
}

export async function salvarDisciplina(d: Disciplina): Promise<void> {
  const atuais = await listarDisciplinas();
  await gravarJSON(CHAVE_DISCIPLINAS, [...atuais, d]);
}

export async function listarFaltas(disciplinaId?: string): Promise<Falta[]> {
  const todas = await lerJSON<Falta[]>(CHAVE_FALTAS, []);
  return disciplinaId ? todas.filter((f) => f.disciplinaId === disciplinaId) : todas;
}

// Sprint 2: editar e excluir faltas (US08). Na Sprint 1 só registramos.
export async function registrarFalta(f: Falta): Promise<void> {
  const atuais = await listarFaltas();
  await gravarJSON(CHAVE_FALTAS, [...atuais, f]);
}

export async function lerConfig(): Promise<Config> {
  return lerJSON<Config>(CHAVE_CONFIG, CONFIG_PADRAO);
}