import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CONFIG_PADRAO, Compromisso, Config, Disciplina, Falta } from '../domain/tipos';
import * as repo from '../storage/repositorio';

type DadosContextValue = {
  carregando: boolean;
  disciplinas: Disciplina[];
  faltas: Falta[];
  compromissos: Compromisso[];
  config: Config;
  adicionarDisciplina: (d: Disciplina) => Promise<void>;
  atualizarDisciplina: (d: Disciplina) => Promise<void>;
  removerDisciplina: (id: string) => Promise<void>;
  adicionarFalta: (f: Falta) => Promise<void>;
  atualizarFalta: (f: Falta) => Promise<void>;
  removerFalta: (id: string) => Promise<void>;
  adicionarCompromisso: (c: Compromisso) => Promise<void>;
  atualizarCompromisso: (c: Compromisso) => Promise<void>;
  removerCompromisso: (id: string) => Promise<void>;
  salvarConfig: (c: Config) => Promise<void>;
};

const DadosContext = createContext<DadosContextValue | undefined>(undefined);

export function DadosProvider({ children }: { children: React.ReactNode }) {
  const [carregando, setCarregando] = useState(true);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [faltas, setFaltas] = useState<Falta[]>([]);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [config, setConfig] = useState<Config>(CONFIG_PADRAO);

  // Ao abrir o app, carrega tudo do celular uma única vez.
  useEffect(() => {
    (async () => {
      const [ds, fs, cs, cfg] = await Promise.all([
        repo.listarDisciplinas(),
        repo.listarFaltas(),
        repo.listarCompromissos(),
        repo.lerConfig(),
      ]);
      setDisciplinas(ds);
      setFaltas(fs);
      setCompromissos(cs);
      setConfig(cfg);
      setCarregando(false);
    })();
  }, []);

  // Cada operação grava no celular primeiro e só então atualiza a tela,
  // usando a lista devolvida pelo repositório (fonte única da verdade).
  const adicionarDisciplina = useCallback(async (d: Disciplina) => {
    setDisciplinas(await repo.salvarDisciplina(d));
  }, []);
  const atualizarDisciplina = useCallback(async (d: Disciplina) => {
    setDisciplinas(await repo.atualizarDisciplina(d));
  }, []);
  const removerDisciplina = useCallback(async (id: string) => {
    const novos = await repo.removerDisciplina(id);
    setDisciplinas(novos.disciplinas);
    setFaltas(novos.faltas);
    setCompromissos(novos.compromissos);
  }, []);

  const adicionarFalta = useCallback(async (f: Falta) => {
    setFaltas(await repo.registrarFalta(f));
  }, []);
  const atualizarFalta = useCallback(async (f: Falta) => {
    setFaltas(await repo.atualizarFalta(f));
  }, []);
  const removerFalta = useCallback(async (id: string) => {
    setFaltas(await repo.removerFalta(id));
  }, []);

  const adicionarCompromisso = useCallback(async (c: Compromisso) => {
    setCompromissos(await repo.salvarCompromisso(c));
  }, []);
  const atualizarCompromisso = useCallback(async (c: Compromisso) => {
    setCompromissos(await repo.atualizarCompromisso(c));
  }, []);
  const removerCompromisso = useCallback(async (id: string) => {
    setCompromissos(await repo.removerCompromisso(id));
  }, []);

  const salvarConfig = useCallback(async (c: Config) => {
    setConfig(await repo.salvarConfig(c));
  }, []);

  const valor = useMemo(
    () => ({
      carregando,
      disciplinas,
      faltas,
      compromissos,
      config,
      adicionarDisciplina,
      atualizarDisciplina,
      removerDisciplina,
      adicionarFalta,
      atualizarFalta,
      removerFalta,
      adicionarCompromisso,
      atualizarCompromisso,
      removerCompromisso,
      salvarConfig,
    }),
    [
      carregando,
      disciplinas,
      faltas,
      compromissos,
      config,
      adicionarDisciplina,
      atualizarDisciplina,
      removerDisciplina,
      adicionarFalta,
      atualizarFalta,
      removerFalta,
      adicionarCompromisso,
      atualizarCompromisso,
      removerCompromisso,
      salvarConfig,
    ]
  );

  return <DadosContext.Provider value={valor}>{children}</DadosContext.Provider>;
}

export function useDados(): DadosContextValue {
  const ctx = useContext(DadosContext);
  if (!ctx) throw new Error('useDados deve ser usado dentro de DadosProvider');
  return ctx;
}
