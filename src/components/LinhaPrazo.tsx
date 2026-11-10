import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatarDataBR } from '../domain/datas';
import { diasAte, rotuloPrazo, rotuloTipo, urgenciaDoPrazo } from '../domain/prazos';
import { Compromisso } from '../domain/tipos';
import { cores } from '../theme/cores';
import { raio, sombra } from '../theme/tema';

type Props = {
  compromisso: Compromisso;
  nomeDisciplina: string;
  hoje: string;
  onAbrir: () => void;
  onAlternarConcluido: () => void;
};

// Uma prova ou trabalho: marcador de concluído, descrição, disciplina e prazo.
export default function LinhaPrazo({ compromisso: c, nomeDisciplina, hoje, onAbrir, onAlternarConcluido }: Props) {
  const urgencia = urgenciaDoPrazo(c, hoje);
  const paleta = cores.urgencia[urgencia];
  const rotulo = c.concluido ? 'Concluído' : rotuloPrazo(diasAte(c.prazo, hoje));

  return (
    <View style={estilos.linha}>
      <Pressable
        onPress={onAlternarConcluido}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: c.concluido }}
        accessibilityLabel={
          c.concluido ? `Marcar ${c.descricao} como pendente` : `Marcar ${c.descricao} como concluído`
        }
        style={estilos.marcador}
      >
        <Ionicons
          name={c.concluido ? 'checkmark-circle' : 'ellipse-outline'}
          size={28}
          color={c.concluido ? cores.status.ok.forte : cores.textoSuave}
        />
      </Pressable>

      <Pressable
        onPress={onAbrir}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${c.descricao}`}
        style={estilos.conteudo}
      >
        <Text style={[estilos.descricao, c.concluido && estilos.riscado]} numberOfLines={2}>
          {c.descricao}
        </Text>
        <Text style={estilos.detalhe} numberOfLines={2}>
          {rotuloTipo(c.tipo)} · {nomeDisciplina} · {formatarDataBR(c.prazo)}
        </Text>
        <View style={estilos.linhaEtiqueta}>
          <View style={[estilos.etiqueta, { backgroundColor: paleta.fundo }]}>
            <Text style={[estilos.textoEtiqueta, { color: paleta.texto }]}>{rotulo}</Text>
          </View>
          {c.notificacaoId && !c.concluido ? (
            <View accessible accessibilityLabel="Lembrete agendado" style={estilos.sino}>
              <Ionicons name="notifications-outline" size={20} color={cores.primaria} />
            </View>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.cartao,
    borderRadius: raio.lg,
    padding: 12,
    marginBottom: 10,
    ...sombra,
  },
  marcador: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  conteudo: { flex: 1, gap: 4 },
  descricao: { fontSize: 17, fontWeight: '700', color: cores.texto },
  riscado: { textDecorationLine: 'line-through', color: cores.textoSuave },
  detalhe: { fontSize: 16, color: cores.textoSuave },
  linhaEtiqueta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  etiqueta: { borderRadius: raio.pilula, paddingHorizontal: 12, paddingVertical: 4 },
  sino: { height: 28, justifyContent: 'center' },
  textoEtiqueta: { fontSize: 16, fontWeight: '600' },
});
