---

description: "Task list for 009-homeserver-bomjesus-challenge"
---

# Tasks: Challenge Bom Jesus (FAE) e o side-project DebianServer

**Input**: Design documents from `specs/009-homeserver-bomjesus-challenge/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md;
constituição v3.1.0 (commit `cbf86ae`)

**Tests**: incluídos. O plano e o quickstart (V1–V17) pedem testes, e a suíte Vitest + Playwright é o
gate de verificação da constituição.

**Organization**: Setup e Foundational, depois uma fase por história, na ordem de prioridade: US1 (P1, o
DebianServer), US2 (P2, o challenge Bom Jesus (FAE)) e US3 (P3, o `open debianserver`), e o polimento.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: história da spec (US1, US2, US3)

## Path Conventions

Projeto único: `src/`, `tests/`, `tools/` e `public/` na raiz (plan.md, Project Structure).

---

## Phase 1: Setup

**Purpose**: linha de base de peso, versão e os assets gerados (captura em WebP e ícones novos)

- [X] T001 Medir a linha de base de peso da 008 (research R10): `npm run build` no estado atual (commit `965f4ee` + a constituição), depois somar o `gzip -9` de `dist/index.html` e dos `dist/assets/*.js|css` referenciados nele, sem os workers (o método do teste). Em `tests/e2e/weight.spec.ts`, no teste "HTML + CSS + JS iniciais", trocar a linha de base `109532` pelo número medido (nas três ocorrências: `console.log`, `expect` e comentário) e o teto para `+ 4 * 1024` (SC-004), com o comentário da feature 009 (o histórico da 005 à 008 fica no comentário); título do teste "≤ linha de base + 4 KB"; anotar o número em `specs/009-homeserver-bomjesus-challenge/research.md` (R10)
- [X] T002 Levar a versão a `2.8.0` (FR-025, research R12): `npm version 2.8.0 --no-git-tag-version` (atualiza `package.json` e `package-lock.json`); trocar `v2.7` por `v2.8` em `tests/unit/version.spec.ts` (título e expectativa), `tests/e2e/session.spec.ts` (texto e título), `tests/component/AccessGate.spec.ts` e no comentário de `src/lib/boot.ts`; no `README.md` (seção da versão), `v2.7` → `v2.8` e "2.7 a 008" → "2.7 a 008 e 2.8 a 009"
- [X] T003 [P] Criar `tools/build-screenshots.mjs` (research R4), no estilo de `tools/build-favicon.mjs` (Chromium do `@playwright/test`, comentário de topo com o propósito, o uso e as saídas): um manifesto no topo com a fonte `tools/source/debianserver/painel-casaos-2026-10-20.png` e as saídas `public/projetos/debianserver/painel-2026-10-20-800.webp` (largura 800, qualidade 0.85; analyze I2) e `public/projetos/debianserver/painel-2026-10-20-1396.webp` (largura 1396 = original, qualidade 0.9); para cada saída, abrir a imagem numa página em branco (como data URL), desenhar num `<canvas>` da largura pedida (altura proporcional, arredondada) com `imageSmoothingQuality = 'high'`, exportar com `canvas.toBlob('image/webp', q)` e gravar; imprimir largura × altura e tamanho de cada arquivo e falhar (exit 1) se a de 800 passar de 120 KB ou a de 1396 passar de 300 KB (SC-003). Rodar `node tools/build-screenshots.mjs` e conferir os dois arquivos (800 × 464 e 1396 × 809)
- [X] T004 [P] Estender `tools/build-tech-icons.mjs` (research R3): (a) `DEVICON` ganha `spring: 'original'` e `debian: 'plain'`; (b) manifesto novo `SIMPLE_ICONS` com versão fixa `SIMPLE_ICONS_VERSION = '15.22.0'` e os slugs `h2database`, `tailscale`, `ollama`, `ente`, `kiwix`, `syncthing`, `searxng`, `watchtower`, baixados de `https://cdn.jsdelivr.net/npm/simple-icons@${SIMPLE_ICONS_VERSION}/icons/<slug>.svg` para uma pasta `raw-simpleicons` (símbolos `simpleicons-<slug>`, svgo com precisão 1, tirar o `<title>`; corpo `<g fill="currentColor">${decolor(inner)}</g>`); (c) `DASHBOARD` ganha `casaos: 'svg/casaos.svg'`, `'open-webui': 'svg/open-webui.svg'` e `'samba-server': 'svg/samba-server.svg'`: no `open-webui`, converter o `<circle cx="250" cy="250" r="250"/>` num caminho (`M0 250a250 250 0 1 0 500 0a250 250 0 1 0-500 0z`) e juntá-lo ao caminho branco num só `<path fill-rule="evenodd">` (o "OI" vira recorte, como o `knockout()` do SAP); no `samba-server`, tirar `<defs>`, `<style>` e o `class` antes do svgo (o degradê vira `currentColor`); no `casaos`, tirar os `opacity` (as três bolas viram uma silhueta só); (d) o `NOTICE.md` gerado ganha a seção "simple-icons 15.22.0 — 8 ícones" com a fonte, os símbolos e o texto da licença baixado de `https://cdn.jsdelivr.net/npm/simple-icons@${SIMPLE_ICONS_VERSION}/LICENSE.md` (CC0-1.0), e a seção do dashboard-icons passa a citar os 4 ícones; (e) o comentário do topo passa a dizer a ordem devicon → vectorlogo.zone → simple-icons → dashboard-icons → Lucide (feature 009). Rodar `node tools/build-tech-icons.mjs --preview /tmp/icons-009.html`, abrir a prévia no Playwright e conferir os 13 ícones novos a 16 e 32 px; se CasaOS, OpenWebUI ou Samba virar borrão, trocar pela reserva do Lucide do R3 (`house`, `message-square`, `folder-tree`) no manifesto `LUCIDE` e anotar a troca em research.md (R3)

**Checkpoint**: build verde; os WebP existem e cabem nos tetos; o sprite tem os 13 símbolos novos (o teste "todo símbolo do sprite é usado" fica vermelho até a T006)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: os tipos, o registro de ícones e as regras de validação, de que as três histórias dependem

**⚠️ CRITICAL**: nenhuma história começa antes desta fase

- [X] T005 Em `src/types/resume.ts` (data-model §1): `TechName` ganha `'CasaOS' | 'Debian' | 'Ente Photos' | 'H2' | 'Kiwix' | 'Ollama' | 'OpenWebUI' | 'Samba' | 'SearXNG' | 'Spring Boot' | 'Syncthing' | 'Tailscale' | 'Watchtower'` (na ordem alfabética da união); `TechIconId` ganha `` `simpleicons-${string}` ``; `ProjectKind` ganha `'side-project'`; criar `Detail` (`label` "Minúsculas, sem acento nem espaço: `hardware`, `sistema`, `acesso`", `value`), `ServerApp` (`name: TechName`, `summary`) e `Screenshot` (`src`, `srcWidth`, `full`, `width`, `height`, `alt`, `caption`, `captured: YearMonth`), com os comentários do data-model; `ProjectBase` ganha `inProductionSince?: YearMonth` ("Nunca com `inProgress`"), `details?: NonEmpty<Detail>` e `apps?: NonEmpty<ServerApp>`; a união `Project` ganha `screenshot?: never` nas 3 variantes de hoje e a 4ª variante `ProjectBase & { kind: 'side-project'; evidence: []; screenshot: Screenshot; confidential?: never; noEvidenceReason?: never }`, com o comentário "Princípio II v3.1.0: infraestrutura pessoal sem acesso público, comprovada pela captura"; atualizar o comentário do topo do arquivo (mudanças da 009) e o comentário das exceções do Princípio II sobre `Project`
- [X] T006 Em `src/lib/tech-icons.ts` (research R3): `Spring Boot: 'devicon-spring'` e `Debian: 'devicon-debian'` no bloco devicon; bloco novo "simple-icons (CC0), desenhados para uma cor só: logotipos que faltam no devicon e no vectorlogo.zone (feature 009)" com `H2: 'simpleicons-h2database'`, `Tailscale: 'simpleicons-tailscale'`, `Ollama: 'simpleicons-ollama'`, `'Ente Photos': 'simpleicons-ente'`, `Kiwix: 'simpleicons-kiwix'`, `Syncthing: 'simpleicons-syncthing'`, `SearXNG: 'simpleicons-searxng'`, `Watchtower: 'simpleicons-watchtower'`; no bloco do dashboard-icons, `CasaOS: 'dashboard-casaos'`, `OpenWebUI: 'dashboard-open-webui'`, `Samba: 'dashboard-samba-server'` (ou os ids do Lucide, se a T004 usou a reserva); atualizar o comentário do topo (ordem das fontes)
- [X] T007 [P] Em `tests/unit/tech-icons.spec.ts`: o teste da ordem das fontes passa a aceitar `simpleicons` no regex (`/^(devicon|vectorlogo|simpleicons|dashboard|lucide)-[a-z0-9-]+$/`) e o título a citar devicon → vectorlogo.zone → simple-icons → dashboard-icons → Lucide; teste novo da feature 009: os 8 ids `simpleicons-*` de `TECH_ICONS` existem no sprite, e o `dashboard-open-webui` (se não caiu na reserva) tem `fill-rule="evenodd"`. Em `tests/e2e/tech-icons.spec.ts`, no teste "ícones sem requisição a terceiros", o regex passa a pegar também `simple-icons` e `dashboard-icons`
- [X] T008 [P] Em `src/components/sections/ProjectCard.vue`, só para o tipo compilar: `KIND_LABEL` ganha `'side-project': 'side-project'`
- [X] T009 [P] Em `tests/unit/resume.data.spec.ts`, as regras do data-model §3 que não dependem de inventário (passam já sem o DebianServer): a regra "(6)" passa a "projeto sem link é confidencial, acadêmico com motivo, ou `side-project` com `screenshot` (Princípio II v3.1.0)"; novos testes da feature 009: `inProductionSince` e `inProgress` nunca juntos; todo `details[].label` casa com `^[a-z]+$` e é único no projeto; `apps[].summary`, `screenshot.alt` e `screenshot.caption` não vazios; `screenshot.src` e `screenshot.full` não começam com `/` nem com protocolo, terminam em `.webp` e existem em `public/` (`import.meta.glob('../../public/**/*.webp')`), e `srcWidth < width`; privacidade (R11): nenhum texto de projeto (`purpose`, `role`, `details[].value`, `apps[].summary`, `screenshot.alt`, `screenshot.caption`) casa com um IPv4 (`/\b\d{1,3}(\.\d{1,3}){3}\b/`), com `.ts.net` ou com uma porta (`/:\d{2,5}\b/`)

