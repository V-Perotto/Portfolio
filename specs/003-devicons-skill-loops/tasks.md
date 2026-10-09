---

description: "Task list for 003-devicons-skill-loops"
---

# Tasks: Limpeza visual, links destacados, ícones devicon e skills em loops

**Input**: Design documents from `specs/003-devicons-skill-loops/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md;
constituição v2.2.0

**Tests**: incluídos. O plano e o quickstart (V1–V15) pedem testes, e a suíte da 001/002 (Vitest +
Playwright) é o gate de verificação da constituição.

**Organization**: uma fase por história (US1–US7, um item do autor cada; ver Rastreabilidade da
spec), em ordem de prioridade, depois de Setup e Foundational.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: história da spec (US1–US7)

## Path Conventions

Projeto único: `src/`, `tests/` e `tools/` na raiz (plan.md, Project Structure).

---

## Phase 1: Setup

**Purpose**: linha de base de peso e o sprite de ícones (asset gerado e versionado)

- [X] T001 Medir a linha de base de peso antes de qualquer mudança: `npm run build` e gzip -9 de `dist/index.html` + `dist/assets/app-*.css` + `dist/assets/app-*.js`; registrar o valor em `specs/003-devicons-skill-loops/research.md` (R11) e confirmar ou corrigir os 80,3 KB e o teto de 95,3 KB
- [X] T002 Criar `tools/build-tech-icons.mjs` (research R1, R2): manifesto dos 50 símbolos do data-model (28 `devicon-*` com a variante da tabela, baixados de `https://cdn.jsdelivr.net/gh/devicons/devicon@v2.17.0/icons/<nome>/<nome>-<variante>.svg`; `vectorlogo-sap` e `vectorlogo-nginx` de `https://www.vectorlogo.zone/logos/<nome>/<nome>-icon.svg`; 20 `lucide-*` renderizados do `@lucide/vue` instalado com `renderToString`); otimizar com `npx --yes svgo@4.1.0 --multipass` (`-p 0` para devicon e vectorlogo, `-p 1` para Lucide); garantir `viewBox`; trocar toda cor fixa de `fill`/`stroke` por `currentColor` (Lucide: `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`); nos do vectorlogo.zone, transformar o desenho branco em recorte (`fill-rule="evenodd"`, sem `<mask>`); gravar `src/assets/tech-icons/sprite.svg` (um `<symbol id>` por ícone, sem `<style>` nem ids internos colidindo) e `src/assets/tech-icons/NOTICE.md` (origem, versão/data e licença: devicon MIT com o texto da licença, vectorlogo.zone "logos remain property of their owners; modifications are public domain", Lucide ISC); com `--preview <arquivo.html>`, gravar uma grade de todos os símbolos em 16px e 32px na cor `#4ade9b` sobre `#16101f` para conferência
- [X] T003 Rodar `node tools/build-tech-icons.mjs` e `--preview`; abrir a grade num screenshot do Playwright e conferir que nenhum ícone virou borrão (SAP vazado legível; mysql, react, flask, nginx, prisma, rabbitmq, nestjs reconhecíveis); trocar a variante no manifesto e regenerar quando algum falhar; anotar no `research.md` (R1) qualquer troca de variante

**Checkpoint**: sprite e NOTICE gerados; peso de base registrado

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: tipos, registro de ícones e o componente de ícone, usados por US1 (loops) e US4 (chips)

**⚠️ CRITICAL**: nenhuma história começa antes desta fase

