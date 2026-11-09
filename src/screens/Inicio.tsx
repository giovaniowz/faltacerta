import { Ionicons } from '@expo/vector-icons';
import React, { useLayoutEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { hojeISO } from '../domain/datas';
import { disciplinasEmAtencao } from '../domain/painel';
import { agruparPrazos } from '../domain/prazos';
import { plural } from '../domain/textos';
import type { AbaProps } from '../navegacao/tipos';
import { useDados } from '../state/DadosContext';
import { cores } from '../theme/cores';
import { raio, sombra } from '../theme/tema';
import BotaoIcone from '../components/BotaoIcone';
import CartaoDisciplina from '../components/CartaoDisciplina';
import EstadoVazio from '../components/EstadoVazio';
import LinhaPrazo from '../components/LinhaPrazo';
import Secao from '../components/Secao';

const MAX_PRAZOS_NO_PAINEL = 3;
const MAX_DISCIPLINAS_NO_PAINEL = 3;

// US10: painel inicial com o resumo das disciplinas e os próximos prazos.
export default function Inicio({ navigation }: AbaProps<'Inicio'>) {
  const { disciplinas, faltas, compromissos, config, atualizarCompromisso } = useDados();
  const hoje = hojeISO();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <BotaoIcone
          nome="settings-outline"
          rotulo="Configurações"
          onPress={() => navigation.navigate('Configuracoes')}
        />
      ),
    });
  }, [navigation]);

  const emAtencao = disciplinasEmAtencao(disciplinas, faltas, config.nivelAlerta);
  const grupos = agruparPrazos(compromissos, hoje);
  const pendentes = [...grupos.atrasados, ...grupos.proximos];
  const nomeDisciplina = (id: string) => disciplinas.find((d) => d.id === id)?.nome ?? 'Disciplina removida';

  async function alternarConcluido(id: string) {
    const c = compromissos.find((x) => x.id === id);
    if (!c) return;
    try {
      await atualizarCompromisso({ ...c, concluido: !c.concluido });
    } catch {
      Alert.alert('Não foi possível salvar', 'Tente novamente.');
    }
  }

  if (disciplinas.length === 0) {
    return (
      <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
        <EstadoVazio
          icone="school-outline"
          titulo="Bem-vindo ao FaltaCerta"
          texto="Cadastre sua primeira disciplina para calcular o limite de faltas e acompanhar quantas você ainda pode ter."
          acao={{ titulo: 'Cadastrar disciplina', onPress: () => navigation.navigate('CadastroDisciplina') }}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <View style={estilos.indicadores}>
        <Indicador valor={disciplinas.length} legenda={disciplinas.length === 1 ? 'disciplina' : 'disciplinas'} />
        <Indicador
          valor={emAtencao.length}
          legenda="em atenção"
          destaque={emAtencao.length > 0 ? 'alerta' : undefined}
        />
        <Indicador
          valor={pendentes.length}
          legenda={pendentes.length === 1 ? 'prazo pendente' : 'prazos pendentes'}
          destaque={grupos.atrasados.length > 0 ? 'atrasado' : undefined}
        />
      </View>

      <Secao titulo="Precisam de atenção" />
      {emAtencao.length === 0 ? (
        <View style={estilos.tudoCerto}>
          <Ionicons name="checkmark-circle" size={28} color={cores.status.ok.texto} />
          <Text style={estilos.textoTudoCerto}>Tudo certo: nenhuma disciplina perto do limite de faltas.</Text>
        </View>
      ) : (
        emAtencao.slice(0, MAX_DISCIPLINAS_NO_PAINEL).map(({ disciplina, resumo }) => (
          <CartaoDisciplina
            key={disciplina.id}
            disciplina={disciplina}
            resumo={resumo}
            onAbrir={() => navigation.navigate('DetalheDisciplina', { disciplinaId: disciplina.id })}
            onRegistrarFalta={() => navigation.navigate('RegistrarFalta', { disciplinaId: disciplina.id })}
          />
        ))
      )}
      {emAtencao.length > MAX_DISCIPLINAS_NO_PAINEL ? (
        <Text style={estilos.mais}>
          e mais {plural(emAtencao.length - MAX_DISCIPLINAS_NO_PAINEL, 'disciplina', 'disciplinas')} na aba Disciplinas
        </Text>
      ) : null}

      <Secao
        titulo="Próximos prazos"
        acao={pendentes.length > 0 ? { titulo: 'Ver todos', onPress: () => navigation.navigate('Prazos') } : undefined}
      />
      {pendentes.length === 0 ? (
        <EstadoVazio
          icone="calendar-outline"
          titulo="Nenhum prazo pendente"
          texto="Cadastre provas e trabalhos para receber a lista dos próximos prazos."
          acao={{ titulo: 'Novo prazo', onPress: () => navigation.navigate('CadastroCompromisso') }}
        />
      ) : (
        pendentes.slice(0, MAX_PRAZOS_NO_PAINEL).map((c) => (
          <LinhaPrazo
            key={c.id}
            compromisso={c}
            nomeDisciplina={nomeDisciplina(c.disciplinaId)}
            hoje={hoje}
            onAbrir={() => navigation.navigate('CadastroCompromisso', { compromissoId: c.id })}
            onAlternarConcluido={() => alternarConcluido(c.id)}
          />
        ))
      )}
    </ScrollView>
  );
}

function Indicador({
  valor,
  legenda,
  destaque,
}: {
  valor: number;
  legenda: string;
  destaque?: 'alerta' | 'atrasado';
}) {
  const paleta = destaque === 'alerta' ? cores.status.alerta : destaque === 'atrasado' ? cores.urgencia.atrasado : null;
  return (
    <View
      style={[estilos.indicador, paleta && { backgroundColor: paleta.fundo }]}
      accessible
      accessibilityLabel={`${valor} ${legenda}`}
    >
      <Text style={[estilos.numero, paleta && { color: paleta.texto }]}>{valor}</Text>
      <Text style={[estilos.legenda, paleta && { color: paleta.texto }]}>{legenda}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, paddingBottom: 32 },
  indicadores: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  indicador: {
    flex: 1,
    backgroundColor: cores.cartao,
    borderRadius: raio.lg,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    ...sombra,
  },
  numero: { fontSize: 32, fontWeight: '700', color: cores.texto },
  legenda: { fontSize: 14, color: cores.textoSuave, textAlign: 'center' },
  tudoCerto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.status.ok.fundo,
    borderRadius: raio.lg,
    padding: 14,
    marginBottom: 12,
  },
  textoTudoCerto: { flex: 1, fontSize: 16, lineHeight: 22, color: cores.status.ok.texto },
  mais: { fontSize: 16, color: cores.textoSuave, textAlign: 'center', marginBottom: 12 },
});
