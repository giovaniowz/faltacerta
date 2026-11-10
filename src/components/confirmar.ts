import { Alert } from 'react-native';

// Pede confirmação antes de uma ação importante.
export function confirmarAcao(
  titulo: string,
  mensagem: string,
  rotulo: string,
  aoConfirmar: () => void,
  destrutiva = false
): void {
  Alert.alert(titulo, mensagem, [
    { text: 'Cancelar', style: 'cancel' },
    { text: rotulo, style: destrutiva ? 'destructive' : 'default', onPress: aoConfirmar },
  ]);
}

// Pede confirmação antes de apagar algo (a ação não pode ser desfeita).
export function confirmarExclusao(titulo: string, mensagem: string, aoConfirmar: () => void): void {
  confirmarAcao(titulo, mensagem, 'Excluir', aoConfirmar, true);
}
