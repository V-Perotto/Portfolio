# Implementation Plan: Refatoração do Portfólio para Vue 3 com Vue Bits e Tailwind

**Branch**: `001-vue-resume-refactor` | **Date**: 2026-10-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-vue-resume-refactor/spec.md`

## Summary

Reescrever a página única do portfólio (HTML/CSS/JS puros) como um projeto Vue 3 +
`<script setup>` + TypeScript, com todo o conteúdo do currículo em `src/data/resume.ts` e a
interface montada por componentes. O visual de terminal atual é preservado integralmente;
`SpotlightCard`, `BlurText` e `LogoLoop` do Vue Bits acrescentam o realce no hover, a revelação da
tagline e a faixa de tecnologias. O site é pré-renderizado no build com `vite-ssg` (modo single
page), então o `dist/` publicado é HTML estático com todo o conteúdo, legível sem JavaScript, e
continua no GitHub Pages, agora publicado por GitHub Actions.

## Technical Context

**Language/Version**: TypeScript ~6.0.3 (pinado para compatibilidade com `vue-tsc`, ver research
R2), Vue 3.5, Node ≥ 22 no build

**Primary Dependencies**: `vue` 3.5, `vite` 8, `@vitejs/plugin-vue` 6, `vite-ssg` 28 (single page),
`@unhead/vue` 2, `tailwindcss` 4 + `@tailwindcss/vite`, `motion-v` 2 + `@vueuse/core` 15
(dependências do `BlurText`); componentes Vue Bits copiados via `jsrepo` (não são pacote npm)

**Storage**: N/A — o conteúdo é um módulo TypeScript versionado (`src/data/resume.ts`)

**Testing**: `vue-tsc` (gate de tipos do build), Vitest 5 + `@vue/test-utils` + `happy-dom`
(dados e componentes), Playwright 1.63 + `@axe-core/playwright` (e2e sobre o build), Lighthouse
manual

**Target Platform**: navegadores evergreen (Chrome, Firefox, Safari, Edge — 2 últimas versões),
desktop e mobile; publicação estática no GitHub Pages em `/Portfolio/`

**Project Type**: site estático pré-renderizado (SPA hidratada de página única)

**Performance Goals**: LCP < 2,5 s em 4G simulado (sem contar o boot), CLS < 0,1, Lighthouse
acessibilidade ≥ 95; animações a 60 fps

**Constraints**: conteúdo completo no HTML sem JS; ≤ 500 KB no carregamento inicial (orçamento em
research R12); boot ≤ 5 s e pulável; zero erros/avisos no console; `prefers-reduced-motion`
desliga todo movimento

**Scale/Scope**: 1 página, 7 seções, ~30 componentes, ~20 itens de conteúdo

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constituição v2.0.0.

| Princípio | Verificação | Pré-pesquisa | Pós-design |
|-----------|-------------|--------------|------------|
| I. Fidelidade ao Currículo | Conteúdo migra 1:1 (inventário no data-model); métricas opcionais e vazias; confidencial anonimizado; no máximo um vínculo sem `end` (teste) | PASS | PASS |
| II. Projetos Demonstráveis | `Project` exige `stack`, `role` e evidência ou `noEvidenceReason` (tipo); links externos com `noopener noreferrer`; badges com `alt` | PASS | PASS — com pendências de conteúdo do autor (abaixo) |
| III. Saída Estática | `vite-ssg` gera HTML completo; JS só acrescenta comportamento (R6, R7); `npm run build` único e lockfile versionado; `dist/` fora do git; badges degradam; cada dependência justificada (tabela abaixo) | PASS | PASS |
| IV. Acessibilidade e Desempenho | Movimento reduzido desliga tudo; boot ≤ 5 s com teto no script inline; teclado + `:focus-within`; axe no CI; orçamento de peso (R12) | PASS | PASS |
| V. Identidade Visual Coerente | Paleta, tipografia, prompt, janelas e timeline mantidos (Q2); tokens num único `tokens.css`; pt-BR | PASS | PASS |
| Restrições de Conteúdo e Tecnologia | Só GitHub e LinkedIn publicados; PDF continua fora do git; SEO a partir dos dados | PASS | PASS |
| Fluxo de Trabalho e Verificação | Validação no build de produção (`preview`), desktop + mobile, sem JS e com movimento reduzido (quickstart) | PASS | PASS |

Nenhuma violação; *Complexity Tracking* não se aplica.

### Justificativa de dependências (Princípio III)

| Dependência | Por quê | Peso no cliente (min / gzip) |
|-------------|---------|------------------------------|
| `vue` | requisito do usuário; componentes e hidratação | 60,0 KB / 24,1 KB |
| `vite-ssg` + `@unhead/vue` | pré-renderização obrigatória pelo Princípio III; metadados a partir dos dados | `@unhead/vue` 16,2 KB / 6,5 KB; vite-ssg só no build |
| `tailwindcss` | requisito do usuário; os componentes Vue Bits já usam classes Tailwind | só o CSS usado (medir no build; orçamento HTML+CSS ≤ 60 KB) |
| `motion-v` + `@vueuse/core` | exigidos pelo `BlurText` (decisão Q3) | 126,7 KB / 41,1 KB — chunk separado, só carregado com `motion` (R6) |
| `beasties` | embute o CSS crítico no HTML no build (peer opcional do vite-ssg); FCP móvel no Lighthouse caiu de 1,9 s para 1,1 s | nenhum (só build; o CSS completo carrega sem bloquear, com fallback `<noscript>`) |
| `vite`, `vue-tsc`, `vitest`, `playwright`, `axe` | build e testes | nenhum |

Medição: esbuild 2026-10-06, `--minify`, gzip -9, `NODE_ENV=production`, Options API e devtools
desligados. Total de JS de terceiros ≈ 72 KB gzip, dentro do orçamento de 150 KB (research R12).

Rejeitadas: GSAP (só serviria a `FadeContent`/`TextType`, substituídos por código próprio),
`vue-router` (página única), Nuxt (convenções demais para uma página).

## Project Structure

### Documentation (this feature)

```text
specs/001-vue-resume-refactor/
├── spec.md
├── plan.md              # este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1 — campos e inventário do resume.ts
├── quickstart.md        # Phase 1 — comandos e cenários de validação
├── contracts/
│   ├── resume.schema.ts # tipos do resume.ts (vão para src/types/resume.ts)
│   └── page-contract.md # garantias do HTML publicado
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
.
├── index.html                    # template do Vite: <head> com preload de fontes e script inline (R6/R7)
├── package.json / package-lock.json
├── vite.config.ts                # base '/Portfolio/', plugin-vue, @tailwindcss/vite, ssgOptions
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vitest.config.ts
├── playwright.config.ts          # webServer: npm run preview
├── .github/workflows/pages.yml   # npm ci → test → build → deploy-pages
├── public/
│   └── fonts/                    # 6 × .woff2 com subset (movidos de fonts/)
├── README.md
├── tools/
│   ├── build-fonts.sh            # OUT passa a ser public/fonts; peso 800 só com o nome (R12)
│   ├── iosevka-800.chars         # letras do subset do peso 800 (conferido por fonts.spec.ts)
│   └── reencode-images.py        # reencoda as imagens decorativas (R12)
├── src/
│   ├── main.ts                   # export const createApp = ViteSSG(App)
│   ├── App.vue                   # composição das seções na ordem do FR-008
│   ├── types/
│   │   └── resume.ts             # = contracts/resume.schema.ts
│   ├── data/
│   │   └── resume.ts             # ÚNICO arquivo de conteúdo (satisfies Resume)
│   ├── lib/
│   │   ├── period.ts             # formatPeriod / formatYears (FR-005)
│   │   ├── sort.ts               # byStartDesc (FR-004)
│   │   └── sections.ts           # visibleSections: seções com conteúdo, na ordem do FR-008
│   ├── composables/
│   │   ├── useMotion.ts          # estado de movimento compartilhado (html.motion), segue a preferência do sistema (FR-020)
│   │   ├── useActiveSection.ts   # IntersectionObserver → seção ativa no menu (FR-009)
│   │   ├── useHeadFromResume.ts  # useHead() com profile.seo (FR-029)
│   │   ├── useBootDone.ts        # efeitos que esperam a tela de boot sair (revelação do hero)
│   │   └── useHashAnchor.ts      # reposiciona /#secao depois do swap de fontes (SC-010)
│   ├── directives/
│   │   └── reveal.ts             # v-reveal: porta do .reveal atual (R6)
│   ├── styles/
│   │   ├── tokens.css            # :root com a paleta atual + @theme inline (R4)
│   │   ├── fonts.css             # @font-face Iosevka / Iosevka Aile
│   │   ├── base.css              # reset, body, scrollbar, seleção, foco, print (FR-027)
│   │   └── main.css              # @import "tailwindcss" + os arquivos acima
│   ├── assets/
│   │   └── img/                  # image{1,2,3}-bg.webp reencodadas (R10, R12)
│   ├── components/
│   │   ├── vendor/
│   │   │   └── vue-bits/         # código copiado via jsrepo, com cabeçalho de origem/licença
│   │   │       ├── SpotlightCard.vue
│   │   │       ├── BlurText.vue
│   │   │       └── LogoLoop.vue
│   │   ├── base/                 # wrappers do projeto sobre o vendor
│   │   │   ├── BaseCard.vue      # SpotlightCard + :focus-within + spotlightColor do token
│   │   │   ├── RevealText.vue    # texto puro no SSR → BlurText no cliente com motion
│   │   │   ├── TechMarquee.vue   # LogoLoop com SkillItem.featured, aria-hidden; parada sem movimento
│   │   │   ├── TagChip.vue
│   │   │   ├── MetricBadge.vue
│   │   │   ├── ExternalLink.vue
│   │   │   └── RichText.vue      # renderiza RichText com hl-green / hl-purple
│   │   ├── terminal/
│   │   │   ├── BootScreen.vue    # client-only; remove html.booting (FR-031)
│   │   │   ├── MatrixRain.vue    # canvas client-only (FR-032)
│   │   │   ├── GlitchTitle.vue   # h1 + CSS do glitch atual
│   │   │   ├── TypedPrompt.vue   # digita/apaga typedPhrases; SSR = frase estática
│   │   │   ├── PromptLogo.vue    # viper@portfolio:~$▊
│   │   │   ├── TerminalWindow.vue# barra + título + controles + slot
│   │   │   ├── TerminalLine.vue  # "$ comando" e saídas
│   │   │   └── Scanlines.vue
│   │   ├── layout/
│   │   │   ├── AppNav.vue        # nav fixa, menu mobile até 840px (Esc fecha), seção ativa
│   │   │   ├── SectionShell.vue  # <section id>, "## nome/", lead "$ ...", decor opcional
│   │   │   └── AppFooter.vue     # ano (atualiza no mount) + crédito da nova stack
│   │   └── sections/
│   │       ├── HeroSection.vue
│   │       ├── AboutSection.vue
│   │       ├── ExperienceSection.vue
│   │       ├── ExperienceCard.vue
│   │       ├── SkillsSection.vue
│   │       ├── SkillGroupCard.vue
│   │       ├── ProjectsSection.vue
│   │       ├── ProjectCard.vue
│   │       ├── EvidenceLink.vue
│   │       ├── EducationSection.vue
│   │       ├── EducationCard.vue
│   │       └── ContactSection.vue
│   └── env.d.ts
└── tests/
    ├── unit/
    │   ├── resume.data.spec.ts   # regras de validação + paridade (data-model)
    │   ├── period.spec.ts
    │   ├── sections.spec.ts      # seções visíveis e ordem (FR-008)
    │   └── fonts.spec.ts         # subset do peso 800 cobre o nome (SC-004)
    ├── component/
    │   ├── RevealText.spec.ts    # SSR com texto puro
    │   ├── ProjectCard.spec.ts   # opcionais ausentes não geram blocos vazios
    │   └── ExperienceCard.spec.ts
    └── e2e/
        ├── no-js.spec.ts         # + JS principal que falha (FR-018)
        ├── reduced-motion.spec.ts # inclui mudar a preferência com a página aberta
        ├── motion.spec.ts        # boot ≤ 5 s do início da navegação, efeitos
        ├── a11y.spec.ts          # axe, foco, leitores de tela, alto contraste
        ├── layout.spec.ts        # 5 larguras + console, zoom, espaçamento de texto, toque
        ├── links.spec.ts         # âncoras + externos + menu
        ├── badges.spec.ts
        └── weight.spec.ts        # orçamento R12
