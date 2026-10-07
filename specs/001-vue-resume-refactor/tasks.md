---

description: "Task list for 001-vue-resume-refactor"
---

# Tasks: Refatoração do Portfólio para Vue 3 com Vue Bits e Tailwind

**Input**: Design documents from `specs/001-vue-resume-refactor/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/resume.schema.ts,
contracts/page-contract.md, quickstart.md

**Tests**: incluídos. O plan.md (R11) e o quickstart.md definem a suíte (Vitest + Playwright + axe), e
a constituição (Fluxo de Trabalho e Verificação) exige verificação sem JS, com movimento reduzido e em
desktop/mobile.

**Organization**: tarefas agrupadas por user story da spec (US1–US4), cada uma testável sozinha.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: user story da spec (US1, US2, US3, US4)

## Path Conventions

Projeto único na raiz do repositório: `src/`, `tests/`, `public/`. A página atual é movida para
`legacy/` na T004 e serve de **referência de porte** até ser removida na T079. Referências do tipo
`legacy/js/main.js §2` apontam para os blocos numerados do script atual (§0 boot, §1 matrix,
§2 digitação, §3 reveal, §4 menu mobile, §5 contatos, §6 ano, §7 scrollspy); `legacy/css/style.css`
está dividido em blocos comentados (BOOT, NAVBAR, HERO, SEÇÕES, JANELA DE TERMINAL, TIMELINE,
SKILLS, PROJETOS, EDUCAÇÃO, CONTATO, FOOTER, RESPONSIVO, ACESSIBILIDADE).

Regra geral para todos os componentes: Vue 3 `<script setup lang="ts">`; nenhum texto do currículo
hard-coded (só rótulos de interface); cores, fontes, raios, larguras de container e
espaçamentos de seção só via tokens do `tokens.css` (utilitários Tailwind gerados por eles ou
`var(--…)` no `<style scoped>`). Valores arbitrários (`rounded-[8px]`, `max-w-[1100px]`) e px/rem
soltos de layout no CSS portado são defeitos (Princípio V). Medidas internas de um efeito, como os
deslocamentos do glitch ou o tamanho da scanline, podem ficar no `<style scoped>` do componente dono.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: baseline da versão atual, branch de trabalho e scaffold que já gera um build estático.

- [X] T001 Capturar o baseline visual da página atual **antes de mover qualquer arquivo**: servir a raiz com `python3 -m http.server 8000` e, para cada viewport 360x800, 768x1024, 1280x800 e 1920x1080, rodar `npx -y playwright@1.63 screenshot --full-page --wait-for-timeout=6000 --viewport-size=<W>,<H> http://localhost:8000/ specs/001-vue-resume-refactor/baseline/full-<W>.png` (o wait cobre a tela de boot de até 4,8 s); encerrar o servidor
- [X] T002 Criar e trocar para o branch `001-vue-resume-refactor` (`git switch -c 001-vue-resume-refactor`); todo o trabalho segue nele até o merge da T086, porque o GitHub Pages ainda publica a raiz da `main` (research R9)
- [X] T003 Atualizar `.gitignore` (hoje só `*.pdf`) para também ignorar `node_modules/`, `dist/`, `test-results/`, `playwright-report/`, `.vite/` e `specs/001-vue-resume-refactor/baseline/`
- [X] T004 Mover a página atual para referência e os assets para os novos lugares com `git mv`: `index.html` → `legacy/index.html`, `css/` → `legacy/css/`, `js/` → `legacy/js/`, `fonts/*.woff2` → `public/fonts/`, `img/image1-bg.webp`, `img/image2-bg.webp`, `img/image3-bg.webp` → `src/assets/img/`; remover com `git rm` `img/image1.png`, `img/image2.png`, `img/image3.png` (não são referenciados na página, research R10)
- [X] T005 [P] Em `tools/build-fonts.sh`, trocar `OUT="$ROOT/fonts"` por `OUT="$ROOT/public/fonts"`; não alterar `UNICODES`, `FEATURES` nem `TARGETS`
- [X] T006 Criar `package.json` com `"name": "portfolio"`, `"private": true`, `"type": "module"`, `"engines": { "node": ">=22" }` e scripts: `dev` = `vite`, `typecheck` = `vue-tsc --noEmit -p tsconfig.app.json`, `build` = `npm run typecheck && vite-ssg build`, `preview` = `vite preview`, `test` = `vitest run`, `test:e2e` = `npm run build && playwright test`; instalar dependências `vue@^3.5.43 @unhead/vue@^2.1` e de desenvolvimento `vite@^8.3 @vitejs/plugin-vue@^6.0 vite-ssg@^28.3 tailwindcss@^4.3 @tailwindcss/vite@^4.3 typescript@~6.0.3 vue-tsc@^3.3 vitest@^5.0 @vue/test-utils@^2.5 happy-dom@^20 @playwright/test@^1.63 @axe-core/playwright@^4.13 @types/node` (TypeScript pinado em ~6.0.3: o 7 é o compilador nativo e o `vue-tsc` não o suporta, research R2); versionar o `package-lock.json`
- [X] T007 [P] Criar `tsconfig.json` (só `references` para app e node), `tsconfig.app.json` (`strict: true`, `noUncheckedIndexedAccess: true`, `moduleResolution: "bundler"`, `jsx: "preserve"`, `types: ["vite/client"]`, `paths: { "@/*": ["./src/*"] }`, `include: ["src/**/*", "src/**/*.vue", "tests/**/*"]`) e `tsconfig.node.json` (para `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`)
- [X] T008 [P] Criar `vite.config.ts` com `base: '/Portfolio/'`, plugins `vue()` e `tailwindcss()` (de `@tailwindcss/vite`), alias `@` → `src`, e `ssgOptions: { formatting: 'minify', script: 'async' }`
- [X] T009 [P] Criar o template `index.html` na raiz: `<html lang="pt-BR">`, `<meta charset>`, `<meta name="viewport" content="width=device-width, initial-scale=1.0">`, favicon SVG inline `>_` copiado de `legacy/index.html`, `<link rel="preload" as="font" type="font/woff2" crossorigin>` para `/fonts/iosevka-400.woff2` e `/fonts/iosevka-aile-400.woff2` (caminhos absolutos sem o prefixo: o Vite aplica o `base` do `vite.config.ts` no build, então `/Portfolio/` só existe na T008), `<div id="app"></div>` e `<script type="module" src="/src/main.ts"></script>`; sem `<title>` (vem do `useHead`, T024)
- [X] T010 Criar `src/main.ts` com `import { ViteSSG } from 'vite-ssg/single-page'` e `export const createApp = ViteSSG(App)`, `src/App.vue` provisório com `<main><h1>scaffold</h1></main>` e `src/env.d.ts` (`/// <reference types="vite/client" />` + declaração de módulo `*.vue`); verificar que `npm run build` gera `dist/index.html` contendo `scaffold` no HTML (pré-renderizado)
- [X] T011 [P] Criar `vitest.config.ts` (plugin vue, alias `@`, `environment: 'happy-dom'`, `include: ['tests/unit/**/*.spec.ts', 'tests/component/**/*.spec.ts']`) e `playwright.config.ts` (`testDir: 'tests/e2e'`, `webServer: { command: 'npm run preview -- --port 4173 --strictPort', url: 'http://localhost:4173/Portfolio/', reuseExistingServer: true }`, `use.baseURL: 'http://localhost:4173/Portfolio/'`, projeto `chromium`); rodar `npx playwright install chromium`

