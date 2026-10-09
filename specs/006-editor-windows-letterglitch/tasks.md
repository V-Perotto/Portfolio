---

description: "Task list for 006-editor-windows-letterglitch"
---

# Tasks: Janelas de editor com Branched Menu, Letter Glitch no hero, Lattice Loader e correções das janelas

**Input**: Design documents from `specs/006-editor-windows-letterglitch/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md;
constituição v3.0.0

**Tests**: incluídos. O plano e o quickstart (V1–V23) pedem testes, e a suíte Vitest + Playwright é o
gate de verificação da constituição.

**Organization**: Setup e Foundational, depois uma fase por história, na ordem de prioridade da spec
(US1, US2, US3: P1; US4, US5: P2; US6, US7: P3) e o polimento.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: história da spec (US1–US7)

## Path Conventions

Projeto único: `src/`, `tests/`, `tools/` e `public/` na raiz (plan.md, Project Structure).

---

## Phase 1: Setup

**Purpose**: linha de base, versão e tokens

- [X] T001 Conferir a linha de base de peso (research R17): `npm run build`, depois `gzip -9` de `dist/index.html`, do `dist/assets/app-*.js` e do `dist/assets/app-*.css` referenciados no HTML (sem o worker do Faulty), somados; se diferir dos 91.642 B registrados em R17 de `specs/006-editor-windows-letterglitch/research.md`, atualizar o número e o teto (total + 6.144 B)
- [X] T002 Levar a versão a `2.5.0` (FR-045, research R16): `npm version 2.5.0 --no-git-tag-version` (atualiza `package.json` e `package-lock.json`); em `tests/unit/version.spec.ts`, `tests/unit/boot.spec.ts`, `tests/component/AccessGate.spec.ts` e `tests/e2e/session.spec.ts`, trocar `v2.4` por `v2.5` onde o teste lê a versão do build (os testes de `displayVersion('2.4.0')` com entrada fixa ficam); nos comentários de `src/lib/boot.ts` (`v2.4` → `v2.5`); no `README.md`, acrescentar "2.5 = 006" à política de versão
- [X] T003 [P] Em `src/styles/tokens.css`, acrescentar um bloco "feature 006" com os tokens de data-model §8, cada um com comentário do FR: `--tree-line`, `--editor-bg`, `--editor-gutter`, `--syntax-key`, `--syntax-str`, `--syntax-date`, `--syntax-punct`, `--syntax-comment`, `--editor-tree-width: 260px`, `--maximize-scrim`, `--maximize-blur: 6px`, `--glitch-dark`, `--glitch-green`, `--glitch-purple`, `--glitch-alpha: 0.6`, `--glitch-vignette-center`, `--glitch-vignette-outer`, `--gate-vignette`, `--loader-working`, `--loader-done`; na impressão, `--maximize-scrim`, `--gate-vignette` e as vinhetas transparentes (os `--dots-*` e o `--hero-scrim` saem em T033; o `--boot-panel`, em T039)

**Checkpoint**: `npm run typecheck`, `npm test` e o build passam; o site só mudou a versão

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: dados do editor, tempo do loader e o `□` controlável

**⚠️ CRITICAL**: nenhuma história começa antes desta fase

- [X] T004 [P] Criar `src/lib/editor-files.ts` (data-model §1, research R3): tipos `SyntaxKind = 'key' | 'str' | 'date' | 'punct' | 'comment' | 'link'`, `Token { kind; text; href? }`, `EditorLine { indent: 0 | 1; tokens }`, `EditorFile { id; name; path; position; total; lines }`, `EditorFolder { label; path; files }`; `slugify(text)` (minúsculas, sem acentos via `normalize('NFD')`, não alfanuméricos → `-`, sem `-` nas pontas); `experienceFolder(experiences)` (ordem `byStartDesc`; pasta `carreira`, `~/carreira`; nome `AAAA-MM_<id sem o ano final>.yml`; chaves `cargo`, `empresa`, `local`, `periodo` via `formatPeriod`, `atual: true  # HEAD` só sem `end`, `resumo: >` + linha de indentação 1, `resultados:` com `- <valor>: <rótulo>` só se houver, `stack: [a, b]`), `challengeFolder(challenges)` (ordem `byCreatedDesc`; `~/projetos/challenges`; nome `AAAA-MM_<slugify(name)>.yml`; `nome`, `criado` via `formatYearMonth`, `resumo: >`, `stack`, `repositorio` como `link` com `href` = url e `text` = url sem `https?://`), `communityFolder(community)` (`~/projetos/comunitario`; `nome`, `instituicao`, `local`, `data`, `resumo: >`, `papel`, `fonte` como `link` com o rótulo `source.label`); a 1ª linha de cada arquivo é o comentário `# <posição> / <total> · <cargo ou nome>`; `path` = `<pasta>/<nome>`; `position` de 1 a `total`
- [X] T005 [P] Criar `tests/unit/editor-files.spec.ts`: para cada experiência, challenge e projeto comunitário de `src/data/resume.ts`, o texto do arquivo contém cada campo exibido no cartão correspondente (cargo, empresa, local, `formatPeriod`, resumo, cada `value`/`label` de `highlights`, cada tecnologia; nome, `formatYearMonth`, resumo, stack, url sem protocolo; instituição, papel, `source.label`) e nenhuma chave fora da lista do data-model §1; nomes únicos e iguais a `2026-03_confidencial.yml`, `2025-10_executiva-service.yml`, `2024-01_ny-times-rpa.yml`, `2026-09_ciee-pr.yml`, `2023-06_gincana-junina.yml`; ordem dos arquivos = ordem das seções; `slugify('NY Times (RPA)') === 'ny-times-rpa'`, `slugify('CIEE-PR') === 'ciee-pr'`; links com `href` https e `text` sem protocolo
- [X] T006 [P] Criar `src/lib/hero-loader.ts` (data-model §5, research R13): `LoaderPhase`, `MIN_WORK_MS = 3000`, `MAX_WORK_MS = 10000`, `SHOW_DONE_MS = 3000`, `loaderSchedule(revealedAt, readyAt)` → `{ doneAt, hideAt }` com `doneAt = revealedAt + min(MAX_WORK_MS, max(MIN_WORK_MS, (readyAt ?? Infinity) − revealedAt))` e `hideAt = doneAt + SHOW_DONE_MS`; e `tests/unit/hero-loader.spec.ts`: pronto antes de 3 s → `doneAt = revealedAt + 3000`; pronto aos 4,2 s → 4200; nunca pronto (`null`) → 10000; `hideAt − doneAt = 3000`
- [X] T007 Controles com modo de maximizar (data-model §3, research R9): em `src/components/terminal/window-controls.ts`, `maximize?: { active: Readonly<Ref<boolean>>; toggle(): void }` opcional em `WindowControls`; em `src/components/terminal/TerminalBar.vue`, trocar `maximizable: boolean` por `maximize: 'none' | 'disabled' | 'on'` (padrão `'disabled'`) e `maximized: boolean` (padrão `false`), emitir `maximize`; `'none'` não renderiza o `.t-max`; no modo `functional` com `'on'`, `.t-max` vira `<button type="button" class="t-btn t-max">` com `aria-label` "Maximizar <título>" / "Restaurar <título>" e o ícone `Maximize2` / `Minimize2` do `@lucide/vue` (12 px, `aria-hidden`); no modo `decorative`, `'on'` é desenhado como `'disabled'` (classe `t-btn--disabled`, sem estilo ainda: T042); em `src/components/terminal/TerminalWindow.vue`, a prop `maximizable` vira `maximize?: 'none' | 'disabled'` e a barra recebe `'on'` quando `controls?.maximize` existe, com `maximized = controls.maximize.active` e `@maximize="controls.maximize.toggle()"`; em `src/components/terminal/AccessGate.vue`, `:maximizable="false"` → `maximize="none"`; ajustar `tests/component/AccessGate.spec.ts` e `tests/component/DesktopWindow.spec.ts` se dependerem do nome da prop