```

Saem da raiz ao final: `css/`, `js/`, `fonts/` (movida), `img/` (movida; os `.png` não usados são
removidos). O `index.html` antigo é substituído pelo template do Vite. `.gitignore` ganha
`node_modules/`, `dist/`, `test-results/`, `playwright-report/`.

**Structure Decision**: projeto único na raiz do repositório, sem separação frontend/backend (não há
backend). `src/` segue a divisão dados → tipos → componentes base/terminal/layout → seções, para que
`src/data/resume.ts` seja o único ponto de edição de conteúdo e o código de terceiros fique isolado em
`components/vendor/`.

## Mapeamento: página estática → Vue

Cada elemento de `index.html`/`js/main.js` e onde ele passa a viver. "Vue Bits" indica o componente
da biblioteca usado; "próprio" indica porte do código atual (motivo em research R5–R7).

| Elemento atual | Origem | Novo componente | Vue Bits | Dados |
|----------------|--------|-----------------|----------|-------|
| `#bootScreen` + `bootSequence()` | html + js §0 | `terminal/BootScreen.vue` | — próprio (R7) | — |
| `.scanlines` | html + css | `terminal/Scanlines.vue` | — próprio | — |
| `.navbar` + toggle mobile | html + js §4 | `layout/AppNav.vue` + `terminal/PromptLogo.vue` | — próprio | seções presentes |
| `#matrixCanvas` + `matrixRain()` | html + js §1 | `terminal/MatrixRain.vue` | — próprio (`LetterGlitch` rejeitado, R7) | — |
| `.hero-grid` | html + css | dentro de `HeroSection.vue` | — | — |
| `.hero-boot` "[ OK ] Inicializando…" | html | `HeroSection.vue` | — | rótulo de UI |
| `h1.glitch` | html + css | `terminal/GlitchTitle.vue` | — próprio (`GlitchText` rejeitado, R7) | `profile.name` |
| `#typedRole` + `typeWriter()` | html + js §2 | `terminal/TypedPrompt.vue` | — próprio (`TextType` exige GSAP) | `profile.typedPhrases` |
| `.hero-sub` (tagline) | html | `base/RevealText.vue` | **`BlurText`** | `profile.tagline` |
| `.hero-actions` (2 botões) | html | `HeroSection.vue` | — | rótulos de UI |
| `.reveal` + `scrollReveal()` | css + js §3 | `directives/reveal.ts` (`v-reveal`) | — próprio (`FadeContent` exige GSAP) | — |
| `#sobre .terminal-window` | html | `AboutSection.vue` + `TerminalWindow.vue` | — | `profile.about`, `profile.attributes` |
| `.section-decor` / `.decor-img` | html + css | slot `decor` do `SectionShell.vue` | — | — |
| `.section-title` + `.section-lead` | html | `layout/SectionShell.vue` | — | rótulos de UI |
| `.timeline` / `.timeline-item` | html + css | `ExperienceSection.vue` (`<ol>`) | — | `experiences` ordenadas |
| `.card` de experiência | html | `ExperienceCard.vue` dentro de `BaseCard` | **`SpotlightCard`** | `Experience` |
| `.tag-now` (`HEAD`/`EM CURSO`) | html + css | `ExperienceCard`/`EducationCard` | — | `end` ausente / `status` |
| `.skill-card` | html | `SkillGroupCard.vue` dentro de `BaseCard` | **`SpotlightCard`** | `SkillGroup` |
| *(novo)* faixa de tecnologias | — | `base/TechMarquee.vue` em `SkillsSection` | **`LogoLoop`** | `SkillItem.featured` |
| `.chip` | html + css | `base/TagChip.vue` | — | `tech`, `items`, `stack` |
| `#projetos .terminal-window` | html | `ProjectCard.vue` = `BaseCard` + `TerminalWindow` | **`SpotlightCard`** | `Project` |
| `.t-badges` / `.t-theme` | html | `EvidenceLink.vue` + `ExternalLink.vue` | — | `Evidence` (+ `badge`, `accent`) |
| `.edu-item.card` | html | `EducationCard.vue` dentro de `BaseCard` | **`SpotlightCard`** | `Education` |
| `#contactList` + `renderExtraLinks()` | html + js §5 | `ContactSection.vue` | — | `contacts` |
| `.footer` + `footerYear()` | html + js §6 | `layout/AppFooter.vue` | — | crédito da nova stack (FR-033) |
| `<title>`, `meta description` | head | `useHeadFromResume.ts` | — | `profile.seo` |
| `<link rel=preload>` fontes, favicon `>_` | head | `index.html` (template) | — | — |
| `:root` tokens | css | `styles/tokens.css` | — | — |
| estilos de seção/efeito | css (959 linhas) | utilitários nos templates + `<style scoped>` (R5) | — | — |
| *(novo)* métricas de impacto | — | `base/MetricBadge.vue` | — | `highlights` (vazio hoje) |

