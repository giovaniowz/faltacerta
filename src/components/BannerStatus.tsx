import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Resumo } from '../domain/tipos';
import { rotuloStatus, textoStatus } from '../domain/textos';
import { cores } from '../theme/cores';
import { raio } from '../theme/tema';
import { iconeStatus } from './icones';

type Props = { resumo: Resumo };

// US04: mostra o estado da disciplina com ícone, cor, rótulo e mensagem (nunca só cor).
export default function BannerStatus({ resumo }: Props) {
  const paleta = cores.status[resumo.status];
  return (
    <View style={[estilos.banner, { backgroundColor: paleta.fundo }]} accessibilityRole="alert" accessible>
      <Ionicons name={iconeStatus(resumo.status)} size={28} color={paleta.texto} />
      <View style={estilos.textos}>
        <Text style={[estilos.rotulo, { color: paleta.texto }]}>{rotuloStatus(resumo.status)}</Text>
        <Text style={[estilos.mensagem, { color: paleta.texto }]}>{textoStatus(resumo)}</Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  banner: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', borderRadius: raio.lg, padding: 14 },
  textos: { flex: 1 },
  rotulo: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  mensagem: { fontSize: 16, lineHeight: 22 },
});
