import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { limiteDeFaltas, previaDoLimite } from '../domain/calculo';
import { FREQUENCIA_MINIMA } from '../domain/frequencia';
import { plural } from '../domain/textos';
import { PERCENTUAL_MAXIMO_FALTAS } from '../domain/tipos';
import { cores } from '../theme/cores';
import { raio, sombra } from '../theme/tema';

const EXEMPLOS = [
  { carga: 60, aulas: 3 },
  { carga: 45, aulas: 3 },
  { carga: 80, aulas: 4 },
];

// Explica as regras do app em linguagem simples (e com números calculados pelo próprio código).
export default function ComoCalculamos() {
  const limitePercentual = Math.round(PERCENTUAL_MAXIMO_FALTAS * 100);

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <Bloco titulo="A regra">
        <Texto>
          Nos cursos presenciais é preciso ter, no mínimo, {FREQUENCIA_MINIMA}% de frequência em cada disciplina. Isso
          significa que o limite é de {limitePercentual}% de faltas sobre a carga horária.
        </Texto>
      </Bloco>

      <Bloco titulo="Como contamos as faltas">
        <Texto>Cada hora da carga horária vale uma aula, e cada aula perdida vale uma falta.</Texto>
        <Texto>
          Uma noite de ausência com 3 aulas vale 3 faltas. Se você chegar atrasado ou sair mais cedo, registre só as
          aulas perdidas.
        </Texto>
        <Texto>
          O limite é arredondado para baixo, para o app nunca prometer mais faltas do que o permitido.
        </Texto>
      </Bloco>

      <Bloco titulo="Exemplos">
        {EXEMPLOS.map(({ carga, aulas }) => {
          const previa = previaDoLimite(carga, aulas);
          return (
            <Texto key={carga}>
              {carga}h com {plural(aulas, 'aula', 'aulas')} por noite: limite de{' '}
              {plural(limiteDeFaltas(carga), 'falta', 'faltas')} ({plural(previa.noites, 'noite', 'noites')}).
            </Texto>
          );
        })}
      </Bloco>

      <Bloco titulo="Frequência">
        <Texto>
          A frequência mostrada é a do semestre inteiro, supondo que você vá às aulas que ainda restam. Chegar
          exatamente a {FREQUENCIA_MINIMA}% ainda é aprovação; reprova quem ultrapassa o limite.
        </Texto>
      </Bloco>

      <Bloco titulo="Alerta e lembretes">
        <Texto>
          O alerta aparece quando restarem poucas faltas. Você escolhe quantas nas Configurações. Os lembretes de provas
          e trabalhos são avisos no celular, antes do prazo.
        </Texto>
      </Bloco>

      <Bloco titulo="Importante">
        <Texto>
          O FaltaCerta é uma ferramenta de acompanhamento pessoal: os registros são feitos por você e não substituem o
          sistema oficial da instituição.
        </Texto>
        <Texto>Os dados ficam só neste celular. Se você desinstalar o app, eles são apagados.</Texto>
      </Bloco>
    </ScrollView>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={estilos.bloco}>
      <Text style={estilos.titulo} accessibilityRole="header">
        {titulo}
      </Text>
      {children}
    </View>
  );
}

function Texto({ children }: { children: React.ReactNode }) {
  return <Text style={estilos.texto}>{children}</Text>;
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, gap: 12, paddingBottom: 32 },
  bloco: { backgroundColor: cores.cartao, borderRadius: raio.lg, padding: 16, gap: 8, ...sombra },
  titulo: { fontSize: 18, fontWeight: '700', color: cores.texto },
  texto: { fontSize: 16, lineHeight: 24, color: cores.textoSuave },
});