**Checkpoint**: `npm run typecheck` e `npm test` verdes; o site não mudou

---

## Phase 3: User Story 1 - Experiência, challenges e comunitário numa janela de editor (Priority: P1) 🎯 MVP

**Goal**: três janelas de editor (uma por seção) com comando digitado, abas, árvore Branched Menu, arquivo YAML numerado, rodapé, minimizar/fechar e maximizar com os cartões de hoje.

**Independent Test**: quickstart V1–V9: percorrer os itens das 3 janelas pela árvore (mouse e teclado), comparar com os cartões, maximizar/restaurar (Esc, fundo, botão), minimizar/fechar maximizada, 320 px, sem JS e impressão.

### Implementation for User Story 1

- [X] T008 [P] [US1] Vendorizar o Branched Menu em `src/components/vendor/vue-bits/BranchedMenu.vue` (research R4) a partir de `DavidHDev/vue-bits@07c0f76` `src/content/Micro/BranchedMenu/BranchedMenu.vue`, com cabeçalho de origem/licença (MIT + Commons Clause) e lista de modificações como nos outros vendorizados: classes do Tailwind → CSS com escopo usando as mesmas variáveis `--bm-*`; ícones dos filhos: `icon?: Component` renderizado com `<component :is>` (sem `@hugeicons`); prop `active` controlada (sem `defaultActive` interno; o marcador e o ramo seguem a prop) e evento `select(value, item)`; props `ariaLabel` (no `<nav>`), `radius` (o `Math.min(radius, rowHeight / 2 − 2)` com 0 dá ramo reto); `aria-current="true"` e `data-active` no filho ativo; `data-file-id` em cada filho (= `value`); marcador e SVG `aria-hidden`; transições desligadas com `@media (prefers-reduced-motion: reduce)` e `html:not(.motion)`; demais padrões do original (`rowHeight` 36, `indent` 40, `trunk` 14, `lineWidth` 1,5, `fontSize` 14, `drawDuration` 400, `foldDuration` 300, `defaultOpen` 0)
- [X] T009 [P] [US1] Criar `tests/component/BranchedMenu.spec.ts`: renderiza a pasta e os filhos; clique e Enter num filho emitem `select` com o `value`; `aria-current` segue a prop `active`; o cabeçalho alterna `aria-expanded` e o `tabindex` dos filhos (0 aberto, −1 fechado); com `radius: 0`, os `d` dos ramos usam arco de raio 0 (`A 0 0`)
- [X] T010 [US1] Criar `src/components/terminal/EditorWindow.vue` — estrutura e visão normal (contracts/editor-window.md §1–§4, research R1–R3): props `folder: EditorFolder`; slot `cards`; `DesktopWindow :title="folder.path" kind="project"` → `BaseCard variant="window"` → `TerminalWindow :title="folder.path"` → `TerminalLine` `code {{ folder.path }}` + `<div class="editor">` com `.editor-tabs` (uma `.editor-tab.is-active` com o nome do arquivo aberto), `BranchedMenu` (`.editor-tree`, `items = [{ label: folder.label + '/', children: files → { value: id, label: name, icon: FileCode } }]`, `radius 0`, `width` do token `--editor-tree-width` (300), cores `var(--text)`, `var(--green-bright)`, `var(--tree-line)`, texto ocioso `--text-dim` por CSS, `ariaLabel` "Arquivos de <path>"), `.editor-pane` com `.editor-files` (um `<article class="editor-file" :data-file-id :data-active aria-label=nome>` por arquivo, `<ol class="editor-lines">` com `<li class="editor-line">`, `<span class="editor-ln" aria-hidden="true">` numerando linhas lógicas, tokens em `<span class="tok tok-<kind>">`, `link` via `ExternalLink`) e `.editor-cards` (slot), `.editor-footer` (`.editor-path` e `.editor-pos` `n / total`); estado `activeId` (inicial: 1º arquivo, igual no SSR); `data-editor-view="file"`; CSS: arquivos empilhados na mesma célula da grade, inativos com `visibility: hidden`; `.editor-cards` `display: none` em `file`; `html:not(.js)` e `@media print` escondem abas, árvore, arquivos e rodapé e mostram os cartões; ≥ 760 px árvore à esquerda (`max-width: var(--editor-tree-width)`), < 760 px acima; linhas quebram com recuo (`padding-left` + `text-indent` negativo; indentação 1 = 2 ch a mais); cores dos tokens `--editor-bg`, `--editor-gutter`, `--syntax-*`; rótulos do rodapé em maiúsculas pequenas `--text-dim`; sem rolagem horizontal de 320 px em diante
- [X] T011 [US1] Em `src/components/terminal/EditorWindow.vue`, maximizar (research R5, contracts/editor-window.md §3–§4): envolver o quadro (`.editor-frame` com `data-editor-view`) em `<Teleport to="body" :disabled="!maximized">`; `provide(WINDOW_CONTROLS, …)` com um invólucro dos controles do `DesktopWindow` (injetados) que acrescenta `maximize: { active, toggle }` e faz `minimize`/`close` restaurarem sem animação antes de repassar (FR-018); ao maximizar: medir o retângulo e fixar `placeholderHeight` no lugar, ativar o Teleport, `html.window-maximized`, `document.getElementById('app')!.inert = true`, backdrop `<Teleport to="body"><div class="maximize-backdrop" aria-hidden="true" @click="restore">`, `role="dialog"`, `aria-modal="true"`, `aria-label="<path> (maximizada)"` no quadro, `data-editor-view="cards"`, FLIP com `toward`/`FLIP_MS`/`FLIP_EASING` de `src/lib/flip.ts` (sem animação se `!canAnimate()`), foco no `.t-max`; ouvinte de `keydown` no `document`: Esc restaura, Tab/Shift+Tab circulam entre o primeiro e o último focável do quadro; restaurar desfaz tudo na ordem inversa, com FLIP de volta, foco no `.t-max` e a mesma rolagem; ao escolher um arquivo maximizada, `.editor-cards.scrollTo({ top: card.offsetTop − 16 })` (o cartão = `[data-card-id="<id>"]`, só se o título não estiver à vista; `behavior: 'smooth'` só com movimento); `onBeforeUnmount` desfaz `inert`, classe e ouvintes; CSS do quadro maximizado (`position: fixed`, `inset: max(2.5vh, 0.75rem) max(2.5vw, 0.75rem)`, < 760 px `inset: 0.5rem`, `z-index: 901`, coluna flexível com o painel e a árvore rolando por dentro, `overscroll-behavior: contain`) e do backdrop (`position: fixed; inset: 0; z-index: 900; background: var(--maximize-scrim); backdrop-filter: blur(var(--maximize-blur))`, fade de 200 ms só com `html.motion`)
- [X] T012 [US1] Em `src/styles/base.css`, `html.window-maximized { overflow: hidden; scrollbar-gutter: stable; }` e, na impressão, `.maximize-backdrop { display: none }` e o quadro do editor estático; em `src/components/dock/AppDock.vue`, o `onKeydown` do Ctrl+Alt+T não faz nada com `document.documentElement.classList.contains('window-maximized')`
- [X] T013 [US1] Em `src/components/sections/ExperienceSection.vue`, trocar a lista por `<EditorWindow v-reveal :folder="experienceFolder(experiences)">` com o slot `cards` contendo a `ol.timeline` atual (os `li` ganham `:data-card-id="exp.id"` e perdem o `v-reveal`, que fica na janela); manter o `SectionShell` e o lead; mover o CSS da timeline para dentro do slot sem mudar o visual
- [X] T014 [US1] Em `src/components/sections/ProjectsSection.vue`, nas sub-partes `challenges/` e `comunitario/`, trocar as listas por `<EditorWindow v-reveal :folder="challengeFolder(challenges)">` e `<EditorWindow v-reveal :folder="communityFolder(community)">`, com as `ol/ul.subpart-list` atuais no slot `cards` (`li` com `:data-card-id`, sem `v-reveal`); os títulos e leads das sub-partes não mudam; ajustar `tests/component/ProjectsSection.spec.ts`
- [X] T015 [P] [US1] Criar `tests/component/EditorWindow.spec.ts` (montado com `attachTo: document.body` e `html.js`): renderiza comando, aba, árvore e o 1º arquivo ativo; selecionar o 3º arquivo muda `data-active`, a aba, `.editor-path` e `.editor-pos` (`3 / 5`); `maximize.toggle()` põe `html.window-maximized`, `#app[inert]` (com um `#app` de teste), `role="dialog"` e `data-editor-view="cards"`; Esc restaura e tira tudo; `minimize()` maximizada restaura antes de chamar o minimizar do `DesktopWindow`
- [X] T016 [US1] Criar `tests/e2e/editor-windows.spec.ts` (quickstart V1–V9; `enterPortfolio`; `reducedMotion: 'no-preference'` onde houver digitação): V1 estrutura, comando digitado e ordem dos arquivos nas 3 janelas, e a altura do `.editor-frame` amostrada durante a digitação igual à final (FR-019); V2 para cada item, o texto do arquivo contém os textos do cartão correspondente (lidos de `.editor-cards [data-card-id]` com JS) e links com `target="_blank"` e `rel="noopener noreferrer"`; V3 altura do `.editor-frame` constante ao clicar em cada arquivo e ao navegar por teclado (`Tab` + `Enter`/`Space`), `aria-current`, foco no botão, `#skills` não se move; V4 em 320 e 390 px, árvore acima do painel; em 320, 390, 768, 1366 e 1920 px, `document.documentElement.scrollWidth ≤ clientWidth` (SC-001); V5 maximizar: retângulo ≥ 95% da janela em 1366 × 800 e 390 × 844, `#app` inerte, backdrop presente, 20 Tabs sem sair do quadro, Esc/clique no backdrop/botão restauram com `scrollY` igual e foco no `.t-max`, ≤ 400 ms; V6 maximizar Challenges e escolher o 6º arquivo rola `.editor-cards` até o 6º cartão, e restaurar mostra o arquivo 6; V7 `−` e `✕` maximizada voltam ao ícone sem `inert` nem classe; V8 Ctrl+Alt+T maximizada não abre `#dock-terminal`; V9 sem JS e com `emulateMedia({ media: 'print' })`, os cartões visíveis e árvore/arquivos ocultos
- [X] T017 [US1] Rodar `npm run test:e2e` e ajustar os specs que dependiam das listas soltas ou da contagem de janelas: `tests/e2e/projects.spec.ts`, `tests/e2e/visual-cleanup.spec.ts`, `tests/e2e/motion.spec.ts` (seletores `.timeline`, `.subpart-list`, cartões agora dentro de `.editor-cards`, visíveis só sem JS, na impressão ou maximizada), `tests/e2e/desktop-windows.spec.ts`, `tests/e2e/terminals.spec.ts` e `tests/e2e/minimized-layout.spec.ts` (3 janelas novas: 11 no total), `tests/e2e/tech-icons.spec.ts`, `tests/e2e/content-polish.spec.ts`, `tests/e2e/no-js.spec.ts`; sem afrouxar o que eles verificam

