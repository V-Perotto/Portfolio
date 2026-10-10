# Implementation Plan: Comando `open`, terminal da dock minimizável, vinheta original do Letter Glitch e ajustes de texto

**Branch**: `001-vue-resume-refactor` (a 007 parte do estado da 006; nenhum branch novo) |
**Date**: 2026-10-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/007-open-command-dock-minimize/spec.md`

## Summary

Cinco pedidos do autor:

- **`open <OPTIONS>` (item 1)**: um comando novo no terminal da dock que abre uma janela e leva a página
  até ela. As opções vêm dos dados, na ordem da página: os 6 projetos (pelo nome em slug: `srg`,
  `temas-vs-code`, `italiami`, `ocr-de-prontuarios`, `qclass-bot`, `monitor-de-curso`) abrem a janela
  deles; `experiencia`, `challenges` e `comunitario` abrem a janela de editor maximizada. Depois de um
  `open`, o terminal minimiza sozinho (guardando a sessão) e o foco vai para a janela. O terminal chega
  às janelas por um registro em módulo (`lib/windows.ts`), onde cada `DesktopWindow` com `windowId` se
  registra; o `EditorFrame` entrega o seu maximizar. `help`, mensagens de erro e autocompletar seguem o
  padrão do `find`.
- **Minimizar o terminal da dock (item 2)**: o `−` funciona; o terminal encolhe até o botão da dock
  (FLIP de 320 ms, como as janelas) e fica montado e invisível (`opacity: 0` + `inert`), com a
  sessão inteira; o botão da dock e o Ctrl+Alt+T minimizam e restauram; ✕, `exit` e Esc continuam
  fechando e apagando a sessão. O botão mostra um ponto vazado com o terminal minimizado.
- **Vinheta original (item 3)**: a vinheta central do Letter Glitch volta à do componente (preto 80% →
  transparente aos 60%). Medido: a tagline cai para 2,3:1 e o texto do loader
  para 1,9–3,8:1; os dois ganham um halo (contorno preto sólido de 2 px + esfumado curto) só com o fundo
  animado, que leva a tagline a 4,9–5,2:1; o botão `ping vittorio` ganha fundo opaco (4,2 → 11:1). O
  resto do hero passa sem mudança.
- **Sobre (item 4)**: o texto de `cat sobre.txt` passa ao `--text` (o branco das descrições dos
  projetos).
- **Tagline (item 5)**: "Transformando processos em sistemas escaláveis".
- Versão `2.6.0`.

Nenhuma dependência nova.

## Technical Context

**Language/Version**: TypeScript ~6.0.3, Vue 3.5, Node ≥ 22 no build

**Primary Dependencies**: as da 006 (`vue`, `@unhead/vue` 2, `@vueuse/core`, `motion-v`, `@lucide/vue`;
`vite-ssg`, `vite` 8.3.4, Tailwind 4). **Nenhuma dependência nova**, nenhum componente novo do Vue Bits.

**Storage**: N/A (a sessão do terminal vive no componente montado; nada persiste entre visitas).

**Testing**: `vue-tsc`; Vitest 5 + `@vue/test-utils` + `happy-dom` (motor do terminal, `openTargets`,
`DockTerminal`, `DesktopWindow`, `RevealText`); Playwright 1.64 + `@axe-core/playwright` sobre o build
(R12).

**Target Platform**: navegadores evergreen (`inert`, Web Animations API, `color-mix`), desktop e
celular; GitHub Pages em `/Portfolio/`.

**Project Type**: site estático pré-renderizado (SPA hidratada de página única).

**Performance Goals**:

- `open`: janela no estado final em ≤ 1 s (SC-001); minimizar/restaurar o terminal ≤ 400 ms (FLIP de
  320 ms, só `transform` e `opacity`).
- Halo: `text-shadow` estático numa linha de texto (sem custo por quadro além da composição do texto).
- HTML + CSS + JS iniciais ≤ 107.695 B + 3 KB gzip (R12; estimado +1,5 KB).

**Constraints**:

- Sem JS: nada desta feature aparece, exceto a cor do Sobre e a tagline (HTML/CSS).
- `open` e minimizar operáveis por teclado e leitor de tela; o terminal minimizado fica fora do Tab e da
  árvore de acessibilidade (`inert`); a janela maximizada pelo `open` é o diálogo modal da 006.
- Contraste ≥ 4,5:1 de todo texto do hero sobre o Letter Glitch com a vinheta original, medido por pixel
  (R7, R8); ponto vazado da dock ≥ 3:1.
- `prefers-reduced-motion`: `open` com rolagem e troca de estado imediatas; minimizar/restaurar sem
  animação; sem fundo animado, sem halo.
- Sem rolagem horizontal a partir de 320 px; console sem erros do site; nenhum pedido novo a terceiros.

**Scale/Scope**:

- Módulo novo: `lib/windows.ts` (registro + `openWindow`).
- Alterados: `lib/terminal.ts`, `lib/sections.ts`, `AppDock`, `DockTerminal`, `TerminalBar`,
  `DesktopWindow`, `window-controls`, `EditorFrame`, `EditorWindow`, `ProjectCard`,
  `ExperienceSection`, `ProjectsSection`, `HeroSection`, `AboutSection`, `App.vue`, `tokens.css`,
  `resume.ts`, `package.json`.
- 1 spec e2e novo (`open-command.spec.ts`) e ~7 ajustados; `support/contrast.ts` com o helper do halo.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constituição **v3.0.0**. Nenhuma emenda necessária.

| Princípio | Verificação | Pré-pesquisa | Pós-design |
|-----------|-------------|--------------|------------|
| I. Fidelidade ao Currículo | Só a tagline muda (não é cargo, empresa, período, formação nem tecnologia; encurtar não inventa nada). Os nomes do `open` são gerados dos nomes dos projetos | PASS | PASS |
| II. Projetos Demonstráveis | O `open` só mostra janelas existentes; links, evidências e ordem dos projetos intactos; as opções seguem a ordem da página | PASS | PASS |
| III. Saída Estática | Nada novo no servidor nem de terceiros; terminal e registro só no cliente (sem JS, nada disso existe, e o conteúdo continua inteiro); Sobre e tagline no HTML; nenhuma dependência nova | PASS | PASS |
| IV. Acessibilidade e Desempenho | `−` e botão da dock com nomes por estado e `aria-expanded`; terminal minimizado `inert`; foco definido em cada transição (contratos); diálogo modal da 006 reutilizado; contraste medido por pixel com o halo pelo critério do WCAG para texto com halo (R7, R8); animações ≤ 400 ms e nenhuma com movimento reduzido; a porta de acesso não muda | PASS com ressalva herdada (Complexity Tracking) | PASS com ressalva herdada |
| V. Identidade Visual Coerente | Minimizar o terminal usa o FLIP das janelas (`lib/flip`); `TerminalBar` com `minimizeLabel` como o `closeLabel`; Sobre no `--text` das outras descrições; halo e vinheta em tokens (`--hero-halo`, `--glitch-vignette-center`); fundo do `ping vittorio` com os mesmos tokens | PASS | PASS |
| Restrições de Conteúdo e Tecnologia | Nenhum dado pessoal novo; SEO inalterado (FR-025) | PASS | PASS |
| Fluxo de Trabalho e Verificação | Quickstart V1–V19: build de produção, desktop e celular, sem JS, movimento reduzido, impressão, console e axe | PASS | PASS |

### Justificativa de dependências e recursos (Princípio III)

| Item | Por quê | Peso no cliente |
|------|---------|-----------------|
| `lib/windows.ts` (registro + `openWindow`) | o terminal da dock precisa abrir janelas em outro ramo da árvore (R3, R4) | ~0,4 KB gzip |
| `open` no motor do terminal | item 1 (R2) | ~0,5 KB gzip |
| Minimizar na dock (estado, FLIP, indicador) | item 2 (R5) | ~0,4 KB gzip |
| `--hero-halo`, fundo opaco do `ping vittorio`, `.about-text` | itens 3 e 4 (R7, R9) | ~0,2 KB gzip de CSS |
| Versão `2.6.0` | 005 FR-016 | — |

## Project Structure

### Documentation (this feature)

```text
specs/007-open-command-dock-minimize/
├── plan.md                      # este arquivo
├── research.md                  # Phase 0: R1–R12
├── data-model.md                # Phase 1: alvos do open, motor, registro, estados da dock, tokens
├── quickstart.md                # Phase 1: cenários V1–V19
├── contracts/
│   ├── terminal-open.md         # gramática, opções, respostas, help, autocompletar, foco
│   ├── dock-minimize.md         # barra, teclado, DOM/a11y, indicador, animação, sessão
│   └── hero-and-about.md        # vinheta, halo, ping vittorio, Sobre, tagline
├── checklists/
│   └── requirements.md
└── tasks.md                     # /speckit-tasks
```

### Source Code (repository root)

```text
package.json, package-lock.json             # version 2.6.0 (R11)

