import { StyleSheet, Text, View } from 'react-native';
import { formatarPercentual, frequenciaDe, FREQUENCIA_MINIMA } from '../domain/frequencia';
import { plural } from '../domain/textos';
import { Disciplina, Resumo } from '../domain/tipos';
import { cores } from '../theme/cores';
import { raio, sombra } from '../theme/tema';
import BannerStatus from './BannerStatus';
import BarraProgresso from './BarraProgresso';
import Chip from './Chip';

type Props = { disciplina: Disciplina; resumo: Resumo };

// Cabeçalho da tela da disciplina: quanto ainda pode faltar, quanto do limite já foi usado,
// os dados da disciplina em etiquetas e o estado (alerta) em destaque.
export default function ResumoDisciplina({ disciplina, resumo }: Props) {
  const paleta = cores.status[resumo.status];
  const restantes = Math.max(0, resumo.faltasRestantes);
  const proporcao = resumo.limite > 0 ? resumo.faltasRegistradas / resumo.limite : 1;
  const frequencia = frequenciaDe(disciplina.cargaHoraria, resumo.faltasRegistradas);

  return (
    <View style={estilos.cartao}>
      <View style={estilos.destaques}>
        <View style={estilos.destaque}>
          <Text style={[estilos.numeroGrande, { color: paleta.texto }]} maxFontSizeMultiplier={1.2}>
            {restantes}
          </Text>
          <Text style={estilos.legenda}>{restantes === 1 ? 'falta restante' : 'faltas restantes'}</Text>
        </View>
        <View style={estilos.divisor} />
        <View style={estilos.destaque}>
          <Text style={estilos.numeroGrande} maxFontSizeMultiplier={1.2}>
            {resumo.noitesRestantes}
          </Text>
          <Text style={estilos.legenda}>{resumo.noitesRestantes === 1 ? 'noite restante' : 'noites restantes'}</Text>
        </View>
      </View>

      <View style={estilos.uso}>
        <BarraProgresso proporcao={proporcao} cor={paleta.forte} altura={12} />
        <Text style={estilos.textoUso}>
          {resumo.faltasRegistradas} de {plural(resumo.limite, 'falta', 'faltas')} do limite usadas
        </Text>
      </View>

      <View style={estilos.chips}>
        <Chip icone="time-outline" texto={`Carga ${disciplina.cargaHoraria}h`} />
        <Chip icone="moon-outline" texto={`${disciplina.aulasPorNoite} aulas por noite`} />
        <Chip
          icone="pie-chart-outline"
          texto={`Frequência ${formatarPercentual(frequencia)} (mín. ${FREQUENCIA_MINIMA}%)`}
        />
      </View>

      <BannerStatus resumo={resumo} />
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: { backgroundColor: cores.cartao, borderRadius: raio.lg, padding: 16, gap: 16, ...sombra },
  destaques: { flexDirection: 'row', alignItems: 'center' },
  destaque: { flex: 1, alignItems: 'center' },
  divisor: { width: 1, alignSelf: 'stretch', backgroundColor: cores.borda },
  numeroGrande: { fontSize: 52, fontWeight: '800', lineHeight: 58, color: cores.texto },
  legenda: { fontSize: 16, color: cores.textoSuave },
  uso: { gap: 8 },
  textoUso: { fontSize: 14, color: cores.textoSuave, textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