**Checkpoint**: US1 funcional e testável sozinha (V1–V9)

---

## Phase 4: User Story 2 - A página abre no hero ao fim do carregamento (Priority: P1)

**Goal**: ao fim da porta, `scrollY = 0` e endereço sem âncora, inclusive ao recarregar (Q3).

**Independent Test**: quickstart V10–V11.

### Implementation for User Story 2

- [X] T018 [US2] No script inline de `index.html`, `if ('scrollRestoration' in history) history.scrollRestoration = 'manual'` junto com as classes `js`/`booting` (research R8), com comentário
- [X] T019 [US2] Em `src/components/terminal/AccessGate.vue`, `finish()`: `window.scrollTo({ top: 0, left: 0, behavior: 'instant' })`; se `location.hash`, `history.replaceState(history.state, '', location.pathname + location.search)`; `focusPage()` passa a só tirar o foco (sai o ramo da âncora, com o `data-gate-focus`); atualizar o comentário do componente (FR-020, FR-021); em `src/composables/useHashAnchor.ts`, não fazer nada se `document.documentElement.classList.contains('gate')` na montagem (a porta leva ao topo; sem porta, continua reposicionando, FR-022)
- [X] T020 [US2] Em `tests/e2e/access-gate.spec.ts`: substituir o teste da âncora da 005 (V8, foco na seção) por V10: rolar 2500 px, recarregar, entrar → `scrollY === 0`; `goto('./#projetos')` e `goto('./#contato')` + recarregar → `scrollY === 0`, `location.hash === ''`, `history.length` igual ao de antes do fim; V11 (JS atrasado 2,5 s com `/#projetos`, `page.route` no bundle) → a página fica na âncora; ajustar `tests/component/AccessGate.spec.ts` se testar o foco na âncora

