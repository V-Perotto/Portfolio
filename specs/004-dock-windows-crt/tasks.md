---

description: "Task list for 004-dock-windows-crt"
---

# Tasks: Janelas de área de trabalho, dock com terminal e telas CRT

**Input**: Design documents from `specs/004-dock-windows-crt/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md;
constituição v2.3.0

**Tests**: incluídos. O plano e o quickstart (V1–V19) pedem testes, e a suíte Vitest + Playwright é
o gate de verificação da constituição.

**Organization**: Setup e Foundational, depois uma fase por história (US1–US8, na ordem de
prioridade da spec) e o polimento. A atualização das dependências (US8) é executada no Setup, para
todo o resto já rodar nas versões novas; a fase US8 só verifica e registra.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: história da spec (US1–US8)

## Path Conventions

Projeto único: `src/`, `tests/` e `tools/` na raiz (plan.md, Project Structure).

---

## Phase 1: Setup

**Purpose**: dependências novas, linha de base e testes que deixam de depender do pulo do boot

- [X] T001 Conferir a linha de base de peso (research R15: HTML 16,5 + JS 51,7 + CSS 9,1 = 77,3 KB gzip) com `npm run build` e `gzip -9c` de `dist/index.html`, `dist/assets/app-*.js` e `dist/assets/app-*.css`; medir também o LCP do hero no `npm run preview` (Playwright, `PerformanceObserver` de `largest-contentful-paint`, mediana de 5 cargas em 1440×900 e em 390×844 com "reduzir movimento", para não contar o boot); registrar os dois em `specs/004-dock-windows-crt/research.md` (R15)
- [X] T002 Atualizar as dependências (FR-048, research R14): conferir com `npm view <pacote> version` que as mais novas continuam as da tabela R14; em `package.json`, `@playwright/test` → `^1.64.0`, `happy-dom` → `^20.14.6`, `vite` → `^8.3.4` (ou a mais nova do dia, se for compatível); manter `typescript` `~6.0.3`, `@unhead/vue` `^2.1.17` e `beasties` `^0.3.5`; rodar `npm install` (atualiza `package-lock.json`); acrescentar em `pnpm-workspace.yaml` (`minimumReleaseAgeExclude`) toda versão nova publicada há menos de 24 h; rodar `pnpm install` (atualiza `pnpm-lock.yaml`); `npx playwright install chromium`
- [X] T003 Rodar `npm run typecheck`, `npm test` e `npm run test:e2e` nas versões novas, antes de qualquer mudança de feature; corrigir o que a atualização quebrar e anotar em `specs/004-dock-windows-crt/research.md` (R14)
- [X] T004 Criar `tests/e2e/support/boot.ts` com `waitBootEnd(page)` (espera `.boot-screen` sumir e `html` sem `booting`, timeout 7500 ms) e trocar por ele os pulos com Esc/clique em `tests/e2e/terminals.spec.ts` (`skipBoot`), `tests/e2e/skills.spec.ts` (`skipBoot`), `tests/e2e/reduced-motion.spec.ts` (linhas 28 e 55), `tests/e2e/a11y.spec.ts` (linha ~11) e `tests/e2e/motion.spec.ts` ("prompt digita, matrix existe…"); a suíte tem de continuar passando com o boot atual

**Checkpoint**: suíte verde nas versões novas; nenhum teste depende de pular o boot

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: tipos, tokens, helper WebGL (US1 e US5) e a barra de janela (US2 e US4)

**⚠️ CRITICAL**: nenhuma história começa antes desta fase

- [X] T005 Atualizar `src/types/resume.ts` com as partes de `specs/004-dock-windows-crt/contracts/resume.schema.ts` que não quebram os dados: `TechIconId` com o prefixo `` `dashboard-${string}` ``, `LoopDirection = 'to-left' | 'to-right'` e `SkillGroup.loopDirection?: LoopDirection` ("Ausente = 'to-left'"); comentário do topo citando a 004. A troca `'JSON de tema'` → `'JSON'` fica para T061 (US7)
- [X] T006 [P] Acrescentar em `src/styles/tokens.css` os tokens do data-model: `--hero-gap: 50svh`, `--dock-space: 4.75rem`, `--desktop-icon-size: 5.5rem`, `--grape: #852ffc`, `--sith-badge: #d90404`, `--boot-panel: color-mix(in srgb, var(--bg) 85%, transparent)`, `--hero-scrim: color-mix(in srgb, var(--bg) 72%, transparent)`, `--loop-font: 1.7rem`, cada um com comentário do FR; na impressão, `--boot-panel` e `--hero-scrim` transparentes
- [X] T007 [P] Criar `src/lib/webgl.ts` (research R1): `createFullscreenShader(canvas, { fragment, uniforms, dpr })` → `null` quando `getContext('webgl')` falha (sem lançar nem logar), ou `{ gl, set(name, value), setTexture(name, source), resize(cssW, cssH), render(), dispose() }`; vértice padrão de triângulo cheio com `vUv`; uniforms `float`, `vec2`, `vec3` e `sampler2D` (textura de canvas, `CLAMP_TO_EDGE`, `LINEAR`, `UNPACK_FLIP_Y`); `dispose()` apaga buffers/programa/textura e chama `WEBGL_lose_context`
- [X] T008 Criar `src/components/terminal/TerminalBar.vue` (research R8) extraindo a barra de `src/components/terminal/TerminalWindow.vue`: props `title`, `controls: 'decorative' | 'functional'`, `minimizable` (padrão true), eventos `minimize` e `close`; decorativo = os três `<span class="t-btn">` num `div aria-hidden="true"` (HTML idêntico ao atual); funcional = `<button type="button" class="t-btn t-min" :aria-label="`Minimizar ${title}`">−</button>`, `<span class="t-btn t-max" aria-hidden="true">□</span>`, `<button … t-close :aria-label="`Fechar ${title}`">✕</button>` (sem minimizar quando `minimizable=false`), alvo de clique de 24 × 24 px por pseudo-elemento sem mudar o desenho de 20px; mover os estilos `.terminal-bar`, `.terminal-title`, `.t-controls`, `.t-btn` para ele; `TerminalWindow` passa a usar `<TerminalBar :title controls="decorative">` sem mudar o HTML publicado

