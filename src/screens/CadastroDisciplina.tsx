import React, { useLayoutEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { previaDoLimite } from '../domain/calculo';
import { gerarId } from '../domain/ids';
import { plural } from '../domain/textos';
import { AULAS_POR_NOITE_PADRAO } from '../domain/tipos';
import { ErrosDisciplina, MAX_AULAS_POR_NOITE, lerInteiro, validarDisciplina } from '../domain/validacao';
import type { PilhaProps } from '../navegacao/tipos';
import { useDados } from '../state/DadosContext';
import { cores } from '../theme/cores';
import { raio } from '../theme/tema';
import Botao from '../components/Botao';
import Campo, { estiloInput } from '../components/Campo';
import { confirmarExclusao } from '../components/confirmar';

// US01 e US08: cadastrar ou editar uma disciplina, mostrando o limite de faltas calculado.
export default function CadastroDisciplina({ navigation, route }: PilhaProps<'CadastroDisciplina'>) {
  const idEdicao = route.params?.disciplinaId;
  const { disciplinas, adicionarDisciplina, atualizarDisciplina, removerDisciplina } = useDados();
  const existente = idEdicao ? disciplinas.find((d) => d.id === idEdicao) : undefined;

  const [nome, setNome] = useState(existente?.nome ?? '');
  const [professor, setProfessor] = useState(existente?.professor ?? '');
  const [cargaHoraria, setCargaHoraria] = useState(existente ? String(existente.cargaHoraria) : '');
  const [aulasPorNoite, setAulasPorNoite] = useState(
    existente ? String(existente.aulasPorNoite) : String(AULAS_POR_NOITE_PADRAO)
  );
  const [erros, setErros] = useState<ErrosDisciplina>({});
  const [salvando, setSalvando] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: existente ? 'Editar disciplina' : 'Nova disciplina' });
  }, [navigation, existente]);

  if (idEdicao && !existente) {
    return (
      <View style={estilos.tela}>
        <Text style={estilos.aviso}>Disciplina não encontrada.</Text>
      </View>
    );
  }

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
      if (existente) {
        await atualizarDisciplina({ ...existente, ...resultado.valores });
      } else {
        await adicionarDisciplina({ id: gerarId(), ...resultado.valores, criadaEm: new Date().toISOString() });
      }
      navigation.goBack();
    } catch {
      Alert.alert('Não foi possível salvar', 'Tente novamente.');
      setSalvando(false);
    }
  }

  function excluir() {
    if (!existente) return;
    confirmarExclusao(
      'Excluir disciplina?',
      `"${existente.nome}" será apagada junto com todas as faltas e os prazos dela. Isso não pode ser desfeito.`,
      async () => {
        try {
          await removerDisciplina(existente.id);
          navigation.popToTop();
        } catch {
          Alert.alert('Não foi possível excluir', 'Tente novamente.');
        }
      }
    );
  }

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
      <Campo rotulo="Nome da disciplina" erro={erros.nome}>
        <TextInput
          style={estiloInput}
          value={nome}
          onChangeText={setNome}
          placeholder="Ex.: Auditoria de Sistemas"
          accessibilityLabel="Nome da disciplina"
          returnKeyType="next"
        />
      </Campo>

      <Campo rotulo="Professor (opcional)">
        <TextInput
          style={estiloInput}
          value={professor}
          onChangeText={setProfessor}
          accessibilityLabel="Professor, opcional"
          returnKeyType="next"
        />
      </Campo>

      <Campo rotulo="Carga horária (em horas)" erro={erros.cargaHoraria}>
        <TextInput
          style={estiloInput}
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
          style={estiloInput}
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

      <Botao
        titulo={salvando ? 'Salvando...' : existente ? 'Salvar alterações' : 'Salvar disciplina'}
        onPress={salvar}
        desabilitado={salvando}
      />

      {existente ? <Botao titulo="Excluir disciplina" variante="perigo" icone="trash-outline" onPress={excluir} /> : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, gap: 16 },
  previa: { backgroundColor: cores.status.ok.fundo, borderRadius: raio.md, padding: 14 },
  textoPrevia: { fontSize: 16, fontWeight: '600', color: cores.status.ok.texto },
  aviso: { fontSize: 16, color: cores.textoSuave, textAlign: 'center', marginTop: 16 },
});
