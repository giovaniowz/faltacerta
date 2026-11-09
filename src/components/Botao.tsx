import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { cores } from '../theme/cores';
import { raio } from '../theme/tema';
import type { IconeNome } from './icones';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: 'primaria' | 'secundaria' | 'perigo';
  desabilitado?: boolean;
  textoAcessivel?: string;
  icone?: IconeNome;
};

// Botão com altura mínima de 48 (alvo de toque confortável) e texto de 16 ou mais.
export default function Botao({
  titulo,
  onPress,
  variante = 'primaria',
  desabilitado = false,
  textoAcessivel,
  icone,
}: Props) {
  const corTexto = variante === 'primaria' ? '#FFFFFF' : variante === 'perigo' ? cores.perigo : cores.primaria;
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityLabel={textoAcessivel ?? titulo}
      accessibilityState={{ disabled: desabilitado }}
      style={({ pressed }) => [
        estilos.base,
        variante === 'primaria' && estilos.primaria,
        variante === 'secundaria' && estilos.secundaria,
        variante === 'perigo' && estilos.perigo,
        desabilitado && estilos.desabilitado,
        pressed && estilos.pressionado,
      ]}
    >
      {icone ? <Ionicons name={icone} size={20} color={corTexto} /> : null}
      <Text style={[estilos.texto, { color: corTexto }]}>{titulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: raio.md,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaria: { backgroundColor: cores.primaria },
  secundaria: { backgroundColor: cores.cartao, borderWidth: 1.5, borderColor: cores.primaria },
  perigo: { backgroundColor: cores.cartao, borderWidth: 1.5, borderColor: cores.perigo },
  desabilitado: { opacity: 0.5 },
  pressionado: { opacity: 0.8 },
  texto: { fontSize: 16, fontWeight: '600' },
});
