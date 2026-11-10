import AsyncStorage from '@react-native-async-storage/async-storage';
import { Compromisso } from '../domain/tipos';
import * as repo from '../storage/repositorio';
import { criarFila } from './fila';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const pausa = (ms: number) => new Promise((r) => setTimeout(r, ms));
const comp = (id: string): Compromisso => ({
  id,
  disciplinaId: 'd1',
  tipo: 'prova',
  descricao: id,
  prazo: '2026-12-01',
  concluido: false,
  criadoEm: '2026-11-01T00:00:00.000Z',
});

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('criarFila', () => {
  it('executa as tarefas uma de cada vez, na ordem em que chegaram', async () => {
    const fila = criarFila();
    const eventos: string[] = [];
    const tarefa = (nome: string, ms: number) => async () => {
      eventos.push(`inicio ${nome}`);
      await pausa(ms);
      eventos.push(`fim ${nome}`);
      return nome;
    };
    const resultados = await Promise.all([
      fila.enfileirar(tarefa('A', 30)),
      fila.enfileirar(tarefa('B', 5)),
      fila.enfileirar(tarefa('C', 1)),
    ]);
    expect(resultados).toEqual(['A', 'B', 'C']);
    expect(eventos).toEqual(['inicio A', 'fim A', 'inicio B', 'fim B', 'inicio C', 'fim C']);
  });

  it('uma tarefa que falha não trava as seguintes', async () => {
    const fila = criarFila();
    const falha = fila.enfileirar(async () => {
      throw new Error('erro de propósito');
    });
    const seguinte = fila.enfileirar(async () => 'ok');
    await expect(falha).rejects.toThrow('erro de propósito');
    await expect(seguinte).resolves.toBe('ok');
  });

  it('evita perder dados quando várias gravações chegam ao mesmo tempo', async () => {
    const fila = criarFila();
    await Promise.all(['a', 'b', 'c', 'd', 'e'].map((id) => fila.enfileirar(() => repo.salvarCompromisso(comp(id)))));
    expect((await repo.listarCompromissos()).map((c) => c.id)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('sem a fila, gravações simultâneas se perdem (por isso ela existe)', async () => {
    await Promise.all(['a', 'b', 'c', 'd', 'e'].map((id) => repo.salvarCompromisso(comp(id))));
    expect((await repo.listarCompromissos()).length).toBeLessThan(5);
  });
});
