import { resumoDaDisciplina } from './calculo';
import { diasAte } from './prazos';
import { rotuloPrazo } from './prazos';
import { plural } from './textos';
import { Compromisso, Disciplina, Falta, Resumo, Status } from './tipos';

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

export type Tom = 'ok' | 'atencao' | 'critico';

export type ResumoDoPainel = { titulo: string; subtitulo: string; tom: Tom };

// Mensagem principal da tela inicial: o que o estudante precisa saber primeiro.
// `proximos` e `atrasados` vêm de agruparPrazos (já em ordem).
export function resumoDoPainel(
  emAtencao: DisciplinaComResumo[],
  atrasados: Compromisso[],
  proximos: Compromisso[],
  hoje: string
): ResumoDoPainel {
  const graves = emAtencao.filter(({ resumo }) => resumo.status === 'excedido' || resumo.status === 'limite');
  const titulo =
    emAtencao.length === 0
      ? 'Tudo certo por aqui'
      : emAtencao.length === 1
        ? '1 disciplina precisa de atenção'
        : `${emAtencao.length} disciplinas precisam de atenção`;

  let subtitulo: string;
  if (atrasados.length > 0) {
    subtitulo = `${plural(atrasados.length, 'prazo atrasado', 'prazos atrasados')}`;
  } else if (proximos.length > 0) {
    const p = proximos[0];
    subtitulo = `Próximo prazo: ${p.descricao}, ${rotuloPrazo(diasAte(p.prazo, hoje)).toLocaleLowerCase('pt-BR')}`;
  } else {
    subtitulo = 'Nenhum prazo pendente';
  }

  const tom: Tom = graves.length > 0 || atrasados.length > 0 ? 'critico' : emAtencao.length > 0 ? 'atencao' : 'ok';
  return { titulo, subtitulo, tom };
}
