import {
  Disciplina,
  Falta,
  NIVEL_ALERTA_PADRAO,
  PERCENTUAL_MAXIMO_FALTAS,
  Resumo,
  Status,
} from './tipos';

// Arredonda para baixo para nunca prometer mais faltas do que o permitido.
export function limiteDeFaltas(cargaHoraria: number): number {
  return Math.floor(cargaHoraria * PERCENTUAL_MAXIMO_FALTAS);
}

export function resumoDaDisciplina(
  d: Disciplina,
  faltas: Falta[],
  nivelAlerta: number = NIVEL_ALERTA_PADRAO
): Resumo {
  const limite = limiteDeFaltas(d.cargaHoraria);

  // Considera só as faltas desta disciplina.
  const faltasRegistradas = faltas
    .filter((f) => f.disciplinaId === d.id)
    .reduce((soma, f) => soma + f.quantidade, 0);

  const faltasRestantes = limite - faltasRegistradas;

  const noitesRestantes =
    faltasRestantes > 0 ? Math.floor(faltasRestantes / d.aulasPorNoite) : 0;

  const excedidoEm = faltasRestantes < 0 ? -faltasRestantes : 0;

  let status: Status;
  if (faltasRestantes < 0) status = 'excedido';
  else if (faltasRestantes === 0) status = 'limite';
  else if (faltasRestantes <= nivelAlerta) status = 'alerta';
  else status = 'ok';

  return {
    limite,
    faltasRegistradas,
    faltasRestantes,
    noitesRestantes,
    excedidoEm,
    status,
  };
}

// Prévia mostrada no cadastro: limite de faltas e quantas noites ele representa.
export function previaDoLimite(
  cargaHoraria: number,
  aulasPorNoite: number
): { limite: number; noites: number } {
  const limite = limiteDeFaltas(cargaHoraria);
  return { limite, noites: Math.floor(limite / aulasPorNoite) };
}

// Faltas de uma disciplina, da mais recente para a mais antiga.
// Na mesma data, a registrada por último aparece primeiro.
export function faltasDaDisciplina(faltas: Falta[], disciplinaId: string): Falta[] {
  return faltas
    .map((f, indice) => ({ f, indice }))
    .filter(({ f }) => f.disciplinaId === disciplinaId)
    .sort((a, b) => {
      if (a.f.data < b.f.data) return 1;
      if (a.f.data > b.f.data) return -1;
      return b.indice - a.indice;
    })
    .map(({ f }) => f);
}