**Checkpoint**: `npm run typecheck` e `npm test` verdes; o site não mudou (nenhum dado novo ainda)

---

## Phase 3: User Story 1 - Ver o servidor caseiro como projeto, com a prova (Priority: P1) 🎯 MVP

**Goal**: a janela DebianServer, em 2º lugar em Projetos, com selo, `desde`, detalhes, stack, os 6 apps com ícone e a captura datada como evidência, que abre num visualizador na página (FR-006 a FR-022, FR-024)

**Independent Test**: em Projetos, abrir a janela do DebianServer em 320, 768, 1366 e 1920 px; conferir cada fato contra as Clarifications, a captura (texto alternativo, legenda, carregamento preguiçoso), o visualizador (abrir, fechar, foco), sem JavaScript, com "reduzir movimento" e na impressão (quickstart V1–V9, V12–V14)

### Implementation for User Story 1

- [X] T010 [US1] Em `src/data/resume.ts`, o projeto DebianServer como 2º item de `projects`, logo depois do `srg`, com `satisfies Project` e os valores exatos do data-model §2 (tabelas "Projeto", `apps` e `screenshot`): `id: 'debianserver'`, `name: 'DebianServer'`, `subtitle: 'Meu homeserver'`, `command: 'debianserver --status'`, o `purpose`, `role: 'Autor: instalação, configuração e manutenção'`, `kind: 'side-project'`, `tag: '[side-project]'`, `inProductionSince: '2026-10-01'` (com o dia, pedido do autor depois da implementação; antes `'2026-10'`), `details` (`hardware`, `sistema`, `acesso`, nessa ordem), `stack: ['Debian', 'CasaOS', 'Docker', 'Tailscale', 'Ollama', 'Samba']`, `apps` (Ente Photos, OpenWebUI, Kiwix, Syncthing, SearXNG, Watchtower, nessa ordem, com os `summary` da tabela), `evidence: []` e `screenshot` (`src`, `srcWidth: 800`, `full`, `width: 1396`, `height: 809`, `alt`, `caption`, `captured: '2026-10'`)
- [X] T011 [P] [US1] Criar `src/components/sections/ProjectScreenshot.vue` (research R5 e R7; contracts/debianserver-window.md §1 e §2), com prop `shot: Screenshot` e prop `id: string` (para o id da legenda do diálogo): (a) `<figure class="project-shot">` com `<a class="shot-link" :href="url(shot.full)" target="_blank" rel="noopener noreferrer" @click="onClick">`, dentro dele `<img :src="url(shot.src)" :srcset="`${url(shot.src)} ${shot.srcWidth}w, ${url(shot.full)} ${shot.width}w`" sizes="(min-width: 900px) 24rem, calc(100vw - 4rem)" :width="shot.width" :height="shot.height" loading="lazy" decoding="async" :alt="shot.alt">` e `<span class="sr-only">(abre a captura em tamanho real)</span>`, e `<figcaption class="t-output"># {{ shot.caption }} · {{ formatYearMonth(shot.captured) }}</figcaption>`, onde `url(p) = import.meta.env.BASE_URL + p`; (b) `const hydrated = ref(false)` ligado no `onMounted`; com `hydrated`, `<dialog ref class="shot-viewer" :aria-labelledby="`shot-viewer-caption-${id}`" @cancel.prevent="close" @click="onBackdrop" @close="onClosed">` com o `<img>` de tamanho real (`width`/`height`/`alt` do original), a legenda `<p :id class="t-output">` com o mesmo texto da `figcaption` e `<button type="button" class="t-btn t-close" aria-label="Fechar a captura" @click="close">✕</button>`; (c) `onClick(e)`: se `e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0`, não faz nada (o navegador abre a nova aba); senão `preventDefault()`, `dialog.showModal()`, `document.documentElement.classList.add('window-maximized')`, foco no ✕ e, se `canAnimate()` (`@/lib/flip`), `dialog.animate([{ opacity: 0, transform: 'scale(0.96)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: FLIP_EASING })`; (d) `close()`: se `canAnimate()`, anima o inverso em 200 ms e, no `finished`, `dialog.close()`; senão `dialog.close()` direto; (e) `onBackdrop(e)`: fecha só se `e.target === dialog` (clique fora da imagem e da legenda); (f) `onClosed()`: tira `window-maximized` e devolve o foco ao `.shot-link` com `focus({ preventScroll: true })`; no `onBeforeUnmount`, fechar e tirar a classe; (g) estilo só com tokens: figura com `border: 1px solid var(--border)` e o raio da janela, `img { display: block; width: 100%; height: auto; }`, legenda em `--text-dim` com o espaçamento dos comentários; diálogo sem borda, fundo transparente, `max-width: 100vw`, `max-height: 100dvh`, conteúdo centrado; imagem com `max-width: min(1396px, 100vw - 2rem)`, `max-height: calc(100dvh - 7rem)`, `object-fit: contain`, `width: auto`, `height: auto`; ✕ no canto, com alvo de no mínimo 44 × 44 px; `.shot-viewer::backdrop` com o mesmo fundo e o mesmo `backdrop-filter: blur(var(--maximize-blur))` do `.maximize-backdrop` de `src/components/terminal/EditorFrame.vue`; `@media print { .shot-viewer { display: none } }`; comentário de topo da feature 009 (R5, R7)
- [X] T012 [US1] Em `src/components/sections/ProjectCard.vue` (research R6 e R8; contracts §1): (a) no `h3`, `<span v-if="project.inProductionSince" class="tag-now">EM PRODUÇÃO</span>` ao lado do `EM DESENVOLVIMENTO`; (b) no `dl.project-meta`, depois de `tipo`, `<div v-if="project.inProductionSince"><dt>desde</dt><dd>{{ formatDate(project.inProductionSince) }}</dd></div>`, depois `contexto` como hoje, e depois `<div v-for="d in project.details" :key="d.label"><dt>{{ d.label }}</dt><dd>{{ d.value }}</dd></div>`; (c) depois dos chips de stack, com `project.apps`: `<p class="t-output apps-title" aria-hidden="true"># apps</p>` e `<ul class="project-apps" aria-label="Apps do servidor">` com um `<li>` por app: `<span class="app-name hl-purple"><TechIcon :tech="app.name" />{{ app.name }}</span> <span class="app-desc">{{ app.summary }}</span>`; estilo: `li` em grade `grid-template-columns: max-content 1fr` com `column-gap` dos tokens a partir de 600 px e uma coluna abaixo disso; `.app-name` com `display: inline-flex; align-items: center; gap` (o do `TagChip`); `.app-desc` em `--text` e `--font-sans`; lista sem marcador, espaço entre itens dos tokens; (d) em `.project-links`: com `project.screenshot`, a linha `<p class="t-output no-evidence"># sem acesso público: a evidência é a captura do painel</p>` (texto gerado no componente, como o aviso de privado; FR-015, analyze C1) seguida de `<ProjectScreenshot :shot="project.screenshot" :id="project.id" />`, e os links e o `noEvidenceReason` de hoje passam a `v-else-if`/`v-else` (os avisos de privado continuam iguais); importar `formatDate` (data com o dia, `01 OUT 2026`) de `@/lib/period`, `TechIcon` e `ProjectScreenshot`; um projeto sem os campos novos renderiza o HTML de hoje (FR-021)
- [X] T013 [P] [US1] Atualizar o guia de edição no topo de `src/data/resume.ts` (research R14): `inProductionSince` (selo EM PRODUÇÃO + `desde`, nunca com `inProgress`), `details` (rótulo em minúsculas sem acento = valor, depois de `contexto`), `apps` (nome é uma `TechName`, com ícone em `TECH_ICONS`; uma linha fiel ao uso) e a 4ª exceção do Princípio II: `kind: 'side-project'` com `evidence: []` e `screenshot` (arquivos em `public/`, gerados por `node tools/build-screenshots.mjs` a partir de `tools/source/`; nome com a data da captura; `alt` com a data e o que o painel mostra; nada que localize ou dê acesso ao servidor)