## Ordem de construção

Cada etapa depende só das anteriores e termina com algo verificável. A ordem segue as prioridades da
spec: P1 (etapas 0–7) já é publicável; P2 e P3 vêm depois.

0. **Pré-requisitos fora do código** — capturar o baseline visual (quickstart); trocar a fonte do
   GitHub Pages para "GitHub Actions" antes de qualquer merge na `main` (R9).
1. **Scaffold e ferramentas** — `package.json` com scripts, Vite 8 + plugin-vue, TypeScript ~6.0,
   `vue-tsc`, `index.html` template, `main.ts` com `ViteSSG` single page, `base: '/Portfolio/'`,
   `.gitignore`. *Verifica*: `npm run build` gera `dist/index.html` com um "olá" pré-renderizado.
2. **Estilo base** — Tailwind 4 via `@tailwindcss/vite`; `tokens.css` (paleta atual + `@theme
   inline`), `fonts.css` com as fontes movidas para `public/fonts/` (e `tools/build-fonts.sh`
   ajustado), `base.css` (reset, foco, print). *Verifica*: `bg-bg text-text font-mono` renderiza
   com as cores e a Iosevka.
3. **Contrato de dados** — `src/types/resume.ts` (do contrato), `src/data/resume.ts` com o
   inventário completo, `lib/period.ts`, `lib/sort.ts`; Vitest com `resume.data.spec.ts` e
   `period.spec.ts`. *Verifica*: V2.1 (remover um campo quebra o build) e testes verdes.
