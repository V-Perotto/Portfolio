# Implementation Plan: Certificados em pastas por plataforma e a foto do 1º dia na Prime Control

**Branch**: `010-certificates-folders` (criada da `main`, em `9dd2d52`) | **Date**: 2026-10-20 |
**Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/010-certificates-folders/spec.md`

## Summary

Três pedidos do autor.

**(1) Seção Certificados.** Uma seção nova, `certificados`, entre Educação e Contato. Ela é uma janela de
editor `~/certificados` com **uma pasta por plataforma** (`dio/` 33, `prime-academy/` 20, `udemy/` 2,
`senai/` 1, `promenady/` 5). Os 61 certificados ficam em `resume.ts`, numa coleção nova,
`certificatePlatforms` (R2).

**(2) Árvore em acordeão.** O Branched Menu vendorizado ganha um modo exclusivo:
- uma pasta aberta por vez;
- a lista da pasta aberta rola dentro de 8 linhas (4 no celular), sem levar a página;
- as dobras fechadas ficam `inert`;
- a árvore reserva a altura da maior pasta, para a janela não mudar (R1).

Cada arquivo YAML traz os fatos impressos e a verificação conferida em 2026-10-20 (R3, R5):
- link na DIO, na Udemy e na Promenady;
- código como texto na Prime Academy, cujo domínio saiu do ar;
- nada no SENAI.

Abaixo das linhas vem a miniatura do certificado (Q1). Só a do arquivo aberto é baixada (R6), e ela abre
num **visualizador único** no `<body>`, que substitui o diálogo da 009 (R7). Maximizada, a janela mostra
só os cartões da pasta aberta (R9). Sem JS, os 61 cartões aparecem agrupados.

**(3) Foto do 1º dia.** A foto entra na Experiência da Prime Control, ao lado das linhas YAML (Q3), com
a legenda `# 1º dia na Prime Control · 15 OUT 2020` (R8).

**Imagens.** As imagens saem de um script novo, `tools/build-certificates.mjs`. Ele usa o `pdftoppm` e o
canvas do Chromium, e aplica as edições **antes** de reduzir (R4, R5):
- a tarja preta no SENAI: RG, CPF, data de nascimento, naturalidade e o código de identificação (C2);
- o desfoque dos 5 rostos de terceiros na foto (Q2, C1).

A origem fica fora do repositório. Também entram `certificados` como 12ª opção do `open` (R10) e a versão
`2.9.0`.

## Technical Context

**Language/Version**: TypeScript ~6.0.3, Vue 3.5, Node ≥ 22 no build (≥ 23.6 só para o script de imagens,
que lê o `resume.ts` com os tipos apagados pelo próprio Node; o ambiente tem o 24.22)

**Primary Dependencies**: as da 009 (`vue`, `@unhead/vue` 2, `@vueuse/core`, `motion-v`, `@lucide/vue`;
`vite-ssg`, `vite` 8.3.4, Tailwind 4; `@playwright/test` no desenvolvimento). **Nenhuma dependência nova
no `package.json`.** Para regerar as imagens: `pdftoppm` (poppler-utils, ferramenta do sistema), fora do
build.

**Storage**: N/A (dados estáticos em `src/data/resume.ts`; imagens estáticas em `public/`).

**Testing**: `vue-tsc`; Vitest 5 + `@vue/test-utils` + `happy-dom`; Playwright 1.64 + `@axe-core/playwright`
sobre o build (R13).

**Target Platform**: navegadores evergreen, desktop e celular; GitHub Pages em `/Portfolio/`.

**Project Type**: site estático pré-renderizado (SPA hidratada de página única).

**Performance Goals**:

- Visualizador: abrir e fechar ≤ 400 ms (animação de 200 ms), imagem inteira de 320 a 1920 px.
- `open certificados`: janela maximizada em ≤ 1 s (SC-009).
- Miniatura ≤ 40 KB, tamanho real ≤ 200 KB, foto 512 ≤ 60 KB, foto 1024 ≤ 150 KB (SC-011; estimados em
  16–38 KB, 37–160 KB, ~30 KB e ~79 KB, R4). Nenhuma imagem no carregamento inicial. Ao entrar na seção,
  no máximo 1 miniatura.
