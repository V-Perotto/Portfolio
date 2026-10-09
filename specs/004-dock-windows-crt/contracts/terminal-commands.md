# Contract: terminal da dock (comandos, autocompletar e teclado)

**Feature**: `004-dock-windows-crt` | FR-017 a FR-027 | Motor puro em `src/lib/terminal.ts`

O terminal só existe com JavaScript, depois do boot. Este contrato define o que o visitante pode
digitar e o que recebe de volta. Os textos de saída são a referência para os testes (Vitest no motor,
Playwright na página).

## Prompt

```text
viper@portfolio:~$ ▊
```

O prompt usa as classes de cor de sempre (`prompt-user`, `prompt-at`, `prompt-host`, `prompt-colon`,
`prompt-path`, `prompt-dollar`), e o `▊` pisca na posição do cursor de texto. Cada comando executado
fica na saída como `viper@portfolio:~$ <comando>`, seguido da resposta.

## Gramática

```text
linha    := espaço* (comando (espaço+ argumento)*)? espaço*
comando  := "help" | "find" | "clear" | "exit"         (sem diferenciar maiúsculas)
```

Argumentos a mais nos comandos que não os usam são ignorados (`help foo` = `help`).

## Opções do `find`

As seções visíveis da página, na ordem do menu (`visibleSections(resume)`): `sobre`, `experiencia`,
`skills`, `projetos`, `educacao` e `contato`. Uma seção sem conteúdo (coleção vazia) não aparece no
menu nem é opção.

**Normalização** da opção digitada (`normalizeOption`): minúsculas → sem acentos (NFD sem marcas
combinantes) → sem prefixo `~/` ou `/` → sem `/` no fim. Exemplos: `Experiência` → `experiencia`,
`~/projetos` → `projetos`, `SKILLS/` → `skills`.

## Comandos e respostas

| Entrada | Saída | Efeito |
|---------|-------|--------|
| *(linha vazia)* | nenhuma | novo prompt |
| `help` | bloco de ajuda (abaixo) | — |
| `find <opção válida>` | `→ ~/<id>` | rola até `#<id>` (topo da seção abaixo do header; suave só com movimento) e troca o hash com `history.replaceState`; terminal continua aberto, foco no prompt |
| `find` | `uso: find <OPTIONS>` + linha `OPTIONS: sobre \| experiencia \| skills \| projetos \| educacao \| contato` | — |
| `find <opção inválida>` | `find: '<texto digitado>': seção não encontrada` + a linha `OPTIONS: …` + `Digite help para ver os comandos.` | — |
| `clear` | — | limpa a saída |
| `exit` | — | fecha o terminal (desce até a dock), foco no botão da dock |
| `<outro>` | `<outro>: comando não encontrado. Digite help para ver os comandos.` | — |

Bloco do `help`:

```text
Comandos disponíveis:
  help             mostra esta ajuda
  find <OPTIONS>   busca uma seção e leva a página até ela
  clear            limpa o terminal
  exit             fecha o terminal

find <OPTIONS>
  OPTIONS: sobre | experiencia | skills | projetos | educacao | contato
  exemplo: find projetos

Tab completa comandos e opções; ↑ e ↓ percorrem os comandos já digitados.
```

## Autocompletar (`complete(linha, opções)`)

- **Primeira palavra**: candidatos são os comandos que começam com o texto digitado.
- **Depois de `find `**: candidatos são as opções que começam com a opção normalizada.
- **Um candidato**: a conclusão é a linha com a palavra completa e, para `find`, um espaço no fim
  (`fi` → `find `; `find pro` → `find projetos`). O que falta aparece em cinza depois do cursor
  (texto fantasma). **Tab** ou **→** (com o cursor no fim) aceitam.
- **Vários candidatos**: o Tab completa o prefixo comum e escreve os candidatos na saída, separados
  por dois espaços (como o bash). Ex.: `find e` + Tab → `experiencia  educacao`.
- **Nenhum candidato**: o Tab não faz nada.
- **Toque**: enquanto houver candidatos para a palavra atual (linha não vazia), eles aparecem como
  botões sob o prompt; tocar aplica a conclusão e devolve o foco ao prompt.

## Teclado

| Tecla | Onde | Efeito |
|-------|------|--------|
| Ctrl+Alt+T | página inteira (depois do boot) | abre ou fecha o terminal (`code === 'KeyT'`, com `preventDefault`) |
| Enter | prompt | executa a linha |
| Tab | prompt | autocompleta (o foco não sai do prompt; Shift+Tab continua saindo para trás) |
| → | prompt, cursor no fim | aceita o texto fantasma |
| ↑ / ↓ | prompt | comando anterior / seguinte da visita |
| Esc | dentro do terminal | fecha, foco no botão da dock |

O botão ✕ da barra ("Fechar terminal") e o botão da dock (com `aria-expanded`) também fecham.

## Acessibilidade

- Terminal: `role="dialog"` não modal, `aria-label="Terminal"`; o foco não fica preso.
- Saída: `role="log"`, `aria-live="polite"`; cada resposta é anunciada uma vez.
- Prompt: `<input>` com rótulo oculto "Comando", `autocomplete="off"`, `autocapitalize="off"`,
  `spellcheck="false"`, `enterkeyhint="send"`. O espelho visual (prompt, texto, `▊`, fantasma) é
  `aria-hidden`.
- Dock: `<button aria-label="Abrir terminal (Ctrl+Alt+T)" aria-expanded aria-controls>`; com o
  terminal aberto, o nome passa a "Fechar terminal (Ctrl+Alt+T)".