### Tests for User Story 1

- [X] T014 [P] [US1] Criar `tests/component/ProjectScreenshot.spec.ts` (happy-dom; `HTMLDialogElement.prototype.showModal`/`close` com stub se o happy-dom não tiver): renderiza a figura com o link `_blank` + `noopener noreferrer` para o WebP de 1396 px, o `<img>` com `loading="lazy"`, `width="1396"`, `height="809"`, `srcset` com `800w` e `1396w` e o `alt`, o `.sr-only` "(abre a captura em tamanho real)" e a legenda `# painel do CasaOS do DebianServer · OUT 2026`; montado com `renderToString` (SSR), não há `<dialog>`; montado no cliente, o clique sem modificador chama `showModal`, põe `window-maximized` no `html` e não segue o link (`defaultPrevented`); o clique com `ctrlKey` não abre; o ✕ fecha, tira a classe e devolve o foco ao link; `cancel` (Esc) fecha
- [X] T015 [P] [US1] Em `tests/component/ProjectCard.spec.ts`, testes da feature 009 com o DebianServer de `resume.projects`: selo `EM PRODUÇÃO`; `dl` com `papel`, `tipo` = `side-project`, `desde` = `01 OUT 2026`, `hardware`, `sistema`, `acesso`, nessa ordem; 6 chips; `# apps` e 6 `li` em `.project-apps`, cada um com `svg.tech-icon[aria-hidden="true"]`, o nome e a explicação dos dados, na ordem; em `.project-links`, a linha `# sem acesso público: a evidência é a captura do painel` (`.no-evidence`) antes da figura `.project-shot`, e nenhum `.t-badges` nem aviso de privado; rodapé `[side-project]`. E, com o SRG, nenhum `desde`, `# apps`, `.project-apps` nem `.project-shot` (FR-021)
- [X] T016 [P] [US1] Em `tests/unit/resume.data.spec.ts`, no "(8) inventário": projetos `['srg', 'debianserver', 'vscode-themes', 'italiami', 'ocr-prontuarios', 'qclass-bot', 'monitoria']`; `inProgress` só no `srg`; novo: `inProductionSince` só no `debianserver`, e o DebianServer com 6 apps e 3 `details` (`hardware`, `sistema`, `acesso`); o título passa a "inventário da feature 009"; os 10 links privados continuam
- [X] T017 [P] [US1] Criar `tests/e2e/screenshots.spec.ts` (research R11; no Playwright, que roda em Node como o `weight.spec.ts`: o typecheck dos testes de unidade não tem os tipos do Node para ler binários): para os dois WebP de `public/projetos/debianserver/`, ler o arquivo, conferir `RIFF`….`WEBP` e percorrer os blocos: só `VP8 `, `VP8L`, `VP8X` (e `ALPH`, se houver), nenhum `EXIF`, `XMP ` nem `ICCP`; e, pelo cabeçalho do bloco, as larguras 800 e 1396 e os tamanhos ≤ 120 KB e ≤ 300 KB (SC-003)
- [X] T018 [US1] Em `tests/e2e/projects.spec.ts`: no teste "SRG primeiro, em desenvolvimento, e ordem de relevância da lista", a ordem passa a `['SRG', 'DebianServer', 'Temas VS Code', 'ItaliaMi', 'OCR de Prontuários', 'QClass-BOT', 'Monitor de Curso']` e o `.tag-now` passa a 2 (o do SRG e o `EM PRODUÇÃO` do DebianServer), com o título citando a 009; teste novo da 009 (quickstart V2, V3; FR-007 a FR-017; SC-001), em 320, 768, 1366 e 1920 px: o cartão do DebianServer mostra `DebianServer`, `Meu homeserver`, `EM PRODUÇÃO`, os 6 pares do `dl` (texto dos dados), 6 chips, os 6 apps (nome, explicação e um `use` cujo `href` termina no id de `TECH_ICONS`), a linha `# sem acesso público: a evidência é a captura do painel` e, abaixo dela, a figura com a legenda e o `img` com o `alt` dos dados, o rodapé `[side-project]`; em ≥ 900 px a figura fica à direita do `.project-info` (mesma faixa vertical, `left` maior) e abaixo de 900 px, depois dele (`top` maior); `scrollWidth ≤ clientWidth`; a figura inteira, sem corte (a `naturalWidth` carregou e a caixa do `img` cabe na do `.project-links`)
- [X] T019 [US1] Criar `tests/e2e/screenshot-viewer.spec.ts` (quickstart V4–V6, V14; FR-018 a FR-020; SC-003, SC-008, SC-009), com `reducedMotion: 'no-preference'`: (a) carregamento preguiçoso: no hero, depois de entrar no portfólio e esperar `networkidle`, nenhum pedido a `.webp`; rolar até o DebianServer: um `.webp` pedido, e a caixa do `.project-shot` não muda de altura entre antes e depois de a imagem carregar (deslocamento 0, tolerância 0,5 px); (b) em 320, 768, 1366 e 1920 px: clicar no print abre o `dialog.shot-viewer[open]` em ≤ 400 ms (animações do diálogo `finished`), a imagem inteira dentro da janela do navegador (caixa do `img` dentro de `innerWidth` × `innerHeight`, sem rolagem do diálogo), `html.window-maximized`; Esc fecha em ≤ 400 ms, o foco volta ao `.shot-link` e o `scrollY` é o de antes; (c) Enter no link focado abre; o ✕ fecha; clique no fundo (canto do diálogo, fora da imagem) fecha; o ✕ tem ≥ 44 × 44 px; (d) com o visualizador aberto, Ctrl+Alt+T não abre o terminal da dock; (e) Ctrl+clique no print não abre o diálogo (e abre uma página nova no contexto, que é fechada); (f) privacidade: ler `dist/index.html` e falhar se casar com IPv4 privado ou de CGNAT (`/\b(10\.\d+|172\.(1[6-9]|2\d|3[01])|192\.168|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7]))\.\d+\.\d+\b/`), com `.ts.net` ou com `tailscale.com/` (SC-008); (g) captura que não carrega (Edge Cases, analyze E1): num contexto novo com `page.route('**/*.webp', (r) => r.abort())`, rolar até o DebianServer: o `img` continua com o `alt` dos dados e a caixa do `.project-shot` tem a mesma altura que com a imagem (espaço reservado, tolerância 0,5 px), e nenhum `pageerror`; abrir o visualizador continua funcionando e fechar devolve o foco
- [X] T020 [P] [US1] Em `tests/e2e/minimized-layout.spec.ts` (FR-024, research R9): as linhas esperadas passam a `[320, 4]`, `[768, 2]`, `[1024, 1]`, `[1366, 1]`, `[1920, 1]`; o título "seis projetos" passa a "sete projetos"; a contagem `toBe(6)` passa a `toBe(7)`; no teste "janela aberta entre ícones", o comentário "ícones 3 a 6" passa a "ícones 3 a 7" (a asserção já cobre todos depois do 2º); comentário da 009
- [X] T021 [P] [US1] Em `tests/e2e/no-js.spec.ts`: as duas contagens de 12 janelas passam a 13 (comentário: o DebianServer entrou na 009); teste novo da 009 (quickstart V7, V8; SC-006): sem JS, o cartão do DebianServer mostra os 6 apps, a linha `# sem acesso público: a evidência é a captura do painel` e a figura, o `img` tem `loading="lazy"` e o `alt`, o `.shot-link` aponta para `…/projetos/debianserver/painel-2026-10-20-1396.webp` com `_blank`, e não há `dialog` na página; na impressão com JS (`emulateMedia({ media: 'print' })`), a figura do DebianServer fica visível e nenhum `dialog` aparece
- [X] T022 [P] [US1] Em `tests/e2e/a11y.spec.ts` (SC-005): teste novo da 009 que audita `#projetos` com a janela do DebianServer aberta (rolada até ela, imagem carregada), minimizada (`button.t-min`, espera o quadro sumir) e com o visualizador aberto (`audit(page)` da página inteira, com o diálogo modal), ouvindo `pageerror` e `console` (tipo `error`) e esperando zero erros do site, como os testes de console do mesmo arquivo
- [X] T023 [P] [US1] Em `tests/e2e/reduced-motion.spec.ts` (quickstart V9): com `reducedMotion: 'reduce'`, abrir e fechar o visualizador não cria animações (`dialog.getAnimations().length === 0` logo depois do clique e do Esc) e o diálogo abre e fecha na hora
- [X] T024 [P] [US1] Em `tests/e2e/visual-cleanup.spec.ts`, na lista de `.terminal-title`, acrescentar `'DebianServer'` depois de `'SRG'` (comentário: feature 009); conferir em `tests/e2e/terminals.spec.ts` que o teste que usa o 3º projeto (`nth(2)`, agora Temas VS Code) continua válido sem mudança
- [X] T025 [US1] Rodar `npm run build` e `npx playwright test projects screenshot-viewer minimized-layout no-js a11y reduced-motion visual-cleanup terminals tech-icons links layout desktop-windows window-controls`; corrigir o que quebrar por causa da janela nova, sem afrouxar asserções que não sejam do DebianServer

