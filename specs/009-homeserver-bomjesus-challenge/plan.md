# Implementation Plan: Challenge Bom Jesus (FAE) e o side-project DebianServer

**Branch**: `009-homeserver-bomjesus-challenge` (criado a partir da `main`, em `965f4ee`) |
**Date**: 2026-10-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/009-homeserver-bomjesus-challenge/spec.md`

## Summary

Dois pedidos do autor. **(1)** Um challenge novo, **Bom Jesus (FAE)** (gestão acadêmica de alunos e
professores; Java, Spring Boot, Vue 3, TypeScript, H2, Docker), é só um item de dados: a janela de
Challenges da 006 gera o arquivo `2026-10_bom-jesus-fae.yml` (o 1º de 8) e o cartão (R2). **(2)** Um
side-project, **DebianServer — Meu homeserver**, entra em 2º lugar em Projetos como janela de projeto:
selo `EM PRODUÇÃO`, `desde = 01 OUT 2026`, tipo `side-project`, linhas `hardware`/`sistema`/`acesso`, 6 chips
de stack, a lista dos 6 apps com ícone e explicação, e, no lugar dos links, a **captura datada do painel do
CasaOS** como evidência, a 4ª exceção do Princípio II, emendada para v3.1.0 (`cbf86ae`). O tipo `Project`
ganha a variante `side-project` com `screenshot` e três campos opcionais (`inProductionSince`, `details`,
`apps`) (R1, R8). A captura sai de um script novo, `tools/build-screenshots.mjs` (Chromium do Playwright,
canvas → WebP de 800 e 1396 px, sem metadados) (R4), é mostrada num `<figure>` preguiçoso com `srcset`
(R5), e abre em tamanho real num `<dialog>` modal nativo, só no cliente, que reaproveita a classe
`window-maximized` da janela maximizada (R7, clarify). Os 13 nomes de tecnologia novos ganham ícone; o
simple-icons (CC0, desenhado para uma cor só) entra como fonte, entre o vectorlogo.zone e o
dashboard-icons (R3). O `open` ganha `debianserver` sozinho, pelos dados (R9). Versão `2.8.0`.

## Technical Context

**Language/Version**: TypeScript ~6.0.3, Vue 3.5, Node ≥ 22 no build

**Primary Dependencies**: as da 008 (`vue`, `@unhead/vue` 2, `@vueuse/core`, `motion-v`, `@lucide/vue`;
`vite-ssg`, `vite` 8.3.4, Tailwind 4; `@playwright/test` no desenvolvimento). **Nenhuma dependência
nova.** As fontes de ícones (devicon, vectorlogo.zone, simple-icons, dashboard-icons) só são baixadas pelo
`tools/build-tech-icons.mjs`, com versões fixas, como hoje.

**Storage**: N/A (dados estáticos em `src/data/resume.ts`; imagens estáticas em `public/`).

**Testing**: `vue-tsc`; Vitest 5 + `@vue/test-utils` + `happy-dom` (`resume.data`, `editor-files`,
`sections`, `terminal`, `tech-icons`, `version`, `ProjectCard`, `ProjectScreenshot` novo); Playwright
1.64 + `@axe-core/playwright` sobre o build (R13).

**Target Platform**: navegadores evergreen, desktop e celular; GitHub Pages em `/Portfolio/`.

**Project Type**: site estático pré-renderizado (SPA hidratada de página única).

**Performance Goals**:

- Visualizador: abrir e fechar ≤ 400 ms (animação de 200 ms), imagem inteira de 320 a 1920 px (SC-009).
- Captura: 800 px ≤ 120 KB, 1396 px ≤ 300 KB (estimado 16–22 KB e 34–60 KB, R4); fora do carregamento
  inicial; deslocamento de layout 0 (SC-003).
- `open debianserver`: janela aberta e à vista em ≤ 1 s (SC-007).
- HTML + CSS + JS iniciais ≤ linha de base da 008 + 6 KB gzip (estimado +2,5–3,5 KB no plano; medido
  +5,1 KB na implementação, e o teto revisado de +4 para +6 KB, R10).

**Constraints**:

- Sem JS e na impressão: janela do DebianServer completa, com a captura; sem `<dialog>`; challenge novo
  entre os cartões; cada conteúdo uma vez (SC-006).
- Captura com `alt` descritivo, legenda datada, sem metadados; nada no site que localize ou dê acesso ao
  servidor (FR-020, R11).
- Teclado e leitor de tela: link da captura com nome que avisa o tamanho real; diálogo modal com foco
  preso e devolvido; 0 violações axe; console sem erros do site.
- Sem rolagem horizontal a partir de 320 px; nenhum pedido novo a terceiros em tempo de execução.
- Fatos do DebianServer = respostas do autor (Clarifications Q1–Q14 e clarify); nada inferido.

**Scale/Scope**:

- Alterados: `src/types/resume.ts` (13 `TechName`, `ProjectKind`, `Detail`, `ServerApp`, `Screenshot`,
  variante nova de `Project`, prefixo `simpleicons-`), `src/data/resume.ts` (DebianServer, Bom Jesus
  (FAE), guia de edição), `src/lib/tech-icons.ts` (13 ícones), `src/components/sections/ProjectCard.vue`,
  `tools/build-tech-icons.mjs` (simple-icons; tratamento de CasaOS, OpenWebUI e Samba),
  `src/assets/tech-icons/sprite.svg` + `NOTICE.md` (gerados), `package.json`/lockfile (2.8.0).
- Novos: `src/components/sections/ProjectScreenshot.vue`, `tools/build-screenshots.mjs`,
  `tools/source/debianserver/painel-casaos-2026-10-20.png` (fonte),
  `public/projetos/debianserver/painel-2026-10-20-{800,1396}.webp` (gerados).
- Testes: ~7 de unidade/componente ajustados + 1 novo; ~10 e2e ajustados + 1 novo.
- `DESIGN.md`, `README.md`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constituição **v3.1.0** (emendada nesta feature, commit `cbf86ae`, specify Q3).

| Princípio | Verificação | Pré-pesquisa | Pós-design |
|-----------|-------------|--------------|------------|
| I. Fidelidade ao Currículo | Todo fato do DebianServer vem das respostas do autor (Q1–Q14, clarify) ou da captura; períodos no formato único da página e a data de entrada em produção com o dia (`desde = 01 OUT 2026`); o selo `EM PRODUÇÃO` só no que está em uso. O challenge, o servidor e as tecnologias novas não estão no PDF de 2026-04-21: pelo precedente da 002, o site está certo e o autor atualiza o PDF | PASS com pendência do autor (PDF) | PASS com pendência do autor (PDF) |
| II. Projetos Demonstráveis | Challenge com repositório público (`_blank` + `noopener noreferrer`). DebianServer: nome, propósito, papel e stack; evidência pela 4ª exceção (v3.1.0): captura publicada no site, data visível (no painel e na legenda), texto alternativo descritivo, sem dado que localize ou dê acesso (R11); a exceção fica explícita no projeto (tipo `side-project`, figura no lugar dos links). Ordem por relevância decidida pelo autor (2º) | PASS (depois da emenda) | PASS |
| III. Saída Estática | Tudo pré-renderizado; a captura é arquivo estático do próprio site; o visualizador só acrescenta comportamento (sem JS, o link abre a imagem); nenhuma dependência nova; nada de terceiros em tempo de execução; WebP e sprite gerados por `tools/` e versionados (R3, R4); +≤ 4 KB gzip (R10) | PASS | PASS |
| IV. Acessibilidade e Desempenho | Imagem em formato moderno, `loading="lazy"`, `width`/`height`, `alt` descritivo; ícones dos apps decorativos (`aria-hidden`); `<dialog>` modal nativo (foco preso, Esc, inércia do resto), foco devolvido, ✕ com 44 px, animação ≤ 200 ms e nenhuma com "reduzir movimento"; sem rolagem horizontal; axe nos estados novos | PASS com ressalva herdada (Complexity Tracking) | PASS com ressalva herdada |
| V. Identidade Visual Coerente | Reaproveita a janela de projeto, o `TechIcon`, o `tag-now`, o `dl` de metadados, os comentários `t-output` e o fundo da janela maximizada; o único componente novo (`ProjectScreenshot`) é justificado (R5, R7); só tokens existentes, nenhuma cor nova | PASS | PASS |
| Restrições de Conteúdo e Tecnologia | Nenhum dado pessoal sensível: o modelo do notebook e o método de acesso foram informados pelo autor para publicação; nenhum IP, domínio, porta ou nome de rede (R11). SEO inalterado | PASS | PASS |
| Fluxo de Trabalho e Verificação | Quickstart V1–V17: build de produção, desktop e celular, sem JS, impressão, movimento reduzido, console e axe; a emenda num commit próprio, antes do da spec | PASS | PASS |

### Justificativa de dependências e recursos (Princípio III)

| Item | Por quê | Peso no cliente |
|------|---------|-----------------|
| Janela do DebianServer (HTML pré-renderizado: dados, 6 apps, `alt`) | o pedido (R1, R8) | ~1,3 KB gzip |
| Challenge Bom Jesus (FAE) (1º arquivo pré-renderizado + cartão) | o pedido (R2) | ~0,4 KB gzip |
| `ProjectScreenshot` + visualizador | FR-015 a FR-018, clarify (R5, R7) | ~0,8 KB gzip (JS) + ~0,5 KB (CSS) |
| Captura WebP 800 px e 1396 px | evidência (R4) | 16–60 KB, **fora do carregamento inicial** (preguiçosa / sob pedido) |
| 13 ícones no sprite (simple-icons é fonte nova, CC0) | FR-003, FR-011, FR-013 (R3) | sprite externo, já cacheado; ~+4 KB no arquivo |
| `tools/build-screenshots.mjs` | gerar os WebP sem dependência nova (R4) | — (só no desenvolvimento) |
| Versão `2.8.0` | 005 FR-016 | — |

## Project Structure

### Documentation (this feature)

```text
specs/009-homeserver-bomjesus-challenge/
├── plan.md                         # este arquivo
├── research.md                     # Phase 0: R1–R14
├── data-model.md                   # Phase 1: tipos novos, itens dos dados, validação
├── quickstart.md                   # Phase 1: cenários V1–V17
├── contracts/
│   └── debianserver-window.md      # DOM da janela, visualizador, challenge, open
├── checklists/
│   └── requirements.md
└── tasks.md                        # /speckit-tasks
```

### Source Code (repository root)

```text
package.json, package-lock.json               # version 2.8.0 (R12)

