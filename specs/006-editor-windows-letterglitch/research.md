# Research: Janelas de editor, Letter Glitch, Lattice Loader e correções das janelas (feature 006)

Decisões técnicas da fase 0. Cada uma resolve um ponto do plano; os números são de partida e os
marcados com "calibrar" fecham na implementação, por medição (e2e de contraste e de tempo).

Fontes levantadas em 2026-10-09: Vue Bits em `DavidHDev/vue-bits@07c0f76`
(`src/content/Micro/BranchedMenu/BranchedMenu.vue`, `src/content/Micro/LatticeLoader/LatticeLoader.vue`,
`src/content/Backgrounds/LetterGlitch/LetterGlitch.vue`), o código do site no commit `8f54bbb` e um
build de produção servido localmente (Playwright).

---

## R1. Estrutura da janela de editor

**Decision**: um componente `EditorWindow.vue` (em `components/terminal/`) monta a janela com as peças
que já existem: `DesktopWindow` (minimizar, fechar, ícone, FLIP) → `BaseCard variant="window"` →
`TerminalWindow` (barra de título e digitação). O corpo do terminal tem dois passos, como as outras
janelas: o comando `TerminalLine` (`code ~/carreira`) e, como saída dele, um único `<div class="editor">`
com abas, árvore, painel e rodapé. As três seções passam a usar o `EditorWindow` no lugar das listas de
cartões:

| Seção | Título da janela e pasta | Comando | Ícone minimizado |
|-------|--------------------------|---------|------------------|
| Experiência | `~/carreira` | `code ~/carreira` | pasta de código (`project`) |
| Challenges | `~/projetos/challenges` | `code ~/projetos/challenges` | pasta de código |
| Comunitário | `~/projetos/comunitario` | `code ~/projetos/comunitario` | pasta de código |

O título, a linha de comando e o `lead` de cada seção (`git log --carreira --reverse=false` etc.) ficam
como estão, acima da janela.

**Rationale**: o Princípio V pede reaproveitar; o `DesktopWindow` já resolve minimizar, fechar, foco,
FLIP, movimento reduzido e impressão, e o `useTerminalTyping` resolve a digitação do comando (clarify:
"comando abre o editor"). Com o editor como a saída do comando, ele fica com `opacity: 0` enquanto o
comando é digitado e já ocupa o espaço final (o CSS de `data-t-state="pending"` só mexe na opacidade),
o que cumpre "a janela já tem a altura final" (FR-019).

**Alternatives considered**: um componente de editor sem `TerminalWindow` (perderia a digitação e a
barra); um único componente genérico para as três seções com `v-if` por tipo de item (o conteúdo de
cada tipo de cartão é diferente; os arquivos são gerados por funções puras por tipo, R3, e o
`EditorWindow` recebe a lista pronta e os cartões por slot).

---

## R2. Três visões no mesmo DOM: editor, cartões e sem JavaScript

**Decision**: o HTML pré-renderizado de cada janela tem as duas visões, e o CSS escolhe qual aparece:

```text
.editor                         (saída do comando)
├── .editor-tabs                aba do arquivo aberto
├── .editor-tree                Branched Menu (R4)
├── .editor-pane
│   ├── .editor-files           todos os arquivos, empilhados na mesma célula da grade
│   │   └── .editor-file × n    só o aberto visível; os outros com visibility: hidden
│   └── .editor-cards           os cartões atuais da seção (slot)
└── .editor-footer              caminho · posição
```

| Modo | Classe | Aparece | Some (`display: none`) |
|------|--------|---------|------------------------|
| Sem JavaScript (`html:not(.js)`) | — | comando + `.editor-cards` | abas, árvore, arquivos, rodapé |
| Com JavaScript, normal | `data-editor-view="file"` | comando + abas, árvore, arquivo aberto, rodapé | `.editor-cards` |
| Com JavaScript, maximizada | `data-editor-view="cards"` | árvore + `.editor-cards` | arquivos (as abas e o rodapé ficam) |
| Impressão | `@media print` | `.editor-cards` | abas, árvore, arquivos, rodapé |

`html.js` é posto pelo script inline do `<head>`, antes do primeiro paint, então a troca de visão não
acontece na hidratação (não há salto). Os arquivos não abertos ficam empilhados na mesma célula com
`visibility: hidden`: a janela tem a altura do maior arquivo na largura atual (FR-004, SC-002) e eles
saem da árvore de acessibilidade. A visão escondida usa `display: none`: cada conteúdo aparece uma vez
só para o leitor de tela (FR-012).

**Rationale**: Princípio III (sem JS, todo o conteúdo no HTML e visível) sem montar nada no cliente
depois da hidratação; o caso "JavaScript que chega tarde" (sem porta) não pisca nem salta, porque a
visão de editor já está no HTML. Os cartões no DOM desde o início servem a janela maximizada (Q2), a
impressão e o sem-JS, com o mesmo componente de hoje.

