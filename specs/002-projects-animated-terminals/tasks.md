---

description: "Task list for 002-projects-animated-terminals"
---

# Tasks: Projetos ampliados, terminais animados e ícones nas skills

**Input**: Design documents from `specs/002-projects-animated-terminals/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md;
constituição v2.2.0

**Tests**: incluídos. O plano e o quickstart (V1–V16) pedem testes, e a suíte da 001 (Vitest +
Playwright) continua sendo o gate de verificação da constituição.

**Organization**: uma fase por história (US1–US9, um item do autor cada; ver Rastreabilidade da
spec), depois de Setup e Foundational.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: história da spec (US1–US9)

## Path Conventions

Projeto único: `src/` e `tests/` na raiz (plan.md, Project Structure).

---

## Phase 1: Setup

**Purpose**: dependência nova

- [X] T001 Instalar `@lucide/vue@^1.53.0` como dependência de runtime com `npm install @lucide/vue@^1.53.0` (atualiza `package.json` e `package-lock.json`); conferir com `npm ls @lucide/vue` e que `npm run typecheck` continua passando

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: tipos novos e o link privado, usados por US2, US3 e US4

**⚠️ CRITICAL**: nenhuma história começa antes desta fase

- [X] T002 Substituir `src/types/resume.ts` pelo conteúdo de `specs/002-projects-animated-terminals/contracts/resume.schema.ts`, **exceto** `SkillGroup.icon`, que continua `string` até a T040 (US9): entram `Link`, `Evidence.private?: true`, `ProjectBase.relatedTo?: string`, `ProjectBase.inProgress?: true`, `Challenge`, `CommunityProject`, `Education.note?: string`, `Education.sources?: NonEmpty<Link>` e `Resume.challenges`/`Resume.community`; atualizar o comentário de cabeçalho para apontar `specs/002-projects-animated-terminals/data-model.md` ("Validação")
- [X] T003 Em `src/data/resume.ts`, adicionar `challenges: []` e `community: []` (preenchidos em US5/US6) e atualizar o "Guia de edição" do topo: links privados (`private: true`, só em `kind: 'repositorio'`), `inProgress` (selo sem data), `relatedTo`, challenges ordenados por `created` (não pela ordem do arquivo), projeto comunitário sem stack, `note`/`sources` em formação; `npm run typecheck` passa
- [X] T004 Em `src/styles/tokens.css`, criar o token `--icon-inline: 1em` (tamanho de ícone junto ao texto, FR-036); em `src/components/sections/EvidenceLink.vue`, criar a variante privada (FR-005, FR-006): quando `evidence.private`, o `ExternalLink` contém o ícone `Lock` de `@lucide/vue` (`aria-hidden="true"`, dimensionado por CSS com `width`/`height: var(--icon-inline)`, sem a prop `size`), o caminho sem protocolo (`github.com/V-Perotto/…`) e uma etiqueta visível `privado`, mais `<span class="sr-only">repositório privado, pode não abrir</span>` antes do "(abre em nova aba)"; sem badge; cores só de tokens (etiqueta em `--text-dim` com borda `--border`, raio `--radius-nav`); URLs longas quebram com `overflow-wrap: anywhere`
- [X] T005 Em `src/components/sections/ProjectCard.vue`, quando houver **ao menos uma** evidência `private` (C1 do analyze: todo link privado avisa que pode não abrir), mostrar depois da lista de links o comentário `# repositório privado: pode abrir uma página de "não encontrado" para quem não tem acesso.` (com 1 link privado) ou `# repositórios privados: podem abrir uma página de "não encontrado" para quem não tem acesso.` (com mais de 1), na classe `.no-evidence` (comentário em itálico, Dim Lilac); projetos sem link privado não mostram a linha
- [X] T006 [P] Em `tests/component/ProjectCard.spec.ts`, cobrir: link privado tem texto visível "privado", nome acessível contendo "repositório privado, pode não abrir", `target="_blank"` e `rel="noopener noreferrer"`; comentário singular com 1 link privado e plural com 2; comentário presente também num cartão com 1 link público e 1 privado; nenhum comentário sem link privado

