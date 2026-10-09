---

description: "Task list for 005-access-gate-dotfield"
---

# Tasks: Porta de acesso no boot, IP real, Dot Field no hero e ajustes nas janelas

**Input**: Design documents from `specs/005-access-gate-dotfield/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md;
constituição v3.0.0

**Tests**: incluídos. O plano e o quickstart (V1–V18) pedem testes, e a suíte Vitest + Playwright é
o gate de verificação da constituição.

**Organization**: Setup e Foundational, depois uma fase por história (US1 e US2, P1; US3, US4 e US5,
P2, na ordem da spec) e o polimento.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: história da spec (US1–US5)

## Path Conventions

Projeto único: `src/`, `tests/` e `tools/` na raiz (plan.md, Project Structure).

---

## Phase 1: Setup

**Purpose**: linha de base, versão, IP simulado nos testes e entrada única pela porta nos e2e

- [X] T001 Medir a linha de base de peso (research R15): `npm run build`, depois `gzip -9c` de `dist/index.html`, `dist/assets/app-*.js` e `dist/assets/app-*.css`, somados; registrar HTML, JS, CSS e o total em KB gzip na seção R15 de `specs/005-access-gate-dotfield/research.md` (teto da feature: total + 3 KB)
- [X] T002 Levar a versão a `2.4.0` (FR-016, research R6): `npm version 2.4.0 --no-git-tag-version` (atualiza `package.json` e as duas ocorrências da raiz em `package-lock.json`); em `vite.config.ts` e em `vitest.config.ts`, ler `version` com `JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))` e declarar `define: { __PORTFOLIO_VERSION__: JSON.stringify(version) }`; em `src/env.d.ts`, `declare const __PORTFOLIO_VERSION__: string`; acrescentar no `README.md` a política "cada feature sobe a versão menor (v1 = site original, 2.0 = Vue/001, 2.1–2.3 = 002–004, 2.4 = 005)"
- [X] T003 Criar `tests/e2e/support/test.ts` (research R14, contracts/ip-lookup.md): reexporta `expect` e um `test` estendido com uma fixture automática (`{ auto: true }`) que faz `page.route('https://api.ipify.org/**', r => r.fulfill({ json: { ip: TEST_IP } }))` antes do teste; exporta `TEST_IP = '203.0.113.7'`; trocar `from '@playwright/test'` por `from './support/test'` em todos os specs de `tests/e2e/` (a11y, badges, boot, content-polish, desktop-windows, dock-terminal, header, hero-crt, layout, links, motion, no-js, projects, reduced-motion, skills, tech-icons, terminals, visual-cleanup, weight)
- [X] T004 Em `tests/e2e/support/boot.ts`, criar `enterPortfolio(page)` no lugar de `waitBootEnd` (que sai): espera até 7,5 s por uma destas condições: (a) `.gate-icon` visível → clica e espera `html` sem `booting` nem `gate` e sem `.access-gate` (timeout 6 s); (b) `html` sem `booting` e sem `.boot-screen`/`.access-gate` → volta (sem porta: JS atrasado, ou o boot antigo, que termina sozinho). Trocar `waitBootEnd` por `enterPortfolio` nos 10 specs que o usam e chamar `enterPortfolio(page)` depois de todo `page.goto` que interage com a página ou mede algo visível, inclusive nos specs que hoje emulam `reducedMotion: 'reduce'` só para fugir do boot (content-polish, tech-icons, projects, links, layout, badges, header, terminals, skills, desktop-windows, dock-terminal, visual-cleanup, a11y, reduced-motion, motion); a suíte tem de continuar verde com o boot atual (caso b)

**Checkpoint**: `npm test` e `npm run test:e2e` verdes; nenhum e2e pede nada ao ipify de verdade; todos entram pela porta quando ela existir

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: linha do tempo nova, FLIP e ícone extraídos, tokens e a barra sem maximizar

**⚠️ CRITICAL**: nenhuma história começa antes desta fase

- [X] T005 [P] Em `src/lib/boot.ts`, acrescentar (sem remover ainda `bootFrame` nem `BOOT_SEQUENCE_MS`/`BOOT_DEADLINE_MS`/`BOOT_SAFETY_MS`/`BOOT_LATEST_START_MS`, que o `BootScreen` usa até T019) a linha do tempo da 005 (data-model §2, research R3): tipos `BootPart`, `TypedPart { text; speed; cls? }`, `SessionLine { at; parts; typed? }`; `sessionLines(ip, version, lastLogin)` com as 6 linhas e os instantes 0 / 697 / 1047 / 1628 / 1838 / 2118 e velocidades 29 / 38 / 17 ms; textos exatos de contracts/access-gate.md §3 (`Conectando ao portfolio...`, `viper@portfolio password: `, `Bem-vindo ao Portfolio ${version}`); `sessionAt(elapsed, lines)`; `typedEnd(line)`; constantes `SESSION_MS = 2720`, `GATE_LATEST_START_MS = 2055`, `APP_FAILED_MS = 3900`, `FADE_MS = 550`, `OPEN_MS = 320`, `REDUCED_HOLD_MS = 1000`, `FALLBACK_IP = '127.0.0.1'`; `displayVersion(semver)` (`'2.4.0'` → `'v2.4'`)
- [X] T006 [P] Em `tests/unit/boot.spec.ts`, acrescentar um `describe('sessão da porta (005)')` (os testes antigos saem em T019): texto final das 6 linhas com `203.0.113.7`, `v2.4` e uma data fixa igual ao contrato; cada `at` ≥ `typedEnd` da linha anterior; último caractere de `./iniciar_portfolio.sh` em 2475 e `SESSION_MS = 2720 ≤ 2900` e `≤ 0,75 × 3895`; razão 005/004 de cada velocidade e pausa entre 0,69 e 0,71; `sessionAt` só cresce com o tempo; `displayVersion` ('2.4.0' → 'v2.4', '10.12.3' → 'v10.12')
- [X] T007 [P] Criar `src/lib/flip.ts` com o que hoje está no `DesktopWindow` (research R1, R10): `FLIP_MS = 320`, `FLIP_EASING`, `toward(from, to)`, `canAnimate()` (classe `motion` + `HTMLElement.prototype.animate`) e `finishAll(animations)`; `src/components/terminal/DesktopWindow.vue` passa a importá-los, sem mudar comportamento
- [X] T008 Criar `src/components/base/DesktopIcon.vue` (data-model §7) com o botão, o quadrado, o glifo (`FileText` / `FileTerminal` / `FolderCode` por `kind`), o rótulo e todo o CSS do ícone hoje em `DesktopWindow.vue`; props `title`, `kind`, `describedby?`; `aria-label="Abrir <title>"`; `defineExpose({ square })` com o elemento `.desktop-icon-square`; `DesktopWindow.vue` passa a usá-lo (mesmo HTML e classes: `desktop-icon`, `desktop-icon-square`, `desktop-icon-label`); `tests/component/DesktopWindow.spec.ts` continua passando (depende de T007)
- [X] T009 [P] Em `src/styles/tokens.css`, acrescentar (data-model §5), cada um com comentário do FR: `--dots-from: var(--purple-glow)`, `--dots-to: var(--green-bright)`, `--dots-glow: var(--purple-light)`, `--dots-from-alpha: 0.45`, `--dots-to-alpha: 0.35`, `--dots-glow-alpha: 0.35`, `--gate-window-width: 680px`; atualizar o comentário de `--boot-panel` (passa a ser a penumbra sob o ícone e a dica, R8)
- [X] T010 [P] Em `src/components/terminal/TerminalBar.vue`, prop `maximizable` (padrão `true`): com `false`, o `.t-max` não é renderizado em nenhum modo (FR-006); em `src/components/terminal/TerminalWindow.vue`, prop `maximizable` (padrão `true`) repassada à barra; sem mudança no HTML publicado

**Checkpoint**: `npm run typecheck`, `npm test` e o build passam; o site não mudou

---

## Phase 3: User Story 1 - Porta de acesso `acessar_portfolio.sh` (Priority: P1) 🎯 MVP

**Goal**: a página só abre depois do clique no ícone e da sessão completa, digitada pelo TextType numa
janela fixa com minimizar (continua) e fechar (encerra, permite tentar de novo); sem animação com
"reduzir movimento"

**Independent Test**: quickstart V1–V8 e V11 (com o IP de reserva `127.0.0.1` até a US2)

### Tests for User Story 1

- [X] T011 [P] [US1] Criar `tests/component/TextType.spec.ts` (data-model §3): com `vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })`, `typingSpeed: 20` → 1 caractere em 0 ms, 3 em 40 ms; `startAt` 100 ms no passado → já mostra 6 caracteres na montagem (relógio, sem deriva); `complete` emitido uma única vez; `instant` mostra tudo e o cursor sem a classe que pisca; `reserve` renderiza o resto com `visibility: hidden`; `showCursor: false` sem cursor; nenhum import de `gsap`
- [X] T012 [P] [US1] Criar `tests/component/AccessGate.spec.ts` (data-model §1, tabela de transições), com `html` em `js booting motion` e timers e `performance` falsos: monta em `idle`, põe `gate` e `inert` nos irmãos; clicar no ícone → `open`; avançar `OPEN_MS + SESSION_MS` → `done`, depois `FADE_MS` → sem `gate`, `booting` nem `inert`; `open` → minimizar → avançar até o fim → `done` (continua minimizada); `open` → fechar → `idle`, e a nova abertura começa na linha 1; montagem com `performance.now()` > 2055 → nada renderizado e `booting` removido; sem a classe `motion` → no clique, as 6 linhas visíveis na hora e `done` em `REDUCED_HOLD_MS`
- [X] T013 [P] [US1] Criar `tests/e2e/access-gate.spec.ts` (projeto `chromium`, sem WebGL), um teste por cenário: V1 (só ícone + dica no centro, foco no ícone, `#app > *:not(.access-gate)` com `inert`, Tab não sai da porta), V2 (abre por clique, por Enter e por Espaço em ≤ 400 ms; três cliques seguidos no ícone abrem uma janela só e não reiniciam a sessão; altura da `.gate-window` constante em amostras a cada 100 ms; só `.t-min` e `.t-close`; cursor só na linha em curso; teclas (Esc, Enter, Espaço) e cliques na janela durante a sessão não mudam o instante do fim, FR-019), V4 (minimizar 300 ms depois de abrir, reabrir 600 ms depois: linhas já digitadas, sem recomeçar, e a dica visível enquanto minimizada; minimizar durante a animação de abrir também funciona; minimizada até o fim → página aberta), V5 (fechar no meio e depois do último caractere: página coberta 4 s depois, foco no ícone, dica visível, status "Conexão encerrada", reabrir começa na linha 1), V6 (`reducedMotion: 'reduce'`: sem canvas na porta, 6 linhas na hora, página descoberta ≤ 1200 ms do clique, sem fade), V7 (bundle atrasado 2,5 s → sem porta; bundle bloqueado → capa sai em ~2,1 s), V8 (`/#projetos` → no fim, `#projetos` no topo e com o foco), 320 px (janela inteira sem rolagem horizontal) e dica "toque" com `hasTouch` + `isMobile`
- [X] T014 [P] [US1] Reescrever `tests/e2e/boot.spec.ts` (projeto `webgl`) para a porta: Faulty Terminal atrás do ícone; contraste ≥ 4,5:1 do nome do ícone e da dica em 10 quadros (`support/contrast.ts`, V11); do clique à página descoberta ≤ 4000 ms em 10 cargas a 1366 px e 10 a 390 px com CPU 4× mais lenta (CDP `Emulation.setCPUThrottlingRate`, V3); sessão inteira (última linha com `./iniciar_portfolio.sh` completo) antes da saída; sem WebGL → porta com fundo liso