**Alternatives considered**: renderizar o editor só no cliente (`v-if mounted`): HTML menor, mas a
janela fica vazia ou salta quando o JS chega tarde; renderizar os cartões só ao maximizar: o sem-JS
mostraria YAML em vez dos cartões, e a impressão precisaria de outra versão. Custo da decisão: os fatos
aparecem duas vezes no HTML (YAML e cartões), ~+1,6 KB gzip no HTML inicial (medido no fim, R17).

**Revisão na implementação (R17)**: o HTML pré-renderizado leva só o 1º arquivo de cada janela (o
aberto); os outros entram na montagem. Sem JS nada muda (aparecem os cartões); com JS atrasado, a
janela pode crescer na montagem.

---

## R3. Arquivos YAML gerados dos dados

**Decision**: `src/lib/editor-files.ts`, funções puras e testadas que geram, para cada item, um
`EditorFile` (data-model §1): nome, caminho, posição e as linhas, cada linha uma lista de trechos com
tipo de sintaxe (`key`, `str`, `date`, `punct`, `comment`, `link`). Formato (clarify: YAML):

```yaml
# 1 / 5 · Programador Full-Stack
cargo: Programador Full-Stack
empresa: Empresa de Tecnologia (Confidencial)
local: Curitiba - PR
periodo: MAR 2026 — JUL 2026
resumo: >
  Desenvolvimento de aplicações web usando Angular e criação de agentes de IA …
stack: [Angular, Agentes de IA, LLMs]
```

- Chaves por tipo: experiência `cargo, empresa, local, periodo, atual (só o vínculo em andamento:
  `atual: true  # HEAD`), resumo, resultados (lista `- valor: rótulo`), stack`; challenge `nome, criado,
  resumo, stack, repositorio`; comunitário `nome, instituicao, local, data, resumo, papel, fonte`.
- Datas e períodos com `formatYearMonth`/`formatPeriod` (o formato único da página, Princípio I).
- `repositorio` e `fonte` são trechos `link`: o componente os desenha com o `ExternalLink` (nova aba,
  `rel="noopener noreferrer"`, FR-008).
- Textos longos (`resumo`) ficam numa linha lógica com indentação e quebram por CSS: cada linha lógica
  é uma linha da grade `número | conteúdo`, e o conteúdo quebra com recuo (`padding-left` + `text-indent`
  negativo); a numeração conta linhas lógicas.
- Nome do arquivo: `AAAA-MM_<slug>.yml`, com a data de início (experiência), de criação (challenge) ou
  do projeto (comunitário) e um slug curto: o `id` sem o ano final na experiência (`confidencial`,
  `osuper`, `prime-control`) e o nome em minúsculas, sem acentos e com hífens nos outros
  (`executiva-service`, `ny-times-rpa`, `ciee-pr`, `gincana-junina`). O mais longo,
  `2025-10_executiva-service.yml`, tem 29 caracteres (~203 px na Iosevka de 14 px).
- Caminho no rodapé: `~/carreira/2026-03_confidencial.yml`; posição: `1 / 5`.
- Um teste de unidade confere, para cada item do `resume.ts`, que todos os campos do cartão aparecem
  no arquivo (SC-001, Princípio I) e que nada além deles aparece.

**Rationale**: fonte única (os dados do currículo), sem texto duplicado à mão; testável sem DOM.

**Alternatives considered**: um template por tipo direto no componente (não testável sem montar);
YAML de verdade com aspas e escapes (o visitante lê, não um parser; o texto em português com `:` e `—`
fica mais legível sem aspas).

---

## R4. Branched Menu vendorizado

**Decision**: `components/vendor/vue-bits/BranchedMenu.vue`, a partir do original, com:

- CSS com escopo no lugar das classes do Tailwind (como os outros vendorizados), mesmas variáveis
  `--bm-*`;
- ícones dos filhos pelo Lucide (`FileCode`), já instalado, no lugar do Hugeicons (Princípio III: sem
  dependência nova);
- `active` controlado por prop (o `EditorWindow` sabe qual arquivo está aberto e o restaura ao sair da
  janela maximizada) e o evento `select`, como no original;
- `aria-label` no `<nav>` ("Arquivos de ~/carreira"), `aria-current="true"` no arquivo aberto (como no
  original), o marcador e os ramos `aria-hidden`;
- `motion-reduce:` do original → `@media (prefers-reduced-motion: reduce)` e `html:not(.motion)`;
- parâmetros do autor: `radius` 0 (o arco de raio 0 do SVG vira canto reto), os demais no padrão do
  componente (largura 240 → **300 px**, para caber `2025-10_executiva-service.yml` com o ícone e o recuo — 260 px, a primeira estimativa, ainda cortava (medido na implementação); o original "encolhe
  para o conteúdo", e o padrão cortaria o nome; altura da linha 36, recuo 40, tronco 14, espessura 1,5,
  fonte 14, desenho 400 ms, dobra 300 ms);
- cores dos tokens: tinta `--text`, destaque `--green-bright` (o verde dos arquivos novos da imagem do
  autor), linhas `--tree-line` (= `--purple`), e o texto ocioso em `--text-dim` (4,76:1 sobre
  `--surface`; o `color-mix` 55% do original daria 4,56:1, perto demais do limite).

**Rationale**: pedido do autor (item 1), com o mínimo de mudanças no comportamento do componente.

**Alternatives considered**: instalar `@hugeicons/vue` (dependência nova sem necessidade); escrever
uma árvore própria (o autor pediu o Branched Menu).

---

## R5. Maximizar: Teleport, marcador de lugar, FLIP, fundo desfocado e diálogo modal

**Decision**:

1. **Mover sem remontar**: o quadro do editor fica dentro de `<Teleport to="body" :disabled="!maximized">`.
   Com `disabled`, o Vue renderiza no lugar (inclusive no servidor); ao maximizar, move o mesmo DOM
   para o `<body>`, sem recriar o componente (o arquivo aberto, a digitação e o foco continuam).
2. **Marcador de lugar**: antes de mover, o `EditorWindow` fixa a altura do lugar da janela na página
   (`height` = altura medida); a página por trás não muda de layout, e restaurar devolve a janela ao
   mesmo ponto, na mesma rolagem (edge case "maximizar com a janela meio fora da tela").
3. **Tamanho**: maximizada, `position: fixed` com `inset: max(2.5vh, 0.75rem) max(2.5vw, 0.75rem)` no
   desktop (≥ 95% da largura e da altura; FR-015, SC-003) e `inset: 0.5rem` abaixo de 760 px; a janela é
   uma coluna flexível, e o painel de cartões e a árvore rolam por dentro (`overflow: auto`,
   `overscroll-behavior: contain`).
4. **Animação**: FLIP com o `lib/flip` (`toward`, 320 ms, `FLIP_EASING`): mede o retângulo antes e
   depois de mover e anima só `transform`; sem movimento, a troca é direta.
5. **Fundo**: um `<div class="maximize-backdrop">` também levado ao `<body>`, abaixo da janela:
   `backdrop-filter: blur(6px)` + `--maximize-scrim` (o fundo do tema a 55%), com fade de 200 ms (sem
   fade com "reduzir movimento"); o clique nele restaura. Camadas: backdrop 900, janela 901 (acima do
   header 100 e da dock 90/95; abaixo das scanlines 999, que são decorativas e sem eventos).
6. **Modal**: `#app` recebe `inert` (a janela e o backdrop estão fora dele, no `<body>`), o que tira o
   header, a dock e a página do teclado, do mouse e do leitor de tela; a janela recebe `role="dialog"`,
   `aria-modal="true"` e `aria-label="<título> (maximizada)"`; um laço de foco simples (Tab no último
   focável volta ao primeiro, Shift+Tab no primeiro vai ao último) mantém o foco nela (SC-003); Esc
   restaura. O foco vai para o botão de restaurar ao maximizar e volta para ele (já como "Maximizar")
   ao restaurar.
