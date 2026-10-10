---

description: "Task list for 008-education-editor-window"
---

# Tasks: Educação numa janela de editor, como Challenges e Comunitário

**Input**: Design documents from `specs/008-education-editor-window/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md;
constituição v3.0.0

**Tests**: incluídos. O plano e o quickstart (V1–V14) pedem testes, e a suíte Vitest + Playwright é o
gate de verificação da constituição.

**Organization**: Setup e Foundational, depois uma fase por história, na ordem de prioridade: US1 (P1, a
janela) e US2 (P2, o `open educacao`), e o polimento.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: história da spec (US1, US2)

## Path Conventions

Projeto único: `src/` e `tests/` na raiz (plan.md, Project Structure).

---

## Phase 1: Setup

**Purpose**: linha de base de peso e versão

- [X] T001 Conferir a linha de base de peso (research R9): `npm run build`, depois somar o `gzip -9` de `dist/index.html` e dos `dist/assets/*.js|css` referenciados nele, sem os workers (o método do teste de peso); se diferir dos 109.532 B do research R9, atualizar o número lá. Em `tests/e2e/weight.spec.ts`, no teste "HTML + CSS + JS iniciais", trocar a linha de base para a da 007 (109.532 B, commit `894c8be`) e o teto para `+ 2 * 1024` (SC-007), com o comentário da feature 008 (o histórico da 005, da 006 e da 007 fica no comentário), e o título do teste e o `console.log` passam a falar da 007
- [X] T002 Levar a versão a `2.7.0` (FR-019, research R10): `npm version 2.7.0 --no-git-tag-version` (atualiza `package.json` e `package-lock.json`); trocar `v2.6` por `v2.7` em `tests/unit/version.spec.ts` (título e expectativa), `tests/e2e/session.spec.ts` (texto e título), `tests/component/AccessGate.spec.ts` e no comentário de `src/lib/boot.ts`; no `README.md` (seção da versão), `v2.6` → `v2.7` e "2.6 a 007" → "2.6 a 007 e 2.7 a 008"

**Checkpoint**: `npm run typecheck`, `npm test` e o build passam; o site só mudou a versão

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: o `id` da formação e os arquivos YAML da pasta `~/formacao`, de que a janela (US1) e o `open` (US2) dependem

**⚠️ CRITICAL**: nenhuma história começa antes desta fase

- [X] T003 Em `src/types/resume.ts`, acrescentar a `Education` o campo obrigatório `id: string` (data-model §1), primeiro da interface, com o comentário: slug curto, "`^[a-z0-9]+(-[a-z0-9]+)*$`", único na coleção; é o slug do nome do arquivo `AAAA_<id>.yml` na janela de editor `~/formacao` e a chave do cartão (feature 008, research R3)
- [X] T004 Em `src/data/resume.ts`, dar os ids às 4 formações (research R3), como primeira chave de cada objeto: Pós-Graduação em Cibersegurança → `'ciberseguranca'`, Bacharelado em Sistemas de Informação → `'sistemas-de-informacao'`, 1º Empregotech → `'empregotech'`, Técnico em Análise e Desenvolvimento de Sistemas → `'tecnico-ads'`; nenhum outro campo muda
- [X] T005 [P] Em `tests/unit/resume.data.spec.ts`: no teste "(3) ids únicos em cada coleção", acrescentar `education: resume.education.map((e) => e.id)`; novo teste (feature 008, FR-004): cada `id` de formação casa com `^[a-z0-9]+(-[a-z0-9]+)*$` e `` `${startYear}_${id}.yml` `` tem no máximo 31 caracteres
- [X] T006 [P] Pôr `id` nos dados de teste de formação: no helper `edu(course, startYear, endYear)` de `tests/unit/sort.spec.ts` (`id: slugify(course)` ou um texto fixo derivado do curso, sem mudar as asserções de ordem) e no `base: Education` (e nas variações) de `tests/component/EducationCard.spec.ts`
- [X] T007 Em `src/lib/editor-files.ts`, criar `educationFolder(education: readonly Education[]): EditorFolder` (research R2, R4, R5; data-model §2 e §3; contracts/education-window.md §2): `folder('formacao', '~/formacao', byStartYearDesc(education), (edu) => …)` com `id: edu.id`, `date: String(edu.startYear)`, `slug: edu.id`, `title: edu.course` e as linhas, nesta ordem: `pair('curso', course)`, `pair('instituicao', institution)`, `pair('local', location)`, `pair('periodo', formatYears(startYear, endYear), 'date')`; só com `status === 'em-curso'`, a linha `em_curso` com os trechos `key 'em_curso'`, `punct ': '`, `str 'true'`, `comment '  # EM CURSO'` (como o `atual … # HEAD` da Experiência); só com `note`, `...block('observacao', note)`; só com `sources`, `line([key 'fontes', punct ':'])` e, para cada fonte, na ordem dos dados, `line([punct '- ', link(label, url)], 1)`. Importar `formatYears` de `@/lib/period`, `byStartYearDesc` de `@/lib/sort` e o tipo `Education`; atualizar o comentário do topo do arquivo (Experiência, Challenges, Comunitário e Educação; nome `AAAA-MM_<slug>.yml`, ou `AAAA_<slug>.yml` na formação, que só tem anos) e os comentários de `EditorFolder.label`/`path` (`formacao`, `~/formacao`)
- [X] T008 [P] Em `tests/unit/editor-files.spec.ts` (feature 008, FR-003 a FR-007, data-model §3): acrescentar `formacao: ['curso', 'instituicao', 'local', 'periodo', 'em_curso', 'observacao', 'fontes']` a `KEYS` e `educationFolder(resume.education)` a `folders()`, ajustando os testes que desestruturam `folders()` e comparam caminhos/ids/chaves (`~/formacao`; ids na ordem de `byStartYearDesc`); novo teste: cada arquivo de formação traz curso, instituição, local, `formatYears(...)`, a observação e os rótulos das fontes; `# EM CURSO` só no arquivo da formação `em-curso`; nos arquivos sem `note`/`sources`, nenhuma linha `observacao`/`fontes`; no 1º Empregotech, as 2 fontes são trechos `link` com `href` = `url`, em linhas de recuo 1 começando por `- `; nomes `['2025_ciberseguranca.yml', '2020_sistemas-de-informacao.yml', '2020_empregotech.yml', '2018_tecnico-ads.yml']`; caminho `~/formacao/2025_ciberseguranca.yml`; cabeçalho `# 1 / 4 · Pós-Graduação em Cibersegurança`

**Checkpoint**: `npm run typecheck` e `npm test` verdes; o site não mudou (a pasta existe, mas ninguém a usa)

---

## Phase 3: User Story 1 - Educação numa janela de editor (Priority: P1) 🎯 MVP

**Goal**: a seção Educação vira a janela de editor `~/formacao`, com uma formação por arquivo, maximizar, minimizar, fechar, sem JS e impressão como as outras (FR-001 a FR-014); nas 4 janelas, os nomes da árvore que não cabem terminam em reticências (FR-020)

**Independent Test**: na seção Educação, percorrer as 4 formações pela árvore (mouse e teclado), conferir cada arquivo contra o cartão, minimizar, fechar, reabrir, maximizar e restaurar; repetir em 320 px, com "reduzir movimento", sem JavaScript e na impressão (quickstart V1–V7, V11, V12)

### Implementation for User Story 1

- [X] T009 [US1] Reescrever `src/components/sections/EducationSection.vue` no molde de `src/components/sections/ExperienceSection.vue` (research R1, R6; contracts/education-window.md §1): `const folder = computed(() => educationFolder(props.education))`; `<SectionShell id="educacao" title="educacao" lead="apt list --installed | grep formacao">` (sem mudança) com `<EditorWindow v-reveal :folder="folder" window-id="educacao">` e, no `<template #cards>`, a `<ol class="edu-list">` de hoje com `<li v-for="edu in ordered" :key="edu.id" :data-card-id="edu.id">` (sem `v-reveal` no `<li>`) e o `<EducationCard :education="edu" />`; manter o estilo `.edu-list`; comentário do topo da feature 008 (`code ~/formacao`, um arquivo YAML por formação; maximizada, sem JS e na impressão, os cartões de antes)
- [X] T010 [P] [US1] Em `src/components/terminal/EditorFrame.vue`, no `<style scoped>`, junto das regras da árvore (`.editor-tree`), acrescentar `.editor-tree :deep(.bm-label) { min-width: 0; overflow: hidden; text-overflow: ellipsis; }` com o comentário da feature 008 (FR-020, research R13: no celular, o nome que não cabe termina em reticências, como no explorer do VS Code, em vez de ser cortado no meio da letra pelo `overflow: hidden` do componente; o nome inteiro continua no texto do botão e no rodapé); não mexer em `src/components/vendor/vue-bits/BranchedMenu.vue` nem nas props da árvore; atualizar o comentário do topo do `EditorFrame` (janelas de Experiência, Challenges, Comunitário e Educação)

### Tests for User Story 1

- [X] T011 [US1] Em `tests/e2e/editor-windows.spec.ts`: acrescentar `{ label: 'formacao', path: '~/formacao', section: '#educacao', count: 4 }` a `EDITORS`; no teste "estrutura", a ordem pelas datas passa a comparar o prefixo antes do primeiro `_` (`n.trim().split('_')[0]`), que vale para `AAAA-MM` e `AAAA`; no teste "celular", para 320 e 390 px e cada janela de `EDITORS`, conferir em todo `.bm-child .bm-label` que `getComputedStyle(label).textOverflow === 'ellipsis'` e que a borda direita do rótulo fica dentro da `.editor-tree` (≤ `right` da árvore + 0,5 px), e que em 320 px o rótulo `2020_sistemas-de-informacao.yml` está truncado (`scrollWidth > clientWidth`) e o `2018_tecnico-ads.yml` está inteiro (`scrollWidth ≤ clientWidth`) (FR-020, SC-001); abrir o `2020_sistemas-de-informacao.yml` em 320 px e conferir o rodapé com o caminho inteiro; atualizar o comentário do topo (feature 008); conferir que os testes parametrizados por `EDITORS` (estrutura, fatos dos cartões com links `_blank`/`noopener noreferrer`, celular sem rolagem horizontal em 320/390/768/1366/1920) passam com a janela nova
- [X] T012 [US1] Em `tests/e2e/editor-windows.spec.ts`, novo teste da feature 008 (quickstart V2–V5; FR-005, FR-007, FR-009 a FR-011; SC-002, SC-003): na janela `formacao`, o arquivo `2025_ciberseguranca.yml` tem a linha `em_curso: true  # EM CURSO` e os das outras 3 formações não têm `em_curso`; abrir o `2020_empregotech.yml` pela árvore com Enter: rodapé `~/formacao/2020_empregotech.yml` · `3 / 4`, altura da janela igual (0 px, tolerância de subpixel de 0,5 px, como os testes da 006), `fontes:` seguido de 2 links (`overbr.com.br`, `curitiba.pr.gov.br`) com `target="_blank"` e `rel="noopener noreferrer"`; maximizar em 1366 × 800 e em 390 × 844: diálogo `~/formacao (maximizada)` cobrindo ≥ 90% da tela no desktop e ≥ 95% no celular, a animação de maximizar e a de restaurar terminam em ≤ 400 ms cada (`getAnimations()` do `.editor-frame` com `finished`, medido como no teste de maximizar da 006), com os 4 cartões (`h3` na ordem da seção); escolher `2018_tecnico-ads.yml` na árvore rola a lista até o cartão do Técnico (título visível na região); Esc restaura com o foco no `□` e o arquivo do Técnico aberto; minimizar mostra o ícone `Abrir ~/formacao`, e o clique nele reabre completa; fechar e reabrir digita `code ~/formacao` de novo
- [X] T013 [US1] Em `tests/e2e/projects.spec.ts`, reescrever o teste "1º Empregotech entre o Bacharelado e o Técnico, com observação e fontes (US7, V7)": com JS, os cartões só aparecem na janela maximizada, e `#educacao ol > li` pegaria as linhas do editor; ir a `#educacao`, maximizar a janela `~/formacao` (`button.t-max`) e olhar `.editor-cards .edu-list > li` no diálogo (`h3` na ordem das 4 formações; o 3º com `2020 — 2020`, `Prime Control` e a lista `Fontes` com 2 links `_blank`); comentário citando a feature 008
- [X] T014 [P] [US1] Em `tests/e2e/no-js.spec.ts`: o teste da feature 004 passa a esperar 12 `.desktop-window` (comentário: as 4 de editor, com a de Educação da 008); acrescentar ao teste "todo o conteúdo do currículo está visível" (ou a um teste novo da 008) que, sem JS, `#educacao` mostra os 4 `h3` de formação visíveis e não mostra `.editor-tree` nem `.editor-footer`; no `describe` de impressão com JS (`page.emulateMedia({ media: 'print' })`), conferir que os 4 cartões de formação ficam visíveis e a árvore da `~/formacao` não (FR-012, SC-004)
- [X] T015 [P] [US1] Em `tests/e2e/a11y.spec.ts`, no teste "janelas de editor: normal (arquivo do meio), Challenges maximizada e Experiência minimizada" (SC-008): acrescentar `'formacao'` à lista de janelas auditadas no estado normal; auditar a janela de Educação maximizada (`.editor-window[data-editor="formacao"] button.t-max`, espera de 500 ms, `audit(page)` sem violações, Esc) e minimizada (`button.t-min`, espera o quadro sumir, `audit(page, '#educacao')`); ouvir `pageerror` e `console` (tipo `error`) durante o teste, como os testes de console do mesmo arquivo, e esperar zero erros do site
- [X] T016 [P] [US1] Em `tests/e2e/reduced-motion.spec.ts`, ao lado do caso dos Challenges (feature 006), um caso da 008 (FR-011, quickstart V11): com `reducedMotion: 'reduce'`, a janela `.editor-window[data-editor="formacao"]` já está completa ao chegar à seção (o `.editor` sem `data-t-state` `pending`/`typing`), e maximizar e restaurar não criam animações (`getAnimations().length === 0` no `.editor-frame`)
- [X] T017 [US1] Rodar `npm run build` e a suíte e2e das janelas e da seção (`npx playwright test editor-windows projects no-js a11y motion reduced-motion links layout minimized-layout desktop-windows window-controls`); corrigir o que quebrar por causa da janela nova ou das reticências (ex.: seletores que contavam 3 janelas de editor ou que olhavam os cartões de `#educacao` com JS), sem afrouxar asserções que não sejam da Educação

**Checkpoint**: a US1 funciona sozinha: a Educação é uma janela de editor completa, os nomes da árvore não cortam no meio da letra, e o `open educacao` ainda responde que a seção não abre com o `open`

---

## Phase 4: User Story 2 - Abrir a Educação pelo terminal da dock (Priority: P2)

**Goal**: `educacao` vira a 10ª opção do `open`, que maximiza a janela `~/formacao`; o `help` passa a citar a educação (FR-015 a FR-018)

**Independent Test**: no terminal da dock, rodar `open educacao` e `open formacao` a partir do hero, com a janela aberta, minimizada e fechada; conferir estado, saída, `help`, Tab e foco (quickstart V8–V10)

### Implementation for User Story 2

- [X] T018 [US2] Em `src/lib/sections.ts`, `openTargets`: depois de `comunitario`, `...(resume.education.length ? [editorTarget('educacao', '~/formacao')] : [])` (research R7, data-model §4: `name` `educacao`, `windowId` `educacao`, `path` `~/formacao`, `alias` `formacao`, `mode` `maximize`); atualizar o comentário (Experiência, Challenges, Comunitário e Educação maximizam; feature 008, Q1)
- [X] T019 [US2] Em `src/lib/terminal.ts`, `helpText`: a linha fixa `'  projetos abrem; experiencia, challenges e comunitario abrem maximizados'` passa a ser gerada (research R8): com `const editors = targets.filter((t) => t.mode === 'maximize').map((t) => t.name)` e `hasProjects = targets.some((t) => t.mode === 'open')`, juntar à portuguesa (`a`, `a e b`, `a, b, c e d`) e montar `  projetos abrem; <editores> abrem maximizados`; sem projetos, `  <editores> abrem maximizados`; sem editores, `  projetos abrem`. Com os dados de hoje: `  projetos abrem; experiencia, challenges, comunitario e educacao abrem maximizados`

### Tests for User Story 2

- [X] T020 [P] [US2] Em `tests/unit/sections.spec.ts`: os 10 nomes na ordem `experiencia, srg, temas-vs-code, italiami, ocr-de-prontuarios, qclass-bot, monitor-de-curso, challenges, comunitario, educacao`; `educacao` igual a `{ name: 'educacao', windowId: 'educacao', path: '~/formacao', alias: 'formacao', mode: 'maximize' }`; `educacao` entre os nomes reservados que nenhum projeto pode ter; o currículo com coleções vazias passa a esvaziar também `education`, e um currículo só sem `education` não tem o alvo `educacao`
- [X] T021 [P] [US2] Em `tests/unit/terminal.spec.ts`: `OPEN_OPTIONS` com `| educacao` no fim; o bloco do `help` com a linha gerada `  projetos abrem; experiencia, challenges, comunitario e educacao abrem maximizados`; novo teste do `helpText` com alvos reduzidos (só projetos → `  projetos abrem`; projetos + 1 editor → `  projetos abrem; experiencia abrem maximizados`; projetos + 2 → `experiencia e challenges`); nos casos normalizados do `open` (o `it.each` de "open %s é normalizado"), acrescentar `['Educação', 'educacao', '→ ~/formacao']`, `['formacao', 'educacao', '→ ~/formacao']` e `['~/formacao/', 'educacao', '→ ~/formacao']`; no `it.each` de "seção que o open não abre sugere o find" (hoje com `['Educação', 'educacao']`, em torno da linha 140), tirar o caso da Educação e manter `sobre`, `skills`, `projetos`, `Contato`; `complete('open ed', ctx)` → `open educacao`; `complete('open e', ctx)` → candidatos `['experiencia', 'educacao']`. `tests/component/DockTerminal.spec.ts` não fixa a lista do `open` nem o texto do `help` dele (o único caso é `open sobre`, que continua): sem mudança
- [X] T022 [US2] Em `tests/e2e/open-command.spec.ts` (quickstart V8–V10; FR-015 a FR-018; SC-006): acrescentar `['educacao', 'formacao', '~/formacao']` a `EDITORS` e `| educacao` a `OPEN_OPTIONS`; o título "as 9 opções" passa a "as 10 opções"; no teste "erros", tirar o caso `open educacao` (a mensagem continua para `sobre`, `skills`, `projetos`, `Contato`); no teste "open das janelas de editor", acrescentar `open formacao` com a janela de Educação fechada: saída `→ ~/formacao`, maximizada já completa (sem `data-t-state` pendente), título `~/formacao`, e, ao restaurar com Esc, `scrollY` dentro da seção `#educacao` e o terminal minimizado; no teste do `help`, a linha `projetos abrem; experiencia, challenges, comunitario e educacao abrem maximizados`; no Tab, `open ed` → `open educacao`
- [X] T023 [US2] Rodar `npm test` e `npx playwright test open-command dock-terminal` (depois de `npm run build`); corrigir o que quebrar

**Checkpoint**: US1 e US2 completas; o `open` tem 10 opções

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: documentação, peso e verificação final

- [X] T024 [P] Atualizar `DESIGN.md` (research R12): na seção das janelas de editor (hoje "Experiência, Challenges e Comunitário são janelas de editor…"), passar a quatro, com a de Educação (`~/formacao`, um arquivo `AAAA_<id>.yml` por formação, `em_curso: true  # EM CURSO` e a lista `fontes`) e registrar que os nomes da árvore que não cabem terminam em reticências (FR-020); no layout, "Formação: pilha com 1.2rem entre os cartões" passa a dizer que a pilha é a visão maximizada/sem JS/impressão da janela `~/formacao`; onde houver a lista de opções ou janelas do `open`, acrescentar `educacao`
- [X] T025 [P] Atualizar `README.md` (research R12): na descrição das janelas de editor (linha ~72), incluir a Educação (`~/formacao`); na do terminal da dock/`open`, a opção `educacao` (maximizada); no guia de edição de dados, que cada formação tem um `id` curto em slug, que vira o nome do arquivo `AAAA_<id>.yml`
- [X] T026 Medir o peso (`npx playwright test weight`): anotar em `specs/008-education-editor-window/research.md` (R9) o número medido e o acréscimo sobre 109.532 B; o teste passa com o teto de +2 KB (SC-007)
- [X] T027 Verificação final: `npm run typecheck`, `npm test` e `npm run test:e2e` completos, todos verdes (anotar as contagens de testes Vitest e Playwright)
- [X] T028 Inspeção pelo quickstart (V1–V14) no `npm run preview` com o Playwright MCP: 1366 × 800 e 320/390 px, a janela `~/formacao` normal (arquivo do Empregotech), maximizada e minimizada, e a árvore dos Challenges em 320 px (reticências); `open educacao` pelo terminal da dock; console sem erros do site; registrar no fim de `specs/008-education-editor-window/quickstart.md` o que foi conferido e o que fica com o autor (celular físico)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup; bloqueia US1 e US2
- **US1 (Phase 3)**: depende da Phase 2
- **US2 (Phase 4)**: depende da Phase 2; os e2e (T022) dependem da janela da US1 (T009), porque o `open` maximiza a janela registrada com `window-id="educacao"`
- **Polish (Phase 5)**: depende de US1 e US2

### Within Each Phase

- T003 → T004 (o tipo exige o campo) → T005, T006, T007 → T008
- T009, T010 → T011, T012, T013, T014, T015, T016 → T017
- T018, T019 → T020, T021 → T022 → T023
- T024, T025, T026 → T027 → T028

### Parallel Opportunities

- Phase 2: T005 e T006 (arquivos de teste diferentes); T008 em paralelo com T005/T006 depois de T007
- Phase 3: T009 e T010 (arquivos diferentes); depois, T014, T015 e T016 (specs e2e diferentes)
- Phase 4: T020 e T021 (arquivos diferentes), depois de T018/T019
- Phase 5: T024 e T025

---

## Parallel Example: User Story 1

```bash
# Em paralelo (arquivos diferentes):
Task: "T009 EducationSection com o EditorWindow"
Task: "T010 EditorFrame: reticências nos nomes da árvore"
# Depois de T009 e T010:
Task: "T014 no-js.spec.ts: 12 janelas; Educação sem JS e na impressão"
Task: "T015 a11y.spec.ts: formacao normal, maximizada e minimizada, com o console"
Task: "T016 reduced-motion.spec.ts: formacao completa e sem animação"
```

## Parallel Example: User Story 2

```bash
# Depois de T018 e T019:
Task: "T020 sections.spec.ts: 10 alvos, educacao → ~/formacao"
Task: "T021 terminal.spec.ts: help gerado, open educacao/formacao, Tab"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 (Setup) e Phase 2 (Foundational)
2. Phase 3 (US1): a Educação vira janela de editor; reticências na árvore
3. **Parar e validar**: quickstart V1–V7, V11, V12

### Incremental Delivery

1. Setup + Foundational → base pronta (site igual, versão 2.7.0)
2. US1 → janela de Educação (MVP)
3. US2 → `open educacao`
4. Polish → documentação, peso, suítes completas, inspeção
