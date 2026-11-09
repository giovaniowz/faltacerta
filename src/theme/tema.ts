import { Platform, ViewStyle } from 'react-native';

export const espaco = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const raio = { sm: 8, md: 12, lg: 16, pilula: 999 } as const;

// Sombra leve para cartões (iOS usa shadow*, Android usa elevation).
export const sombra: ViewStyle =
  Platform.select<ViewStyle>({
    ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
    default: { elevation: 2 },
  }) ?? {};
