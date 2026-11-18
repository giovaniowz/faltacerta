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

// Bom dia (5h às 11h59), boa tarde (12h às 17h59) e boa noite nos demais horários.
export function saudacao(hora: number): string {
  if (hora >= 5 && hora < 12) return 'Bom dia';
  if (hora >= 12 && hora < 18) return 'Boa tarde';
  return 'Boa noite';
}
