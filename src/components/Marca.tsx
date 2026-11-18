import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme/cores';

// Marca do app para o cabeçalho: quadrado azul com um "ok" e o nome.
export default function Marca() {
  return (
    <View style={estilos.linha} accessible accessibilityRole="header" accessibilityLabel="FaltaCerta">
      <View style={estilos.icone}>
        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
      </View>
      <Text style={estilos.nome}>FaltaCerta</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icone: { width: 32, height: 32, borderRadius: 10, backgroundColor: cores.primaria, alignItems: 'center', justifyContent: 'center' },
  nome: { fontSize: 20, fontWeight: '800', color: cores.texto, letterSpacing: -0.3 },
});