src/
├── lib/
│   ├── sections.ts                         # openTargets(resume) (R1)
│   ├── terminal.ts                         # contexto { sections, targets }; open, help, complete (R2)
│   └── windows.ts                          # NOVO: registerWindow, getWindow, openWindow (R3, R4)
├── components/
│   ├── dock/
│   │   ├── AppDock.vue                     # closed/open/minimized; FLIP até o botão; indicador; fluxo do open (R4, R5)
│   │   └── DockTerminal.vue                # contexto; − funcional; emite minimize e open (R2, R5)
│   ├── terminal/
│   │   ├── TerminalBar.vue                 # prop minimizeLabel (R5)
│   │   ├── DesktopWindow.vue               # windowId; registro; open({ complete, onLayout }) (R3)
│   │   ├── window-controls.ts              # exposeMaximize (R3)
│   │   ├── EditorFrame.vue                 # entrega o maximizar ao DesktopWindow (R3)
│   │   └── EditorWindow.vue                # repassa windowId
│   └── sections/
│       ├── ProjectCard.vue                 # windowId projetos/<slug>
│       ├── ExperienceSection.vue           # windowId experiencia
│       ├── ProjectsSection.vue             # windowId challenges, comunitario
│       ├── HeroSection.vue                 # data-glitch; halo da tagline e do loader; fundo opaco do ping vittorio (R7)
│       └── AboutSection.vue                # .about-text em --text (R9)
├── data/resume.ts                          # tagline (R10)
├── styles/tokens.css                       # --glitch-vignette-center original; --hero-halo (R6, R7)
└── App.vue                                 # passa openTargets(resume) à dock

