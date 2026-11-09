import { Alert } from 'react-native';

// Pede confirmação antes de apagar algo (a ação não pode ser desfeita).
export function confirmarExclusao(titulo: string, mensagem: string, aoConfirmar: () => void): void {
  Alert.alert(titulo, mensagem, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: aoConfirmar },
  ]);
}
