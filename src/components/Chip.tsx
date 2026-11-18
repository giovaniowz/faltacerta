import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme/cores';
import { raio } from '../theme/tema';
import type { IconeNome } from './icones';

type Props = { texto: string; icone?: IconeNome; fundo?: string; cor?: string };

// Etiqueta pequena (informação resumida): ícone opcional e texto de 14 ou mais.
export default function Chip({ texto, icone, fundo = cores.fundo, cor = cores.textoSuave }: Props) {
  return (
    <View style={[estilos.chip, { backgroundColor: fundo }]}>
      {icone ? <Ionicons name={icone} size={16} color={cor} /> : null}
      <Text style={[estilos.texto, { color: cor }]}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: raio.pilula, paddingHorizontal: 12, paddingVertical: 6 },
  texto: { fontSize: 14, fontWeight: '600' },
});
