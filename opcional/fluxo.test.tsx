(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../../App';
import { formatarDataBR, hojeISO } from '../domain/datas';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('../notificacoes/servico', () => {
  const { criarServicoFalso } = require('../testes/servicoFalso');
  const falso = criarServicoFalso('indefinida', 'concedida');
  (globalThis as any).__falso = falso;
  return { servicoExpo: falso.servico };
});
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return { Ionicons: (p: any) => React.createElement(Text, null, p.name) };
});
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => React.createElement(View, { testID: 'seletor-data', ...props }),
    DateTimePickerAndroid: { open: jest.fn() },
  };
});

const falso = () => (globalThis as any).__falso as ReturnType<typeof import('../testes/servicoFalso').criarServicoFalso>;

beforeEach(async () => {
  await AsyncStorage.clear();
  falso().agendadas.clear();
  Object.assign(falso().estado, { permissao: 'indefinida', respostaAoPedir: 'concedida', pedidos: 0 });
  // Confirma automaticamente os alertas de exclusão (botão "Excluir").
  jest.spyOn(Alert, 'alert').mockImplementation((_titulo, _msg, botoes) => {
    botoes?.find((b) => b.style !== 'cancel')?.onPress?.();
  });
});
afterEach(() => jest.restoreAllMocks());

const press = async (el: any) => fireEvent.press(await el);
const aba = (nome: string) => press(screen.findByLabelText(new RegExp(`^${nome}, tab`)));

async function cadastrarDisciplina(nome: string, carga = '60', aulas = '3') {
  await aba('Disciplinas');
  await press(screen.findByLabelText('Nova disciplina'));
  await fireEvent.changeText(await screen.findByLabelText('Nome da disciplina'), nome);
  await fireEvent.changeText(screen.getByLabelText('Carga horária em horas'), carga);
  if (aulas !== '3') await press(screen.findByLabelText(`${aulas} ${aulas === '1' ? 'aula' : 'aulas'} por noite`));
  await press(screen.findByText('Salvar disciplina'));
  await screen.findByText(nome);
}

async function registrarNoite(nome: string) {
  await press(screen.findByLabelText(`Registrar falta em ${nome}`));
  await press(screen.findByText('Confirmar'));
  await waitFor(() => expect(screen.queryByText('Confirmar')).toBeNull());
}

async function definirData(data: Date) {
  await act(async () => {
    screen.getByTestId('seletor-data').props.onValueChange({}, data);
  });
}
const diasDepois = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

async function cadastrarPrazo(descricao: string, data?: Date) {
  await aba('Prazos');
  await press(screen.findByLabelText('Novo prazo'));
  await fireEvent.changeText(await screen.findByLabelText('Descrição'), descricao);
  if (data) await definirData(data);
  await press(screen.findByText('Salvar prazo'));
}

describe('painel e navegação', () => {
  it('Início vazio convida a cadastrar a primeira disciplina', async () => {
    await render(<App />);
    expect(await screen.findByText('Bem-vindo ao FaltaCerta')).toBeTruthy();
    expect(screen.getByText('Cadastrar disciplina')).toBeTruthy();
  });

  it('US10: o painel resume disciplinas, atenção e prazos', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await aba('Início');
    expect(await screen.findByLabelText('1 disciplina')).toBeTruthy();
    expect(screen.getByText('Tudo certo: nenhuma disciplina perto do limite de faltas.')).toBeTruthy();
    expect(screen.getByText('Nenhum prazo pendente')).toBeTruthy();

    for (let i = 0; i < 4; i++) {
      await aba('Disciplinas');
      await registrarNoite('Redes'); // 12 faltas: restam 3
    }
    await aba('Início');
    expect(await screen.findByLabelText('1 em atenção')).toBeTruthy();
    expect(screen.getByText('Perto do limite')).toBeTruthy();
    expect(screen.getAllByText('Redes').length).toBeGreaterThan(0);
  });
});