**Checkpoint**: `npm run typecheck`, `npm test` e o build passam; o site não mudou

---

## Phase 3: User Story 1 - Boot completo sobre o Faulty Terminal (Priority: P1) 🎯 MVP

**Goal**: o boot mostra a sessão inteira, sem pulo, sobre o Faulty Terminal, e a página fica
descoberta em até 7 s (itens 4 e 12; FR-028 a FR-033)

**Independent Test**: quickstart V1–V4 e V17 (boot): recargas em desktop e celular com CPU lenta,
clique e teclas sem efeito, JS atrasado e bloqueado, sem WebGL

### Tests for User Story 1

- [X] T009 [P] [US1] Criar `tests/unit/boot.spec.ts`: `bootFrame(0)` tem só o prompt `anon@127.0.0.1:~$ ` com `s`; `bootFrame(BOOT_SEQUENCE_MS)` tem as 6 linhas da sessão e a última termina em `./iniciar_portfolio.sh` completo; o texto cresce monotonicamente com o tempo; `BOOT_SEQUENCE_MS === 3895`; `BOOT_LATEST_START_MS === BOOT_DEADLINE_MS - BOOT_SEQUENCE_MS - BOOT_FADE_MS - BOOT_SAFETY_MS === 2055` (folga revista de 250 para 500 ms, research R4); os números 2055 e 7000 do script inline de `index.html` batem com as constantes (ler o arquivo com `fs`)
- [X] T010 [P] [US1] Criar `tests/e2e/boot.spec.ts` (V1–V4, V17): (a) `BOOT_RUNS` recargas (padrão 3, variável de ambiente) em 1440×900 e em 390×844 com `Emulation.setCPUThrottlingRate { rate: 4 }` via CDP: quando o `.boot-screen` aparece, a última linha antes do fade termina em `./iniciar_portfolio.sh`, e `html` fica sem `booting` e sem `.boot-screen` até 7000 ms de `performance.now()`; (b) clique, toque, Esc, Enter e Espaço durante o boot não o encerram, e não existe `.boot-skip`; (c) bundle atrasado 2,5 s com `page.route` → sem `.boot-screen`, página descoberta < 7000 ms; (d) bundle bloqueado → `booting` sai entre 2055 e 2350 ms; (e) `getContext('webgl')` → `null` via `addInitScript`: boot sem `canvas`, console sem erro; (f) o canvas `.boot-bg` existe com WebGL; (g) contraste (FR-029): em 5 quadros do boot, com o texto do painel transparente, a luminância máxima sob as linhas fica ≥ 4,5:1 contra a cor do texto mais apagado, `--text-dim`

### Implementation for User Story 1

- [X] T011 [US1] Criar `src/lib/boot.ts` (research R4, data-model): `BOOT_SEQUENCE_MS = 3895`, `BOOT_FADE_MS = 550`, `BOOT_SAFETY_MS = 250`, `BOOT_DEADLINE_MS = 7000`, `BOOT_LATEST_START_MS` derivado; tipos `BootPart { cls?: string; text: string }` e `BootLine = BootPart[]`; `bootFrame(elapsedMs): BootLine[]` reproduzindo a sequência atual do `BootScreen` com os mesmos textos, classes e tempos (18×42, +250, +500, 7×55, +450, +300, +400, 21×24, +350; primeiro caractere de cada digitação no instante 0 do trecho); a linha "Last login" recebe a data por parâmetro (`bootFrame(t, now)`), para a função continuar pura
- [X] T012 [P] [US1] Criar `src/components/vendor/vue-bits/FaultyTerminal.vue` (research R1, R2): cabeçalho no padrão do `SpotlightCard` (origem `DavidHDev/vue-bits@07c0f76d5567db022c2e3185dd97a2311e056c0c` `src/content/Backgrounds/FaultyTerminal/FaultyTerminal.vue`, licença MIT + Commons Clause, modificações: `ogl` → `src/lib/webgl.ts`, `dpr ≤ 1`, ≤ 30 quadros por segundo, cor por prop, sem mouse); shaders copiados como estão; props com os valores do autor como padrão (`scale 3`, `gridMul [2, 1]`, `digitSize 3`, `timeScale 1`, `scanlineIntensity 1.4`, `glitchAmount 1`, `flickerAmount 1`, `noiseAmp 0.5`, `chromaticAberration 0`, `dither 0`, `curvature 0.2`, `brightness 0.5`, `pageLoadAnimation true` com 2000 ms) e `tint` (hex); canvas `aria-hidden`; se o helper devolver `null`, não renderiza nada e não loga; para com a aba oculta; `dispose` no unmount
- [X] T013 [US1] Reescrever `src/components/terminal/BootScreen.vue` (research R4, R2): começa só se `html.booting` e `performance.now() <= BOOT_LATEST_START_MS` (senão tira `booting` e sai); desenha `bootFrame(performance.now() - inicio)` a cada ~16 ms (`setTimeout`), parando no fim da sequência; agenda o fim natural em `BOOT_SEQUENCE_MS` e um timer de segurança em `BOOT_DEADLINE_MS - BOOT_FADE_MS` (do início da navegação), que desenha o quadro final antes do fade; no fim tira `booting` e faz o fade de 0,5 s; remove o `@click`, o ouvinte de `keydown` e o `<p class="boot-skip">`; acrescenta `<FaultyTerminal class="boot-bg" :tint="verde lido de --green-bright">` ao fundo e o painel `.boot-body` com `background: var(--boot-panel)`, borda `--border` e raio `--radius-window`; atualiza o comentário do topo (FR-028 a FR-033 da 004, constituição v2.3.0)
- [X] T014 [US1] Atualizar o script inline de `index.html` (research R4): prazo 1 em `2055 - performance.now()` → se `html` não tem `app-loaded`, tira `booting`; prazo 2 em `7000 - performance.now()` → tira `booting` e, sem `app-loaded`, tira `motion`; reescrever o comentário (7 s, constituição v2.3.0, sem pulo)
- [X] T015 [US1] Atualizar `tests/e2e/motion.spec.ts`: limites de 5000 → 7000 ms, nomes citando FR-032 da 004; trocar "boot é pulado com qualquer tecla" por "nem tecla nem clique encerram o boot"; manter o caso do bundle atrasado
- [X] T016 [US1] Rodar `tests/unit/boot.spec.ts`, `tests/e2e/boot.spec.ts` e `tests/e2e/motion.spec.ts`; depois rodar `BOOT_RUNS=20 npx playwright test tests/e2e/boot.spec.ts` uma vez (SC-001) e registrar no `research.md` (R4) quantas recargas tiveram boot e o maior instante de descoberta