tools/
├── build-tech-icons.mjs                      # simple-icons; CasaOS, OpenWebUI, Samba do dashboard-icons (R3)
├── build-screenshots.mjs                     # novo: PNG → WebP 800/1396 via canvas do Chromium (R4)
└── source/debianserver/painel-casaos-2026-10-20.png   # captura original enviada pelo autor

public/projetos/debianserver/
├── painel-2026-10-20-800.webp                # gerado
└── painel-2026-10-20-1396.webp               # gerado

src/
├── types/resume.ts                           # TechName +13, ProjectKind, Detail, ServerApp, Screenshot, variante de Project (R1)
├── data/resume.ts                            # DebianServer (2º), Bom Jesus (FAE), guia de edição (R1, R2)
├── lib/tech-icons.ts                         # 13 ícones (R3)
├── assets/tech-icons/sprite.svg, NOTICE.md   # gerados (R3)
└── components/sections/
    ├── ProjectCard.vue                       # selo, desde, details, apps, coluna da captura (R6, R8)
    └── ProjectScreenshot.vue                 # novo: figura + visualizador <dialog> (R5, R7)

tests/
├── unit/        resume.data, editor-files, sections, terminal, tech-icons, version (ajustes); WebP sem metadados (R11)
├── component/   ProjectCard (ajuste), ProjectScreenshot (novo), AccessGate (v2.8)
└── e2e/         projects, editor-windows, open-command, minimized-layout, no-js, a11y, reduced-motion,
                 weight, session (ajustes); screenshot-viewer (novo, com a varredura de privacidade)