**Checkpoint**: `npm run build && npm run preview` serve um HTML pré-renderizado em `/Portfolio/`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: tokens, dados tipados, script inline e componentes base que todas as stories usam.

**⚠️ CRITICAL**: nenhuma user story começa antes desta fase terminar.

### Estilos

- [X] T012 [P] Criar `src/styles/tokens.css` com `:root` copiando **exatamente** os valores de `legacy/css/style.css` (`--bg #0a0612`, `--bg-alt #0d0a16`, `--surface #16101f`, `--surface-2 #1c1428`, `--border #2c1d40`, `--purple #462066`, `--purple-light #7b3fb3`, `--purple-glow #a06ae0`, `--green #205e44`, `--green-light #2fa876`, `--green-bright #4ade9b`, `--text #d8d2e4`, `--text-dim #8a819e`, `--font-mono`, `--font-sans`) mais o token novo `--spotlight: rgb(160 106 224 / 0.18)`; e um bloco `@theme inline` expondo cada cor como `--color-<nome>: var(--<nome>)` e as fontes como `--font-mono`/`--font-sans` (research R4); e tokens de forma e layout com os valores atuais de `legacy/css/style.css`: no `@theme`, `--radius-window: 10px`, `--radius-card: 8px`, `--radius-btn: 6px`, `--radius-nav: 4px`, `--radius-tag: 3px`, `--radius-pill: 999px` (geram `rounded-window`, `rounded-card` etc.), `--container-page: 1100px` (gera `max-w-page`) e `--container-hero: 820px`; em `:root`, `--section-pad: 5rem 1.5rem 2rem`, `--hero-pad: 6rem 1.5rem 4rem` e `--nav-height: 4.5rem` (usado também no `scroll-padding-top`)
- [X] T013 [P] Criar `src/styles/fonts.css` com os 6 `@font-face` de `legacy/css/style.css` (Iosevka 400/600/700/800, Iosevka Aile 400/700), com `src: url('/fonts/<arquivo>.woff2')` (o Vite aplica o `base`) e o mesmo `font-display`
- [X] T014 [P] Criar `src/styles/base.css` portando de `legacy/css/style.css` o reset (`*`), `html` (`scroll-behavior: smooth; scroll-padding-top: 4.5rem`), `body`, `.mono`, `::selection`, scrollbar, `.hl-green`/`.hl-purple`, `.cursor` + keyframes de piscar, `.tag-now` + `pulse-glow`, o bloco ACESSIBILIDADE (reduz movimento) e um foco global `:focus-visible { outline: 2px solid var(--purple-glow); outline-offset: 2px }`; acrescentar `@media print` com fundo branco, texto escuro, `.scanlines`, canvas e boot ocultos, animações desligadas e `a[href^="http"]::after { content: " (" attr(href) ")" }` (FR-027)
- [X] T015 Criar `src/styles/main.css` com `@import "tailwindcss";` seguido de `tokens.css`, `fonts.css` e `base.css`; importar em `src/main.ts`; verificar no dev que `class="bg-bg text-text font-mono"` aplica a paleta e a Iosevka

### Dados

- [X] T016 Criar `src/types/resume.ts` copiando literalmente `specs/001-vue-resume-refactor/contracts/resume.schema.ts` (inclui `NonEmpty<T>`, `YearMonth`, `RichText`, `Project` como união que exige `evidence: NonEmpty<Evidence>` ou `evidence: []` + `noEvidenceReason: string`)
- [X] T017 **Coletar com o autor (bloqueia T018)** e registrar as respostas: `stack` (≥ 1 item) e `role` de cada projeto (ItaliaMi, Monitor de Curso, Temas VS Code); link público ou `noEvidenceReason` para ItaliaMi; confirmação da lista `featured` da faixa de tecnologias (sugestão: TypeScript, Vue.js, React, Java (Quarkus), Python (Flask), Node.js, PostgreSQL, MongoDB, Docker, RabbitMQ, Redis). Não inventar valores (Princípio I)
- [X] T018 Criar `src/data/resume.ts` exportando `export const resume = { ... } satisfies Resume` com o inventário completo de `data-model.md` (seção "Inventário de conteúdo"): `profile` (com `typedPhrases` = as 5 frases de `legacy/js/main.js §2`, `staticPhraseIndex: 1`, `tagline`, `about` como `RichText` com "TypeScript" e "Vue" em `highlight: 'green'`, 5 `attributes`, `seo` com o `<title>` e a `meta description` de `legacy/index.html`); as 5 `experiences` com `summary` copiado literalmente de cada `.card-desc` e `confidential: true` na primeira; 5 `skillGroups` com `featured` da T017; 3 `projects` com `command`, `purpose`, `tag` copiados das janelas atuais, `stack`/`role`/evidências da T017, e os 2 `Evidence` de marketplace com `badge.src` e `badge.alt` copiados de `legacy/index.html` e `accent` `'grape'`/`'sith'`; 3 `education`; 2 `contacts` (`github` → `https://github.com/V-Perotto`, `linkedin` → `https://www.linkedin.com/in/vittorioperotto/`). Comentário no topo explicando que este é o único arquivo de conteúdo
- [X] T019 [P] Criar `src/lib/period.ts` com `formatYearMonth('2026-03') → 'MAR 2026'` (meses pt-BR: JAN FEV MAR ABR MAI JUN JUL AGO SET OUT NOV DEZ), `formatPeriod(start, end?)` → `'MAR 2026 — JUL 2026'` ou `'MAR 2026 — PRESENTE'` (travessão `—` com espaços, FR-005) e `formatYears(start, end)` → `'2025 — 2027'`
- [X] T020 [P] Criar `src/lib/sort.ts` com `byStartDesc` (experiências por `start` decrescente) e `byStartYearDesc` (formação por `startYear` decrescente), sem mutar o array original (FR-004)
- [X] T021 [P] Criar `tests/unit/period.spec.ts` cobrindo os 12 meses, período fechado, período aberto (`PRESENTE`) e `formatYears`
- [X] T022 [P] Criar `tests/unit/resume.data.spec.ts` com as regras de `data-model.md` "Validação": (1) "`YearMonth` casa com `^\d{4}-(0[1-9]|1[0-2])$`; `start ≤ end` quando houver `end`"; (2) "No máximo uma experiência sem `end`"; (3) "`id` único dentro de cada coleção"; (4) "Toda URL começa com `https://`" (contatos, evidências, badges); (5) "`staticPhraseIndex` válido; `typedPhrases` sem strings vazias"; (6) "Projeto com `evidence` vazio tem `noEvidenceReason`"; (7) paridade "5 experiências, 5 grupos de skills, 3 projetos, 3 formações, 5 atributos, 2 contatos"; rodar `npm run test`

