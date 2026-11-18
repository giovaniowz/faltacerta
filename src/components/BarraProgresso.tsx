import { StyleSheet, View } from 'react-native';
import { cores } from '../theme/cores';

type Props = { proporcao: number; cor: string; altura?: number };

// Barra de progresso. `proporcao` vai de 0 a 1 (valores fora disso são limitados).
export default function BarraProgresso({ proporcao, cor, altura = 8 }: Props) {
  const porcento = Math.round(Math.min(1, Math.max(0, proporcao)) * 100);
  return (
    <View style={[estilos.trilho, { height: altura, borderRadius: altura / 2 }]}>
      <View style={{ width: `${porcento}%`, height: altura, borderRadius: altura / 2, backgroundColor: cor }} />
    </View>
  );
}

const estilos = StyleSheet.create({
  trilho: { backgroundColor: cores.borda, overflow: 'hidden' },
});