### Implementation for User Story 1

- [X] T015 [US1] Vendorizar `src/components/vendor/vue-bits/TextType.vue` a partir de `DavidHDev/vue-bits@07c0f76` `src/content/TextAnimations/TextType/TextType.vue`, com cabeçalho de origem, licença (MIT + Commons Clause) e as modificações R3 1–6; props e padrões exatamente os da tabela do data-model §3 (`as: 'span'`, `cursorCharacter: '▊'`, `loop: false`, `startAt`, `instant`, `reserve`); emite `complete` uma vez; tique de 16 ms com `setTimeout` guiado por `performance.now()`; cursor com a classe `cursor` do site (pisca com `motion`, parado em `instant`); `reserve` → `<span class="text-type-ghost" aria-hidden="true">` com o resto em `visibility: hidden`; limpa o timer no `onBeforeUnmount`
- [X] T016 [US1] Criar `src/components/terminal/AccessGate.vue` conforme contracts/access-gate.md §2 e o data-model §1: montagem (regras do R2: `booting` ausente ou `performance.now() > GATE_LATEST_START_MS` → tira `booting` e não renderiza); `html.gate`; `inert` em todo irmão dentro de `#app`; Faulty Terminal (tint `--green-bright`) só com `motion`; `.gate-stage` em grade de uma célula com `.gate-launcher` (`DesktopIcon` com `title="acessar_portfolio.sh"`, `kind="script"`, classe `gate-icon`, `describedby="gate-hint"`, e a dica `# clique no ícone para conectar` / `# toque no ícone para conectar` por `(hover: none) and (pointer: coarse)`, sobre a penumbra radial `--boot-panel`, R8) e `.gate-window` (largura `min(var(--gate-window-width), 100% - 2rem)`, `TerminalWindow` com `title="acessar_portfolio.sh"`, `:animate="false"`, `:maximizable="false"`, dentro de `provide(WINDOW_CONTROLS, …)` com `minimize`/`close`); as 6 linhas sempre no DOM (`.boot-line`, `.boot-pending` com `visibility: hidden` até `sessionAt`), trechos digitados com `TextType` (`reserve`, `startAt = início + at`, `instant` sem `motion`), cursor de largura zero (R4); IP de cada sessão = `FALLBACK_IP` (a US2 liga a consulta); FLIP de abrir/minimizar/fechar com `lib/flip.ts` (finaliza a animação em curso antes de outra); foco e `role="status"` conforme o contrato §5; fim: fade `FADE_MS` (imediato sem `motion`), tira `gate`, `booting` e `inert`, foco no alvo de `location.hash` (rolado até ele) ou no `#home`, com `tabindex="-1"` temporário; `onBeforeUnmount` limpa timers e `inert`
- [X] T017 [US1] Reescrever o script inline de `index.html` (research R2, contracts/access-gate.md §1): `booting` sempre com JS; `at(2055, …)` sem `app-loaded` → tira `booting`; `at(3900, …)` sem `app-loaded` → tira `booting` e `motion`, põe `app-failed`; com `app-loaded` e sem `gate` → tira `booting`; nenhum `at(7000, …)`; comentário do bloco citando a constituição v3.0.0 e os FR-010 a FR-012; ajustar o comentário de `src/main.ts`
- [X] T018 [US1] Em `src/App.vue`, `AccessGate` no lugar de `BootScreen`; em `src/styles/base.css`, `.access-gate` na lista do `@media print` (no lugar de `.boot-screen`) e a capa `html.booting::before` com comentário atualizado; revisar os comentários que citam o teto de 7 s ou o boot omitido com movimento reduzido em `src/composables/useTerminalTyping.ts`, `src/components/layout/AppNav.vue` e `src/components/sections/HeroSection.vue`
- [X] T019 [US1] Remover `src/components/terminal/BootScreen.vue`; em `src/lib/boot.ts`, remover `bootFrame`, `BOOT_SEQUENCE_MS`, `BOOT_DEADLINE_MS`, `BOOT_SAFETY_MS`, `BOOT_LATEST_START_MS` e o painel antigo, e reescrever o comentário do topo (sessão da porta, R3); em `tests/unit/boot.spec.ts`, remover o `describe` da 004 e trocar o teste do script inline por: contém `at(2055,` e `at(3900,`, e não contém `7000`
- [X] T020 [US1] Fechar `enterPortfolio` em `tests/e2e/support/boot.ts` no caso (a) e ajustar os specs que dependiam do boot antigo: `tests/e2e/reduced-motion.spec.ts` (com movimento reduzido a porta aparece, sem canvas, e a página abre ≤ 1,2 s depois do clique), `tests/e2e/motion.spec.ts` (JS atrasado sem porta), `tests/e2e/no-js.spec.ts` (sem `.access-gate` nem `booting` no HTML sem JS), `tests/e2e/header.spec.ts` e `tests/e2e/dock-terminal.spec.ts` (dock só depois do acesso); rodar `npm test` e `npm run test:e2e` e corrigir até ficarem verdes