### Script inline, head e composables

- [X] T023 Adicionar ao `<head>` de `index.html` um `<script>` inline (antes do CSS) que: adiciona `js` ao `<html>`; se `matchMedia('(prefers-reduced-motion: reduce)')` não casar, adiciona `motion` e `booting`; e agenda `setTimeout(() => document.documentElement.classList.remove('booting'), 4800)` como teto do boot (FR-031, research R6/R7, contracts/page-contract.md "Classes no `<html>`"). Em `src/styles/base.css`, enquanto `html.booting` existir, cobrir a página com um `::before` fixo em `var(--bg)` e `z-index: 9998`
- [X] T024 [P] Criar `src/composables/useHeadFromResume.ts` que chama `useHead` de `@unhead/vue` com `title`, `meta description`, `og:title`, `og:description`, `og:type=website`, `og:url` = `new URL(import.meta.env.BASE_URL, 'https://v-perotto.github.io').href` (o caminho vem do `base`, sem repetir `/Portfolio/`), `og:locale=pt_BR` e `og:image` se houver, tudo de `resume.profile.seo` (FR-029); chamar em `src/App.vue`
- [X] T025 [P] Criar `src/composables/useMotion.ts` que retorna `ref<boolean>` `motion`: `false` no servidor; no `onMounted`, `true` se `<html>` tem a classe `motion`, e reage a mudanças de `prefers-reduced-motion` via `matchMedia(...).addEventListener('change')`

### Componentes base

- [X] T026 Instalar o `SpotlightCard` do Vue Bits via jsrepo (variante TS + Tailwind, comando da página do componente em vue-bits.dev) em `src/components/vendor/vue-bits/SpotlightCard.vue`; se o CLI falhar, copiar `src/content/Components/SpotlightCard/SpotlightCard.vue` do commit `07c0f76d5567db022c2e3185dd97a2311e056c0c` de `DavidHDev/vue-bits`. Adicionar comentário no topo com origem, commit e licença (MIT + Commons Clause). Única modificação no arquivo copiado: trocar `duration-500` por `duration-200` na camada de brilho (spec Design System, hover/foco 150–250ms), registrando a mudança no comentário do topo
- [X] T027 Criar `src/components/base/BaseCard.vue` envolvendo `SpotlightCard` com `spotlightColor="var(--spotlight)"` e `className` que sobrescreve o padrão para `rounded-card p-6 border-border bg-surface` (token do raio dos `.card` atuais); acrescentar o realce também em `:focus-within` (borda `--purple-glow`), sem `tabindex` próprio (research R8); prop `as` (`'article' | 'div' | 'li'`)
- [X] T028 [P] Criar `src/components/base/TagChip.vue` (estilo de `.chip` em `legacy/css/style.css`, raio 999px) e uso em `<ul role="list">` pelo chamador
- [X] T029 [P] Criar `src/components/base/ExternalLink.vue`: `<a :href target="_blank" rel="noopener noreferrer">` com slot e um `<span class="sr-only">(abre em nova aba)</span>` (FR-011)
- [X] T030 [P] Criar `src/components/base/RichText.vue` que recebe `RichText` e renderiza strings puras e `{ text, highlight }` como `<span class="hl-green|hl-purple">`
- [X] T031 [P] Criar `src/components/base/MetricBadge.vue` que recebe `Metric` e exibe `value` em `--green-bright` (peso 700) e `label` em `--text-dim`; o chamador só o renderiza se `highlights?.length` (FR-006)
- [X] T032 [P] Criar `src/components/terminal/TerminalWindow.vue` portando `.terminal-window`, `.terminal-bar`, `.terminal-title`, `.t-controls` e `.terminal-body` (bloco JANELA DE TERMINAL, raio 10px): prop `title` (ex.: `bash — sobre.txt`), controles `− □ ✕` com `aria-hidden`, slot default para o corpo
- [X] T033 [P] Criar `src/components/terminal/TerminalLine.vue` (`.t-line` com `$ ` em `.prompt-dollar` + slot) e `.t-output` como variante via prop `output`
- [X] T034 [P] Criar `src/components/terminal/PromptLogo.vue` (`viper@portfolio:~$` com as classes `prompt-user`, `prompt-at`, `prompt-host`, `prompt-colon`, `prompt-path`, `prompt-dollar` e cursor `▊` piscando), com o CSS desses spans portado do bloco NAVBAR/HERO
- [X] T035 [P] Criar `src/components/terminal/Scanlines.vue` portando `.scanlines` (overlay fixo, `aria-hidden="true"`, `pointer-events: none`)
- [X] T036 Criar `src/components/layout/SectionShell.vue`: props `id`, `title` (renderiza `<h2 class="section-title mono"><span class="title-hash">##</span> {title}<span class="title-slash">/</span></h2>`), `lead?` (linha `$ ...` em `.section-lead`), `decor?` (`{ src, tint: 'green' | 'purple' }` → `<img alt="" aria-hidden="true" loading="lazy">` em `.section-decor`); `<section :id>` com o CSS do bloco SEÇÕES portado

**Checkpoint**: tipos e dados passam no `npm run build`; `npm run test` verde; componentes base prontos.

---

## Phase 3: User Story 1 - Recrutador avalia o perfil rapidamente (Priority: P1) 🎯 MVP

**Goal**: hero, sobre, experiência, skills, educação e contato com o conteúdo atual, navegação e
rodapé, num HTML pré-renderizado legível sem JS.

**Independent Test**: abrir o preview em 360px e 1280px e conferir nome, cargo, resumo, as 5
experiências (mais recente primeiro, `MAR 2026 — JUL 2026` sem selo), skills, formação e os 2
contatos; repetir com JavaScript desligado.

### Tests for User Story 1