describe('US01 a US04 (Sprint 1) continuam funcionando', () => {
  it('cadastra, valida, registra e alerta', async () => {
    await render(<App />);
    await aba('Disciplinas');
    await press(screen.findByLabelText('Nova disciplina'));
    await fireEvent.changeText(await screen.findByLabelText('Nome da disciplina'), '');
    await fireEvent.changeText(screen.getByLabelText('Carga horária em horas'), '0');
    await press(screen.findByText('Salvar disciplina'));
    expect(await screen.findByText('Informe o nome da disciplina.')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Nome da disciplina'), 'BD');
    await fireEvent.changeText(screen.getByLabelText('Carga horária em horas'), '60');
    expect(await screen.findByText('Limite: 15 faltas (5 noites)')).toBeTruthy();
    await press(screen.findByText('Salvar disciplina'));
    expect(await screen.findByText('0 / 15 faltas')).toBeTruthy();

    await registrarNoite('BD');
    expect(await screen.findByText('3 / 15 faltas')).toBeTruthy();
    await press(screen.findByLabelText('Abrir BD'));
    expect(await screen.findByText('Você ainda pode faltar 12 aulas (4 noites).')).toBeTruthy();
  });

  it('chega ao limite e excede sem mostrar saldo negativo', async () => {
    await render(<App />);
    await cadastrarDisciplina('SO');
    for (let i = 0; i < 5; i++) await registrarNoite('SO');
    expect(await screen.findByText('Limite atingido')).toBeTruthy();
    await registrarNoite('SO');
    expect(await screen.findByText('Limite excedido')).toBeTruthy();
    await press(screen.findByLabelText('Abrir SO'));
    expect(await screen.findByText('Limite excedido em 3 faltas.')).toBeTruthy();
    expect(screen.queryByText('-3')).toBeNull();
  });
});

describe('US04: nível de alerta configurável', () => {
  it('mudar o nível muda o status e fica salvo', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    for (let i = 0; i < 4; i++) await registrarNoite('Redes'); // restam 3
    expect(await screen.findByText('Perto do limite')).toBeTruthy();

    await aba('Início');
    await press(screen.findByLabelText('Configurações'));
    expect(await screen.findByText('3 faltas')).toBeTruthy();
    await press(screen.findByLabelText('Diminuir o nível de alerta'));
    expect(await screen.findByText('2 faltas')).toBeTruthy();
    expect(JSON.parse((await AsyncStorage.getItem('faltacerta:config')) ?? '{}').nivelAlerta).toBe(2);

    await press(screen.findByText('Restaurar padrão'));
    expect(await screen.findByText('3 faltas')).toBeTruthy();
  });

  it('com nível menor, a disciplina deixa de estar em alerta (após reabrir o app)', async () => {
    await AsyncStorage.setItem('faltacerta:config', JSON.stringify({ nivelAlerta: 2 }));
    await AsyncStorage.setItem(
      'faltacerta:disciplinas',
      JSON.stringify([{ id: 'd1', nome: 'Redes', cargaHoraria: 60, aulasPorNoite: 3, criadaEm: '2026-10-01T00:00:00.000Z' }])
    );
    await AsyncStorage.setItem(
      'faltacerta:faltas',
      JSON.stringify([1, 2, 3, 4].map((i) => ({ id: `f${i}`, disciplinaId: 'd1', data: '2026-10-01', quantidade: 3 })))
    );
    await render(<App />);
    await aba('Disciplinas');
    expect(await screen.findByText('Dentro do limite')).toBeTruthy(); // restam 3, nível 2
  });
});

