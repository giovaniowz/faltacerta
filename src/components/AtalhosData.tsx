import { Pressable, StyleSheet, Text, View } from 'react-native';
import { paraDataISO } from '../domain/datas';
import { cores } from '../theme/cores';
import { raio } from '../theme/tema';

type Atalho = { rotulo: string; data: Date };
type Props = { atalhos: Atalho[]; valor: Date; onChange: (data: Date) => void };

// Atalhos para as datas mais comuns (Hoje, Ontem, Amanhã...). O atalho escolhido fica marcado.
export default function AtalhosData({ atalhos, valor, onChange }: Props) {
  const atual = paraDataISO(valor);
  return (
    <View style={estilos.linha}>
      {atalhos.map((a) => {
        const ativo = paraDataISO(a.data) === atual;
        return (
          <Pressable
            key={a.rotulo}
            onPress={() => onChange(a.data)}
            accessibilityRole="button"
            accessibilityLabel={a.rotulo}
            accessibilityState={{ selected: ativo }}
            style={[estilos.chip, ativo && estilos.ativo]}
          >
            <Text style={[estilos.texto, ativo && estilos.textoAtivo]}>{a.rotulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: raio.pilula,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.cartao,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ativo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  texto: { fontSize: 16, fontWeight: '600', color: cores.texto },
  textoAtivo: { color: '#FFFFFF' },
});
