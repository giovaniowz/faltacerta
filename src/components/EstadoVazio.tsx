import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme/cores';
import Botao from './Botao';
import type { IconeNome } from './icones';

type Props = {
  icone: IconeNome;
  titulo: string;
  texto: string;
  acao?: { titulo: string; onPress: () => void };
};

export default function EstadoVazio({ icone, titulo, texto, acao }: Props) {
  return (
    <View style={estilos.caixa}>
      <View style={estilos.circulo}>
        <Ionicons name={icone} size={36} color={cores.primaria} />
      </View>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.texto}>{texto}</Text>
      {acao ? <Botao titulo={acao.titulo} onPress={acao.onPress} /> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { alignItems: 'center', gap: 10, paddingVertical: 32, paddingHorizontal: 16 },
  circulo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: cores.primariaSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontSize: 18, fontWeight: '700', color: cores.texto, textAlign: 'center' },
  texto: { fontSize: 16, lineHeight: 24, color: cores.textoSuave, textAlign: 'center', marginBottom: 6 },
});