7. **Rolagem**: `html.window-maximized { overflow: hidden; scrollbar-gutter: stable }`: a página não
   rola e a barra de rolagem não some (sem salto de largura sob o desfoque).
8. **Atalho da dock**: com `html.window-maximized`, o Ctrl+Alt+T não abre o terminal (edge case).
9. **Minimizar/fechar maximizada** (FR-018): o `EditorWindow` repassa ao `TerminalWindow` controles que
   primeiro restauram (sem animação) e depois chamam o minimizar/fechar do `DesktopWindow`.
10. **Cartões**: maximizada, escolher um item na árvore rola o painel de cartões até o cartão (o
    `scrollTo` do próprio painel, não `scrollIntoView`, que rolaria a página travada); se o título do
    cartão já está à vista, não rola. Ao restaurar, o arquivo aberto é o do último item escolhido.
11. **Redimensionar/girar** maximizada: o `inset` em CSS acompanha; nada a fazer em JS.

**Rationale**: `position: fixed` no lugar seria quebrado por qualquer ancestral com `transform`
(o FLIP, o `v-reveal`, o realce do `SpotlightCard`); o Teleport resolve sem remontar. `inert` no `#app`
é uma linha só e cobre tudo (já é o recurso da porta de acesso, 005 R7).

**Alternatives considered**: `<dialog>` nativo com `showModal()` (exigiria mover o conteúdo para dentro
de outro elemento, recriando o componente, e o `::backdrop` não desfoca a página em todos os
navegadores com a mesma qualidade); clonar o editor para um modal (dois estados para sincronizar).

---

## R6. Digitação do comando nas janelas de editor

