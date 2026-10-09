# Implementation Plan: Limpeza visual, links destacados, ícones devicon e skills em loops

**Branch**: `001-vue-resume-refactor` (a 003 parte do estado da 002, ainda sem commit) |
**Date**: 2026-10-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-devicons-skill-loops/spec.md`

## Summary

Sete pedidos do autor, todos de apresentação; nenhum dado do currículo muda. Saem as três imagens de
fundo e a faixa contínua das skills. Os comandos das janelas perdem o `./run` e passam ao lilás
apagado da nota de privados; os títulos das janelas perdem o `bash —` e mostram o nome do projeto. Os
rótulos dos links de projeto passam ao roxo do `>`, e todo link de conteúdo fica com o sublinhado
tracejado parado, com o brilho no hover (um estilo só, no `ExternalLink`). Todo chip de tecnologia
ganha um ícone à esquerda, na cor do texto: devicon, senão vectorlogo.zone, senão Lucide pelo
assunto, todos num sprite SVG gerado por script, versionado e publicado como arquivo do próprio site
(`<use href>`), com o registro nome → ícone checado em tempo de compilação. A seção de skills vira 5
sub-partes, cada uma com um loop próprio no visual do Text Loop do Vue Bits (fita, separador `✦`,
forma "linha"), animado por CSS, que pausa no hover e fora da tela, e que sem movimento, sem JS ou
impresso vira a lista parada e completa.

## Technical Context

**Language/Version**: TypeScript ~6.0.3, Vue 3.5, Node ≥ 22 no build (inalterado)

**Primary Dependencies**: as da 002 (inclui `@lucide/vue` 1.53); nenhuma dependência nova de
cliente. Ferramenta: `svgo@4.1.0` via `npx` só no script de geração do sprite (fora do
`package.json`, research R2)

**Storage**: N/A, conteúdo em `src/data/resume.ts`; sprite gerado em `src/assets/tech-icons/`

**Testing**: `vue-tsc`; Vitest 5 + `@vue/test-utils` + `happy-dom` (dados, registro × sprite,
componentes); Playwright 1.63 + `@axe-core/playwright` (e2e sobre o build)

**Target Platform**: navegadores evergreen, desktop e mobile; GitHub Pages em `/Portfolio/`

**Project Type**: site estático pré-renderizado (SPA hidratada de página única)

**Performance Goals**: loops a 40 px/s animados no compositor (CSS), parados fora da tela; 0 de
deslocamento de layout dos loops; HTML + CSS + JS inicial ≤ 95,3 KB gzip (linha de base 80,3 KB +
15 KB, R11); sprite ~8–10 KB gzip à parte

**Constraints**: conteúdo e ícones completos sem JS; `prefers-reduced-motion` para os loops; nenhuma
requisição a terceiros; console sem erros nem avisos; sem rolagem horizontal a partir de 320px;
contraste ≥ 4,5:1

**Scale/Scope**: 54 nomes de tecnologia, 50 símbolos no sprite, ~94 ícones na página, 5 loops,
8 janelas, ~10 componentes alterados, 3 novos (`SkillLoop`, `TechIcon`, `SectionSubpart` renomeado)
e 4 removidos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constituição v2.2.0.

| Princípio | Verificação | Pré-pesquisa | Pós-design |
|-----------|-------------|--------------|------------|
| I. Fidelidade ao Currículo | Nenhum dado factual muda; as 28 skills e as stacks continuam (inventário no Vitest); comandos e títulos são metáfora | PASS | PASS |
| II. Projetos Demonstráveis | Links mais visíveis (sublinhado parado); aviso de privado intacto antes do clique; `ExternalLink` continua com `target`/`rel` | PASS | PASS |
| III. Saída Estática | Ícones num arquivo publicado do próprio site, visíveis sem JS (`<use>` estático, R2); loops só acrescentam movimento (lista completa no HTML); nenhuma dependência nova de cliente; sprite gerado por `tools/` e versionado, como as fontes | PASS | PASS |
| IV. Acessibilidade e Desempenho | Loops respeitam `html.motion` (inclusive ao vivo), param fora da tela, lista acessível única, cópias `aria-hidden`; ícones `aria-hidden`; sublinhado diferencia link por forma; −181 KB de imagens; axe no e2e | PASS com ressalva (sem botão de pausa, ver Complexity Tracking) | PASS com ressalva |
| V. Identidade Visual Coerente | Sub-partes reutilizam o cabeçalho das sub-partes de projetos (`SectionSubpart`); estilo de link num lugar só; cores novas (fita, ícone) em tokens; metáfora mantida (janelas, `$`, `###`) | PASS | PASS |
| Restrições de Conteúdo e Tecnologia | Nenhum dado pessoal novo | PASS | PASS |
| Fluxo de Trabalho e Verificação | quickstart cobre build de produção, desktop + mobile, sem JS, movimento reduzido, impressão e alto contraste | PASS | PASS |

