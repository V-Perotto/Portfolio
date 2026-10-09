# Page Contract: HTML publicado e comportamento no cliente — revisão da feature 004

**Feature**: `004-dock-windows-crt` | Revisa o contrato da 003
(`specs/003-devicons-skill-loops/contracts/page-contract.md`), que continua valendo onde este não
diz o contrário.

## HTML publicado (sem JavaScript)

- **Hero** (FR-034): sem o elemento `.hero-grid`. O fundo são os degradês radiais sobre `--bg`. Não
  há canvas no HTML.
- **Espaço até o Sobre** (FR-014): entre o fim do `#home` e o título `## sobre/` há ~50% da altura da
  tela (margem do `main`, R6).
- **Navegação** (FR-016, FR-017): os 6 links `~/secao`, centralizados; **sem** o logotipo-prompt
  `viper@portfolio:~$`. Sem JS, a navegação fica como hoje (fixa no desktop, no fluxo abaixo de
  840px).
- **Janelas** (FR-009): as 8 janelas completas; os controles `−` `□` `✕` são `<span>` num contêiner
  `aria-hidden`; nenhum ícone de área de trabalho visível.
- **Dock e terminal** (FR-026): ausentes.
- **Rodapé** (FR-040): um único parágrafo, `$ echo "© <ano> Vittorio Perotto"`.
- **Temas VS Code** (FR-041, FR-042): chip `JSON` (com o símbolo `devicon-json`); o sublinhado
  tracejado do badge do Grape Glass em `--grape` e o do Shadow Lord em `--sith-badge`.
- **ItaliaMi** (FR-047): `papel = Autor e desenvolvedor`.
- **Valkey** (FR-043): o `<use>` aponta para `sprite.svg#dashboard-valkey` no chip do SRG e no loop
  `devops_qualidade`.
- **Skills** (FR-044 a FR-046): cada `.skill-loop` com `data-direction="to-left|to-right"`; itens em
  `1.7rem`; a fita de borda a borda da área do `main`.

## Comportamento no cliente (com JavaScript)

### Boot (FR-028 a FR-033)

- Com `html.motion`, o `.boot-screen` existe se o app montou até `BOOT_LATEST_START_MS` (2055 ms).
  Dentro dele: o canvas do Faulty Terminal (`.boot-bg`, `aria-hidden`) e o painel com as linhas.
- Nenhum `click`, `pointerdown` ou `keydown` muda o boot; não há `.boot-skip`.
- A última linha visível antes do fade termina em `./iniciar_portfolio.sh` completo.
- `html.booting` sai e o `.boot-screen` some até 7000 ms do início da navegação.
- Sem WebGL: `.boot-screen` sem canvas, fundo liso, console sem erro.

### Header (FR-012 a FR-016)

- `.navbar` sem `.nav-shown` enquanto `#home` cruza a área abaixo do header: `opacity: 0`,
  `pointer-events: none`, deslocado para cima; com `.nav-shown` ou `:focus-within`, visível.

### Dock e terminal (FR-017 a FR-027)

- Depois do boot: `.app-dock` fixa no centro inferior, com o botão do terminal.
- Terminal: ver [terminal-commands.md](terminal-commands.md).
- `body` com espaço inferior para a dock; o "▼ scroll" acima dela.

### Janelas (FR-001 a FR-011)

- Cada janela fica dentro de `.desktop-window[data-window-state="open|minimized|closed"]`.
- Depois de montar: `−` e `✕` são `<button>` com `aria-label` "Minimizar <título>" / "Fechar
  <título>"; o `□` continua `aria-hidden`.
- Minimizada ou fechada: o quadro (`.desktop-window-frame`) tem `display: none`, e o
  `.desktop-icon` (`<button aria-label="Abrir <título>">`, com o ícone do tipo e o título) fica
  visível no lugar.
- Animações de 320 ms (WAAPI); com `html:not(.motion)`, nenhuma.
- Impressão: quadros visíveis, ícones escondidos.

### Fundo do hero (FR-035 a FR-039)

- Com `html.motion` e WebGL, depois do boot: `.hero-crt` (`aria-hidden`, com um `<canvas>`) atrás do
  conteúdo, renderizando a 0,75× e no máximo 24 quadros por segundo, num Web Worker quando o
  navegador permite; `data-running="false"` (parado) com o hero fora da tela ou a aba oculta.
- Sem movimento, sem WebGL ou com "reduzir movimento" ligado durante a visita: sem canvas.

## Requisições

Nenhuma requisição nova a terceiros. O chunk do CRT vem do próprio site. O logotipo do Valkey está
no sprite, que já é do site.