describe('US05, US06 e US09: provas e trabalhos', () => {
  it('lista em ordem de data, separa atrasados e conclui', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');

    await aba('Prazos');
    expect(await screen.findByText('Nenhum prazo cadastrado')).toBeTruthy();

    await cadastrarPrazo('Trabalho final', diasDepois(10));
    await screen.findByText('Trabalho final');
    await cadastrarPrazo('Prova 1'); // hoje

    const itens = await screen.findAllByLabelText(/^Abrir (Prova 1|Trabalho final)$/);
    expect(itens.map((i: any) => i.props.accessibilityLabel)).toEqual(['Abrir Prova 1', 'Abrir Trabalho final']);
    expect(screen.getByText('Hoje')).toBeTruthy();
    expect(screen.getByText('Em 10 dias')).toBeTruthy();
    expect(screen.getByText('Próximos (2)')).toBeTruthy();

    await press(screen.findByLabelText('Marcar Prova 1 como concluído'));
    expect(await screen.findByText('Concluídos (1)')).toBeTruthy();
    expect(screen.getByText('Próximos (1)')).toBeTruthy();

    await aba('Início');
    expect(await screen.findByText('Trabalho final')).toBeTruthy();
    expect(screen.queryByText('Prova 1')).toBeNull();
  });

  it('não aceita prazo no passado no cadastro', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await cadastrarPrazo('Prova velha', diasDepois(-3));
    expect(await screen.findByText('O prazo não pode estar no passado.')).toBeTruthy();
  });

  it('exige descrição', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await cadastrarPrazo('   ');
    expect(await screen.findByText('Informe a descrição (ex.: Prova 1 ou Trabalho final).')).toBeTruthy();
  });

  it('filtra por tipo', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await cadastrarPrazo('Prova 1');
    await screen.findByText('Prova 1');
    await aba('Prazos');
    await press(screen.findByLabelText('Novo prazo'));
    await press(screen.findByLabelText('Trabalho'));
    await fireEvent.changeText(await screen.findByLabelText('Descrição'), 'Relatório');
    await press(screen.findByText('Salvar prazo'));
    await screen.findByText('Relatório');

    await press(screen.findByLabelText('Trabalhos'));
    expect(screen.queryByText('Prova 1')).toBeNull();
    expect(screen.getByText('Relatório')).toBeTruthy();
    await press(screen.findByLabelText('Todos'));
    expect(await screen.findByText('Prova 1')).toBeTruthy();
  });

  it('edita e exclui um prazo', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await cadastrarPrazo('Prova 1');
    await press(screen.findByLabelText('Abrir Prova 1'));
    await fireEvent.changeText(await screen.findByLabelText('Descrição'), 'Prova 1 (remarcada)');
    await press(screen.findByText('Salvar alterações'));
    expect(await screen.findByText('Prova 1 (remarcada)')).toBeTruthy();

    await press(screen.findByLabelText('Abrir Prova 1 (remarcada)'));
    await press(screen.findByText('Excluir prazo'));
    expect(await screen.findByText('Nenhum prazo cadastrado')).toBeTruthy();
  });
});

describe('US08: editar e excluir', () => {
  it('edita e exclui uma falta, atualizando o contador', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await registrarNoite('Redes'); // 3 faltas
    await press(screen.findByLabelText('Abrir Redes'));
    await press(screen.findByLabelText(`Editar falta de ${formatarDataBR(hojeISO())}`));
    await press(screen.findByLabelText('Diminuir aulas perdidas'));
    await press(screen.findByText('Salvar alterações'));
    expect(await screen.findByText('2 faltas')).toBeTruthy();
    expect(screen.getByText('13')).toBeTruthy(); // faltas restantes: 15 - 2

    await press(screen.findByLabelText(`Editar falta de ${formatarDataBR(hojeISO())}`));
    await press(screen.findByText('Excluir falta'));
    expect(await screen.findByText('Nenhuma falta registrada.')).toBeTruthy();
    expect(screen.getByText('15')).toBeTruthy();
  });

  it('edita a disciplina e recalcula o limite', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await press(screen.findByLabelText('Abrir Redes'));
    await press(screen.findByLabelText('Editar disciplina'));
    await fireEvent.changeText(await screen.findByLabelText('Carga horária em horas'), '45');
    await press(screen.findByText('Salvar alterações'));
    expect(await screen.findByText('Carga 45h')).toBeTruthy();
    expect(screen.getByText(/0 de 11 faltas do limite usadas/)).toBeTruthy();
  });

  it('excluir a disciplina apaga também as faltas e os prazos dela', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await registrarNoite('Redes');
    await cadastrarPrazo('Prova 1');
    await screen.findByText('Prova 1');

    await aba('Disciplinas');
    await press(screen.findByLabelText('Abrir Redes'));
    await press(screen.findByLabelText('Editar disciplina'));
    await press(screen.findByText('Excluir disciplina'));
    expect(await screen.findByText('Nenhuma disciplina ainda')).toBeTruthy();

    expect(JSON.parse((await AsyncStorage.getItem('faltacerta:faltas')) ?? '[]')).toEqual([]);
    expect(JSON.parse((await AsyncStorage.getItem('faltacerta:compromissos')) ?? '[]')).toEqual([]);
    await aba('Prazos');
    expect(await screen.findByText('Cadastre uma disciplina primeiro')).toBeTruthy();
  });
});