- HTML + CSS + JS iniciais ≤ linha de base + 10 KB gzip (estimado +7–10 KB, R11).

**Constraints**:

- Sem JS e na impressão: 61 cartões em 5 grupos, cada um uma vez; nenhum `<dialog>` (SC-004).
- Privacidade (FR-010, FR-020, SC-005):
  - nenhum dado de documento do SENAI no site nem no repositório;
  - tarjas aplicadas antes de gerar qualquer versão;
  - os rostos de terceiros desfocados;
  - as origens fora do repositório;
  - o nome da cidade nunca escrito.
- Janela de Certificados com altura fixa entre pastas e arquivos (SC-003). Janela de Experiência no
  máximo +2 linhas em 1366 e 1920 px (FR-017).
- Teclado e leitor de tela: pastas com `aria-expanded`, dobras fechadas `inert`, lista que rola com foco
  visível, visualizador modal com o foco devolvido; 0 violações axe; console sem erros do site.
- Sem rolagem horizontal a partir de 320 px; nenhum pedido novo a terceiros em tempo de execução.

**Scale/Scope**:

- Alterados:
  - `src/types/resume.ts`: `ImageFile`, `Photo`, `Certificate*`, `Experience.photo`,
    `Resume.certificatePlatforms`;
  - `src/data/resume.ts`: 5 plataformas, 61 certificados, a foto e o guia de edição;
  - `src/lib/editor-files.ts`: `groups`, `figure`, `certificateFolder`;
  - `src/lib/sections.ts`, `src/App.vue`;
  - `src/components/vendor/vue-bits/BranchedMenu.vue`: `exclusive`, `maxRows`, `inert`;
  - `src/components/terminal/EditorFrame.vue`: grupos, figura, slot `openGroup`, Esc com diálogo aberto;
  - `src/components/sections/ExperienceCard.vue`, `src/components/sections/ProjectScreenshot.vue`;
  - `tools/build-screenshots.mjs` (`stripMetadata` compartilhado);
  - `package.json` e lockfile (2.9.0).
- Novos:
  - `src/lib/certificates.ts`, `src/lib/image-viewer.ts`;
  - `src/components/base/ZoomFigure.vue`, `src/components/base/ImageViewer.vue`;
  - `src/components/sections/CertificatesSection.vue`, `src/components/sections/CertificateCard.vue`;
  - `tools/build-certificates.mjs`, `tools/lib/webp.mjs`;
  - `public/certificados/**` (122 WebP), `public/carreira/prime-control/*` (2 WebP).
- Testes: ~9 de unidade e componente ajustados e 3 novos; ~10 e2e ajustados e 2 novos
  (`certificates`, `privacy`).
- `DESIGN.md`, `README.md`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constituição **v3.1.0**.

