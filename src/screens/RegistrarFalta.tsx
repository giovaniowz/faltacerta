import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { ehFutura, formatarDataBR, hojeISO, paraDataISO } from '../domain/datas';
import { gerarId } from '../domain/ids';
import { plural } from '../domain/textos';
import { limitarQuantidade } from '../domain/validacao';
import { useDados } from '../state/DadosContext';
import { cores } from '../theme/cores';
import Botao from '../components/Botao';

type Props = NativeStackScreenProps<RootStackParamList, 'RegistrarFalta'>;

// US02: registrar as faltas de uma noite (padrão: todas as aulas da noite).
export default function RegistrarFalta({ navigation, route }: Props) {
  const { disciplinas, adicionarFalta } = useDados();
  const disciplina = disciplinas.find((d) => d.id === route.params.disciplinaId);

  const [data, setData] = useState(() => new Date());
  const [quantidade, setQuantidade] = useState(disciplina?.aulasPorNoite ?? 3);
  const [salvando, setSalvando] = useState(false);

  if (!disciplina) {
    return (
      <View style={estilos.tela}>
        <Text style={estilos.aviso}>Disciplina não encontrada.</Text>
      </View>
    );
  }

  const dataISO = paraDataISO(data);
  const ehHoje = dataISO === hojeISO();

  function abrirSeletorAndroid() {
    DateTimePickerAndroid.open({
      value: data,
      mode: 'date',
      maximumDate: new Date(),
      onValueChange: (_evento, selecionada) => setData(selecionada),
    });
  }

  async function confirmar() {
    if (!disciplina) return;
    if (ehFutura(dataISO)) {
      Alert.alert('Data inválida', 'A data da falta não pode ser futura.');
      return;
    }
    setSalvando(true);
    try {
      await adicionarFalta({
        id: gerarId(),
        disciplinaId: disciplina.id,
        data: dataISO,
        quantidade: limitarQuantidade(quantidade, disciplina.aulasPorNoite),
      });
      navigation.goBack();
    } catch {
      Alert.alert('Não foi possível salvar', 'Tente novamente.');
      setSalvando(false);
    }
  }

  return (
    <View style={estilos.tela}>
      <Text style={estilos.nome}>{disciplina.nome}</Text>

      <View style={estilos.bloco}>
        <Text style={estilos.rotulo}>Data da falta</Text>
        {Platform.OS === 'android' ? (
          <Pressable
            onPress={abrirSeletorAndroid}
            accessibilityRole="button"
            accessibilityLabel={`Data da falta: ${formatarDataBR(dataISO)}. Toque para alterar`}
            style={estilos.campoData}
          >
            <Text style={estilos.textoData}>
              {formatarDataBR(dataISO)}
              {ehHoje ? ' (hoje)' : ''}
            </Text>
          </Pressable>
        ) : (
          <DateTimePicker
            value={data}
            mode="date"
            display="compact"
            maximumDate={new Date()}
            onValueChange={(_evento, selecionada) => setData(selecionada)}
          />
        )}
      </View>

      <View style={estilos.bloco}>
        <Text style={estilos.rotulo}>Aulas perdidas</Text>
        <View style={estilos.contador}>
          <Pressable
            onPress={() => setQuantidade((q) => limitarQuantidade(q - 1, disciplina.aulasPorNoite))}
            accessibilityRole="button"
            accessibilityLabel="Diminuir aulas perdidas"
            style={estilos.botaoContador}
          >
            <Text style={estilos.simbolo}>−</Text>
          </Pressable>
          <Text style={estilos.valor} accessibilityLiveRegion="polite">
            {plural(quantidade, 'aula', 'aulas')}
          </Text>
          <Pressable
            onPress={() => setQuantidade((q) => limitarQuantidade(q + 1, disciplina.aulasPorNoite))}
            accessibilityRole="button"
            accessibilityLabel="Aumentar aulas perdidas"
            style={estilos.botaoContador}
          >
            <Text style={estilos.simbolo}>+</Text>
          </Pressable>
        </View>
        <Text style={estilos.dica}>
          Cada aula perdida vale 1 falta. Uma noite completa tem {disciplina.aulasPorNoite} aulas.
        </Text>
      </View>

      <Botao titulo={salvando ? 'Salvando...' : 'Confirmar'} onPress={confirmar} desabilitado={salvando} />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, padding: 16, gap: 20 },
  nome: { fontSize: 20, fontWeight: '700', color: cores.texto },
  bloco: { gap: 8 },
  rotulo: { fontSize: 16, fontWeight: '600', color: cores.texto },
  campoData: {
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: cores.cartao,
  },
  textoData: { fontSize: 16, color: cores.texto },
  contador: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  botaoContador: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: cores.primaria,
    backgroundColor: cores.cartao,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simbolo: { fontSize: 24, color: cores.primaria, fontWeight: '700' },
  valor: { fontSize: 18, fontWeight: '600', color: cores.texto, minWidth: 90, textAlign: 'center' },
  dica: { fontSize: 16, color: cores.textoSuave },
  aviso: { fontSize: 16, color: cores.textoSuave, textAlign: 'center', marginTop: 16 },
});
