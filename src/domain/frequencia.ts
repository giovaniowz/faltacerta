export const FREQUENCIA_MINIMA = 75;

// Frequência no semestre inteiro, supondo que o estudante vá às aulas que restam:
// (carga horária - faltas) / carga horária. Em décimos de ponto, arredondando para baixo
// (nunca mostra mais do que o estudante realmente tem) e em aritmética inteira,
// para não haver erro de ponto flutuante.
export function frequenciaDe(cargaHoraria: number, faltasRegistradas: number): number {
  if (cargaHoraria <= 0) return 0;
  const decimos = Math.floor(((cargaHoraria - faltasRegistradas) * 1000) / cargaHoraria);
  return Math.max(0, decimos) / 10;
}

// 80 -> "80%"; 86.7 -> "86,7%"
export function formatarPercentual(valor: number): string {
  const texto = Number.isInteger(valor) ? String(valor) : valor.toFixed(1).replace('.', ',');
  return `${texto}%`;
}
