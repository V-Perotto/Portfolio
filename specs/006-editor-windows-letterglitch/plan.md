# Implementation Plan: Janelas de editor com Branched Menu, Letter Glitch no hero, Lattice Loader e correções das janelas

**Branch**: `001-vue-resume-refactor` (a 006 parte do estado da 005; nenhum branch novo) |
**Date**: 2026-10-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/006-editor-windows-letterglitch/spec.md`

## Summary

Dez pedidos do autor:

- **Janelas de editor (item 1)**: Experiência, Challenges e Comunitário viram três janelas de editor no
  estilo VS Code (uma por seção, Q1). Cada uma digita `code <pasta>` e mostra, como saída, abas, a
  árvore de arquivos (Branched Menu do Vue Bits, vendorizado, radius 0), o item aberto como um arquivo
  YAML com números de linha (gerado dos dados do currículo) e um rodapé. Minimizam e fecham como as
  outras janelas e maximizam: a janela vai para o `<body>` por Teleport, cobre ~95% da tela, a página
  por trás fica desfocada e inerte, e o painel mostra os cartões de hoje (Q2), com a árvore rolando até
  o cartão escolhido. Sem JS e na impressão, aparecem os cartões.
- **Hero (itens 4 e 10)**: o Dot Field sai; entra o Letter Glitch do Vue Bits (vendorizado, cena em
  canvas 2D num Web Worker), com as cores do tema, Glitch Speed 10, transição suave e as duas vinhetas
  do componente, calibradas para o contraste (letras mais suaves, vinheta central mais forte;
  clarify). A primeira linha vira o Lattice Loader (vendorizado): roxo "Inicializando
  portfolio.service" por no mínimo 3 s, ✓ verde "portfolio.service carregado com sucesso!", e some 3 s
  depois sem mover nada.
- **Porta de acesso (itens 5, 6 e 7)**: a penumbra sob o ícone vira uma vinheta suave; a curvatura do
  Faulty Terminal passa a ser proporcional ao formato da tela (leve no celular); no fim da porta, a
  página aparece sempre no topo (Q3), sem âncora no endereço.
- **Janelas (itens 8 e 9)**: reabrir uma janela fechada não pisca mais o conteúdo (a digitação é
  preparada antes de a janela crescer); o `□` das janelas que não maximizam fica desativado.
- **Dock e favicon (itens 2 e 3)**: dica própria `Ctrl + Alt + T` no botão da dock; favicon com o ícone
  de terminal verde, fundo escuro e brilho roxo, gerado dos tokens.
- Versão `2.5.0`.

Nenhuma dependência nova no `package.json`: os três componentes do Vue Bits são vendorizados, sem
Hugeicons (ícones do Lucide, já instalado) e sem Tailwind nas classes.

## Technical Context

**Language/Version**: TypeScript ~6.0.3, Vue 3.5, Node ≥ 22 no build

**Primary Dependencies**: as da 005 (`vue`, `@unhead/vue` 2, `@vueuse/core`, `motion-v`, `@lucide/vue`;
`vite-ssg`, `vite` 8.3.4, Tailwind 4). **Nenhuma dependência nova**. Vendorizados do Vue Bits
(`07c0f76`): Branched Menu (R4), Letter Glitch (R12), Lattice Loader (R13). Saem: Dot Field e
`HeroDots` (005).

**Storage**: N/A (nenhum estado persiste; toda visita começa com as janelas abertas e restauradas).

**Testing**: `vue-tsc`; Vitest 5 + `@vue/test-utils` + `happy-dom` (arquivos YAML × cartões, tempos do
loader, curvatura, cores do Letter Glitch, Branched Menu, EditorWindow, LatticeLoader, DesktopWindow);
Playwright 1.64 + `@axe-core/playwright` sobre o build (R17).

**Target Platform**: navegadores evergreen (precisa de `inert`, `:has()`, `backdrop-filter`; Letter
Glitch no worker com `OffscreenCanvas` 2D e, sem ele, na thread principal), desktop e celular; GitHub
Pages em `/Portfolio/`.

**Project Type**: site estático pré-renderizado (SPA hidratada de página única).

**Performance Goals**:

- Maximizar/restaurar ≤ 400 ms (FLIP de 320 ms, só `transform`); trocar de arquivo sem reflow da
  página (altura fixa pela pilha de arquivos).
- Letter Glitch: até 60 qps no worker (30 na thread principal, com o freio da 004); parado fora da tela
  e com a aba oculta; não roda com "reduzir movimento".
- Lattice Loader: só animações CSS de `opacity`; pausadas fora da tela.
- HTML + CSS + JS iniciais ≤ 91.642 B + 18 KB gzip (R17; estimado +6 KB, medido +16,0 KB na
  implementação).

**Constraints**:

- Conteúdo completo e âncoras sem JS (as três seções mostram os cartões; R2).
- Janela maximizada: diálogo modal (foco preso, Esc, resto inerte), página sem rolar e sem salto.
- Contraste ≥ 4,5:1: texto do hero sobre o Letter Glitch; nome do ícone e dica sobre o Faulty; YAML e
  árvore sobre o fundo do editor; textos do loader.
- `prefers-reduced-motion`: sem Letter Glitch, loader direto em "done", maximizar e trocar sem
  animação, dica sem transição, Branched Menu sem animação de desenho/dobra.
- Sem rolagem horizontal a partir de 320 px; console sem erros do site; nenhum pedido novo a terceiros.

**Scale/Scope**:

- Componentes novos: `EditorWindow`, `HeroGlitch`, `HeroLoader`; vendorizados `BranchedMenu`,
  `LetterGlitch`, `LatticeLoader`.
- Módulos novos: `lib/editor-files.ts`, `lib/hero-loader.ts`, `lib/scenes/letter-glitch.ts`,
  `workers/letter-glitch.worker.ts`; `tools/build-favicon.mjs`.
- Alterados: `ExperienceSection`, `ProjectsSection`, `HeroSection`, `AccessGate`, `DesktopWindow`,
  `TerminalWindow`, `TerminalBar`, `window-controls`, `useTerminalTyping`, `useHashAnchor`, `AppDock`,
  `scene-host`, `scenes/serve`, `scenes/faulty`, `webgl` (`hasOffscreen2D`), `tokens.css`, `base.css`,
  `index.html`, `package.json`.
- Removidos: `DotField.vue`, `HeroDots.vue`, tokens `--dots-*`/`--hero-scrim`, `hero-dots.spec.ts`.
- ~4 specs e2e novos e ~12 ajustados.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constituição **v3.0.0**. Nenhuma emenda necessária.

| Princípio | Verificação | Pré-pesquisa | Pós-design |
|-----------|-------------|--------------|------------|
| I. Fidelidade ao Currículo | Nenhum dado muda. Os arquivos YAML são gerados dos mesmos dados dos cartões e testados campo a campo; períodos e datas pelo `formatPeriod`/`formatYearMonth` (formato único; o exemplo `03/2026` do clarify foi corrigido) | PASS | PASS |
| II. Projetos Demonstráveis | Links de challenges e da fonte do comunitário nas duas visões, com `ExternalLink` (nova aba, `noopener noreferrer`); ordem dos challenges mantida; minimizar/fechar/maximizar reversíveis e sem persistência | PASS | PASS |
| III. Saída Estática | Tudo no HTML pré-renderizado (editor e cartões, R2); sem JS, os cartões aparecem; nada de terceiros novo; favicon e PNGs versionados, gerados dos tokens (R11); **nenhuma dependência nova** (vendorizados; Lucide no lugar do Hugeicons) | PASS | PASS |
| IV. Acessibilidade e Desempenho | Janela maximizada como diálogo (`role="dialog"`, `aria-modal`, `inert` no `#app`, laço de foco, Esc, R5); árvore com botões, `aria-current`, `aria-expanded` (R4); números de linha e grade do loader decorativos; loader sem anúncios (R13); dica da dock com hover persistente e Esc (WCAG 1.4.13, R10); contraste medido por pixel (R12, R14); movimento reduzido em todos os efeitos novos; Letter Glitch fora da thread principal e pausado (R12); a porta de acesso continua cumprindo a exceção v3.0.0 (só a vinheta, a curvatura e a posição final mudam) | PASS com ressalva (fundo animado contínuo sem pausa; ver Complexity Tracking) | PASS com ressalva |
| V. Identidade Visual Coerente | Reusa `DesktopWindow`, `TerminalWindow`, `TerminalBar`, `DesktopIcon`, `BaseCard`, `lib/flip`, `useTerminalTyping` e os cartões; cores em tokens novos (`--syntax-*`, `--glitch-*`, `--loader-*`, `--gate-vignette`, `--maximize-*`, `--tree-line`); favicon gerado dos tokens; o "radius 0" e o tamanho 300 px da árvore registrados (R4) | PASS | PASS |
| Restrições de Conteúdo e Tecnologia | Nenhum dado pessoal novo; SEO inalterado | PASS | PASS |
| Fluxo de Trabalho e Verificação | Quickstart V1–V23: build de produção, desktop e celular, sem JS, movimento reduzido (inclusive ao vivo), impressão, console e axe | PASS | PASS |

