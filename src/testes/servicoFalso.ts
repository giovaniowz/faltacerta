import type { PermissaoNotificacoes, ServicoNotificacoes } from '../notificacoes/servico';

export type AgendadaFalsa = { titulo: string; corpo: string; quando: Date };

// Serviço de notificações de mentira, para testar sem celular.
export function criarServicoFalso(
  permissaoInicial: PermissaoNotificacoes = 'concedida',
  respostaAoPedir: PermissaoNotificacoes = 'concedida'
) {
  const agendadas = new Map<string, AgendadaFalsa>();
  const estado = {
    permissao: permissaoInicial,
    respostaAoPedir,
    pedidos: 0,
    proximoId: 1,
    falharAoAgendarComTitulo: '',
  };

  const servico: ServicoNotificacoes = {
    async permissao() {
      return estado.permissao;
    },
    async pedirPermissao() {
      estado.pedidos += 1;
      estado.permissao = estado.respostaAoPedir;
      return estado.permissao;
    },
    async agendar(titulo, corpo, quando) {
      if (estado.falharAoAgendarComTitulo && titulo.includes(estado.falharAoAgendarComTitulo)) {
        throw new Error('falha simulada');
      }
      const id = `notif-${estado.proximoId++}`;
      agendadas.set(id, { titulo, corpo, quando });
      return id;
    },
    async cancelar(id) {
      agendadas.delete(id);
    },
    async idsAgendados() {
      return [...agendadas.keys()];
    },
  };

  return { servico, agendadas, estado };
}
