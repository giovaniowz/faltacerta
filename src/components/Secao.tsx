import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme/cores';

type Props = { titulo: string; acao?: { titulo: string; onPress: () => void } };

// Título de seção, com um atalho opcional à direita (ex.: "Ver todos").
export default function Secao({ titulo, acao }: Props) {
  return (
    <View style={estilos.linha}>
      <Text style={estilos.titulo} accessibilityRole="header">
        {titulo}
      </Text>
      {acao ? (
        <Pressable onPress={acao.onPress} accessibilityRole="button" accessibilityLabel={acao.titulo} hitSlop={8}>
          <Text style={estilos.acao}>{acao.titulo}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 10 },
  titulo: { fontSize: 18, fontWeight: '700', color: cores.texto },
  acao: { fontSize: 16, fontWeight: '600', color: cores.primaria },
});
