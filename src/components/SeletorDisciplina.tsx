import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Disciplina } from '../domain/tipos';
import { cores } from '../theme/cores';
import { raio } from '../theme/tema';

type Props = { disciplinas: Disciplina[]; valor: string | null; onChange: (id: string) => void };

// Escolha da disciplina em etiquetas (poucas opções, sempre visíveis).
export default function SeletorDisciplina({ disciplinas, valor, onChange }: Props) {
  return (
    <View style={estilos.opcoes}>
      {disciplinas.map((d) => {
        const ativa = d.id === valor;
        return (
          <Pressable
            key={d.id}
            onPress={() => onChange(d.id)}
            accessibilityRole="button"
            accessibilityLabel={`Disciplina ${d.nome}`}
            accessibilityState={{ selected: ativa }}
            style={[estilos.opcao, ativa && estilos.opcaoAtiva]}
          >
            <Text style={[estilos.texto, ativa && estilos.textoAtivo]}>{d.nome}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: raio.pilula,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.cartao,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcaoAtiva: { backgroundColor: cores.primariaSuave, borderColor: cores.primaria, borderWidth: 2 },
  texto: { fontSize: 16, color: cores.texto },
  textoAtivo: { color: cores.primaria, fontWeight: '700' },
});