**Checkpoint**: US2 verificável sozinha

---

## Phase 5: User Story 3 - Reabrir uma janela fechada sem piscar (Priority: P1)

**Goal**: a janela reaberta cresce sem a saída dos comandos e só então digita.

**Independent Test**: quickstart V12.

### Implementation for User Story 3

- [X] T021 [US3] Em `src/composables/useTerminalTyping.ts` (data-model §4, research R7): `TerminalTyping` ganha `prepare()`; separar `arm()` em aplicar estados (`data-t-anim`, `pending`, remover `.t-typed`) e ligar ouvintes; `prepare()` só aplica os estados e marca `prepared`; `replay()`, se `prepared`, liga os ouvintes e chama `run()`; senão, faz os dois (comportamento atual); `complete()` limpa `prepared`; sem movimento, `prepare()`/`replay()` não fazem nada; o objeto inerte de `TerminalWindow` (`animate: false`) ganha `prepare() {}`
- [X] T022 [US3] Em `src/components/terminal/DesktopWindow.vue`, `open()`: com `replay`, chamar `typing?.prepare()` antes de `state.value = 'open'`; manter a animação de crescer; no `after()`, focar o `−` e só então `typing?.replay()`; atualizar o comentário do componente (FR-023, research R7)
- [X] T023 [P] [US3] Em `tests/component/DesktopWindow.spec.ts`, com `html.motion`: fechar e reabrir → logo depois de `state = 'open'` (antes do fim da animação), as saídas têm `data-t-state="pending"`; minimizar e reabrir → nenhuma saída `pending`
- [X] T024 [US3] Em `tests/e2e/desktop-windows.spec.ts`, V12: para as 11 janelas (Sobre, 6 projetos, Contato, 3 de editor), fechar, reabrir e amostrar a cada 16 ms (`requestAnimationFrame` dentro da página, até a digitação terminar) a opacidade computada de cada saída e o `data-t-state` do comando que a precede; nenhuma amostra com saída de opacidade > 0 antes de o comando dela estar `done`; minimizada reabre completa; com `reducedMotion: 'reduce'`, reabre completa sem `data-t-anim`

**Checkpoint**: US3 verificável sozinha; US1 também reabre sem piscar