### Justificativa de dependências e recursos (Princípio III)

| Item | Por quê | Peso no cliente |
|------|---------|-----------------|
| Branched Menu vendorizado (`vendor/vue-bits/BranchedMenu.vue`, MIT + Commons Clause) | pedido do autor (item 1); Lucide no lugar do Hugeicons, CSS com escopo (R4) | ~1,5 KB gzip, pacote inicial |
| `EditorWindow` + `lib/editor-files.ts` | janelas de editor (item 1, R1–R3, R5) | ~2 KB gzip JS + ~1,6 KB gzip de HTML (YAML) |
| Letter Glitch vendorizado + cena + worker | pedido do autor (item 4); canvas 2D no worker (R12) | ~2,5 KB gzip, pedaço assíncrono + worker, depois da porta (fora da conta inicial) |
| Lattice Loader vendorizado + `HeroLoader` | pedido do autor (item 10, R13) | ~1,2 KB gzip, pacote inicial (primeira linha do hero) |
| Ícones `FileCode`, `Minimize2` do `@lucide/vue` (já instalado) | árvore e restaurar | ~0,3 KB gzip |
| `favicon.svg` + 2 PNGs (`public/`) | pedido do autor (item 3, R11) | ~1 KB (SVG); PNGs só onde o SVG não é suportado |
| Versão `2.5.0` | 005 FR-016 | — |