- [X] T037 [P] [US1] Criar `tests/e2e/no-js.spec.ts` (contexto `javaScriptEnabled: false`): o nome, as 5 empresas, os 5 grupos de skills, as 3 formações e os 2 contatos estão visíveis; nenhum elemento com texto próprio (nó de texto não vazio), fora de `[aria-hidden="true"]`, tem `opacity: 0`, `visibility: hidden` ou `display: none` computados (a camada de brilho do `SpotlightCard`, decorativa e sem texto, fica de fora); `/#experiencia` rola até a seção (quickstart V4)
- [X] T038 [P] [US1] Criar `tests/e2e/layout.spec.ts`: em 360, 768, 1280 e 1920px de largura, `document.documentElement.scrollWidth <= clientWidth`; coletar `page.on('console')` e falhar em qualquer `error` ou `warning` (FR-025, FR-026, quickstart V8)
- [X] T039 [P] [US1] Criar `tests/e2e/links.spec.ts` com o teste de âncoras: `#home`, `#sobre`, `#experiencia`, `#skills`, `#educacao` e `#contato` levam a um elemento com esse `id` visível no viewport (SC-010); e o menu mobile em 360px: o botão tem `aria-expanded="false"`, abre com Enter, muda para `true` e fecha ao clicar num link

### Implementation for User Story 1

- [X] T040 [P] [US1] Criar `src/composables/useActiveSection.ts` portando `legacy/js/main.js §7` (scroll + `requestAnimationFrame`, seção ativa = a última cujo `top <= innerHeight * 0.45`), retornando `ref<string | null>`
- [X] T041 [US1] Criar `src/components/layout/AppNav.vue` portando o bloco NAVBAR e `legacy/js/main.js §4`: `<nav aria-label="Principal">` com `PromptLogo` linkando `#home`, links `~/sobre`, `~/experiencia`, `~/skills`, `~/projetos`, `~/educacao`, `~/contato` (o último com `.nav-cta`) recebidos por prop `sections`, classe `active` via `useActiveSection`; botão toggle com `aria-controls`, `aria-expanded` e `aria-label` "Abrir menu"/"Fechar menu"; fechar ao clicar num link; sem JS (sem `html.js`), a lista fica exposta no mobile (contracts/page-contract.md)
- [X] T042 [US1] Criar `src/components/sections/HeroSection.vue` portando o bloco HERO: `<header id="home">`, `.hero-grid` decorativo, linha `[ OK ] Inicializando portfolio.service ...`, `<h1>` com `profile.name`, linha de prompt com `PromptLogo` sem cursor + `profile.typedPhrases[profile.staticPhraseIndex]` estático, `<p class="hero-sub">` com `profile.tagline` (texto puro; vira RevealText na US4), botões `./ver_experiencia.sh` (`#experiencia`, `.btn-primary`) e `ping vittorio` (`#contato`, `.btn-ghost`), link `▼ scroll` para `#sobre` com `aria-label`
- [X] T043 [P] [US1] Criar `src/components/sections/AboutSection.vue`: `SectionShell` `id="sobre"` `title="sobre"` com decor `image3-bg.webp` tint green; `TerminalWindow title="bash — sobre.txt"` com `$ cat sobre.txt` + `RichText` de `profile.about`, e `$ whois vittorio --info` + badges de `profile.attributes` (emoji em `<span aria-hidden="true">`)
- [X] T044 [P] [US1] Criar `src/components/sections/ExperienceCard.vue` dentro de `BaseCard as="li"`: `.card-date` com `// ` + `formatPeriod(start, end)` e, se não houver `end`, `<span class="tag-now">HEAD</span>`; `<h3 class="card-role">`; `.card-company` com `company · location`; `.card-desc` com `summary`; `MetricBadge` por `highlights` só se houver; `TagChip` por `tech`
- [X] T045 [US1] Criar `src/components/sections/ExperienceSection.vue`: `SectionShell` `id="experiencia"` `lead="$ git log --carreira --reverse=false"`; `<ol class="timeline">` com `ExperienceCard` para `[...experiences].sort(byStartDesc)`, marcador `.timeline-marker` com `aria-hidden`; CSS do bloco TIMELINE portado em `<style scoped>`
- [X] T046 [P] [US1] Criar `src/components/sections/SkillGroupCard.vue` dentro de `BaseCard`: `<h3 class="skill-cat mono">` com `<span class="skill-icon" aria-hidden="true">{icon}</span> {id}/`, e `TagChip` por item
- [X] T047 [US1] Criar `src/components/sections/SkillsSection.vue`: `SectionShell` `id="skills"` `lead="$ ls -la /usr/lib/vittorio/"` decor `image2-bg.webp` tint purple; grade `.skills-grid` (1 coluna < 768px, 2 colunas ≥ 768px) com `SkillGroupCard`; deixar um slot/lugar acima da grade para a `TechMarquee` (US4)
- [X] T048 [P] [US1] Criar `src/components/sections/EducationCard.vue` dentro de `BaseCard as="li"`: `// ` + `formatYears(startYear, endYear)` e `<span class="tag-now">EM CURSO</span>` se `status === 'em-curso'`; `<h3 class="card-role">` com `course`; `.card-company` com `institution · location`
- [X] T049 [US1] Criar `src/components/sections/EducationSection.vue`: `SectionShell` `id="educacao"` `lead="$ apt list --installed | grep formacao"`; `<ol class="edu-list">` com `EducationCard` para `[...education].sort(byStartYearDesc)`
- [X] T050 [P] [US1] Criar `src/components/sections/ContactSection.vue` portando o bloco CONTATO e `legacy/js/main.js §5`: `TerminalWindow title="bash — contato.sh"` com `$ ./contato.sh --all`, `<ul class="contact-list">` com `<span class="c-key">{key}</span><span class="c-sep">=</span>` + `ExternalLink` cujo texto é `label ?? url.replace(/^https?:\/\//, '')`, e a linha final `Conexão estabelecida. Aguardando sua mensagem...` com cursor
- [X] T051 [P] [US1] Criar `src/components/layout/AppFooter.vue` portando o bloco FOOTER: `$ echo "© {ano} Vittorio Perotto — feito com Vue, Tailwind e Vue Bits"` (FR-033) e `process finished with exit code 0`; o ano é `new Date().getFullYear()` no build e é atualizado no `onMounted`
- [X] T052 [US1] Compor `src/App.vue`: `useHeadFromResume()`, `Scanlines`, `AppNav` com as seções, `HeroSection`, `<main>` com `AboutSection`, `ExperienceSection`, `SkillsSection`, `EducationSection`, `ContactSection`, e `AppFooter`; portar o bloco RESPONSIVO para os componentes; rodar `npm run test:e2e -- no-js layout links` e comparar com o baseline 1280/360 da T001

**Checkpoint**: MVP publicável — conteúdo completo exceto projetos, sem JS e responsivo.

---

## Phase 4: User Story 2 - Visitante comprova os projetos (Priority: P2)

**Goal**: seção de projetos com propósito, stack, papel, tipo e evidências verificáveis.

**Independent Test**: abrir `#projetos`, conferir os 3 projetos e clicar nos 2 links do Open VSX
(nova aba, `noopener`); bloquear `img.shields.io` e conferir que o cartão continua legível.

