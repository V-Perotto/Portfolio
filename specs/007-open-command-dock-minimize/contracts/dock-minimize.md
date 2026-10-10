# Contract: minimizar o terminal da dock

**Feature**: `007-open-command-dock-minimize` | FR-010 a FR-017 | `src/components/dock/AppDock.vue`,
`src/components/dock/DockTerminal.vue`, `src/components/terminal/TerminalBar.vue`

Estende o contrato da 004 (`terminal-commands.md`, seções "Teclado" e "Acessibilidade") e a dica da
006. Estados e transições: [data-model §4](../data-model.md#4-terminal-da-dock-srccomponentsdockappdockvue).

## Barra de título do terminal

| Controle | Antes (006) | Depois (007) |
|----------|-------------|--------------|
| `−` | desenho (`<span aria-hidden>`) | `<button class="t-min" aria-label="Minimizar terminal">`, mesmo desenho e hover dos `−` das janelas |
| `□` | desativado (`t-btn--disabled`) | igual |
| `✕` | `<button aria-label="Fechar terminal">` | igual |

## Teclado

| Tecla / ação | Terminal fechado | Terminal aberto | Terminal minimizado |
|--------------|------------------|-----------------|---------------------|
| clique no botão da dock | abre (sessão nova) | minimiza | restaura |
| Ctrl+Alt+T | abre | minimiza | restaura |
| `−` | — | minimiza | — |
| `✕`, `exit`, Esc (dentro do terminal) | — | fecha (apaga a sessão) | — |
| `open <opção>` válido | — | minimiza e abre a janela | — |

Com uma janela de editor maximizada, Ctrl+Alt+T não faz nada e a dock está inerte (006).

## DOM e acessibilidade

- O terminal (`#dock-terminal`, `role="dialog"`, `aria-label="Terminal"`) existe com o terminal aberto
  **ou** minimizado. Minimizado, ele tem `inert` e a classe `is-minimized` (`opacity: 0`, `pointer-events: none`): fora da tela, do Tab e da árvore de acessibilidade, com a sessão e a rolagem
  intactas. Fechado, ele não existe.
- O botão da dock tem `data-terminal="closed" | "open" | "minimized"`, o `aria-label` e o
  `aria-expanded` da tabela do data-model §4, e `aria-controls="dock-terminal"` só com o terminal
  aberto.
- Indicador sob o botão (`::after`, decorativo): aberto, ponto cheio de 0,3 rem em `--green-bright`;
  minimizado, ponto vazado de 0,35 rem (fundo transparente, contorno de 1 px em `--green-bright`);
  fechado, nada. Contraste do contorno sobre a dock ≥ 3:1.
- A dica `Ctrl + Alt + T` (006) aparece com o terminal fechado ou minimizado.

## Animação

| Transição | Movimento | Duração |
|-----------|-----------|---------|
| fechado → aberto | sobe da dock e aparece (`<Transition>` de hoje) | 0,2 s |
| aberto → fechado | desce 1,5 rem e some (`<Transition>` de hoje) | 0,2 s |
| aberto → minimizado | encolhe até o retângulo do botão da dock e some (FLIP, `transform` + `opacity`) | 320 ms |
| minimizado → aberto | cresce a partir do botão da dock (FLIP inverso) | 320 ms |

Com "reduzir movimento", todas imediatas. Uma transição pedida no meio de outra termina a anterior na
hora.

## Sessão guardada ao minimizar

As linhas da saída, o histórico (↑/↓, inclusive o rascunho em edição), o texto do prompt com a seleção,
e a rolagem da saída. Restaurar mostra tudo igual, com o foco no prompt.