**Checkpoint**: boot inteiro, sem pulo, ≤ 7 s; sem WebGL, boot liso

---

## Phase 4: User Story 2 - Terminal funcional na dock (Priority: P1)

**Goal**: o prompt sai do header e vira uma dock com um terminal de verdade (item 3; FR-017 a
FR-027)

**Independent Test**: quickstart V7 e V8: abrir pela dock e por Ctrl+Alt+T, `help`, `find` com Tab,
erros, histórico, `clear`, `exit`, ✕, Esc; header centralizado

### Tests for User Story 2

- [X] T017 [P] [US2] Criar `tests/unit/terminal.spec.ts` cobrindo `specs/004-dock-windows-crt/contracts/terminal-commands.md`: linha vazia; `help` (bloco exato, com as opções passadas); `HELP`; `find projetos` → `goto projetos` + `→ ~/projetos`; `find Experiência`, `find ~/experiencia`, `find SKILLS/` normalizados; `find` sem opção (uso + OPTIONS); `find xyz` (erro + OPTIONS + `Digite help para ver os comandos.`); opção de seção ausente da lista passada é inválida; `foo` (comando não encontrado); `clear` e `exit` (ações); `complete('fi')` → `find `; `complete('find pro')` → `find projetos`; `complete('find e')` → candidatos `experiencia`, `educacao` e prefixo comum; `complete('x')` → nenhum candidato
- [X] T018 [P] [US2] Criar `tests/component/DockTerminal.spec.ts` (happy-dom): monta com as seções; Enter em `help` escreve o bloco na saída (`role="log"`); Tab completa `find pro`; com vários candidatos, os botões de sugestão aparecem e o clique aplica; ↑ traz o último comando; `clear` esvazia; `exit` e Esc emitem `close`; `find sobre` emite `goto` com `sobre` e mantém o foco no input; o ✕ tem `aria-label="Fechar terminal"`
- [X] T019 [P] [US2] Criar `tests/e2e/dock-terminal.spec.ts` (V7, V8): depois do boot, `.app-dock` visível no centro inferior (centro ±2px) e header sem `viper@portfolio`; clique na dock abre (`aria-expanded=true`, foco no input); `help`; `find pro` + Tab + Enter → topo de `#projetos` entre o fim do header e o topo do terminal, terminal aberto e foco no input; `find Experiência`; `foo`; ↑; `clear`; `exit` → foco no botão da dock; reabrir com Ctrl+Alt+T e fechar com ✕ e com Esc; sem rolagem horizontal em 320px com o terminal aberto; ao rolar até o fim, o rodapé fica inteiro acima da dock; em 1440px o grupo de links do header fica centralizado (±2px) e em 390px o botão do menu também, medidos depois de rolar para fora do hero (a partir da US3 o header fica escondido no topo)

### Implementation for User Story 2