- [X] T004 Atualizar `src/types/resume.ts` a partir de `specs/003-devicons-skill-loops/contracts/resume.schema.ts`: união `TechName` (os 54 nomes, grafia exata dos dados), `TechIconId` (`` `devicon-${string}` | `vectorlogo-${string}` | `lucide-${string}` ``), `SkillItem.name: TechName`, `Experience.tech`, `Project.stack` e `Challenge.stack` como `NonEmpty<TechName>`. Manter `SkillItem.featured?` por enquanto (sai em T030, com a faixa); atualizar o comentário do topo para citar a 003
- [X] T005 Criar `src/lib/tech-icons.ts` com `TECH_ICONS: Record<TechName, TechIconId>` exatamente como a tabela "Registro de ícones" do data-model (31 nomes → 28 `devicon-*`, "SAP SD" e "Nginx" → `vectorlogo-sap` e `vectorlogo-nginx`, 21 nomes → 20 `lucide-*`), comentário citando FR-013/FR-017 e research R3 (depende de T004)
- [X] T006 [P] Acrescentar tokens em `src/styles/tokens.css` (research R5, R6): `--ribbon-bg: color-mix(in srgb, var(--purple) 55%, var(--bg))`, `--ribbon-edge: var(--purple-light)`, `--icon-tech: 1em`, `--glow-link: 0 0 12px color-mix(in srgb, var(--green-bright) 70%, transparent)`; conferir que a impressão continua com o tema claro
- [X] T007 Criar `src/components/base/TechIcon.vue`: prop `tech: TechName`; `import spriteUrl from '@/assets/tech-icons/sprite.svg?url&no-inline'`; renderiza `<svg class="tech-icon" aria-hidden="true" focusable="false"><use :href="`${spriteUrl}#${TECH_ICONS[tech]}`" /></svg>` com `width/height: var(--icon-tech)`, `flex-shrink: 0`, `fill: currentColor`; confirmar no `npm run build` que o sprite sai como arquivo com hash, não como `data:` (depende de T003, T005, T006)
- [X] T008 [P] Criar `tests/unit/tech-icons.spec.ts`: todo id de `TECH_ICONS` existe como `<symbol id>` em `src/assets/tech-icons/sprite.svg`; todo símbolo do sprite é usado por algum nome; nenhum símbolo tem `fill`/`stroke`/`stop-color` com cor fixa (só `none`, `currentColor` ou referência interna de máscara); variações apontam para o mesmo id (`Vue 3` e `Vue.js`, `Python` e `Python (Flask)`, `Java` e `Java (Quarkus)`) (depende de T003, T005)
- [X] T009 [P] Atualizar as fixtures dos testes de componente para `TechName` (o `vue-tsc` checa `tests/component`): `'Vue'` → `'Vue.js'` e `'TS'` → `'TypeScript'` em `tests/component/ExperienceCard.spec.ts`, `tests/component/ProjectCard.spec.ts` e `tests/component/ProjectsSection.spec.ts` (depende de T004)

**Checkpoint**: `npm run typecheck` e `npm test` passam; o site ainda não mudou visualmente

---

## Phase 3: User Story 1 - Skills em sub-partes, cada uma com seu loop de ferramentas (Priority: P1) 🎯 MVP

**Goal**: 5 sub-partes em `#skills`, cada uma com título (ícone Lucide do grupo) e um loop em linha
reta sobre uma fita, itens com ícone + nome (FR-020 a FR-030)

**Independent Test**: V8–V12 do quickstart (loops correndo, pausa no hover e fora da tela, lista
acessível única, parado e completo sem movimento/JS/impressão, sem deslocamento)

### Tests for User Story 1

- [X] T010 [P] [US1] Criar `tests/component/SkillLoop.spec.ts` (render no servidor com `renderToString` e montagem com `@vue/test-utils`): o HTML pré-renderizado tem uma só `<ul role="list">` com todas as skills do grupo; cada `<li>` tem `svg.tech-icon[aria-hidden="true"]` antes do nome e o separador `✦` com `aria-hidden="true"`; nenhuma cópia (`[data-loop-copy]`) nem `data-loop-ready` no HTML pré-renderizado; cópias montadas depois têm `aria-hidden="true"`
- [X] T011 [P] [US1] Criar `tests/e2e/skills.spec.ts` com V8 (5 `h3` na ordem dos grupos, cada um com `svg.lucide`; 5 `.skill-loop`; 28 itens acessíveis no total; a trilha se move para a esquerda — o `x` diminui — entre duas leituras de `getBoundingClientRect` com 500 ms (FR-021); `--loop-shift` ÷ `--loop-duration` ≤ 48 px/s, ou seja, ≥ 6 s para atravessar 288 px (FR-028); com `hover()` a posição não muda), V9 (com `#skills` fora da viewport, `animation-play-state` da trilha = `paused`), V11 (árvore de acessibilidade: cada grupo é uma lista com as próprias skills, sem duplicatas nem `✦`) e V12 (`PerformanceObserver('layout-shift')` ao carregar e rolar até `#skills`: soma 0 atribuída a `.skill-loop`; em 320px, sem rolagem horizontal e nomes com `font-size` ≥ 12px)
- [X] T012 [US1] Estender `tests/e2e/reduced-motion.spec.ts` e `tests/e2e/no-js.spec.ts` com V10: sem cópias visíveis, as 28 skills visíveis e inteiras dentro da fita (`boundingBox` de cada item contido na da fita); repetir com `page.emulateMedia({ media: 'print' })`

