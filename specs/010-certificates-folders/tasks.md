---

description: "Task list for 010-certificates-folders"
---

# Tasks: Certificados em pastas por plataforma e a foto do 1º dia na Prime Control

**Input**: Design documents from `specs/010-certificates-folders/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md;
constituição v3.1.0

**Tests**: incluídos. O plano e o quickstart (V1–V19) pedem testes, e a suíte Vitest + Playwright é o
gate de verificação da constituição.

**Organization**: Setup e Foundational, depois uma fase por história, na ordem de prioridade:
- US1 (P1): os certificados por plataforma;
- US2 (P2): a foto do 1º dia na Prime Control;
- US3 (P3): o `open certificados`;
- e o polimento.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: história da spec (US1, US2, US3)

## Path Conventions

Projeto único: `src/`, `tests/`, `tools/` e `public/` na raiz (plan.md, Project Structure). A pasta de
origem das imagens (`~/Documents/certificados`, ou `CERTIFICADOS_DIR`) fica **fora do repositório** e
nunca é copiada para ele.

---

## Phase 1: Setup

**Purpose**: linha de base de peso, versão e a função de WebP compartilhada

- [X] T001 Medir a linha de base de peso da 009 (research R11). Rodar `npm run build` no estado atual
  (`9dd2d52`). Depois, somar o `gzip -9` de `dist/index.html` e dos `dist/assets/*.js|css` referenciados
  nele, sem os workers (o método do teste). Em `tests/e2e/weight.spec.ts`, no teste "HTML + CSS + JS
  iniciais":
  - trocar a linha de base `110149` pelo número medido (no `console.log`, no `expect` e no texto
    "sobre a 008" → "sobre a 009");
  - mudar o teto para `+ 10 * 1024` (SC-007);
  - título do teste: "≤ linha de base + 10 KB";
  - no comentário, acrescentar ao histórico a 009 (115.268 B medidos) e a feature 010 (linha de base,
    teto de +10 KB, research R11).

  Anotar o número em `specs/010-certificates-folders/research.md` (R11).
- [X] T002 Levar a versão a `2.9.0` (FR-024, research R12):
  - `npm version 2.9.0 --no-git-tag-version` (atualiza `package.json` e `package-lock.json`);
  - trocar `v2.8` por `v2.9` em `tests/unit/version.spec.ts` (título e expectativa),
    `tests/e2e/session.spec.ts` (texto da sessão e título do teste), `tests/component/AccessGate.spec.ts`
    e no comentário de `src/lib/boot.ts`;
  - no `README.md` (seção da versão): `v2.8` → `v2.9`, e acrescentar "2.9 a 010" à lista de versões.
- [X] T003 [P] Criar `tools/lib/webp.mjs` com a função `stripMetadata(webp)`, que hoje está em
  `tools/build-screenshots.mjs`, com o mesmo comentário (tira `ICCP`, `EXIF` e `XMP `, e as marcas deles
  no `VP8X`). Exportar também uma `webpSize(buffer)`, que lê largura e altura do cabeçalho
  (`VP8 `, `VP8L` e `VP8X`), para o script e para os testes. O `tools/build-screenshots.mjs` passa a
  importar o `stripMetadata` de lá. Rodar `node tools/build-screenshots.mjs` e conferir com `git status`
  que os dois WebP do DebianServer saem idênticos (sem diff).

**Checkpoint**: build verde; a versão é 2.9.0; o teste de peso usa a linha de base nova

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: os tipos, os dados, as imagens (com as edições de privacidade conferidas) e o visualizador
único, de que as três histórias dependem

**⚠️ CRITICAL**: nenhuma história começa antes desta fase. As imagens não seguem adiante sem a inspeção
visual da T008.

- [X] T004 Em `src/types/resume.ts` (data-model §1):
  - criar a interface `ImageFile` (`src`, `srcWidth`, `full`, `width`, `height`, `alt`, com os
    comentários do data-model);
  - `Screenshot` passa a `extends ImageFile` e fica só com `caption` e `captured: YearMonth`, sem mudar o
    formato;
  - criar `Photo extends ImageFile` com `caption` ("Legenda sem a data: '1º dia na Prime Control'") e
    `taken: YearMonthDay`;
  - `Experience` ganha `photo?: Photo`;
  - criar `CertificateVerification` (`{ url: string; code?: string } | { code: string; url?: never }`);
  - criar `Certificate`: `id` ("Slug curto e fixo, único na plataforma"), `title`, `issued: YearMonthDay`,
    `hours: number`, `kind?: 'bootcamp'`, `syllabus?: NonEmpty<string>` e `verification?:
    CertificateVerification` ("Ausente só quando publicar o código exporia dados pessoais (SENAI, C2)");
  - criar `CertificatePlatform` (`id`, `name`, `image: { width: number; height: number }`,
    `certificates: NonEmpty<Certificate>`);
  - `Resume` ganha `certificatePlatforms: CertificatePlatform[]`;
  - acrescentar ao comentário do topo do arquivo o bloco "Mudanças da 010".
- [X] T005 Em `src/data/resume.ts`:
  - acrescentar `certificatePlatforms`, depois de `education`, com as 5 plataformas na ordem `dio`,
    `prime-academy`, `udemy`, `senai`, `promenady` (`name`: DIO, Prime Academy, Udemy, SENAI,
    Promenady);
  - `image`: 1200 × 849, 1039 × 717, 1200 × 893, 1200 × 849 e 1200 × 849 (provisório; a T008 confirma);
  - os 61 certificados das tabelas de data-model §7, **na ordem das tabelas**: `id` = o slug do nome do
    arquivo; `issued` = a data; `title` exatamente como na tabela (com "–", "Continous" e "Rabbiit" como
    estão impressos); `hours`;
  - `kind: 'bootcamp'` nos 2 da DIO e `syllabus` (os 10 itens de `ementa`) no SENAI;
  - `verification`:
    - DIO: `{ url: 'https://hermes.dio.me/certificates/<CÓDIGO>.pdf' }`;
    - Prime Academy: `{ code: '<hash>' }`;
    - Udemy: `{ url: 'https://ude.my/UC-…' }`;
    - Promenady: `{ url: 'https://e-certificado.com/login/autenticar?c=<código>', code: '<código>' }`;
    - SENAI: sem o campo.
  - Cada item com `satisfies Certificate`, e cada plataforma com `satisfies CertificatePlatform`.
  - Na experiência `prime-control`, `photo` com os valores de data-model §4.
  - No guia de edição do topo, um item da 010: como acrescentar um certificado (slug ≤ 20 caracteres,
    data `AAAA-MM-DD`, título como impresso) e uma plataforma, rodar `node tools/build-certificates.mjs`
    (com a origem no manifesto do script), e a regra de privacidade (nenhum dado de documento; o código
    de um certificado que expõe documentos não é publicado).
  - Importar os tipos novos.
- [X] T006 [P] Criar `src/lib/certificates.ts` (data-model §2), com funções puras e o comentário de topo
  da feature 010:
  - `CERT_THUMB_WIDTH = 640`;
  - `byIssuedDesc(certs)`: data desc., estável, sem mutar;
  - `certificateFileName(cert)`: `AAAA-MM-DD_<id>.yml`;
  - `certificateImage(platform, cert): ImageFile`:
    - `src` = `certificados/<plataforma>/<issued>_<id>-640.webp`;
    - `full` = `…-<platform.image.width>.webp`;
    - `width`/`height` = `platform.image`;
    - `alt` = `Certificado da <name>: <title>, <hours> h, <DD/MM/AAAA>`;
  - `certificateCaption(platform, cert)`: `# <name> · <title> · <DD MÊS AAAA>`, para o visualizador;
  - `verificationText(v)`: o endereço sem `https://`, ou `e-certificado.com · <código>` quando há `url`
    e `code`, ou o código;
  - `formatHours(h)`: `4 h`.

  Testes em `tests/unit/certificates.spec.ts` (novo): os exemplos do data-model §2, empate no mesmo dia
  e o caso de cada tipo de verificação.
- [X] T007 Criar `tools/build-certificates.mjs` (research R4, R5; data-model §5), no estilo de
  `tools/build-screenshots.mjs`: comentário de topo com o propósito, o uso, a pasta de origem fora do
  repositório e a regra de privacidade.
  - Ler a lista com `await import('../src/data/resume.ts')` (Node ≥ 23.6; falhar com mensagem clara em
    versão menor).
  - Ter o manifesto `SOURCES`, de `<plataforma>/<id>` para o arquivo de origem (a coluna "Origem" de
    data-model §7), e falhar se um certificado dos dados não estiver no manifesto ou se sobrar entrada.
  - Ter `EDITS`: `senai/ia` com as 5 tarjas em pt e a foto com os 5 retângulos de desfoque em px, com os
    números de data-model §5.
  - Qualidade: miniaturas 0,80, mas 0,70 na Udemy; tamanho real 0,80.
  - Pasta: `CERTIFICADOS_DIR ?? ~/Documents/certificados`. Conferir `pdftoppm` no PATH e cada arquivo de
    origem, com mensagens claras.
  - Para cada certificado:
    - PDF: `pdftoppm -f 1 -l 1 -scale-to-x 1200 -scale-to-y -1 -png <origem> <tmp>`, num diretório de
      `os.tmpdir()`, apagado no fim;
    - PNG: o arquivo direto;
    - no Chromium do Playwright, desenhar no `<canvas>` na resolução de origem; aplicar as tarjas
      (`fillStyle = '#000'`, `fillRect`, coordenadas em pt × escala) **antes** de reduzir;
    - exportar o tamanho real (largura 1200, ou a original se for menor) e a miniatura de 640 px com
      `toBlob('image/webp', q)`, `imageSmoothingQuality = 'high'`, passando pelo `stripMetadata` de
      `tools/lib/webp.mjs`.
  - Foto: `DiaE-PrimeControl.jpeg`, desfoque de cada retângulo:
    - com `ctx.save(); ctx.beginPath(); ctx.rect(…); ctx.clip(); ctx.filter = 'blur(18px)';
      ctx.drawImage(…)`, em 3 passadas;
    - saídas 512 e 1024 em `public/carreira/prime-control/integracao-2020-10-15-{512,1024}.webp`.
  - Imprimir largura × altura e KB de cada arquivo e falhar (exit 1) acima dos tetos: miniatura 40 KB,
    tamanho real 200 KB, foto 512 60 KB, foto 1024 150 KB (SC-011).
  - Nunca gravar nada fora de `public/certificados/` e `public/carreira/prime-control/`.
- [X] T008 Rodar `node tools/build-certificates.mjs` e **conferir as imagens a olho, antes de seguir**:
  - o SENAI nas duas larguras: as 5 tarjas cobrem inteiras a cidade e a UF, o número do RG e a UF, o CPF,
    a data de nascimento e o código; o nome, o curso, a data de conclusão e a carga horária continuam
    legíveis;
  - a foto nas duas larguras: os 5 rostos de terceiros irreconhecíveis, e o do autor, na ponta direita
    da mesa, nítido;
  - 1 certificado de cada plataforma: inteiro, legível no tamanho real, sem corte.

  Ajustar retângulos e desfoque no manifesto até passar. Conferir as alturas geradas dos PDFs e corrigir
  o `image` das plataformas em `src/data/resume.ts`, se não for 849 ou 893. Anotar os tamanhos medidos
  (mín./máx. por plataforma) em research.md (R4). Nenhum arquivo de origem, PNG intermediário ou imagem
  sem edição pode aparecer no `git status`.
- [X] T009 [P] Em `tests/unit/resume.data.spec.ts`, as regras de data-model §6:
  1. as 5 plataformas na ordem, com ids em kebab-case e únicos;
  2. 61 certificados (33 / 20 / 2 / 1 / 5), `issued` em `^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$`
     e não futuro, `hours` inteiro > 0, `title` não vazio;
  3. `id` em kebab-case, ≤ 20 caracteres, único na plataforma, e `AAAA-MM-DD_<id>.yml` ≤ 35;
  4. dados já em ordem de data desc. em cada plataforma;
  5. `verification.url` com `https://`, e só o SENAI sem `verification`;
  6. as duas imagens de cada certificado e da foto existem em `public/`, e as dimensões lidas pelo
     `webpSize` (`tools/lib/webp.mjs`, lido com `node:fs`) batem: 640 e a altura proporcional (±1) na
     miniatura, `platform.image` no tamanho real, 512 × 384 e 1024 × 768 na foto;
  7. privacidade: nenhum texto de `certificatePlatforms` nem da foto casa com
     `\d{3}\.?\d{3}\.?\d{3}-?\d{2}`, `\bRG\b`, `natural de` ou `nascid`;
  8. só a `prime-control` tem `photo`, com `taken` válido e `alt` e `caption` não vazios.

  A regra (3) "ids únicos" ganha `certificatePlatforms`. Teste novo em `tests/unit/webp-metadata.spec.ts`:
  todo `.webp` de `public/` (glob) não tem `ICCP`, `EXIF` nem `XMP ` (V16).
- [X] T010 Criar o visualizador único (research R7; contrato §5):
  - `src/lib/image-viewer.ts`: estado `shallowRef<{ image: ImageFile; caption: string; trigger:
    HTMLElement } | null>` e `openViewer(image, caption, trigger)`;
  - `src/components/base/ImageViewer.vue`: o `<dialog class="shot-viewer">` que hoje está em
    `src/components/sections/ProjectScreenshot.vue`, com o mesmo CSS e a mesma animação (200 ms via
    `canAnimate()`, sem animação com movimento reduzido). Ele:
    - fica dentro de `<Teleport v-if="hydrated" to="body">`, fora do `#app`;
    - tem a imagem `.shot-full` (`max-width: min(<largura>px, 100%)`, no lugar do `1396px` fixo), a
      legenda `#image-viewer-caption` e o ✕ `aria-label="Fechar a imagem"`;
    - ao abrir, guarda se o `<html>` já tinha `window-maximized` e só tira a classe ao fechar se foi ele
      que a pôs;
    - guarda o `scrollY`, como hoje;
    - devolve o foco ao `trigger` com `preventScroll`.

  Montar `<ImageViewer />` uma vez em `src/App.vue`. No `src/components/terminal/EditorFrame.vue`, o
  `onKeydown` volta sem fazer nada quando `document.querySelector('dialog[open]')` existe (Esc e Tab são
  do visualizador).
- [X] T011 Criar `src/components/base/ZoomFigure.vue` (research R6):
  - props: `image: ImageFile`, `caption?: string` (a legenda visível, `# …`), `viewerCaption: string`,
    `sizes: string`, `openLabel: string` e `load = true`;
  - desenha `<figure class="zoom-figure">` com `<a class="shot-link" :href="full" target="_blank"
    rel="noopener noreferrer" :style="{ aspectRatio: \`${width} / ${height}\` }">`;
  - quando `load`, o `<img>` com `loading="lazy"` **antes** do `src`, `decoding="async"`,
    `width`/`height`, `alt`, `sizes` e `srcset="<src> <srcWidth>w, <full> <width>w"`;
  - o `<span class="sr-only">{{ openLabel }}</span>` e a legenda `<figcaption class="shot-caption">`,
    quando há `caption`;
  - o clique sem modificador (e Enter) chama `openViewer` e `preventDefault()`, e o clique com
    Ctrl/⌘/Shift/Alt ou com outro botão segue o link;
  - o CSS do `.shot-link` e do `.shot-caption` vem do `ProjectScreenshot`.
- [X] T012 Migrar `src/components/sections/ProjectScreenshot.vue` para `ZoomFigure`, com
  `class="project-shot"`:
  - legenda `# painel do CasaOS do DebianServer · OUT 2026`;
  - `openLabel` `(abre a captura em tamanho real)`;
  - os `sizes` de hoje;
  - sem o `<dialog>` próprio.

  O DOM e as classes que os testes da 009 usam (`.project-shot`, `.shot-link`, `.project-shot img`,
  `.shot-caption`, `.shot-close`) ficam. Atualizar o comentário do topo (feature 010: visualizador
  único).
- [X] T013 [P] Testes do visualizador:
  - `tests/component/ZoomFigure.spec.ts` (novo):
    - link, `srcset`, `sizes`, proporção e aviso;
    - `load=false` sem `<img>`;
    - clique abre o visualizador, e Ctrl+clique não;
    - o foco volta ao link ao fechar;
  - `tests/component/ProjectScreenshot.spec.ts`: montar o `ImageViewer` junto, com `attachTo:
    document.body`, nos testes do diálogo, e trocar a expectativa do id da legenda de
    `shot-viewer-caption-demo` para `image-viewer-caption` (analyze I1);
  - `tests/e2e/screenshot-viewer.spec.ts`: deve passar sem mudança de expectativa. Se um seletor mudar,
    ajustar só o seletor e conferir que o diálogo é filho do `<body>`.

- [X] T014 Em `src/components/terminal/EditorFrame.vue`, a figura no arquivo (research R6; analyze I2: base
  da US1 e da US2):
  - em `src/lib/editor-files.ts`, a interface `EditorFigure` (`placement: 'below' | 'side'`, `caption?`,
    `openLabel`, `sizes`, `viewerCaption`, mais os campos de `ImageFile`) e `EditorFile.figure?`;
  - `visited` (um `Set` reativo): o arquivo aberto e os já abertos;
  - no `<article>`, depois do `<ol>`, `<ZoomFigure v-if="file.figure" class="editor-figure"
    :data-placement="file.figure.placement" :load="file.id === activeId || visited.has(file.id)" …>`;
  - CSS do `placement 'below'`: `margin-top`, `width: min(100%, 20rem)` e
    `margin-left: calc(3.2ch + var(--spacing) * 3)`, alinhado ao código.

  Conferir que as 4 janelas de hoje renderizam o mesmo HTML (nenhum arquivo tem figura ainda).

**Checkpoint**: `npm run typecheck` e `npm test` verdes; o DebianServer abre a captura como na 009; as
124 imagens existem, cabem nos tetos e passaram pela inspeção da T008; a página ainda não mostra os
certificados

---

## Phase 3: User Story 1 - Ver os certificados por plataforma (Priority: P1) 🎯 MVP

**Goal**: a seção Certificados com a janela `~/certificados`, 5 pastas em acordeão, a lista que rola
dentro da pasta, o arquivo YAML com a miniatura, os cartões e o visualizador.

**Independent Test**: abrir cada pasta e percorrer os certificados (mouse, toque, teclado). Conferir os
fatos contra o data-model, a rolagem só dentro da pasta, a altura fixa, a miniatura preguiçosa, o
visualizador, a janela maximizada e o SENAI com as tarjas. Repetir em 320 px, sem JS, com movimento
reduzido e na impressão.

### Implementation for User Story 1

- [X] T015 [US1] Em `src/components/vendor/vue-bits/BranchedMenu.vue` (research R1; contrato §2),
  acrescentar ao cabeçalho de "Modificações locais" um bloco "feature 010":
  - prop `exclusive?: boolean` (padrão `false`): o `toggle(i)` com `exclusive` não faz nada se `i` já
    está aberta, e senão deixa `open = {i}`. O evento `toggle` continua.
  - prop `maxRows?: number`: com `exclusive`, o `navStyle` ganha `--bm-max-rows` (= `maxRows`),
    `--bm-sections` (= `items.length`) e `--bm-largest` (= o maior `children.length`). O CSS da seção
    aberta põe `max-height: calc(var(--bm-row) * var(--bm-max-rows) + 12px)`, `overflow-y: auto` e
    `overscroll-behavior: contain` no `.bm-fold-inner`. O `nav` ganha `min-height: calc(var(--bm-sections) *
    (var(--bm-font) * 1.2 + 19px) + min(var(--bm-max-rows), var(--bm-largest)) * var(--bm-row) + 12px)`
    (classe `bm-exclusive`). Conferir na T025 que bate com os 36 px medidos por cabeça e por linha.
  - `:inert="item.children && !open.has(i) ? true : undefined"` no `.bm-fold`.

  Sem `exclusive` e `maxRows`, o HTML e o comportamento são os de hoje, exceto o `inert` na dobra
  fechada.
- [X] T016 [P] [US1] Em `tests/component/BranchedMenu.spec.ts`:
  - `exclusive`: abrir a 2ª seção fecha a 1ª; clicar na aberta não a fecha; `toggle` emitido;
  - `maxRows`: as variáveis `--bm-max-rows`, `--bm-sections` e `--bm-largest` no `nav`;
  - `inert` só na dobra fechada;
  - sem as props, o comportamento antigo (abrir e fechar a mesma seção).
- [X] T017 [US1] Em `src/lib/editor-files.ts` (data-model §3; research R3):
  - interface `EditorGroup` (a `EditorFigure` vem da T014);
  - `EditorFile` ganha `group?`, e `EditorFolder` ganha `groups?`;
  - `certificateFolder(platforms)`:
    - `label 'certificados'`, `path '~/certificados'`;
    - um grupo por plataforma, na ordem dos dados, com `files` em `byIssuedDesc`;
    - arquivo com id `<plataforma>/<id>`, nome `certificateFileName`, caminho
      `~/certificados/<plataforma>/<nome>` e posição na pasta;
    - linhas: `header` (`# n / total · <title>`), `curso`, `plataforma`, `tipo` (só com `kind`),
      `emitido` (`formatDate`, tipo `date`), `carga_horaria` (`formatHours`), `ementa` (a `list()` de hoje,
      só com `syllabus`) e a verificação: `link('verificacao', verificationText(v), v.url)`, ou
      `pair('codigo', v.code)`, ou a linha de comentário `# código omitido por privacidade`;
    - `figure`: `certificateImage`, `placement 'below'`, `openLabel '(abre o certificado em tamanho
      real)'`, `sizes '(max-width: 760px) calc(100vw - 6rem), 20rem'` e `viewerCaption`
      `certificateCaption`;
    - `files` do folder = todos os grupos em sequência.

  Atualizar o comentário do topo. Testes em `tests/unit/editor-files.spec.ts`:
  - 5 grupos (33/20/2/1/5) e posições `1 / 33`;
  - o `fileText` do 1º da DIO como no contrato §3;
  - Prime com `codigo:`, SENAI com `ementa:` e o comentário, Promenady com o texto do link;
  - a ordem estável no mesmo dia (DIO 01/07/2020);
  - o `figure` e o nome ≤ 35 caracteres.
- [X] T018 [US1] Em `src/components/terminal/EditorFrame.vue` (research R1, R6, R9; contrato §2 a §4):
  - `tree` com `folder.groups`: uma seção por grupo (`label: '<g.label>/'`, `value: g.label`); sem
    grupos, a de hoje;
  - passar `exclusive` e `:max-rows="8"` só com grupos; `@toggle` (aberta) chama `select` do 1º arquivo
    do grupo e volta `scrollTop` da lista de cartões a 0;
  - CSS: `@media (max-width: 760px) { .editor-tree :deep(.bm-exclusive) { --bm-max-rows: 4 } }` e, na
    maximizada, `min-height: auto` no menu;
  - o slot `cards` passa `:open-group="maximized && folder.groups ? openGroupLabel : null"`.

  Conferir que as outras 4 janelas renderizam o mesmo HTML de antes (sem grupos nem figura).
- [X] T019 [US1] Criar `src/components/sections/CertificateCard.vue` (research R3; contrato §4), com
  `BaseCard` ou o mesmo padrão do `ChallengeCard`, só tokens:
  - `// <DD MÊS AAAA> · <N> h` (`card-date mono`);
  - `<h4 class="cert-title">`;
  - `<p class="cert-meta mono"><plataforma>[ · bootcamp]</p>`;
  - a ementa (texto, separada por vírgulas), quando houver;
  - `<p class="cert-links mono">` com a verificação (`ExternalLink`, ou o código como texto, ou
    `código omitido por privacidade`) e o `<a class="cert-view">ver certificado<span class="sr-only">
    <title></span></a>` para `full`, que abre o visualizador sem modificador e em nova aba com
    modificador ou sem JS.

  Testes em `tests/component/CertificateCard.spec.ts` (novo): os 3 tipos de verificação, o bootcamp, o
  SENAI e o link `ver certificado` (abre o visualizador; com Ctrl, não).
- [X] T020 [US1] Criar `src/components/sections/CertificatesSection.vue` (contrato §1, §4):
  - `SectionShell id="certificados" title="certificados" lead="ls -R ~/certificados"`;
  - `EditorWindow v-reveal :folder="certificateFolder(platforms)" window-id="certificados"`;
  - no slot `#cards="{ openGroup }"`, uma `<section class="cert-group" :data-card-group="p.id"
    :hidden="openGroup !== null && openGroup !== p.id">` por plataforma, com `<h3
    class="cert-group-title">{{ p.name }} · {{ n }} certificados</h3>` e
    `<ol class="cert-list"><li :data-card-id="<p.id>/<c.id>"><CertificateCard …/></li></ol>`;
  - comentário de topo da feature 010; CSS só com tokens.
- [X] T021 [US1] Em `src/lib/sections.ts`:
  - `SectionId` ganha `'certificados'`;
  - `ORDER` passa a `['sobre', 'experiencia', 'skills', 'projetos', 'educacao', 'certificados',
    'contato']`;
  - `hasContent.certificados = resume.certificatePlatforms.length > 0`.

  Em `src/App.vue`, `<CertificatesSection v-if="shows('certificados')"
  :platforms="resume.certificatePlatforms" />` depois da Educação. Em `tests/unit/sections.spec.ts`:
  7 seções e a seção some sem plataformas. Conferir o `AppNav` com 7 itens em 841 px e 1366 px (sem
  rolagem horizontal) e no menu compacto.
- [X] T022 [P] [US1] Em `tests/component/EditorWindow.spec.ts`:
  - uma pasta com `groups`: 5 seções na árvore, só a 1ª aberta, `1 / 33`;
  - abrir a 2ª pasta ativa o 1º arquivo dela;
  - o `<img>` só no arquivo aberto;
  - o slot recebe `openGroup` nulo fora da janela maximizada.
- [X] T023 [US1] Criar `tests/e2e/certificates.spec.ts` (quickstart V2 a V8, contrato §2 a §5):
  - estrutura em 320, 768, 1366 e 1920 px: `code ~/certificados`, 5 pastas, a DIO aberta com 33,
    `1 / 33`, sem rolagem horizontal da página (analyze C2);
  - acordeão com clique, Enter e Espaço, e com toque em 390 px (`hasTouch`; analyze C3);
  - clicar na aberta não fecha;
  - cada pasta abre o 1º arquivo (`1 / 20`, `1 / 2`, `1 / 1`, `1 / 5`);
  - rolagem: roda do mouse sobre a lista da DIO até o fim, com `scrollTop` > 0 e `window.scrollY`
    igual; Tab até o 33º, que fica à vista;
  - 8 linhas visíveis em 1366 px e 4 em 390 px;
  - altura do `.editor-frame` igual (±0,5 px) nas 5 pastas e em 3 arquivos de cada, em 1366 e 390 px
    (SC-003);
  - fatos de 1 arquivo por plataforma (contrato §3), com links `target="_blank"` e `rel="noopener
    noreferrer"`;
  - miniatura: ao entrar na seção, no máximo 1 pedido `certificados/*.webp`; trocar de arquivo pede só a
    nova;
  - visualizador: abre com clique e com Enter; imagem inteira em 320, 768, 1366 e 1920 px; Esc, ✕ e
    fundo fecham; foco de volta; ≤ 400 ms;
  - maximizada: só o grupo da pasta aberta; abrir a Prime Academy mostra 20 cartões; escolher um arquivo
    rola até o cartão; `ver certificado` abre o visualizador por cima; o 1º Esc fecha só o
    visualizador (janela ainda maximizada, `html.window-maximized`) e o 2º restaura;
  - 320 px sem rolagem horizontal, com reticências na árvore;
  - minimizar e fechar até o ícone de pasta de código `~/certificados`; minimizada, reabre completa;
    fechada, digita `code ~/certificados` de novo sem piscar (FR-016, como o teste da Educação da 008;
    analyze C1).
- [X] T024 [P] [US1] Criar `tests/e2e/privacy.spec.ts` (V10, SC-005):
  - para `certificados/senai/2020-12-30_ia-1200.webp` e `-640.webp`, desenhar num canvas da página e
    conferir que a média de cada um dos 5 retângulos de data-model §5 (convertidos da escala de pt para
    a da imagem, com 2 px de folga para dentro) é < 16 em R, G e B;
  - varrer `dist/index.html` e os `dist/assets/*.js` contra `\d{3}\.\d{3}\.\d{3}-\d{2}`, `\d{11}` junto de
    "CPF", `natural de` e `nascid`: zero ocorrências;
  - o `alt` e a legenda do SENAI não têm código nem número.

  Não escrever nenhum valor real dos documentos nem o nome da cidade no teste.
- [X] T025 [US1] Testes transversais da US1:
  - `tests/e2e/no-js.spec.ts`: teste novo "sem JS, feature 010" com 5 grupos (`DIO · 33 certificados`…),
    61 cartões, cada título uma vez, `ver certificado` como link `_blank` para a imagem e nenhum
    `<dialog>`;
  - `tests/e2e/editor-windows.spec.ts`: os testes "sem JavaScript" e "impressão" passam de quatro para
    cinco janelas;
  - `tests/e2e/a11y.spec.ts`: um teste novo no bloco da 006 com axe na janela de Certificados com cada
    pasta aberta, maximizada (Prime Academy), com o visualizador aberto e minimizada, e console sem erros
    do site;
  - `tests/e2e/reduced-motion.spec.ts`: a dobra troca sem transição, e o visualizador abre sem animação;
  - `tests/e2e/header.spec.ts`: os 7 itens do menu, com `~/certificados` antes de `~/contato`;
  - `tests/e2e/weight.spec.ts`: nenhum `.webp` pedido no hero (o teste de "nenhuma requisição a
    terceiros" já cobre o resto).

  Rodar `npm run test:e2e` e corrigir até ficar verde. Medir aqui a reserva de altura do T015 (36 px por
  cabeça e por linha) e ajustar a fórmula se a altura variar.

**Checkpoint**: a US1 funciona sozinha (MVP): a seção Certificados completa, com as tarjas conferidas

---

## Phase 4: User Story 2 - Ver o 1º dia na Prime Control junto da experiência (Priority: P2)

**Goal**: a foto da integração ao lado das linhas do arquivo da Prime Control, com a data, no cartão e no
visualizador.

**Independent Test**: abrir `2020-10_prime-control.yml` em 1366, 1920, 768 e 390 px. Conferir a posição,
a legenda, o `alt`, o visualizador, a altura da janela (+≤ 2 linhas) e o desfoque. Repetir sem JS e na
impressão.

### Implementation for User Story 2

- [X] T026 [US2] Em `src/lib/editor-files.ts`, o `experienceFolder` põe `figure` no arquivo de uma
  experiência com `photo` (research R8):
  - campos da foto;
  - `placement 'side'`, `caption` `# <caption> · <formatDate(taken)>`, `viewerCaption` igual,
    `openLabel '(abre a foto em tamanho real)'`;
  - `sizes '(min-width: 900px) 16rem, (max-width: 760px) calc(100vw - 6rem), 20rem'`.

  As linhas não mudam. Testes em `tests/unit/editor-files.spec.ts`: só a Prime Control tem figura,
  com a legenda `# 1º dia na Prime Control · 15 OUT 2020`, e o `fileText` dela é o de antes.
- [X] T027 [US2] Em `src/components/terminal/EditorFrame.vue`, o CSS do `placement 'side'`:
  - o `<article>` com figura lateral ganha a classe `has-figure-side`;
  - `@media (min-width: 900px)`: `display: grid; grid-template-columns: minmax(0, 1fr) clamp(10rem, 36%,
    16rem); column-gap: calc(var(--spacing) * 4); align-items: start`, com a figura na 2ª coluna e
    `padding-right` do painel;
  - abaixo de 900 px: a figura embaixo, `width: min(100%, 20rem)`, alinhada ao código.

  Medir no build a janela de Experiência em 1366 e 1920 px (≤ 453 + 46 px) e igual nos 5 arquivos.
- [X] T028 [US2] Em `src/components/sections/ExperienceCard.vue`, depois dos chips: `<ZoomFigure
  v-if="experience.photo" class="exp-photo" …>` com a mesma legenda e os mesmos textos, `sizes
  '(max-width: 760px) calc(100vw - 6rem), 20rem'` e `width: min(100%, 20rem)`. Testes em
  `tests/component/ExperienceCard.spec.ts`: com `photo`, a figura, a legenda e o `alt`; sem `photo`, o
  HTML de antes.
- [X] T029 [US2] Em `tests/e2e/editor-windows.spec.ts`, teste novo "foto do 1º dia na Prime Control"
  (V11, V17):
  - em 1366 e 1920 px, o arquivo 5 tem a figura à direita das linhas (o `left` da figura é maior que o
    `right` da última linha de código) com a legenda e o período `OUT 2020 — OUT 2022`;
  - a altura da janela é ≤ 453 + 46 px e igual nos 5 arquivos;
  - em 768 e 390 px, a figura fica abaixo das linhas;
  - clique abre o visualizador com a legenda;
  - maximizada, o cartão da Prime Control tem a figura;
  - nenhuma outra experiência tem figura.

  Em `tests/e2e/no-js.spec.ts`: o cartão da Prime Control com a foto como link para o tamanho real. Em
  `tests/e2e/a11y.spec.ts`, no teste das janelas de editor: axe com o arquivo da Prime Control aberto
  e com o visualizador aberto na foto (SC-008; analyze C5).
  Mostrar ao autor a captura da foto em tamanho real (quickstart V11, desfoque).

**Checkpoint**: US1 e US2 funcionam juntas; as outras experiências estão como na 009

---

## Phase 5: User Story 3 - Abrir os certificados pelo terminal da dock (Priority: P3)

**Goal**: `open certificados` maximiza a janela, como as outras janelas de editor.

**Independent Test**: no terminal da dock, rodar `open certificados` com a janela aberta, minimizada e
fechada. Conferir a saída, o `help`, o Tab e o foco.

### Implementation for User Story 3

- [X] T030 [US3] Em `src/lib/sections.ts`, `openTargets` ganha
  `...(resume.certificatePlatforms.length ? [editorTarget('certificados', '~/certificados')] : [])`
  depois de `educacao`, e o comentário do topo cita a feature 010. Testes:
  - `tests/unit/sections.spec.ts`: 12 alvos, o último `certificados` (`maximize`, apelido
    `certificados`), e sem plataformas não há o alvo;
  - `tests/unit/terminal.spec.ts`: a linha do `help` "projetos abrem; experiencia, challenges,
    comunitario, educacao e certificados abrem maximizados", a lista de 12 opções, `open cert` + Tab
    completando para `open certificados` e `find certificados`.
- [X] T031 [US3] Em `tests/e2e/open-command.spec.ts` (V12):
  - o teste "as 11 opções" passa a 12, com `certificados` com a janela aberta, minimizada e fechada, em
    1366 × 768 e 390 × 844, em ≤ 1 s, maximizada (≥ 90% / ≥ 95% da tela), com o terminal minimizado e o
    foco dentro;
  - o teste "help e Tab do open" ganha `open cert`;
  - os testes do `open` das janelas de editor cobrem `certificados`;
  - `find certificados` leva a página até `#certificados` (FR-023; analyze C5).

**Checkpoint**: as três histórias funcionam

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T032 [P] `DESIGN.md` (research R14):
  - a árvore com várias pastas: acordeão, uma aberta por vez, lista com até 8 linhas (4 no celular)
    que rola por dentro, dobras fechadas `inert`, altura reservada;
  - o cartão de certificado e o grupo por plataforma;
  - a miniatura abaixo das linhas;
  - a foto ao lado das linhas;
  - o visualizador único no `<body>`;
  - a regra de privacidade (tarja preta aplicada na imagem, nunca por CSS; rostos de terceiros
    desfocados).
- [X] T033 [P] `README.md`:
  - a seção Certificados;
  - o `tools/build-certificates.mjs` (uso, `CERTIFICADOS_DIR`, `pdftoppm`/poppler-utils, Node ≥ 23.6, a
    pasta de origem fora do repositório) e o `tools/lib/webp.mjs`;
  - a lista de scripts de `tools/`.
- [X] T034 Medir o peso (V15): rodar o `weight.spec.ts` e anotar em research.md (R11) o total, a
  diferença sobre a linha de base da T001 e a divisão HTML/JS/CSS. Se passar de +10 KB, aplicar o corte
  do R11 (HTML dos cartões) antes de rever o teto, e registrar a decisão. Conferir, na saída do
  `build-certificates`, os tetos da SC-011.
- [X] T035 Verificação da constituição (Fluxo de Trabalho): `npm run typecheck`, `npm test`,
  `npm run build` e `npm run test:e2e` verdes. Depois:
  - capturas do build servido (Playwright) em 1366 e 390 px da seção Certificados (DIO, SENAI,
    maximizada) e da Experiência com a foto;
  - a mesma página sem JS e com `prefers-reduced-motion: reduce`;
  - o console sem erros;
  - `git status` sem nenhum PDF, PNG de origem, JPEG da foto ou imagem sem edição;
  - conferir de novo os links (SC-010; analyze C4): o `content-length` dos 33
    `https://hermes.dio.me/certificates/<CÓDIGO>.pdf` igual ao tamanho do PDF de origem, e os 5
    `https://e-certificado.com/login/autenticar?c=<código>` com "Certificado Autêntico". Anotar a data em
    research.md (R5).

  Marcar no quickstart o que passou.
- [X] T036 Pedir ao autor o V18 (abrir os 2 links da Udemy num navegador comum). Se algum não abrir,
  trocar a `verification` dele por `{ code: 'UC-…' }` em `src/data/resume.ts` e anotar em research.md
  (R5).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependência. A T003 é independente da T001 e da T002.
- **Foundational (Phase 2)**: depois do Setup.
  - T004 → T005 → T007 → T008 (as imagens dependem dos dados e passam pela inspeção).
  - A T006 depende da T004 (e dos dados, para os testes).
  - A T009 depende da T005, da T006 e da T008.
  - T010 → T011 → T012 → T013; a T014 depende da T011.
- **US1 (Phase 3)**: depois da Foundational.
  - T015 → T016.
  - T017 depende da T006.
  - A T018 depende da T015 e da T017.
  - T019 → T020 → T021.
  - A T022 depende da T018.
  - A T023, a T024 e a T025 dependem da T021.
- **US2 (Phase 4)**: depois da Foundational (a figura no `EditorFrame` é a T014). Independente da US1.
  T026 → T027 → T028 → T029.
- **US3 (Phase 5)**: depois da T021 (a seção existe). T030 → T031.
- **Polish (Phase 6)**: depois das histórias. A T032 e a T033 em paralelo; T034 → T035; a T036 a
  qualquer momento depois da T005.

### Parallel Opportunities

- Setup: a T003 em paralelo com a T001 e a T002.
- Foundational: a T006 em paralelo com a T007; a T013 (testes) em paralelo com a T009.
- US1: a T016 junto com a T017; a T022 junto com a T019; a T024 junto com a T023.
- Polish: a T032 junto com a T033.

### Parallel Example: User Story 1

```text
Depois da T015 e da T017:
  T016 [P] [US1] testes do BranchedMenu (exclusive, maxRows, inert)
  T022 [P] [US1] testes do EditorWindow com grupos
Depois da T021:
  T023 [US1] e2e certificates
  T024 [P] [US1] e2e privacy
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 e Phase 2, incluindo a inspeção visual da T008 (sem ela, nenhuma imagem segue adiante).
2. Phase 3 (US1): a seção Certificados completa.
3. **Parar e validar**: quickstart V1–V10, V13–V16.

### Incremental Delivery

1. Setup + Foundational: dados, imagens e visualizador único, com a 009 sem regressão.
2. US1: a seção Certificados (MVP).
3. US2: a foto na Experiência.
4. US3: o `open certificados`.
5. Polimento: documentação, peso, verificação completa e o V18 com o autor.