| Princípio | Verificação | Pré-pesquisa | Pós-design |
|-----------|-------------|--------------|------------|
| I. Fidelidade ao Currículo | Cada certificado só com os fatos impressos (título como impresso, plataforma, data, carga horária, tipo e ementa quando impressos, verificação); a data de emissão no formato `DD MÊS AAAA` (é uma data, não um período); o período da Prime Control continua `OUT 2020 — OUT 2022`; a legenda da foto vem do pedido e da projeção. O PDF do currículo (2026-04-21) não tem certificações: pelo precedente da 002, o site está certo e o autor atualiza o PDF | PASS com pendência do autor (PDF) | PASS com pendência do autor (PDF) |
| II. Projetos Demonstráveis | Não se aplica (certificado não é projeto); links de verificação com `_blank` + `noopener noreferrer`, conferidos (R5) | PASS | PASS |
| III. Saída Estática | Tudo pré-renderizado; imagens estáticas do próprio site, geradas por `tools/` e versionadas (as origens ficam fora, por privacidade e porque `*.pdf` não é versionado); o visualizador e o acordeão só acrescentam comportamento; nenhuma dependência nova no `package.json` (`pdftoppm` só para regerar, R4); +≤ 10 KB gzip (R11) | PASS | PASS |
| IV. Acessibilidade e Desempenho | WebP sem metadados, `width`/`height`, `loading="lazy"` e só a miniatura aberta baixada; `alt` em todas as imagens; pastas como botões com `aria-expanded`; dobras fechadas `inert`; rolagem por teclado; `<dialog>` modal com foco devolvido, ✕ de 44 px, sem animação com movimento reduzido; sem rolagem horizontal; axe nos estados novos | PASS com ressalva herdada (Complexity Tracking) | PASS com ressalva herdada |
| V. Identidade Visual Coerente | Reaproveita a janela de editor, o Branched Menu (modo novo e documentado), as cores de sintaxe, o `card-date`, o visualizador da 009 (agora único) e o fundo da janela maximizada; os componentes novos (`ZoomFigure`, `ImageViewer`, `CertificateCard`, `CertificatesSection`) são justificados (R6, R7, R3); só tokens existentes, nenhuma cor nova | PASS | PASS |
| Restrições de Conteúdo e Tecnologia | "Documentos não são publicados": tarja preta no RG, CPF, data de nascimento, naturalidade e código do SENAI, nada disso em texto, e a origem fora do repositório (R5); rostos de terceiros desfocados (Q2); SEO inalterado | PASS | PASS |
| Fluxo de Trabalho e Verificação | Quickstart V1–V19: build de produção, desktop e celular, sem JS, impressão, movimento reduzido, console, axe, inspeção visual das tarjas e do desfoque, e os links da Udemy pelo autor | PASS | PASS |

### Justificativa de dependências e recursos (Princípio III)

| Item | Por quê | Peso no cliente |
|------|---------|-----------------|
| 61 certificados (dados no JS + 61 cartões e o 1º arquivo no HTML) | o pedido (R2, R3) | ~6 KB gzip |
| `CertificatesSection`, `CertificateCard`, grupos no `EditorFrame`, modo exclusivo do Branched Menu | FR-002 a FR-016 (R1, R3, R9) | ~1 KB gzip (JS) + ~0,4 KB (CSS) |
| `ZoomFigure` + visualizador único (no lugar do diálogo da 009) | FR-009, FR-018 (R6, R7) | ~0,5 KB gzip a mais |
| 122 WebP de certificados + 2 da foto | Q1, FR-017 (R4) | ~4,3 MB no repositório, **fora do carregamento inicial** (1 miniatura por arquivo aberto) |
| `tools/build-certificates.mjs` + `pdftoppm` | gerar as imagens com as edições, sem dependência no `package.json` (R4, R5) | — (só para regerar) |
| Versão `2.9.0` | 005 FR-016 | — |

## Project Structure

### Documentation (this feature)

```text
specs/010-certificates-folders/
├── plan.md                         # este arquivo
├── research.md                     # Phase 0: R1–R15
├── data-model.md                   # Phase 1: tipos, valores derivados, edições, validação, os 61 itens
├── quickstart.md                   # Phase 1: cenários V1–V19
├── contracts/
│   └── certificates-window.md      # DOM da janela, árvore, cartões, visualizador, foto, terminal
├── checklists/
│   └── requirements.md
└── tasks.md                        # /speckit-tasks
```

### Source Code (repository root)

