import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme/cores';
import { raio } from '../theme/tema';

type Props = {
  valor: number;
  min: number;
  max: number;
  onChange: (novo: number) => void;
  formatar: (valor: number) => string;
  rotuloMenos: string;
  rotuloMais: string;
};

// Contador com botões − e + (alvos de 48), usado em "aulas perdidas" e no nível de alerta.
export default function Contador({ valor, min, max, onChange, formatar, rotuloMenos, rotuloMais }: Props) {
  return (
    <View style={estilos.linha}>
      <Pressable
        onPress={() => onChange(Math.max(min, valor - 1))}
        disabled={valor <= min}
        accessibilityRole="button"
        accessibilityLabel={rotuloMenos}
        accessibilityState={{ disabled: valor <= min }}
        style={[estilos.botao, valor <= min && estilos.desabilitado]}
      >
        <Ionicons name="remove" size={26} color={cores.primaria} />
      </Pressable>
      <Text style={estilos.valor} accessibilityLiveRegion="polite">
        {formatar(valor)}
      </Text>
      <Pressable
        onPress={() => onChange(Math.min(max, valor + 1))}
        disabled={valor >= max}
        accessibilityRole="button"
        accessibilityLabel={rotuloMais}
        accessibilityState={{ disabled: valor >= max }}
        style={[estilos.botao, valor >= max && estilos.desabilitado]}
      >
        <Ionicons name="add" size={26} color={cores.primaria} />
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  botao: {
    width: 48,
    height: 48,
    borderRadius: raio.md,
    borderWidth: 1.5,
    borderColor: cores.primaria,
    backgroundColor: cores.cartao,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desabilitado: { opacity: 0.4 },
  valor: { fontSize: 18, fontWeight: '600', color: cores.texto, minWidth: 100, textAlign: 'center' },
});