**Checkpoint**: a porta funciona de ponta a ponta com `127.0.0.1`; MVP entregável

---

## Phase 4: User Story 2 - Sessão SSH com o IP do visitante e a versão do portfólio (Priority: P1)

**Goal**: o IP público (ipify) nas linhas 1 e 5, com `127.0.0.1` de reserva, e a versão `v2.4`

**Independent Test**: quickstart V9 e V10

### Tests for User Story 2

- [X] T021 [P] [US2] Criar `tests/unit/visitor-ip.spec.ts` (contracts/ip-lookup.md, "Testes"): com `fetch` simulado, `{"ip":"203.0.113.7"}` → `'203.0.113.7'`; IPv6, `'256.1.1.1'`, `'01.2.3.4'`, texto, JSON inválido, `status 500`, erro de rede e tempo esgotado (timers falsos, 5000 ms) → `null`; nunca rejeita; `console.error`/`warn`/`log` nunca chamados (espiões); o pedido usa `IP_SERVICE_URL`, `credentials: 'omit'`, `referrerPolicy: 'no-referrer'`, `cache: 'no-store'` e um `signal`
- [X] T022 [P] [US2] Criar `tests/unit/version.spec.ts`: `displayVersion(__PORTFOLIO_VERSION__)` igual a `v<maior>.<menor>` lido de `package.json` com `fs` (SC-004) e igual a `v2.4`
- [X] T023 [P] [US2] Criar `tests/e2e/session.spec.ts` (projeto `chromium`): com a fixture, as 6 linhas no fim da sessão iguais ao contrato §3 (data de "Last login" no formato `dd/mm/aaaa, hh:mm:ss`), com `203.0.113.7` nas linhas 1 e 5; com `page.route` → `abort()`, `127.0.0.1` nas duas e nenhum erro de console além da falha de rede do próprio navegador para `api.ipify.org`; com a resposta atrasada 6 s, `127.0.0.1` sem atrasar a sessão; um único pedido ao ipify por carga, mesmo fechando e abrindo de novo; com o IP chegando depois da 1ª abertura (atraso de 1,5 s, clique imediato), a 1ª sessão usa `127.0.0.1` e a 2ª (depois de fechar) usa o IP; resposta `{"ip":"2001:db8::1"}` (IPv6) → `127.0.0.1`; depois do acesso, `localStorage`, `sessionStorage` e `document.cookie` não contêm o IP (FR-015)