4. **Script inline e composables** — script de `<head>` (`js`, `motion`, `booting` + teto de 4,8 s),
   `useMotion`, `directives/reveal.ts`, `useHeadFromResume`. *Verifica*: classes corretas com e sem
   `reducedMotion`.
5. **Componentes Vue Bits (vendor)** — instalar `SpotlightCard`, `BlurText`, `LogoLoop` via jsrepo
   em `components/vendor/vue-bits/` + `motion-v` e `@vueuse/core`; cabeçalho de origem/licença.
   *Verifica*: `vue-tsc` limpo com os três arquivos.
6. **Componentes base e de terminal** — `TagChip`, `ExternalLink`, `RichText`, `MetricBadge`,
   `TerminalWindow`, `TerminalLine`, `PromptLogo`, `Scanlines`, `GlitchTitle`, `TypedPrompt`,
   `BaseCard` (sobre `SpotlightCard`, raio 8px, `:focus-within`), `RevealText` (sobre `BlurText`,
   R6). Testes de componente do `RevealText`. *Verifica*: SSR do `RevealText` com texto puro.
7. **Layout e seções P1 (US1)** — `SectionShell`, `AppNav`, `AppFooter`, `HeroSection`,
   `AboutSection`, `ExperienceSection` + `ExperienceCard`, `SkillsSection` + `SkillGroupCard`,
   `EducationSection` + `EducationCard`, `ContactSection`, `App.vue`.
   *Verifica*: V1 parcial, V4, V8, V9 (âncoras) — **MVP publicável** (tudo menos projetos).
