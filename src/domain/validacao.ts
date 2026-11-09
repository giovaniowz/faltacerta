import { NIVEL_ALERTA_MAX, NIVEL_ALERTA_MIN } from './tipos';

export type EntradaDisciplina = {
  nome: string;
  professor: string;
  cargaHoraria: string;
  aulasPorNoite: string;
};

export type ErrosDisciplina = Partial<Record<keyof EntradaDisciplina, string>>;

export type ValoresDisciplina = {
  nome: string;
  professor?: string;
  cargaHoraria: number;
  aulasPorNoite: number;
};

export type ResultadoValidacao =
  | { valida: true; valores: ValoresDisciplina }
  | { valida: false; erros: ErrosDisciplina };

export const MAX_AULAS_POR_NOITE = 6;

// Aceita apenas dígitos ("3"), rejeitando "3,5", "-1", "abc" ou texto vazio.
export function lerInteiro(texto: string): number | null {
  const t = texto.trim();
  return /^\d+$/.test(t) ? parseInt(t, 10) : null;
}

export function validarDisciplina(e: EntradaDisciplina): ResultadoValidacao {
  const erros: ErrosDisciplina = {};

  const nome = e.nome.trim();
  if (nome === '') erros.nome = 'Informe o nome da disciplina.';

  const carga = lerInteiro(e.cargaHoraria);
  if (carga === null || carga <= 0) {
    erros.cargaHoraria = 'Informe a carga horária em horas, com um número inteiro maior que zero.';
  }

  const aulas = lerInteiro(e.aulasPorNoite);
  if (aulas === null || aulas < 1 || aulas > MAX_AULAS_POR_NOITE) {
    erros.aulasPorNoite = `Informe de 1 a ${MAX_AULAS_POR_NOITE} aulas por noite.`;
  }

  if (Object.keys(erros).length > 0 || carga === null || aulas === null) {
    return { valida: false, erros };
  }

  const professor = e.professor.trim();
  return {
    valida: true,
    valores: {
      nome,
      professor: professor === '' ? undefined : professor,
      cargaHoraria: carga,
      aulasPorNoite: aulas,
    },
  };
}

// Mantém a quantidade de aulas perdidas entre 1 e o máximo de aulas da noite.
export function limitarQuantidade(quantidade: number, aulasPorNoite: number): number {
  return Math.min(Math.max(quantidade, 1), aulasPorNoite);
}

// Mantém o nível de alerta (em faltas restantes) dentro dos limites aceitos.
export function limitarNivelAlerta(nivel: number): number {
  return Math.min(Math.max(Math.round(nivel), NIVEL_ALERTA_MIN), NIVEL_ALERTA_MAX);
}