- [X] T020 [US2] Criar `src/lib/terminal.ts` conforme o contrato: `normalizeOption()`, `run(line, options: readonly NavSection[]): TerminalResult` e `complete(line, options): Completion` (tipos do data-model: `TerminalAction` `none | clear | exit | goto`), com os textos exatos do contrato e as opções na ordem recebida (o menu)
- [X] T021 [P] [US2] Criar `src/lib/viewport.ts`: `trackKeyboardOffset()` atualiza `--kb-offset` no `<html>` com `max(0, innerHeight - visualViewport.height - visualViewport.offsetTop)` em `resize`/`scroll` do `visualViewport`, devolvendo a função de parar; sem `visualViewport`, não faz nada
- [X] T022 [US2] Criar `src/components/dock/DockTerminal.vue` (research R7, contrato): `role="dialog"` com `aria-label="Terminal"` (não modal), `TerminalBar` com título `viper@portfolio: ~`, `controls="functional"`, `minimizable=false`, evento `close`; saída `role="log" aria-live="polite"` com as linhas de comando (`viper@portfolio:~$ <cmd>` com as classes de prompt) e de resposta (`white-space: pre-wrap`); prompt com `<label class="sr-only">Comando</label>`, `<input>` transparente (texto e caret) sobre o espelho `aria-hidden` (`PromptLogo :cursor="false"`, texto antes do caret, `▊` piscando na posição de `selectionStart`, resto do texto e o fantasma da conclusão única em `--text-dim`); Enter/Tab/→/↑/↓/Esc conforme o contrato; botões de sugestão quando houver candidatos; `goto` emite o id e mantém o foco; altura máxima `min(60svh, 28rem)` com a saída rolando até o fim a cada resposta; expõe `focusInput()`
- [X] T023 [US2] Criar `src/components/dock/AppDock.vue` (research R7): não renderiza nada antes de montar e antes de `useBootDone()`; barra `.app-dock` fixa no centro inferior (`bottom: calc(0.75rem + var(--kb-offset, 0px))`) com `<button>` de ícone `SquareTerminal` (Lucide, `aria-hidden`), `aria-label` "Abrir terminal (Ctrl+Alt+T)" / "Fechar terminal (Ctrl+Alt+T)", `aria-expanded`, `aria-controls`, dica `title="viper@portfolio:~$"`; `keydown` no `document` para `ctrlKey && altKey && code === 'KeyT'` (com `preventDefault`) alterna; abre com `<Transition>` (translateY + opacidade, 200 ms; sem transição com `html:not(.motion)`) e foca o input; `close` e `exit` fecham e devolvem o foco ao botão; `goto` rola com `scrollIntoView({ block: 'start', behavior: motion ? 'smooth' : 'instant' })` e `history.replaceState` do hash; liga `trackKeyboardOffset()`; `@media print { display: none }`
- [X] T024 [US2] Integrar: `src/App.vue` monta `<AppDock :sections="sections" />`; `src/styles/base.css` com `html.js body { padding-bottom: var(--dock-space); }`; `src/components/sections/HeroSection.vue` com o `.hero-scroll` em `bottom: calc(var(--dock-space) + 0.6rem)` com JS e no lugar atual sem JS
- [X] T025 [US2] Atualizar `src/components/layout/AppNav.vue` (FR-017): tirar o link `.nav-logo`/`PromptLogo` e seus estilos; `.nav-inner` com `justify-content: center`; abaixo de 840px, o botão do menu centralizado e os itens do menu aberto com texto centralizado; sem JS, os links continuam expostos
- [X] T026 [US2] Ajustar os testes que procuram o logotipo do header (`tests/e2e/layout.spec.ts`, `tests/e2e/a11y.spec.ts`, `tests/e2e/no-js.spec.ts` se citarem `.nav-logo` ou `viper@portfolio` no `.navbar`) e rodar T017–T019

**Checkpoint**: terminal completo pelo mouse, teclado e toque; header sem o prompt e centralizado

---

## Phase 5: User Story 3 - Header só depois do hero (Priority: P1)

**Goal**: header escondido enquanto o hero está na tela, e meia tela de espaço antes do Sobre
(item 2; FR-012 a FR-016)

**Independent Test**: quickstart V5 e V6: rolagem em passos, Tab desde o topo, âncoras, celular,
sem JS

### Tests for User Story 3

- [X] T027 [P] [US3] Criar `tests/e2e/header.spec.ts` (V5, V6): no topo, `.navbar` com `opacity` 0 e `pointer-events: none`; rolando em passos de 50px, o header só fica visível quando `#home.bottom <= altura do header`, e em até 300 ms; voltando ao topo, some; `#sobre h2` nunca fica sob o header; Tab desde o topo leva o foco a `~/sobre` e o header aparece; `goto('./#projetos')` → header visível e título abaixo dele; distância `#sobre h2.top − #home.bottom` = 50% de `innerHeight` ± 5% em 1440×900 e 390×844; em 390px o menu aberto fecha quando o hero volta; sem JS, a navegação fica como hoje (sem `opacity: 0`)

### Implementation for User Story 3

- [X] T028 [P] [US3] Criar `src/composables/useHeroPassed.ts` (research R5): `Ref<boolean>`, `false` no servidor e até montar; `IntersectionObserver` sobre `#home` com `rootMargin: -<altura do .navbar>px 0px 0px 0px` (altura medida na montagem, com fallback para `--nav-height`); `true` quando o hero não intersecta; desconecta no unmount
- [X] T029 [US3] Atualizar `src/components/layout/AppNav.vue`: classe `.nav-shown` vinda de `useHeroPassed()`; CSS só com `html.js`: `.navbar:not(.nav-shown):not(:focus-within)` com `transform: translateY(-100%)`, `opacity: 0`, `pointer-events: none`; transição de 250 ms em `transform`/`opacity` só com `html.motion`; `watch` fecha o menu quando o hero volta; sem `visibility: hidden` nem `inert` (o Tab precisa alcançar e revelar o header)
- [X] T030 [US3] Criar o espaço de meia tela (research R6) em `src/styles/base.css`: `.hero + main { margin-top: max(0px, calc(var(--hero-gap) - 5rem)); }`, com comentário ligando os 5rem ao `--section-pad`; conferir que `#sobre` continua como alvo de âncora com o título no topo
- [X] T031 [US3] Ajustar `tests/e2e/links.spec.ts` (menu do celular: rolar para fora do hero antes de abrir) e `tests/e2e/layout.spec.ts` (itens da navegação medidos com o header visível); rodar T027 e esses dois arquivos

**Checkpoint**: hero limpo; header surge no vazio antes do Sobre; teclado e âncoras funcionam

---

## Phase 6: User Story 4 - Janelas que minimizam e fecham como ícones de área de trabalho (Priority: P2)

**Goal**: `−` e `✕` funcionais, ícone de área de trabalho no lugar, reabertura completa ou
digitando (item 1; FR-001 a FR-011)

**Independent Test**: quickstart V9–V11: minimizar o SRG durante a digitação, fechar o `sobre.txt`,
teclado no `contato.sh`, impressão

### Tests for User Story 4