### Implementation for User Story 2

- [X] T024 [US2] Criar `src/lib/visitor-ip.ts` conforme contracts/ip-lookup.md: `IP_SERVICE_URL = 'https://api.ipify.org?format=json'`, `isIPv4(value)` (quatro octetos 0–255, sem zero à esquerda), `lookupVisitorIp(timeoutMs = 5000): Promise<string | null>` com `AbortController`, `credentials: 'omit'`, `referrerPolicy: 'no-referrer'`, `cache: 'no-store'`; qualquer falha → `null`, sem `console.*` e sem lançar
- [X] T025 [US2] Em `src/components/terminal/AccessGate.vue`, começar `lookupVisitorIp()` uma vez quando a porta aparece e guardar o valor ao resolver; no início de cada sessão, `ip = valor ?? FALLBACK_IP` (sem esperar) e `lastLogin = new Date().toLocaleString('pt-BR')`; a versão da linha 4 vem de `displayVersion(__PORTFOLIO_VERSION__)`
- [X] T026 [US2] Em `tests/e2e/weight.spec.ts`, aceitar `api.ipify.org` (além de `img.shields.io`) na checagem de pedidos a terceiros e trocar a espera do boot por `enterPortfolio`; confirmar que nenhum outro host aparece

**Checkpoint**: sessão com o IP do visitante e a versão; falha do serviço não muda nada além do IP