### Implementation for User Story 1

- [X] T013 [US1] Mover `src/components/sections/ProjectSubpart.vue` para `src/components/layout/SectionSubpart.vue` (research R9): classe raiz `section-subpart`, `lead` opcional (sem lead, sem a linha `$`), slot `icon` antes do título, comentário genérico (sub-parte de qualquer seção); atualizar `src/components/sections/ProjectsSection.vue` e os seletores `.project-subpart` → `.section-subpart` em `tests/e2e/projects.spec.ts` e `tests/component/ProjectsSection.spec.ts`
- [X] T014 [US1] Criar `src/components/base/SkillLoop.vue` (research R4, R5; contracts/page-contract.md, seção `#skills`): prop `items: readonly SkillItem[]`; fita (`--ribbon-bg`, fios `--ribbon-edge`) com trilha `.loop-track` e a lista `<ul role="list">` (cada `<li class="loop-item">`: `TechIcon`, `<span>` com o nome em mono 0.85rem `--green-bright`, `<span aria-hidden="true">✦</span>` em `--purple-glow`); sob `html:not(.motion)` e na impressão, a lista quebra em linhas (`flex-wrap`) e as cópias ficam `display: none`; sob `html.motion`, uma linha, altura fixa 2.6rem, `overflow: hidden`; depois de montar e com movimento (`useMotion`): após `document.fonts.ready`, mede a sequência, cria as cópias `aria-hidden="true"` `data-loop-copy` necessárias para cobrir a largura, define `--loop-shift` e `--loop-duration` (largura ÷ 40 px/s) e marca `data-loop-ready`; `@keyframes` `translateX(0)` → `translateX(calc(-1 * var(--loop-shift)))`, `linear infinite`, rodando só com `[data-loop-ready][data-loop-visible]` e pausada em `:hover`; `IntersectionObserver` liga/desliga `data-loop-visible`; `ResizeObserver` recalcula; limpa observers no `onBeforeUnmount`; comentário citando o Text Loop do Vue Bits (forma `line`) como referência visual e o porquê de não vendorizá-lo. Para o caso "JS principal falhou" (FR-018 da 001), `src/main.ts` marca `html.app-loaded` e o script inline de `index.html` tira o `motion` no fim do boot se a marca não existir (research R4)
- [X] T015 [US1] Reescrever `src/components/sections/SkillsSection.vue`: para cada grupo, `SectionSubpart` com `title = group.id`, o ícone Lucide do grupo (`SKILL_ICONS[group.icon]` de `src/lib/icons.ts`, classe `skill-icon`, `aria-hidden`) no slot `icon` e um `SkillLoop` com `group.items`; manter `TechMarquee` e o `decor` no lugar (saem em US5 e US3); remover `.skills-grid`; apagar `src/components/sections/SkillGroupCard.vue`
- [X] T016 [US1] Em `src/styles/base.css`: no bloco de alto contraste, borda `1px solid CanvasText` na fita (`.skill-loop`); no bloco de impressão, `.loop-track` sem animação e sem transform

**Checkpoint**: US1 funciona sozinha (T010–T012 passam); a faixa antiga ainda aparece acima das sub-partes

---

## Phase 4: User Story 2 - Links destacados e sempre sublinhados (Priority: P1)

**Goal**: rótulos em roxo; todo link de conteúdo com sublinhado tracejado parado e brilho no hover e
no foco (FR-006 a FR-010)

**Independent Test**: V4 e V5 do quickstart

### Tests for User Story 2