**Decision**: o `EditorWindow` usa o `TerminalWindow` com `animate` (padrão). Os passos do
`useTerminalTyping` são os filhos diretos do corpo: o comando `code ~/…` e a saída `.editor`. Valem as
regras da 002 (começa ao entrar na tela; completa com clique, toque ou foco dentro da janela; teto de
2,5 s; sem movimento, completo) e da 004 (minimizar completa; fechar e reabrir digita de novo, agora
sem piscar, R7). O plano de digitação (`planTyping`) é o mesmo: um comando curto de 15–26 caracteres.

**Rationale**: clarify ("comando abre o editor"), reaproveitando o mecanismo inteiro.

---

## R7. Reabrir uma janela fechada sem piscar (item 8)

**Finding** (reproduzido no build): `DesktopWindow.open()` mostra o quadro (`state = 'open'`) com o
conteúdo completo, anima o crescimento por 320 ms e, só no fim, chama `typing.replay()`, que esconde
comandos e saídas e começa a digitar. O visitante vê tudo, depois nada, depois a digitação.

**Decision**: dividir o `replay()` em dois tempos no `useTerminalTyping`:

- `prepare()`: aplica os estados escondidos (`data-t-anim`, `pending`) **sem** ouvintes nem timers. O
  `DesktopWindow` chama antes de `state = 'open'`, ainda com o quadro em `display: none`.
- `replay()`: se preparado, liga os ouvintes (`pointerdown`, `focusin`) e começa a digitar; senão, faz
  os dois (o comportamento de hoje).

A ordem no `open()` vira: `prepare()` → `state = 'open'` → animação de crescer (moldura e o que vem
antes do primeiro comando) → foco no `−` → `replay()`. O foco vem **antes** dos ouvintes, porque o
`focusin` completaria a digitação na hora (a razão da ordem atual). Fechar no meio da reabertura: o
`complete()` de `hide()` já mostra tudo e cancela timers; a próxima reabertura prepara de novo.

Achado na implementação: reaberta logo depois de fechar (a janela ainda encolhendo, à vista), a saída
sumia aos poucos pela transição de opacidade de 0,2 s, o que também é piscar. O `prepare()` põe
`data-t-instant` na janela (CSS: sem transição nas saídas), e o `replay()` o tira.

**Rationale**: corrige a causa (a ordem) sem mexer no plano de digitação.

**Alternatives considered**: esconder o conteúdo com CSS durante a animação (`.leaving`/`.growing`):
resolveria só a primeira metade, e o `replay()` ainda trocaria "visível" por "escondido" no fim.

---

## R8. A página abre no hero ao fim da porta (item 7)

**Finding**: na primeira visita, a página aparece no topo; ao recarregar depois de rolar, o navegador
restaura a rolagem anterior (`history.scrollRestoration = 'auto'`) por baixo da porta (medido: 2.154 px
sob a porta, 2.500 px depois); com âncora no endereço, o `focusPage()` da porta leva à seção.

**Decision**:

- O script inline do `<head>` põe `history.scrollRestoration = 'manual'` (só com JS): o navegador não
  restaura mais a rolagem ao recarregar.
- No fim da porta (`AccessGate.finish()`), com ou sem movimento: `scrollTo(0, 0)` instantâneo, a âncora
  sai do endereço com `history.replaceState(history.state, '', location.pathname + location.search)`
  (sem entrada nova no histórico) e o foco vai para o início do documento (o ramo da âncora do
  `focusPage()` sai). Isso cobre também a rolagem que o próprio navegador fez até a âncora na carga.
- O `useHashAnchor` (reposicionar na âncora depois das fontes) só age sem porta (JavaScript tarde,
  FR-022): com a porta na tela, ele não faz nada.
- Sem porta (JS tarde ou ausente): o site não move a página (FR-022). Sem JS, a âncora funciona
  normalmente (Princípio III).

**Rationale**: decisão do autor (Q3: sempre no hero). `scrollRestoration` é a causa; o `scrollTo` no fim
cobre a âncora e qualquer rolagem feita sob a porta.

**Alternatives considered**: só o `scrollTo(0, 0)` no fim (resolveria o visível, mas o navegador ainda
restauraria a rolagem no caso sem porta, com um salto depois do primeiro paint).

---

## R9. `□` desativado nas janelas que não maximizam (item 9)

**Decision**: o `TerminalBar` ganha o modo do maximizar: `maximize: 'none' | 'disabled' | 'on'`
(substitui o booleano `maximizable` da 005: `none` = sem `□`, a porta de acesso; `disabled` = desenho
desativado, o padrão; `on` = botão funcional, as janelas de editor). Desativado: classe
`t-btn--disabled` com `opacity: 0.35` e `filter: saturate(0.4)`, `cursor: default`, sem `filter` no
hover (o realce `:hover` passa a valer só para `button.t-btn`). O desenho decorativo pré-renderizado
(sem JS) também é o desativado, inclusive nas janelas de editor, que sem JS não maximizam. Funcional:
`<button>` com `aria-label` "Maximizar <título>" / "Restaurar <título>" e o ícone `maximize-2` /
`minimize-2` do Lucide.