- [X] T032 [P] [US4] Criar `tests/component/DesktopWindow.spec.ts`: antes de montar (SSR via `renderToString`), controles decorativos e nenhum `.desktop-icon` visível; montado, botões "Minimizar <t>" e "Fechar <t>"; minimizar → `data-window-state="minimized"`, quadro escondido, `<button aria-label="Abrir <t>">` com o título visível e o ícone do tipo (`document`/`script`/`project`); abrir → `open`; fechar e abrir chama `replay()` do controle injetado; minimizar chama `complete()`; com `html` sem `motion`, nenhuma chamada a `animate()`
- [X] T033 [P] [US4] Criar `tests/e2e/desktop-windows.spec.ts` (V9–V11): minimizar o SRG durante a digitação → ícone FolderCode + "SRG" no lugar do cartão, o cartão seguinte sobe, a animação (`getAnimations()`) dura ≤ 400 ms, abrir → janela completa (todos os `data-t-state="done"`) sem digitar; fechar `sobre.txt` e abrir → passos voltam a `pending`/`typing` e terminam em ≤ 2,5 s; teclado: Tab até "Minimizar contato.sh", Enter → foco no ícone "Abrir contato.sh", Enter → foco no botão de minimizar; cliques rápidos (minimizar e abrir em sequência) terminam num estado coerente; `emulateMedia({ media: 'print' })` com janela minimizada → quadro visível e ícone escondido; com "reduzir movimento", troca sem animação e janela fechada reabre completa

### Implementation for User Story 4

- [X] T034 [US4] Atualizar `src/composables/useTerminalTyping.ts` (research R8): passa a devolver `{ complete, replay }`; `complete()` = o `finish()` atual (sem efeito se não está armado/rodando); `replay()` só com `html.motion`: monta os passos se ainda não montou, põe `data-t-anim` na janela, volta comandos e saídas para `pending`, remove sobras de `.t-typed`, liga os ouvintes de pulo (`pointerdown`, `focusin`) e roda `run()` na hora, com o mesmo plano e o mesmo teto (FR-005); atualizar o comentário
- [X] T035 [US4] Criar `src/components/terminal/DesktopWindow.vue` (research R8, data-model): props `title`, `kind: 'document' | 'script' | 'project'`; estado `open | minimized | closed`, `replayOnOpen`, `animating`; `provide('windowControls', { mounted, minimize, close, register(typing) })`; template: `.desktop-window[data-window-state]` com `.desktop-window-frame` (slot) e `<button class="desktop-icon" :aria-label="`Abrir ${title}`">` com `FileText`/`FileTerminal`/`FolderCode` (Lucide, `aria-hidden`) num quadrado de `--desktop-icon-size` e o título embaixo (até 2 linhas, reticências), visível só quando não está `open`; FLIP com `element.animate()` em 320 ms (quadro: translate + scale até o ícone, `transform-origin: top left`, opacidade; contêiner: altura do quadro → altura do ícone, e o inverso ao abrir); `finish()` da animação em curso quando há novo clique; sem `html.motion`, troca direta; foco no ícone depois de minimizar/fechar e no botão de minimizar depois de abrir; ao abrir depois de fechar, chama `replay()` no fim do crescimento; ao minimizar ou fechar, chama `complete()`; `@media print`: quadro sempre visível, ícone escondido
- [X] T036 [US4] Atualizar `src/components/terminal/TerminalWindow.vue`: `inject('windowControls', null)`; registra `{ complete, replay }` do `useTerminalTyping`; com controle injetado e montado, `<TerminalBar controls="functional" @minimize @close>`; sem controle ou antes de montar, `controls="decorative"` (HTML pré-renderizado idêntico)
- [X] T037 [US4] Embrulhar as 8 janelas: `src/components/sections/AboutSection.vue` (`<DesktopWindow title="sobre.txt" kind="document">` em volta da `.about-window`), `src/components/sections/ContactSection.vue` (`contato.sh`, `script`, em volta da `.contact-window`), `src/components/sections/ProjectCard.vue` (`project.name`, `project`, em volta do `BaseCard`); conferir que `v-reveal` continua no elemento de fora e que o layout das três seções não muda com as janelas abertas
- [X] T038 [US4] Rodar T032 e T033 e os e2e de `tests/e2e/terminals.spec.ts` (a digitação da 002 não pode mudar)

**Checkpoint**: as 8 janelas minimizam, fecham e reabrem; sem JS e na impressão, abertas

---

## Phase 7: User Story 5 - Fundo CRT com a chuva Matrix no hero (Priority: P2)

**Goal**: tubo CRT com os parâmetros do autor exibindo a chuva em ASCII; sem a grade (itens 5 e 6;
FR-034 a FR-039)

**Independent Test**: quickstart V12, V13 e V17 (hero): screenshot, mouse, contraste em 10 quadros,
sem WebGL, "reduzir movimento" ao vivo

### Tests for User Story 5

- [X] T039 [P] [US5] Criar `tests/unit/matrix-rain.spec.ts`: `MATRIX_CHARS` contém `A–Z`, `a–z`, `0–9` e `*&%$#@`; todo caractere é ASCII imprimível (`/^[\x21-\x7e]+$/`), o que exclui katakana; `MatrixRain` com um contexto falso (happy-dom ou stub) desenha só caracteres de `MATRIX_CHARS` e reinicia colunas que passam do fim
- [X] T040 [P] [US5] Criar `tests/e2e/hero-crt.spec.ts` (V12, V13, V17): sem `.hero-grid` no DOM em nenhum modo; com movimento, depois do boot, `canvas.hero-crt` (`aria-hidden`) atrás de `.hero-content`; contraste: 10 quadros com o texto do hero transparente (`color: transparent` injetado), luminância máxima sob as caixas de `h1`, `.hero-terminal`, `.hero-sub` e dos botões, contraste com a cor computada do texto ≥ 4,5:1 e, nos botões, contorno com ≥ 95% do contraste que tem sobre o fundo estático (research R13), em 1440×900 e 390×844; mover o mouse muda os pixels do canvas (deformação); com "reduzir movimento" ligado no meio, o canvas some sem erro; sem WebGL, sem canvas e console limpo; rolar até Projetos → o canvas para (dois `toDataURL` iguais)

