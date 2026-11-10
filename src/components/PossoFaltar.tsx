import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { simularNoitesFaltando, textoSimulacao } from '../domain/simulacao';
import { plural } from '../domain/textos';
import { Disciplina, Falta } from '../domain/tipos';
import { cores } from '../theme/cores';
import { raio, sombra } from '../theme/tema';
import Contador from './Contador';
import { iconeStatus } from './icones';

const MAX_NOITES_SIMULADAS = 10;

type Props = { disciplina: Disciplina; faltas: Falta[]; nivelAlerta: number };

// "Posso faltar?": o estudante escolhe quantas noites pretende faltar e vê como fica.
export default function PossoFaltar({ disciplina, faltas, nivelAlerta }: Props) {
  const [noites, setNoites] = useState(1);
  const simulacao = simularNoitesFaltando(disciplina, faltas, noites, nivelAlerta);
  const paleta = cores.status[simulacao.depois.status];

  return (
    <View style={estilos.cartao}>
      <Text style={estilos.titulo} accessibilityRole="header">
        Posso faltar?
      </Text>
      <Text style={estilos.texto}>
        {simulacao.antes.status === 'excedido'
          ? 'Você já ultrapassou o limite de faltas desta disciplina.'
          : `Você pode faltar até ${plural(simulacao.antes.noitesRestantes, 'noite', 'noites')} sem reprovar.`}
      </Text>

      <Text style={estilos.rotulo}>Se eu faltar mais:</Text>
      <Contador
        valor={noites}
        min={1}
        max={MAX_NOITES_SIMULADAS}
        onChange={setNoites}
        formatar={(n) => plural(n, 'noite', 'noites')}
        rotuloMenos="Diminuir noites simuladas"
        rotuloMais="Aumentar noites simuladas"
      />

      <View style={[estilos.resultado, { backgroundColor: paleta.fundo }]} accessibilityLiveRegion="polite">
        <Ionicons name={iconeStatus(simulacao.depois.status)} size={24} color={paleta.texto} />
        <Text style={[estilos.textoResultado, { color: paleta.texto }]}>{textoSimulacao(simulacao)}</Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: { backgroundColor: cores.cartao, borderRadius: raio.lg, padding: 16, gap: 12, ...sombra },
  titulo: { fontSize: 18, fontWeight: '700', color: cores.texto },
  texto: { fontSize: 16, lineHeight: 22, color: cores.textoSuave },
  rotulo: { fontSize: 16, fontWeight: '600', color: cores.texto },
  resultado: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderRadius: raio.md, padding: 12 },
  textoResultado: { flex: 1, fontSize: 16, lineHeight: 22 },
});
