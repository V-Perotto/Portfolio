# Implementation Plan: Projetos ampliados, terminais animados e ícones nas skills

**Branch**: `001-vue-resume-refactor` (a 002 parte do estado da 001, ainda fora da `main`) |
**Date**: 2026-10-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-projects-animated-terminals/spec.md`

## Summary

Nove pedidos do autor numa feature só. Conteúdo: o SRG (em desenvolvimento), o OCR de prontuários e
o QClass-BOT (ligados à Quadritech) entram como projetos; o ItaliaMi ganha três links; todos esses
são repositórios privados e levam um aviso de "privado" antes do clique, sob a nova exceção do
Princípio II (constituição v2.2.0). A seção de projetos passa a ter um projeto por linha e duas
sub-partes, challenges (7 repositórios públicos, do mais recente para o mais antigo) e projeto
comunitário (gincana junina da PUC-PR). A educação ganha o 1º Empregotech, com observação sobre a
Prime Control e duas fontes. Apresentação: as janelas de terminal digitam os comandos e só então
mostram a saída quando entram na tela (composable `useTerminalTyping`, puramente aditivo: sem JS,
com movimento reduzido ou impresso, tudo aparece pronto), e os grupos de skills trocam os
caracteres soltos por ícones `@lucide/vue` renderizados no HTML pré-renderizado.

## Technical Context

**Language/Version**: TypeScript ~6.0.3, Vue 3.5, Node ≥ 22 no build (inalterado)

**Primary Dependencies**: as da 001 + `@lucide/vue` 1.53 (nova, research R1)

**Storage**: N/A, conteúdo em `src/data/resume.ts`

**Testing**: `vue-tsc`; Vitest 5 + `@vue/test-utils` + `happy-dom` (dados, ordenação, ritmo da
digitação, componentes); Playwright 1.63 + `@axe-core/playwright` (e2e sobre o build)

**Target Platform**: navegadores evergreen, desktop e mobile; GitHub Pages em `/Portfolio/`

**Project Type**: site estático pré-renderizado (SPA hidratada de página única)

**Performance Goals**: animação de cada janela ≤ 2,5 s (orçamento de 2,2 s, R5); 0 de deslocamento
de layout causado pelas janelas; HTML + CSS + JS inicial ≤ 84,8 KB gzip (+15 KB sobre a linha de
base de 69,8 KB, R12)

**Constraints**: conteúdo completo sem JS; nada escondido por mais de 5 s; `prefers-reduced-motion`
desliga a digitação; console sem erros nem avisos; sem rolagem horizontal a partir de 320px

**Scale/Scope**: 6 projetos, 7 challenges, 1 projeto comunitário, 4 formações, 3 tipos de janela
animada (Sobre, 6 cartões de projeto, Contato); ~6 componentes alterados e 4 novos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constituição v2.2.0 (emendada em 2026-10-08 como pré-requisito desta feature).

| Princípio | Verificação | Pré-pesquisa | Pós-design |
|-----------|-------------|--------------|------------|
| I. Fidelidade ao Currículo | Itens novos vêm do autor e dos próprios repositórios/notícias (research R9–R11); nada inventado; cliente do SRG omitido; inventário testado no Vitest | PASS com justificativa (ver Complexity Tracking) | PASS com justificativa |
| II. Projetos Demonstráveis | Todo projeto com nome, propósito, papel e stack (comunitário dispensa stack, v2.2.0); privados com link e aviso antes do clique (FR-005/006); Monitor segue na exceção acadêmica; links com `noopener noreferrer` via `ExternalLink`; lista principal por relevância | PASS | PASS — ordem por data só dentro dos challenges (Complexity Tracking) |
| III. Saída Estática | Conteúdo e ícones no HTML pré-renderizado (SSR do Lucide verificado, R1); a digitação só existe depois de montar (R3); `@lucide/vue` justificado abaixo; nenhum recurso de terceiros em tempo de execução | PASS | PASS |
| IV. Acessibilidade e Desempenho | Digitação respeita `html.motion` e muda ao vivo; pulável por clique/toque/foco; ≤ 2,5 s por janela; texto real sempre na árvore de acessibilidade; ícones `aria-hidden`; sem deslocamento de layout; axe no e2e | PASS | PASS |
| V. Identidade Visual Coerente | Reusa `TerminalWindow`, `BaseCard`, `TagChip`, `tag-now`, `ExternalLink`; sub-partes seguem The Directory Listing Rule (`### challenges/` + `$ ls -lt …`); cores dos tokens; pt-BR | PASS | PASS |
| Restrições de Conteúdo e Tecnologia | Nenhum dado pessoal novo; PDF continua fora do git | PASS | PASS |
| Fluxo de Trabalho e Verificação | quickstart cobre build de produção, desktop + mobile, sem JS, movimento reduzido e impressão | PASS | PASS |

### Justificativa de dependências (Princípio III)

| Dependência | Por quê | Peso no cliente (min / gzip) |
|-------------|---------|------------------------------|
| `@lucide/vue` 1.53 | pedido do autor (item 5); pacote oficial do Lucide para Vue (R1); SVG inline com SSR, `aria-hidden` e `currentColor` por padrão | 6 ícones: 5,4 KB / 2,3 KB, tree-shaken |