### Implementation for User Story 5

- [X] T041 [US5] Criar `src/lib/matrix-rain.ts` (research R3, R10) extraindo a lógica de `src/components/terminal/MatrixRain.vue`: `MATRIX_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*&%$#@!?+=-<>[]{}()/\\|~^;:'`; classe `MatrixRain` com `resize(width, height, scale)`, `step(ctx)` (rastro do fundo a 12%, roxo a cada 3 colunas e verde nas outras, fonte de 15px × escala) e cores recebidas no construtor
- [X] T042 [US5] Criar `src/components/vendor/vue-bits/CrtWarp.vue` (research R1, R3): cabeçalho de origem (`src/content/Backgrounds/CRTWarp/CRTWarp.vue` no mesmo commit), licença e modificações (`three` → helper; `referencePlasma` → amostra da textura `uScreen` × scanlines; fundo do tubo = `--bg` com os dois degradês radiais do hero calculados no shader, em uniforms `uBg`, `uPurple`, `uGreen`; intensidade da chuva 0,35; ponteiro recebido por prop); props com os valores do autor como padrão (`curvature 0.3`, `scanlineStrength 1`, `scanlineFrequency 270`, `bloom 3`, `bloomRadius 3`, `brightness 1`, `dpr 0.75`, `pixelation 1`, `mouseReact true`, `mouseStrength 1.5`, `waveAmplitude 0`, `waveFrequency 2.5`, `noise 0.125`, `rgbShift 0.01`, `fps 24`, `paused false`, `speed 0.3`, `vignette 0.5`); `source: HTMLCanvasElement` reenviada só quando `dirty`; para fora da tela (`IntersectionObserver`) e com `document.hidden`; `null` do helper → não renderiza
- [X] T043 [US5] Criar `src/components/terminal/HeroCrt.vue`: canvas 2D fora do DOM a 0,75× do tamanho do hero, `MatrixRain` com as cores dos tokens, passo a cada 55 ms marcando `dirty`; `<CrtWarp :source>`; `pointermove` no `#home` só com `pointerType === 'mouse'` → ponteiro normalizado (−1..1), `pointerleave` → (0, 0); desliga tudo se `useMotion()` virar `false`
- [X] T044 [US5] Atualizar `src/components/sections/HeroSection.vue`: remover `<MatrixRain />`, `.hero-grid` e o CSS dela; carregar `HeroCrt` com `defineAsyncComponent(() => import(...))` só no cliente, com `useMotion()` verdadeiro, depois de `useBootDone()` e com WebGL disponível (teste rápido de `getContext('webgl')` num canvas descartável); penumbra `.hero-content::before` com `radial-gradient(ellipse at center, var(--hero-scrim), transparent 70%)`; manter os degradês do `.hero` como fundo estático
- [X] T045 [US5] Apagar `src/components/terminal/MatrixRain.vue` e atualizar `tests/e2e/motion.spec.ts` ("matrix existe" → `canvas.hero-crt`) e `tests/e2e/reduced-motion.spec.ts` (sem `canvas.hero-crt`); rodar T039, T040 e esses dois arquivos; conferir no build que o CRT está num chunk separado

**Checkpoint**: hero com o tubo CRT e a chuva ASCII; contraste ≥ 4,5:1; degradação limpa

---

## Phase 8: User Story 6 - Faixas de skills largas e legíveis (Priority: P2)

**Goal**: fitas de borda a borda, texto 2× e dois grupos correndo para a direita (itens 11 e 13;
FR-044 a FR-046)

**Independent Test**: quickstart V14: 320/768/1440/1920px, tamanho do texto, direção de cada grupo,
versão parada

### Tests for User Story 6

- [X] T046 [P] [US6] Atualizar `tests/unit/resume.data.spec.ts`: `loopDirection === 'to-right'` exatamente em `conceitos_web` e `desenho_de_processos`, e ausente nos outros três grupos
- [X] T047 [P] [US6] Atualizar `tests/component/SkillLoop.spec.ts`: `data-direction` igual à prop (`to-left` por padrão, `to-right` quando passado); a lista acessível continua única
- [X] T048 [P] [US6] Atualizar `tests/e2e/skills.spec.ts` (V14): em 320, 768, 1440 e 1920px, cada `.skill-loop` com `left` 0 e `right` igual a `document.documentElement.clientWidth` (±1px), sem rolagem horizontal; `font-size` de `.loop-item` = 27,2px; os títulos das sub-partes continuam dentro do contêiner de 1100px; a trilha de `conceitos_web` e `desenho_de_processos` anda para a direita (transform X crescente em 1 s) e as outras para a esquerda; ajustar V12 (em 320px os nomes têm ≥ 24px; sem movimento, quebram em linhas sem cortar nome)

### Implementation for User Story 6

- [X] T049 [US6] Em `src/data/resume.ts`, `loopDirection: 'to-right'` nos grupos `conceitos_web` e `desenho_de_processos`
- [X] T050 [US6] Atualizar `src/components/base/SkillLoop.vue` (research R9): prop `direction: LoopDirection = 'to-left'` → `data-direction` no `.skill-loop`; `[data-direction="to-right"] .loop-track { animation-direction: reverse; }`; `.loop-item` com `font-size: var(--loop-font)`; máscara das bordas 2.5rem → 4rem; `margin-inline: calc(50% - 50cqw)` no `.skill-loop` (com e sem movimento); atualizar o comentário (FR-044 a FR-046 da 004)
- [X] T051 [US6] Em `src/styles/base.css`, `main { container-type: inline-size; }` com comentário (research R9); em `src/components/sections/SkillsSection.vue`, passar `:direction="group.loopDirection"`; conferir que o `container-type` não muda o layout das outras seções (screenshots antes/depois em 1440 e 390px)
- [X] T052 [US6] Rodar T046–T048 e `tests/e2e/reduced-motion.spec.ts` (loops parados no tamanho novo)