### Tests for User Story 2

- [X] T053 [P] [US2] Criar `tests/component/ProjectCard.spec.ts`: projeto com `evidence: []` mostra `noEvidenceReason` e nenhum link; projeto sem `highlights` não renderiza container de métricas (sem `undefined` nem rótulo vazio); projeto com evidência renderiza `<a target="_blank" rel="noopener noreferrer">`
- [X] T054 [P] [US2] Criar `tests/e2e/badges.spec.ts`: com `page.route('**/img.shields.io/**', r => r.abort())`, os nomes "Grape Glass Theme" e "Shadow Lord - Son of Dathomir Theme" ficam visíveis, os 2 links apontam para `open-vsx.org` e a altura do cartão de Temas VS Code não muda em relação ao carregamento com badges (quickstart V10)
- [X] T055 [P] [US2] Ampliar `tests/e2e/links.spec.ts`: `#projetos` leva à seção; todo `a[href^="http"]` da página tem `target="_blank"` e `rel` contendo `noopener` e `noreferrer` (FR-011)

### Implementation for User Story 2

- [X] T056 [P] [US2] Criar `src/components/sections/EvidenceLink.vue`: nome com `> ` em `.prompt-dollar` e classe `neon-grape`/`neon-sith` conforme `accent` (portar essas classes do bloco PROJETOS); `ExternalLink` para `url` contendo o `<img :src="badge.src" :alt="badge.alt" loading="lazy">` quando houver `badge`, com `width`/`height` fixos para reservar espaço se a imagem falhar
- [X] T057 [US2] Criar `src/components/sections/ProjectCard.vue` = `BaseCard` + `TerminalWindow title="bash — {id}"`: `$ {command}`; `<h3>` com `<span class="hl-purple">{name}</span> — {subtitle}`; `purpose` em `.t-desc`; linha de stack com `TagChip`; papel (`role`) e tipo (`kind` como rótulo legível: pessoal, acadêmico, open source, profissional); `MetricBadge` só se `highlights?.length`; `EvidenceLink` por evidência ou o texto de `noEvidenceReason`; rodapé `<span class="hl-green">{tag}</span> <span class="t-exit">exit 0</span>`
- [X] T058 [US2] Criar `src/components/sections/ProjectsSection.vue`: `SectionShell` `id="projetos"` decor `image1-bg.webp` tint green; `.projects-grid` (1 coluna < 768px, 2 ≥ 768px) com `ProjectCard` na ordem do arquivo (relevância, Princípio II); portar o bloco PROJETOS
- [X] T059 [US2] Inserir `ProjectsSection` em `src/App.vue` entre `SkillsSection` e `EducationSection` e o link `~/projetos` no `AppNav`; rodar `npm run test && npm run test:e2e -- badges links`

**Checkpoint**: US1 + US2 completas — paridade total de conteúdo (SC-001).

---

## Phase 5: User Story 3 - Autor atualiza o currículo editando só os dados (Priority: P2)

**Goal**: qualquer mudança de conteúdo exige editar só `src/data/resume.ts`; coleções vazias e
campos opcionais ausentes não deixam resíduos.

**Independent Test**: quickstart V2 — remover um campo obrigatório quebra o build com arquivo, linha
e campo; adicionar uma experiência com `start: '2019-01'` a faz aparecer por último; `git status` só
mostra `src/data/resume.ts`.

### Tests for User Story 3

- [X] T060 [P] [US3] Criar `tests/component/ExperienceCard.spec.ts`: sem `highlights` não há container de métricas; com `end` não há `.tag-now`; sem `end` aparece `PRESENTE` e o selo `HEAD`
- [X] T061 [P] [US3] Criar `tests/unit/sections.spec.ts` para `visibleSections(resume)`: uma coleção vazia (ex.: `education: []`) remove a seção da lista; a ordem é sempre `sobre, experiencia, skills, projetos, educacao, contato`

### Implementation for User Story 3

- [X] T062 [US3] Criar `src/lib/sections.ts` com `visibleSections(resume)` → lista de `{ id, label }` (`label` = `~/<id>`), omitindo seções cuja coleção esteja vazia (`education` é a única que o tipo permite vazia)
- [X] T063 [US3] Usar `visibleSections` em `src/App.vue` (renderizar cada seção só se estiver na lista) e em `src/components/layout/AppNav.vue` (links derivados da lista, sem hard-code)
- [X] T064 [US3] Ampliar o comentário do topo de `src/data/resume.ts` com o guia de edição: formato `"AAAA-MM"`, omitir `end` para vínculo em andamento, `confidential` anonimiza a empresa, `featured` alimenta a faixa, `highlights` só com números que o currículo sustente (Princípio I), `evidence: []` exige `noEvidenceReason`
- [X] T065 [US3] Executar o quickstart V2 (passos 1–3) e confirmar que o erro do `vue-tsc` cita `src/data/resume.ts`, a linha e o nome do campo; reverter as alterações de teste

**Checkpoint**: fluxo de edição pelo arquivo de dados validado.

---

## Phase 6: User Story 4 - Experiência visual moderna e discreta (Priority: P3)

**Goal**: efeitos do tema de terminal (boot, matrix, glitch, digitação, revelação ao rolar) e os
efeitos novos do Vue Bits (BlurText na tagline, LogoLoop nas skills), todos desligados com
movimento reduzido.

**Independent Test**: quickstart V5 e V6 — com mouse, todos os efeitos rodam; com
`reducedMotion: 'reduce'`, dois screenshots com 2 s de intervalo são idênticos.

### Tests for User Story 4

- [X] T066 [P] [US4] Criar `tests/component/RevealText.spec.ts`: renderizar com `@vue/server-renderer` (`renderToString`) e verificar que a saída contém a frase inteira como texto, sem `opacity:0` nem `blur`
- [X] T067 [P] [US4] Criar `tests/e2e/reduced-motion.spec.ts` (`reducedMotion: 'reduce'`): `<html>` sem `motion`/`booting`; `#bootScreen` e `canvas` ausentes; o prompt do hero mostra `Desenvolvedor Full-Stack`; a tagline está visível de imediato; dois screenshots com 2 s de intervalo são iguais (SC-007)
- [X] T068 [P] [US4] Criar `tests/e2e/motion.spec.ts` (sem redução): o boot some em ≤ 5 s sem interação e some ao pressionar uma tecla; o texto do prompt muda ao longo de 3 s; o `canvas` do hero existe; após rolar até `#experiencia`, os cartões ficam com `opacity: 1`

### Implementation for User Story 4