**Checkpoint**: a US1 funciona sozinha: o DebianServer aparece em 2º, completo, com a captura e o visualizador; o `open` já o lista (pelos dados), mas os testes do `open` ainda esperam 10 opções (US3)

---

## Phase 4: User Story 2 - Ver o challenge Bom Jesus (FAE) (Priority: P2)

**Goal**: o challenge Bom Jesus (FAE) é o 1º dos 8 na janela de Challenges, com arquivo e cartão (FR-001 a FR-005)

**Independent Test**: abrir a janela de Challenges, conferir `2026-10_bom-jesus-fae.yml` em `1 / 8` com todos os fatos do cartão, maximizar e conferir o cartão; repetir sem JavaScript (quickstart V10)

### Implementation for User Story 2

- [X] T026 [US2] Em `src/data/resume.ts`, o challenge novo em `challenges` (a ordem do arquivo não importa; data-model §2, tabela "Challenge"), com `satisfies Challenge`: `id: 'bomjesus-challenge'`, `name: 'Bom Jesus (FAE)'`, `created: '2026-10'`, `summary: 'Gestão acadêmica: API REST e interface web para cadastrar, consultar, atualizar e excluir alunos e professores de uma instituição de ensino.'`, `stack: ['Java', 'Spring Boot', 'Vue 3', 'TypeScript', 'H2', 'Docker']`, `url: 'https://github.com/V-Perotto/bomjesus-challenge'`