**Checkpoint**: fitas largas e legíveis; direções certas; versão parada completa

---

## Phase 9: User Story 7 - Ajustes de conteúdo e acabamento (Priority: P3)

**Goal**: rodapé, JSON, sublinhados dos badges, logotipo do Valkey e papel do ItaliaMi (itens 7, 8,
9, 10 e 14; FR-040 a FR-043, FR-047)

**Independent Test**: quickstart V15

### Tests for User Story 7

- [X] T053 [P] [US7] Criar `tests/e2e/content-polish.spec.ts` (V15): o rodapé tem um único `<p>` com o texto `$ echo "© <ano corrente> Vittorio Perotto"` e nada de `exit code`; o cartão dos Temas VS Code tem o chip `JSON` e não tem `JSON de tema`; `border-bottom-color` da imagem do badge do Grape Glass = `rgb(133, 47, 252)` e do Shadow Lord = `rgb(217, 4, 4)` (e o mesmo no domínio, com o badge bloqueado por `page.route`); o chip Valkey do SRG e o item Valkey do loop `devops_qualidade` usam `#dashboard-valkey`; o cartão do ItaliaMi tem `papel = Autor e desenvolvedor`
- [X] T054 [P] [US7] Atualizar `tests/unit/resume.data.spec.ts`: nenhum `'JSON de tema'` nos dados; `italiami.role === 'Autor e desenvolvedor'`
- [X] T055 [P] [US7] Atualizar `tests/unit/tech-icons.spec.ts` (`TECH_ICONS.Valkey === 'dashboard-valkey'`; prefixo `dashboard-` aceito; sem `lucide-database` no sprite) e `tests/component/TagChip.spec.ts` (`href('Valkey')` termina em `#dashboard-valkey`)

### Implementation for User Story 7

- [X] T056 [P] [US7] `src/components/layout/AppFooter.vue` (FR-040): só `<p><span class="prompt-dollar" aria-hidden="true">$ </span>echo "© {{ year }} Vittorio Perotto"</p>`; remover `.footer-exit` e o crédito da stack; manter a correção do ano no cliente
- [X] T057 [P] [US7] `src/data/resume.ts`: `role: 'Autor e desenvolvedor'` no projeto `italiami` (FR-047)
- [X] T058 [P] [US7] `src/components/sections/EvidenceLink.vue` (FR-042): `.evidence-grape .badge-box img` e o domínio de fallback em `.evidence-grape` com `border-bottom-color: var(--grape)`; os do `.evidence-sith` com `var(--sith-badge)`; comentário citando o FR-042 da 004
- [X] T059 [US7] Atualizar `tools/build-tech-icons.mjs` (research R11): obter o commit atual de `homarr-labs/dashboard-icons` (`git ls-remote https://github.com/homarr-labs/dashboard-icons HEAD`) e fixá-lo numa constante; fonte `DASHBOARD = { valkey: 'svg/valkey.svg' }` baixada de `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@<sha>/svg/valkey.svg`; converter `fill-rule`/`clip-rule` do `style` em atributos antes do `decolor()`; símbolo `dashboard-valkey`; tirar `database` do manifesto `LUCIDE`; seção "dashboard-icons (homarr-labs) — 1 ícone" no `NOTICE.md`, com origem, commit e o texto da licença Apache-2.0 (baixado do mesmo commit)
- [X] T060 [US7] Rodar `node tools/build-tech-icons.mjs --preview <scratch>/icons.html`; conferir num screenshot que o Valkey (16 e 32px) está legível e com o furo central; `git diff src/assets/tech-icons/` só pode mostrar `+dashboard-valkey`, `−lucide-database` e o `NOTICE`; se outro símbolo mudou (vectorlogo.zone sem versão fixa), restaurar o anterior e anotar em `research.md` (R11)
- [X] T061 [US7] Trocar `'JSON de tema'` → `'JSON'` em `src/types/resume.ts` (união `TechName`, conforme `contracts/resume.schema.ts`), `src/lib/tech-icons.ts` (`JSON: 'devicon-json'`) e `src/data/resume.ts` (stack dos Temas VS Code); `Valkey: 'dashboard-valkey'` em `src/lib/tech-icons.ts`
- [X] T062 [US7] Rodar T053–T055 e `npm run typecheck`

**Checkpoint**: conteúdo e acabamento conforme os itens 7–10 e 14

---

## Phase 10: User Story 8 - Dependências nas versões mais novas (Priority: P3)

**Goal**: confirmar e registrar a atualização feita em T002–T003 (item 15; FR-048, FR-049)

**Independent Test**: quickstart V16

- [X] T063 [US8] Verificar V16: `npm outdated` lista só `typescript`, `@unhead/vue` e `beasties` (as três exceções da R14); `npm ci` e `pnpm install --frozen-lockfile` passam em cópias limpas (diretório temporário no scratchpad) e resolvem as mesmas versões dos pacotes declarados; registrar o resultado e as condições de revisita no `research.md` (R14)

**Checkpoint**: dependências na mais nova compatível; lockfiles coerentes

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: degradação, acessibilidade, peso, documentação e a inspeção manual

