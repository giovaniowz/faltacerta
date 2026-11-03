import { Resumo, Status } from './tipos';

export function plural(n: number, singular: string, pluralTexto: string): string {
  return `${n} ${n === 1 ? singular : pluralTexto}`;
}

// Rótulo curto do status. Junto da cor, evita depender só de cor para informar.
export function rotuloStatus(status: Status): string {
  switch (status) {
    case 'ok':
      return 'Dentro do limite';
    case 'alerta':
      return 'Perto do limite';
    case 'limite':
      return 'Limite atingido';
    case 'excedido':
      return 'Limite excedido';
  }
}

export function textoStatus(r: Resumo): string {
  switch (r.status) {
    case 'ok':
      return `Você ainda pode faltar ${plural(r.faltasRestantes, 'aula', 'aulas')} (${plural(
        r.noitesRestantes,
        'noite',
        'noites'
      )}).`;
    case 'alerta':
      return `Atenção: você está perto do limite. ${
        r.faltasRestantes === 1 ? 'Resta 1 falta.' : `Restam ${r.faltasRestantes} faltas.`
      }`;
    case 'limite':
      return 'Limite atingido. Uma nova falta reprova a disciplina.';
    case 'excedido':
      return `Limite excedido em ${plural(r.excedidoEm, 'falta', 'faltas')}.`;
  }
}
