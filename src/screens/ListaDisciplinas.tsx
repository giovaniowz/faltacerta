import React from 'react';
import { Button, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useDados } from '../state/DadosContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ListaDisciplinas'>;

export default function ListaDisciplinas({ navigation }: Props) {
  const { disciplinas } = useDados();
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18 }}>Lista de disciplinas ({disciplinas.length})</Text>
      <Button title="+ Nova disciplina" onPress={() => navigation.navigate('CadastroDisciplina')} />
    </View>
  );
}