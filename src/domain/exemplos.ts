import { somarDias } from './datas';
import { Compromisso, Disciplina, Falta } from './tipos';

export type DadosDeExemplo = {
  disciplinas: Disciplina[];
  faltas: Falta[];
  compromissos: Compromisso[];
};

// Dados para demonstrar o app: uma disciplina em cada status e prazos de todos os tipos.
// As datas são relativas a "hoje", então a demonstração sempre parece atual.
export function gerarDadosDeExemplo(hoje: string): DadosDeExemplo {
  const criada = `${hoje}T12:00:00.000Z`;
  const disc = (n: number, nome: string, professor: string, cargaHoraria: number, aulasPorNoite: number): Disciplina => ({
    id: `exemplo-d${n}`,
    nome,
    professor,
    cargaHoraria,
    aulasPorNoite,
    criadaEm: criada,
  });

  const disciplinas = [
    disc(1, 'Auditoria de Sistemas', 'Prof. Exemplo A', 60, 3),
    disc(2, 'Redes de Computadores', 'Prof. Exemplo B', 80, 4),
    disc(3, 'Gestão de Projetos', 'Prof. Exemplo C', 60, 3),
    disc(4, 'Banco de Dados', 'Prof. Exemplo D', 60, 3),
    disc(5, 'Internet das Coisas', 'Prof. Exemplo E', 45, 3),
  ];

  // Uma falta por semana, voltando no tempo a partir de hoje.
  const faltas: Falta[] = [];
  const registrar = (n: number, quantidades: number[]) => {
    quantidades.forEach((quantidade, i) => {
      faltas.push({
        id: `exemplo-f${n}-${i + 1}`,
        disciplinaId: `exemplo-d${n}`,
        data: somarDias(hoje, -7 * (quantidades.length - i)),
        quantidade,
      });
    });
  };
  registrar(1, [3, 3, 3, 3]); // 12 de 15: perto do limite
  registrar(2, [4, 4]); // 8 de 20: dentro do limite
  registrar(3, [3, 2]); // 5 de 15: dentro do limite
  registrar(4, [3, 3, 3, 3, 3]); // 15 de 15: limite atingido
  registrar(5, [3, 3, 3, 3]); // 12 de 11: limite excedido

  const comp = (
    n: number,
    disciplinaId: string,
    tipo: Compromisso['tipo'],
    descricao: string,
    dias: number,
    concluido = false
  ): Compromisso => ({
    id: `exemplo-c${n}`,
    disciplinaId,
    tipo,
    descricao,
    prazo: somarDias(hoje, dias),
    concluido,
    criadoEm: criada,
  });

  const compromissos = [
    comp(1, 'exemplo-d5', 'trabalho', 'Seminário', 0),
    comp(2, 'exemplo-d1', 'prova', 'Prova 1', 2),
    comp(3, 'exemplo-d3', 'trabalho', 'Trabalho final', 7),
    comp(4, 'exemplo-d2', 'prova', 'Prova 2', 14),
    comp(5, 'exemplo-d4', 'trabalho', 'Relatório', -2),
    comp(6, 'exemplo-d2', 'prova', 'Prova 1', -10, true),
  ];

  return { disciplinas, faltas, compromissos };
}