---

## Phase 5: User Story 3 - Fundo Dot Field no hero (Priority: P2)

**Goal**: CRT e chuva Matrix fora; Dot Field roxo → verde, com cintilação e halo, parado fora da tela
e ausente com movimento reduzido

**Independent Test**: quickstart V15–V17

### Tests for User Story 3

- [X] T027 [P] [US3] Criar `tests/e2e/hero-dots.spec.ts` (projeto `chromium`; o Dot Field não usa WebGL) no lugar de `tests/e2e/hero-crt.spec.ts`: depois de `enterPortfolio`, `#home canvas` presente e nenhum `.hero-crt`; média de cor dos pontos no quadrante superior esquerdo com mais azul/vermelho que verde e no inferior direito com mais verde (V15); halo (`circle` do SVG) com opacidade > 0 depois de `page.mouse.move` em vários passos e voltando a ~0 parado; contraste ≥ 4,5:1 do texto do hero em 10 quadros, em 1366 × 800 e em 390 × 844 (`support/contrast.ts`, V16, SC-008); sem redesenho com o hero fora da tela (espiar `CanvasRenderingContext2D.prototype.fill` por `addInitScript` e contar chamadas por 1 s rolado para o fim); `emulateMedia({ reducedMotion: 'reduce' })` no meio da visita → canvas some e o saldo de `addEventListener`/`removeEventListener` de `mousemove` e `resize` na `window` (espiados por `addInitScript`) volta a zero (FR-033); nenhum erro de console (V17)

