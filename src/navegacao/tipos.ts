import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AbasParamList = {
  Inicio: undefined;
  Disciplinas: undefined;
  Prazos: undefined;
};

export type RootStackParamList = {
  Abas: NavigatorScreenParams<AbasParamList> | undefined;
  CadastroDisciplina: { disciplinaId?: string } | undefined;
  DetalheDisciplina: { disciplinaId: string };
  RegistrarFalta: { disciplinaId: string; faltaId?: string };
  CadastroCompromisso: { compromissoId?: string; disciplinaId?: string } | undefined;
  Configuracoes: undefined;
};

export type PilhaProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

// Telas das abas também podem navegar para as telas da pilha.
export type AbaProps<T extends keyof AbasParamList> = CompositeScreenProps<
  BottomTabScreenProps<AbasParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