Rejeitadas: `lucide-vue-next` (descontinuado), `lucide-static` (exige `v-html`/sprite), cópia manual
dos SVGs (sai de sincronia com a biblioteca pedida). Nenhuma biblioteca de animação nova: a digitação
usa `setTimeout` e `IntersectionObserver` (R3–R5).

## Project Structure

### Documentation (this feature)

```text
specs/002-projects-animated-terminals/
├── plan.md              # este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1: entidades, inventário de conteúdo, validação
├── quickstart.md        # Phase 1: cenários V1–V16
├── contracts/
│   ├── resume.schema.ts # novo src/types/resume.ts
│   └── page-contract.md # o que o HTML publicado garante (revisão da 001)
├── checklists/
│   └── requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── types/resume.ts                       # ← contracts/resume.schema.ts
├── data/resume.ts                        # inventário do data-model
├── lib/
│   ├── icons.ts                          # NOVO: SkillIconName → componente Lucide
│   ├── sort.ts                           # byStartYearDesc desempata por endYear; NOVO byCreatedDesc
│   └── typing.ts                         # NOVO: ritmo da digitação (função pura, R5)
├── composables/
│   └── useTerminalTyping.ts              # NOVO: estados, observer, pulo, movimento (R3, R4)
├── styles/base.css                       # estados data-t-state sob html.motion; impressão
├── components/
│   ├── terminal/
│   │   ├── TerminalWindow.vue            # chama useTerminalTyping; prop `animate` (padrão true)
│   │   └── TerminalLine.vue              # data-t-cmd + sobreposição .t-typed aria-hidden
│   └── sections/
│       ├── ProjectsSection.vue           # 1 coluna; sub-partes challenges e comunitário
│       ├── ProjectCard.vue               # selo, contexto, aviso de privados, 2 colunas ≥ 900px
│       ├── EvidenceLink.vue              # variante privada: cadeado + "privado"
│       ├── ProjectSubpart.vue            # NOVO: ### titulo/ + $ lead + slot
│       ├── ChallengeCard.vue             # NOVO
│       ├── CommunityCard.vue             # NOVO
│       ├── SkillGroupCard.vue            # ícone Lucide
│       └── EducationCard.vue             # observação e fontes
└── App.vue                               # passa challenges e community

tests/
├── unit/
│   ├── resume.data.spec.ts               # regras novas + inventário
│   ├── sort.spec.ts                      # NOVO
│   └── typing.spec.ts                    # NOVO
├── component/
│   ├── ProjectCard.spec.ts               # privados, selo, contexto
│   ├── EducationCard.spec.ts             # NOVO
│   └── ProjectsSection.spec.ts           # NOVO: sub-partes e ordem dos challenges
└── e2e/
    ├── projects.spec.ts                  # NOVO: V1–V7
    ├── terminals.spec.ts                 # NOVO: V8, V9, V11, V12
    ├── no-js.spec.ts / reduced-motion.spec.ts   # + V10
    └── a11y.spec.ts                      # + V13 (ícones), axe já cobre o resto

DESIGN.md                                  # layout de projetos, sub-partes, ícones, link privado
```

**Structure Decision**: mesma estrutura da 001 (site de página única em `src/`, testes em três
níveis). Nenhum diretório novo; 7 arquivos novos em pastas existentes.

## Fases de implementação (resumo para o /speckit-tasks)

1. **Base**: dependência `@lucide/vue`; contrato de tipos; `sort.ts`, `typing.ts`, `icons.ts` com
   testes.
2. **Conteúdo e projetos** (US1–US7): dados; `ProjectsSection` em uma coluna; `ProjectCard` +
   `EvidenceLink` (privados, selo, contexto); sub-partes; `EducationCard`.
3. **Ícones** (US9): `SkillGroupCard`.
4. **Terminais animados** (US8): `TerminalLine`, `useTerminalTyping`, `TerminalWindow`, CSS.
5. **Polimento**: e2e, peso, `DESIGN.md`, validação do quickstart, lembrete do PDF.

## Complexity Tracking

| Violação | Por que é necessária | Alternativa mais simples rejeitada porque |
|----------|----------------------|-------------------------------------------|
| Princípio I: itens novos (SRG, OCR, QClass, challenges, comunitário, Empregotech) não estão no PDF do currículo de 2026-04-21 | O autor é a fonte e pediu os itens; mesmo tratamento dado aos Temas VS Code em 2026-10-07 (site correto, PDF a atualizar). Cada fato tem origem verificável (repositórios, notícias) | Esperar o PDF novo atrasaria a feature sem ganho: o PDF é atualizado pelo autor, fora do repositório |
| Princípio II, "ordenados por relevância, não por data": os challenges aparecem por data de criação | Pedido explícito do autor (item 6). A sub-parte inteira está posicionada por relevância (depois da lista principal); só a ordem interna é por data, que para desafios de processos seletivos é a leitura útil (evolução) | Ordenar os challenges por relevância contraria o pedido e exigiria um julgamento de relevância entre 7 desafios equivalentes |