### Implementation for User Story 3

- [X] T028 [US3] Vendorizar `src/components/vendor/vue-bits/DotField.vue` a partir de `DavidHDev/vue-bits@07c0f76` `src/content/Backgrounds/DotField/DotField.vue`, com cabeçalho de origem, licença e as modificações R12 1–5: props e padrões da tabela do data-model §4 (padrões do componente mantidos; os valores do autor vêm do `HeroDots`); ouvintes de `resize`/`mousemove` guardados e removidos de verdade; canvas redesenhado só quando `frameCount >> 3` muda ou no resize; métodos `pause()`/`resume()` expostos que param e retomam o `requestAnimationFrame` e o `setInterval` da velocidade; CSS com escopo no lugar das classes do Tailwind; raiz com `aria-hidden="true"` e `pointer-events: none`
- [X] T029 [US3] Criar `src/components/terminal/HeroDots.vue`: lê `--dots-from`/`--dots-to`/`--dots-glow` com `tokenRgb` e as transparências `--dots-*-alpha` com `getPropertyValue`, monta as três cores `rgba()`; renderiza `DotField` com `dot-radius 2`, `cursor-force 0`, `bulge-only false`, `sparkle true`, `glow-radius 80` (FR-029, FR-030), em `position: absolute; inset: 0` com a entrada suave de 0,6 s do CRT; `IntersectionObserver` no `#home` chama `pause()`/`resume()`; em `src/components/sections/HeroSection.vue`, `defineAsyncComponent(() => import('@/components/terminal/HeroDots.vue'))` montado com `motion && bootDone` (sem `hasWebGL`) e comentários do bloco atualizados (FR-028 a FR-033)
- [X] T030 [US3] Remover o CRT e a chuva (FR-028, research R13): `src/components/vendor/vue-bits/CrtWarp.vue`, `src/components/terminal/HeroCrt.vue`, `src/lib/scenes/crt.ts`, `src/workers/crt.worker.ts`, `src/lib/matrix-rain.ts`, `tests/unit/matrix-rain.spec.ts`, `tests/e2e/hero-crt.spec.ts`; atualizar o cabeçalho de `src/lib/webgl.ts` (sem o CRT) e o `WEBGL` de `playwright.config.ts` (`boot|motion|weight`); `grep -ri "crt\|matrix" src tests` sem sobras além de comentários históricos justificados
- [X] T031 [US3] Calibrar `--dots-from-alpha`, `--dots-to-alpha` e `--dots-glow-alpha` em `src/styles/tokens.css` por screenshot do hero em 1366 × 800 e 390 × 844 (Playwright, `.playwright-mcp/`), com o T027 verde; registrar os valores finais e o porquê em `specs/005-access-gate-dotfield/research.md` (R12)

**Checkpoint**: hero com Dot Field; nenhum arquivo do CRT; `hero-dots.spec.ts` verde

---

## Phase 6: User Story 4 - Controles das janelas com ícones centrados (Priority: P2)

**Goal**: `minus`, `maximize-2` e `x` do Lucide, centrados nos círculos, em todas as janelas

**Independent Test**: quickstart V12

### Tests for User Story 4

- [X] T032 [P] [US4] Criar `tests/e2e/window-controls.spec.ts`: em `sobre.txt`, no SRG, em `contato.sh`, no terminal da dock e na janela da porta, cada `.t-btn` presente tem um `svg` (`lucide-minus`, `lucide-maximize-2`, `lucide-x`) de 12 × 12 px cujo centro fica a ≤ 0,5 px do centro do botão em x e y (SC-005); a porta não tem `.t-max`; com `javaScriptEnabled: false`, os três SVGs existem num contêiner `aria-hidden="true"`; os nomes acessíveis dos botões funcionais não mudaram

### Implementation for User Story 4

- [X] T033 [US4] Em `src/components/terminal/TerminalBar.vue`, trocar `−`/`□`/`✕` por `Minus`/`Maximize2`/`X` do `@lucide/vue` (`:size="12"`, `:stroke-width="2.5"`, `aria-hidden="true"`, `display: block`) nos modos decorativo e funcional (inclusive o `−` decorativo da dock); remover o ajuste `.t-max { padding-bottom }` e o `font-size` dos glifos; ajustar `tests/component/DesktopWindow.spec.ts` e `tests/component/DockTerminal.spec.ts` se conferem o texto dos glifos