tests/
├── unit/        terminal.spec.ts, sections.spec.ts, version.spec.ts (ajustes)
├── component/   DockTerminal.spec.ts, DesktopWindow.spec.ts, RevealText.spec.ts (ajustes)
└── e2e/         open-command.spec.ts (NOVO); support/contrast.ts (haloContrast);
                 dock-terminal, hero-glitch, hero-loader, content-polish, a11y, weight, reduced-motion (ajustes)

DESIGN.md, README.md                        # dock (estados, indicador, open), vinheta + halo, Sobre
```

**Structure Decision**: a mesma das features anteriores. Lógica testável em `src/lib/` (motor do
terminal, alvos, registro de janelas); comportamento das janelas em `components/terminal/`; a dock em
`components/dock/`; cores e sombras em tokens.

## Fases de implementação (resumo para o /speckit-tasks)

1. **Setup**: linha de base de peso (107.695 B, teto +3 KB); versão 2.6.0.
2. **Base**: `openTargets`; registro de janelas (`windowId`, `open({ complete, onLayout })`,
   `exposeMaximize`) nas janelas de projeto e de editor; testes de unidade e de componente.
3. **US2 (P1, minimizar)**: `TerminalBar.minimizeLabel`; `DockTerminal` com `−`; `AppDock` com os três
   estados, FLIP, indicador, nomes e dica; e2e. Vem antes da US1 porque o `open` minimiza o terminal.
4. **US1 (P1, `open`)**: motor (`run`, `help`, `complete` com contexto); `openWindow`; fluxo no
   `AppDock`; e2e `open-command.spec.ts`.
5. **US3 (P2, vinheta)**: token da vinheta; `data-glitch`; halo da tagline e do loader; fundo opaco do
   `ping vittorio`; helper `haloContrast`; calibração no e2e.
6. **US4 (P3, Sobre)** e **US5 (P3, tagline)**: CSS e dado; e2e.
7. **Polimento**: a11y, sem JS, movimento reduzido, impressão, peso, `DESIGN.md`/README, inspeção pelo
   quickstart.

## Complexity Tracking

Nenhuma violação nova. Fica a ressalva herdada da 006:

| Violação | Por que é necessária | Alternativa mais simples rejeitada porque |
|----------|----------------------|-------------------------------------------|
| Princípio IV / WCAG 2.2.2: o Letter Glitch troca letras sozinho por mais de 5 s sem botão de pausa (herdado da 006, sem mudança) | Pedido do autor na 006. Mitigações mantidas: some com "reduzir movimento" (inclusive ao vivo), para fora da tela e com a aba oculta, roda fora da thread principal, decorativo (`aria-hidden`); nesta feature, o contraste do texto continua garantido (vinheta original + halo na tagline) | Um botão de pausa contraria a decisão do autor na 001 |