**Rationale**: componentes desativados são isentos do contraste mínimo (WCAG 1.4.11); o `□` continua
fora da árvore de acessibilidade onde é desenho.

---

## R10. Dica do botão da dock (item 2)

**Decision**: no `AppDock`, um `<span class="dock-tip" aria-hidden="true">` posicionado acima do botão,
com `<kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>T</kbd>`, e o `title` sai. Estado `tip` em JS:

- aparece 150 ms depois de `pointerenter` com `pointerType` `mouse` ou `pen` (SC-009: ≤ 300 ms) e na
  hora com foco que casa `:focus-visible`;
- continua enquanto o ponteiro está sobre o botão ou a dica (os dois dentro do mesmo invólucro, com uma
  ponte invisível no vão), WCAG 1.4.13 ("hoverable");
- some com `pointerleave` do invólucro, `blur`, Esc (ouvinte só enquanto visível) e ao abrir o terminal;
- não aparece em toque (`pointerType` `touch`, e `@media (hover: none)` por garantia).

Visual: fundo `--surface`, borda `--border`, raio `--radius-btn`, fonte mono 0,78 rem, `kbd` com fundo
`--surface-2`, borda `--border`, texto `--green-bright`, sombra roxa leve (o brilho das janelas). Entra
com fade + 4 px de subida em 150 ms; sem transição com "reduzir movimento". O nome acessível do botão
já cita o atalho ("Abrir terminal (Ctrl+Alt+T)"), então a dica é `aria-hidden`.

---

## R11. Favicon (item 3)

**Decision**: `tools/build-favicon.mjs` gera, a partir dos tokens de `src/styles/tokens.css` e do
desenho `square-terminal` do Lucide (`rect 18×18 rx 2` + `m7 11 2-2-2-2` + `M11 13h4`):

- `public/favicon.svg`: o ícone em traço `--green-bright` (2 px), sobre um quadrado arredondado
  preenchido com `--bg` (para o verde ler em abas claras), com um brilho difuso `--purple-light` atrás
  (`feGaussianBlur` sobre o mesmo quadrado, em roxo);
- `public/favicon-32.png` e `public/apple-touch-icon.png` (180 px), rasterizados pelo Chromium do
  Playwright (já instalado), para navegadores sem favicon em SVG (Safari).

`index.html`: `<link rel="icon" href="/favicon-32.png" sizes="32x32">`,
`<link rel="icon" href="/favicon.svg" type="image/svg+xml">` (os navegadores com SVG escolhem o SVG) e
`<link rel="apple-touch-icon" href="/apple-touch-icon.png">`; o Vite aplica o `base`. Os arquivos
gerados são versionados (como as fontes e o sprite de ícones, Princípio III).

**Rationale**: o favicon não lê CSS; gerar a partir dos tokens mantém a fonte única de cores
(Princípio V). O preenchimento escuro é uma decisão de legibilidade: o verde do tema sobre aba branca
tem 1,9:1.

**Alternatives considered**: SVG escrito à mão com as cores copiadas (duas fontes de cor); só PNG
(sem nitidez em telas densas).

---

## R12. Letter Glitch no hero (item 4)

**Decision**: o mesmo desenho da 004/005 para fundos animados:

- `components/vendor/vue-bits/LetterGlitch.vue`: a casca vendorizada (canvas + as duas vinhetas em DOM)
  que hospeda a cena;
- `lib/scenes/letter-glitch.ts`: a cena sem DOM (`Scene`), que desenha em canvas 2D, para rodar num
  worker (`workers/letter-glitch.worker.ts`, com `OffscreenCanvas`) ou na thread principal;
- `components/terminal/HeroGlitch.vue`: lê os tokens, pausa fora da tela e com a aba oculta, avisa o
  hero quando o primeiro quadro foi desenhado (R13) e substitui o `HeroDots`.

Adaptações em relação ao original:

| Original | Adaptado |
|----------|----------|
| laço `requestAnimationFrame` na thread principal, sem pausa | cena no worker quando há `OffscreenCanvas` 2D (`hasOffscreen2D()` em `lib/webgl.ts`); senão, `frameLoop` com o freio da 004 (congela se 3 quadros seguidos passarem de 250 ms); pausa fora da tela (IntersectionObserver no `#home`) e com a aba oculta |
| tamanho pelo `window.resize` e pelo avô do canvas | `ResizeObserver` no contêiner; letras não distorcem (canvas no tamanho CSS × DPR, DPR até 2) |
| cor guardada como `#hex` e depois como `rgb()` (a transição suave quebra na segunda troca) | cor guardada como números RGB e alfa; interpolação sempre numérica (FR-030) |
| cores fixas em hex | três cores dos tokens (`--glitch-dark` = `--green`, `--glitch-green` = `--green-bright`, `--glitch-purple` = `--purple-glow`), com o alfa `--glitch-alpha` (clarify: letras um pouco mais suaves) |
| vinhetas em preto, com centro `0.8 → 0` aos 60% | bordas no padrão (`transparent 60% → #000 100%`); centro calibrado (clarify): mais escuro e maior, ponto de partida `rgb(0 0 0 / .9)` → transparente aos 80%, em `--glitch-vignette-center` |
| desenha todas as letras a cada troca | o mesmo (com Glitch Speed 10 e transição suave, quase todas as letras estão em transição em qualquer quadro), agrupando por cor para trocar `fillStyle` poucas vezes |
| sem teto de quadros | 60 qps no worker, 30 qps na thread principal |

Parâmetros: Glitch Speed 10 (com quadros de ~16 ms, há troca em todo quadro, como no original),
Smooth on, Center Vignette on, Outer Vignette on, letras e símbolos e célula 10 × 20 px do padrão,
fonte `16px monospace` do padrão.

Calibração do contraste (clarify, FR-032): a conta de partida mostra que, com as vinhetas do padrão, o
texto `--text-dim` da tagline cai para ~2:1 sobre uma letra verde na borda do bloco de texto (a vinheta
central lá vale ~0,3). Para 4,5:1, a letra mais clara sob o texto precisa ficar com ≤ 18% do brilho do
`--green-bright`, combinando o alfa das letras e a vinheta. Ponto de partida: `--glitch-alpha` 0,6 e
centro `.92 → 0` aos 85%; o e2e de contraste por pixel (10 quadros, 1366 e 390 px) fecha os números.
O glitch continua visível fora do bloco de texto (o anel entre a vinheta central e a das bordas).

**Calibração final (T032, 2026-10-09)**, medida por pixel em 6 quadros, 1366 × 800 e 390 × 844, com
o texto transparente:

| `--glitch-alpha` | vinheta central | pior texto 1366 | pior texto 390 | anel × centro (luminância média ×1000) |
|---|---|---|---|---|
| 0,6 | `.92 → 0` aos 85% (ponto de partida) | 2,91 (`▼ scroll`) | 2,23 (`▼ scroll`) | 8,6 × 0,8 |
| 0,45 | `.95`, `.88` aos 40%, `0` aos 80% | 5,36 | 3,19 (`▼ scroll`) | 4,1 × 0,2 |
| **0,55** | **`.96`, `.9` aos 40%, `0` aos 80%** | **5,41 (tagline)** | **5,41 (tagline)** | **4,5 × 0,2** |

O `▼ scroll`, pequeno e perto da borda de baixo (onde a vinheta central não chega e a das bordas mal
começa, no celular em retrato), era o único abaixo de 4,5:1 com qualquer vinheta que deixasse o glitch
visível: ele passou de `--text-dim` para `--text` (6,8:1 no celular, 13:1 no desktop), em vez de
escurecer o hero inteiro só por ele. Valores adotados: `--glitch-alpha: 0.55` e
`radial-gradient(circle, rgb(0 0 0 / 0.96) 0%, rgb(0 0 0 / 0.9) 40%, transparent 80%)`.

Sem movimento (inclusive ligado no meio da visita) ou sem JS: os degradês estáticos atuais do `.hero`.
O `--hero-scrim` e a penumbra `.hero-content::before` saem (FR-032). Saem também `DotField.vue`,
`HeroDots.vue`, os tokens `--dots-*` e o e2e `hero-dots.spec.ts` (FR-029).

**Rationale**: a 004 mostrou que desenhar fundos pesados na thread principal atrasa os timers (da
digitação e, agora, do loader); com Glitch Speed 10, o Letter Glitch redesenha ~5.000 letras por
quadro numa tela de 1366 × 768.

**Alternatives considered**: o componente original na thread principal (custo por quadro alto em
celular e sem pausa); redesenhar só as letras trocadas (não ajuda: com a transição suave, quase todas
mudam de cor a cada quadro).

---

## R13. Lattice Loader no hero (item 10)

**Decision**: `components/vendor/vue-bits/LatticeLoader.vue` (CSS com escopo, os `@keyframes` globais
com o prefixo `lattice-` do original) e `components/terminal/HeroLoader.vue`, que o usa na primeira
linha do hero:

- Parâmetros: grade 3 (padrão "orbit"), gap 1 px, `idleOpacity` 0,15, sem cronômetro, `glow`, forma
  quadrada; célula 6 px e passo 90 ms do padrão; fonte = a da linha (0,8 rem), por CSS.
