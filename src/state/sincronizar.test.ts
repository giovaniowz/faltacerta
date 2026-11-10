import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG_PADRAO, Compromisso, Disciplina } from '../domain/tipos';
import * as repo from '../storage/repositorio';
import { criarServicoFalso } from '../testes/servicoFalso';
import { sincronizarLembretes } from './sincronizar';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const agora = new Date(2026, 10, 9, 12, 0); // 09/11/2026 12:00
const disciplina: Disciplina = { id: 'd1', nome: 'Redes', cargaHoraria: 60, aulasPorNoite: 3, criadaEm: '2026-10-01T00:00:00.000Z' };
const comp = (id: string, prazo: string, extra: Partial<Compromisso> = {}): Compromisso => ({
  id,
  disciplinaId: 'd1',
  tipo: 'prova',
  descricao: `Prova ${id}`,
  prazo,
  concluido: false,
  criadoEm: '2026-11-01T10:00:00.000Z',
  ...extra,
});

beforeEach(async () => {
  await AsyncStorage.clear();
  await repo.salvarDisciplina(disciplina);
});

describe('sincronizarLembretes', () => {
  it('agenda um aviso para cada prazo futuro e guarda o identificador', async () => {
    await repo.salvarCompromisso(comp('a', '2026-11-20'));
    const { servico, agendadas } = criarServicoFalso();

    const r = await sincronizarLembretes(servico, { pedirPermissao: false, agora });

    expect(agendadas.size).toBe(1);
    const [id, aviso] = [...agendadas.entries()][0];
    expect(aviso.titulo).toBe('Prova: Prova a');
    expect(aviso.corpo).toBe('Redes · prazo amanhã (20/11/2026)');
    expect(aviso.quando).toEqual(new Date(2026, 10, 19, 8, 0)); // 1 dia antes, 08:00
    expect(r.compromissos[0].notificacaoId).toBe(id);
    expect((await repo.listarCompromissos())[0].notificacaoId).toBe(id);
  });

  it('é idempotente: rodar de novo não duplica avisos', async () => {
    await repo.salvarCompromisso(comp('a', '2026-11-20'));
    const { servico, agendadas } = criarServicoFalso();
    await sincronizarLembretes(servico, { pedirPermissao: false, agora });
    await sincronizarLembretes(servico, { pedirPermissao: false, agora });
    expect(agendadas.size).toBe(1);
  });

  it('pede a permissão quando ainda não foi decidida e a ação veio do usuário', async () => {
    await repo.salvarCompromisso(comp('a', '2026-11-20'));
    const { servico, agendadas, estado } = criarServicoFalso('indefinida', 'concedida');
    const r = await sincronizarLembretes(servico, { pedirPermissao: true, agora });
    expect(estado.pedidos).toBe(1);
    expect(r.permissao).toBe('concedida');
    expect(agendadas.size).toBe(1);
  });

  it('não pede a permissão sem ação do usuário (ex.: ao abrir o app)', async () => {
    await repo.salvarCompromisso(comp('a', '2026-11-20'));
    const { servico, agendadas, estado } = criarServicoFalso('indefinida');
    const r = await sincronizarLembretes(servico, { pedirPermissao: false, agora });
    expect(estado.pedidos).toBe(0);
    expect(r.permissao).toBe('indefinida');
    expect(agendadas.size).toBe(0);
  });

  it('não pede a permissão se não há nenhum aviso para agendar', async () => {
    const { servico, estado } = criarServicoFalso('indefinida');
    await sincronizarLembretes(servico, { pedirPermissao: true, agora });
    expect(estado.pedidos).toBe(0);
  });

  it('com a permissão negada, não agenda nada e o app segue normal', async () => {
    await repo.salvarCompromisso(comp('a', '2026-11-20'));
    const { servico, agendadas } = criarServicoFalso('negada');
    const r = await sincronizarLembretes(servico, { pedirPermissao: true, agora });
    expect(r.permissao).toBe('negada');
    expect(agendadas.size).toBe(0);
    expect(r.compromissos.length).toBe(1);
  });

  it('reagenda quando a configuração muda', async () => {
    await repo.salvarCompromisso(comp('a', '2026-11-20'));
    const { servico, agendadas } = criarServicoFalso();
    await sincronizarLembretes(servico, { pedirPermissao: false, agora });

    await repo.salvarConfig({ ...CONFIG_PADRAO, lembreteDiasAntes: 3, lembreteHora: 19 });
    await sincronizarLembretes(servico, { pedirPermissao: false, agora });

    expect(agendadas.size).toBe(1);
    expect([...agendadas.values()][0].quando).toEqual(new Date(2026, 10, 17, 19, 0));
  });

  it('cancela ao concluir, ao excluir e ao desativar', async () => {
    await repo.salvarCompromisso(comp('a', '2026-11-20'));
    await repo.salvarCompromisso(comp('b', '2026-11-25'));
    await repo.salvarCompromisso(comp('c', '2026-11-30'));
    const { servico, agendadas } = criarServicoFalso();
    await sincronizarLembretes(servico, { pedirPermissao: false, agora });
    expect(agendadas.size).toBe(3);

    const [a, b] = await repo.listarCompromissos();
    await repo.atualizarCompromisso({ ...a, concluido: true });
    await sincronizarLembretes(servico, { pedirPermissao: false, agora });
    expect(agendadas.size).toBe(2);
    expect((await repo.listarCompromissos())[0].notificacaoId).toBeUndefined();

    await repo.removerCompromisso(b.id);
    await sincronizarLembretes(servico, { pedirPermissao: false, agora });
    expect(agendadas.size).toBe(1);

    await repo.salvarConfig({ ...CONFIG_PADRAO, lembreteAtivo: false });
    await sincronizarLembretes(servico, { pedirPermissao: false, agora });
    expect(agendadas.size).toBe(0);
  });

  it('excluir a disciplina cancela os avisos dos prazos dela', async () => {
    await repo.salvarCompromisso(comp('a', '2026-11-20'));
    const { servico, agendadas } = criarServicoFalso();
    await sincronizarLembretes(servico, { pedirPermissao: false, agora });
    await repo.removerDisciplina('d1');
    await sincronizarLembretes(servico, { pedirPermissao: false, agora });
    expect(agendadas.size).toBe(0);
  });

  it('não agenda prazos cujo horário do aviso já passou', async () => {
    await repo.salvarCompromisso(comp('hoje', '2026-11-09'));
    await repo.salvarCompromisso(comp('amanha', '2026-11-10')); // aviso era 09/11 08:00
    const { servico, agendadas } = criarServicoFalso();
    await sincronizarLembretes(servico, { pedirPermissao: false, agora });
    expect(agendadas.size).toBe(0);
  });

  it('uma falha ao agendar não impede os outros avisos', async () => {
    await repo.salvarCompromisso(comp('a', '2026-11-20'));
    await repo.salvarCompromisso(comp('b', '2026-11-25'));
    const { servico, agendadas, estado } = criarServicoFalso();
    estado.falharAoAgendarComTitulo = 'Prova a';
    const r = await sincronizarLembretes(servico, { pedirPermissao: false, agora });
    expect(agendadas.size).toBe(1);
    expect(r.compromissos.find((c) => c.id === 'a')?.notificacaoId).toBeUndefined();
    expect(r.compromissos.find((c) => c.id === 'b')?.notificacaoId).toBeDefined();
  });

  it('reagenda se o aviso sumiu do celular', async () => {
    await repo.salvarCompromisso(comp('a', '2026-11-20'));
    const { servico, agendadas } = criarServicoFalso();
    await sincronizarLembretes(servico, { pedirPermissao: false, agora });
    agendadas.clear(); // ex.: o sistema apagou os agendamentos
    await sincronizarLembretes(servico, { pedirPermissao: false, agora });
    expect(agendadas.size).toBe(1);
  });
});