describe('persistência', () => {
  it('disciplinas, faltas e prazos continuam ao reabrir o app', async () => {
    const primeiro = await render(<App />);
    await cadastrarDisciplina('Segurança', '45');
    await registrarNoite('Segurança');
    await cadastrarPrazo('Prova 1');
    await screen.findByText('Prova 1');
    await primeiro.unmount();

    await render(<App />);
    await aba('Disciplinas');
    expect(await screen.findByText('3 / 11 faltas')).toBeTruthy();
    await aba('Prazos');
    expect(await screen.findByText('Prova 1')).toBeTruthy();
  });

  it('abre normalmente com os dados salvos pela versão anterior (sem prazos)', async () => {
    await AsyncStorage.setItem(
      'faltacerta:disciplinas',
      JSON.stringify([{ id: 'v1', nome: 'Antiga', cargaHoraria: 60, aulasPorNoite: 3, criadaEm: '2026-11-03T00:00:00.000Z' }])
    );
    await AsyncStorage.setItem(
      'faltacerta:faltas',
      JSON.stringify([{ id: 'f1', disciplinaId: 'v1', data: '2026-11-03', quantidade: 3 }])
    );
    await render(<App />);
    await aba('Disciplinas');
    expect(await screen.findByText('3 / 15 faltas')).toBeTruthy();
  });
});


const abrirConfiguracoes = async () => {
  await aba('Início');
  await press(screen.findByLabelText('Configurações'));
};

