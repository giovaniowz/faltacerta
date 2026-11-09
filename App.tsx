import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import type { AbasParamList, RootStackParamList } from './src/navegacao/tipos';
import { DadosProvider, useDados } from './src/state/DadosContext';
import { cores } from './src/theme/cores';
import CadastroCompromisso from './src/screens/CadastroCompromisso';
import CadastroDisciplina from './src/screens/CadastroDisciplina';
import Configuracoes from './src/screens/Configuracoes';
import DetalheDisciplina from './src/screens/DetalheDisciplina';
import Inicio from './src/screens/Inicio';
import ListaDisciplinas from './src/screens/ListaDisciplinas';
import Prazos from './src/screens/Prazos';
import RegistrarFalta from './src/screens/RegistrarFalta';

export type { AbasParamList, RootStackParamList } from './src/navegacao/tipos';

const Pilha = createNativeStackNavigator<RootStackParamList>();
const Abas = createBottomTabNavigator<AbasParamList>();

const tema = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: cores.primaria,
    background: cores.fundo,
    card: cores.cartao,
    text: cores.texto,
    border: cores.borda,
  },
};

function AbasPrincipais() {
  return (
    <Abas.Navigator
      initialRouteName="Inicio"
      screenOptions={{
        headerStyle: { backgroundColor: cores.fundo },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700', color: cores.texto },
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: { backgroundColor: cores.cartao, borderTopColor: cores.borda },
        tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
      }}
    >
      <Abas.Screen
        name="Inicio"
        component={Inicio}
        options={{
          title: 'Início',
          headerTitle: 'FaltaCerta',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Abas.Screen
        name="Disciplinas"
        component={ListaDisciplinas}
        options={{
          title: 'Disciplinas',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'school' : 'school-outline'} size={size} color={color} />
          ),
        }}
      />
      <Abas.Screen
        name="Prazos"
        component={Prazos}
        options={{
          title: 'Prazos',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
          ),
        }}
      />
    </Abas.Navigator>
  );
}

function Rotas() {
  const { carregando } = useDados();

  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: cores.fundo }}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={tema}>
      <Pilha.Navigator
        initialRouteName="Abas"
        screenOptions={{
          headerStyle: { backgroundColor: cores.fundo },
          headerShadowVisible: false,
          headerTintColor: cores.primaria,
          headerTitleStyle: { fontWeight: '700', color: cores.texto },
          contentStyle: { backgroundColor: cores.fundo },
        }}
      >
        <Pilha.Screen name="Abas" component={AbasPrincipais} options={{ headerShown: false }} />
        <Pilha.Screen name="CadastroDisciplina" component={CadastroDisciplina} options={{ title: 'Nova disciplina' }} />
        <Pilha.Screen name="DetalheDisciplina" component={DetalheDisciplina} options={{ title: 'Disciplina' }} />
        <Pilha.Screen name="RegistrarFalta" component={RegistrarFalta} options={{ title: 'Registrar falta' }} />
        <Pilha.Screen name="CadastroCompromisso" component={CadastroCompromisso} options={{ title: 'Novo prazo' }} />
        <Pilha.Screen name="Configuracoes" component={Configuracoes} options={{ title: 'Configurações' }} />
      </Pilha.Navigator>
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
