import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CONFIG_PADRAO, Config, Disciplina, Falta } from '../domain/tipos';
import * as repo from '../storage/repositorio';

type DadosContextValue = {
  carregando: boolean;
  disciplinas: Disciplina[];
  faltas: Falta[];
  config: Config;
  adicionarDisciplina: (d: Disciplina) => Promise<void>;
  adicionarFalta: (f: Falta) => Promise<void>;
};

const DadosContext = createContext<DadosContextValue | undefined>(undefined);

export function DadosProvider({ children }: { children: React.ReactNode }) {
  const [carregando, setCarregando] = useState(true);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [faltas, setFaltas] = useState<Falta[]>([]);
  const [config, setConfig] = useState<Config>(CONFIG_PADRAO);

  // Ao abrir o app, carrega tudo do celular uma única vez.
  useEffect(() => {
    (async () => {
      const [ds, fs, cfg] = await Promise.all([
        repo.listarDisciplinas(),
        repo.listarFaltas(),
        repo.lerConfig(),
      ]);
      setDisciplinas(ds);
      setFaltas(fs);
      setConfig(cfg);
      setCarregando(false);
    })();
  }, []);

  const adicionarDisciplina = useCallback(async (d: Disciplina) => {
    await repo.salvarDisciplina(d);
    setDisciplinas((atuais) => [...atuais, d]);
  }, []);

  const adicionarFalta = useCallback(async (f: Falta) => {
    await repo.registrarFalta(f);
    setFaltas((atuais) => [...atuais, f]);
  }, []);

  return (
    <DadosContext.Provider
      value={{ carregando, disciplinas, faltas, config, adicionarDisciplina, adicionarFalta }}
    >
      {children}
    </DadosContext.Provider>
  );
}

export function useDados(): DadosContextValue {
  const ctx = useContext(DadosContext);
  if (!ctx) throw new Error('useDados deve ser usado dentro de DadosProvider');
  return ctx;
}