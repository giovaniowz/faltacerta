import { Ionicons } from '@expo/vector-icons';
import { useLayoutEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { dataPorExtenso } from '../domain/datas';
import { disciplinasEmAtencao, resumoDoPainel } from '../domain/painel';
import { agruparPrazos } from '../domain/prazos';
import { plural, saudacao } from '../domain/textos';
import type { AbaProps } from '../navegacao/tipos';
import { useDados } from '../state/DadosContext';
import { useHoje } from '../state/useHoje';
import { cores } from '../theme/cores';
import { raio, sombra } from '../theme/tema';
import Botao from '../components/Botao';
import BotaoIcone from '../components/BotaoIcone';
import CartaoDisciplina from '../components/CartaoDisciplina';
import EstadoVazio from '../components/EstadoVazio';
import type { IconeNome } from '../components/icones';
import LinhaPrazo from '../components/LinhaPrazo';
import Secao from '../components/Secao';

const MAX_PRAZOS_NO_PAINEL = 3;
const MAX_DISCIPLINAS_NO_PAINEL = 3;

const ICONE_DO_TOM: Record<'ok' | 'atencao' | 'critico', IconeNome> = {
  ok: 'checkmark-circle',
  atencao: 'alert-circle',
  critico: 'warning',
};

// US10: painel inicial. Primeiro o que o estudante precisa saber, depois o que pode fazer agora.
export default function Inicio({ navigation }: AbaProps<'Inicio'>) {
  const { disciplinas, faltas, compromissos, config, atualizarCompromisso } = useDados();
  const hoje = useHoje();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <BotaoIcone nome="settings-outline" rotulo="Configurações" onPress={() => navigation.navigate('Configuracoes')} />
      ),
    });
  }, [navigation]);

  const emAtencao = disciplinasEmAtencao(disciplinas, faltas, config.nivelAlerta);
  const grupos = agruparPrazos(compromissos, hoje);
  const pendentes = [...grupos.atrasados, ...grupos.proximos];
  const resumo = resumoDoPainel(emAtencao, grupos.atrasados, grupos.proximos, hoje);
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
      <View style={estilos.hero}>
        <Text style={estilos.saudacao}>
          {saudacao(new Date().getHours())} · {dataPorExtenso(hoje)}
        </Text>
        <View style={estilos.heroTitulo}>
          <View style={estilos.heroIcone}>
            <Ionicons name={ICONE_DO_TOM[resumo.tom]} size={28} color="#FFFFFF" />
          </View>
          <View style={estilos.heroTextos}>
            <Text style={estilos.titulo} accessibilityRole="header">
              {resumo.titulo}
            </Text>
            <Text style={estilos.subtitulo}>{resumo.subtitulo}</Text>
          </View>
        </View>

        <View style={estilos.indicadores}>
          <Indicador valor={disciplinas.length} legenda={disciplinas.length === 1 ? 'disciplina' : 'disciplinas'} />
          <Indicador valor={emAtencao.length} legenda="em atenção" />
          <Indicador
            valor={pendentes.length}
            legenda={pendentes.length === 1 ? 'prazo pendente' : 'prazos pendentes'}
          />
        </View>
      </View>

      <View style={estilos.atalhos}>
        <View style={estilos.atalho}>
          <Botao titulo="Registrar falta" icone="add" onPress={() => navigation.navigate('RegistrarFalta')} />
        </View>
        <View style={estilos.atalho}>
          <Botao
            titulo="Novo prazo"
            icone="calendar-outline"
            variante="secundaria"
            onPress={() => navigation.navigate('CadastroCompromisso')}
          />
        </View>
      </View>

      <Secao titulo="Precisam de atenção" />
      {emAtencao.length === 0 ? (
        <View style={estilos.tudoCerto}>
          <Ionicons name="checkmark-circle" size={28} color={cores.status.ok.texto} />
          <Text style={estilos.textoTudoCerto}>Tudo certo: nenhuma disciplina perto do limite de faltas.</Text>
        </View>
      ) : (
        emAtencao.slice(0, MAX_DISCIPLINAS_NO_PAINEL).map(({ disciplina, resumo: r }) => (
          <CartaoDisciplina
            key={disciplina.id}
            disciplina={disciplina}
            resumo={r}
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
        <View style={estilos.semPrazos}>
          <Ionicons name="calendar-outline" size={24} color={cores.textoSuave} />
          <Text style={estilos.textoSemPrazos}>Sem prazos por enquanto. Cadastre provas e trabalhos para ver as datas aqui.</Text>
        </View>
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

function Indicador({ valor, legenda }: { valor: number; legenda: string }) {
  return (
    <View style={estilos.indicador} accessible accessibilityLabel={`${valor} ${legenda}`}>
      <Text style={estilos.numero} maxFontSizeMultiplier={1.3}>
        {valor}
      </Text>
      <Text style={estilos.legenda}>{legenda}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, paddingBottom: 32 },
  hero: { backgroundColor: cores.primaria, borderRadius: 24, padding: 20, gap: 16, ...sombra },
  saudacao: { fontSize: 15, color: cores.textoSobrePrimaria },
  heroTitulo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroIcone: { width: 52, height: 52, borderRadius: 26, backgroundColor: cores.sobrePrimaria, alignItems: 'center', justifyContent: 'center' },
  heroTextos: { flex: 1, gap: 2 },
  titulo: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', lineHeight: 28 },
  subtitulo: { fontSize: 16, color: cores.textoSobrePrimaria },
  indicadores: { flexDirection: 'row', gap: 10 },
  indicador: { flex: 1, backgroundColor: cores.sobrePrimaria, borderRadius: raio.md, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center' },
  numero: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  legenda: { fontSize: 13, color: cores.textoSobrePrimaria, textAlign: 'center' },
  atalhos: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 8 },
  atalho: { flex: 1 },
  tudoCerto: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: cores.status.ok.fundo, borderRadius: raio.lg, padding: 14, marginBottom: 12 },
  textoTudoCerto: { flex: 1, fontSize: 16, lineHeight: 22, color: cores.status.ok.texto },
  semPrazos: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: cores.cartao, borderRadius: raio.lg, padding: 14, ...sombra },
  textoSemPrazos: { flex: 1, fontSize: 16, lineHeight: 22, color: cores.textoSuave },
  mais: { fontSize: 16, color: cores.textoSuave, textAlign: 'center', marginBottom: 12 },
});