---

## Phase 6: User Story 4 - Fundo Letter Glitch no hero (Priority: P2)

**Goal**: Letter Glitch no lugar do Dot Field, com cores do tema, Glitch Speed 10, transição suave e as duas vinhetas calibradas para o contraste.

**Independent Test**: quickstart V16–V18.

### Implementation for User Story 4

- [X] T025 [P] [US4] Em `src/lib/webgl.ts`, `hasOffscreen2D()`: `typeof OffscreenCanvas !== 'undefined'`, `'transferControlToOffscreen' in HTMLCanvasElement.prototype` e `new OffscreenCanvas(1, 1).getContext('2d')` sem lançar (memorizado); em `src/lib/scenes/serve.ts`, `WorkerMessage` ganha `{ type: 'frame' }` e `serveScene` repassa um `onFirstFrame` à fábrica via `SceneEnv`; em `src/lib/scenes/scene.ts`, `SceneEnv` ganha `onFirstFrame?: () => void`; em `src/lib/scene-host.ts`, `hostScene(canvas, spec, options, onFail, { context = 'webgl', onFirstFrame } = {})`: worker se `context === '2d' ? hasOffscreen2D() : hasOffscreenWebGL()`; no worker, a mensagem `frame` chama `onFirstFrame`; na página, passa `onFirstFrame` no `SceneEnv`; o Faulty continua igual
- [X] T026 [P] [US4] Criar `src/lib/scenes/letter-glitch.ts` (data-model §6, research R12): `GlitchOptions`, `startLetterGlitch: SceneFactory<GlitchOptions>` em canvas 2D (`AnyCanvas`), sem DOM; caracteres e célula do original (`A–Z`, `!@#$&*()-_+=/[]{};:<>,`, `0–9`; 10 × 20 px; `16px monospace`; `textBaseline = 'top'`); letras com `from`/`to`/`color` em RGB numérico e `progress`; a cada `glitchSpeed` ms troca `max(1, floor(5% das letras))` (caractere e cor-alvo sorteada das `colors`), com `smooth` a cor interpola +0,05 por quadro (sempre numérica, corrige o original); desenho de todas as letras por quadro, agrupadas por cor (`fillStyle = rgba(r, g, b, alpha)`); `resize(w, h)` refaz a grade (canvas = CSS × `dpr`, `setTransform(dpr…)`); `frameLoop(maxFps, env.guard, …)`; `visible(false)` para o laço; `env.onFirstFrame?.()` depois do primeiro desenho; `dispose()`; exportar `pickColor`, `lerpColor` e `gridSize(w, h)` para teste
- [X] T027 [P] [US4] Criar `src/workers/letter-glitch.worker.ts` (`serveScene(startLetterGlitch)`) e `tests/unit/letter-glitch.spec.ts`: `gridSize(1366, 768)` = 137 × 39; `lerpColor` numérico em 0, 0,5 e 1, e transições encadeadas continuam funcionando (o defeito do original); `pickColor` só devolve cores da lista
- [X] T028 [US4] Vendorizar a casca em `src/components/vendor/vue-bits/LetterGlitch.vue` (research R12) com cabeçalho de origem/licença e modificações: props `colors`, `alpha`, `glitchSpeed` (10), `smooth` (true), `centerVignette` (true), `outerVignette` (true); `<div class="letter-glitch" aria-hidden="true" :data-paused>` com `<canvas class="letter-glitch-canvas">`, `.letter-glitch-outer` (`background: var(--glitch-vignette-outer)`) e `.letter-glitch-center` (`background: var(--glitch-vignette-center)`); `hostScene(…, { context: '2d', onFirstFrame })` com o worker `new URL('../../../workers/letter-glitch.worker.ts', import.meta.url)` e `load` dinâmico de `@/lib/scenes/letter-glitch`; `maxFps` 60 (worker) / 30 (página), `dpr = min(devicePixelRatio, 2)`; `ResizeObserver` no contêiner; `visibilitychange`; expõe `pause()`/`resume()` (põem/tiram `data-paused` e chamam `host.visible`); emite `ready` no primeiro quadro ou na falha
- [X] T029 [US4] Criar `src/components/terminal/HeroGlitch.vue` (substitui o `HeroDots`): lê `--glitch-dark`, `--glitch-green`, `--glitch-purple` com `tokenRgb` de `src/lib/webgl.ts` (×255) e `--glitch-alpha`; renderiza `<div class="hero-glitch"><LetterGlitch …/></div>` (absoluto, `inset: 0`, entrada com fade de 0,6 s); `IntersectionObserver` no `#home` chama `pause()`/`resume()`; repassa `ready`
- [X] T030 [US4] Em `src/components/sections/HeroSection.vue`: `HeroGlitch` (async, `defineAsyncComponent`) no lugar do `HeroDots`, com `v-if="motion && bootDone"`; remover a penumbra `html.motion .hero-content::before` e os comentários do Dot Field; guardar o `ready` do fundo num `ref` (`heroBackgroundReady`, também `true` quando o fundo não existe no modo atual) para o US5; atualizar o comentário do componente
- [X] T031 [US4] Criar `tests/e2e/hero-glitch.spec.ts` (substitui `tests/e2e/hero-dots.spec.ts`, que é apagado; `reducedMotion: 'no-preference'`): V16 `.hero-glitch canvas` presente, nenhum `.hero-dots`/`.dot-field`; duas capturas do hero com 200 ms de intervalo diferem; média de luminância dos cantos < a do anel entre 45% e 70% do raio, e a do centro < a do anel; redimensionar de 1366 para 900 px sem erro no console; V18: rolar até `#contato` → `.letter-glitch[data-paused]`, voltar ao topo → sem `data-paused`; aba oculta simulada (`Object.defineProperty(document, 'hidden', { value: true, configurable: true })` + `visibilitychange`) → `data-paused`; `emulateMedia({ reducedMotion: 'reduce' })` no meio da visita remove `.hero-glitch`, ficam os degradês, e nenhum canvas `.letter-glitch-canvas` continua no documento (FR-034); console sem erros
- [X] T032 [US4] Calibrar o contraste (FR-032, clarify, research R12): em `tests/e2e/hero-glitch.spec.ts`, V17 com o método de `tests/e2e/support/contrast.ts` (texto transparente, luminância máxima sob cada caixa, 10 quadros, 1366 × 800 e 390 × 844) para `#home h1`, `.hero-terminal`, `.hero-sub`, `.hero-boot`, `.btn-primary`, `.btn-ghost`, `.hero-scroll`; ajustar `--glitch-alpha` e `--glitch-vignette-center` em `src/styles/tokens.css` até passar com folga, mantendo letras visíveis no anel fora do bloco de texto (luminância média do anel > 1,5 × a do centro); registrar os valores finais e as medidas em R12 de `research.md` e no data-model §8
- [X] T033 [US4] Remover o Dot Field (FR-029): apagar `src/components/vendor/vue-bits/DotField.vue`, `src/components/terminal/HeroDots.vue`, os tokens `--dots-*` e `--hero-scrim` (inclusive na impressão) de `src/styles/tokens.css`; `grep -rn "DotField\|HeroDots\|dots-\|hero-scrim\|hero-dots" src tests` sem resultados (exceto histórico em specs/); ajustar `tests/e2e/motion.spec.ts` e `tests/e2e/reduced-motion.spec.ts` que citem o Dot Field