- [X] T069 [US4] Instalar `BlurText` e `LogoLoop` do Vue Bits (mesmo procedimento da T026; fontes `src/content/TextAnimations/BlurText/BlurText.vue` e `src/content/Animations/LogoLoop/LogoLoop.vue`) em `src/components/vendor/vue-bits/`, e as dependências `motion-v@^2.6 @vueuse/core@^15`
- [X] T070 [P] [US4] Criar `src/components/base/RevealText.vue` (research R6): no servidor e sem `motion`, renderiza `<p>` com o texto puro; no cliente com `useMotion() === true`, troca para `BlurText` (`animateBy="words"`, `direction="top"`, `delay` ajustado para terminar em ≤ 1,5 s, FR-015) carregado com `defineAsyncComponent(() => import(...))` para que `motion-v` fique num chunk separado; container com `aria-label` = texto e palavras animadas com `aria-hidden`; usar em `HeroSection.vue` no lugar do `<p class="hero-sub">`
- [X] T071 [P] [US4] Criar `src/components/base/TechMarquee.vue` sobre `LogoLoop`: itens `{ node: name }` de todos os `SkillItem` com `featured: true` (na ordem dos grupos), `pauseOnHover`, `fadeOut` com `fadeOutColor="var(--bg)"`, estilo de cada item igual a `TagChip`, velocidade em que um item cruza a tela em ≥ 8 s; wrapper com `aria-hidden="true"` (a lista acessível são os `SkillGroupCard`, FR-016); sem `motion`, exibir a primeira cópia estática; inserir em `SkillsSection.vue` acima da grade
- [X] T072 [P] [US4] Criar `src/components/terminal/GlitchTitle.vue` portando `.glitch` (com `data-text`, `::before`/`::after` e keyframes) do bloco HERO; renderiza o `<h1>`; animação só sob `html.motion`; substituir o `<h1>` de `HeroSection.vue`
- [X] T073 [P] [US4] Criar `src/components/terminal/TypedPrompt.vue` portando `legacy/js/main.js §2`: no SSR e sem `motion`, mostra `phrases[staticIndex]`; no cliente com `motion`, após 900 ms digita (65–125 ms por caractere), pausa 1800 ms, apaga (30 ms por caractere), espera 400 ms e passa à próxima frase em loop; limpar timers no `onBeforeUnmount`; substituir o texto estático do prompt em `HeroSection.vue`
- [X] T074 [P] [US4] Criar `src/components/terminal/MatrixRain.vue` portando `legacy/js/main.js §1` para um `<canvas aria-hidden="true">` montado só no cliente e só com `motion`; redimensionar com `ResizeObserver`; cancelar o `requestAnimationFrame` no `onBeforeUnmount`; usar em `HeroSection.vue`
- [X] T075 [US4] Criar `src/components/terminal/BootScreen.vue` portando `legacy/js/main.js §0` e o bloco BOOT do CSS: montado só no cliente quando `<html>` tem `booting`; mesma sequência de linhas (`ssh viper@portfolio`, "Conectando…", senha, "Autenticado. Bem-vindo ao PortfolioOS 1.0 LTS", `Last login: <data pt-BR> from 127.0.0.1`, `./iniciar_portfolio.sh`); `[ pressione qualquer tecla para pular ]`; termina em ≤ 4,8 s ou em `keydown`/`click`, removendo `booting` do `<html>`, aplicando o fade de 600 ms e desmontando; a tela fica com `position: fixed; inset: 0; z-index: 9999`, acima da capa `html.booting::before` (`z-index: 9998`, T023); usar em `src/App.vue`
- [X] T076 [US4] Criar `src/directives/reveal.ts` (`v-reveal`) portando `legacy/js/main.js §3` e o CSS `.reveal`/`.visible`: o estado escondido só vale sob `html.motion .reveal:not(.visible)` (deslocamento ≤ 24px, 300–800 ms, FR-017); `IntersectionObserver` adiciona `visible` uma vez e para de observar; sem observer, adiciona `visible` direto; registrar em `src/main.ts` e aplicar em `ExperienceCard`, `SkillGroupCard`, `ProjectCard`, `EducationCard` e nas janelas de `AboutSection`/`ContactSection`
- [X] T077 [US4] Rodar `npm run test && npm run test:e2e -- reduced-motion motion` e o quickstart V6 manualmente; conferir no output do `vite-ssg build` que o chunk do `motion-v` está separado do bundle principal e que a soma dos JS não passa de 150 KB gzip

**Checkpoint**: todas as user stories funcionando e testadas de forma independente.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: paridade visual, acessibilidade, peso, limpeza e publicação.

