import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatarDataCurta } from '../domain/datas';
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

// Uma prova ou trabalho: marcador de concluído, título, disciplina e, à direita, a data e o quanto falta.
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
        accessibilityLabel={c.concluido ? `Marcar ${c.descricao} como pendente` : `Marcar ${c.descricao} como concluído`}
        style={estilos.marcador}
      >
        <Ionicons
          name={c.concluido ? 'checkmark-circle' : 'ellipse-outline'}
          size={30}
          color={c.concluido ? cores.status.ok.forte : cores.textoSuave}
        />
      </Pressable>

      <Pressable
        onPress={onAbrir}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${c.descricao}`}
        style={({ pressed }) => [estilos.conteudo, pressed && estilos.pressionado]}
      >
        <View style={estilos.titulo}>
          <Text style={[estilos.descricao, c.concluido && estilos.riscado]} numberOfLines={2}>
            {c.descricao}
          </Text>
          <Text style={estilos.data}>{formatarDataCurta(c.prazo)}</Text>
        </View>
        <Text style={estilos.detalhe} numberOfLines={2}>
          {nomeDisciplina} · {rotuloTipo(c.tipo)}
        </Text>
        <View style={estilos.linhaEtiqueta}>
          <View style={[estilos.etiqueta, { backgroundColor: paleta.fundo }]}>
            <Text style={[estilos.textoEtiqueta, { color: paleta.texto }]}>{rotulo}</Text>
          </View>
          {c.notificacaoId && !c.concluido ? (
            <View accessible accessibilityLabel="Lembrete agendado" style={estilos.sino}>
              <Ionicons name="notifications-outline" size={18} color={cores.primaria} />
              <Text style={estilos.textoSino}>Lembrete</Text>
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
    gap: 4,
    backgroundColor: cores.cartao,
    borderRadius: raio.lg,
    paddingVertical: 12,
    paddingLeft: 6,
    paddingRight: 14,
    marginBottom: 10,
    ...sombra,
  },
  marcador: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  conteudo: { flex: 1, gap: 4, minHeight: 48, justifyContent: 'center' },
  pressionado: { opacity: 0.7 },
  titulo: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  descricao: { flex: 1, fontSize: 17, fontWeight: '700', color: cores.texto },
  riscado: { textDecorationLine: 'line-through', color: cores.textoSuave },
  data: { fontSize: 14, fontWeight: '600', color: cores.textoSuave, marginTop: 2 },
  detalhe: { fontSize: 14, color: cores.textoSuave },
  linhaEtiqueta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  etiqueta: { borderRadius: raio.pilula, paddingHorizontal: 10, paddingVertical: 4 },
  textoEtiqueta: { fontSize: 13, fontWeight: '700' },
  sino: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  textoSino: { fontSize: 13, color: cores.primaria, fontWeight: '600' },
});
