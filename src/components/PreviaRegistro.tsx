import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PreviaDoRegistro, textoPrevia } from '../domain/simulacao';
import { cores } from '../theme/cores';
import { raio } from '../theme/tema';
import { iconeStatus } from './icones';

// "Como vai ficar": mostra o efeito do registro antes de confirmar.
export default function PreviaRegistro({ previa }: { previa: PreviaDoRegistro }) {
  const paleta = cores.status[previa.depois.status];
  return (
    <View style={[estilos.caixa, { backgroundColor: paleta.fundo }]} accessibilityLiveRegion="polite">
      <Ionicons name={iconeStatus(previa.depois.status)} size={24} color={paleta.texto} />
      <Text style={[estilos.texto, { color: paleta.texto }]}>{textoPrevia(previa)}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderRadius: raio.md, padding: 14 },
  texto: { flex: 1, fontSize: 16, lineHeight: 22 },
});