**Checkpoint**: controles com ícones Lucide centrados em todas as janelas, com e sem JS

---

## Phase 7: User Story 5 - Ícones minimizados alinhados e responsivos (Priority: P2)

**Goal**: o ícone do Contato à esquerda; ícones dos projetos lado a lado (2 / 5 / 6 por linha)

**Independent Test**: quickstart V13 e V14

### Tests for User Story 5

- [X] T034 [P] [US5] Criar `tests/e2e/minimized-layout.spec.ts`: em 320, 768, 1366 e 1920 px, Contato minimizado → `icon.left − h2.left` ≤ 1 px e igual (±1 px) ao do Sobre minimizado; aberto, a janela tem ≤ 720 px e está centralizada; no primeiro quadro do encolhimento, o quadro está no retângulo da janela centralizada (±2 px); os 6 projetos minimizados → 3 / 2 / 1 / 1 linhas (contando `top` distintos dos ícones) em 320 / 768 / 1366 / 1920 px e 1 linha em 1024 px, na ordem dos dados, primeiro ícone alinhado ao `h2`; com o 2º projeto reaberto → ícone 1 numa linha, janela 2 em linha própria de largura total, ícones 3–6 numa linha; distância vertical entre janelas abertas = 22,4 px (±1); `document.documentElement.scrollWidth ≤ clientWidth` em cada quadro (`requestAnimationFrame`) durante o minimizar de um projeto a 320 px

### Implementation for User Story 5

- [X] T035 [US5] Em `src/components/terminal/DesktopWindow.vue`, `hide()` com o FLIP do research R10: depois da mudança de estado e do `nextTick`, medir o retângulo atual do quadro (`now`) e animar de `toward(now, first)` para `toward(now, target)` (com `opacity` 1 → 0), mantendo a animação da altura do contêiner e a do ícone; `open()` sem mudança de lógica
- [X] T036 [US5] Em `src/components/sections/ContactSection.vue`, aplicar `margin-inline: auto` e `max-width: 720px` só em `.contact-slot[data-window-state="open"]`; minimizada ou fechada, a caixa ocupa a largura da seção (FR-025)
- [X] T037 [US5] Em `src/components/sections/ProjectsSection.vue`, `.projects-grid` com `display: flex; flex-wrap: wrap; align-items: flex-start; gap: calc(var(--spacing) * 2)` e margem de cima de `calc(var(--spacing) * 4.2)`; `li:has(> .desktop-window[data-window-state="open"])` com `flex: 1 0 100%` e `margin-block: calc(var(--spacing) * 1.8)`; demais `li` com `flex: 0 0 auto` (research R11, FR-026, FR-027); conferir `tests/e2e/projects.spec.ts` e `tests/e2e/desktop-windows.spec.ts` (espaços e posições) e ajustar o que mediam da grade antiga

**Checkpoint**: Contato e projetos minimizados conforme o clarify, sem rolagem horizontal

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: acessibilidade, sem JS, peso, documentação e a verificação final da constituição

