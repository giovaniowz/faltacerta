import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Resumo } from '../domain/tipos';
import { rotuloStatus, textoStatus } from '../domain/textos';
import { cores } from '../theme/cores';

type Props = { resumo: Resumo };

// US04: mostra o estado da disciplina com cor, rótulo e mensagem (nunca só cor).
export default function BannerStatus({ resumo }: Props) {
  const paleta = cores.status[resumo.status];
  return (
    <View
      style={[estilos.banner, { backgroundColor: paleta.fundo }]}
      accessibilityRole="alert"
      accessible
    >
      <Text style={[estilos.rotulo, { color: paleta.texto }]}>{rotuloStatus(resumo.status)}</Text>
      <Text style={[estilos.mensagem, { color: paleta.texto }]}>{textoStatus(resumo)}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  banner: { borderRadius: 10, padding: 14 },
  rotulo: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  mensagem: { fontSize: 16, lineHeight: 22 },
});