- Cores: trabalhando, `--purple-glow` (células, brilho e texto; 5,4:1 sobre `--bg`; o `--purple-light`
  teria 3,1:1 e não serve para texto); pronto, `--green-bright` (✓, brilho e texto).
- Textos: `Inicializando portfolio.service` / `portfolio.service carregado com sucesso!`; o rótulo de
  erro do componente não é usado.
- Acessibilidade (FR-041): sai o `role="status"` e o anúncio `sr-only` do original; a grade é
  `aria-hidden`; só o rótulo ativo fica na árvore de acessibilidade (os outros `aria-hidden`), lido como
  texto comum.
- Tempo, numa função pura (`lib/hero-loader.ts`, data-model §4): começa quando a página é descoberta
  (`useBootDone`); `doneAt = clamp(max(início + 3000, prontoEm), …, início + 10000)`; `hideAt = doneAt +
  3000`. "Pronto" = `document.fonts.ready` **e** o fundo do hero (primeiro quadro do Letter Glitch, sua
  falha, ou fundo inexistente no modo atual).
- Sumir (clarify): a linha inteira recebe `visibility: hidden` com fade de 0,5 s em `opacity` (sem fade
  com "reduzir movimento"); o espaço continua reservado (nada no hero se move, FR-039).
- HTML pré-renderizado e sem JS: o estado "pronto" estático, que não some (FR-042); no cliente, a
  hidratação começa igual e, montado com movimento, passa a "trabalhando" (ainda sob a porta).
- "Reduzir movimento": fica "pronto" desde o início e some 3 s depois de descoberta, sem transição
  (FR-041). O CSS de movimento reduzido do original (onda lenta) não chega a ser usado.
- Fora da tela (IntersectionObserver no próprio loader) ou com a aba oculta: `animation-play-state:
  paused` nas células; o relógio do loader segue (FR-043).
- Impressão: a linha não aparece.

**Rationale**: pedido do autor e clarify (mínimo de 3 s; some a linha inteira).

---

## R14. Vinheta mais leve sob o ícone da porta (item 5)

**Decision**: a penumbra `.gate-launcher::before` (`--boot-panel` 92% opaco, sólido até 70% e depois
some) vira o desenho da vinheta central do Letter Glitch: um degradê radial preto que começa forte no
centro e some aos poucos, numa área maior (`--gate-vignette`, ponto de partida
`radial-gradient(closest-side, rgb(0 0 0 / .85) 0%, rgb(0 0 0 / .65) 45%, transparent 100%)`, com a
caixa `inset: -7rem -10rem`). O Faulty Terminal volta a aparecer em volta do ícone. A conta de partida:
a dica `--text-dim` precisa de vinheta ≥ 0,63 sobre o dígito mais aceso do Faulty (tint verde ×
brilho 0,5); o e2e de contraste da porta (005 FR-001) calibra. O `--boot-panel` sai se não restar uso.

**Calibração final (T040, 2026-10-09)**: o Faulty Terminal tem lampejos quase brancos, e sobre eles a
dica em `--text-dim` só fica em 4,5:1 com ~0,88 de escuro atrás dela. A geometria do lançador (217 ×
161 px, igual em 1366 e 390 px) põe a dica na borda de baixo, com a largura toda: uma vinheta centrada
no ícone precisaria ser grande e quase sólida (as primeiras tentativas, maiores e mais fracas,
reprovaram a dica em 2,5–3,3:1). A vinheta adotada é centrada no bloco de texto (nome + dica; o
quadrado do ícone já é opaco): caixa `inset: 2.25rem -4.25rem -4.125rem` (elipse de ~350 × 190 px,
metade da área da penumbra da 005, de 441 × 321 px) e
`radial-gradient(closest-side, rgb(0 0 0 / .94) 0%, rgb(0 0 0 / .9) 72%, transparent 100%)`. Medido em
8 quadros com WebGL: dica 5,2:1 (1366) e 5,1:1 (390), nome 12,6–13:1. Em preto, como a do Letter Glitch:
na cor do fundo, ela aparecia como um halo arroxeado sobre o canvas preto do Faulty. Com o fundo liso
(movimento reduzido), não há vinheta (a dica tem 4,9:1 sobre `--bg`). O `--boot-panel` saiu.

---

## R15. Curvatura do Faulty Terminal no celular (item 6)

**Finding**: o shader curva em coordenadas normalizadas (`c *= 1 + k·r²`, com `c` de −1 a 1 nos dois
eixos). O arqueamento de uma linha horizontal, medido em proporção da largura, é proporcional a
`k · altura / largura`: num celular de 390 × 844 (2,16) é 3,9 vezes o de um desktop de 1366 × 768
(0,56).