- [X] T038 [P] Em `tests/e2e/a11y.spec.ts`, auditoria axe (0 violações) e console sem erros do site nos estados: porta (ícone), janela aberta, janela minimizada, página depois do acesso, porta com movimento reduzido; a página sem JS continua auditada como antes (SC-010)
- [X] T039 [P] Em `tests/e2e/no-js.spec.ts`, confirmar: nenhum `.access-gate`, `booting` nem pedido ao ipify sem JS; conteúdo completo; janelas abertas com os três ícones Lucide decorativos (FR-024); impressão sem a porta nem canvas do hero
- [X] T040 Medir o peso final como no T001 e comparar: HTML + CSS + JS iniciais ≤ linha de base + 3 KB gzip e `tests/e2e/weight.spec.ts` ≤ 500 KB (SC-009); registrar os números e os pedaços à parte (`HeroDots`, Faulty) em `specs/005-access-gate-dotfield/research.md` (R15)
- [X] T041 [P] Atualizar `DESIGN.md`: porta de acesso (ícone central, dica, penumbra, janela fixa só com minimizar/fechar, sessão e tempos), Dot Field no lugar do CRT e da chuva Matrix, controles com ícones Lucide, ícones minimizados lado a lado e o Contato à esquerda, tokens novos (`--dots-*`, `--gate-window-width`)
- [X] T042 [P] Atualizar `README.md`: porta de acesso e o comportamento com movimento reduzido; consulta do IP ao ipify (o que é enviado, a reserva `127.0.0.1`, nada guardado); Dot Field; a versão do `package.json` (política já escrita no T002)
- [X] T043 Verificação final (Fluxo de Trabalho da constituição): `npm run typecheck`, `npm test`, `npm run test:e2e`; percorrer o quickstart V1–V18 no `npm run preview` com Playwright em 1366 × 800 e 390 × 844 (screenshots em `.playwright-mcp/`), com movimento reduzido, sem JS, sem WebGL e com o ipify bloqueado; console sem erros do site; marcar no `specs/005-access-gate-dotfield/quickstart.md` o que ficar só para a inspeção manual do autor (GPU real, IP real, celular físico)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências. T003 antes de T004 (os dois tocam os mesmos specs).
- **Foundational (Phase 2)**: depende do Setup. T007 → T008 (mesmo arquivo `DesktopWindow.vue`); T005,
  T006, T009 e T010 em paralelo.
- **US1 (Phase 3)**: depende da Foundational inteira (linha do tempo, FLIP, ícone, tokens, barra sem
  maximizar).
- **US2 (Phase 4)**: depende da US1 (T025 mexe no `AccessGate`); T021, T022 e T023 podem ser escritos
  em paralelo à US1.
- **US3 (Phase 5)**: depende só da Foundational (tokens) e do `enterPortfolio`; independe de US1/US2
  no código, mas os e2e entram pela porta (US1 pronta para o e2e passar).
- **US4 (Phase 6)**: depende de T010 (`maximizable`); o e2e da porta (parte do T032) depende da US1.
- **US5 (Phase 7)**: depende de T007/T008 (FLIP e ícone extraídos).
- **Polish (Phase 8)**: depois de todas as histórias.

### User Story Dependencies

- **US1 (P1)**: base de tudo que entra pela porta; MVP.
- **US2 (P1)**: estende o `AccessGate` da US1.
- **US3, US4, US5 (P2)**: independentes entre si (arquivos diferentes: hero; `TerminalBar`;
  `DesktopWindow`/seções); podem ir em paralelo depois da US1.

### Within Each User Story

- Testes escritos primeiro e falhando; depois a implementação; checkpoint com a suíte verde.

### Parallel Opportunities

- Setup: T001 e T002 em paralelo; T003 → T004.
- Foundational: T005, T006, T007, T009, T010 em paralelo; T008 depois de T007.
- US1: T011, T012, T013, T014 em paralelo; T015 → T016 → T017/T018 → T019 → T020.
- US2: T021, T022, T023 em paralelo; T024 → T025 → T026.
- Depois da US1: US3 (T027–T031), US4 (T032–T033) e US5 (T034–T037) em paralelo.
- Polish: T038, T039, T041, T042 em paralelo; T040 e T043 por último.

---

## Parallel Example: User Story 1

```text
# testes da US1 juntos (arquivos diferentes):
T011 tests/component/TextType.spec.ts
T012 tests/component/AccessGate.spec.ts
T013 tests/e2e/access-gate.spec.ts
T014 tests/e2e/boot.spec.ts
```

## Parallel Example: depois da US1

```text
# três histórias P2 em paralelo (sem arquivo em comum):
US3: T027 → T028 → T029 → T030 → T031   (hero, vendor/DotField, HeroDots)
US4: T032 → T033                        (TerminalBar)
US5: T034 → T035 → T036 → T037          (DesktopWindow, ContactSection, ProjectsSection)
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup (T001–T004) e Foundational (T005–T010).
2. US1 (T011–T020): porta completa com `127.0.0.1`.
3. **Parar e validar**: quickstart V1–V8 e V11; o site já pode ser publicado assim.

### Incremental Delivery

1. + US2 (IP e versão) → sessão final do autor.
2. + US3 (Dot Field) → hero novo e remoção do CRT.
3. + US4 (controles Lucide) → acabamento das janelas, inclusive a da porta.
4. + US5 (ícones minimizados) → layout dos ícones.
5. Polish → a11y, sem JS, peso, documentação e verificação final.

Cada incremento termina com `npm test` e `npm run test:e2e` verdes.
