// Operações simples sobre listas de itens com `id`, sem mutar a lista original.

export function substituirPorId<T extends { id: string }>(lista: T[], novo: T): T[] {
  return lista.map((item) => (item.id === novo.id ? novo : item));
}

export function removerPorId<T extends { id: string }>(lista: T[], id: string): T[] {
  return lista.filter((item) => item.id !== id);
}
