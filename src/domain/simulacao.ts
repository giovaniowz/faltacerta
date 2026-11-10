import { resumoDaDisciplina } from './calculo';
import { plural } from './textos';
import { Disciplina, Falta, Resumo } from './tipos';

export type Simulacao = {
  noites: number;
  faltasAdicionais: number;
  antes: Resumo;
  depois: Resumo;
};

// "Posso faltar?": como ficaria a disciplina se o estudante faltasse mais N noites.
export function simularNoitesFaltando(
  disciplina: Disciplina,
  faltas: Falta[],
  noites: number,
  nivelAlerta: number
): Simulacao {
  const faltasAdicionais = Math.max(0, noites) * disciplina.aulasPorNoite;
  const hipotetica: Falta = {
    id: '__simulacao__',
    disciplinaId: disciplina.id,
    data: '',
    quantidade: faltasAdicionais,
  };
  return {
    noites,
    faltasAdicionais,
    antes: resumoDaDisciplina(disciplina, faltas, nivelAlerta),
    depois: resumoDaDisciplina(disciplina, [...faltas, hipotetica], nivelAlerta),
  };
}

export function textoSimulacao(s: Simulacao): string {
  const faltando = `Faltando ${plural(s.noites, 'noite', 'noites')} (${plural(
    s.faltasAdicionais,
    'falta',
    'faltas'
  )})`;
  switch (s.depois.status) {
    case 'excedido':
      return `${faltando}, você ultrapassa o limite em ${plural(s.depois.excedidoEm, 'falta', 'faltas')} e reprova.`;
    case 'limite':
      return `${faltando}, você chega exatamente ao limite. Uma nova falta reprova.`;
    default:
      return `${faltando}, restariam ${plural(s.depois.faltasRestantes, 'falta', 'faltas')} (${plural(
        s.depois.noitesRestantes,
        'noite',
        'noites'
      )}).`;
  }
}