- [X] T017 [P] [US2] Criar `tests/e2e/visual-cleanup.spec.ts` com V4 (`.t-theme-name` sem `.neon` com cor computada = `--purple-glow`; os 2 `.neon` com a cor do tema) e V5 (para todo `a[target="_blank"]`: em repouso, `border-bottom-style: dashed` e `border-bottom-width: 1px` na cor do link, no próprio `<a>` ou no `.evidence-url`/`img` do badge de dentro; com `hover()` e com foco por Tab, `text-shadow` ou `filter` deixa de ser `none`, o sublinhado não muda e o `boundingBox` não se move; com `page.route('**/img.shields.io/**', r => r.abort())`, o domínio que substitui o badge tem um sublinhado só, sem linha dupla (FR-009); e os controles de navegação — links do menu, logotipo, botões do hero, "▼ scroll" e link de pular para o conteúdo — sem nenhum sublinhado tracejado, em repouso e no hover (FR-010, decisão do autor))

### Implementation for User Story 2

- [X] T018 [US2] Criar o estilo único de link de conteúdo (research R6): classe `.ext-link` em `src/styles/base.css` (camada `components`): `color: var(--green-bright)`, `text-decoration: none`, `border-bottom: 1px dashed currentColor`, `transition: text-shadow 0.2s, filter 0.2s`; em `:hover` e `:focus-visible`, `text-shadow: var(--glow-link)`; aplicar a classe no `<a>` de `src/components/base/ExternalLink.vue`
- [X] T019 [P] [US2] Remover os estilos de link duplicados (agora no `.ext-link`): `.c-val` em `src/components/sections/ContactSection.vue`, `.repo-link` em `src/components/sections/ChallengeCard.vue`, `.source-link` em `src/components/sections/CommunityCard.vue` e `.src-link` em `src/components/sections/EducationCard.vue`, mantendo só o que não é estilo de link (ex.: `overflow-wrap`)
- [X] T020 [US2] Em `src/components/sections/EvidenceLink.vue`: rótulo sem `accent` passa de `hl-green` para uma classe com `color: var(--purple-glow)` (FR-006), rótulos `.neon` intactos; o `<a>` (`.evidence-link`) sem `border-bottom`, que vai para `.evidence-url` e para a `img` do badge, com a caixa reservada em 29px fixos (FR-009; com o badge falho, só o `.evidence-url` do domínio é sublinhado, research R6); hover/foco sem `transform: translateY(-2px)`; brilho do texto pelo `text-shadow` herdado do `.ext-link`; no badge, manter o `drop-shadow` atual (roxo e vermelho do Shadow Lord)
- [X] T021 [US2] Atualizar `tests/component/ProjectCard.spec.ts`: rótulo de link sem accent não usa `hl-green`; rótulos com accent continuam `.neon`

**Checkpoint**: US2 funciona sozinha (T017 passa)

---

## Phase 5: User Story 3 - Sem imagens de fundo (Priority: P2)

**Goal**: nenhuma imagem decorativa atrás das seções; arquivos fora do site (FR-001, FR-002)

**Independent Test**: V1 do quickstart

### Tests for User Story 3

- [X] T022 [P] [US3] Acrescentar V1 em `tests/e2e/visual-cleanup.spec.ts`: 0 `.section-decor` e 0 `img` dentro de `#sobre`, `#skills` e `#projetos` fora dos cartões; 0 requisições a `image*-bg*.webp` durante o carregamento e a rolagem até o fim

### Implementation for User Story 3

- [X] T023 [US3] Em `src/components/layout/SectionShell.vue`: remover a interface `SectionDecor`, a prop `decor`, o markup `.section-decor` e o CSS (`.section > :not(.section-decor)`, `.section-decor`, `.decor-img`, `.tint-*`, `.decor-*` e a regra mobile)
- [X] T024 [US3] Remover o `import decorImg` e a prop `:decor` de `src/components/sections/AboutSection.vue`, `src/components/sections/SkillsSection.vue` e `src/components/sections/ProjectsSection.vue`
- [X] T025 [US3] Apagar `src/assets/img/` (image1-bg.webp, image2-bg.webp, image3-bg.webp) e `tools/reencode-images.py`; em `src/styles/base.css`, tirar `.section-decor` da lista do alto contraste e da de impressão; em `tests/e2e/a11y.spec.ts`, tirar `.section-decor` do teste de alto contraste (FR-037 da 001)

**Checkpoint**: US3 funciona sozinha (T022 passa); `dist/assets` sem webp

---

## Phase 6: User Story 4 - Ícones nos chips de tecnologia (Priority: P2)

