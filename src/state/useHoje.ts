import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { hojeISO } from '../domain/datas';

// A data de hoje (AAAA-MM-DD) que se atualiza sozinha: ao voltar para o app e na virada da meia-noite.
// Sem isso, deixar o app aberto de um dia para o outro mostraria "Hoje" e "Amanhã" errados.
export function useHoje(): string {
  const [hoje, setHoje] = useState(() => hojeISO());

  useEffect(() => {
    const atualizar = () => setHoje(hojeISO());
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') atualizar();
    });

    let temporizador: ReturnType<typeof setTimeout>;
    const agendar = () => {
      const agora = new Date();
      const viradaDoDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1, 0, 0, 1);
      temporizador = setTimeout(() => {
        atualizar();
        agendar();
      }, viradaDoDia.getTime() - agora.getTime());
    };
    agendar();

    return () => {
      assinatura.remove();
      clearTimeout(temporizador);
    };
  }, []);

  return hoje;
}