describe('US07: lembretes antes do prazo', () => {
  it('agenda o aviso ao cadastrar o prazo, pedindo a permissão uma vez', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await cadastrarPrazo('Prova 1', diasDepois(10));
    expect(await screen.findByText('Prova 1')).toBeTruthy();

    expect(falso().estado.pedidos).toBe(1);
    expect(falso().agendadas.size).toBe(1);
    const aviso = [...falso().agendadas.values()][0];
    expect(aviso.titulo).toBe('Prova: Prova 1');
    expect(aviso.corpo).toMatch(/^Redes · prazo amanhã \(/);
    const esperado = diasDepois(9);
    expect(aviso.quando.getDate()).toBe(esperado.getDate());
    expect(aviso.quando.getHours()).toBe(8);
    expect(screen.getByLabelText('Lembrete agendado')).toBeTruthy();
  });

  it('mostra no formulário quando o aviso chega (e quando já passou)', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await aba('Prazos');
    await press(screen.findByLabelText('Novo prazo'));
    expect(await screen.findByText(/O horário do lembrete já passou/)).toBeTruthy(); // prazo hoje, aviso 1 dia antes
    await definirData(diasDepois(10));
    expect(await screen.findByText(/^Lembrete: \d{2}\/\d{2}\/\d{4} às 08:00\.$/)).toBeTruthy();
  });

  it('cancela o aviso ao concluir e ao excluir o prazo', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await cadastrarPrazo('Prova 1', diasDepois(10));
    await screen.findByText('Prova 1');
    expect(falso().agendadas.size).toBe(1);

    await press(screen.findByLabelText('Marcar Prova 1 como concluído'));
    await screen.findByText('Concluídos (1)');
    expect(falso().agendadas.size).toBe(0);

    await press(screen.findByLabelText('Marcar Prova 1 como pendente'));
    await waitFor(() => expect(falso().agendadas.size).toBe(1));

    await press(screen.findByLabelText('Abrir Prova 1'));
    await press(screen.findByText('Excluir prazo'));
    await screen.findByText('Nenhum prazo cadastrado');
    expect(falso().agendadas.size).toBe(0);
  });

  it('reagenda ao editar a data do prazo', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await cadastrarPrazo('Prova 1', diasDepois(10));
    await press(screen.findByLabelText('Abrir Prova 1'));
    await definirData(diasDepois(20));
    await press(screen.findByText('Salvar alterações'));
    await screen.findByText('Em 20 dias');
    expect(falso().agendadas.size).toBe(1);
    expect([...falso().agendadas.values()][0].quando.getDate()).toBe(diasDepois(19).getDate());
  });

  it('as Configurações mudam quando e se o aviso acontece', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await cadastrarPrazo('Prova 1', diasDepois(10));
    await screen.findByText('Prova 1');

    await abrirConfiguracoes();
    expect(await screen.findByText('Você será avisado: 1 dia antes, às 08:00.')).toBeTruthy();
    expect(screen.getByText('Notificações permitidas neste aparelho.')).toBeTruthy();

    await press(screen.findByLabelText('Aumentar os dias de antecedência'));
    expect(await screen.findByText('Você será avisado: 2 dias antes, às 08:00.')).toBeTruthy();
    await waitFor(() => expect([...falso().agendadas.values()][0].quando.getDate()).toBe(diasDepois(8).getDate()));

    await press(screen.findByLabelText('Aumentar a hora do aviso'));
    expect(await screen.findByText('Você será avisado: 2 dias antes, às 09:00.')).toBeTruthy();
    await waitFor(() => expect([...falso().agendadas.values()][0].quando.getHours()).toBe(9));
    expect(falso().agendadas.size).toBe(1);

    await fireEvent(await screen.findByLabelText('Avisar antes de provas e trabalhos'), 'valueChange', false);
    await waitFor(() => expect(falso().agendadas.size).toBe(0));
    expect(screen.queryByText(/Você será avisado/)).toBeNull();
  });

  it('com a permissão ainda não decidida, o botão pede ao sistema', async () => {
    await AsyncStorage.setItem(
      'faltacerta:disciplinas',
      JSON.stringify([{ id: 'd1', nome: 'Redes', cargaHoraria: 60, aulasPorNoite: 3, criadaEm: '2026-10-01T00:00:00.000Z' }])
    );
    const prazo = diasDepois(10);
    await AsyncStorage.setItem(
      'faltacerta:compromissos',
      JSON.stringify([
        { id: 'c1', disciplinaId: 'd1', tipo: 'prova', descricao: 'Prova 1', prazo: `${prazo.getFullYear()}-${String(prazo.getMonth() + 1).padStart(2, '0')}-${String(prazo.getDate()).padStart(2, '0')}`, concluido: false, criadoEm: '2026-10-01T00:00:00.000Z' },
      ])
    );
    await render(<App />);
    await abrirConfiguracoes();
    await press(screen.findByText('Permitir notificações'));
    expect(await screen.findByText('Notificações permitidas neste aparelho.')).toBeTruthy();
    await waitFor(() => expect(falso().agendadas.size).toBe(1));
    expect(falso().estado.pedidos).toBe(1);
  });

  it('com a permissão negada, avisa e oferece abrir as configurações do aparelho', async () => {
    Object.assign(falso().estado, { permissao: 'negada' });
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await cadastrarPrazo('Prova 1', diasDepois(10));
    await screen.findByText('Prova 1'); // o prazo é salvo normalmente
    expect(falso().agendadas.size).toBe(0);

    await abrirConfiguracoes();
    expect(await screen.findByText(/As notificações estão bloqueadas/)).toBeTruthy();
    expect(screen.getByText('Abrir configurações do aparelho')).toBeTruthy();
  });

  it('um erro nas notificações não impede de salvar o prazo', async () => {
    Object.assign(falso().estado, { permissao: 'concedida', falharAoAgendarComTitulo: 'Prova' });
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await cadastrarPrazo('Prova 1', diasDepois(10));
    expect(await screen.findByText('Prova 1')).toBeTruthy();
    expect(falso().agendadas.size).toBe(0);
    Object.assign(falso().estado, { falharAoAgendarComTitulo: '' });
  });

  it('dois prazos salvos em seguida ficam ambos salvos e agendados', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await cadastrarPrazo('Prova A', diasDepois(10));
    await cadastrarPrazo('Prova B', diasDepois(12));
    await screen.findByText('Prova B');
    expect(JSON.parse((await AsyncStorage.getItem('faltacerta:compromissos')) ?? '[]').length).toBe(2);
    expect(falso().agendadas.size).toBe(2);
  });
});

describe('"Posso faltar?" e frequência', () => {
  it('mostra a frequência no cartão e na disciplina', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    expect(await screen.findByText('Frequência 100%')).toBeTruthy();
    await registrarNoite('Redes');
    expect(await screen.findByText('Frequência 95%')).toBeTruthy();
    await press(screen.findByLabelText('Abrir Redes'));
    expect(await screen.findByText('Frequência 95% (mín. 75%)')).toBeTruthy();
  });

  it('simula faltar mais noites e avisa quando reprovaria', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await press(screen.findByLabelText('Abrir Redes'));
    expect(await screen.findByText('Você pode faltar até 5 noites sem reprovar.')).toBeTruthy();
    expect(screen.getByText('Faltando 1 noite (3 faltas), restariam 12 faltas (4 noites).')).toBeTruthy();

    for (let i = 0; i < 4; i++) await press(screen.findByLabelText('Aumentar noites simuladas')); // 5 noites
    expect(await screen.findByText('Faltando 5 noites (15 faltas), você chega exatamente ao limite. Uma nova falta reprova.')).toBeTruthy();
    await press(screen.findByLabelText('Aumentar noites simuladas')); // 6 noites
    expect(await screen.findByText('Faltando 6 noites (18 faltas), você ultrapassa o limite em 3 faltas e reprova.')).toBeTruthy();
  });

  it('a simulação não altera as faltas registradas', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await press(screen.findByLabelText('Abrir Redes'));
    await press(screen.findByLabelText('Aumentar noites simuladas'));
    expect(JSON.parse((await AsyncStorage.getItem('faltacerta:faltas')) ?? '[]')).toEqual([]);
  });
});

