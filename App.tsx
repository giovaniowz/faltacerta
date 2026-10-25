import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DadosProvider, useDados } from './src/state/DadosContext';
import ListaDisciplinas from './src/screens/ListaDisciplinas';
import CadastroDisciplina from './src/screens/CadastroDisciplina';
import DetalheDisciplina from './src/screens/DetalheDisciplina';
import RegistrarFalta from './src/screens/RegistrarFalta';

export type RootStackParamList = {
  ListaDisciplinas: undefined;
  CadastroDisciplina: undefined;
  DetalheDisciplina: { disciplinaId: string };
  RegistrarFalta: { disciplinaId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function Rotas() {
  const { carregando } = useDados();

  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ListaDisciplinas">
        <Stack.Screen
          name="ListaDisciplinas"
          component={ListaDisciplinas}
          options={{ title: 'FaltaCerta' }}
        />
        <Stack.Screen
          name="CadastroDisciplina"
          component={CadastroDisciplina}
          options={{ title: 'Nova disciplina' }}
        />
        <Stack.Screen
          name="DetalheDisciplina"
          component={DetalheDisciplina}
          options={{ title: 'Disciplina' }}
        />
        <Stack.Screen
          name="RegistrarFalta"
          component={RegistrarFalta}
          options={{ title: 'Registrar falta' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <DadosProvider>
      <Rotas />
    </DadosProvider>
  );
}