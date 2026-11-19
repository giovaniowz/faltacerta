# FaltaCerta – revisão do código e nova interface

Copiem por cima do repositório, mantendo as pastas: `src/`, `App.tsx`, `app.json` e `assets/`.
**Não há dependências novas** e o `package.json` não muda. Não precisa de `npm install` extra.

Antes de trocar o código atual por este, **testem no celular** (roteiro abaixo). A versão que está no GitHub continua funcionando; este pacote só deve entrar se passar no roteiro.

## O que a revisão de código achou e corrigiu

| Problema | Correção |
|---|---|
| Nomes da barra de abas cortados embaixo (o item não tinha altura para ícone e rótulo) | Altura própria da barra, somada à área segura do aparelho |
| "Hoje" e "Amanhã" ficavam errados se o app ficasse aberto de um dia para o outro | `state/useHoje.ts`: atualiza na virada da meia-noite e ao voltar para o app |
| Se a leitura dos dados falhasse, o app ficava na tela de espera para sempre | Tratamento de erro no carregamento inicial |
| Dava para registrar a mesma noite duas vezes sem aviso | Pergunta "Já existe uma falta neste dia. Registrar mesmo assim?" |
| Dava para cadastrar duas disciplinas com o mesmo nome | Erro "Já existe uma disciplina com esse nome." (ignora maiúsculas e acentos) |
| Teclado podia cobrir campos nos formulários (iPhone) | `automaticallyAdjustKeyboardInsets` |
| Nome do app em minúsculas; ícone padrão do Expo | Nome "FaltaCerta" e ícone novo (azul com "ok") |

Sem código morto: só importações do `React` sobrando, sem efeito.

## O que mudou na interface

- **Início:** cartão de resumo (saudação, data e a mensagem principal, como "3 disciplinas precisam de atenção, 1 prazo atrasado"), botões **Registrar falta** e **Novo prazo**, cartões compactos com o número de faltas restantes em destaque.
- **Registrar falta:** atalhos **Hoje** e **Ontem**, escolha da disciplina na própria tela (o atalho do Início chega a 3 toques) e prévia "Depois deste registro, restarão N faltas".
- **Disciplinas e Prazos:** botão flutuante no lugar da barra larga; prazos com data curta e dia da semana ("qua, 18/11") e etiqueta de lembrete.
- **Detalhe da disciplina:** resumo primeiro (números grandes, barra de uso do limite, etiquetas, alerta) e o botão de registrar falta logo abaixo.
- **Formulários:** carga horária com 30h, 45h, 60h e 80h; aulas por noite em botões de 1 a 6; prazo com Hoje, Amanhã e Em 1 semana.
- **Configurações:** "Modo demonstração" recolhido (toque para abrir).
- **Barra de abas e cabeçalho:** rótulos completos e marca do app.

Nada do cálculo de faltas mudou.

## O que foi verificado (e o que não foi)

- ✅ `npx tsc --noEmit` sem erros e `npx jest` com **190 testes** passando (regras, armazenamento, fila, lembretes e as regras novas).
- ✅ Um teste que renderiza o app inteiro e simula **40 cenários** passou (`opcional/fluxo.test.tsx`).
- ✅ Os pacotes JavaScript de **Android e iOS** foram gerados.
- ✅ Revisei o visual de cada tela em capturas feitas **numa versão web do app**, com os recursos nativos simulados. Isso mostra o layout, mas **não substitui o celular**.
- ⚠️ **Não vi o app num aparelho real.** Pontos que só o celular mostra: o calendário do Android, o toque dos botões, o teclado e a notificação.

## Roteiro de teste no celular (10 minutos)

1. Abrir o app: o **Início** mostra o cartão azul com o resumo. A barra de abas mostra os 3 nomes inteiros.
2. Toque em **Registrar falta** no Início: escolha a disciplina, veja a **prévia** e confirme (3 toques).
3. Em **Disciplinas**, o botão "Falta" de cada cartão abre o registro já com a disciplina.
4. Registre uma falta com **Hoje** e outra com **Ontem**; o histórico mostra o dia da semana.
5. Tente registrar duas faltas no mesmo dia: o app **pergunta** antes.
6. Cadastre uma disciplina com nome repetido: aparece o erro. Use os botões **45h** e **4 aulas** e confira a prévia do limite.
7. Em **Prazos**, cadastre um prazo com **Em 1 semana** e confira a data curta e o sininho de lembrete.
8. Abra a disciplina: o resumo e o botão **Registrar falta** aparecem antes do "Posso faltar?".
9. Configurações > **Modo demonstração** (toque para abrir) > carregar dados de exemplo.
10. Feche o app por completo e abra de novo: os dados continuam.
11. **Android:** o calendário abre ao tocar na data e não deixa escolher data futura na falta.
12. **Texto grande:** com a fonte do sistema no máximo, os números e botões continuam legíveis.

## Para o teste de fluxo opcional

`opcional/fluxo.test.tsx` precisa de bibliotecas que o projeto não tem:
`npm install --save-dev @testing-library/react-native react-test-renderer@19.3.0`.
Copie para `src/__smoke__/fluxo.test.tsx` e rode `npx jest src/__smoke__`.

## Commits sugeridos (um só efeito por commit)

```bash
git add src/domain src/state src/theme
git commit -m "Revisão: data de hoje que se atualiza, avisos de duplicidade e carregamento seguro"

git add App.tsx app.json assets src
git commit -m "Nova interface: resumo no início, atalhos, formulários mais rápidos e ícone"
```
