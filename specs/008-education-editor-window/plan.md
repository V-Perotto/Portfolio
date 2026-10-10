# Implementation Plan: Educação numa janela de editor, como Challenges e Comunitário

**Branch**: `001-vue-resume-refactor` (a 008 parte do estado da 007; nenhum branch novo) |
**Date**: 2026-10-10 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/008-education-editor-window/spec.md`

## Summary

Um pedido do autor: a seção Educação passa a ser uma janela de editor igual às de Challenges e
Comunitário (006). `EducationSection` monta o `EditorWindow` de hoje com a pasta `~/formacao` (Q2), uma
formação por arquivo `AAAA_<id>.yml` (clarify), e põe os cartões de hoje no slot da janela maximizada (que
também é o que aparece sem JavaScript e na impressão). Os arquivos YAML saem de uma função pura nova,
`educationFolder`, ao lado das outras em `src/lib/editor-files.ts`: `curso`, `instituicao`, `local`,
`periodo`, `em_curso: true  # EM CURSO` só na em curso, `observacao` e a lista `fontes` com links
(clarify). `Education` ganha um `id` (o slug do arquivo). A janela vira a 10ª opção do `open` (Q1):
`open educacao` maximiza, e a linha do `help` sobre as janelas maximizadas passa a ser gerada dos alvos.
Versão `2.7.0`. No analyze, a medida da árvore no celular mostrou que ela corta no meio da letra os
nomes que não cabem (já hoje nos Challenges); o autor decidiu reticências nas 4 janelas (FR-020, R13),
uma regra de CSS da árvore no `EditorFrame`.

Nenhuma dependência nova; nenhum componente novo; `EditorWindow`, `DesktopWindow`, `BranchedMenu` e
`lib/windows.ts` não mudam, e o `EditorFrame` só ganha a regra das reticências.

## Technical Context

**Language/Version**: TypeScript ~6.0.3, Vue 3.5, Node ≥ 22 no build

**Primary Dependencies**: as da 007 (`vue`, `@unhead/vue` 2, `@vueuse/core`, `motion-v`, `@lucide/vue`;
`vite-ssg`, `vite` 8.3.4, Tailwind 4). **Nenhuma dependência nova.**

**Storage**: N/A (dados estáticos em `src/data/resume.ts`).

**Testing**: `vue-tsc`; Vitest 5 + `@vue/test-utils` + `happy-dom` (`editor-files`, `resume.data`,
`sections`, `terminal`, `sort`, `EducationCard`, `version`); Playwright 1.64 + `@axe-core/playwright` sobre
o build (research R11).

**Target Platform**: navegadores evergreen, desktop e celular; GitHub Pages em `/Portfolio/`.

**Project Type**: site estático pré-renderizado (SPA hidratada de página única).

**Performance Goals**:

- Janela: as mesmas metas da 006 (maximizar/restaurar ≤ 400 ms; trocar de arquivo sem mudar a altura).
- `open educacao`: janela maximizada em ≤ 1 s (SC-006, como o 007 SC-001).
- HTML + CSS + JS iniciais ≤ 109.532 B + 2 KB gzip (R9; estimado +0,6–0,9 KB).

**Constraints**:

- Sem JS e na impressão: os 4 cartões, cada texto uma vez (006 FR-012).
- Árvore operável por teclado e leitor de tela; maximizada como diálogo modal (006 FR-017); 0 violações axe.
- Sem rolagem horizontal a partir de 320 px; console sem erros do site; nenhum pedido novo a terceiros.
- Fatos do arquivo = fatos do cartão (Princípio I), verificado por unidade e por e2e.

**Scale/Scope**:

- Alterados: `src/types/resume.ts` (`Education.id`), `src/data/resume.ts` (4 ids), `src/lib/editor-files.ts`
  (`educationFolder`), `src/lib/sections.ts` (alvo `educacao`), `src/lib/terminal.ts` (linha do `help`
  gerada), `src/components/sections/EducationSection.vue`, `src/components/terminal/EditorFrame.vue` (só
  o CSS das reticências na árvore, R13), `package.json`/lockfile (2.7.0).
- Testes: ~6 de unidade/componente e ~8 e2e ajustados; nenhum arquivo de teste novo.
- `DESIGN.md`, `README.md`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constituição **v3.0.0**. Nenhuma emenda necessária.

