import React, { useLayoutEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { ehFutura, isoParaData, paraDataISO } from '../domain/datas';
import { gerarId } from '../domain/ids';
import { plural } from '../domain/textos';
import { limitarQuantidade } from '../domain/validacao';
import type { PilhaProps } from '../navegacao/tipos';
import { useDados } from '../state/DadosContext';
import { cores } from '../theme/cores';
import Botao from '../components/Botao';
import CampoData from '../components/CampoData';
import { confirmarExclusao } from '../components/confirmar';
import Contador from '../components/Contador';

// US02 e US08: registrar (ou editar) as faltas de uma noite.
export default function RegistrarFalta({ navigation, route }: PilhaProps<'RegistrarFalta'>) {
  const { disciplinas, faltas, adicionarFalta, atualizarFalta, removerFalta } = useDados();
  const disciplina = disciplinas.find((d) => d.id === route.params.disciplinaId);
  const faltaId = route.params.faltaId;
  const existente = faltaId ? faltas.find((f) => f.id === faltaId) : undefined;

  const [data, setData] = useState(() => (existente ? isoParaData(existente.data) : new Date()));
  const [quantidade, setQuantidade] = useState(existente?.quantidade ?? disciplina?.aulasPorNoite ?? 3);
  const [salvando, setSalvando] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: existente ? 'Editar falta' : 'Registrar falta' });
  }, [navigation, existente]);

  if (!disciplina || (faltaId && !existente)) {
    return (
      <View style={estilos.tela}>
        <Text style={estilos.aviso}>{disciplina ? 'Falta não encontrada.' : 'Disciplina não encontrada.'}</Text>
      </View>
    );
  }

  const dataISO = paraDataISO(data);

  async function confirmar() {
    if (!disciplina) return;
    if (ehFutura(dataISO)) {
      Alert.alert('Data inválida', 'A data da falta não pode ser futura.');
      return;
    }
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
    <View style={estilos.tela}>
      <Text style={estilos.nome}>{disciplina.nome}</Text>

      <CampoData rotulo="Data da falta" valor={data} onChange={setData} maximo={new Date()} />

      <View style={estilos.bloco}>
        <Text style={estilos.rotulo}>Aulas perdidas</Text>
        <Contador
          valor={quantidade}
          min={1}
          max={disciplina.aulasPorNoite}
          onChange={setQuantidade}
          formatar={(n) => plural(n, 'aula', 'aulas')}
          rotuloMenos="Diminuir aulas perdidas"
          rotuloMais="Aumentar aulas perdidas"
        />
        <Text style={estilos.dica}>
          Cada aula perdida vale 1 falta. Uma noite completa tem {disciplina.aulasPorNoite} aulas.
        </Text>
      </View>

      <Botao
        titulo={salvando ? 'Salvando...' : existente ? 'Salvar alterações' : 'Confirmar'}
        onPress={confirmar}
        desabilitado={salvando}
      />

      {existente ? <Botao titulo="Excluir falta" variante="perigo" icone="trash-outline" onPress={excluir} /> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, padding: 16, gap: 20 },
  nome: { fontSize: 20, fontWeight: '700', color: cores.texto },
  bloco: { gap: 8 },
  rotulo: { fontSize: 16, fontWeight: '600', color: cores.texto },
  dica: { fontSize: 16, color: cores.textoSuave },
  aviso: { fontSize: 16, color: cores.textoSuave, textAlign: 'center', marginTop: 16 },
});