**Removidos**: `DotField.vue`, `HeroDots.vue` (pedaço assíncrono da 005), tokens `--dots-*` e
`--hero-scrim`, o `title` do botão da dock, o favicon `>_` em data URI.

## Project Structure

### Documentation (this feature)

```text
specs/006-editor-windows-letterglitch/
├── plan.md                      # este arquivo
├── research.md                  # Phase 0: R1–R17
├── data-model.md                # Phase 1: arquivos YAML, janela de editor, controles, loader, cena, tokens
├── quickstart.md                # Phase 1: cenários V1–V23
├── contracts/
│   ├── editor-window.md         # DOM, visões, interação, geometria, □ desativado
│   └── hero-and-gate.md         # fim da porta, Letter Glitch, loader, vinheta, curvatura, dica, favicon
├── checklists/
│   └── requirements.md
└── tasks.md                     # /speckit-tasks
```

### Source Code (repository root)

```text
index.html                                  # scrollRestoration manual; links do favicon (R8, R11)
package.json, package-lock.json             # version 2.5.0 (R16)
tools/build-favicon.mjs                     # NOVO: gera favicon.svg + PNGs dos tokens (R11)
public/favicon.svg, favicon-32.png,
       apple-touch-icon.png                 # NOVOS (gerados, versionados)

src/
├── lib/
│   ├── editor-files.ts                     # NOVO: pastas e arquivos YAML dos itens (R3)
│   ├── hero-loader.ts                      # NOVO: loaderSchedule() (R13)
│   ├── scenes/letter-glitch.ts             # NOVO: cena 2D do Letter Glitch (R12)
│   ├── scenes/faulty.ts                    # curvatureFor() no resize (R15)
│   ├── scenes/serve.ts, scene.ts           # mensagem 'frame' (primeiro quadro)
│   ├── scene-host.ts                       # contexto '2d' | 'webgl'; onFirstFrame (R12)
│   └── webgl.ts                            # hasOffscreen2D()
├── workers/letter-glitch.worker.ts         # NOVO
├── composables/
│   ├── useTerminalTyping.ts                # prepare() + replay() em dois tempos (R7)
│   └── useHashAnchor.ts                    # não age com a porta na tela (R8)
├── styles/
│   ├── tokens.css                          # tokens novos; --dots-*/--hero-scrim saem (data-model §8)
│   └── base.css                            # html.window-maximized; impressão do editor
├── components/
│   ├── vendor/vue-bits/
│   │   ├── BranchedMenu.vue                # NOVO (R4)
│   │   ├── LetterGlitch.vue                # NOVO (R12)
│   │   ├── LatticeLoader.vue               # NOVO (R13)
│   │   └── DotField.vue                    # REMOVIDO
│   ├── terminal/
│   │   ├── EditorWindow.vue                # NOVO: janela de área de trabalho do editor (R1)
│   │   ├── EditorFrame.vue                 # NOVO: editor, visões e maximizar (R2, R5, R6)
│   │   ├── HeroGlitch.vue                  # NOVO (substitui HeroDots, R12)
│   │   ├── HeroLoader.vue                  # NOVO (R13)
│   │   ├── HeroDots.vue                    # REMOVIDO
│   │   ├── AccessGate.vue                  # fim no topo, sem âncora; vinheta (R8, R14)
│   │   ├── DesktopWindow.vue               # prepare() antes de crescer (R7)
│   │   ├── TerminalWindow.vue              # modo do □; repassa maximizar
│   │   ├── TerminalBar.vue                 # maximize: 'none' | 'disabled' | 'on' (R9)
│   │   └── window-controls.ts              # maximize opcional
│   ├── dock/AppDock.vue                    # dica própria; Ctrl+Alt+T bloqueado maximizada (R5, R10)
│   └── sections/
│       ├── ExperienceSection.vue           # EditorWindow + timeline no slot de cartões
│       ├── ProjectsSection.vue             # EditorWindow para challenges e comunitário
│       └── HeroSection.vue                 # HeroGlitch, HeroLoader; sem a penumbra
└── App.vue                                 # sem mudança prevista

tests/
├── unit/        editor-files.spec.ts, hero-loader.spec.ts, letter-glitch.spec.ts, faulty-curvature.spec.ts (NOVOS); version.spec.ts
├── component/   BranchedMenu.spec.ts, EditorWindow.spec.ts, LatticeLoader.spec.ts (NOVOS); DesktopWindow.spec.ts, ProjectsSection.spec.ts (ajustes)
└── e2e/         editor-windows.spec.ts, hero-glitch.spec.ts, hero-loader.spec.ts (NOVOS); hero-dots.spec.ts (REMOVIDO);
                 access-gate, desktop-windows, window-controls, dock-terminal, boot, weight, a11y, no-js,
                 reduced-motion, projects, content-polish, minimized-layout, tech-icons, visual-cleanup (ajustes)

DESIGN.md, README.md                        # janelas de editor, Letter Glitch, loader, dica, favicon
```