**Goal**: todo chip com ícone à esquerda, na cor do texto, acompanhando o hover (FR-012 a FR-018)

**Independent Test**: V6 e V15 do quickstart

### Tests for User Story 4

- [X] T026 [P] [US4] Criar `tests/component/TagChip.spec.ts`: `<TagChip tech="TypeScript" />` renderiza `svg.tech-icon` com `aria-hidden="true"` antes do texto, `use` com `href` terminando em `#devicon-typescript`; `SAP SD` → `#vectorlogo-sap`; `Valkey` → `#lucide-database`; o texto acessível do `li` é só o nome
- [X] T027 [P] [US4] Criar `tests/e2e/tech-icons.spec.ts` com V6 (todo `.chip` tem 1 `svg.tech-icon` antes do texto; todo `use[href]` é do mesmo domínio e o `#id` existe no sprite servido; cor computada do `svg` = cor do texto do chip, também depois de `hover()`; altura de cada chip ≤ altura de linha do texto + padding de antes, ±1px) e V15 (0 requisições para `devicon.dev`, `vectorlogo.zone` e `jsdelivr.net`; 1 requisição ao sprite)

### Implementation for User Story 4

- [X] T028 [US4] Em `src/components/base/TagChip.vue`: prop `tech: TechName` no lugar do slot; renderizar `TechIcon` e o nome; `.chip` em `inline-flex`, `align-items: center`, `gap` pequeno dos tokens; altura do chip inalterada (FR-018); hover continua mudando a cor do texto, e o ícone acompanha por `currentColor`
- [X] T029 [US4] Trocar os usos de `TagChip` para `<TagChip v-for="tech in …" :key="tech" :tech="tech" />` em `src/components/sections/ExperienceCard.vue`, `src/components/sections/ProjectCard.vue` e `src/components/sections/ChallengeCard.vue` (e em `SkillGroupCard.vue`, se US1 ainda não o tiver removido)

**Checkpoint**: US4 funciona sozinha (T026, T027 passam)

---

## Phase 7: User Story 5 - Sem a faixa automática no topo das skills (Priority: P2)

**Goal**: a faixa contínua sai, com e sem movimento (FR-019)

**Independent Test**: V7 do quickstart

- [X] T030 [US5] Remover `TechMarquee` de `src/components/sections/SkillsSection.vue`; apagar `src/components/base/TechMarquee.vue` e `src/components/vendor/vue-bits/LogoLoop.vue`; remover `featured` de `SkillItem` em `src/types/resume.ts` e de todas as skills em `src/data/resume.ts`, junto com a linha do guia de edição sobre `featured`; em `src/styles/base.css`, tirar `.marquee-chip` do alto contraste e `.tech-marquee` da impressão
- [X] T031 [US5] Em `tests/e2e/reduced-motion.spec.ts`, trocar a espera por `.marquee-static` pela lista parada dos loops (`.skill-loop` sem cópias visíveis); acrescentar V7 em `tests/e2e/skills.spec.ts` (0 `.tech-marquee`, com e sem movimento; o elemento seguinte ao lead de `#skills` é a primeira `.section-subpart`)

**Checkpoint**: US5 funciona sozinha (T031 passa)

---

## Phase 8: User Story 6 - Comandos sem `./run` e em tom de comentário (Priority: P3)

**Goal**: comandos de todas as janelas em `--text-dim`, `$` roxo; projetos sem `./run`
(FR-003 a FR-005)

**Independent Test**: V2 do quickstart

- [X] T032 [P] [US6] Acrescentar V2 em `tests/e2e/visual-cleanup.spec.ts`: o texto da página não contém `./run`; em `#sobre`, nos 6 cartões de projeto e em `#contato`, cada `[data-t-cmd]` tem cor computada = `--text-dim`, o `.prompt-dollar` = `--purple-glow` e o `.hl-green` da última linha do Contato continua verde; com movimento, durante a digitação, `.t-typed` tem a mesma cor da linha
- [X] T033 [US6] Em `src/components/terminal/TerminalLine.vue`, `.t-line` passa de `var(--text)` para `var(--text-dim)` (research R7)
- [X] T034 [US6] Em `src/data/resume.ts`, tirar o prefixo `./run ` dos 5 comandos (inventário "Comandos" do data-model: `srg --status`, `italiami --describe`, `ocr_para_br --describe`, `qclass-bot --describe`, `monitoria --describe`); em `tests/unit/resume.data.spec.ts`, acrescentar "nenhum `command` começa com `./run`"; nas fixtures `tests/component/ProjectCard.spec.ts` e `tests/component/ProjectsSection.spec.ts`, `'./run demo'` → `'demo --describe'`

