import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Camada fina sobre o expo-notifications. O resto do app só conhece esta interface,
// o que permite testar tudo com um serviço de mentira.
export type PermissaoNotificacoes = 'concedida' | 'negada' | 'indefinida';

export type ServicoNotificacoes = {
  permissao(): Promise<PermissaoNotificacoes>;
  pedirPermissao(): Promise<PermissaoNotificacoes>;
  agendar(titulo: string, corpo: string, quando: Date): Promise<string>;
  cancelar(id: string): Promise<void>;
  idsAgendados(): Promise<string[]>;
};

const CANAL_ANDROID = 'prazos';
let configurado = false;

// Mostra o aviso mesmo com o app aberto e cria o canal do Android (obrigatório no Android 8+,
// e precisa existir antes de pedir a permissão no Android 13+).
async function configurar(): Promise<void> {
  if (configurado) return;
  configurado = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL_ANDROID, {
      name: 'Prazos de provas e trabalhos',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

function traduzir(p: Notifications.NotificationPermissionsStatus): PermissaoNotificacoes {
  if (p.granted) return 'concedida';
  return p.status === Notifications.PermissionStatus.UNDETERMINED ? 'indefinida' : 'negada';
}

export const servicoExpo: ServicoNotificacoes = {
  async permissao() {
    await configurar();
    return traduzir(await Notifications.getPermissionsAsync());
  },
  async pedirPermissao() {
    await configurar();
    return traduzir(await Notifications.requestPermissionsAsync());
  },
  async agendar(titulo, corpo, quando) {
    await configurar();
    return Notifications.scheduleNotificationAsync({
      content: { title: titulo, body: corpo },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: quando,
        channelId: CANAL_ANDROID,
      },
    });
  },
  async cancelar(id) {
    await Notifications.cancelScheduledNotificationAsync(id);
  },
  async idsAgendados() {
    const todas = await Notifications.getAllScheduledNotificationsAsync();
    return todas.map((n) => n.identifier);
  },
};