### Justificativa de dependências (Princípio III)

| Item | Por quê | Peso no cliente |
|------|---------|-----------------|
| Sprite `src/assets/tech-icons/sprite.svg` (asset gerado, não dependência) | pedido do autor (item 5); 50 símbolos de devicon v2.17.0 (MIT), vectorlogo.zone (SAP) e Lucide (ISC), otimizados com `svgo -p 0` | ~19 KB bruto / ~8–10 KB gzip, arquivo à parte e cacheável |
| `svgo@4.1.0` (via `npx`, só no script) | reduzir os SVGs do devicon de 36 KB para 7,7 KB gzip (R2) | 0 (não vai ao cliente nem ao `package.json`) |

Removidos: `LogoLoop.vue` (Vue Bits vendorizado), `TechMarquee.vue`, `SkillGroupCard.vue`, as três
imagens webp (181 KB) e `tools/reencode-images.py`.

## Project Structure

### Documentation (this feature)

```text
specs/003-devicons-skill-loops/
├── plan.md              # este arquivo
├── research.md          # Phase 0: R1–R12
├── data-model.md        # Phase 1: TechName, registro de ícones, inventário, validação
├── quickstart.md        # Phase 1: cenários V1–V15
├── contracts/
│   ├── resume.schema.ts # novo src/types/resume.ts
│   └── page-contract.md # o que o HTML publicado garante (revisão da 002)
├── checklists/
│   └── requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
tools/
├── build-tech-icons.mjs                  # NOVO: baixa, otimiza, recolore e gera sprite + NOTICE (R2)
└── reencode-images.py                    # REMOVIDO (só servia às imagens de fundo)

src/
├── assets/
│   ├── img/                              # REMOVIDO (3 webp)
│   └── tech-icons/
│       ├── sprite.svg                    # NOVO, gerado e versionado (50 <symbol>)
│       └── NOTICE.md                     # NOVO: origem e licença de cada fonte
├── types/resume.ts                       # ← contracts/resume.schema.ts (TechName, TechIconId)
├── data/resume.ts                        # comandos sem ./run; sem `featured`; guia de edição
├── lib/tech-icons.ts                     # NOVO: TECH_ICONS: Record<TechName, TechIconId>
├── styles/
│   ├── tokens.css                        # --ribbon-bg, --ribbon-edge, --icon-tech, --glow-link
│   └── base.css                          # sem .section-decor/.marquee-chip; loops no alto contraste e na impressão
├── components/
│   ├── base/
│   │   ├── ExternalLink.vue              # estilo único de link de conteúdo (R6)
│   │   ├── TagChip.vue                   # prop `tech: TechName`, ícone à esquerda
│   │   ├── TechIcon.vue                  # NOVO: <svg><use href="sprite#id"></svg>
│   │   ├── SkillLoop.vue                 # NOVO: fita + trilha CSS + cópias + observers (R4)
│   │   └── TechMarquee.vue               # REMOVIDO
│   ├── layout/
│   │   ├── SectionShell.vue              # sem a prop `decor`
│   │   └── SectionSubpart.vue            # ← sections/ProjectSubpart.vue, lead opcional, slot icon (R9)
│   ├── terminal/TerminalLine.vue         # comando em --text-dim (R7)
│   ├── vendor/vue-bits/LogoLoop.vue      # REMOVIDO
│   └── sections/
│       ├── AboutSection.vue              # sem decor; título sobre.txt
│       ├── ContactSection.vue            # título contato.sh; sem estilo de link próprio
│       ├── ProjectsSection.vue           # sem decor; SectionSubpart
│       ├── ProjectCard.vue               # título = project.name; TagChip :tech
│       ├── EvidenceLink.vue              # rótulo roxo; sublinhado no caminho/badge; sem translateY
│       ├── ExperienceCard.vue            # TagChip :tech
│       ├── ChallengeCard.vue             # TagChip :tech; sem estilo de link próprio
│       ├── CommunityCard.vue / EducationCard.vue   # sem estilo de link próprio
│       ├── SkillsSection.vue             # 5 SectionSubpart + SkillLoop; sem decor nem faixa
│       └── SkillGroupCard.vue            # REMOVIDO
└── ...

tests/
├── unit/
│   ├── tech-icons.spec.ts                # NOVO: registro × sprite, símbolos sem cor fixa
│   └── resume.data.spec.ts               # sem ./run; 28 skills; sem featured
├── component/
│   ├── TagChip.spec.ts                   # NOVO: ícone antes do nome, aria-hidden
│   ├── SkillLoop.spec.ts                 # NOVO: lista única no SSR, cópias aria-hidden
│   └── ProjectCard.spec.ts               # título, comando, rótulo
└── e2e/
    ├── visual-cleanup.spec.ts            # NOVO: V1–V5 (fundo, comandos, títulos, rótulos, links)
    ├── tech-icons.spec.ts                # NOVO: V6, V15
    ├── skills.spec.ts                    # NOVO: V7–V9, V11, V12
    ├── reduced-motion.spec.ts / no-js.spec.ts   # V10 (troca .marquee-static pelos loops)
    └── a11y.spec.ts                      # V13; teste de alto contraste sem .section-decor

DESIGN.md, README.md                       # fundo, links, chips, loops, títulos, comandos, tools/
```

