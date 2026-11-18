import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { cores } from '../theme/cores';
import { raio } from '../theme/tema';
import type { IconeNome } from './icones';

type Props = { titulo: string; icone?: IconeNome; onPress: () => void };

// Ação principal da tela, flutuando no canto inferior direito (estilo "FAB estendido").
export default function BotaoFlutuante({ titulo, icone = 'add', onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      style={({ pressed }) => [estilos.botao, pressed && estilos.pressionado]}
    >
      <Ionicons name={icone} size={24} color="#FFFFFF" />
      <Text style={estilos.texto}>{titulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    borderRadius: raio.pilula,
    backgroundColor: cores.primaria,
    shadowColor: '#0B1F66',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  pressionado: { opacity: 0.85 },
  texto: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
