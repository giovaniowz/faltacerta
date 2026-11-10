import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatarPercentual, frequenciaDe } from '../domain/frequencia';
import { Disciplina, Resumo } from '../domain/tipos';
import { rotuloStatus } from '../domain/textos';
import { cores } from '../theme/cores';
import { raio, sombra } from '../theme/tema';
import Botao from './Botao';
import { iconeStatus } from './icones';

type Props = {
  disciplina: Disciplina;
  resumo: Resumo;
  onAbrir: () => void;
  onRegistrarFalta: () => void;
};

export default function CartaoDisciplina({ disciplina, resumo, onAbrir, onRegistrarFalta }: Props) {
  const paleta = cores.status[resumo.status];
  // Com limite 0 a barra já aparece cheia.
  const proporcao = resumo.limite > 0 ? Math.min(1, resumo.faltasRegistradas / resumo.limite) : 1;
  const porcentagem = Math.round(proporcao * 100);

  return (
    <View style={estilos.cartao}>
      <Pressable
        onPress={onAbrir}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${disciplina.nome}`}
        style={estilos.area}
      >
        <View style={estilos.topo}>
          <View style={[estilos.icone, { backgroundColor: paleta.fundo }]}>
            <Ionicons name={iconeStatus(resumo.status)} size={24} color={paleta.texto} />
          </View>
          <View style={estilos.titulos}>
            <Text style={estilos.nome} numberOfLines={2}>
              {disciplina.nome}
            </Text>
            {disciplina.professor ? <Text style={estilos.professor}>{disciplina.professor}</Text> : null}
          </View>
          <Ionicons name="chevron-forward" size={20} color={cores.textoSuave} />
        </View>

        <View style={estilos.linhaContagem}>
          <Text style={estilos.contagem}>
            {resumo.faltasRegistradas} / {resumo.limite} faltas
          </Text>
          <Text style={estilos.frequencia}>
            Frequência {formatarPercentual(frequenciaDe(disciplina.cargaHoraria, resumo.faltasRegistradas))}
          </Text>
        </View>

        <View style={estilos.trilho}>
          <View style={[estilos.preenchimento, { width: `${porcentagem}%`, backgroundColor: paleta.forte }]} />
        </View>

        <View style={[estilos.etiqueta, { backgroundColor: paleta.fundo }]}>
          <Text style={[estilos.textoEtiqueta, { color: paleta.texto }]}>{rotuloStatus(resumo.status)}</Text>
        </View>
      </Pressable>

      <Botao
        titulo="Registrar falta"
        variante="secundaria"
        icone="add"
        onPress={onRegistrarFalta}
        textoAcessivel={`Registrar falta em ${disciplina.nome}`}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: { backgroundColor: cores.cartao, borderRadius: raio.lg, padding: 16, marginBottom: 12, gap: 12, ...sombra },
  area: { gap: 10 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icone: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  titulos: { flex: 1 },
  nome: { fontSize: 18, fontWeight: '700', color: cores.texto },
  professor: { fontSize: 16, color: cores.textoSuave },
  linhaContagem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  contagem: { fontSize: 16, color: cores.texto },
  frequencia: { fontSize: 16, color: cores.textoSuave },
  trilho: { height: 10, borderRadius: 5, backgroundColor: cores.borda, overflow: 'hidden' },
  preenchimento: { height: 10, borderRadius: 5 },
  etiqueta: { alignSelf: 'flex-start', borderRadius: raio.pilula, paddingHorizontal: 12, paddingVertical: 4 },
  textoEtiqueta: { fontSize: 16, fontWeight: '600' },
});