| Princípio | Verificação | Pré-pesquisa | Pós-design |
|-----------|-------------|--------------|------------|
| I. Fidelidade ao Currículo | O arquivo traz só os fatos do cartão (curso, instituição, local, período no formato único, selo de em curso só na em andamento, observação, fontes); o `id` novo é técnico (nome do arquivo) e não muda nenhum dado; verificado por unidade e e2e (R4, R11) | PASS | PASS |
| II. Projetos Demonstráveis | Não se aplica a formação; as fontes continuam links `_blank` + `noopener noreferrer` (`ExternalLink`) | PASS | PASS |
| III. Saída Estática | Tudo pré-renderizado; sem JS, os cartões; nada de terceiros; nenhuma dependência nova; +~0,8 KB gzip (R9) | PASS | PASS |
| IV. Acessibilidade e Desempenho | Reaproveita a janela da 006 (árvore com nomes e `aria-current`, diálogo modal, região focável, transições ≤ 400 ms e nenhuma com movimento reduzido); cartões sem `v-reveal` dentro da janela (R6); axe nos três estados | PASS com ressalva herdada (Complexity Tracking) | PASS com ressalva herdada |
| V. Identidade Visual Coerente | Nenhum componente, classe ou cor nova; a janela, as cores de sintaxe e os cartões já existem; as reticências seguem o explorer do VS Code, a referência da metáfora (R13) | PASS | PASS |
| Restrições de Conteúdo e Tecnologia | Nenhum dado pessoal novo; SEO inalterado | PASS | PASS |
| Fluxo de Trabalho e Verificação | Quickstart V1–V14: build de produção, desktop e celular, sem JS, impressão, movimento reduzido, console e axe | PASS | PASS |

### Justificativa de dependências e recursos (Princípio III)

| Item | Por quê | Peso no cliente |
|------|---------|-----------------|
| Janela de editor da Educação (HTML pré-renderizado: moldura, árvore, 1º arquivo) | o pedido (R1) | ~0,6 KB gzip |
| `educationFolder` + alvo `educacao` + `help` gerado | R4, R7, R8 | ~0,2 KB gzip |
| Reticências nos nomes da árvore (CSS) | FR-020, R13 | < 0,1 KB gzip |
| Versão `2.7.0` | 005 FR-016 | — |

## Project Structure

### Documentation (this feature)

```text
specs/008-education-editor-window/
├── plan.md                      # este arquivo
├── research.md                  # Phase 0: R1–R13
├── data-model.md                # Phase 1: Education.id, pasta, linhas do arquivo, alvo do open
├── quickstart.md                # Phase 1: cenários V1–V14
├── contracts/
│   └── education-window.md      # DOM, conteúdo dos arquivos, open educacao, help, Tab
├── checklists/
│   └── requirements.md
└── tasks.md                     # /speckit-tasks
```

### Source Code (repository root)

```text
package.json, package-lock.json             # version 2.7.0 (R10)

src/
├── types/resume.ts                         # Education.id (R3)
├── data/resume.ts                          # ids: ciberseguranca, sistemas-de-informacao, empregotech, tecnico-ads
├── lib/
│   ├── editor-files.ts                     # educationFolder (R2, R4, R5)
│   ├── sections.ts                         # openTargets: educacao → ~/formacao (R7)
│   └── terminal.ts                         # linha do help gerada dos alvos maximizados (R8)
└── components/
    ├── sections/EducationSection.vue       # EditorWindow window-id="educacao"; cartões no slot #cards (R1, R6)
    └── terminal/EditorFrame.vue            # reticências nos nomes da árvore que não cabem (R13)

tests/
├── unit/        editor-files, resume.data, sections, terminal, sort, version (ajustes)
├── component/   EducationCard (ajuste), AccessGate (v2.7)
└── e2e/         editor-windows, open-command, projects, a11y, no-js, reduced-motion, weight, session (ajustes)

DESIGN.md, README.md                        # quatro janelas de editor; open educacao (R12)
```

**Structure Decision**: a mesma das features anteriores. Os dados dos arquivos são funções puras em
`src/lib/`; a seção só compõe componentes existentes.

## Fases de implementação (resumo para o /speckit-tasks)

1. **Setup**: linha de base de peso (109.532 B, teto +2 KB); versão 2.7.0.
2. **Base**: `Education.id` (tipo, dados, validação, helpers de teste); `educationFolder` + testes de
   unidade. Bloqueia as duas histórias.
3. **US1 (P1, janela)**: `EducationSection` com o `EditorWindow`; reticências na árvore (R13); e2e da
   janela (estrutura, fatos, maximizar com tempo e cobertura, celular com os nomes da árvore, sem JS,
   impressão, a11y nos três estados com o console, movimento reduzido); ajuste do teste do 1º Empregotech.
4. **US2 (P2, `open`)**: alvo `educacao`; `help` gerado; testes de unidade e e2e do `open`.
5. **Polimento**: peso, movimento reduzido, console, `DESIGN.md`/README, quickstart, suítes completas.

## Complexity Tracking

Nenhuma violação nova. Fica a ressalva herdada da 006:

| Violação | Por que é necessária | Alternativa mais simples rejeitada porque |
|----------|----------------------|-------------------------------------------|
| Princípio IV / WCAG 2.2.2: o Letter Glitch troca letras sozinho por mais de 5 s sem botão de pausa (herdado da 006, sem mudança) | Pedido do autor na 006; mitigações mantidas (some com "reduzir movimento", para fora da tela e com a aba oculta, decorativo). Esta feature não mexe no hero | Um botão de pausa contraria a decisão do autor na 001 |