**Checkpoint**: US6 funciona sozinha (T032 passa)

---

## Phase 9: User Story 7 - Títulos das janelas sem `bash —` (Priority: P3)

**Goal**: título = nome do projeto; Sobre e Contato com o nome do arquivo (FR-011)

**Independent Test**: V3 do quickstart

- [X] T035 [P] [US7] Acrescentar V3 em `tests/e2e/visual-cleanup.spec.ts` (`.terminal-title` = `sobre.txt`, `SRG`, `Temas VS Code`, `ItaliaMi`, `OCR de Prontuários`, `QClass-BOT`, `Monitor de Curso`, `contato.sh`, nessa ordem; nenhum contém `bash`) e, em `tests/component/ProjectCard.spec.ts`, "o título da janela é o `name` do projeto"
- [X] T036 [US7] Passar `:title="project.name"` em `src/components/sections/ProjectCard.vue`, `title="sobre.txt"` em `src/components/sections/AboutSection.vue` e `title="contato.sh"` em `src/components/sections/ContactSection.vue`

**Checkpoint**: US7 funciona sozinha (T035 passa)

---

## Phase 10: Polish & Cross-Cutting Concerns

- [X] T037 Atualizar o inventário em `tests/unit/resume.data.spec.ts`: 5 grupos e 28 skills na ordem atual, nenhuma com `featured`, toda tecnologia de skills, experiências, projetos e challenges com entrada em `TECH_ICONS`; atualizar o guia de edição no topo de `src/data/resume.ts` (tecnologia nova: acrescentar em `TechName` e `TECH_ICONS`; ícone novo: acrescentar no manifesto de `tools/build-tech-icons.mjs` e rodá-lo)
- [X] T038 [P] Atualizar `DESIGN.md`: sem imagens decorativas de fundo; Skills como sub-partes com loop (fita `--ribbon-bg`/`--ribbon-edge`, separador `✦`, 40 px/s, pausa, versão parada); chips com ícone de tecnologia (`--icon-tech`, fontes devicon → vectorlogo.zone → Lucide, `currentColor`); links de conteúdo com sublinhado tracejado parado e brilho no hover; comandos em Dim Lilac; títulos de janela sem `bash —`; faixa contínua removida
- [X] T039 [P] Atualizar `README.md`: tirar a menção a `src/assets/img/` e `tools/reencode-images.py`; documentar `node tools/build-tech-icons.mjs` (quando rodar, o que gera, licenças em `src/assets/tech-icons/NOTICE.md`)
- [X] T040 Medir o peso (V14): `npm run build`, gzip de `dist/index.html` + CSS + JS inicial ≤ 95,3 KB (ou o teto corrigido em T001) e tamanho do sprite; `tests/e2e/weight.spec.ts` ≤ 500 KB; registrar os números em `research.md` (R11)
- [X] T041 Estender o teste de alto contraste em `tests/e2e/a11y.spec.ts` (`forcedColors: 'active'`, FR-034): todo `svg.tech-icon` com cor computada diferente da cor de fundo do chip ou da fita; todo `.ext-link` (ou o `.evidence-url`/`img` do badge de dentro) com `border-bottom-style: dashed`; toda `.skill-loop` com borda visível
- [X] T042 Rodar a suíte completa: `npm run typecheck`, `npm test`, `npm run test:e2e` (inclui V13: axe 0 violações, console 0 erros/avisos, alto contraste, 320px); corrigir o que falhar
- [X] T043 Inspeção manual do quickstart no build de produção (Playwright MCP): screenshots em 1440px e 390px; "reduzir movimento"; sem JavaScript; impressão; alto contraste; conferir os itens 1–7 da inspeção manual
- [X] T044 Checagem do Princípio I: nenhum dado factual mudou (só comandos temáticos e títulos de janela); registrar que o PDF do currículo não precisa de atualização por esta feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências. T002 → T003.
- **Foundational (Phase 2)**: depende de T003 (sprite) para T007/T008. Bloqueia US1 e US4.
- **US1 (Phase 3)**: depende da Foundational (TechIcon, tipos).
- **US2 (Phase 4)**: depende só do token `--glow-link` (T006); independente das outras histórias.
- **US3 (Phase 5)**: independente; T024 toca `SkillsSection.vue` e `ProjectsSection.vue`, também
  tocados por US1 e US5 (fazer em sequência, não em paralelo).
