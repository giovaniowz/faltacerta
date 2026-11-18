import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatarPercentual, frequenciaDe } from '../domain/frequencia';
import { rotuloStatus } from '../domain/textos';
import { Disciplina, Resumo } from '../domain/tipos';
import { cores } from '../theme/cores';
import { raio, sombra } from '../theme/tema';
import BarraProgresso from './BarraProgresso';
import { iconeStatus } from './icones';

type Props = {
  disciplina: Disciplina;
  resumo: Resumo;
  onAbrir: () => void;
  onRegistrarFalta: () => void;
};

// Cartão compacto: o número que importa (faltas restantes) em destaque, a barra de uso do limite
// e o atalho para registrar uma falta sem abrir a disciplina.
export default function CartaoDisciplina({ disciplina, resumo, onAbrir, onRegistrarFalta }: Props) {
  const paleta = cores.status[resumo.status];
  // Com limite 0 a barra já aparece cheia.
  const proporcao = resumo.limite > 0 ? resumo.faltasRegistradas / resumo.limite : 1;
  const restantes = Math.max(0, resumo.faltasRestantes);

  return (
    <View style={estilos.cartao}>
      <Pressable
        onPress={onAbrir}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${disciplina.nome}`}
        style={({ pressed }) => [estilos.area, pressed && estilos.pressionado]}
      >
        <View style={estilos.topo}>
          <View style={[estilos.icone, { backgroundColor: paleta.fundo }]}>
            <Ionicons name={iconeStatus(resumo.status)} size={24} color={paleta.texto} />
          </View>
          <View style={estilos.titulos}>
            <Text style={estilos.nome} numberOfLines={2}>
              {disciplina.nome}
            </Text>
            {disciplina.professor ? (
              <Text style={estilos.professor} numberOfLines={1}>
                {disciplina.professor}
              </Text>
            ) : null}
          </View>
          <View style={estilos.restantes} accessible accessibilityLabel={`${restantes} faltas restantes`}>
            <Text style={[estilos.numero, { color: paleta.texto }]} maxFontSizeMultiplier={1.3}>
              {restantes}
            </Text>
            <Text style={estilos.legenda}>{restantes === 1 ? 'restante' : 'restantes'}</Text>
          </View>
        </View>

        <BarraProgresso proporcao={proporcao} cor={paleta.forte} />

        <View style={estilos.linhaInfo}>
          <Text style={estilos.contagem}>
            {resumo.faltasRegistradas} / {resumo.limite} faltas
          </Text>
          <Text style={estilos.frequencia}>
            Frequência {formatarPercentual(frequenciaDe(disciplina.cargaHoraria, resumo.faltasRegistradas))}
          </Text>
        </View>
      </Pressable>

      <View style={estilos.rodape}>
        <View style={[estilos.etiqueta, { backgroundColor: paleta.fundo }]}>
          <Text style={[estilos.textoEtiqueta, { color: paleta.texto }]}>{rotuloStatus(resumo.status)}</Text>
        </View>
        <Pressable
          onPress={onRegistrarFalta}
          accessibilityRole="button"
          accessibilityLabel={`Registrar falta em ${disciplina.nome}`}
          style={({ pressed }) => [estilos.acao, pressed && estilos.pressionado]}
        >
          <Ionicons name="add" size={20} color={cores.primaria} />
          <Text style={estilos.textoAcao}>Falta</Text>
        </Pressable>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: { backgroundColor: cores.cartao, borderRadius: raio.lg, padding: 16, marginBottom: 12, gap: 12, ...sombra },
  area: { gap: 12 },
  pressionado: { opacity: 0.7 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icone: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  titulos: { flex: 1 },
  nome: { fontSize: 18, fontWeight: '700', color: cores.texto },
  professor: { fontSize: 14, color: cores.textoSuave, marginTop: 2 },
  restantes: { alignItems: 'center', minWidth: 52 },
  numero: { fontSize: 30, fontWeight: '800', lineHeight: 34 },
  legenda: { fontSize: 13, color: cores.textoSuave },
  linhaInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  contagem: { fontSize: 15, fontWeight: '600', color: cores.texto },
  frequencia: { fontSize: 14, color: cores.textoSuave },
  rodape: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  etiqueta: { borderRadius: raio.pilula, paddingHorizontal: 12, paddingVertical: 6 },
  textoEtiqueta: { fontSize: 14, fontWeight: '700' },
  acao: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    borderRadius: raio.pilula,
    backgroundColor: cores.primariaSuave,
  },
  textoAcao: { fontSize: 16, fontWeight: '700', color: cores.primaria },
});
