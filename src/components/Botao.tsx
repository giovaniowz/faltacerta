import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { cores } from '../theme/cores';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: 'primaria' | 'secundaria';
  desabilitado?: boolean;
  textoAcessivel?: string;
};

// Botão com altura mínima de 48 (alvo de toque confortável) e texto de 16 ou mais.
export default function Botao({
  titulo,
  onPress,
  variante = 'primaria',
  desabilitado = false,
  textoAcessivel,
}: Props) {
  const primaria = variante === 'primaria';
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityLabel={textoAcessivel ?? titulo}
      accessibilityState={{ disabled: desabilitado }}
      style={({ pressed }) => [
        estilos.base,
        primaria ? estilos.primaria : estilos.secundaria,
        desabilitado && estilos.desabilitado,
        pressed && estilos.pressionado,
      ]}
    >
      <Text style={[estilos.texto, { color: primaria ? '#FFFFFF' : cores.primaria }]}>{titulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaria: { backgroundColor: cores.primaria },
  secundaria: { backgroundColor: cores.cartao, borderWidth: 1.5, borderColor: cores.primaria },
  desabilitado: { opacity: 0.5 },
  pressionado: { opacity: 0.8 },
  texto: { fontSize: 16, fontWeight: '600' },
});
