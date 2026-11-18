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

export type PreviaDoRegistro = { antes: Resumo; depois: Resumo };

// Como a disciplina ficaria depois de registrar (ou editar) uma falta de `quantidade` aulas.
// Ao editar, a falta em edição sai da conta, para não ser contada duas vezes.
export function previaDoRegistro(
  disciplina: Disciplina,
  faltas: Falta[],
  quantidade: number,
  nivelAlerta: number,
  faltaEmEdicaoId?: string
): PreviaDoRegistro {
  const base = faltas.filter((f) => f.id !== faltaEmEdicaoId);
  const nova: Falta = { id: '__previa__', disciplinaId: disciplina.id, data: '', quantidade };
  return {
    antes: resumoDaDisciplina(disciplina, faltas, nivelAlerta),
    depois: resumoDaDisciplina(disciplina, [...base, nova], nivelAlerta),
  };
}

// Já existe falta desta disciplina nesta data? (para avisar antes de registrar em duplicidade)
export function faltaNaMesmaData(faltas: Falta[], disciplinaId: string, data: string, ignorarId?: string): boolean {
  return faltas.some((f) => f.disciplinaId === disciplinaId && f.data === data && f.id !== ignorarId);
}

export function textoPrevia(p: PreviaDoRegistro): string {
  switch (p.depois.status) {
    case 'excedido':
      return `Com este registro você ultrapassa o limite em ${plural(p.depois.excedidoEm, 'falta', 'faltas')} e reprova.`;
    case 'limite':
      return 'Com este registro você chega exatamente ao limite. Uma nova falta reprova.';
    default:
      return `Depois deste registro, restarão ${plural(p.depois.faltasRestantes, 'falta', 'faltas')} (${plural(
        p.depois.noitesRestantes,
        'noite',
        'noites'
      )}).`;
  }
}
