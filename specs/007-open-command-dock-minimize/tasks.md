---

description: "Task list for 007-open-command-dock-minimize"
---

# Tasks: Comando `open`, terminal da dock minimizável, vinheta original do Letter Glitch e ajustes de texto

**Input**: Design documents from `specs/007-open-command-dock-minimize/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md;
constituição v3.0.0

**Tests**: incluídos. O plano e o quickstart (V1–V19) pedem testes, e a suíte Vitest + Playwright é o
gate de verificação da constituição.

**Organization**: Setup e Foundational, depois uma fase por história. As duas P1 vêm na ordem US2 → US1
porque o `open` (US1) minimiza o terminal, que é a US2 (plan.md, Fases). Depois US3 (P2), US4 e US5
(P3) e o polimento.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: história da spec (US1–US5)

## Path Conventions

Projeto único: `src/` e `tests/` na raiz (plan.md, Project Structure).

---

## Phase 1: Setup

**Purpose**: linha de base de peso e versão

- [X] T001 Conferir a linha de base de peso (research R12): `npm run build`, depois somar o `gzip -9` de `dist/index.html` e dos `dist/assets/*.js|css` referenciados nele, sem os workers (o método do teste de peso); se diferir dos 107.695 B do research R12, atualizar o número lá. Em `tests/e2e/weight.spec.ts`, no teste "HTML + CSS + JS iniciais", trocar a linha de base para a da 006 (107.695 B, commit `37900be`) e o teto para `+ 3 * 1024` (SC-009), com o comentário da feature 007 (o histórico da 005 e da 006 fica no comentário)
- [X] T002 Levar a versão a `2.6.0` (FR-026, research R11): `npm version 2.6.0 --no-git-tag-version` (atualiza `package.json` e `package-lock.json`); trocar `v2.5` por `v2.6` em `tests/unit/version.spec.ts` (título e expectativa), `tests/e2e/session.spec.ts`, `tests/component/AccessGate.spec.ts` e no comentário de `src/lib/boot.ts`; no `README.md` (seção da versão), `v2.5` → `v2.6` e "2.5 a 006" → "2.5 a 006 e 2.6 a 007"

**Checkpoint**: `npm run typecheck`, `npm test` e o build passam; o site só mudou a versão

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: os alvos do `open` e o registro de janelas, de que a dock depende

**⚠️ CRITICAL**: nenhuma história de terminal (US1, US2) começa antes desta fase

- [X] T003 [P] Em `src/lib/sections.ts`, criar `OpenMode = 'open' | 'maximize'`, `OpenTarget { name; windowId; path; alias; mode }` e `openTargets(resume)` (data-model §1, research R1): na ordem `experiencia` (`windowId` `experiencia`, `path` `~/carreira`, `alias` `carreira`, `maximize`, só com `resume.experiences.length > 0`), os projetos na ordem dos dados (`name` = `slugify(project.name)` de `src/lib/editor-files.ts`, `windowId` `projetos/<name>`, `path` `~/projetos/<name>`, `alias` `projetos/<name>`, `open`), `challenges` (`challenges`, `~/projetos/challenges`, alias `projetos/challenges`, `maximize`, só com challenges) e `comunitario` (`comunitario`, `~/projetos/comunitario`, alias `projetos/comunitario`, `maximize`, só com comunitário)
- [X] T004 [P] Em `tests/unit/sections.spec.ts`, testar `openTargets(resume)`: os 9 nomes na ordem `experiencia, srg, temas-vs-code, italiami, ocr-de-prontuarios, qclass-bot, monitor-de-curso, challenges, comunitario`; nomes únicos, todos casando com `^[a-z0-9]+(-[a-z0-9]+)*$` e nenhum projeto chamado `experiencia`, `challenges` ou `comunitario` (FR-003); `windowId`, `path`, `alias` e `mode` de um projeto e das três janelas de editor; um currículo com `experiences`, `challenges` e `community` vazios devolve só os projetos
- [X] T005 Criar `src/lib/windows.ts` (data-model §3, research R3): tipos `WindowState`, `OpenOptions { complete?: boolean; onLayout?: () => void }`, `WindowHandle { state(); element(); open(options?): Promise<void>; maximize?(): Promise<void> }`; um `Map<string, WindowHandle>` do módulo; `registerWindow(id, handle)` devolve a função que retira o registro (só se ainda for o mesmo handle); `getWindow(id)`. (O `openWindow` entra em T019.)
- [X] T006 Em `src/components/terminal/window-controls.ts`, acrescentar a `WindowControls` o opcional `exposeMaximize?(fn: () => Promise<void>): void`, com comentário da feature 007 (o `EditorFrame` entrega o maximizar ao `DesktopWindow`, research R3)
- [X] T007 Em `src/components/terminal/DesktopWindow.vue` (research R3): prop opcional `windowId?: string`; `open()` passa a aceitar `{ complete?, onLayout? }` — com `complete: true` e a janela fechada, zera o `replayOnOpen` e não chama `typing?.prepare()` nem `typing?.replay()` (reabre já completa); `onLayout` roda depois de `state.value = 'open'` + `await nextTick()`, antes de medir e animar, nos dois caminhos (com e sem animação); já aberta, `open()` resolve na hora sem chamar nada; `provide` do `WINDOW_CONTROLS` ganha `exposeMaximize: (fn) => { maximizer = fn }`; com `windowId`, no `onMounted` registra em `src/lib/windows.ts` um handle (`state: () => state.value`, `element: () => root.value`, `open: (o) => open(o)`, `maximize` só se houver `maximizer`, lido na hora da chamada) e no `onBeforeUnmount` retira o registro; no `after()` do `open()`, o foco no `button.t-min` passa a `focus({ preventScroll: true })` (a janela já está na tela; não corta a rolagem suave do `open`, research R4); atualizar o comentário do topo
- [X] T008 Em `src/components/terminal/EditorFrame.vue`, chamar `parent?.exposeMaximize?.(async () => { await maximize() })` na montagem (o `maximize()` que já existe; ele já põe o foco no `□`), e repassar `exposeMaximize` no `provide` próprio (não é usado por dentro, mas mantém o contrato); em `src/components/terminal/EditorWindow.vue`, prop `windowId: string` repassada ao `DesktopWindow` (`:window-id`)
- [X] T009 Passar os `windowId` (data-model §3): em `src/components/sections/ProjectCard.vue`, `<DesktopWindow :window-id="\`projetos/${slugify(project.name)}\`" …>` (import de `slugify` de `src/lib/editor-files.ts`); em `src/components/sections/ExperienceSection.vue`, `<EditorWindow window-id="experiencia" …>`; em `src/components/sections/ProjectsSection.vue`, `window-id="challenges"` e `window-id="comunitario"` (o `App.vue` só muda em T013, junto com a prop `targets` do `AppDock`, para não vazar um atributo `targets` na dock)
- [X] T010 [P] Em `tests/component/DesktopWindow.spec.ts`, acrescentar: com `windowId`, a janela aparece em `getWindow(id)` depois de montar e some depois de desmontar; `open({ complete: true })` numa janela fechada não chama `prepare` nem `replay` do registro de digitação (mock) e termina com `data-window-state="open"`; `open({ onLayout })` chama o `onLayout` uma vez, com a janela já no estado `open`; `open()` numa janela aberta resolve sem mudar nada

**Checkpoint**: `npm run typecheck` e `npm test` verdes; o site não mudou (o registro existe, mas ninguém o usa)

---

## Phase 3: User Story 2 - Minimizar o terminal da dock sem perder a sessão (Priority: P1)

**Goal**: o `−` do terminal da dock minimiza até o botão da dock, guardando a sessão; a dock e o Ctrl+Alt+T minimizam e restauram; ✕, `exit` e Esc fecham e apagam.

**Independent Test**: quickstart V8–V12: comandos, um comando pela metade, saída rolada; minimizar pelo `−`, pela dock e pelo atalho; restaurar; conferir saída, histórico, prompt, rolagem, foco, nomes acessíveis, indicador e dica; fechar e reabrir vazio.

### Implementation for User Story 2

- [X] T011 [P] [US2] Em `src/components/terminal/TerminalBar.vue`, prop opcional `minimizeLabel?: string` (padrão `Minimizar <título>`), usada no `aria-label` do `<button class="t-btn t-min">`, como o `closeLabel` (research R5); atualizar o comentário do topo (o terminal da dock agora minimiza)
- [X] T012 [US2] Em `src/components/dock/DockTerminal.vue` (contracts/dock-minimize.md): `TerminalBar` com `:minimizable="true"`, `minimize-label="Minimizar terminal"` e `@minimize="emit('minimize')"`; novo evento `minimize: []`; `defineExpose` ganha `saveView()`/`restoreView()` só se a medição do T016 mostrar que a rolagem da saída se perde (com o terminal montado e só invisível, não deve se perder; não criar antes); atualizar o comentário do topo (minimizar guarda a sessão porque o componente continua montado)
- [X] T013 [US2] Em `src/App.vue`, `const targets = openTargets(resume)` e `<AppDock :sections="sections" :targets="targets" />`; em `src/components/dock/AppDock.vue` (research R5, data-model §4, contracts/dock-minimize.md): prop `targets: readonly OpenTarget[]` (repassada ao `DockTerminal` em T020); trocar `open: boolean` por `state: 'closed' | 'open' | 'minimized'`; `<DockTerminal v-if="state !== 'closed'" :class="['dock-terminal-window', { 'is-minimized': state === 'minimized' }]" :inert="state === 'minimized'" …>` dentro da `<Transition name="dock-terminal">` de hoje (fechar/abrir do zero continuam com ela); `minimize({ focusButton = true })`: termina animações em curso (`finishAll` de `src/lib/flip.ts`), mede o terminal e o botão da dock, anima com `el.animate([{ transform: 'none', opacity: 1 }, { transform: toward(terminal, botão), opacity: 0 }], { duration: FLIP_MS, easing: FLIP_EASING })` só se `canAnimate()`, e no fim põe `state = 'minimized'` (e o foco no botão, se `focusButton`); `restore()`: `state = 'open'`, `nextTick`, animação inversa (de `toward(terminal, botão)` com opacidade 0 até `none`), foco no prompt (`focusInput`); `close()` como hoje (estado `closed`, foco no botão); `toggle()`: `closed → show()`, `open → minimize()`, `minimized → restore()` (clique e Ctrl+Alt+T; o bloqueio com `html.window-maximized` continua); `@minimize="minimize()"` no terminal; a dica usa `state !== 'open'` no lugar de `!open`; no botão, `data-terminal="<state>"`, `aria-label` por estado (`Abrir terminal (Ctrl+Alt+T)` / `Minimizar terminal (Ctrl+Alt+T)` / `Restaurar terminal (Ctrl+Alt+T)`), `aria-expanded="state === 'open'"`, `aria-controls` só aberto; CSS: `.dock-terminal-window.is-minimized { opacity: 0; pointer-events: none; }` (na implementação, `opacity` no lugar de `visibility`: research R5) e `transform-origin: top left` no terminal durante a animação de minimizar e restaurar (o `toward` mede a partir do canto de cima à esquerda; a `<Transition>` de abrir/fechar continua com `bottom center`), o ponto cheio de hoje em `[data-terminal="open"]::after` e o ponto vazado em `[data-terminal="minimized"]::after` (0,35 rem, `background: transparent`, `border: 1px solid var(--green-bright)`); atualizar o comentário do topo
- [X] T014 [P] [US2] Em `tests/component/DockTerminal.spec.ts`: o `−` é um `<button>` com `aria-label="Minimizar terminal"` e o clique emite `minimize`; o ✕ continua "Fechar terminal"; o `□` continua desativado; ajustar o `it` "exit, Esc e o ✕ fecham" se ele dependia do `−` ser desenho
- [X] T015 [US2] Em `tests/e2e/dock-terminal.spec.ts` (quickstart V8–V12): trocar o teste "Ctrl+Alt+T abre e fecha" pela regra nova (Ctrl+Alt+T: abre → minimiza → restaura) e manter ✕ e Esc fechando com o foco na dock; novos testes: (V8) rodar `help` e `find sobre`, digitar `fi` sem Enter, rolar a saída para o topo, clicar no `−` → `#dock-terminal` com `inert` e `.is-minimized`, `data-terminal="minimized"`, foco no botão, `aria-label` "Restaurar terminal (Ctrl+Alt+T)", `aria-expanded="false"`, o `::after` do botão com fundo transparente e borda de 1 px na cor de `--green-bright` (`rgb(74, 222, 155)`, ≥ 3:1 sobre a dock, FR-013); (V9) restaurar pela dock e, de novo, pelo atalho → mesmas linhas, mesmo `scrollTop` da saída, `#dock-terminal-input` com `fi` e o cursor no fim, ↑ traz `find sobre`, foco no prompt, e a transição (medida pelo `getAnimations()` do terminal) ≤ 400 ms; (V10) com o terminal aberto, o clique na dock minimiza e o `aria-label` aberto é "Minimizar terminal (Ctrl+Alt+T)"; (V11) `exit`, ✕ e Esc apagam a sessão (reabrir: 0 `.dt-line` e ↑ sem efeito) e recarregar com o terminal minimizado volta `data-terminal="closed"`; (V12) com o terminal minimizado, o mouse sobre o botão mostra a dica `Ctrl + Alt + T`; com uma janela de editor maximizada (`.t-max` da Experiência), Ctrl+Alt+T não restaura; com `reducedMotion: 'reduce'`, minimizar e restaurar sem animação (`getAnimations()` vazio); ajustar os outros testes do arquivo que esperavam "Fechar terminal (Ctrl+Alt+T)" no botão
- [X] T016 [US2] (Resultado: rolagem, texto e cursor voltaram iguais sem `saveView`/`restoreView`; o que falhou foi o foco no prompt ao restaurar com movimento reduzido, corrigido trocando `visibility: hidden` por `opacity: 0`, research R5.) Rodar `tests/e2e/dock-terminal.spec.ts` e `tests/component/DockTerminal.spec.ts`; se a rolagem da saída ou a seleção do prompt não voltarem iguais (V9), implementar o `saveView()`/`restoreView()` de T012 (guardar `scrollTop` da saída e `selectionStart`/`selectionEnd` do input ao minimizar e repor ao restaurar) e chamá-los no `AppDock`

**Checkpoint**: US2 funcional e testável sozinha (V8–V12); o `open` ainda não existe

---

## Phase 4: User Story 1 - Abrir uma janela pelo terminal com `open` (Priority: P1) 🎯 MVP (com a US2)

**Goal**: `open <projeto>` abre a janela do projeto e leva a página até ela; `open experiencia|challenges|comunitario` abre a janela de editor maximizada; o terminal minimiza sozinho; `help`, erros e Tab como no `find`.

**Independent Test**: quickstart V1–V7: cada opção com a janela aberta, minimizada e fechada, em desktop e celular; erros; `help`; Tab e toque; movimento reduzido.

### Implementation for User Story 1

- [X] T017 [US1] Em `src/lib/terminal.ts` (research R2, data-model §2, contracts/terminal-open.md): `TerminalContext { sections; targets }`; `TerminalAction` com `{ type: 'open'; target: OpenTarget }`; `COMMANDS = ['help', 'find', 'open', 'clear', 'exit']`; `helpText(ctx)` com a linha `  open <OPTIONS>   abre uma janela e leva a página até ela` (entre `find` e `clear`) e o bloco `open <OPTIONS>` / `  projetos abrem; experiencia, challenges e comunitario abrem maximizados` / `  OPTIONS: <nomes>` / `  exemplo: open <primeiro projeto, ou o primeiro alvo>`, exatamente como no contrato; sem alvos, sem a linha e o bloco do `open` e `open` vira comando desconhecido; `run(line, ctx)`: `open` sem opção → `uso: open <OPTIONS>` + linha `OPTIONS`; opção que casa (`normalizeOption`) com o `name` ou o `alias` de um alvo → saída `→ <path>` e ação `open`; senão, se casa com o id de uma seção de `ctx.sections` → `open: '<digitado>': essa seção não abre com o open. Use: find <id>`; senão → `open: '<digitado>': não encontrado` + `OPTIONS` + `Digite help para ver os comandos.`; `complete(line, ctx)` e `completeWith(line, candidate)` generalizados para `find` e `open` (regex `^(\s*(?:find|open)\s+)(\S*)$`, candidatos do `open` = os `name` dos alvos, sem apelidos) e com espaço depois de `find` e de `open` completados na 1ª palavra; `find` continua igual; atualizar o comentário do topo
- [X] T018 [P] [US1] Em `tests/unit/terminal.spec.ts`, migrar as chamadas para o contexto (`{ sections, targets: openTargets(resume) }`) e acrescentar: `open italiami` → `['→ ~/projetos/italiami']` e ação `open` com o alvo; `open Experiência`, `open ~/carreira`, `open ~/projetos/challenges/` e `open COMUNITARIO` resolvem; `open` → uso + `OPTIONS: experiencia | srg | temas-vs-code | italiami | ocr-de-prontuarios | qclass-bot | monitor-de-curso | challenges | comunitario`; `open Educação` → `open: 'Educação': essa seção não abre com o open. Use: find educacao`; `open xyz` → as três linhas do contrato; `help` igual ao bloco do contrato; `complete('o')` → `open `; `complete('open it')` → `open italiami`; `complete('open c')` → linha igual e candidatos `challenges`, `comunitario`; `complete('open qc')` → `open qclass-bot`; `complete('open ')` → os 9; `completeWith('open c', 'comunitario')` → `open comunitario`; sem alvos, `open` é comando desconhecido; os testes do `find` continuam passando
- [X] T019 [US1] Em `src/lib/windows.ts`, `openWindow(target, { motion })` (research R4, contracts/terminal-open.md): obtém o handle por `getWindow(target.windowId)` (sem handle: não faz nada); `mode: 'open'` → se `state() !== 'open'`, `await handle.open({ onLayout: reveal })`, senão `reveal()`; `reveal` rola com `element().scrollIntoView({ block: 'start', behavior: motion ? 'smooth' : 'instant' })` só se o topo da barra de título não estiver entre `--nav-height` (lido do `scroll-padding-top` do `html`) e a metade da tela; depois, foco no `button.t-min` da janela com `{ preventScroll: true }`; `mode: 'maximize'` → `element().scrollIntoView({ block: 'start', behavior: 'instant' })`, `if (state() !== 'open') await handle.open({ complete: true })`, `await handle.maximize?.()`
- [X] T020 [US1] Em `src/components/dock/DockTerminal.vue`: prop `targets: readonly OpenTarget[]` (padrão `[]`); `ctx = computed(() => ({ sections: props.sections, targets: props.targets }))` usado em `run`, `complete`; evento `open: [target: OpenTarget]` emitido quando a ação é `open` (depois de escrever a saída); em `src/components/dock/AppDock.vue`, `:targets="props.targets"` no `DockTerminal` e `@open="onOpen"`: `onOpen(target)` chama `minimize({ focusButton: false })` e, sem esperar, `openWindow(target, { motion: motion.value })` (os dois em paralelo, research R4)
- [X] T021 [P] [US1] Em `tests/component/DockTerminal.spec.ts`: montado com `targets`, `open italiami` emite `open` com o alvo do ItaliaMi e escreve `→ ~/projetos/italiami`; `open sobre` não emite e escreve a sugestão do `find`; Tab completa `open it` → `open italiami`
- [X] T022 [US1] Criar `tests/e2e/open-command.spec.ts` (quickstart V1–V7; `enterPortfolio`; helper que abre o terminal e roda a linha): (V1) no hero, 1366 × 768, `open italiami` → saída `→ ~/projetos/italiami`, `data-terminal="minimized"`, a barra de título da janela do ItaliaMi com o topo entre a base do `.navbar` e 1/2 da tela em ≤ 1 s, foco no `.t-min` dela; (V2) minimizar a janela do SRG (`.t-min`) e rodar `open srg` → janela aberta e completa; fechar a do QClass-BOT e rodar `open qclass-bot` → janela aberta e, amostrando a cada 16 ms durante 1,5 s, nenhuma saída com opacidade > 0 antes de o comando dela terminar (como no e2e da 006 para FR-023); (V3) `open experiencia` → um `.editor-frame.is-maximized` no `<body>` com o título `~/carreira`, `#app[inert]`, foco no `.t-max`, retângulo ≥ 90% da tela; Esc → janela no lugar, `#experiencia` na tela, foco no `.t-max`, terminal ainda minimizado; restaurar o terminal pela dock → o `open experiencia` e o `→ ~/carreira` na saída; `open challenges` com a janela de Challenges fechada → maximizada e sem `[data-t-state="pending"]` nela; `open ~/projetos/comunitario` com a do Comunitário minimizada → maximizada; (V4) as 9 opções × janela aberta/minimizada/fechada em 1366 × 768 e 390 × 844 chegam ao estado final em ≤ 1 s (laço; restaurar a maximizada e o terminal entre uma e outra), com a janela de editor maximizada cobrindo ≥ 90% da tela a 1366 px e ≥ 95% a 390 px (SC-001); `open srg` disparado no meio da animação de minimizar a janela do SRG termina com ela aberta (edge case); (V5) `open`, `open xyz`, `open sobre`, `open skills`, `open projetos`, `open educacao`, `open Contato` → mensagens do contrato, `scrollY` igual, nenhum `data-window-state` mudou, terminal aberto e foco no prompt; (V6) `help` contém o bloco do `open`; `o` + Tab → `open `; `open it` + Tab → `open italiami`; `open c` + Tab → `challenges  comunitario` na saída; com `hasTouch`, `open c` mostra as sugestões e o toque em `comunitario` completa a linha; (V7) com `reducedMotion: 'reduce'`, `open italiami` e `open experiencia` sem animações (`document.getAnimations()` vazio logo depois) e com a rolagem já no lugar; em todos os testes do arquivo, coletar `pageerror` e `console.error` e exigir zero erros do site (SC-010)
- [X] T023 [US1] Rodar `npm run test:e2e`; ajustar o que depender do botão da dock fechar o terminal ou da lista de comandos (`tests/e2e/a11y.spec.ts` no teste com o terminal aberto, `tests/e2e/weight.spec.ts` no teste de terceiros que roda `find sobre`, e o `help` em `tests/e2e/dock-terminal.spec.ts`), sem afrouxar o que eles verificam

**Checkpoint**: US1 + US2 funcionais (V1–V12) — o MVP

---

## Phase 5: User Story 3 - Vinheta central original do Letter Glitch no hero (Priority: P2)

**Goal**: a vinheta central volta à do componente; a tagline ganha o halo e o `ping vittorio` o fundo opaco, só com o fundo animado; todo texto do hero ≥ 4,5:1.

**Independent Test**: quickstart V13–V15: vinheta por pixel, contraste em 10 quadros (halo pela vizinhança, resto pela caixa), sem halo com movimento reduzido, sem JS e na impressão.

### Implementation for User Story 3

- [X] T024 [P] [US3] Em `src/styles/tokens.css` (research R6, R7, data-model §5): `--glitch-vignette-center: radial-gradient(circle, rgb(0 0 0 / 0.8) 0%, transparent 60%)` (a do componente; reescrever o comentário do bloco do Letter Glitch: vinheta original pedida pelo autor na 007, contraste garantido pelo halo da tagline e pelo fundo opaco do `ping vittorio`); `--glitch-alpha` fica `0.55`; novo `--hero-halo`: `0 0 0 #000`, as 24 sombras sem desfoque nos deslocamentos inteiros (x, y) com `max(|x|, |y|)` de 1 a 2 (contorno sólido de 2 px), `0 0 4px #000` e `0 0 8px rgb(0 0 0 / 0.8)`, com comentário dos números medidos (research R7: 2,3 → 4,9–5,2:1); na impressão, `--hero-halo: none`
- [X] T025 [US3] Em `src/components/sections/HeroSection.vue` (contracts/hero-and-about.md): `:data-glitch="motion && bootDone ? '' : undefined"` no `<header id="home">` (o mesmo `v-if` do `HeroGlitch`); CSS `.hero[data-glitch] .hero-sub, .hero[data-glitch] .hero-boot .ll-text { text-shadow: var(--hero-halo); }` (a tagline e o texto do loader, que reprovam sem halo: research R7; o `.ll-text` vive no `LatticeLoader`, então a regra usa `:deep(.ll-text)`) e `.hero[data-glitch] .btn-ghost { background: color-mix(in srgb, var(--green) 12%, var(--bg)); }` (o hover do `.btn-ghost` continua vencendo); atualizar o comentário do topo do componente (vinheta original + halo, 007)
- [X] T026 [US3] Em `tests/e2e/support/contrast.ts`, criar `haloContrast(page, selector, textColor, frames)` (research R8): fixa `#home .hero-terminal { min-height: 3.6em }` durante a medição; captura a máscara (com `.hero-glitch { visibility: hidden }`, `#home { background: #000 }`, o alvo em `#fff` sem `text-shadow`) da caixa do texto + 12 px; traço = luminância > 0,25, borda antisserrilhada = > 0,05; vizinhança = pixels a até `2 × devicePixelRatio` px de um traço que não são borda; em cada quadro, com o alvo `color: transparent` (e os filhos) e o `text-shadow` mantido, a maior luminância da vizinhança; devolve o pior contraste contra `textColor`; documentar o método no comentário (critério do WCAG para texto com halo)
- [X] T027 [US3] Em `tests/e2e/hero-glitch.spec.ts` e `tests/e2e/hero-loader.spec.ts`: (V13) novo teste da vinheta original — esconder o `canvas` e a `.letter-glitch-outer`, pôr `background: #fff` no `.letter-glitch`, e amostrar a luminância no centro (≈ a de sRGB 51, ± 2 p.p. de escurecimento) e em pontos a 60% e 80% do raio (`farthest-corner` do contêiner; branco); depois, com o canvas visível, o anel a ~45% do raio mais claro que o centro; (V14) no teste de contraste em 10 quadros, medir a `.hero-sub` com `haloContrast` e os demais (`h1`, `.hero-terminal`, `.btn-primary`, `.hero-scroll`) como hoje; o `.btn-ghost` medido com o próprio fundo (não tirar o `background` dele no `hideText`); checar `getComputedStyle('.hero-sub').textShadow !== 'none'` e `textShadow === 'none'` no `h1`, na `.hero-terminal` e nos botões; extensão do halo (SC-005): com o canvas parado (aba oculta simulada, como no teste de pausa), a luminância média de faixas a 12–20 px acima, abaixo e dos lados da caixa da tagline é a mesma com e sem o `text-shadow` (± 0,002); o teste "vinhetas: cantos e centro mais escuros que o anel" continua; em `tests/e2e/hero-loader.spec.ts`, o teste "texto do loader com contraste ≥ 4,5:1" passa a medir com `haloContrast` (5 quadros por fase), em 1366 × 800 e 390 × 844, e a checar que o `.ll-text` ativo tem `text-shadow` com o fundo animado; (V15) com `reducedMotion: 'reduce'`, sem JS e com `emulateMedia({ media: 'print' })`: `.hero` sem `data-glitch`, `.hero-sub` sem `text-shadow`, `.btn-ghost` com o fundo de hoje (translúcido)
- [X] T028 [US3] Calibrar (research R7): rodar `tests/e2e/hero-glitch.spec.ts` (`--repeat-each=3`); rodar também `tests/e2e/hero-loader.spec.ts`; se a `.hero-sub` ou o texto do loader ficarem < 4,5:1, aumentar o contorno de `--hero-halo` para 3 px (deslocamentos até 3) antes de mexer no esfumado; se outro texto ficar < 4,5:1 sem halo (o `▼ scroll` no celular é o mais perto, 4,76), acrescentar o seletor dele à regra do halo em `HeroSection.vue` e à medição por `haloContrast`, e registrar em research R7 (tabela "Calibração final", com os números medidos); conferir numa captura de 1366 × 800 e 390 × 844 que as letras aparecem a menos de uma linha da tagline

**Checkpoint**: US3 funcional (V13–V15)

---

## Phase 6: User Story 4 - Texto do Sobre na cor padrão (Priority: P3)

**Goal**: o texto de `cat sobre.txt` no `--text`.

**Independent Test**: quickstart V16.

### Implementation for User Story 4

- [X] T029 [P] [US4] Em `src/components/sections/AboutSection.vue` (research R9): `class="about-text"` na `<TerminalLine output>` do `cat sobre.txt` e, no CSS com escopo, `.about-window .about-text { color: var(--text); }` com comentário (FR-022; como o `.t-desc` dos projetos); as linhas de comando, o `RichText` e os selos não mudam
- [X] T030 [US4] Em `tests/e2e/content-polish.spec.ts` (V16): a cor calculada de `#sobre .about-text` é igual à de `#projetos .t-desc` (primeiro projeto) e a `rgb(216, 210, 228)`, com JS e com `javaScriptEnabled: false`; o `.hl-green` dentro dele continua verde; as duas `#sobre .t-line` continuam com a cor de `--text-dim` (`rgb(138, 129, 158)`)

**Checkpoint**: US4 funcional (V16)

---

## Phase 7: User Story 5 - Tagline mais curta (Priority: P3)

**Goal**: "Transformando processos em sistemas escaláveis".

**Independent Test**: quickstart V17.

### Implementation for User Story 5

- [X] T031 [P] [US5] Em `src/data/resume.ts`, `profile.tagline: 'Transformando processos em sistemas escaláveis'` (FR-024, research R10); em `tests/component/RevealText.spec.ts`, usar o texto novo no exemplo
- [X] T032 [US5] Em `tests/e2e/content-polish.spec.ts` (V17): o `dist/index.html` contém `Transformando processos em sistemas escaláveis</` e não contém `agentes de IA.</`; no hero, depois da revelação (com movimento), o texto da `.hero-sub` (sem o `.sr-only`) é exatamente o novo, e o `.sr-only` também; com `reducedMotion: 'reduce'` e sem JS, idem; `<title>` e `meta[name="description"]` iguais aos de `profile.seo`; conferir que `tests/e2e/reduced-motion.spec.ts` (que procura o começo do texto) continua passando

**Checkpoint**: US5 funcional (V17)

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: acessibilidade, modos, peso e documentação

- [X] T033 Em `tests/e2e/a11y.spec.ts` (V19, SC-010): acrescentar auditorias do axe com o terminal minimizado (depois de rodar comandos) e com a janela de editor maximizada pelo `open experiencia`, em 1366 e 390 px; manter as atuais
- [X] T034 Rodar `npm run typecheck`, `npm test` e `npm run test:e2e` inteiros; corrigir regressões sem afrouxar testes; registrar no `research.md` (R12) o peso medido e, se passar do teto, o motivo e o número revisto (como a 006 fez na SC-011)
- [X] T035 Inspeção pelo quickstart no build servido localmente (`npm run preview`), com capturas em 1366 × 800 e 390 × 844, usando o Chromium com GPU (`--ignore-gpu-blocklist --enable-gpu --use-angle=gl`, memória da 005): `open` de um projeto e do editor; terminal minimizado (ponto vazado) e restaurado; hero com a vinheta original e o halo; Sobre; tagline; console sem erros; sem JS; `reducedMotion: 'reduce'`; anotar o resultado numa seção "Inspeção na implementação" do `quickstart.md`
- [X] T036 [P] Atualizar `DESIGN.md`: dock (três estados do terminal, ponto cheio/vazado, minimizar até o botão, `open` minimiza), comandos (`help`, `find`, `open`, `clear`, `exit`), Letter Glitch (vinheta central do componente, `--hero-halo` na tagline, fundo opaco do `ping vittorio`; trocar o texto da vinheta calibrada da 006), Sobre no `--text`; e `README.md` (seção do terminal: `open <OPTIONS>`, minimizar e o que o botão da dock e o Ctrl+Alt+T fazem)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depois do Setup; bloqueia US1 e US2 (o `AppDock` recebe `targets`; o registro é usado pelo `open`).
- **US2 (Phase 3)**: depois da Foundational.
- **US1 (Phase 4)**: depois da US2 (o `open` chama `minimize({ focusButton: false })`).
- **US3, US4, US5 (Phases 5–7)**: independentes entre si e das histórias de terminal; podem começar logo depois do Setup.
- **Polish (Phase 8)**: depois de todas as histórias.

### Dentro das fases

- T003 → T013 (o `App.vue` usa `openTargets`); T005 → T007 → T008, T009; T006 → T007, T008.
- T011 → T012 → T013 → T015 → T016; T014 depois de T012.
- T017 → T018, T020; T019 depois de T005, T007, T008; T020 depois de T013, T017, T019; T022 depois de T020.
- T024 → T025 → T027 → T028; T026 → T027.
- T029 → T030; T031 → T032.

### Parallel Opportunities

- Phase 2: T003, T004 e T010 (arquivos diferentes) em paralelo com T005/T006.
- Phase 3: T011 e T014 em paralelo com o começo do T013.
- Phase 4: T018 e T021 em paralelo depois de T017/T020.
- Phases 5, 6 e 7 inteiras em paralelo com as Phases 2–4 (arquivos diferentes: `tokens.css`, `HeroSection.vue`, `AboutSection.vue`, `resume.ts`, specs de hero e conteúdo).
- T036 em paralelo com T035.

## Parallel Example: depois da Foundational

```text
Agente A: T011 → T012 → T013 → T014 → T015 → T016   (US2)
Agente B: T024 → T025 → T026 → T027 → T028          (US3)
Agente C: T029 → T030, T031 → T032                  (US4, US5)
Depois: T017 → … → T023 (US1), e o polimento
```

## Implementation Strategy

### MVP First

1. Setup (T001–T002) e Foundational (T003–T010).
2. US2 (T011–T016): minimizar com a sessão guardada — validar V8–V12.
3. US1 (T017–T023): `open` — validar V1–V7. **Parar e validar o MVP** (o pedido principal do autor).

### Incremental Delivery

4. US3 (T024–T028): vinheta + halo, com a calibração medida.
5. US4 e US5 (T029–T032): cor do Sobre e tagline.
6. Polimento (T033–T036): a11y, suíte inteira, inspeção, documentação.

Cada fase termina com o checkpoint dela verde antes da próxima.
