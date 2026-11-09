import { resumoDaDisciplina } from './calculo';
import { Disciplina, Falta, Resumo, Status } from './tipos';

export type DisciplinaComResumo = { disciplina: Disciplina; resumo: Resumo };

const GRAVIDADE: Record<Status, number> = { excedido: 0, limite: 1, alerta: 2, ok: 3 };

export function resumosDasDisciplinas(
  disciplinas: Disciplina[],
  faltas: Falta[],
  nivelAlerta: number
): DisciplinaComResumo[] {
  return disciplinas.map((disciplina) => ({
    disciplina,
    resumo: resumoDaDisciplina(disciplina, faltas, nivelAlerta),
  }));
}

// Disciplinas que pedem atenção (qualquer status diferente de "ok"),
// da mais grave para a menos grave; em empate, a com menos faltas restantes.
export function disciplinasEmAtencao(
  disciplinas: Disciplina[],
  faltas: Falta[],
  nivelAlerta: number
): DisciplinaComResumo[] {
  return resumosDasDisciplinas(disciplinas, faltas, nivelAlerta)
    .filter(({ resumo }) => resumo.status !== 'ok')
    .sort((a, b) => {
      const porGravidade = GRAVIDADE[a.resumo.status] - GRAVIDADE[b.resumo.status];
      if (porGravidade !== 0) return porGravidade;
      const porRestantes = a.resumo.faltasRestantes - b.resumo.faltasRestantes;
      if (porRestantes !== 0) return porRestantes;
      return a.disciplina.nome.localeCompare(b.disciplina.nome, 'pt-BR');
    });
}