**Structure Decision**: mesma estrutura da 001/002 (site de página única em `src/`, testes em três
níveis). Uma pasta nova de asset gerado (`src/assets/tech-icons/`), um script novo em `tools/`.

## Fases de implementação (resumo para o /speckit-tasks)

1. **Setup**: linha de base de peso; script `tools/build-tech-icons.mjs` e sprite + NOTICE gerados e
   conferidos numa grade visual.
2. **Base**: contrato de tipos (`TechName`, `TechIconId`), dados (sem `featured`, sem `./run`),
   `tech-icons.ts`, `TechIcon`, tokens; testes de registro × sprite.
3. **US1 + US5 (P1/P2, skills)**: `SectionSubpart`, `SkillLoop`, `SkillsSection`; remover
   `TechMarquee`, `LogoLoop`, `SkillGroupCard`.
4. **US2 (P1, links)**: `ExternalLink` com o estilo único; `EvidenceLink`; limpar os estilos
   duplicados.
5. **US3 (P2, fundo)**: `SectionShell` sem `decor`; seções; imagens e script removidos; CSS de alto
   contraste e impressão.
6. **US4 (P2, chips)**: `TagChip` com ícone; usos em experiências, projetos e challenges.
7. **US6 + US7 (P3, janelas)**: cor do comando, `./run`, títulos.
8. **Polimento**: e2e, peso, `DESIGN.md`/README, inspeção manual do quickstart.

## Complexity Tracking

| Violação | Por que é necessária | Alternativa mais simples rejeitada porque |
|----------|----------------------|-------------------------------------------|
| Princípio IV / WCAG 2.2.2: os 5 loops se movem sozinhos por mais de 5 s sem um botão de pausa na página | O autor pediu os loops (item 7) e, na 001, retirou o controle global de movimento (FR-035 da 001), aceitando a falta de pausa como limitação. Mitigações: pausa no hover, parada fora da tela, parada total com "reduzir movimento" (inclusive ao vivo), conteúdo completo na lista acessível e na impressão | Um botão de pausa por loop contraria a decisão do autor na 001; loops que param sozinhos depois de 5 s descaracterizam o pedido |
