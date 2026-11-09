import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme/cores';
import { raio } from '../theme/tema';

type Opcao<T extends string> = { valor: T; rotulo: string };
type Props<T extends string> = { opcoes: Opcao<T>[]; valor: T; onChange: (valor: T) => void };

// Seletor de uma opção entre poucas (ex.: Prova | Trabalho, filtros da lista de prazos).
export default function Segmentado<T extends string>({ opcoes, valor, onChange }: Props<T>) {
  return (
    <View style={estilos.linha}>
      {opcoes.map((o) => {
        const ativo = o.valor === valor;
        return (
          <Pressable
            key={o.valor}
            onPress={() => onChange(o.valor)}
            accessibilityRole="button"
            accessibilityLabel={o.rotulo}
            accessibilityState={{ selected: ativo }}
            style={[estilos.opcao, ativo && estilos.ativa]}
          >
            <Text style={[estilos.texto, ativo && estilos.textoAtivo]}>{o.rotulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  opcao: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: raio.pilula,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.cartao,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ativa: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  texto: { fontSize: 16, fontWeight: '600', color: cores.texto },
  textoAtivo: { color: '#FFFFFF' },
});