describe('modo demonstração e ajuda', () => {
  it('carrega dados de exemplo com todas as situações e apaga tudo', async () => {
    const primeiro = await render(<App />);
    await abrirConfiguracoes();
    await press(screen.findByLabelText('Modo demonstração'));
    await press(screen.findByText('Carregar dados de exemplo'));
    await waitFor(async () => expect(JSON.parse((await AsyncStorage.getItem('faltacerta:disciplinas')) ?? '[]').length).toBe(5));
    await primeiro.unmount();

    await render(<App />);
    await aba('Disciplinas');
    expect(await screen.findByText('Auditoria de Sistemas')).toBeTruthy();
    expect(screen.getByText('Perto do limite')).toBeTruthy();
    expect(screen.getByText('Limite atingido')).toBeTruthy();
    expect(screen.getByText('Limite excedido')).toBeTruthy();
    expect(screen.getAllByText('Dentro do limite').length).toBe(2);
    await aba('Prazos');
    expect(await screen.findByText('Atrasados (1)')).toBeTruthy();
    expect(screen.getByText('Concluídos (1)')).toBeTruthy();

    await aba('Início');
    await press(screen.findByLabelText('Configurações'));
    await press(screen.findByLabelText('Modo demonstração'));
    await press(screen.findByText('Apagar todos os dados'));
    await waitFor(async () => expect(JSON.parse((await AsyncStorage.getItem('faltacerta:disciplinas')) ?? '[]')).toEqual([]));
    expect(JSON.parse((await AsyncStorage.getItem('faltacerta:compromissos')) ?? '[]')).toEqual([]);
  });

  it('os dados de exemplo agendam lembretes quando a permissão já foi dada', async () => {
    Object.assign(falso().estado, { permissao: 'concedida' });
    await render(<App />);
    await abrirConfiguracoes();
    await press(screen.findByLabelText('Modo demonstração'));
    await press(screen.findByText('Carregar dados de exemplo'));
    await waitFor(() => expect(falso().agendadas.size).toBeGreaterThan(0));
  });

  it('a tela "Como calculamos" explica a regra com números reais', async () => {
    await render(<App />);
    await abrirConfiguracoes();
    await press(screen.findByLabelText('Como calculamos o limite de faltas'));
    expect(await screen.findByText('A regra')).toBeTruthy();
    expect(screen.getByText(/60h com 3 aulas por noite: limite de 15 faltas \(5 noites\)\./)).toBeTruthy();
    expect(screen.getByText(/45h com 3 aulas por noite: limite de 11 faltas \(3 noites\)\./)).toBeTruthy();
    expect(screen.getByText(/não substituem o\s+sistema oficial/)).toBeTruthy();
  });
});


