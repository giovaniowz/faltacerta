import { dataDoLembrete, estadoDoLembrete, planejarLembretes, textoLembrete } from '../domain/lembretes';
import { Compromisso } from '../domain/tipos';
import type { PermissaoNotificacoes, ServicoNotificacoes } from '../notificacoes/servico';
import * as repo from '../storage/repositorio';

export type ResultadoSincronizacao = {
  permissao: PermissaoNotificacoes;
  compromissos: Compromisso[];
};

type Opcoes = {
  // Pede a permissão ao sistema se ainda não foi decidida (só vale após uma ação do usuário).
  pedirPermissao: boolean;
  agora?: Date;
};

// Deixa os avisos agendados no celular iguais ao que os prazos e a configuração pedem.
// Pode ser chamada a qualquer momento: só faz o que for preciso.
export async function sincronizarLembretes(
  servico: ServicoNotificacoes,
  { pedirPermissao, agora = new Date() }: Opcoes
): Promise<ResultadoSincronizacao> {
  const [compromissos, disciplinas, config] = await Promise.all([
    repo.listarCompromissos(),
    repo.listarDisciplinas(),
    repo.lerConfig(),
  ]);

  let permissao = await servico.permissao();
  const haAvisosPendentes = compromissos.some((c) => estadoDoLembrete(c, config, agora) === 'agendavel');
  if (permissao === 'indefinida' && pedirPermissao && haAvisosPendentes) {
    permissao = await servico.pedirPermissao();
  }

  const plano = planejarLembretes(compromissos, config, agora, await servico.idsAgendados());

  for (const id of plano.cancelar) {
    try {
      await servico.cancelar(id);
    } catch {
      // se não der para cancelar agora, a próxima sincronização tenta de novo
    }
  }

  const atualizados = new Map(compromissos.map((c) => [c.id, c]));
  let mudou = false;

  for (const id of plano.limpar) {
    const c = atualizados.get(id);
    if (c) {
      atualizados.set(id, { ...c, notificacaoId: undefined, lembreteEm: undefined });
      mudou = true;
    }
  }

  if (permissao === 'concedida') {
    const nomes = new Map(disciplinas.map((d) => [d.id, d.nome]));
    for (const id of plano.agendar) {
      const c = atualizados.get(id);
      if (!c) continue;
      const quando = dataDoLembrete(c.prazo, config.lembreteDiasAntes, config.lembreteHora);
      const { titulo, corpo } = textoLembrete(c, nomes.get(c.disciplinaId) ?? 'Disciplina', config.lembreteDiasAntes);
      try {
        const notificacaoId = await servico.agendar(titulo, corpo, quando);
        atualizados.set(id, { ...c, notificacaoId, lembreteEm: quando.toISOString() });
        mudou = true;
      } catch {
        // um aviso que falha não impede os outros nem o uso normal do app
      }
    }
  }

  const resultado = compromissos.map((c) => atualizados.get(c.id) ?? c);
  if (mudou) await repo.gravarCompromissos(resultado);
  return { permissao, compromissos: resultado };
}