**Decision**: a cena calcula a curvatura efetiva no `resize`:
`k = base · min(1, (768 / 1366) · largura / altura)`, função pura `curvatureFor(base, w, h)` em
`lib/scenes/faulty.ts`. 1366 × 768 e telas mais largas: 0,2 (sem mudança); 1920 × 1080: 0,2; 390 × 844:
0,052; tablet em retrato 768 × 1024: 0,084. O arqueamento relativo nunca passa o do desktop 16:9
(SC-010). Desktops mais altos que 16:9 (16:10, 4:3) recebem um pouco menos (0,18 e 0,15): a spec foi
ajustada para "desktop 16:9 ou mais largo" no FR-036.

**Alternatives considered**: curvatura fixa menor só abaixo de 760 px (um degrau ao girar o
celular e nada para tablets); corrigir o aspecto dentro do shader (mexe no código vendorizado do
shader, que a 004 manteve sem mudança).

---

## R16. Versão

**Decision**: `package.json` → `2.5.0` (exibida `v2.5`), como manda o 005 FR-016; o `define` do build
e o teste `version.spec.ts` já leem o campo.

---

## R17. Peso e testes

**Linha de base** (build do commit `8f54bbb`, medido em 2026-10-09 com gzip nível 9, mesmo método da
005): HTML 17.408 B + JS inicial 63.405 B + CSS 10.829 B = **91.642 B**. O worker do Faulty (3.565 B,
`modulepreload`) fica fora da conta, como na 005. Teto desta feature (SC-011): **+6 KB** (≤ 97.786 B).
Estimativa: Branched Menu + `EditorWindow` + arquivos gerados ~3,5 KB (JS inicial, as seções estão no
pacote principal), YAML no HTML ~1,6 KB, Lattice Loader + `HeroLoader` ~1,2 KB, dica da dock ~0,3 KB;
menos o Dot Field (~0,6 KB do pacote principal: só o `HeroDots` assíncrono saía). O Letter Glitch vai
num pedaço assíncrono e no worker (fora da conta inicial). Se passar do teto: o `editor-files` pode ir
para um pedaço à parte carregado na montagem (os arquivos já estão no HTML).

**Medida final (T048, 2026-10-09)**: a primeira medida deu +18,2 KB (HTML +8,1, JS +7,4, CSS +2,7). O
HTML passou a ter só o 1º arquivo YAML de cada janela (os outros entram na montagem; sem JS, quem
aparece são os cartões): −2,4 KB. Resultado: HTML 23.157 B, JS 70.875 B, CSS 13.509 B, total
**107.695 B** (+16,0 KB sobre a 005); carregamento inicial 318,6 KB (≤ 500 KB). O que pesa: o CSS
crítico que o beasties embute no HTML para os componentes novos (o HTML tem 8,7 KB só de CSS
embutido), a árvore do Branched Menu (1,5 KB no HTML) e o JS das janelas de editor, do Lattice Loader e
da dica da dock. A estimativa de +6 KB não se sustentou; a SC-011 passou a +18 KB, e o
`weight.spec.ts` confere o novo teto. O Letter Glitch continua fora da conta inicial (pedaço
assíncrono e worker). Efeito colateral do corte no HTML: com JavaScript que chega tarde (sem porta), a
janela pode crescer na montagem, quando os outros arquivos entram (R2 previa o HTML completo).

**Testes**:

- Unidade: `editor-files` (campos × cartões, nomes, ordem), `hero-loader` (tempos), `curvatureFor`,
  cores/alfa do Letter Glitch e interpolação, `version`.
- Componente: `BranchedMenu` (seleção, `aria-current`, teclado), `EditorWindow` (trocar arquivo sem
  mudar altura, maximizar/restaurar, controles repassados), `LatticeLoader`/`HeroLoader` (estados),
  `DesktopWindow` (reabrir: saídas `pending` antes de crescer).
- E2E (build): `editor-windows.spec.ts` (novo: árvore, conteúdo × cartões, altura, celular, sem JS,
  maximizar como diálogo, Esc, clique fora, rolagem preservada, Ctrl+Alt+T bloqueado, minimizar
  maximizada), `hero-glitch.spec.ts` (novo, substitui `hero-dots`: canvas, vinhetas, contraste em 10
  quadros, pausa, movimento reduzido), `hero-loader.spec.ts` (novo: tempos, sem deslocamento, sem JS,
  movimento reduzido), `access-gate.spec.ts` (rolagem ao recarregar, âncora limpa, vinheta),
  `desktop-windows.spec.ts` (reabrir sem piscar, SC-005, nas 11 janelas), `window-controls.spec.ts`
  (`□` desativado, SC-008), `dock-terminal.spec.ts` (dica, SC-009), `boot.spec.ts` (curvatura, projeto
  `webgl`), `weight.spec.ts`, `a11y.spec.ts` (janela maximizada), `no-js`, `reduced-motion`; os specs
  que procuram `.timeline`, `.subpart-list` ou `[ OK ]` são atualizados.
- Leitura de pixels do Letter Glitch: por captura de tela (o canvas transferido ao worker não tem
  `getImageData` na página).
