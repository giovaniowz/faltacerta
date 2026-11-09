export const cores = {
  fundo: '#F3F5FA',
  cartao: '#FFFFFF',
  texto: '#111827',
  textoSuave: '#4B5563',
  primaria: '#1F4FD8',
  primariaSuave: '#E6ECFD',
  borda: '#DCE1EA',
  perigo: '#B91C1C',
  perigoSuave: '#FDE8E8',
  // fundo e texto formam pares com bom contraste; "forte" serve para barras e ícones.
  status: {
    ok: { fundo: '#DFF3E3', texto: '#14532D', forte: '#16A34A' },
    alerta: { fundo: '#FFF1B8', texto: '#6B4E00', forte: '#CA8A04' },
    limite: { fundo: '#FFD9B0', texto: '#7A3200', forte: '#EA580C' },
    excedido: { fundo: '#FAD4D4', texto: '#7F1D1D', forte: '#DC2626' },
  },
  urgencia: {
    atrasado: { fundo: '#FAD4D4', texto: '#7F1D1D' },
    hoje: { fundo: '#FFD9B0', texto: '#7A3200' },
    breve: { fundo: '#FFF1B8', texto: '#6B4E00' },
    normal: { fundo: '#E6ECFD', texto: '#1E3A8A' },
    concluido: { fundo: '#E5E7EB', texto: '#374151' },
  },
};
