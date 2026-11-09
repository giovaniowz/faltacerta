import React, { useState } from 'react';
import { Alert, SectionList, StyleSheet, Text, View } from 'react-native';
import { hojeISO } from '../domain/datas';
import { agruparPrazos } from '../domain/prazos';
import { Compromisso, TipoCompromisso } from '../domain/tipos';
import type { AbaProps } from '../navegacao/tipos';
import { useDados } from '../state/DadosContext';
import { cores } from '../theme/cores';
import Botao from '../components/Botao';
import EstadoVazio from '../components/EstadoVazio';
import LinhaPrazo from '../components/LinhaPrazo';
import Segmentado from '../components/Segmentado';

type Filtro = 'todos' | TipoCompromisso;

const FILTROS: { valor: Filtro; rotulo: string }[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'prova', rotulo: 'Provas' },
  { valor: 'trabalho', rotulo: 'Trabalhos' },
];

// Aba "Prazos" (US05, US06 e US09): provas e trabalhos em ordem de data.
export default function Prazos({ navigation }: AbaProps<'Prazos'>) {
  const { disciplinas, compromissos, atualizarCompromisso } = useDados();
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const hoje = hojeISO();

  const visiveis = filtro === 'todos' ? compromissos : compromissos.filter((c) => c.tipo === filtro);
  const grupos = agruparPrazos(visiveis, hoje);
  const secoes = [
    { titulo: 'Atrasados', cor: cores.urgencia.atrasado.texto, data: grupos.atrasados },
    { titulo: 'Próximos', cor: cores.texto, data: grupos.proximos },
    { titulo: 'Concluídos', cor: cores.textoSuave, data: grupos.concluidos },
  ].filter((s) => s.data.length > 0);

  const nomeDisciplina = (id: string) => disciplinas.find((d) => d.id === id)?.nome ?? 'Disciplina removida';

  async function alternarConcluido(c: Compromisso) {
    try {
      await atualizarCompromisso({ ...c, concluido: !c.concluido });
    } catch {
      Alert.alert('Não foi possível salvar', 'Tente novamente.');
    }
  }

  const semDisciplinas = disciplinas.length === 0;

  return (
    <View style={estilos.tela}>
      <SectionList
        sections={secoes}
        keyExtractor={(c) => c.id}
        contentContainerStyle={estilos.lista}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          compromissos.length > 0 ? (
            <View style={estilos.filtros}>
              <Segmentado opcoes={FILTROS} valor={filtro} onChange={setFiltro} />
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          semDisciplinas ? (
            <EstadoVazio
              icone="school-outline"
              titulo="Cadastre uma disciplina primeiro"
              texto="Provas e trabalhos ficam ligados a uma disciplina."
              acao={{ titulo: 'Cadastrar disciplina', onPress: () => navigation.navigate('CadastroDisciplina') }}
            />
          ) : compromissos.length > 0 ? (
            <EstadoVazio
              icone="funnel-outline"
              titulo="Nada neste filtro"
              texto="Não há itens do tipo escolhido. Mude o filtro para ver os outros."
            />
          ) : (
            <EstadoVazio
              icone="calendar-outline"
              titulo="Nenhum prazo cadastrado"
              texto="Cadastre provas e trabalhos para acompanhar as datas em ordem."
            />
          )
        }
        renderSectionHeader={({ section }) => (
          <Text style={[estilos.secao, { color: section.cor }]} accessibilityRole="header">
            {section.titulo} ({section.data.length})
          </Text>
        )}
        renderItem={({ item }) => (
          <LinhaPrazo
            compromisso={item}
            nomeDisciplina={nomeDisciplina(item.disciplinaId)}
            hoje={hoje}
            onAbrir={() => navigation.navigate('CadastroCompromisso', { compromissoId: item.id })}
            onAlternarConcluido={() => alternarConcluido(item)}
          />
        )}
      />
      {semDisciplinas ? null : (
        <View style={estilos.rodape}>
          <Botao titulo="+ Novo prazo" onPress={() => navigation.navigate('CadastroCompromisso')} />
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  lista: { padding: 16, flexGrow: 1 },
  filtros: { marginBottom: 12 },
  secao: { fontSize: 18, fontWeight: '700', marginTop: 8, marginBottom: 10 },
  rodape: { padding: 16, borderTopWidth: 1, borderTopColor: cores.borda, backgroundColor: cores.cartao },
});
