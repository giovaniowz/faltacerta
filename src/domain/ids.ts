// Identificador simples e suficiente para dados guardados só no celular.
export function gerarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