### Tests for User Story 2

- [X] T027 [P] [US2] Em `tests/unit/resume.data.spec.ts`, no inventário, `resume.challenges` com 8 itens; em `tests/unit/editor-files.spec.ts`, acrescentar `'2026-10_bom-jesus-fae.yml'` ao `arrayContaining` dos nomes e um teste da 009: o 1º arquivo de `challengeFolder(resume.challenges)` é `2026-10_bom-jesus-fae.yml`, posição 1 de 8, com cabeçalho `# 1 / 8 · Bom Jesus (FAE)`, `criado` `OUT 2026`, a stack com os 6 nomes na ordem e o `repositorio` como trecho `link` com `href` `https://github.com/V-Perotto/bomjesus-challenge`
- [X] T028 [US2] Em `tests/e2e/editor-windows.spec.ts`: o `count` dos challenges em `EDITORS` passa a 8; as posições fixas `'3 / 7'` (teste do teclado, 3º arquivo) e `'6 / 7'` (teste "maximizada, escolher o 6º challenge", que usa o 6º item da árvore, `nth(5)`) passam a `'3 / 8'` e `'6 / 8'` (analyze U1); teste novo da 009 (quickstart V10; SC-002): na janela `challenges`, o arquivo aberto é `2026-10_bom-jesus-fae.yml`, rodapé `~/projetos/challenges/2026-10_bom-jesus-fae.yml` · `1 / 8`, o arquivo mostra `Bom Jesus (FAE)`, `OUT 2026`, o resumo, os 6 nomes da stack e o link `github.com/V-Perotto/bomjesus-challenge` (`_blank`, `noopener noreferrer`); em 320 px o rótulo da árvore está truncado com reticências (`scrollWidth > clientWidth`) e, aberto, o rodapé mostra o nome inteiro; maximizada, o 1º cartão (`[data-card-id="bomjesus-challenge"]`) tem os 6 chips com ícone
- [X] T029 [US2] Rodar `npm test` e `npx playwright test editor-windows no-js projects` (depois de `npm run build`); corrigir o que quebrar