**Checkpoint**: `npm run typecheck` e `npm test -- tests/component` passam; o site ainda exibe o conteúdo antigo

---

## Phase 3: User Story 1 - Projetos um por linha, cada um com seu link (Priority: P1) 🎯 MVP

**Goal**: um projeto por linha em todas as larguras, com os links à vista no cartão (item 4)

**Independent Test**: em 1440, 768 e 320px, nenhum par de cartões lado a lado; todo cartão com link
mostra o link (quickstart V1, V2)

- [X] T007 [P] [US1] Criar `tests/e2e/projects.spec.ts` com V1: em 1440, 768 e 320px, os `#projetos .projects-grid > li` têm `top` distintos (nenhuma linha com 2 cartões) e não há rolagem horizontal; e V2 (parte de links): todo cartão exceto o do "Monitor de Curso" tem ao menos um `<a target="_blank" rel="noopener noreferrer">`
- [X] T008 [US1] Em `src/components/sections/ProjectsSection.vue`, trocar a grade `auto-fit` por uma coluna (`grid-template-columns: 1fr`) em todas as larguras, mantendo o gap `calc(var(--spacing) * 5.6)`
- [X] T009 [US1] Em `src/components/sections/ProjectCard.vue`, reorganizar a saída do comando em dois blocos irmãos dentro de um `div.project-body` (filho direto da janela, logo depois do `TerminalLine`): `div.project-info` (nome, propósito, métricas, metadados, stack) e `div.project-links` (lista de links, comentário de privados ou de falta de link); a partir de 900px de largura da viewport, `project-body` vira grade de duas colunas (`minmax(0, 1.6fr) minmax(0, 1fr)`, gap dos tokens) e abaixo disso uma coluna; o rodapé `[tag] exit 0` continua fora do `project-body`, em largura inteira; preservar a ordem "descrição → métricas" que o teste existente verifica
- [X] T010 [US1] Rodar `npm test -- tests/component/ProjectCard.spec.ts` e ajustar o teste "métricas vêm logo depois da descrição" só se o seletor mudar (a regra continua: `.metrics` é o irmão seguinte de `.t-desc`)

**Checkpoint**: US1 funciona sozinha com os 3 projetos atuais

---

## Phase 4: User Story 2 - ItaliaMi com links para os repositórios privados (Priority: P1)

**Goal**: o ItaliaMi passa a ter três links privados (item 2)

**Independent Test**: cartão do ItaliaMi com 3 links para as URLs pedidas, cada um avisado (V3)

