import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { previaDoLimite } from '../domain/calculo';
import { gerarId } from '../domain/ids';
import { plural } from '../domain/textos';
import { ErrosDisciplina, MAX_AULAS_POR_NOITE, lerInteiro, validarDisciplina } from '../domain/validacao';
import { AULAS_POR_NOITE_PADRAO } from '../domain/tipos';
import { useDados } from '../state/DadosContext';
import { cores } from '../theme/cores';
import Botao from '../components/Botao';

type Props = NativeStackScreenProps<RootStackParamList, 'CadastroDisciplina'>;

// US01: cadastrar disciplina e já mostrar o limite de faltas calculado.
export default function CadastroDisciplina({ navigation }: Props) {
  const { adicionarDisciplina } = useDados();
  const [nome, setNome] = useState('');
  const [professor, setProfessor] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState('');
  const [aulasPorNoite, setAulasPorNoite] = useState(String(AULAS_POR_NOITE_PADRAO));
  const [erros, setErros] = useState<ErrosDisciplina>({});
  const [salvando, setSalvando] = useState(false);

  // Prévia do limite enquanto a pessoa digita (só quando os números são válidos).
  const carga = lerInteiro(cargaHoraria);
  const aulas = lerInteiro(aulasPorNoite);
  const previa =
    carga !== null && carga > 0 && aulas !== null && aulas >= 1 && aulas <= MAX_AULAS_POR_NOITE
      ? previaDoLimite(carga, aulas)
      : null;

  async function salvar() {
    const resultado = validarDisciplina({ nome, professor, cargaHoraria, aulasPorNoite });
    if (!resultado.valida) {
      setErros(resultado.erros);
      return;
    }
    setErros({});
    setSalvando(true);
    try {
      await adicionarDisciplina({
        id: gerarId(),
        ...resultado.valores,
        criadaEm: new Date().toISOString(),
      });
      navigation.goBack();
    } catch {
      Alert.alert('Não foi possível salvar', 'Tente novamente.');
      setSalvando(false);
    }
  }

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
      <Campo rotulo="Nome da disciplina" erro={erros.nome}>
        <TextInput
          style={estilos.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Ex.: Auditoria de Sistemas"
          accessibilityLabel="Nome da disciplina"
          returnKeyType="next"
        />
      </Campo>

      <Campo rotulo="Professor (opcional)">
        <TextInput
          style={estilos.input}
          value={professor}
          onChangeText={setProfessor}
          accessibilityLabel="Professor, opcional"
          returnKeyType="next"
        />
      </Campo>

      <Campo rotulo="Carga horária (em horas)" erro={erros.cargaHoraria}>
        <TextInput
          style={estilos.input}
          value={cargaHoraria}
          onChangeText={setCargaHoraria}
          keyboardType="number-pad"
          maxLength={4}
          placeholder="Ex.: 60"
          accessibilityLabel="Carga horária em horas"
        />
      </Campo>

      <Campo rotulo={`Aulas por noite (1 a ${MAX_AULAS_POR_NOITE})`} erro={erros.aulasPorNoite}>
        <TextInput
          style={estilos.input}
          value={aulasPorNoite}
          onChangeText={setAulasPorNoite}
          keyboardType="number-pad"
          maxLength={1}
          accessibilityLabel="Aulas por noite"
        />
      </Campo>

      {previa ? (
        <View style={estilos.previa} accessibilityLiveRegion="polite">
          <Text style={estilos.textoPrevia}>
            Limite: {plural(previa.limite, 'falta', 'faltas')} ({plural(previa.noites, 'noite', 'noites')})
          </Text>
        </View>
      ) : null}

      <Botao titulo={salvando ? 'Salvando...' : 'Salvar disciplina'} onPress={salvar} desabilitado={salvando} />
    </ScrollView>
  );
}

function Campo({ rotulo, erro, children }: { rotulo: string; erro?: string; children: React.ReactNode }) {
  return (
    <View style={estilos.campo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      {children}
      {erro ? <Text style={estilos.erro}>{erro}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, gap: 16 },
  campo: { gap: 6 },
  rotulo: { fontSize: 16, fontWeight: '600', color: cores.texto },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: cores.texto,
    backgroundColor: cores.cartao,
  },
  erro: { fontSize: 16, color: cores.status.excedido.texto },
  previa: { backgroundColor: cores.status.ok.fundo, borderRadius: 10, padding: 14 },
  textoPrevia: { fontSize: 16, fontWeight: '600', color: cores.status.ok.texto },
});
