import { useLayoutEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ehFutura, formatarDataBR, isoParaData, paraDataISO, somarDias } from '../domain/datas';
import { gerarId } from '../domain/ids';
import { faltaNaMesmaData, previaDoRegistro } from '../domain/simulacao';
import { plural } from '../domain/textos';
import { limitarQuantidade } from '../domain/validacao';
import type { PilhaProps } from '../navegacao/tipos';
import { useDados } from '../state/DadosContext';
import { useHoje } from '../state/useHoje';
import { cores } from '../theme/cores';
import AtalhosData from '../components/AtalhosData';
import Botao from '../components/Botao';
import CampoData from '../components/CampoData';
import { confirmarAcao, confirmarExclusao } from '../components/confirmar';
import Contador from '../components/Contador';
import EstadoVazio from '../components/EstadoVazio';
import PreviaRegistro from '../components/PreviaRegistro';
import SeletorDisciplina from '../components/SeletorDisciplina';

// US02 e US08: registrar (ou editar) as faltas de uma noite.
// Pode abrir já com a disciplina escolhida (pelo cartão) ou sem ela (pelo atalho do início).
export default function RegistrarFalta({ navigation, route }: PilhaProps<'RegistrarFalta'>) {
  const { disciplinas, faltas, config, adicionarFalta, atualizarFalta, removerFalta } = useDados();
  const hoje = useHoje();
  const faltaId = route.params?.faltaId;
  const existente = faltaId ? faltas.find((f) => f.id === faltaId) : undefined;
  const disciplinaFixa = route.params?.disciplinaId ?? existente?.disciplinaId;

  const [disciplinaId, setDisciplinaId] = useState<string | null>(
    disciplinaFixa ?? (disciplinas.length === 1 ? disciplinas[0].id : null)
  );
  const disciplina = disciplinas.find((d) => d.id === disciplinaId);
  const [data, setData] = useState(() => (existente ? isoParaData(existente.data) : new Date()));
  const [quantidade, setQuantidade] = useState(existente?.quantidade ?? disciplina?.aulasPorNoite ?? 3);
  const [salvando, setSalvando] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: existente ? 'Editar falta' : 'Registrar falta' });
  }, [navigation, existente]);

  if (faltaId && !existente) {
    return (
      <View style={estilos.tela}>
        <Text style={estilos.aviso}>Falta não encontrada.</Text>
      </View>
    );
  }
  if (disciplinas.length === 0) {
    return (
      <View style={estilos.tela}>
        <EstadoVazio
          icone="school-outline"
          titulo="Cadastre uma disciplina primeiro"
          texto="As faltas ficam ligadas a uma disciplina."
          acao={{ titulo: 'Cadastrar disciplina', onPress: () => navigation.replace('CadastroDisciplina') }}
        />
      </View>
    );
  }
  if (disciplinaFixa && !disciplina) {
    return (
      <View style={estilos.tela}>
        <Text style={estilos.aviso}>Disciplina não encontrada.</Text>
      </View>
    );
  }

  const dataISO = paraDataISO(data);
  const atalhos = [
    { rotulo: 'Hoje', data: isoParaData(hoje) },
    { rotulo: 'Ontem', data: isoParaData(somarDias(hoje, -1)) },
  ];

  function escolherDisciplina(id: string) {
    setDisciplinaId(id);
    const escolhida = disciplinas.find((d) => d.id === id);
    if (escolhida) setQuantidade(escolhida.aulasPorNoite);
  }

  async function gravar() {
    if (!disciplina) return;
    const qtd = limitarQuantidade(quantidade, disciplina.aulasPorNoite);
    setSalvando(true);
    try {
      if (existente) {
        await atualizarFalta({ ...existente, data: dataISO, quantidade: qtd });
      } else {
        await adicionarFalta({ id: gerarId(), disciplinaId: disciplina.id, data: dataISO, quantidade: qtd });
      }
      navigation.goBack();
    } catch {
      Alert.alert('Não foi possível salvar', 'Tente novamente.');
      setSalvando(false);
    }
  }

  function confirmar() {
    if (!disciplina) return;
    if (ehFutura(dataISO)) {
      Alert.alert('Data inválida', 'A data da falta não pode ser futura.');
      return;
    }
    // Evita contar a mesma noite duas vezes por engano (ex.: dois toques em dias seguidos).
    if (faltaNaMesmaData(faltas, disciplina.id, dataISO, existente?.id)) {
      confirmarAcao(
        'Já existe uma falta neste dia',
        `${disciplina.nome} já tem falta registrada em ${formatarDataBR(dataISO)}. Registrar outra mesmo assim?`,
        'Registrar mesmo assim',
        gravar
      );
      return;
    }
    gravar();
  }

  function excluir() {
    if (!existente) return;
    confirmarExclusao('Excluir falta?', 'O registro desta falta será apagado e o contador será atualizado.', async () => {
      try {
        await removerFalta(existente.id);
        navigation.goBack();
      } catch {
        Alert.alert('Não foi possível excluir', 'Tente novamente.');
      }
    });
  }

  return (
    <ScrollView
      style={estilos.tela}
      contentContainerStyle={estilos.conteudo}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      {disciplinaFixa && disciplina ? (
        <Text style={estilos.nome}>{disciplina.nome}</Text>
      ) : (
        <View style={estilos.bloco}>
          <Text style={estilos.rotulo}>Disciplina</Text>
          <SeletorDisciplina disciplinas={disciplinas} valor={disciplinaId} onChange={escolherDisciplina} />
        </View>
      )}

      <View style={estilos.bloco}>
        <Text style={estilos.rotulo}>Quando foi?</Text>
        <AtalhosData atalhos={atalhos} valor={data} onChange={setData} />
        <CampoData rotulo="Data da falta" valor={data} onChange={setData} maximo={new Date()} rotuloVisivel={false} />
      </View>

      <View style={estilos.bloco}>
        <Text style={estilos.rotulo}>Aulas perdidas</Text>
        <Contador
          valor={quantidade}
          min={1}
          max={disciplina?.aulasPorNoite ?? 6}
          onChange={setQuantidade}
          formatar={(n) => plural(n, 'aula', 'aulas')}
          rotuloMenos="Diminuir aulas perdidas"
          rotuloMais="Aumentar aulas perdidas"
        />
        <Text style={estilos.dica}>
          {disciplina
            ? `Cada aula perdida vale 1 falta. Uma noite completa tem ${disciplina.aulasPorNoite} aulas.`
            : 'Escolha a disciplina para ver quantas aulas tem a noite.'}
        </Text>
      </View>

      {disciplina ? (
        <PreviaRegistro previa={previaDoRegistro(disciplina, faltas, quantidade, config.nivelAlerta, existente?.id)} />
      ) : null}

      <Botao
        titulo={salvando ? 'Salvando...' : existente ? 'Salvar alterações' : 'Confirmar'}
        onPress={confirmar}
        desabilitado={salvando || !disciplina}
      />

      {existente ? <Botao titulo="Excluir falta" variante="perigo" icone="trash-outline" onPress={excluir} /> : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, gap: 20, paddingBottom: 32 },
  nome: { fontSize: 22, fontWeight: '800', color: cores.texto },
  bloco: { gap: 10 },
  rotulo: { fontSize: 16, fontWeight: '700', color: cores.texto },
  dica: { fontSize: 15, color: cores.textoSuave },
  aviso: { fontSize: 16, color: cores.textoSuave, textAlign: 'center', marginTop: 16 },
});
