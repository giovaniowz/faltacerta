// Datas no formato AAAA-MM-DD, sempre pelo fuso LOCAL do aparelho.
//
// Atenção: não use `new Date().toISOString().slice(0, 10)` para a data de hoje.
// O toISOString usa UTC; no Brasil (UTC-3), depois das 21h ele já devolve o dia
// seguinte, e uma falta de uma aula noturna seria registrada na data errada.

function doisDigitos(n: number): string {
  return String(n).padStart(2, '0');
}

export function paraDataISO(data: Date): string {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

export function hojeISO(agora: Date = new Date()): string {
  return paraDataISO(agora);
}

// '2026-10-26' -> '26/10/2026'
export function formatarDataBR(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

// Compara como texto: o formato AAAA-MM-DD mantém a ordem cronológica.
export function ehFutura(iso: string, hoje: string = hojeISO()): boolean {
  return iso > hoje;
}

// '2026-11-10' -> Date à meia-noite do horário local (para o seletor de data).
export function isoParaData(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}
