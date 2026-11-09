import AsyncStorage from '@react-native-async-storage/async-storage';
import * as repo from './repositorio';
import { Compromisso, Disciplina, Falta } from '../domain/tipos';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const disc = (id: string, nome = 'Redes'): Disciplina => ({
  id,
  nome,
  cargaHoraria: 60,
  aulasPorNoite: 3,
  criadaEm: '2026-10-01T00:00:00.000Z',
});
const falta = (id: string, disciplinaId: string, quantidade = 3): Falta => ({
  id,
  disciplinaId,
  data: '2026-10-01',
  quantidade,
});
const comp = (id: string, disciplinaId: string): Compromisso => ({
  id,
  disciplinaId,
  tipo: 'prova',
  descricao: 'Prova 1',
  prazo: '2026-11-20',
  concluido: false,
  criadoEm: '2026-10-01T00:00:00.000Z',
});

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('repositório', () => {
  it('começa vazio e com a configuração padrão', async () => {
    expect(await repo.listarDisciplinas()).toEqual([]);
    expect(await repo.listarFaltas()).toEqual([]);
    expect(await repo.listarCompromissos()).toEqual([]);
    expect(await repo.lerConfig()).toEqual({ nivelAlerta: 3 });
  });

  it('salva e atualiza disciplinas', async () => {
    await repo.salvarDisciplina(disc('a'));
    const depois = await repo.atualizarDisciplina({ ...disc('a'), nome: 'Redes II' });
    expect(depois.map((d) => d.nome)).toEqual(['Redes II']);
    expect((await repo.listarDisciplinas())[0].nome).toBe('Redes II');
  });

  it('registra, edita e remove faltas', async () => {
    await repo.registrarFalta(falta('f1', 'a'));
    await repo.registrarFalta(falta('f2', 'a'));
    await repo.atualizarFalta(falta('f1', 'a', 2));
    expect((await repo.listarFaltas('a')).map((f) => f.quantidade)).toEqual([2, 3]);
    await repo.removerFalta('f2');
    expect((await repo.listarFaltas()).map((f) => f.id)).toEqual(['f1']);
  });

  it('cadastra, edita e remove provas e trabalhos', async () => {
    await repo.salvarCompromisso(comp('c1', 'a'));
    await repo.atualizarCompromisso({ ...comp('c1', 'a'), concluido: true });
    expect((await repo.listarCompromissos())[0].concluido).toBe(true);
    await repo.removerCompromisso('c1');
    expect(await repo.listarCompromissos()).toEqual([]);
  });

  it('excluir uma disciplina apaga também as faltas e os prazos dela', async () => {
    await repo.salvarDisciplina(disc('a'));
    await repo.salvarDisciplina(disc('b', 'Banco'));
    await repo.registrarFalta(falta('f1', 'a'));
    await repo.registrarFalta(falta('f2', 'b'));
    await repo.salvarCompromisso(comp('c1', 'a'));
    await repo.salvarCompromisso(comp('c2', 'b'));

    const apos = await repo.removerDisciplina('a');
    expect(apos.disciplinas.map((d) => d.id)).toEqual(['b']);
    expect(apos.faltas.map((f) => f.id)).toEqual(['f2']);
    expect(apos.compromissos.map((c) => c.id)).toEqual(['c2']);
    expect((await repo.listarFaltas()).map((f) => f.id)).toEqual(['f2']);
    expect((await repo.listarCompromissos()).map((c) => c.id)).toEqual(['c2']);
  });

  it('salva e lê o nível de alerta', async () => {
    await repo.salvarConfig({ nivelAlerta: 6 });
    expect(await repo.lerConfig()).toEqual({ nivelAlerta: 6 });
  });

  it('ignora configuração corrompida e volta ao padrão', async () => {
    await AsyncStorage.setItem('faltacerta:config', JSON.stringify({ nivelAlerta: 'abc' }));
    expect(await repo.lerConfig()).toEqual({ nivelAlerta: 3 });
    await AsyncStorage.setItem('faltacerta:config', '{quebrado');
    expect(await repo.lerConfig()).toEqual({ nivelAlerta: 3 });
  });

  it('não cai com dados corrompidos nas listas', async () => {
    await AsyncStorage.setItem('faltacerta:disciplinas', '{"nao":"e lista"}');
    await AsyncStorage.setItem('faltacerta:faltas', 'lixo');
    expect(await repo.listarDisciplinas()).toEqual([]);
    expect(await repo.listarFaltas()).toEqual([]);
  });

  it('mantém dados da versão anterior (disciplinas e faltas já salvas)', async () => {
    await AsyncStorage.setItem('faltacerta:disciplinas', JSON.stringify([disc('velha')]));
    await AsyncStorage.setItem('faltacerta:faltas', JSON.stringify([falta('f0', 'velha')]));
    expect((await repo.listarDisciplinas())[0].id).toBe('velha');
    expect((await repo.listarFaltas('velha')).length).toBe(1);
    expect(await repo.listarCompromissos()).toEqual([]);
  });
});
