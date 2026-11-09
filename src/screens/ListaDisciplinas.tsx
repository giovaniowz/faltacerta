import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { resumoDaDisciplina } from '../domain/calculo';
import type { AbaProps } from '../navegacao/tipos';
import { useDados } from '../state/DadosContext';
import { cores } from '../theme/cores';
import Botao from '../components/Botao';
import CartaoDisciplina from '../components/CartaoDisciplina';
import EstadoVazio from '../components/EstadoVazio';

// Aba "Disciplinas" (US01): todas as disciplinas, com limite e status.
export default function ListaDisciplinas({ navigation }: AbaProps<'Disciplinas'>) {
  const { disciplinas, faltas, config } = useDados();

  return (
    <View style={estilos.tela}>
      <FlatList
        data={disciplinas}
        keyExtractor={(d) => d.id}
        contentContainerStyle={estilos.lista}
        ListEmptyComponent={
          <EstadoVazio
            icone="school-outline"
            titulo="Nenhuma disciplina ainda"
            texto="Cadastre a primeira para calcular seu limite de faltas."
          />
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
  rodape: { padding: 16, borderTopWidth: 1, borderTopColor: cores.borda, backgroundColor: cores.cartao },
});
