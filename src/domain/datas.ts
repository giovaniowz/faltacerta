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

// Soma (ou subtrai) dias de calendário a uma data AAAA-MM-DD.
export function somarDias(iso: string, dias: number): string {
  const [ano, mes, dia] = iso.split('-').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia + dias));
  return `${data.getUTCFullYear()}-${doisDigitos(data.getUTCMonth() + 1)}-${doisDigitos(data.getUTCDate())}`;
}

const DIAS_CURTOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const DIAS_LONGOS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function diaDaSemana(iso: string): number {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay();
}

// '2026-11-18' -> 'ter, 18/11'
export function formatarDataCurta(iso: string): string {
  const [, mes, dia] = iso.split('-');
  return `${DIAS_CURTOS[diaDaSemana(iso)]}, ${dia}/${mes}`;
}

// '2026-11-16' -> 'segunda-feira, 16 de novembro'
export function dataPorExtenso(iso: string): string {
  const [, mes, dia] = iso.split('-').map(Number);
  return `${DIAS_LONGOS[diaDaSemana(iso)]}, ${dia} de ${MESES[mes - 1]}`;
}