**Checkpoint**: US4 verificável sozinha (V16–V18)

---

## Phase 7: User Story 5 - Lattice Loader na primeira linha do hero (Priority: P2)

**Goal**: loader roxo "Inicializando portfolio.service" ≥ 3 s → ✓ verde "portfolio.service carregado com sucesso!" → some 3 s depois, sem mover nada.

**Independent Test**: quickstart V19.

### Implementation for User Story 5

- [X] T034 [P] [US5] Vendorizar o Lattice Loader em `src/components/vendor/vue-bits/LatticeLoader.vue` (research R13) a partir de `src/content/Micro/LatticeLoader/LatticeLoader.vue` (`07c0f76`), com cabeçalho e modificações: classes do Tailwind → CSS com escopo (variáveis `--ll-*` iguais); `@keyframes lattice-on`, `lattice-on-45`, `-35`, `-25` globais; padrões `orbit` (3) e `sweep` (4) e as marcas `done`/`error` do original; sem `role="status"`, sem o `sr-only` de anúncio e sem cronômetro quando `showTimer` é falso; grade `aria-hidden`; rótulo inativo `aria-hidden`; prop nova `paused` (põe `animation-play-state: paused` nas células); cor do texto = `--ll-color` em `working` e `--ll-mark` em `done`; tamanho do texto por CSS (`font-size: inherit` quando `fontSize` não é passado)
- [X] T035 [US5] Criar `src/components/terminal/HeroLoader.vue` (data-model §5, contracts/hero-and-gate.md §2): `<LatticeLoader :status label="Inicializando portfolio.service" done-label="portfolio.service carregado com sucesso!" :grid="3" :gap="1" :idle-opacity="0.15" :show-timer="false" glow shape="square" color="var(--loader-working)" done-color="var(--loader-done)" :paused>`; prop `backgroundReady: boolean`; fase inicial `done` (SSR e hidratação); `onMounted` com movimento → `working`; quando `useBootDone()` vira `true`: `revealedAt = performance.now()`; `readyAt` = quando `document.fonts.ready` resolveu e `backgroundReady` é `true`; agenda `done`/`hidden` com `loaderSchedule` de `src/lib/hero-loader.ts` (reagendando se `readyAt` chegar depois); sem movimento: fica `done` e some em `revealedAt + 3000`; movimento desligado ao vivo: `done` na hora; `hidden` = classe que aplica `opacity: 0; visibility: hidden` com transição de 0,5 s (só `html.motion`); `IntersectionObserver` no próprio elemento liga `paused`; `@media print` esconde; timers limpos no `onBeforeUnmount`
- [X] T036 [US5] Em `src/components/sections/HeroSection.vue`, trocar o texto `[ OK ] Inicializando portfolio.service ...` por `<p class="hero-boot mono" :data-loader="phase"><HeroLoader :background-ready="heroBackgroundReady" /></p>` (a fase exposta pelo `HeroLoader` via `v-model:phase` ou evento), mantendo a altura da linha fixa em todos os estados (`min-height` da linha atual) e a margem de baixo
- [X] T037 [P] [US5] Criar `tests/component/LatticeLoader.spec.ts`: `working` mostra o rótulo de trabalho e 9 células; `done` mostra o `doneLabel` e as 4 marcas do ✓ (`[data-on]` em 2, 3, 5, 7); sem `role="status"`; só o rótulo ativo sem `aria-hidden`; `paused` aplica a classe/estilo de pausa
- [X] T038 [US5] Criar `tests/e2e/hero-loader.spec.ts` (V19): com movimento, registrar `data-loader`, o texto visível e a cor computada a cada 100 ms desde o fim da porta: `working` roxo com "Inicializando portfolio.service" → `done` verde com "portfolio.service carregado com sucesso!" entre 3,0 e 3,5 s → `hidden` 3 s depois; `getBoundingClientRect()` de `#home h1`, `.hero-terminal`, `.hero-sub`, `.hero-actions` iguais antes e depois de `hidden`, em 1366 e 390 px; `reducedMotion: 'reduce'`: `done` desde o início e `hidden` em ~3 s sem transição; sem JS: `done` com o texto final e sem sumir após 7 s; com o loader em `working`, rolar até `#contato` → células pausadas (`animation-play-state: paused`) e, de volta, o tempo do `done` não se atrasa (FR-044); sem `role="status"` no hero; atualizar testes que procuravam `[ OK ]`