- [X] T011 [US2] Em `src/data/resume.ts`, no projeto `italiami`: remover `confidential` e `noEvidenceReason`; `evidence` com três itens `{ kind: 'repositorio', private: true }`: "ItaliaMi-Back · back-end" → `https://github.com/V-Perotto/ItaliaMi-Back`, "ItaliaMi-Front · front-end" → `https://github.com/V-Perotto/ItaliaMi-Front`, "ItaliaMi-BOT · bot" → `https://github.com/V-Perotto/ItaliaMi-BOT`; propósito, stack (Angular, C#, .NET), papel e rodapé inalterados
- [X] T012 [P] [US2] Em `tests/e2e/projects.spec.ts`, verificar que o cartão do ItaliaMi tem exatamente esses 3 `href`, cada link com "privado" visível, e o comentário `# repositórios privados…`

**Checkpoint**: ItaliaMi sem "Projeto confidencial, sem link público"

---

## Phase 5: User Story 3 - Projetos privados ligados à Quadritech (Priority: P1)

**Goal**: OCR de prontuários e QClass-BOT na lista, privados e ligados à Quadritech (item 3)

**Independent Test**: os dois cartões com propósito, stack, papel, `contexto = Quadritech
Tecnologia` e link privado

- [X] T013 [US3] Em `src/components/sections/ProjectCard.vue`, quando houver `project.relatedTo`, acrescentar ao `dl.project-meta` o par `<div><dt>contexto</dt><dd>{{ project.relatedTo }}</dd></div>` depois de `tipo`
- [X] T014 [US3] Em `src/data/resume.ts`, adicionar os projetos `ocr-prontuarios` e `qclass-bot` com os textos do inventário do `data-model.md` (comando, propósito, stack `['Python', 'OCR']` / `['Python']`, papel "Autor e desenvolvedor", `kind: 'profissional'`, rodapé `[privado · Quadritech]`, `relatedTo: 'Quadritech Tecnologia'`) e um link privado cada: "OCR_Para_BR" → `https://github.com/V-Perotto/OCR_Para_BR`, "QClass-BOT" → `https://github.com/V-Perotto/QClass-BOT`
- [X] T015 [P] [US3] Em `tests/component/ProjectCard.spec.ts`, testar que `relatedTo` aparece como `contexto` e que sem ele o par não existe; em `tests/e2e/projects.spec.ts`, verificar os dois cartões com "Quadritech Tecnologia", "privado" e o `href` certo

**Checkpoint**: dois cartões novos, sem tocar nos demais

---

## Phase 6: User Story 4 - SRG-Project em desenvolvimento (Priority: P1)

**Goal**: SRG no topo, com selo "EM DESENVOLVIMENTO" e cinco links privados (item 7)

**Independent Test**: só o SRG tem o selo, sem período; 5 links privados (V4)

- [X] T016 [US4] Em `src/components/sections/ProjectCard.vue`, quando `project.inProgress`, renderizar `<span class="tag-now">EM DESENVOLVIMENTO</span>` dentro do `h3.project-name`, depois do subtítulo (classe global já usada por `HEAD`/`EM CURSO`; texto real, sem data nem período, FR-013)
- [X] T017 [US4] Em `src/data/resume.ts`, adicionar o projeto `srg` com os textos do inventário do `data-model.md` (comando `./run srg --status`, propósito, stack Vue 3, TypeScript, NestJS, PostgreSQL, Prisma, Valkey, Docker, Nginx, papel "Autor: front-end, back-end e infraestrutura", `kind: 'pessoal'`, rodapé `[projeto pessoal]`, `inProgress: true`, sem citar o cliente) e cinco links privados ("SRG-Vue · front-end", "SRG-Admin · console de administração", "SRG-Node · API", "SRG-Core · núcleo compartilhado", "SRG-DEVOPS · infraestrutura" → `https://github.com/V-Perotto/SRG-Vue|SRG-Admin|SRG-Node|SRG-Core|SRG-DEVOPS`); reordenar `projects` para `srg, vscode-themes, italiami, ocr-prontuarios, qclass-bot, monitoria` (FR-004)
- [X] T018 [P] [US4] Em `tests/component/ProjectCard.spec.ts`, testar selo presente com `inProgress` e ausente sem; em `tests/e2e/projects.spec.ts`, verificar a ordem dos 6 `h3` da lista principal, "EM DESENVOLVIMENTO" só no cartão do SRG, nenhum "PRESENTE" nele, e os 5 links privados

**Checkpoint**: lista principal completa (US1–US4)

---

## Phase 7: User Story 5 - Sub-parte de Challenges (Priority: P2)

**Goal**: 7 challenges públicos, do mais recente para o mais antigo (item 6)

**Independent Test**: ordem CIEE-PR → … → Axya calculada pelas datas, 7 links públicos (V5)

- [X] T019 [P] [US5] Em `src/lib/sort.ts`, adicionar `byCreatedDesc(list: readonly Challenge[]): Challenge[]` ("`created` desc; empate → `name` asc", sem mutar o original); criar `tests/unit/sort.spec.ts` com a lista embaralhada, um empate de mês e a verificação de não mutação
- [X] T020 [P] [US5] Criar `src/components/sections/ProjectSubpart.vue`: props `title` e `lead`; renderiza `div.project-subpart` com `h3.subpart-title.mono` (`<span aria-hidden="true">###</span> {{ title }}<span aria-hidden="true">/</span>`, mesmas cores do título de seção, fonte menor), `p.section-lead.mono` (`<span aria-hidden="true">$ </span>{{ lead }}`) e `<slot />`; espaçamentos e cores só de tokens (The Directory Listing Rule do `DESIGN.md`)
- [X] T021 [P] [US5] Criar `src/components/sections/ChallengeCard.vue`: `BaseCard variant="card"` com `p.card-date.mono` `// {{ formatYearMonth(challenge.created) }}`, `h4.card-role` com o nome, `p.card-desc` com o resumo, `ul.chips` de `TagChip` com a stack (`aria-label="Stack"`) e `ExternalLink` para `challenge.url` com o caminho sem protocolo como texto (verde, quebra com `overflow-wrap: anywhere`)
- [X] T022 [US5] Em `src/components/sections/ProjectsSection.vue`, adicionar a prop `challenges: readonly Challenge[]` e, depois da lista principal, `<ProjectSubpart v-if="challenges.length" title="challenges" lead="ls -lt ~/projetos/challenges">` com `<ol class="subpart-list">` dos itens em `byCreatedDesc(challenges)` (`computed`), cada `li` com `v-reveal`; passar `:challenges="resume.challenges"` em `src/App.vue`
- [X] T023 [US5] Em `src/data/resume.ts`, preencher `challenges` com os 7 itens da tabela da research R10 (ids = nome do repositório em minúsculas, nomes CIEE-PR, Mobiis, Econet, Executiva Service, PandaVideo, NY Times (RPA), Axya; `created` 2026-09, 2026-02, 2026-01, 2025-10, 2024-10, 2024-01, 2023-07; resumo e stack da tabela; URLs do FR-014); a ordem no arquivo não importa, a exibição vem da T022
- [X] T024 [P] [US5] Criar `tests/component/ProjectsSection.spec.ts`: challenges aparecem em `created` desc qualquer que seja a ordem da prop; sub-parte ausente com lista vazia; em `tests/e2e/projects.spec.ts`, verificar a ordem dos 7 nomes, `MMM AAAA` em cada um, 7 links públicos (sem "privado") e, em 1440px, altura da lista de challenges ≤ 3 × a altura média dos cartões da lista principal (FR-017)

**Checkpoint**: sub-parte de challenges completa

---

## Phase 8: User Story 6 - Sub-parte de projeto comunitário (Priority: P2)

**Goal**: gincana junina da PUC-PR com link para a notícia (item 9)

**Independent Test**: sub-parte `comunitario` com JUN 2023, papel e link (V6)

- [X] T025 [P] [US6] Criar `src/components/sections/CommunityCard.vue`: `BaseCard variant="card"` com `p.card-date.mono` `// {{ formatYearMonth(project.date) }}`, `h4.card-role` com o nome, `p.card-company.mono` `{{ institution }} · {{ location }}`, `p.card-desc` com o resumo, `dl` com `papel = {{ role }}` (mesmo visual `dt = dd` do cartão de projeto) e `fonte =` + `ExternalLink` para `source.url` com `source.label` como texto; sem stack (FR-019)
- [X] T026 [US6] Em `src/components/sections/ProjectsSection.vue`, adicionar a prop `community: readonly CommunityProject[]` e, depois dos challenges, `<ProjectSubpart v-if="community.length" title="comunitario" lead="cat ~/projetos/comunitario/*.md">` com `<ul class="subpart-list">` de `CommunityCard`; passar `:community="resume.community"` em `src/App.vue`
- [X] T027 [US6] Em `src/data/resume.ts`, preencher `community` com `gincana-junina` exatamente como no inventário do `data-model.md` (nome, PUC-PR, Curitiba - PR, `2023-06`, resumo, papel "Um dos estudantes organizadores (Sistemas de Informação)", fonte "pucpr.br" → URL do FR-018)
- [X] T028 [P] [US6] Em `tests/component/ProjectsSection.spec.ts`, testar que a sub-parte comunitária vem depois da de challenges e some com lista vazia; em `tests/e2e/projects.spec.ts`, verificar "JUN 2023", o papel e o `href` da notícia

**Checkpoint**: seção de projetos completa (US1–US6)

---

## Phase 9: User Story 7 - 1º Empregotech na formação (Priority: P2)

**Goal**: Empregotech entre Bacharelado e Técnico, com observação e fontes (item 8)

**Independent Test**: 3º item de `#educacao`, `2020 — 2020`, "Prime Control", 2 fontes (V7)

- [X] T029 [P] [US7] Em `src/lib/sort.ts`, fazer `byStartYearDesc` desempatar por `endYear` desc ("com o mesmo ano de início, a de término mais recente vem antes", FR-024) e cobrir em `tests/unit/sort.spec.ts` (Bacharelado 2020–2024 antes de Empregotech 2020–2020)
- [X] T030 [P] [US7] Em `src/components/sections/EducationCard.vue`, mostrar `education.note` num `p.card-desc` logo abaixo da instituição e `education.sources` numa `ul.edu-sources` com `aria-label="Fontes"`, cada item `fonte = ` + `ExternalLink` com `label` como texto; sem `note`/`sources` o cartão fica como hoje (FR-023)
- [X] T031 [US7] Em `src/data/resume.ts`, adicionar a formação "1º Empregotech" exatamente como no inventário do `data-model.md` (Prefeitura de Curitiba, Curitiba - PR, 2020–2020, `concluido`, observação, fontes "overbr.com.br" e "curitiba.pr.gov.br" → URLs do FR-022)
- [X] T032 [P] [US7] Criar `tests/component/EducationCard.spec.ts` (com e sem observação/fontes; fontes como links externos isolados) e, em `tests/e2e/projects.spec.ts`, verificar a ordem dos 4 cursos em `#educacao` e o Empregotech em 3º com "2020 — 2020", "Prime Control" e 2 links

**Checkpoint**: educação completa

---

## Phase 10: User Story 8 - Terminais que digitam ao rolar (Priority: P2)

**Goal**: cada janela digita os comandos e só então mostra a saída (item 1)

**Independent Test**: rolar até `#sobre`: saída escondida → completa em ≤ 2,5 s; com movimento
reduzido, sem JS e na impressão, tudo pronto (V8–V12)

- [X] T033 [P] [US8] Criar `src/lib/typing.ts` com `planTyping(commandLengths: number[])` (research R5): orçamento total 2200 ms, espera inicial 150 ms, pausa de 220 ms depois de cada comando, `ms por caractere = min(45, restante / total de caracteres)`; se isso ficar abaixo de 16 ms, digitar vários caracteres por tique de 16 ms; retorna `{ initialDelay, pauseAfter, tickMs, charsPerTick, totalMs }`; criar `tests/unit/typing.spec.ts` (Sobre: 2 comandos/34 caracteres → entre 40 e 45 ms; total ≤ 2200 para 1 a 1000 caracteres e 1 a 5 comandos; nenhum comando com 0 caracteres quebra)
- [X] T034 [US8] Em `src/components/terminal/TerminalLine.vue`, na variante de comando: marcar o elemento com `data-t-cmd` e envolver prompt + slot num `span.t-cmd` (`<span class="t-cmd"><span class="prompt-dollar" aria-hidden="true">$ </span><slot /></span>`); o HTML pré-renderizado continua igual ao visível hoje; a sobreposição **não** é renderizada pelo Vue (é criada pelo composable)
- [X] T035 [US8] Criar `src/composables/useTerminalTyping.ts(windowEl, bodyEl)` conforme research R3, R4 e R6 e os estados do `data-model.md`: ao montar, só age com `html.motion`; decide pela tabela da R4 (abaixo da dobra → arma e observa com `IntersectionObserver` `threshold: 0.25`; visível com `html.booting` → arma e começa quando `booting` sai, via `MutationObserver`; visível sem capa ou acima da dobra → não faz nada); armar = `data-t-anim` na janela, passos = filhos diretos do corpo (comando `[data-t-cmd]` abre um passo; os seguintes até o próximo comando são a saída dele; os anteriores ao 1º comando ficam visíveis), todos com `data-t-state="pending"`; rodar = para cada comando, `typing` + sobreposição `span.t-typed[aria-hidden="true"]` com clone profundo de `.t-cmd` cujos nós de texto são preenchidos por `planTyping`, depois `done` no comando (remove a sobreposição) e nas saídas dele; pular = `pointerdown` ou `focusin` na janela → tudo `done` na hora; `watch(useMotion())` para `false` → tudo `done`; uma vez `done`, desliga observers e ouvintes; `onBeforeUnmount` limpa timers, observers e ouvintes; timers com `setTimeout` (não rAF)
- [X] T036 [US8] Em `src/components/terminal/TerminalWindow.vue`, adicionar `ref` na janela e no corpo, a prop `animate` (padrão `true`) e chamar `useTerminalTyping` quando `animate`
- [X] T037 [US8] Em `src/styles/base.css`, junto do `.reveal`, adicionar os estados (só sob `html.motion` e dentro de `@media not print`): `[data-t-anim] [data-t-cmd] { position: relative }`; comando `pending`/`typing`: `.t-cmd` e descendentes com `color: transparent` e `text-shadow: none`; `.t-typed { position: absolute; inset: 0; pointer-events: none }`; saída `[data-t-state="pending"]:not([data-t-cmd]) { opacity: 0 }` com `transition: opacity 0.2s`; em `@media print`, `.t-typed { display: none }` e nada transparente ou com `opacity: 0`; nenhuma regra muda `display`, altura ou margem (FR-031)
- [X] T038 [P] [US8] Criar `tests/e2e/terminals.spec.ts` (com `reducedMotion: 'no-preference'`, pulando o boot com Escape como em `motion.spec.ts`): V8 rolar até `#sobre` → logo depois a saída de `cat sobre.txt` tem `opacity: 0`, e em até 2.500 ms todos os `[data-t-state]` da janela estão `done`; V9 clicar numa janela de projeto em animação → tudo `done` em até 100 ms, e Tab até um link de `#contato` antes de animar → link visível (`opacity: 1`) com foco; V11 `page.accessibility`/`ariaSnapshot` de `#sobre` durante a animação contém o texto completo do "sobre" e nenhum `.t-typed`; V12 `PerformanceObserver('layout-shift')` com soma 0 enquanto `#contato` anima e altura da janela igual antes e depois; FR-032: abrir `./#contato` **sem** pular o boot e verificar que, enquanto `html.booting` existe, a janela do Contato não tem nenhum passo `typing`/`done` e que, depois que o boot sai, todos os passos chegam a `done` em até 2.500 ms
- [X] T039 [P] [US8] Em `tests/e2e/reduced-motion.spec.ts` e `tests/e2e/no-js.spec.ts`, verificar que nenhum elemento tem `data-t-state` diferente de `done`, não existe `.t-typed` e o texto das janelas de Sobre, projetos e Contato está visível; em `tests/e2e/terminals.spec.ts`, com `page.emulateMedia({ media: 'print' })` numa janela armada, verificar texto visível e `.t-typed` oculto (V10)

**Checkpoint**: todas as janelas animam e se completam sozinhas

---

## Phase 11: User Story 9 - Ícones de verdade nos grupos de skills (Priority: P3)

**Goal**: ícones Lucide nos 5 grupos (item 5)

**Independent Test**: 5 `svg.lucide` `aria-hidden` nos títulos dos grupos, no HTML pré-renderizado (V13)

- [X] T040 [US9] Em `src/types/resume.ts`, trocar `SkillGroup.icon: string` por `icon: SkillIconName` e adicionar `export type SkillIconName = 'code-xml' | 'globe' | 'database' | 'workflow' | 'server-cog'`, como no contrato
- [X] T041 [P] [US9] Criar `src/lib/icons.ts` com `export const SKILL_ICONS: Record<SkillIconName, Component>` mapeando `'code-xml' → CodeXml`, `globe → Globe`, `database → Database`, `workflow → Workflow`, `'server-cog' → ServerCog` (imports nomeados de `@lucide/vue`, research R2)
- [X] T042 [US9] Em `src/data/resume.ts`, trocar os caracteres de `skillGroups[].icon` pelos nomes da tabela do `data-model.md` (`linguagens_frameworks → 'code-xml'`, `conceitos_web → 'globe'`, `gestao_de_dados → 'database'`, `desenho_de_processos → 'workflow'`, `devops_qualidade → 'server-cog'`)
- [X] T043 [US9] Em `src/styles/tokens.css`, criar o token `--icon-skill: 1.4rem`; em `src/components/sections/SkillGroupCard.vue`, trocar o `span.skill-icon` por `<component :is="SKILL_ICONS[group.icon]" class="skill-icon" aria-hidden="true" />`, dimensionado por CSS (`width`/`height: var(--icon-skill)`, sem a prop `size`, FR-036), com cor `var(--green-bright)` (o SVG usa `currentColor`), alinhado ao texto do `h3` sem deslocar a linha
- [X] T044 [P] [US9] Em `tests/e2e/a11y.spec.ts`, verificar 5 `#skills h3 svg.lucide[aria-hidden="true"]`, nome acessível de cada `h3` igual ao id do grupo, e nenhuma requisição a outra origem durante o carregamento além de `img.shields.io` (SC-008); no teste do axe, depois da rolagem, esperar que nenhum `[data-t-state]` fique diferente de `done` antes de auditar (texto em digitação é transparente de propósito e não deve contar como contraste)

**Checkpoint**: todas as histórias funcionando

---

## Phase 12: Polish & Cross-Cutting Concerns

- [X] T045 Reescrever as regras de `tests/unit/resume.data.spec.ts` conforme "Validação" do `data-model.md`: datas válidas também em `challenges[].created` e `community[].date`, e `created` ≤ mês atual; ids únicos também em challenges e community; toda URL `https://`, incluindo challenges, fonte do comunitário e fontes de formação; `private` só em evidência `kind: 'repositorio'`; inventário (5 experiências, 5 grupos, 6 projetos na ordem `srg, vscode-themes, italiami, ocr-prontuarios, qclass-bot, monitoria`, 7 challenges, 1 comunitário, 4 formações, 5 atributos, 2 contatos, só `srg` com `inProgress`, 10 links privados) no lugar da paridade da 001
- [X] T046 [P] Atualizar `DESIGN.md`: Layout > Projetos (uma coluna; duas colunas internas a partir de 900px; sub-partes `### nome/` com lead), Components > Chips (Tag Now também em projeto: `EM DESENVOLVIMENTO`), novo item "Private Link" (cadeado + `privado`), Terminal Window (digitação ao entrar na tela, regras de pulo e de movimento reduzido) e Skills (ícones Lucide em `currentColor`)
- [X] T047 Rodar `npm run typecheck`, `npm test` e `npm run test:e2e`; corrigir o que falhar (inclusive testes da 001 que dependiam de 3 projetos ou 3 formações, como `tests/component/ProjectCard.spec.ts` e `tests/e2e/a11y.spec.ts`)
  - Resultado (2026-10-08): typecheck ok, Vitest 55/55, Playwright 63/63 em três rodadas seguidas.
  - Corrigido no caminho: (a) o e2e do boot da 001 (≤ 5 s) passava do limite sob carga, também no
    build anterior à 002 — prazo do boot 4,2 s → 3,9 s e `BlurText` pré-carregado no `load`
    (research R13); (b) janela pulada numa rolagem rápida ficava `pending` para sempre — o observer
    passa a cobrir tudo acima da linha de 80% e completa na hora a janela que já passou (e2e novo em
    `terminals.spec.ts`); (c) sob CPU ocupada a digitação passava de 2,5 s — ritmo guiado pelo
    relógio e teto rígido de 2,45 s (`useTerminalTyping`).
- [X] T048 Medir o peso (V15): `npm run build` e somar gzip -9 de `dist/index.html` + CSS + JS referenciados por ele; registrar o valor em `specs/002-projects-animated-terminals/research.md` (R12) e confirmar ≤ 84,8 KB
- [X] T049 Validação manual do quickstart (constituição, Fluxo de Trabalho): build de produção servido localmente, screenshots via Playwright em 1440px e 390px das seções projetos, skills e educação, console sem erros nem avisos, com "reduzir movimento", sem JavaScript e com `forcedColors: 'active'` (ícones e cadeado visíveis, FR-036); conferir os textos contra o inventário do `data-model.md` (Princípio I) e registrar os resultados em `specs/002-projects-animated-terminals/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001)** → **Foundational (T002–T006)** → histórias.
- **US1 (T007–T010)** depende só da Foundational.
- **US2, US3, US4** dependem da Foundational (link privado); mexem em `src/data/resume.ts` e
  `ProjectCard.vue`, então rodam em sequência: US2 → US3 → US4 (a T017 reordena a lista com todos
  os projetos presentes).
- **US5 → US6**: ambas editam `ProjectsSection.vue`, `App.vue` e o `ProjectsSection.spec.ts`; US6
  depois de US5 (a sub-parte comunitária vem depois da de challenges). Ambas precisam de US1 (layout
  da seção).
- **US7** independe das demais histórias (educação).
- **US8** independe do conteúdo, mas é melhor validá-la com os cartões finais (depois de US1–US4).
- **US9** independe das demais; a T040 muda o tipo que a T002 deixou como `string`.
- **Polish** depois de todas.

### Within Each User Story

- Testes podem ser escritos antes da implementação (falham até ela entrar).
- Tipos → dados → componentes → integração.

### Parallel Opportunities

- T006 em paralelo com T004/T005 (arquivo de teste).
- T019, T020 e T021 em paralelo (arquivos novos diferentes).
- T029 e T030 em paralelo; US7 inteira em paralelo com US5/US6.
- T033 em paralelo com T034.
- T041 em paralelo com T040.
- T046 em paralelo com T045.

## Parallel Example: User Story 5

```bash
# arquivos novos, independentes:
Task: "T019 byCreatedDesc + tests/unit/sort.spec.ts"
Task: "T020 src/components/sections/ProjectSubpart.vue"
Task: "T021 src/components/sections/ChallengeCard.vue"
# depois, em sequência: T022 (ProjectsSection + App) → T023 (dados) → T024 (testes)
```

## Parallel Example: User Story 8

```bash
Task: "T033 src/lib/typing.ts + tests/unit/typing.spec.ts"
Task: "T034 src/components/terminal/TerminalLine.vue"
# depois: T035 (composable) → T036 (TerminalWindow) → T037 (CSS) → T038/T039 em paralelo
```

## Implementation Strategy

### MVP First

1. Setup + Foundational.
2. US1 (um projeto por linha): validar V1 e V2 com os 3 projetos atuais.
3. Parar e validar; o layout novo já é publicável.

### Incremental Delivery

1. US2 → US3 → US4: lista principal completa (todos P1).
2. US5 → US6: sub-partes. US7 em paralelo.
3. US8: terminais animados.
4. US9: ícones.
5. Polish: validação completa, peso, `DESIGN.md`.

## Notes

- Cada tarefa de dados usa os textos exatos do inventário do `data-model.md`; nada de conteúdo é
  inventado na implementação (Princípio I).
- Entre a US2 e a T045, a regra (7) "paridade" de `tests/unit/resume.data.spec.ts` (3 projetos, 3
  formações) falha de propósito; a T045 a substitui pelo inventário.
- O commit da emenda da constituição (v2.2.0) e os commits da feature dependem de pedido do autor.
