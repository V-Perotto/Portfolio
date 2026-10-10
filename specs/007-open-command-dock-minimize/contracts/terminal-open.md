# Contract: comando `open` do terminal da dock

**Feature**: `007-open-command-dock-minimize` | FR-001 a FR-009 | Motor puro em `src/lib/terminal.ts`;
alvos em `openTargets(resume)` (`src/lib/sections.ts`); abertura em `openWindow` (`src/lib/windows.ts`)

Estende o contrato da 004 (`specs/004-dock-windows-crt/contracts/terminal-commands.md`): o que não está
aqui (prompt, `find`, `clear`, `exit`, histórico, acessibilidade do terminal) continua como lá. Os
textos de saída são a referência dos testes.

## Gramática

```text
linha    := espaço* (comando (espaço+ argumento)*)? espaço*
comando  := "help" | "find" | "open" | "clear" | "exit"     (sem diferenciar maiúsculas)
```

Argumentos depois do primeiro são ignorados (`open srg foo` = `open srg`).

## Opções do `open`

`openTargets(resume)`, na ordem da página (hoje, 9):

```text
experiencia | srg | temas-vs-code | italiami | ocr-de-prontuarios | qclass-bot | monitor-de-curso | challenges | comunitario
```

**Reconhecimento**: `normalizeOption(arg)` (o do `find`: minúsculas, sem acentos, sem `~/` ou `/` no
começo, sem `/` no fim) comparado, em cada alvo, com o `name` e com o `alias` (o caminho sem `~/`):

| Digitado | Alvo |
|----------|------|
| `italiami`, `ItaliaMi`, `~/projetos/italiami`, `projetos/italiami/` | ItaliaMi (abre) |
| `experiencia`, `Experiência`, `~/carreira`, `carreira` | Experiência (maximiza) |
| `challenges`, `~/projetos/challenges` | Challenges (maximiza) |
| `comunitario`, `Comunitário`, `~/projetos/comunitario` | Comunitário (maximiza) |

## Respostas

| Entrada | Saída | Efeito |
|---------|-------|--------|
| `open <projeto>` | `→ ~/projetos/<projeto>` | terminal minimiza (sem levar o foco à dock); a janela reabre se estava minimizada (completa) ou fechada (digita de novo); a página rola até ela (barra de título logo abaixo do header; suave só com movimento; não rola se já estiver assim); foco no `−` da janela |
| `open experiencia` / `challenges` / `comunitario` | `→ ~/carreira` / `→ ~/projetos/challenges` / `→ ~/projetos/comunitario` | terminal minimiza; a página rola até a janela de editor sem animação; ela reabre já completa se estava minimizada ou fechada; maximiza (006: FLIP ≤ 400 ms, diálogo modal, foco no `□`, item aberto mantido e cartões nele) |
| `open` | `uso: open <OPTIONS>` + `OPTIONS: experiencia \| srg \| … \| comunitario` | nenhum; terminal aberto, foco no prompt |
| `open <seção que não é opção>` (`sobre`, `skills`, `projetos`, `educacao`, `contato`) | `open: '<texto digitado>': essa seção não abre com o open. Use: find <seção>` | nenhum |
| `open <outro>` | `open: '<texto digitado>': não encontrado` + `OPTIONS: …` + `Digite help para ver os comandos.` | nenhum |

`<seção>` na sugestão é o id normalizado (`open Educação` → `Use: find educacao`).

Depois de restaurar a janela de editor (Esc, `□`, clique fora), o foco fica no `□` (006 FR-017) e o
terminal continua minimizado; a dock ou o Ctrl+Alt+T o restauram com a sessão, onde estão o comando
`open` e a saída dele.

## Bloco do `help`

```text
Comandos disponíveis:
  help             mostra esta ajuda
  find <OPTIONS>   busca uma seção e leva a página até ela
  open <OPTIONS>   abre uma janela e leva a página até ela
  clear            limpa o terminal
  exit             fecha o terminal

find <OPTIONS>
  OPTIONS: sobre | experiencia | skills | projetos | educacao | contato
  exemplo: find projetos

open <OPTIONS>
  projetos abrem; experiencia, challenges e comunitario abrem maximizados
  OPTIONS: experiencia | srg | temas-vs-code | italiami | ocr-de-prontuarios | qclass-bot | monitor-de-curso | challenges | comunitario
  exemplo: open srg

Tab completa comandos e opções; ↑ e ↓ percorrem os comandos já digitados.
```

O exemplo é o primeiro projeto da lista; sem projetos, a primeira opção. Sem nenhuma opção (currículo
sem experiência, projetos, challenges nem comunitário), o bloco do `open` e a linha dele no `help`
somem, e `open` responde como comando desconhecido.

## Autocompletar

As regras da 004 valem para o `open` como para o `find`:

| Linha | Tab | Candidatos |
|-------|-----|------------|
| `o` | `open ` | `open` |
| `open it` | `open italiami` | `italiami` |
| `open c` | `open c` (sem mudar) | `challenges  comunitario` (listados na saída) |
| `open qc` | `open qclass-bot` | `qclass-bot` |
| `open ` | `open ` (sem mudar) | as 9 opções (listadas na saída) |
| `open xyz` | sem mudança | nenhum |

O texto fantasma, a seta → e as sugestões tocáveis seguem a 004. Os apelidos (`carreira`,
`projetos/…`) são aceitos, mas não são candidatos.

## Teclado e foco

| Situação | Foco |
|----------|------|
| `open` com erro | prompt (terminal aberto) |
| `open <projeto>` | `−` da janela do projeto |
| `open <editor>` | `□` da janela maximizada (dentro do diálogo) |
| restaurar o editor maximizado pelo `open` | `□` da janela, na página |