**Checkpoint**: US1 e US2 completas; os Challenges têm 8 arquivos

---

## Phase 5: User Story 3 - Abrir o DebianServer pelo terminal da dock (Priority: P3)

**Goal**: `debianserver` é a 3ª das 11 opções do `open` (depois de `srg`), e `open debianserver` abre a janela (FR-023)

**Independent Test**: no terminal da dock, rodar `open debianserver` com a janela aberta, minimizada e fechada; conferir a saída, o `help`, o Tab e o foco (quickstart V11)

### Tests for User Story 3

(Nenhuma implementação: o alvo sai dos dados, research R9.)

- [X] T030 [P] [US3] Em `tests/unit/sections.spec.ts`: "as 10 opções" passa a "as 11 opções", com `'debianserver'` depois de `'srg'`; no teste "coleção vazia não tem alvo", a lista de projetos ganha `'debianserver'` depois de `'srg'`; comentário da 009
- [X] T031 [P] [US3] Em `tests/unit/terminal.spec.ts`: `OPEN_OPTIONS` com `| debianserver` depois de `| srg`; teste novo: `complete('open deb', ctx)` → `open debianserver`; nos casos normalizados do `open` (`it.each` de "open %s é normalizado"), acrescentar `['DebianServer', 'debianserver', '→ ~/projetos/debianserver']`. `tests/component/DockTerminal.spec.ts` não fixa a lista do `open`: sem mudança
- [X] T032 [US3] Em `tests/e2e/open-command.spec.ts` (quickstart V11; SC-007): `PROJECTS` ganha `['debianserver', 'DebianServer']` depois de `['srg', 'SRG']`; `OPEN_OPTIONS` com `| debianserver` depois de `| srg`; o título "as 10 opções" passa a "as 11 opções"; no teste de Tab, `open deb` → `open debianserver`; conferir que o teste parametrizado por `PROJECTS` (janela aberta, minimizada e fechada, ≤ 1 s, saída `→ ~/projetos/debianserver`) passa com o DebianServer
- [X] T033 [US3] Rodar `npm test` e `npx playwright test open-command dock-terminal` (depois de `npm run build`); corrigir o que quebrar

