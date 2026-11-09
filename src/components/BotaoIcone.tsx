import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { cores } from '../theme/cores';
import type { IconeNome } from './icones';

type Props = { nome: IconeNome; rotulo: string; onPress: () => void; cor?: string };

// Botão só com ícone (ex.: engrenagem e lápis no cabeçalho). Alvo de toque de 44.
export default function BotaoIcone({ nome, rotulo, onPress, cor = cores.primaria }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      hitSlop={8}
      style={({ pressed }) => [estilos.botao, pressed && estilos.pressionado]}
    >
      <Ionicons name={nome} size={24} color={cor} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  pressionado: { opacity: 0.6 },
});
