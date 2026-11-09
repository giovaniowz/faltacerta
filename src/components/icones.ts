import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Status } from '../domain/tipos';

export type IconeNome = ComponentProps<typeof Ionicons>['name'];

export function iconeStatus(status: Status): IconeNome {
  switch (status) {
    case 'ok':
      return 'checkmark-circle';
    case 'alerta':
      return 'alert-circle';
    case 'limite':
      return 'warning';
    case 'excedido':
      return 'close-circle';
  }
}