**Checkpoint**: US1, US2 e US3 completas; o `open` tem 11 opções

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: documentação, peso e verificação final

- [X] T034 [P] Atualizar `DESIGN.md` (research R14): na seção das janelas de projeto, a captura como evidência (figura na coluna de evidências, borda e raio dos tokens, legenda em comentário `# … · OUT 2026`, carregamento preguiçoso, `srcset` 800/1396), o visualizador (diálogo modal nativo, fundo igual ao da janela maximizada, ✕ de 44 px, 200 ms, sem animação com movimento reduzido; sem JS, link em nova aba), a lista `# apps` (ícone na cor do texto + nome em roxo + explicação; duas colunas a partir de 600 px), o selo `EM PRODUÇÃO` com a linha `desde`, o tipo `side-project` e a ordem das fontes de ícones (devicon → vectorlogo.zone → simple-icons → dashboard-icons → Lucide); onde houver a lista de projetos ou de opções do `open`, acrescentar o DebianServer/`debianserver`
- [X] T035 [P] Atualizar `README.md` (research R14): na lista de projetos, o DebianServer (side-project) e o challenge Bom Jesus (FAE); nos scripts de `tools/`, o `build-screenshots.mjs` (quando rodar, o que gera) e o simple-icons como fonte do `build-tech-icons.mjs`; no `open`, a opção `debianserver`
- [X] T036 Medir o peso (`npx playwright test weight`): anotar em `specs/009-homeserver-bomjesus-challenge/research.md` (R10) o número medido e o acréscimo sobre a linha de base da T001; o teste passa com o teto de +6 KB (SC-004, revisado na implementação de +4 KB: o texto novo vai no HTML e de novo nos dados do JS; research R10)
- [X] T037 Verificação final: `npm run typecheck`, `npm test` e `npm run test:e2e` completos, todos verdes (anotar as contagens de testes Vitest e Playwright)
- [X] T038 Inspeção pelo quickstart (V1–V16) no `npm run preview` com o Playwright (Chromium com `--ignore-gpu-blocklist --enable-gpu --use-angle=gl`, como nas features anteriores): 1366 × 800 e 390 × 844, a janela do DebianServer (aberta, minimizada), o visualizador aberto e fechado, a janela de Challenges com o Bom Jesus (FAE) e a árvore em 320 px, `open debianserver` pelo terminal da dock, a prévia dos ícones (V15) e a versão `v2.8` na porta; console sem erros do site; registrar no fim de `specs/009-homeserver-bomjesus-challenge/quickstart.md` o que foi conferido e o que fica com o autor (GPU real, celular físico, atualizar o PDF do currículo)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências; T003 e T004 precisam de rede só para o T004
- **Foundational (Phase 2)**: depende do Setup (T006 usa os símbolos do sprite da T004); bloqueia as três histórias
- **US1 (Phase 3)**: depende da Phase 2 e dos WebP da T003 (a regra de existência dos arquivos, T009)
- **US2 (Phase 4)**: depende da Phase 2 (`Spring Boot` e `H2` no `TechName`); independente da US1, mas os e2e de contagem de janelas (T021) e de ordem (T018) já contam com o DebianServer
- **US3 (Phase 5)**: depende da US1 (o alvo `debianserver` vem do projeto nos dados, T010)
- **Polish (Phase 6)**: depende das três histórias