- [X] T078 Comparar screenshots do preview (`npx playwright screenshot --full-page --wait-for-timeout=6000` nas 4 larguras) com `specs/001-vue-resume-refactor/baseline/` e corrigir divergências portando o CSS restante de `legacy/css/style.css` para utilitários ou `<style scoped>` (research R5); diferenças aceitas: realce do SpotlightCard, BlurText e faixa de tecnologias (quickstart V3)
- [X] T079 Remover `legacy/` (`git rm -r legacy`) depois que a T078 estiver aprovada; `grep -r "legacy/" src tests` não pode retornar nada
- [X] T080 [P] Criar `tools/reencode-images.py` (Pillow, já disponível) que regrava `src/assets/img/image{1,2,3}-bg.webp` com qualidade reduzida e, se preciso, largura máxima de 1600px, até cada arquivo ficar ≤ 60 KB; rodar e conferir visualmente que o tint e a opacidade escondem a perda (research R12)
- [X] T081 [P] Criar `tests/e2e/a11y.spec.ts` com `@axe-core/playwright`: zero violações `critical`/`serious` em 360px e 1280px, com e sem `reducedMotion`; navegar só com Tab e verificar que todo elemento focado tem `outline` visível (SC-005, SC-006)
- [X] T082 [P] Criar `tests/e2e/weight.spec.ts`: carregar a página sem rolar, esperar `load` e somar `transferSize` de `performance.getEntriesByType('resource')` + navegação, excluindo `img.shields.io`; falhar acima de 500 KB (SC-012, research R12)
- [X] T083 [P] Criar `.github/workflows/pages.yml`: em `push` para `main` e `workflow_dispatch`; permissões `pages: write`, `id-token: write`, `contents: read`; job `build` com `actions/checkout`, `actions/setup-node` (Node 24, cache npm), `npm ci`, `npm run test`, `npx playwright install --with-deps chromium`, `npm run test:e2e`, `actions/upload-pages-artifact` com `path: dist`; job `deploy` com `actions/deploy-pages`
- [X] T084 [P] Criar `README.md` na raiz com: o que é o projeto, pré-requisitos (Node ≥ 22), os comandos `npm ci`, `npm run dev`, `npm run build` (o único comando de build, Princípio III), `npm run preview`, `npm run test`, `npm run test:e2e`, onde editar o conteúdo (`src/data/resume.ts`), como regenerar as fontes (`tools/build-fonts.sh`) e como a publicação acontece (workflow `pages.yml`); linkar `specs/001-vue-resume-refactor/quickstart.md`
- [ ] T085 *(automatizado concluído em 2026-10-07: 35 unit/componente + 28 e2e verdes; Lighthouse móvel 95/100/100/100 com LCP 2,8 s — original 2,7 s — e desktop 100/100/100/100 com LCP 0,6 s; impressão corrigida; conteúdo conferido com o currículo. **Pendente: teste SC-003 com 3 pessoas**)* Rodar o quickstart completo (V1–V11), incluindo Lighthouse mobile e desktop (LCP < 2,5 s, CLS < 0,1, acessibilidade ≥ 95) e a impressão (FR-027); fazer o teste de 5 segundos do SC-003 com ao menos 3 pessoas (mostrar a página por 5 s e perguntar nome, cargo e como entrar em contato — todas precisam acertar); anotar os resultados no PR
- [ ] T086 **Ação manual do autor**: em GitHub → Settings → Pages → Build and deployment, trocar a fonte para "GitHub Actions"; só então fazer o merge de `001-vue-resume-refactor` na `main` e validar o quickstart V12 em `https://v-perotto.github.io/Portfolio/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 antes de T004 (o baseline precisa da página atual intacta); T006 antes
  de T007–T011.
- **Foundational (Phase 2)**: depende do Setup; **T017 (respostas do autor) bloqueia T018**, que
  bloqueia T022 e todas as stories.
- **US1 (Phase 3)**: depende da Phase 2.
- **US2 (Phase 4)**: depende da Phase 2; T059 toca `App.vue` e `AppNav.vue`, então fazê-la depois da
  T052. Testável sozinha: `ProjectCard` e `ProjectsSection` não dependem de componentes da US1.
- **US3 (Phase 5)**: depende de US1 (a T063 refatora `App.vue`/`AppNav.vue` criados nela) e se
  beneficia da US2 (para o `ProjectCard` existir no V2).
- **US4 (Phase 6)**: depende de US1 (substitui partes de `HeroSection.vue` e `SkillsSection.vue`);
  independente de US2 e US3, exceto a T076, que aplica `v-reveal` ao `ProjectCard` se ele existir.
- **Polish (Phase 7)**: depois das stories desejadas; T079 depois de T078; T086 por último.

### Within Each User Story

- Testes da story antes da implementação (devem falhar primeiro).
- Componentes folha (cards) antes das seções; seções antes da composição em `App.vue`.

### Parallel Opportunities

- Setup: T005, T007, T008, T009, T011 em paralelo após a T006.
- Foundational: T012–T014; T019–T022 (após T018); T024–T025; T028–T035.
- US1: T037–T039 juntos; T040, T043, T044, T046, T048, T050, T051 juntos.
- US2: T053–T056 juntos.
- US4: T066–T068 juntos; T070–T074 juntos após a T069.
- Polish: T080–T084 juntos.

---

## Parallel Example: User Story 1

```bash
# Testes da US1 juntos:
Task: "Criar tests/e2e/no-js.spec.ts"
Task: "Criar tests/e2e/layout.spec.ts"
Task: "Criar tests/e2e/links.spec.ts (âncoras + menu mobile)"

# Componentes folha da US1 juntos:
Task: "Criar src/components/sections/ExperienceCard.vue"
Task: "Criar src/components/sections/SkillGroupCard.vue"
Task: "Criar src/components/sections/EducationCard.vue"
Task: "Criar src/components/sections/AboutSection.vue"
Task: "Criar src/components/sections/ContactSection.vue"
Task: "Criar src/components/layout/AppFooter.vue"
```

## Parallel Example: User Story 4

```bash
# Após instalar BlurText e LogoLoop (T069):
Task: "Criar src/components/base/RevealText.vue"
Task: "Criar src/components/base/TechMarquee.vue"
Task: "Criar src/components/terminal/GlitchTitle.vue"
Task: "Criar src/components/terminal/TypedPrompt.vue"
Task: "Criar src/components/terminal/MatrixRain.vue"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 (Setup) → Phase 2 (Foundational, com as respostas do autor da T017).
2. Phase 3 (US1).
3. **Validar**: quickstart V1 (parcial), V4, V8 e V9 (âncoras).
4. O MVP já pode ser publicado (T083 + T086) se o autor quiser trocar o site antes dos projetos — mas
   isso tiraria a seção de projetos do ar; o recomendado é publicar só depois da US2.

### Incremental Delivery

1. Setup + Foundational → base pronta.
2. US1 → MVP verificado localmente.
3. US2 → paridade total de conteúdo → **primeira publicação recomendada**.
4. US3 → fluxo de edição pelos dados.
5. US4 → efeitos visuais (o site publicado antes disso fica sem boot, matrix, glitch e digitação).
6. Polish → paridade visual, acessibilidade, peso e publicação final.

---

## Notes

- [P] = arquivos diferentes, sem dependência pendente.
- Commit a cada tarefa ou grupo lógico, no branch `001-vue-resume-refactor`.
- Nenhum valor de conteúdo pode ser inventado: na dúvida, perguntar ao autor (Princípio I).
- Parar em cada checkpoint e validar a story sozinha.

---

## Phase 8: Convergence

