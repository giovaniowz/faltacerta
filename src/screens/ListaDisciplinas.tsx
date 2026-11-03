import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { resumoDaDisciplina } from '../domain/calculo';
import { useDados } from '../state/DadosContext';
import { cores } from '../theme/cores';
import Botao from '../components/Botao';
import CartaoDisciplina from '../components/CartaoDisciplina';

type Props = NativeStackScreenProps<RootStackParamList, 'ListaDisciplinas'>;

// Tela inicial (US01 e US04): lista de disciplinas com limite e status.
export default function ListaDisciplinas({ navigation }: Props) {
  const { disciplinas, faltas, config } = useDados();

  return (
    <View style={estilos.tela}>
      <FlatList
        data={disciplinas}
        keyExtractor={(d) => d.id}
        contentContainerStyle={estilos.lista}
        ListEmptyComponent={
          <Text style={estilos.vazio}>
            Nenhuma disciplina ainda. Cadastre a primeira para calcular seu limite de faltas.
          </Text>
        }
        renderItem={({ item }) => (
          <CartaoDisciplina
            disciplina={item}
            resumo={resumoDaDisciplina(item, faltas, config.nivelAlerta)}
            onAbrir={() => navigation.navigate('DetalheDisciplina', { disciplinaId: item.id })}
            onRegistrarFalta={() => navigation.navigate('RegistrarFalta', { disciplinaId: item.id })}
          />
        )}
      />
      <View style={estilos.rodape}>
        <Botao titulo="+ Nova disciplina" onPress={() => navigation.navigate('CadastroDisciplina')} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  lista: { padding: 16, flexGrow: 1 },
  vazio: { fontSize: 16, lineHeight: 24, color: cores.textoSuave, textAlign: 'center', marginTop: 48 },
  rodape: { padding: 16, borderTopWidth: 1, borderTopColor: cores.borda, backgroundColor: cores.cartao },
});