- [X] T064 [P] Atualizar `tests/e2e/no-js.spec.ts` (V17): sem `.app-dock`, `.desktop-icon` visível, `canvas` nem `.hero-grid`; navegação com os 6 links e sem o prompt; janelas completas com os controles `aria-hidden`; rodapé de uma linha; meia tela antes do Sobre
- [X] T065 [P] Atualizar `tests/e2e/reduced-motion.spec.ts` (V17): sem boot e sem canvas; header aparece e some sem transição; terminal abre sem animação; minimizar/abrir sem animação e janela fechada reabre completa; "reduzir movimento" ligado no meio para o CRT
- [X] T066 [P] Ampliar `tests/e2e/a11y.spec.ts` (V18): axe sem violações críticas/sérias com o terminal aberto (depois de um `help`), com uma janela minimizada e uma fechada, e no topo (header escondido), em 1440 e 390px
- [X] T067 Peso, LCP e terceiros (V19, SC-006, FR-050): `npm run build`; gzip -9 de `dist/index.html` + `app-*.js` + `app-*.css` ≤ 95,3 KB; o CRT num chunk à parte; `tests/e2e/weight.spec.ts` passa; LCP medido como no T001, dentro de ±10% da linha de base; acrescentar a `tests/e2e/weight.spec.ts` um teste que registra todas as requisições de uma visita completa (boot, rolagem até o fim, terminal aberto) e exige mesma origem, exceto `img.shields.io`; registrar os números no `research.md` (R15)
- [X] T068 [P] Atualizar `DESIGN.md`: dock e terminal (cores, barra, prompt, sugestões), ícone de área de trabalho e animações de janela, header que só aparece depois do hero e espaço de meia tela, boot com Faulty Terminal e painel (sem pulo, 7 s), fundo CRT do hero e penumbra, fitas de borda a borda com 1,7rem e direção, sublinhados `--grape`/`--sith-badge`, tokens novos
- [X] T069 [P] Atualizar `README.md`: seção "Fontes e ícones" com o dashboard-icons (Valkey, Apache-2.0); nota sobre o terminal da dock (Ctrl+Alt+T e o caso do Linux); lista de features em `specs/` com a 004
- [X] T070 Rodar `npm run typecheck`, `npm test` e `npm run test:e2e` completos; corrigir falhas
- [X] T071 Inspeção manual do quickstart: `npm run build && npm run preview`; screenshots em 1440×900 e 390×844 do boot (três momentos), do hero, do header surgindo, do terminal aberto com `help`, de janelas minimizadas e das skills; repetir com "reduzir movimento", sem JS e na prévia de impressão; console sem erros; anotar desvios no `research.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências; T002 → T003 → T004.
- **Foundational (Phase 2)**: depois do Setup; bloqueia todas as histórias.
- **US1 (Phase 3)**: depois da Foundational (usa `webgl.ts`).
- **US2 (Phase 4)**: depois da Foundational (usa `TerminalBar`). Mexe em `AppNav.vue`, que a US3
  também altera: US2 antes de US3.
- **US3 (Phase 5)**: depois da US2 (mesmo `AppNav.vue`).
- **US4 (Phase 6)**: depois da Foundational (`TerminalBar`); independente de US1–US3.
- **US5 (Phase 7)**: depois da Foundational (`webgl.ts`); mexe em `HeroSection.vue`, que a US2
  também altera (T024): US2 antes de US5.
- **US6 (Phase 8)**: depois da Foundational (`LoopDirection`); independente.
- **US7 (Phase 9)**: independente; T061 depende de T059–T060 (o símbolo precisa existir antes de o
  registro apontar para ele).
- **US8 (Phase 10)**: depois de T002–T003.
- **Polish (Phase 11)**: depois de todas as histórias.

### Within Each User Story

- Testes primeiro (devem falhar), depois a implementação; a última tarefa de cada fase roda os testes.
- Lógica pura (`src/lib/`) antes dos componentes que a usam.

### Parallel Opportunities

- Setup: nenhuma (sequencial pelo lockfile).
- Foundational: T006 e T007 em paralelo; T005 e T008 em seguida.
- US1: T009, T010 e T012 em paralelo.
- US2: T017, T018, T019 e T021 em paralelo.
- US4, US6 e US7 podem andar em paralelo com US1–US3 (arquivos diferentes), respeitando os pontos
  acima.
- US7: T053–T058 em paralelo.

---

## Parallel Example: User Story 2

```bash
# testes e a lib de viewport, em paralelo:
Task: "T017 tests/unit/terminal.spec.ts"
Task: "T018 tests/component/DockTerminal.spec.ts"
Task: "T019 tests/e2e/dock-terminal.spec.ts"
Task: "T021 src/lib/viewport.ts"
# depois, em sequência: T020 → T022 → T023 → T024 → T025 → T026
```

## Parallel Example: User Story 7

```bash
Task: "T053 tests/e2e/content-polish.spec.ts"
Task: "T056 src/components/layout/AppFooter.vue"
Task: "T057 src/data/resume.ts (ItaliaMi)"
Task: "T058 src/components/sections/EvidenceLink.vue"
# depois: T059 → T060 → T061 → T062
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup (dependências e testes sem pulo) e Foundational.
2. US1: o boot inteiro sobre o Faulty Terminal, que é o defeito visível em toda visita.
3. **Validar**: V1–V4 com `BOOT_RUNS=20`.

### Incremental Delivery

1. US1 → US2 → US3 (as três P1: boot, dock com terminal, header).
2. US4 → US5 → US6 (P2: janelas, CRT, skills).
3. US7 → US8 (P3: conteúdo, registro das dependências).
4. Polish: degradação, a11y, peso, documentação, inspeção manual.

### Notes

- Commits pequenos, um assunto por commit (constituição), só com autorização do autor.
- A constituição v2.3.0 (emenda do boot) tem commit próprio, antes do código.
