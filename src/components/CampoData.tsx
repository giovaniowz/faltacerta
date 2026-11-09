import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatarDataBR, hojeISO, paraDataISO } from '../domain/datas';
import { cores } from '../theme/cores';
import { raio } from '../theme/tema';

type Props = {
  rotulo: string;
  valor: Date;
  onChange: (data: Date) => void;
  minimo?: Date;
  maximo?: Date;
};

// Seletor de data: calendário nativo no Android e seletor compacto no iOS.
export default function CampoData({ rotulo, valor, onChange, minimo, maximo }: Props) {
  const iso = paraDataISO(valor);
  const ehHoje = iso === hojeISO();

  function abrirAndroid() {
    DateTimePickerAndroid.open({
      value: valor,
      mode: 'date',
      minimumDate: minimo,
      maximumDate: maximo,
      onValueChange: (_evento, selecionada) => onChange(selecionada),
    });
  }

  return (
    <View style={estilos.bloco}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      {Platform.OS === 'android' ? (
        <Pressable
          onPress={abrirAndroid}
          accessibilityRole="button"
          accessibilityLabel={`${rotulo}: ${formatarDataBR(iso)}. Toque para alterar`}
          style={estilos.campo}
        >
          <Ionicons name="calendar-outline" size={22} color={cores.primaria} />
          <Text style={estilos.texto}>
            {formatarDataBR(iso)}
            {ehHoje ? ' (hoje)' : ''}
          </Text>
        </Pressable>
      ) : (
        <DateTimePicker
          value={valor}
          mode="date"
          display="compact"
          minimumDate={minimo}
          maximumDate={maximo}
          onValueChange={(_evento, selecionada) => onChange(selecionada)}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  bloco: { gap: 8 },
  rotulo: { fontSize: 16, fontWeight: '600', color: cores.texto },
  campo: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.md,
    paddingHorizontal: 14,
    backgroundColor: cores.cartao,
  },
  texto: { fontSize: 16, color: cores.texto },
});