describe('interface revista', () => {
  const ontemISO = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  it('o Início resume a situação e oferece ações rápidas', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await aba('Início');
    expect(await screen.findByText('Tudo certo por aqui')).toBeTruthy();
    expect(screen.getByText('Nenhum prazo pendente')).toBeTruthy();
    expect(screen.getByLabelText('Registrar falta')).toBeTruthy();
    expect(screen.getByLabelText('Novo prazo')).toBeTruthy();
  });

  it('registra uma falta pelo atalho do Início, escolhendo a disciplina (3 toques)', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await cadastrarDisciplina('Banco de Dados');
    await aba('Início');
    await press(screen.findByLabelText('Registrar falta')); // toque 1
    expect(screen.getByText('Escolha a disciplina para ver quantas aulas tem a noite.')).toBeTruthy();
    await press(screen.findByLabelText('Disciplina Banco de Dados')); // toque 2
    expect(await screen.findByText('Depois deste registro, restarão 12 faltas (4 noites).')).toBeTruthy();
    await press(screen.findByText('Confirmar')); // toque 3
    await waitFor(async () => expect(JSON.parse((await AsyncStorage.getItem('faltacerta:faltas')) ?? '[]').length).toBe(1));
    const salva = JSON.parse((await AsyncStorage.getItem('faltacerta:faltas')) ?? '[]')[0];
    const banco = JSON.parse((await AsyncStorage.getItem('faltacerta:disciplinas')) ?? '[]').find((d: any) => d.nome === 'Banco de Dados');
    expect(salva.disciplinaId).toBe(banco.id);
    expect(salva.quantidade).toBe(3);
  });

  it('com uma só disciplina, o atalho já vem com ela escolhida', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await aba('Início');
    await press(screen.findByLabelText('Registrar falta'));
    expect(await screen.findByText('Depois deste registro, restarão 12 faltas (4 noites).')).toBeTruthy();
  });

  it('os atalhos de data gravam o dia certo (Ontem)', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await press(screen.findByLabelText('Registrar falta em Redes'));
    await press(screen.findByLabelText('Ontem'));
    await press(screen.findByText('Confirmar'));
    await waitFor(async () => expect(JSON.parse((await AsyncStorage.getItem('faltacerta:faltas')) ?? '[]').length).toBe(1));
    expect(JSON.parse((await AsyncStorage.getItem('faltacerta:faltas')) ?? '[]')[0].data).toBe(ontemISO());
  });

  it('a prévia muda ao ajustar as aulas perdidas', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await press(screen.findByLabelText('Registrar falta em Redes'));
    expect(await screen.findByText('Depois deste registro, restarão 12 faltas (4 noites).')).toBeTruthy();
    await press(screen.findByLabelText('Diminuir aulas perdidas'));
    expect(await screen.findByText('Depois deste registro, restarão 13 faltas (4 noites).')).toBeTruthy();
  });

  it('avisa antes de registrar uma segunda falta no mesmo dia', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await registrarNoite('Redes');
    (Alert.alert as jest.Mock).mockClear();
    await press(screen.findByLabelText('Registrar falta em Redes'));
    await press(screen.findByText('Confirmar'));
    expect(Alert.alert).toHaveBeenCalledWith('Já existe uma falta neste dia', expect.stringContaining('Redes'), expect.any(Array));
  });

  it('não deixa cadastrar duas disciplinas com o mesmo nome', async () => {
    await render(<App />);
    await cadastrarDisciplina('Gestão de Projetos');
    await press(screen.findByLabelText('Nova disciplina'));
    await fireEvent.changeText(await screen.findByLabelText('Nome da disciplina'), '  gestao de projetos ');
    await fireEvent.changeText(screen.getByLabelText('Carga horária em horas'), '60');
    await press(screen.findByText('Salvar disciplina'));
    expect(await screen.findByText('Já existe uma disciplina com esse nome.')).toBeTruthy();
  });

  it('as cargas horárias comuns preenchem o campo e a prévia', async () => {
    await render(<App />);
    await aba('Disciplinas');
    await press(screen.findByLabelText('Nova disciplina'));
    await press(screen.findByLabelText('45 horas'));
    expect(await screen.findByText('Limite: 11 faltas (3 noites)')).toBeTruthy();
    await press(screen.findByLabelText('4 aulas por noite'));
    expect(await screen.findByText('Limite: 11 faltas (2 noites)')).toBeTruthy();
  });

  it('o prazo tem atalhos de data e mostra a data curta com o dia da semana', async () => {
    await render(<App />);
    await cadastrarDisciplina('Redes');
    await cadastrarPrazo('Prova 1', diasDepois(10));
    expect(await screen.findByText('Prova 1')).toBeTruthy();
    expect(screen.getByText(/^(dom|seg|ter|qua|qui|sex|sáb), \d{2}\/\d{2}$/)).toBeTruthy();
    await aba('Prazos');
    await press(screen.findByLabelText('Novo prazo'));
    await press(screen.findByLabelText('Em 1 semana'));
    await fireEvent.changeText(await screen.findByLabelText('Descrição'), 'Trabalho');
    await press(screen.findByText('Salvar prazo'));
    await waitFor(async () => expect(JSON.parse((await AsyncStorage.getItem('faltacerta:compromissos')) ?? '[]').length).toBe(2));
  });
});