```text
package.json, package-lock.json                      # version 2.9.0 (R12)

tools/
├── build-certificates.mjs                           # novo: PDF/PNG/JPEG → WebP com tarjas e desfoque (R4, R5)
├── build-screenshots.mjs                            # importa o stripMetadata compartilhado
└── lib/webp.mjs                                     # novo: stripMetadata (vinha do build-screenshots)

public/
├── certificados/<plataforma>/<AAAA-MM-DD>_<slug>-{640,<largura>}.webp   # gerados (122)
└── carreira/prime-control/integracao-2020-10-15-{512,1024}.webp       # gerados (2)

src/
├── types/resume.ts                                  # ImageFile, Photo, Certificate*, Experience.photo, Resume.certificatePlatforms
├── data/resume.ts                                   # certificatePlatforms (61), photo da Prime Control, guia de edição
├── lib/
│   ├── certificates.ts                              # novo: ordem, nome do arquivo, imagem, verificação, horas
│   ├── image-viewer.ts                              # novo: estado do visualizador único
│   ├── editor-files.ts                              # groups, figure, certificateFolder, foto no experienceFolder
│   └── sections.ts                                  # seção certificados, 12º alvo do open
├── App.vue                                          # CertificatesSection + ImageViewer
└── components/
    ├── base/ZoomFigure.vue                          # novo: figura com link e gatilho do visualizador
    ├── base/ImageViewer.vue                         # novo: o <dialog> da 009, único, no <body>
    ├── vendor/vue-bits/BranchedMenu.vue             # exclusive, maxRows, inert (documentado no cabeçalho)
    ├── terminal/EditorFrame.vue                     # grupos, figura, openGroup no slot, Esc com diálogo aberto
    └── sections/
        ├── CertificatesSection.vue                  # novo
        ├── CertificateCard.vue                      # novo
        ├── ExperienceCard.vue                       # foto
        └── ProjectScreenshot.vue                    # usa ZoomFigure + visualizador único

tests/
├── unit/        resume.data, editor-files, sections, terminal, version, certificates (novo), webp-metadata
├── component/   BranchedMenu, EditorWindow, ExperienceCard, ProjectScreenshot (ajustes); CertificateCard, ZoomFigure (novos); AccessGate (v2.9)
└── e2e/         certificates (novo), privacy (novo), editor-windows, open-command, no-js, a11y, reduced-motion,
                 weight, header, screenshot-viewer, session (ajustes)

DESIGN.md, README.md                                 # R14
```

**Structure Decision**: a mesma das features anteriores. O conteúdo fica só em `src/data/resume.ts`, os
componentes desenham o que os dados têm, e os assets são gerados por `tools/` e versionados. A
diferença: as origens das imagens ficam fora do repositório, por privacidade.

## Fases de implementação (resumo para o /speckit-tasks)

1. **Setup**:
   - linha de base de peso no build de `9dd2d52`;
   - versão 2.9.0;
   - `tools/lib/webp.mjs` e `tools/build-certificates.mjs`;
   - geração das 124 imagens, com a inspeção visual das tarjas e do desfoque **antes** de seguir.
2. **Base** (bloqueia as histórias):
   - tipos e dados (61 certificados, foto);
   - `certificates.ts`;
   - validação no `resume.data.spec.ts`;
   - visualizador único (`image-viewer.ts`, `ImageViewer`, `ZoomFigure`) e o `ProjectScreenshot`
     migrado, com a 009 sem regressão.
3. **US1 (P1, Certificados)**:
   - Branched Menu (`exclusive`, `maxRows`, `inert`);
   - `editor-files` (`groups`, `figure`, `certificateFolder`);
   - `EditorFrame` (grupos, miniatura só da aberta, `openGroup`, Esc com diálogo);
   - `CertificateCard` e `CertificatesSection`;
   - seção, menu e `find`;
   - testes de unidade e componente;
   - e2e `certificates` e `privacy`;
   - sem JS, impressão, a11y, movimento reduzido.
4. **US2 (P2, foto)**:
   - `experienceFolder` com figura e `ExperienceCard`;
   - a figura ao lado das linhas;
   - e2e da altura e da posição; inspeção do desfoque.
5. **US3 (P3, `open`)**: 12º alvo; testes de unidade e e2e.
6. **Polimento**:
   - peso, console, `DESIGN.md`, README e guia de edição;
   - quickstart (V18 com o autor);
   - suítes completas.

## Complexity Tracking

Nenhuma violação nova. Fica a ressalva herdada da 006:

| Violação | Por que é necessária | Alternativa mais simples rejeitada porque |
|----------|----------------------|-------------------------------------------|
| Princípio IV / WCAG 2.2.2: o Letter Glitch troca letras sozinho por mais de 5 s sem botão de pausa (herdado da 006, sem mudança) | Pedido do autor na 006; mitigações mantidas (some com "reduzir movimento", para fora da tela e com a aba oculta, decorativo). Esta feature não mexe no hero | Um botão de pausa contraria a decisão do autor na 001 |
