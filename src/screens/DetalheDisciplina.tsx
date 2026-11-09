import { Ionicons } from '@expo/vector-icons';
import React, { useLayoutEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { faltasDaDisciplina, resumoDaDisciplina } from '../domain/calculo';
import { formatarDataBR } from '../domain/datas';
import { plural } from '../domain/textos';
import type { PilhaProps } from '../navegacao/tipos';
import { useDados } from '../state/DadosContext';
import { cores } from '../theme/cores';
import { raio, sombra } from '../theme/tema';
import BannerStatus from '../components/BannerStatus';
import Botao from '../components/Botao';
import BotaoIcone from '../components/BotaoIcone';

// US03, US04 e US08: faltas e noites restantes, alerta e histórico (que pode ser editado).
export default function DetalheDisciplina({ navigation, route }: PilhaProps<'DetalheDisciplina'>) {
  const { disciplinas, faltas, config } = useDados();
  const disciplina = disciplinas.find((d) => d.id === route.params.disciplinaId);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: disciplina?.nome ?? 'Disciplina',
      headerRight: disciplina
        ? () => (
            <BotaoIcone
              nome="create-outline"
              rotulo="Editar disciplina"
              onPress={() => navigation.navigate('CadastroDisciplina', { disciplinaId: disciplina.id })}
            />
          )
        : undefined,
    });
  }, [navigation, disciplina]);

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
        icone="add"
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
        <Pressable
          onPress={() => navigation.navigate('RegistrarFalta', { disciplinaId: disciplina.id, faltaId: item.id })}
          accessibilityRole="button"
          accessibilityLabel={`Editar falta de ${formatarDataBR(item.data)}`}
          style={({ pressed }) => [estilos.linha, pressed && estilos.pressionada]}
        >
          <Text style={estilos.textoLinha}>{formatarDataBR(item.data)}</Text>
          <View style={estilos.direita}>
            <Text style={estilos.textoLinha}>{plural(item.quantidade, 'falta', 'faltas')}</Text>
            <Ionicons name="create-outline" size={20} color={cores.textoSuave} />
          </View>
        </Pressable>
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
    borderRadius: raio.lg,
    padding: 14,
    alignItems: 'center',
    ...sombra,
  },
  numero: { fontSize: 40, fontWeight: '700', color: cores.texto },
  legenda: { fontSize: 16, color: cores.textoSuave },
  dados: { fontSize: 16, lineHeight: 22, color: cores.texto },
  titulo: { fontSize: 18, fontWeight: '700', color: cores.texto, marginTop: 8 },
  linha: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: cores.cartao,
    borderRadius: raio.md,
    padding: 14,
    marginBottom: 8,
    ...sombra,
  },
  pressionada: { opacity: 0.7 },
  direita: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  textoLinha: { fontSize: 16, color: cores.texto },
  vazio: { fontSize: 16, color: cores.textoSuave, textAlign: 'center', marginTop: 16 },
});