### Within Each Phase

- T001, T002, T003, T004 (T003 e T004 em paralelo)
- T005 → T006, T008 → T007, T009
- T010 → T011, T013 → T012 → T014, T015, T016, T017 → T018, T019, T020, T021, T022, T023, T024 → T025
- T026 → T027 → T028 → T029
- T030, T031 → T032 → T033
- T034, T035, T036 → T037 → T038

### Parallel Opportunities

- Phase 1: T003 e T004 (scripts diferentes)
- Phase 2: T007, T008 e T009 depois de T005/T006
- Phase 3: T011 e T013 depois de T010; T014 a T017 (arquivos de teste diferentes); T020 a T024 (specs e2e diferentes)
- Phase 4: T027 em paralelo com os e2e da US1, depois de T026
- Phase 5: T030 e T031
- Phase 6: T034 e T035

---

## Parallel Example: User Story 1

```bash
# Depois de T010 (os dados):
Task: "T011 ProjectScreenshot.vue: figura, srcset, visualizador <dialog>"
Task: "T013 guia de edição de resume.ts: inProductionSince, details, apps, screenshot"
# Depois de T012 (ProjectCard):
Task: "T014 ProjectScreenshot.spec.ts"
Task: "T015 ProjectCard.spec.ts: DebianServer e SRG sem mudança"
Task: "T016 resume.data.spec.ts: inventário com 7 projetos"
Task: "T017 screenshots.spec.ts: WebP sem metadados"
# e2e em specs diferentes:
Task: "T020 minimized-layout: 7 ícones, 4/2/1 linhas"
Task: "T021 no-js: 13 janelas, DebianServer sem JS e na impressão"
Task: "T022 a11y: DebianServer aberto, minimizado e visualizador"
Task: "T023 reduced-motion: visualizador sem animação"
Task: "T024 visual-cleanup: título DebianServer"
```

## Parallel Example: User Story 3

```bash
Task: "T030 sections.spec.ts: 11 alvos, debianserver depois de srg"
Task: "T031 terminal.spec.ts: OPEN_OPTIONS, open deb + Tab"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 (Setup) e Phase 2 (Foundational)
2. Phase 3 (US1): o DebianServer com a captura e o visualizador
3. **Parar e validar**: quickstart V1–V9, V12–V14

### Incremental Delivery

1. Setup + Foundational → base pronta (site igual, versão 2.8.0, WebP e ícones gerados)
2. US1 → DebianServer (MVP)
3. US2 → challenge Bom Jesus (FAE)
4. US3 → testes do `open debianserver`
5. Polish → documentação, peso, suítes completas, inspeção
