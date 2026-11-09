import React, { useLayoutEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { hojeISO, isoParaData, paraDataISO } from '../domain/datas';
import { gerarId } from '../domain/ids';
import { ErrosCompromisso, validarCompromisso } from '../domain/prazos';
import { TipoCompromisso } from '../domain/tipos';
import type { PilhaProps } from '../navegacao/tipos';
import { useDados } from '../state/DadosContext';
import { cores } from '../theme/cores';
import { raio } from '../theme/tema';
import Botao from '../components/Botao';
import Campo, { estiloInput } from '../components/Campo';
import CampoData from '../components/CampoData';
import { confirmarExclusao } from '../components/confirmar';
import EstadoVazio from '../components/EstadoVazio';
import Segmentado from '../components/Segmentado';

const TIPOS: { valor: TipoCompromisso; rotulo: string }[] = [
  { valor: 'prova', rotulo: 'Prova' },
  { valor: 'trabalho', rotulo: 'Trabalho' },
];

// US05 e US08: cadastrar ou editar uma prova ou um trabalho com prazo.
export default function CadastroCompromisso({ navigation, route }: PilhaProps<'CadastroCompromisso'>) {
  const idEdicao = route.params?.compromissoId;
  const { disciplinas, compromissos, adicionarCompromisso, atualizarCompromisso, removerCompromisso } = useDados();
  const existente = idEdicao ? compromissos.find((c) => c.id === idEdicao) : undefined;

  const [tipo, setTipo] = useState<TipoCompromisso>(existente?.tipo ?? 'prova');
  const [descricao, setDescricao] = useState(existente?.descricao ?? '');
  const [disciplinaId, setDisciplinaId] = useState<string | null>(
    existente?.disciplinaId ?? route.params?.disciplinaId ?? (disciplinas.length === 1 ? disciplinas[0].id : null)
  );
  const [prazo, setPrazo] = useState(() => (existente ? isoParaData(existente.prazo) : new Date()));
  const [erros, setErros] = useState<ErrosCompromisso>({});
  const [salvando, setSalvando] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: existente ? 'Editar prazo' : 'Novo prazo' });
  }, [navigation, existente]);

  if (idEdicao && !existente) {
    return (
      <View style={estilos.tela}>
        <Text style={estilos.aviso}>Prazo não encontrado.</Text>
      </View>
    );
  }

  if (disciplinas.length === 0) {
    return (
      <View style={estilos.tela}>
        <EstadoVazio
          icone="school-outline"
          titulo="Cadastre uma disciplina primeiro"
          texto="Provas e trabalhos ficam ligados a uma disciplina."
          acao={{ titulo: 'Cadastrar disciplina', onPress: () => navigation.replace('CadastroDisciplina') }}
        />
      </View>
    );
  }

  async function salvar() {
    const resultado = validarCompromisso(
      { tipo, descricao, disciplinaId, prazo: paraDataISO(prazo) },
      hojeISO(),
      Boolean(existente)
    );
    if (!resultado.valida) {
      setErros(resultado.erros);
      return;
    }
    setErros({});
    setSalvando(true);
    try {
      if (existente) {
        await atualizarCompromisso({ ...existente, ...resultado.valores });
      } else {
        await adicionarCompromisso({
          id: gerarId(),
          ...resultado.valores,
          concluido: false,
          criadoEm: new Date().toISOString(),
        });
      }
      navigation.goBack();
    } catch {
      Alert.alert('Não foi possível salvar', 'Tente novamente.');
      setSalvando(false);
    }
  }

  function excluir() {
    if (!existente) return;
    confirmarExclusao('Excluir prazo?', `"${existente.descricao}" será apagado. Isso não pode ser desfeito.`, async () => {
      try {
        await removerCompromisso(existente.id);
        navigation.goBack();
      } catch {
        Alert.alert('Não foi possível excluir', 'Tente novamente.');
      }
    });
  }

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
      <Campo rotulo="Tipo">
        <Segmentado opcoes={TIPOS} valor={tipo} onChange={setTipo} />
      </Campo>

      <Campo rotulo="Descrição" erro={erros.descricao}>
        <TextInput
          style={estiloInput}
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Ex.: Prova 1 ou Trabalho final"
          accessibilityLabel="Descrição"
          returnKeyType="done"
        />
      </Campo>

      <Campo rotulo="Disciplina" erro={erros.disciplinaId}>
        <View style={estilos.opcoes}>
          {disciplinas.map((d) => {
            const ativa = d.id === disciplinaId;
            return (
              <Pressable
                key={d.id}
                onPress={() => setDisciplinaId(d.id)}
                accessibilityRole="button"
                accessibilityLabel={`Disciplina ${d.nome}`}
                accessibilityState={{ selected: ativa }}
                style={[estilos.opcao, ativa && estilos.opcaoAtiva]}
              >
                <Text style={[estilos.textoOpcao, ativa && estilos.textoOpcaoAtiva]}>{d.nome}</Text>
              </Pressable>
            );
          })}
        </View>
      </Campo>

      <View>
        <CampoData
          rotulo="Prazo"
          valor={prazo}
          onChange={setPrazo}
          minimo={existente ? undefined : new Date()}
        />
        {erros.prazo ? <Text style={estilos.erro}>{erros.prazo}</Text> : null}
      </View>

      <Botao
        titulo={salvando ? 'Salvando...' : existente ? 'Salvar alterações' : 'Salvar prazo'}
        onPress={salvar}
        desabilitado={salvando}
      />

      {existente ? <Botao titulo="Excluir prazo" variante="perigo" icone="trash-outline" onPress={excluir} /> : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, gap: 16 },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: raio.pilula,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.cartao,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcaoAtiva: { backgroundColor: cores.primariaSuave, borderColor: cores.primaria, borderWidth: 2 },
  textoOpcao: { fontSize: 16, color: cores.texto },
  textoOpcaoAtiva: { color: cores.primaria, fontWeight: '700' },
  erro: { fontSize: 16, color: cores.status.excedido.texto, marginTop: 6 },
  aviso: { fontSize: 16, color: cores.textoSuave, textAlign: 'center', marginTop: 16 },
});