DESIGN.md, README.md                          # captura, visualizador, lista de apps, side-project (R14)
```

**Structure Decision**: a mesma das features anteriores. Conteúdo só em `src/data/resume.ts`; os
componentes desenham o que os dados têm; assets gerados por `tools/` e versionados.

## Fases de implementação (resumo para o /speckit-tasks)

1. **Setup**: linha de base de peso no build de `965f4ee`; versão 2.8.0; WebP gerados
   (`tools/build-screenshots.mjs`); ícones novos no sprite (com a prévia, V15).
2. **Base**: tipos (`TechName`, `ProjectKind`, `Detail`, `ServerApp`, `Screenshot`, variante de
   `Project`, prefixo `simpleicons-`), `TECH_ICONS`, validação em `resume.data.spec.ts`. Bloqueia as
   histórias.
3. **US1 (P1, DebianServer)**: dados; `ProjectCard` (selo, desde, details, apps); `ProjectScreenshot`
   (figura); visualizador; testes de componente; e2e da janela (ordem, fatos, 4 larguras, captura
   preguiçosa, visualizador, sem JS, impressão, a11y, movimento reduzido, privacidade); ícones
   minimizados (4/2/1 linhas).
4. **US2 (P2, Bom Jesus (FAE))**: dados; testes de unidade e e2e da janela de Challenges (8 arquivos).
5. **US3 (P3, `open`)**: testes de unidade e e2e com 11 opções e `open debianserver`.
6. **Polimento**: peso, console, `DESIGN.md`/README/guia de edição, quickstart, suítes completas.

## Complexity Tracking

Nenhuma violação nova. Fica a ressalva herdada da 006:

| Violação | Por que é necessária | Alternativa mais simples rejeitada porque |
|----------|----------------------|-------------------------------------------|
| Princípio IV / WCAG 2.2.2: o Letter Glitch troca letras sozinho por mais de 5 s sem botão de pausa (herdado da 006, sem mudança) | Pedido do autor na 006; mitigações mantidas (some com "reduzir movimento", para fora da tela e com a aba oculta, decorativo). Esta feature não mexe no hero | Um botão de pausa contraria a decisão do autor na 001 |
