import { removerPorId, substituirPorId } from './listas';

describe('listas', () => {
  const lista = [
    { id: '1', nome: 'a' },
    { id: '2', nome: 'b' },
  ];
  it('substitui só o item com o mesmo id, sem mutar a lista', () => {
    const nova = substituirPorId(lista, { id: '2', nome: 'novo' });
    expect(nova).toEqual([
      { id: '1', nome: 'a' },
      { id: '2', nome: 'novo' },
    ]);
    expect(lista[1].nome).toBe('b');
  });
  it('ignora ids que não existem', () => {
    expect(substituirPorId(lista, { id: '9', nome: 'x' })).toEqual(lista);
  });
  it('remove pelo id', () => {
    expect(removerPorId(lista, '1')).toEqual([{ id: '2', nome: 'b' }]);
    expect(removerPorId(lista, '9')).toEqual(lista);
  });
});