8. **Seções P2 (US2, US3)** — `ProjectsSection` + `ProjectCard` + `EvidenceLink`; visibilidade de
   seções derivada dos dados (`lib/sections.ts`). Testes de componente do `ProjectCard` e do
   `ExperienceCard`. *Verifica*: V1 completo, V2, V10.
9. **Efeitos P3 (US4)** — `TechMarquee` (sobre `LogoLoop`), `BootScreen`, `MatrixRain`, `v-reveal`
   aplicado às seções, `motion-v` em chunk carregado só com `motion`. *Verifica*: V5, V6.
10. **Paridade visual e limpeza** — portar o CSS restante para utilitários/`<style scoped>`,
    comparar com o baseline (V3), reencodar as imagens decorativas (R12), remover `css/`, `js/`,
    `fonts/`, `img/` da raiz.
11. **Testes e2e e publicação** — suíte Playwright + axe completa, `weight.spec.ts`, workflow
    `.github/workflows/pages.yml`. *Verifica*: V7, V11, V12; todos os cenários do quickstart.

## Pendências de conteúdo (autor)

Bloqueiam a criação de `src/data/resume.ts` (tarefas T017 → T018), porque o tipo `Project` as exige
(Princípio II):

- `stack` e `role` de ItaliaMi, Monitor de Curso e Temas VS Code.
- `noEvidenceReason` (ou um link público) para ItaliaMi.
- Confirmar a lista `featured` da faixa de tecnologias (sugestão no data-model).
- Opcional: métricas de impacto (`highlights`) que o currículo sustente.

## Complexity Tracking

Sem violações da constituição a justificar.