- **US4 (Phase 6)**: depende da Foundational. Se feita antes de US1, T029 também atualiza
  `SkillGroupCard.vue`.
- **US5 (Phase 7)**: depende de US1 (a faixa sai quando as sub-partes já existem; T030 toca
  `SkillsSection.vue`).
- **US6 (Phase 8)** e **US7 (Phase 9)**: independentes; ambas tocam `ProjectCard`/fixtures de teste
  (sequência, não paralelo).
- **Polish (Phase 10)**: depois das histórias desejadas.

### Within Each User Story

- Testes primeiro (devem falhar), depois implementação; checkpoint com os testes da história.
- Arquivos compartilhados (`SkillsSection.vue`, `base.css`, `visual-cleanup.spec.ts`,
  `ProjectCard.spec.ts`) sempre em sequência.

### Parallel Opportunities

- Setup: T001 em paralelo com T002.
- Foundational: T006, T008 e T009 em paralelo depois de T004/T005.
- US1: T010 e T011 em paralelo; US4: T026 e T027 em paralelo.
- US2 e US3 podem andar em paralelo com US1 em pessoas diferentes, respeitando os arquivos
  compartilhados acima.
- Polish: T038 e T039 em paralelo.

---

## Parallel Example: User Story 1

```bash
# testes primeiro, em paralelo:
Task: "Criar tests/component/SkillLoop.spec.ts (T010)"
Task: "Criar tests/e2e/skills.spec.ts com V8, V9, V11, V12 (T011)"
```

## Parallel Example: User Story 4

```bash
Task: "Criar tests/component/TagChip.spec.ts (T026)"
Task: "Criar tests/e2e/tech-icons.spec.ts com V6 e V15 (T027)"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup (sprite) → Foundational (tipos, registro, TechIcon).
2. US1: skills em sub-partes com loops. Validar V8–V12.
3. Parar e conferir com o autor, se for o caso.

### Incremental Delivery

1. US1 (skills) → US2 (links) → US3 (fundo) → US4 (chips) → US5 (faixa) → US6 (comandos) →
   US7 (títulos), cada uma com seu checkpoint.
2. Polish: peso, documentação, suíte completa, inspeção manual.

---

## Notes

- 44 tarefas. Por história: US1 7, US2 5, US3 4, US4 4, US5 2, US6 3, US7 2; Setup 3,
  Foundational 6, Polish 8.
- Analyze (2026-10-08): 7 achados (2 médios, 5 baixos) corrigidos nesta versão, com aprovação do
  autor: alto contraste testado (T041), sublinhado do badge falho (T017, T020), controles de
  navegação sem sublinhado (T017, FR-010), velocidade e sentido do loop (T011), brilho do badge
  (FR-008) e precisão do Lucide (research R2).
- Commit: só com autorização do autor (a 002 ainda está sem commit no mesmo branch).
- Implementação (2026-10-08): 44/44. Suíte: `vue-tsc` limpo, Vitest 70, Playwright 86. Peso inicial
  78 070 B gzip (−2 234 B); sprite 8,8 KB gzip à parte. Princípio I (T044): os dados só mudaram nos
  5 comandos (sem `./run`) e na remoção do campo `featured`; nenhuma skill, stack, cargo, data ou
  link mudou, então o PDF do currículo não precisa de atualização por esta feature.
- Fora do plano, encontrado na implementação: fallback para "JS principal falhou" (`html.app-loaded`
  em `main.ts` + script inline de `index.html`), nginx vindo do vectorlogo.zone e nestjs `original`
  (T003), caixa do badge com 29px para o sublinhado (T020), token de fita para impressão.
- Instabilidade conhecida, anterior a esta feature: sob carga, `terminals.spec.ts` (classe `booting`
  logo após o `goto`) e `badges.spec.ts` (rede do shields.io) às vezes falham; passam isolados e na
  suíte completa.
