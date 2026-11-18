import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme/cores';

type Props = { rotulo: string; erro?: string; children: ReactNode };

// Rótulo + campo + mensagem de erro, no mesmo padrão em todos os formulários.
export default function Campo({ rotulo, erro, children }: Props) {
  return (
    <View style={estilos.campo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      {children}
      {erro ? <Text style={estilos.erro}>{erro}</Text> : null}
    </View>
  );
}

export const estiloInput = {
  minHeight: 48,
  borderWidth: 1,
  borderColor: cores.borda,
  borderRadius: 12,
  paddingHorizontal: 14,
  fontSize: 16,
  color: cores.texto,
  backgroundColor: cores.cartao,
} as const;

const estilos = StyleSheet.create({
  campo: { gap: 8 },
  rotulo: { fontSize: 16, fontWeight: '700', color: cores.texto },
  erro: { fontSize: 16, color: cores.status.excedido.texto },
});
