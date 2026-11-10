import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { hojeISO } from '../domain/datas';
import { gerarDadosDeExemplo } from '../domain/exemplos';
import { CONFIG_PADRAO, Compromisso, Config, Disciplina, Falta } from '../domain/tipos';
import { PermissaoNotificacoes, ServicoNotificacoes, servicoExpo } from '../notificacoes/servico';
import * as repo from '../storage/repositorio';
import { criarFila } from './fila';
import { sincronizarLembretes } from './sincronizar';

type DadosContextValue = {
  carregando: boolean;
  disciplinas: Disciplina[];
  faltas: Falta[];
  compromissos: Compromisso[];
  config: Config;
  permissaoNotificacoes: PermissaoNotificacoes;
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
  pedirPermissaoNotificacoes: () => Promise<void>;
  carregarDadosDeExemplo: () => Promise<void>;
  apagarTudo: () => Promise<void>;
};

const DadosContext = createContext<DadosContextValue | undefined>(undefined);

type Props = { children: React.ReactNode; servico?: ServicoNotificacoes };

export function DadosProvider({ children, servico = servicoExpo }: Props) {
  const [carregando, setCarregando] = useState(true);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [faltas, setFaltas] = useState<Falta[]>([]);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [config, setConfig] = useState<Config>(CONFIG_PADRAO);
  const [permissaoNotificacoes, setPermissao] = useState<PermissaoNotificacoes>('indefinida');

  // Todas as operações que leem e gravam no celular passam por esta fila, uma de cada vez.
  // Sem isso, duas ações rápidas poderiam ler a mesma lista e uma apagar a gravação da outra.
  const { enfileirar } = useRef(criarFila()).current;

  // Alinha os avisos agendados com os prazos e a configuração. Nunca derruba o app:
  // se algo falhar, o uso normal continua sem os lembretes.
  const sincronizar = useCallback(
    async (pedirPermissao: boolean) => {
      try {
        const r = await sincronizarLembretes(servico, { pedirPermissao });
        setPermissao(r.permissao);
        setCompromissos(r.compromissos);
      } catch {
        // sem lembretes por enquanto
      }
    },
    [servico]
  );

  // Ao abrir o app, carrega tudo do celular e confere os avisos agendados.
  useEffect(() => {
    enfileirar(async () => {
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
      await sincronizar(false);
    });
  }, [enfileirar, sincronizar]);

  // Cada operação grava no celular primeiro e só então atualiza a tela,
  // usando o que o repositório devolve (fonte única da verdade).
  const adicionarDisciplina = useCallback(
    (d: Disciplina) => enfileirar(async () => setDisciplinas(await repo.salvarDisciplina(d))),
    [enfileirar]
  );
  const atualizarDisciplina = useCallback(
    (d: Disciplina) => enfileirar(async () => setDisciplinas(await repo.atualizarDisciplina(d))),
    [enfileirar]
  );
  const removerDisciplina = useCallback(
    (id: string) =>
      enfileirar(async () => {
        const novos = await repo.removerDisciplina(id);
        setDisciplinas(novos.disciplinas);
        setFaltas(novos.faltas);
        setCompromissos(novos.compromissos);
        await sincronizar(false);
      }),
    [enfileirar, sincronizar]
  );

  const adicionarFalta = useCallback(
    (f: Falta) => enfileirar(async () => setFaltas(await repo.registrarFalta(f))),
    [enfileirar]
  );
  const atualizarFalta = useCallback(
    (f: Falta) => enfileirar(async () => setFaltas(await repo.atualizarFalta(f))),
    [enfileirar]
  );
  const removerFalta = useCallback(
    (id: string) => enfileirar(async () => setFaltas(await repo.removerFalta(id))),
    [enfileirar]
  );

  const adicionarCompromisso = useCallback(
    (c: Compromisso) =>
      enfileirar(async () => {
        setCompromissos(await repo.salvarCompromisso(c));
        await sincronizar(true);
      }),
    [enfileirar, sincronizar]
  );
  const atualizarCompromisso = useCallback(
    (c: Compromisso) =>
      enfileirar(async () => {
        setCompromissos(await repo.atualizarCompromisso(c));
        await sincronizar(true);
      }),
    [enfileirar, sincronizar]
  );
  const removerCompromisso = useCallback(
    (id: string) =>
      enfileirar(async () => {
        setCompromissos(await repo.removerCompromisso(id));
        await sincronizar(false);
      }),
    [enfileirar, sincronizar]
  );

  const salvarConfig = useCallback(
    (c: Config) =>
      enfileirar(async () => {
        setConfig(await repo.salvarConfig(c));
        await sincronizar(true);
      }),
    [enfileirar, sincronizar]
  );

  const pedirPermissaoNotificacoes = useCallback(
    () =>
      enfileirar(async () => {
        setPermissao(await servico.pedirPermissao());
        await sincronizar(false);
      }),
    [enfileirar, servico, sincronizar]
  );

  const aplicarDados = useCallback(
    (dados: repo.DadosCompletos) => {
      setDisciplinas(dados.disciplinas);
      setFaltas(dados.faltas);
      setCompromissos(dados.compromissos);
    },
    []
  );

  const carregarDadosDeExemplo = useCallback(
    () =>
      enfileirar(async () => {
        aplicarDados(await repo.substituirTudo(gerarDadosDeExemplo(hojeISO())));
        await sincronizar(false);
      }),
    [enfileirar, aplicarDados, sincronizar]
  );

  const apagarTudo = useCallback(
    () =>
      enfileirar(async () => {
        aplicarDados(await repo.apagarTudo());
        await sincronizar(false);
      }),
    [enfileirar, aplicarDados, sincronizar]
  );

  const valor = useMemo(
    () => ({
      carregando,
      disciplinas,
      faltas,
      compromissos,
      config,
      permissaoNotificacoes,
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
      pedirPermissaoNotificacoes,
      carregarDadosDeExemplo,
      apagarTudo,
    }),
    [
      carregando,
      disciplinas,
      faltas,
      compromissos,
      config,
      permissaoNotificacoes,
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
      pedirPermissaoNotificacoes,
      carregarDadosDeExemplo,
      apagarTudo,
    ]
  );

  return <DadosContext.Provider value={valor}>{children}</DadosContext.Provider>;
}

export function useDados(): DadosContextValue {
  const ctx = useContext(DadosContext);
  if (!ctx) throw new Error('useDados deve ser usado dentro de DadosProvider');
  return ctx;
}
