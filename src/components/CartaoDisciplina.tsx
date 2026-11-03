import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Disciplina, Resumo } from '../domain/tipos';
import { rotuloStatus } from '../domain/textos';
import { cores } from '../theme/cores';
import Botao from './Botao';

type Props = {
  disciplina: Disciplina;
  resumo: Resumo;
  onAbrir: () => void;
  onRegistrarFalta: () => void;
};

export default function CartaoDisciplina({ disciplina, resumo, onAbrir, onRegistrarFalta }: Props) {
  const paleta = cores.status[resumo.status];
  // Com limite 0 a barra já aparece cheia.
  const proporcao = resumo.limite > 0 ? Math.min(1, resumo.faltasRegistradas / resumo.limite) : 1;
  const porcentagem = Math.round(proporcao * 100);

  return (
    <View style={estilos.cartao}>
      <Pressable
        onPress={onAbrir}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${disciplina.nome}`}
        style={estilos.area}
      >
        <Text style={estilos.nome}>{disciplina.nome}</Text>
        {disciplina.professor ? <Text style={estilos.professor}>{disciplina.professor}</Text> : null}

        <Text style={estilos.contagem}>
          {resumo.faltasRegistradas} / {resumo.limite} faltas
        </Text>

        <View style={estilos.trilho}>
          <View
            style={[estilos.preenchimento, { width: `${porcentagem}%`, backgroundColor: paleta.texto }]}
          />
        </View>

        <View style={[estilos.etiqueta, { backgroundColor: paleta.fundo }]}>
          <Text style={[estilos.textoEtiqueta, { color: paleta.texto }]}>{rotuloStatus(resumo.status)}</Text>
        </View>
      </Pressable>

      <Botao
        titulo="Registrar falta"
        variante="secundaria"
        onPress={onRegistrarFalta}
        textoAcessivel={`Registrar falta em ${disciplina.nome}`}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: cores.cartao,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  area: { gap: 6 },
  nome: { fontSize: 18, fontWeight: '700', color: cores.texto },
  professor: { fontSize: 16, color: cores.textoSuave },
  contagem: { fontSize: 16, color: cores.texto, marginTop: 4 },
  trilho: { height: 10, borderRadius: 5, backgroundColor: cores.borda, overflow: 'hidden' },
  preenchimento: { height: 10, borderRadius: 5 },
  etiqueta: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  textoEtiqueta: { fontSize: 16, fontWeight: '600' },
});