**Checkpoint**: US5 verificável sozinha (V19)

---

## Phase 8: User Story 6 - Porta de acesso mais leve: vinheta e curvatura (Priority: P3)

**Goal**: vinheta suave sob o ícone; curvatura leve no celular.

**Independent Test**: quickstart V20–V21.

### Implementation for User Story 6

- [X] T039 [US6] Em `src/components/terminal/AccessGate.vue`, `.gate-launcher::before`: `background: var(--gate-vignette)` e caixa `inset: -7rem -10rem` (research R14), no lugar da penumbra `--boot-panel`; se nada mais usar `--boot-panel` (`grep`), removê-lo de `src/styles/tokens.css` (inclusive na impressão); atualizar o comentário
- [X] T040 [US6] Calibrar a vinheta da porta: no teste de contraste da porta do projeto `webgl` (`tests/e2e/boot.spec.ts`, o mesmo do 005 FR-001), manter ≥ 4,5:1 para `.gate-icon .desktop-icon-label` e `.gate-hint` em 10 quadros; acrescentar a verificação de que a luminância média do anel entre 6 e 10 rem do centro do ícone é maior que a medida com a penumbra antiga (valor registrado em R14); ajustar `--gate-vignette` em `src/styles/tokens.css` até passar e registrar o valor final em R14 de `research.md`
- [X] T041 [P] [US6] Em `src/lib/scenes/faulty.ts`, exportar `CURVATURE_REF_ASPECT = 768 / 1366` e `curvatureFor(base, width, height)` = `base * Math.min(1, CURVATURE_REF_ASPECT * width / height)` (research R15), e aplicar no `resize` da cena (o uniform `uCurvature` passa a ser `curvatureFor(options.curvature, w, h)`); criar `tests/unit/faulty-curvature.spec.ts`: 0,2 em 1366 × 768 e 1920 × 1080; ≈ 0,052 (±0,001) em 390 × 844; ≈ 0,084 em 768 × 1024; nunca maior que `base`

**Checkpoint**: US6 verificável sozinha

---

## Phase 9: User Story 7 - Dock, maximizar desativado e favicon (Priority: P3)

**Goal**: dica `Ctrl + Alt + T`; `□` desativado sem hover; favicon novo.

**Independent Test**: quickstart V13–V15.

### Implementation for User Story 7

- [X] T042 [P] [US7] Em `src/components/terminal/TerminalBar.vue`, estilo do `□` desativado (research R9, contracts/editor-window.md §5): `.t-btn--disabled { opacity: 0.35; filter: saturate(0.4); cursor: default; }`; o realce `:hover` passa de `.t-btn:hover` para `button.t-btn:hover`; e em `tests/e2e/window-controls.spec.ts`, V13: em Sobre, um projeto, Contato e terminal da dock, `locator('.t-max').screenshot()` antes e com `hover()` são iguais, opacidade computada ≤ 0,4, `cursor: default`; na porta, sem `.t-max`; nas janelas de editor, `.t-max` é `button`
- [X] T043 [US7] Em `src/components/dock/AppDock.vue`, a dica (research R10, contracts/hero-and-gate.md §4): envolver o botão em `.dock-item` com `<span class="dock-tip mono" aria-hidden="true" :data-show="tip || undefined"><kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>T</kbd></span>`; remover o `title`; `pointerenter` (só `mouse`/`pen`) → timer de 150 ms → `tip = true`; `focus` com `button.matches(':focus-visible')` → na hora; `pointerleave` do `.dock-item` e `blur` → `false` (quando nem o ponteiro nem o foco estão nele); Esc (ouvinte no `document` só enquanto visível) e `show()` → `false`; CSS: acima do botão, centrado, ponte invisível no vão, fundo `--surface`, borda `--border`, raio `--radius-btn`, 0,78 rem, `kbd` com `--surface-2`/`--border`/`--green-bright`, sombra roxa leve, fade + 4 px em 150 ms só com `html.motion`, escondida em `@media (hover: none)`; e em `tests/e2e/dock-terminal.spec.ts`, V14: hover → `.dock-tip[data-show]` com o texto `Ctrl + Alt + T` em ≤ 300 ms; `Tab` até o botão → visível; Esc → some; abrir o terminal → some; sem atributo `title`; com `hasTouch` e toque, não aparece
- [X] T044 [P] [US7] Criar `tools/build-favicon.mjs` (research R11): lê `--green-bright`, `--purple-light` e `--bg` de `src/styles/tokens.css`; escreve `public/favicon.svg` (viewBox 0 0 32 32; `<filter>` com `feGaussianBlur` sobre um quadrado arredondado `--purple-light` atrás; o `square-terminal` do Lucide escalado — `rect 18×18 x3 y3 rx2`, `m7 11 2-2-2-2`, `M11 13h4` — com o quadrado preenchido de `--bg` e traço `--green-bright` de 2, `stroke-linecap`/`linejoin` `round`); com o Chromium do `@playwright/test`, rasteriza `public/favicon-32.png` (32 px) e `public/apple-touch-icon.png` (180 px, fundo `--bg`); rodar o script e versionar os 3 arquivos; documentar o comando no README
- [X] T045 [US7] Em `index.html`, trocar o favicon em data URI por `<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">`, `<link rel="icon" href="/favicon.svg" type="image/svg+xml">` e `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`; em `tests/e2e/visual-cleanup.spec.ts` (ou `no-js.spec.ts`), V15: os três `link` no `<head>` com o `base` `/Portfolio/` e cada `href` respondendo 200 com o tipo certo; o SVG contém o traço `#4ade9b`, o preenchimento `#0a0612` e um `feGaussianBlur`

