import React, { useLayoutEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { faltasDaDisciplina, resumoDaDisciplina } from '../domain/calculo';
import { formatarDataBR } from '../domain/datas';
import { plural } from '../domain/textos';
import { useDados } from '../state/DadosContext';
import { cores } from '../theme/cores';
import BannerStatus from '../components/BannerStatus';
import Botao from '../components/Botao';

type Props = NativeStackScreenProps<RootStackParamList, 'DetalheDisciplina'>;

// US03 e US04: faltas e noites restantes, alerta e histórico de faltas.
export default function DetalheDisciplina({ navigation, route }: Props) {
  const { disciplinas, faltas, config } = useDados();
  const disciplina = disciplinas.find((d) => d.id === route.params.disciplinaId);

  useLayoutEffect(() => {
    navigation.setOptions({ title: disciplina?.nome ?? 'Disciplina' });
  }, [navigation, disciplina?.nome]);

  if (!disciplina) {
    return (
      <View style={estilos.tela}>
        <Text style={estilos.vazio}>Disciplina não encontrada.</Text>
      </View>
    );
  }

  const resumo = resumoDaDisciplina(disciplina, faltas, config.nivelAlerta);
  const historico = faltasDaDisciplina(faltas, disciplina.id);

  const cabecalho = (
    <View style={estilos.cabecalho}>
      <View style={estilos.destaques}>
        <View style={estilos.destaque}>
          <Text style={estilos.numero}>{Math.max(0, resumo.faltasRestantes)}</Text>
          <Text style={estilos.legenda}>{resumo.faltasRestantes === 1 ? 'falta restante' : 'faltas restantes'}</Text>
        </View>
        <View style={estilos.destaque}>
          <Text style={estilos.numero}>{resumo.noitesRestantes}</Text>
          <Text style={estilos.legenda}>{resumo.noitesRestantes === 1 ? 'noite restante' : 'noites restantes'}</Text>
        </View>
      </View>

      <Text style={estilos.dados}>
        Carga horária: {disciplina.cargaHoraria}h · Limite: {plural(resumo.limite, 'falta', 'faltas')} · Registradas:{' '}
        {resumo.faltasRegistradas}
      </Text>

      <BannerStatus resumo={resumo} />

      <Botao
        titulo="Registrar falta"
        onPress={() => navigation.navigate('RegistrarFalta', { disciplinaId: disciplina.id })}
      />

      <Text style={estilos.titulo}>Histórico de faltas</Text>
    </View>
  );

  return (
    <FlatList
      style={estilos.tela}
      contentContainerStyle={estilos.conteudo}
      data={historico}
      keyExtractor={(f) => f.id}
      ListHeaderComponent={cabecalho}
      ListEmptyComponent={<Text style={estilos.vazio}>Nenhuma falta registrada.</Text>}
      renderItem={({ item }) => (
        <View style={estilos.linha}>
          <Text style={estilos.textoLinha}>{formatarDataBR(item.data)}</Text>
          <Text style={estilos.textoLinha}>{plural(item.quantidade, 'falta', 'faltas')}</Text>
        </View>
      )}
    />
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16 },
  cabecalho: { gap: 16, marginBottom: 8 },
  destaques: { flexDirection: 'row', gap: 12 },
  destaque: {
    flex: 1,
    backgroundColor: cores.cartao,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 14,
    alignItems: 'center',
  },
  numero: { fontSize: 40, fontWeight: '700', color: cores.texto },
  legenda: { fontSize: 16, color: cores.textoSuave },
  dados: { fontSize: 16, lineHeight: 22, color: cores.texto },
  titulo: { fontSize: 18, fontWeight: '700', color: cores.texto, marginTop: 8 },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: cores.cartao,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  textoLinha: { fontSize: 16, color: cores.texto },
  vazio: { fontSize: 16, color: cores.textoSuave, textAlign: 'center', marginTop: 16 },
});