**Structure Decision**: a mesma das features anteriores. Lógica testável em `src/lib/`; componentes do
Vue Bits em `vendor/vue-bits/`; a composição (editor, fundos, loader) em `components/terminal/`; cena
de fundo com o protocolo de worker da 004.

## Fases de implementação (resumo para o /speckit-tasks)

1. **Setup**: linha de base de peso (91.642 B); versão 2.5.0; tokens novos.
2. **Base**: `editor-files`, `hero-loader`, `curvatureFor`, `hasOffscreen2D`, mensagem `frame` no
   protocolo de cenas; `TerminalBar`/`TerminalWindow`/`window-controls` com o modo do `□`;
   `useTerminalTyping.prepare()`; testes de unidade.
3. **US1 (P1, janelas de editor)**: `BranchedMenu`, `EditorWindow` (visões, digitação, maximizar),
   `ExperienceSection`, `ProjectsSection`, bloqueio do atalho; e2e e componentes.
4. **US2 (P1, hero no fim da porta)**: `index.html`, `AccessGate.finish()`, `useHashAnchor`; e2e.
5. **US3 (P1, reabrir sem piscar)**: `DesktopWindow.open()` com `prepare()`; e2e de quadros.
6. **US4 (P2, Letter Glitch)**: cena, worker, `LetterGlitch`, `HeroGlitch`, calibração do contraste,
   remoção do Dot Field; e2e.
7. **US5 (P2, Lattice Loader)**: `LatticeLoader`, `HeroLoader`, prontidão do hero; e2e.
8. **US6 (P3, porta)**: vinheta e curvatura; e2e no projeto `webgl`.
9. **US7 (P3, dock, `□`, favicon)**: dica, `□` desativado, `tools/build-favicon.mjs`; e2e.
10. **Polimento**: a11y, sem JS, movimento reduzido, impressão, peso, `DESIGN.md`/README, inspeção
    pelo quickstart.

## Complexity Tracking

| Violação | Por que é necessária | Alternativa mais simples rejeitada porque |
|----------|----------------------|-------------------------------------------|
| Princípio IV / WCAG 2.2.2: o Letter Glitch troca letras sozinho por mais de 5 s sem botão de pausa (como o Dot Field da 005 e o CRT da 004) | Pedido do autor (item 4). A falta de pausa já foi aceita na 001, quando o autor retirou o controle global de movimento. Mitigações: some com "reduzir movimento" (inclusive ao vivo), para fora da tela e com a aba oculta, roda fora da thread principal, fundo decorativo (`aria-hidden`) sob as vinhetas calibradas para o contraste | Um botão de pausa contraria a decisão do autor na 001 |
| Fatos do currículo duas vezes no HTML (YAML do editor e cartões) | Q2 pede os cartões na janela maximizada; o Princípio III pede tudo no HTML sem JS; o editor no HTML evita salto quando o JS chega tarde (R2) | Renderizar uma das visões só no cliente: salto/janela vazia sem porta, ou YAML no lugar dos cartões sem JS (R2). Só uma visão por vez fica na árvore de acessibilidade |
