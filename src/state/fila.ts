// Fila de tarefas assíncronas: cada uma só começa quando a anterior termina.
// Garante que operações que leem e gravam no armazenamento nunca se misturem.
export type Fila = {
  enfileirar<T>(tarefa: () => Promise<T>): Promise<T>;
};

export function criarFila(): Fila {
  let ultima: Promise<unknown> = Promise.resolve();
  return {
    enfileirar<T>(tarefa: () => Promise<T>): Promise<T> {
      const execucao = ultima.then(tarefa);
      // Uma tarefa que falha não pode travar as seguintes; o erro volta só para quem a pediu.
      ultima = execucao.catch(() => undefined);
      return execucao;
    },
  };
}
