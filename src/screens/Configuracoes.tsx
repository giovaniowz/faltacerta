import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AULAS_POR_NOITE_PADRAO, NIVEL_ALERTA_MAX, NIVEL_ALERTA_MIN, NIVEL_ALERTA_PADRAO } from '../domain/tipos';
import { plural } from '../domain/textos';
import { limitarNivelAlerta } from '../domain/validacao';
import { useDados } from '../state/DadosContext';
import { cores } from '../theme/cores';
import { raio, sombra } from '../theme/tema';
import Botao from '../components/Botao';
import Contador from '../components/Contador';

// US04: o estudante escolhe quando o alerta de limite deve aparecer.
export default function Configuracoes() {
  const { config, salvarConfig } = useDados();

  async function alterar(nivel: number) {
    try {
      await salvarConfig({ ...config, nivelAlerta: limitarNivelAlerta(nivel) });
    } catch {
      Alert.alert('Não foi possível salvar', 'Tente novamente.');
    }
  }

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <View style={estilos.cartao}>
        <Text style={estilos.titulo}>Alerta de limite</Text>
        <Text style={estilos.texto}>
          Mostrar o aviso &quot;perto do limite&quot; quando restarem esta quantidade de faltas, ou menos.
        </Text>

        <Contador
          valor={config.nivelAlerta}
          min={NIVEL_ALERTA_MIN}
          max={NIVEL_ALERTA_MAX}
          onChange={alterar}
          formatar={(n) => plural(n, 'falta', 'faltas')}
          rotuloMenos="Diminuir o nível de alerta"
          rotuloMais="Aumentar o nível de alerta"
        />

        <Text style={estilos.dica}>
          Uma noite de {AULAS_POR_NOITE_PADRAO} aulas vale {AULAS_POR_NOITE_PADRAO} faltas. O padrão é{' '}
          {NIVEL_ALERTA_PADRAO} faltas, ou seja, uma noite.
        </Text>

        <Botao
          titulo="Restaurar padrão"
          variante="secundaria"
          onPress={() => alterar(NIVEL_ALERTA_PADRAO)}
          desabilitado={config.nivelAlerta === NIVEL_ALERTA_PADRAO}
        />
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16 },
  cartao: { backgroundColor: cores.cartao, borderRadius: raio.lg, padding: 16, gap: 16, ...sombra },
  titulo: { fontSize: 18, fontWeight: '700', color: cores.texto },
  texto: { fontSize: 16, lineHeight: 24, color: cores.textoSuave },
  dica: { fontSize: 16, lineHeight: 24, color: cores.textoSuave },
});