**Checkpoint**: US7 verificável sozinha

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: a11y, sem JS, movimento reduzido, impressão, peso, documentação e inspeção

- [X] T046 [P] Em `tests/e2e/a11y.spec.ts`, auditar com o axe também: as três janelas de editor (normal, com um arquivo do meio aberto), a de Challenges maximizada, a de Experiência minimizada, o hero com o loader em `working` e em `done`, e a dica da dock visível; 0 violações
- [X] T047 [P] Em `tests/e2e/reduced-motion.spec.ts` e `tests/e2e/no-js.spec.ts`: com movimento reduzido, sem `.hero-glitch`, loader `done` desde o início, maximizar/restaurar sem animação (o retângulo final no primeiro quadro), Branched Menu sem transição; sem JS, as três seções com os cartões, sem `.editor-tree` visível, loader estático `done`, `.t-max` desenhado como desativado, favicon presente
- [X] T048 Em `tests/e2e/weight.spec.ts`, acrescentar a soma gzip de HTML + CSS + JS iniciais (o método de T001, sobre os recursos da página) ≤ 97.786 B; medir no build final e registrar HTML, JS, CSS e total em R17 de `specs/006-editor-windows-letterglitch/research.md`; se passar do teto, aplicar a saída prevista em R17 (pedaço à parte para o `editor-files`)
- [X] T049 Rodar `npm run typecheck`, `npm test` e `npm run test:e2e` completos; corrigir falhas sem afrouxar asserções; console sem erros do site em todos os specs
- [X] T050 [P] Atualizar `DESIGN.md` (janelas de editor: estrutura, árvore Branched Menu radius 0, YAML e tokens `--syntax-*`, janela maximizada; Letter Glitch e vinhetas no hero no lugar do Dot Field; Lattice Loader; `□` desativado; dica da dock; favicon; vinheta da porta e curvatura proporcional) e `README.md` (componentes vendorizados, `tools/build-favicon.mjs`, versão 2.5)
- [X] T051 Inspeção pelo quickstart (V1–V23) no build servido (`npm run preview`), com screenshots num Chromium com GPU (`--ignore-gpu-blocklist --enable-gpu --use-angle=gl`) em 1366 e 390 px: as três janelas (normal e maximizada), hero com Letter Glitch e loader nos três estados, porta com a vinheta nova (1366 e 390 px), dica da dock, favicon; registrar no `quickstart.md` o que foi conferido e o que fica com o autor

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup; bloqueia as histórias
- **US1 (Phase 3)**: depende de T004, T007 (e T003)
- **US2 (Phase 4)**: só do Setup (independente de US1)
- **US3 (Phase 5)**: só do Setup; T024 cobre as janelas de editor se US1 estiver pronta (senão, as 8 de hoje e as 3 entram quando US1 terminar)
- **US4 (Phase 6)**: depende de T003
- **US5 (Phase 7)**: depende de T006 e de T030 (o `heroBackgroundReady`); sem US4, `backgroundReady` = `true`
- **US6 (Phase 8)**: depende de T003
- **US7 (Phase 9)**: T042 depende de T007; T043 de T012 (mesmo arquivo `AppDock.vue`, fazer depois); T044–T045 independentes
- **Polish (Phase 10)**: depois de todas as histórias

### Within Each User Story

- Vendorizados e funções puras antes dos componentes que os usam; componentes antes das seções; e2e
  por último (escritos junto, rodados no fim da fase).
- Mesmos arquivos em sequência: `EditorWindow.vue` (T010 → T011), `HeroSection.vue` (T030 → T036),
  `AppDock.vue` (T012 → T043), `TerminalBar.vue` (T007 → T042), `tokens.css` (T003 → T032 → T033 →
  T039/T040), `AccessGate.vue` (T007 → T019 → T039).

### Parallel Opportunities

- Fase 2: T004, T005, T006 em paralelo; T007 em seguida (vários arquivos de terminal).
- US1: T008 e T009 em paralelo com T010 (arquivos diferentes); T015 em paralelo com T013/T014.
- US4: T025, T026, T027 em paralelo; depois T028 → T029 → T030.
- US5: T034 e T037 em paralelo.
- US6 e US7: T041, T042, T044 em paralelo entre si e com as outras histórias.
- Polish: T046, T047, T050 em paralelo.

---

## Parallel Example: User Story 1

```bash
# Em paralelo (arquivos diferentes):
Task: "T008 Vendorizar o Branched Menu em src/components/vendor/vue-bits/BranchedMenu.vue"
Task: "T009 Criar tests/component/BranchedMenu.spec.ts"
# Depois, em sequência (mesmo arquivo):
Task: "T010 EditorWindow.vue — estrutura e visão normal"
Task: "T011 EditorWindow.vue — maximizar"
```

## Parallel Example: User Story 4

```bash
Task: "T025 hasOffscreen2D + mensagem frame + contexto 2d no scene-host"
Task: "T026 Cena src/lib/scenes/letter-glitch.ts"
Task: "T027 Worker e tests/unit/letter-glitch.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 (Setup) e Phase 2 (Foundational).
2. Phase 3 (US1): as três janelas de editor.
3. **Parar e validar**: V1–V9 do quickstart.

### Incremental Delivery

1. Setup + Foundational → base pronta.
2. US1 → editor (MVP do pedido principal).
3. US2 e US3 → as duas correções P1 (independentes, rápidas).
4. US4 → US5 → hero (o loader usa a prontidão do fundo).
5. US6 e US7 → acabamentos.
6. Polish → a11y, peso, docs, inspeção.

### Notes

- [P] = arquivos diferentes, sem dependência de tarefa incompleta.
- Commits só com autorização do autor (fluxo das features anteriores).
- Ao calibrar contraste (T032, T040), registrar os números finais na pesquisa.
