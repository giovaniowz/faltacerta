import { formatarDataBR, paraDataISO } from './datas';
import { rotuloTipo } from './prazos';
import { Compromisso, Config } from './tipos';

// Horário em que o aviso deve aparecer: `diasAntes` dias antes do prazo, na hora indicada
// (fuso do aparelho). Com diasAntes = 0, é no próprio dia do prazo.
export function dataDoLembrete(prazo: string, diasAntes: number, hora: number): Date {
  const [ano, mes, dia] = prazo.split('-').map(Number);
  return new Date(ano, mes - 1, dia - diasAntes, hora, 0, 0, 0);
}

export function rotuloHora(hora: number): string {
  return `${String(hora).padStart(2, '0')}:00`;
}

// "1 dia antes, às 08:00" / "No dia do prazo, às 08:00"
export function descreverLembrete(diasAntes: number, hora: number): string {
  const quando = diasAntes === 0 ? 'No dia do prazo' : diasAntes === 1 ? '1 dia antes' : `${diasAntes} dias antes`;
  return `${quando}, às ${rotuloHora(hora)}`;
}

export type EstadoLembrete = 'agendavel' | 'desativado' | 'concluido' | 'passou';

// "passou": o horário do aviso já ficou para trás, então nenhum aviso será enviado.
export function estadoDoLembrete(c: Compromisso, config: Config, agora: Date): EstadoLembrete {
  if (c.concluido) return 'concluido';
  if (!config.lembreteAtivo) return 'desativado';
  const quando = dataDoLembrete(c.prazo, config.lembreteDiasAntes, config.lembreteHora);
  return quando.getTime() > agora.getTime() ? 'agendavel' : 'passou';
}

// Frase mostrada no formulário do prazo.
export function textoEstadoLembrete(estado: EstadoLembrete, config: Config, prazo: string): string {
  switch (estado) {
    case 'agendavel': {
      const quando = dataDoLembrete(prazo, config.lembreteDiasAntes, config.lembreteHora);
      return `Lembrete: ${formatarDataBR(paraDataISO(quando))} às ${rotuloHora(config.lembreteHora)}.`;
    }
    case 'passou':
      return 'O horário do lembrete já passou: nenhum aviso será enviado para este prazo.';
    case 'desativado':
      return 'Os lembretes estão desativados nas Configurações.';
    case 'concluido':
      return 'Item concluído: sem lembrete.';
  }
}

export function textoLembrete(
  c: Compromisso,
  nomeDisciplina: string,
  diasAntes: number
): { titulo: string; corpo: string } {
  const quando = diasAntes === 0 ? 'hoje' : diasAntes === 1 ? 'amanhã' : `em ${diasAntes} dias`;
  return {
    titulo: `${rotuloTipo(c.tipo)}: ${c.descricao}`,
    corpo: `${nomeDisciplina} · prazo ${quando} (${formatarDataBR(c.prazo)})`,
  };
}

export type PlanoDeLembretes = {
  cancelar: string[]; // identificadores de notificações a cancelar
  agendar: string[]; // ids de compromissos que precisam de um novo agendamento
  limpar: string[]; // ids de compromissos cujos dados de lembrete devem ser apagados
};

// Compara o que DEVERIA estar agendado com o que está agendado no celular e diz o que fazer.
// Cobre tudo de uma vez: novo prazo, edição, conclusão, exclusão, mudança de configuração,
// aviso que já disparou e notificações que ficaram sem prazo correspondente.
export function planejarLembretes(
  compromissos: Compromisso[],
  config: Config,
  agora: Date,
  idsAgendados: string[]
): PlanoDeLembretes {
  const agendados = new Set(idsAgendados);
  const referenciados = new Set<string>();
  const cancelar = new Set<string>();
  const agendar: string[] = [];
  const limpar: string[] = [];

  for (const c of compromissos) {
    if (c.notificacaoId) referenciados.add(c.notificacaoId);
    const noCelular = c.notificacaoId !== undefined && agendados.has(c.notificacaoId);

    if (estadoDoLembrete(c, config, agora) === 'agendavel') {
      const desejado = dataDoLembrete(c.prazo, config.lembreteDiasAntes, config.lembreteHora).toISOString();
      if (!(noCelular && c.lembreteEm === desejado)) {
        if (noCelular && c.notificacaoId) cancelar.add(c.notificacaoId);
        agendar.push(c.id);
      }
    } else if (c.notificacaoId || c.lembreteEm) {
      if (noCelular && c.notificacaoId) cancelar.add(c.notificacaoId);
      limpar.push(c.id);
    }
  }

  for (const id of idsAgendados) {
    if (!referenciados.has(id)) cancelar.add(id);
  }

  return { cancelar: [...cancelar], agendar, limpar };
}