- [ ] T087 CRITICAL: mover para `src/styles/tokens.css` toda cor escrita direto nos componentes e no `base.css` — brilhos e sombras (`rgba(74, 222, 155, …)`, `rgba(123, 63, 179, …)`, `rgba(0, 0, 0, …)` etc.) viram tokens próprios (ex.: `--glow-green`, `--glow-purple`, `--shadow-window`) ou `color-mix(in srgb, var(--token) N%, transparent)`; literais `#fff`, `#eafff4`, `#e6ddf2`, `#ff6b6b` e as cores `#7b3fb3`/`#2fa876` do canvas em `src/components/terminal/MatrixRain.vue` (lidas com `getComputedStyle(document.documentElement)`) passam a vir de tokens; o bloco de tokens da impressão sai de `src/styles/base.css` para um `@media print { :root { … } }` em `tokens.css`; espaçamentos internos de componentes (`padding`, `gap`, `margin` em rem nos `.vue`) passam a usar a escala do Tailwind ou tokens de espaçamento; ao final, `grep -rnE "#[0-9a-fA-F]{3,6}\b|rgba?\(" src/components src/styles/base.css` (fora de `vendor/`) não retorna nada e as capturas de tela seguem idênticas, per Constitution V (contradicts)
- [ ] T088 CRITICAL: **com o autor**, resolver as divergências entre o site e o currículo vigente (`CV Vittorio Perotto - PTBR - 2026-04-21.pdf`): (a) "sobre" cita TypeScript e Vue, o CV cita Java (Quarkus) e Python; (b) Angular e Valkey nas skills não constam do CV; (c) vínculo confidencial termina em JUL 2026 no site e consta como PRESENTE no CV; (d) o projeto Temas VS Code não consta do CV. Para cada item, o autor escolhe atualizar o CV ou `src/data/resume.ts`; ajustar o teste de paridade em `tests/unit/resume.data.spec.ts` se as contagens mudarem, per Constitution I (contradicts)
- [ ] T089 Levar o LCP móvel (Lighthouse, 4G simulado) abaixo de 2,5 s sem mudar o visual: o elemento de LCP é o `<h1>` em Iosevka 800 (`src/components/terminal/GlitchTitle.vue`). Avaliar e medir, nesta ordem: subset específico só com os caracteres do nome para o peso 800 (via `tools/build-fonts.sh`) com preload; `font-display: optional` só no 800; `fetchpriority="high"` no preload. Manter a opção que baixar o LCP sem regredir CLS, peso (≤ 500 KB) e o visual do baseline; registrar a medição em `specs/001-vue-resume-refactor/research.md` (R12), per SC-004 (partial)
- [ ] T090 Acender o brilho do `SpotlightCard` quando um link dentro do cartão recebe foco por teclado: em `src/components/base/BaseCard.vue`, regra `:focus-within` que força a camada de brilho (primeiro filho do root, hoje com `opacity` inline) para `opacity: 0.6` com um gradiente centralizado em `var(--spotlight)`; cobrir com um caso em `tests/e2e/a11y.spec.ts` (Tab até um link de projeto → camada com opacidade > 0), per US4/AC2 e FR-014 (partial)
- [ ] T091 Fazer o erro de tipo apontar a linha do item, e não a do início da coleção: em `src/data/resume.ts`, declarar cada item com um helper tipado (ex.: `const exp = (e: Experience) => e`, idem para projetos, grupos de skills e formação) ou `satisfies Experience` por item; validar com o quickstart V2.1 (remover `role` de um item → erro com a linha desse item e o nome do campo), per FR-002 e US3/AC2 (partial)
- [ ] T092 Ajustar para no máximo 250 ms as transições de hover/foco de 0,3 s em `src/components/base/BaseCard.vue` (variante `window`), `src/components/sections/AboutSection.vue` e `src/components/sections/ContactSection.vue`, per spec, Design System, Movimento (partial)
- [ ] T093 Documentar o que foi acrescentado fora do plano: `src/composables/useHashAnchor.ts` (reposiciona âncoras depois do swap de fontes; motivação: flake de SC-010), `src/composables/useBootDone.ts` (efeitos esperam a tela de boot) e as correções no `BlurText` do vendor (tipos e `tag` → `as`) — na árvore de *Project Structure* do `plan.md` e em `research.md` (R3, R6), via uma revisão do plano, per plan: Project Structure (unrequested)

---

## Phase 9: Convergence

- [ ] T094 CRITICAL: garantir que o conteúdo fique totalmente descoberto em no máximo 5 s contados do início da navegação, com o fade incluído: no script inline de `index.html`, trocar o `setTimeout(…, 4800)` por um teto que também esconda a tela de boot (ex.: adicionar a classe `boot-done` ao `<html>` em `4400 - performance.now()` ms, e em `src/styles/base.css` `html.boot-done .boot-screen { display: none }`); em `src/components/terminal/BootScreen.vue`, calcular o tempo restante como `4400 - performance.now()` (4,4 s + 600 ms de fade = 5 s) em vez do `schedule(4800, finish)` fixo, e não montar o boot (removendo `booting`) se o restante for menor que ~1 s; em `tests/e2e/motion.spec.ts`, medir a partir do `page.goto` que `.boot-screen` some (contagem 0) em ≤ 5000 ms e acrescentar um caso com o bundle atrasado (`page.route` em `**/assets/*.js` com 3 s de espera) em que a página fica descoberta em ≤ 5 s, per FR-031, US4/AC6 e Constitution IV (contradicts)
- [ ] T095 CRITICAL: permitir projeto sem evidência pública só quando confidencial: em `specs/001-vue-resume-refactor/contracts/resume.schema.ts` e `src/types/resume.ts`, trocar o ramo `{ evidence: []; noEvidenceReason: string }` por `{ evidence: []; confidential: true; noEvidenceReason: string }`; em `src/data/resume.ts`, marcar o ItaliaMi com `confidential: true` e trocar o `noEvidenceReason` por um texto que diga que o trabalho é confidencial — **redação confirmada com o autor**, sem detalhes sigilosos (Princípio I); em `src/components/sections/ProjectCard.vue`, exibir a linha como trabalho confidencial; atualizar `tests/component/ProjectCard.spec.ts` e a regra 6 de `tests/unit/resume.data.spec.ts` ("Projeto com `evidence` vazio tem `confidential: true` e `noEvidenceReason`") e o comentário-guia do topo de `resume.ts`, per FR-010, US2/AC4 e Constitution II (contradicts)
- [ ] T096 Criar o controle de movimento do FR-035: (1) em `src/composables/useMotion.ts`, trocar o `ref` local por um estado compartilhado no módulo (`motion` = `html.motion` presente, sem `prefers-reduced-motion` e com a preferência do visitante ligada), com `setMotion(on)` que adiciona/remove `motion` do `<html>` e grava `localStorage['motion']` = `'off'|'on'` dentro de `try/catch`; (2) no script inline de `index.html`, ler `localStorage['motion']` (em `try/catch`) e, se `'off'`, não adicionar `motion` nem `booting`; (3) em `src/components/layout/AppNav.vue`, um `<button type="button" aria-pressed>` com rótulo no estilo de terminal (ex.: `motion: on`/`motion: off`), alcançável por Tab e operável por toque, oculto sem JS (`html:not(.js)`); (4) fazer parar ao desligar, no mesmo estado final do movimento reduzido: `TypedPrompt.vue` (limpa timers e mostra `phrases[staticIndex]`), `MatrixRain.vue` (cancela o rAF e desmonta o canvas), `GlitchTitle.vue` (já depende de `html.motion`), `RevealText.vue` (texto puro), `src/directives/reveal.ts` (marca tudo `visible`) e `src/components/base/TechMarquee.vue` (passar a usar `useMotion` e, sem movimento, exibir a primeira cópia estática, sem depender só do `matchMedia` do `LogoLoop`); (5) criar `tests/e2e/motion-toggle.spec.ts`: Tab até o controle, Enter → `aria-pressed="false"`, dois screenshots com 2 s de intervalo iguais; recarregar → o estado continua desligado e não há boot; (6) registrar `useMotion` compartilhado e o controle na árvore e no mapeamento do `plan.md`, per FR-035, US4/AC8, SC-007 e FR-016 (missing)
