import {
  lerInteiro,
  limitarDiasAntes,
  limitarHora,
  limitarNivelAlerta,
  limitarQuantidade,
  validarDisciplina,
} from './validacao';

const entrada = (parcial = {}) => ({
  nome: 'Auditoria de Sistemas',
  professor: '',
  cargaHoraria: '60',
  aulasPorNoite: '3',
  ...parcial,
});

describe('lerInteiro', () => {
  it('aceita só dígitos', () => {
    expect(lerInteiro('60')).toBe(60);
    expect(lerInteiro(' 3 ')).toBe(3);
  });
  it.each(['', 'abc', '3,5', '3.5', '-1', '1e2'])('rejeita "%s"', (texto) => {
    expect(lerInteiro(texto)).toBeNull();
  });
});

describe('validarDisciplina', () => {
  it('aceita dados válidos e trata professor como opcional', () => {
    const r = validarDisciplina(entrada());
    expect(r.valida).toBe(true);
    if (r.valida) {
      expect(r.valores).toEqual({
        nome: 'Auditoria de Sistemas',
        professor: undefined,
        cargaHoraria: 60,
        aulasPorNoite: 3,
      });
    }
  });

  it('remove espaços do nome e do professor', () => {
    const r = validarDisciplina(entrada({ nome: '  Redes  ', professor: ' Ana ' }));
    expect(r.valida && r.valores.nome).toBe('Redes');
    expect(r.valida && r.valores.professor).toBe('Ana');
  });

  it('exige o nome', () => {
    const r = validarDisciplina(entrada({ nome: '   ' }));
    expect(r.valida).toBe(false);
    if (!r.valida) expect(r.erros.nome).toBeDefined();
  });

  it.each(['', '0', '-5', '30,5', 'abc'])('rejeita carga horária "%s"', (carga) => {
    const r = validarDisciplina(entrada({ cargaHoraria: carga }));
    expect(r.valida).toBe(false);
    if (!r.valida) expect(r.erros.cargaHoraria).toBeDefined();
  });

  it.each(['', '0', '7', '2,5'])('rejeita aulas por noite "%s"', (aulas) => {
    const r = validarDisciplina(entrada({ aulasPorNoite: aulas }));
    expect(r.valida).toBe(false);
    if (!r.valida) expect(r.erros.aulasPorNoite).toBeDefined();
  });

  it('aceita de 1 a 6 aulas por noite', () => {
    ['1', '3', '6'].forEach((a) => expect(validarDisciplina(entrada({ aulasPorNoite: a })).valida).toBe(true));
  });

  it('acumula vários erros de uma vez', () => {
    const r = validarDisciplina({ nome: '', professor: '', cargaHoraria: '', aulasPorNoite: '' });
    expect(r.valida).toBe(false);
    if (!r.valida) expect(Object.keys(r.erros).sort()).toEqual(['aulasPorNoite', 'cargaHoraria', 'nome']);
  });
});

describe('limitarQuantidade', () => {
  it('mantém a quantidade entre 1 e o máximo da noite', () => {
    expect(limitarQuantidade(0, 3)).toBe(1);
    expect(limitarQuantidade(2, 3)).toBe(2);
    expect(limitarQuantidade(4, 3)).toBe(3);
  });
});

describe('limitarNivelAlerta', () => {
  it('mantém o nível entre 1 e 30', () => {
    expect(limitarNivelAlerta(0)).toBe(1);
    expect(limitarNivelAlerta(3)).toBe(3);
    expect(limitarNivelAlerta(99)).toBe(30);
    expect(limitarNivelAlerta(2.6)).toBe(3);
  });
});

describe('limites do lembrete', () => {
  it('dias antes ficam entre 0 e 14', () => {
    expect(limitarDiasAntes(-2)).toBe(0);
    expect(limitarDiasAntes(3)).toBe(3);
    expect(limitarDiasAntes(40)).toBe(14);
  });
  it('a hora fica entre 0 e 23', () => {
    expect(limitarHora(-1)).toBe(0);
    expect(limitarHora(8)).toBe(8);
    expect(limitarHora(24)).toBe(23);
  });
});
