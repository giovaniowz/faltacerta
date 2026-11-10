import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { descreverLembrete, rotuloHora } from '../domain/lembretes';
import { plural } from '../domain/textos';
import {
  AULAS_POR_NOITE_PADRAO,
  Config,
  LEMBRETE_DIAS_ANTES_MAX,
  LEMBRETE_DIAS_ANTES_MIN,
  LEMBRETE_HORA_MAX,
  LEMBRETE_HORA_MIN,
  NIVEL_ALERTA_MAX,
  NIVEL_ALERTA_MIN,
  NIVEL_ALERTA_PADRAO,
} from '../domain/tipos';
import { limitarDiasAntes, limitarHora, limitarNivelAlerta } from '../domain/validacao';
import type { PilhaProps } from '../navegacao/tipos';
import { useDados } from '../state/DadosContext';
import { cores } from '../theme/cores';
import { raio, sombra } from '../theme/tema';
import Botao from '../components/Botao';
import { confirmarAcao } from '../components/confirmar';
import Contador from '../components/Contador';

// US04 e US07: alerta de limite, lembretes de prazo, regras do app e modo demonstração.
export default function Configuracoes({ navigation }: PilhaProps<'Configuracoes'>) {
  const { config, salvarConfig, permissaoNotificacoes, pedirPermissaoNotificacoes, carregarDadosDeExemplo, apagarTudo } =
    useDados();

  async function atualizar(parcial: Partial<Config>) {
    try {
      await salvarConfig({ ...config, ...parcial });
    } catch {
      Alert.alert('Não foi possível salvar', 'Tente novamente.');
    }
  }

  async function executar(acao: () => Promise<void>) {
    try {
      await acao();
    } catch {
      Alert.alert('Não foi possível concluir', 'Tente novamente.');
    }
  }

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <View style={estilos.cartao}>
        <Text style={estilos.titulo} accessibilityRole="header">
          Alerta de limite
        </Text>
        <Text style={estilos.texto}>
          Mostrar o aviso &quot;perto do limite&quot; quando restarem esta quantidade de faltas, ou menos.
        </Text>
        <Contador
          valor={config.nivelAlerta}
          min={NIVEL_ALERTA_MIN}
          max={NIVEL_ALERTA_MAX}
          onChange={(n) => atualizar({ nivelAlerta: limitarNivelAlerta(n) })}
          formatar={(n) => plural(n, 'falta', 'faltas')}
          rotuloMenos="Diminuir o nível de alerta"
          rotuloMais="Aumentar o nível de alerta"
        />
        <Text style={estilos.texto}>
          Uma noite de {AULAS_POR_NOITE_PADRAO} aulas vale {AULAS_POR_NOITE_PADRAO} faltas. O padrão é{' '}
          {NIVEL_ALERTA_PADRAO} faltas, ou seja, uma noite.
        </Text>
        <Botao
          titulo="Restaurar padrão"
          variante="secundaria"
          onPress={() => atualizar({ nivelAlerta: NIVEL_ALERTA_PADRAO })}
          desabilitado={config.nivelAlerta === NIVEL_ALERTA_PADRAO}
        />
      </View>

      <View style={estilos.cartao}>
        <Text style={estilos.titulo} accessibilityRole="header">
          Lembretes de prazos
        </Text>
        <View style={estilos.linhaSwitch}>
          <Text style={[estilos.texto, estilos.textoSwitch]}>Avisar antes de provas e trabalhos</Text>
          <Switch
            value={config.lembreteAtivo}
            onValueChange={(ativo) => atualizar({ lembreteAtivo: ativo })}
            trackColor={{ true: cores.primaria }}
            accessibilityLabel="Avisar antes de provas e trabalhos"
          />
        </View>

        {config.lembreteAtivo ? (
          <>
            <Text style={estilos.rotulo}>Quantos dias antes</Text>
            <Contador
              valor={config.lembreteDiasAntes}
              min={LEMBRETE_DIAS_ANTES_MIN}
              max={LEMBRETE_DIAS_ANTES_MAX}
              onChange={(n) => atualizar({ lembreteDiasAntes: limitarDiasAntes(n) })}
              formatar={(n) => (n === 0 ? 'No dia' : n === 1 ? '1 dia' : `${n} dias`)}
              rotuloMenos="Diminuir os dias de antecedência"
              rotuloMais="Aumentar os dias de antecedência"
            />
            <Text style={estilos.rotulo}>Horário do aviso</Text>
            <Contador
              valor={config.lembreteHora}
              min={LEMBRETE_HORA_MIN}
              max={LEMBRETE_HORA_MAX}
              onChange={(n) => atualizar({ lembreteHora: limitarHora(n) })}
              formatar={rotuloHora}
              rotuloMenos="Diminuir a hora do aviso"
              rotuloMais="Aumentar a hora do aviso"
            />
            <Text style={estilos.texto}>
              Você será avisado: {descreverLembrete(config.lembreteDiasAntes, config.lembreteHora)}.
            </Text>

            {permissaoNotificacoes === 'concedida' ? (
              <View style={estilos.permitido}>
                <Ionicons name="checkmark-circle" size={22} color={cores.status.ok.texto} />
                <Text style={estilos.textoPermitido}>Notificações permitidas neste aparelho.</Text>
              </View>
            ) : permissaoNotificacoes === 'indefinida' ? (
              <Botao
                titulo="Permitir notificações"
                icone="notifications-outline"
                onPress={() => executar(pedirPermissaoNotificacoes)}
              />
            ) : (
              <View style={estilos.bloqueado}>
                <Text style={estilos.textoBloqueado}>
                  As notificações estão bloqueadas para o FaltaCerta. Libere nas configurações do aparelho para receber
                  os avisos.
                </Text>
                <Botao
                  titulo="Abrir configurações do aparelho"
                  variante="secundaria"
                  onPress={() => {
                    Linking.openSettings().catch(() => undefined);
                  }}
                />
              </View>
            )}
          </>
        ) : null}
      </View>

      <Pressable
        onPress={() => navigation.navigate('ComoCalculamos')}
        accessibilityRole="button"
        accessibilityLabel="Como calculamos o limite de faltas"
        style={({ pressed }) => [estilos.linhaLink, pressed && estilos.pressionado]}
      >
        <Ionicons name="information-circle-outline" size={24} color={cores.primaria} />
        <Text style={estilos.textoLink}>Como calculamos o limite de faltas</Text>
        <Ionicons name="chevron-forward" size={20} color={cores.textoSuave} />
      </Pressable>

      <View style={estilos.cartao}>
        <Text style={estilos.titulo} accessibilityRole="header">
          Demonstração
        </Text>
        <Text style={estilos.texto}>
          Carregue dados de exemplo para mostrar o app ou apague tudo para recomeçar. As configurações acima não mudam.
        </Text>
        <Botao
          titulo="Carregar dados de exemplo"
          variante="secundaria"
          icone="albums-outline"
          onPress={() =>
            confirmarAcao(
              'Carregar dados de exemplo?',
              'Suas disciplinas, faltas e prazos atuais serão apagados e trocados por dados de exemplo. Isso não pode ser desfeito.',
              'Carregar',
              () => executar(carregarDadosDeExemplo),
              true
            )
          }
        />
        <Botao
          titulo="Apagar todos os dados"
          variante="perigo"
          icone="trash-outline"
          onPress={() =>
            confirmarAcao(
              'Apagar todos os dados?',
              'Todas as disciplinas, faltas e prazos serão apagados. Isso não pode ser desfeito.',
              'Apagar',
              () => executar(apagarTudo),
              true
            )
          }
        />
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, gap: 16, paddingBottom: 32 },
  cartao: { backgroundColor: cores.cartao, borderRadius: raio.lg, padding: 16, gap: 14, ...sombra },
  titulo: { fontSize: 18, fontWeight: '700', color: cores.texto },
  texto: { fontSize: 16, lineHeight: 24, color: cores.textoSuave },
  rotulo: { fontSize: 16, fontWeight: '600', color: cores.texto },
  linhaSwitch: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  textoSwitch: { flex: 1 },
  permitido: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  textoPermitido: { flex: 1, fontSize: 16, color: cores.status.ok.texto },
  bloqueado: { backgroundColor: cores.status.alerta.fundo, borderRadius: raio.md, padding: 12, gap: 12 },
  textoBloqueado: { fontSize: 16, lineHeight: 22, color: cores.status.alerta.texto },
  linhaLink: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.cartao,
    borderRadius: raio.lg,
    paddingHorizontal: 16,
    ...sombra,
  },
  pressionado: { opacity: 0.7 },
  textoLink: { flex: 1, fontSize: 16, fontWeight: '600', color: cores.texto },
});
