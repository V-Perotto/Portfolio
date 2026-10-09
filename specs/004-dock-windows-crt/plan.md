# Implementation Plan: Janelas de área de trabalho, dock com terminal e telas CRT

**Branch**: `001-vue-resume-refactor` (a 004 parte do estado da 003; nenhum branch novo) |
**Date**: 2026-10-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-dock-windows-crt/spec.md`

## Summary

Quinze pedidos do autor:

- **Boot (itens 4 e 12)**: ganha ao fundo o Faulty Terminal do Vue Bits. A sessão SSH passa a ser
  desenhada por uma linha do tempo pura, guiada pelo relógio, e termina sempre inteira, sem pulo.
  O teto é de 7 s (emenda v2.3.0 da constituição).
- **Hero (itens 5 e 6)**: perde a grade. No lugar, um tubo CRT (shader do CRT Warp do Vue Bits)
  exibe como textura a chuva Matrix, agora com caracteres ASCII.
- **Header, dock e terminal (itens 2 e 3)**: o header só aparece depois do hero, com meia tela de
  espaço antes do Sobre, e fica com os itens centralizados. O prompt sai do header e vira uma dock
  com um terminal de verdade: `help`, `find <seção>`, `clear`, `exit`, Tab e histórico.
- **Janelas (item 1)**: `−` e `✕` passam a funcionar. A janela encolhe até um ícone de área de
  trabalho no próprio lugar. Ao abrir, a minimizada volta completa e a fechada volta digitando.
- **Skills (itens 11 e 13)**: as fitas ocupam a largura toda, com texto 2×, e dois grupos correm
  para a direita.
- **Acertos pontuais (itens 7 a 10 e 14)**: rodapé, chip `JSON`, sublinhados dos badges na cor de
  cada tema, logotipo do Valkey e papel do ItaliaMi.
- **Dependências (item 15)**: passam para a versão mais nova compatível.

Nenhuma dependência nova entra: os dois shaders rodam sobre um helper WebGL próprio, sem `ogl` nem
`three`.

## Technical Context

**Language/Version**: TypeScript ~6.0.3 (o 7 fica fora, R14), Vue 3.5, Node ≥ 22 no build

**Primary Dependencies**: as da 003 (`vue`, `@unhead/vue` 2, `@vueuse/core`, `motion-v`,
`@lucide/vue`; `vite-ssg`, `vite` 8.3.4, Tailwind 4). **Nenhuma dependência nova**. Os componentes
vendorizados do Vue Bits (Faulty Terminal, CRT Warp) usam WebGL direto pelo helper `src/lib/webgl.ts`
(R1). O gerador do sprite ganha a fonte dashboard-icons (rede só na geração, R11).

**Storage**: N/A. Conteúdo em `src/data/resume.ts`; sprite versionado em `src/assets/tech-icons/`.

**Testing**: `vue-tsc`; Vitest 5 + `@vue/test-utils` + `happy-dom` 20.14.6 (dados, motor do
terminal, linha do tempo do boot, chuva, componentes); Playwright 1.64 + `@axe-core/playwright` (e2e
sobre o build, com CPU lenta via CDP e WebGL desligado via `addInitScript`).

**Target Platform**: navegadores evergreen com WebGL 1 (com degradação sem ele), desktop e celular;
GitHub Pages em `/Portfolio/`.

**Project Type**: site estático pré-renderizado (SPA hidratada de página única).

**Performance Goals**:

- Boot inteiro em até 7 s do início da navegação, inclusive com a CPU 4× mais lenta.
- Faulty Terminal a ≤ 30 quadros por segundo e resolução ≤ 1×.
- CRT a 24 quadros por segundo e 0,75×, parado fora da tela.
- Animações de janela de 320 ms (só `transform`, `opacity` e a altura do contêiner).
- Header com 250 ms de transição.
- Inicial ≤ 95,3 KB gzip (HTML + CSS + JS; linha de base 77,3 KB). O CRT vai em chunk separado.

**Constraints**:

- Conteúdo completo e navegação por âncora sem JS.
- `prefers-reduced-motion` para todos os efeitos, inclusive ligado durante a visita.
- Nenhuma requisição a terceiros.
- Console sem erros, inclusive sem WebGL.
- Sem rolagem horizontal a partir de 320px.
- Contraste ≥ 4,5:1 no texto sobre os fundos animados.
- Teclado e leitor de tela no terminal e nas janelas.

**Scale/Scope**:

- 8 janelas com controles funcionais.
- 4 comandos e 6 opções do `find`.
- 5 loops, 2 deles invertidos.
- 2 shaders vendorizados.
- Componentes: ~12 alterados e 8 novos (`AppDock`, `DockTerminal`, `DesktopWindow`, `TerminalBar`,
  `FaultyTerminal`, `CrtWarp`, `HeroCrt`, `useHeroPassed`).
- 5 módulos novos em `src/lib/` (`webgl`, `boot`, `terminal`, `matrix-rain`, `viewport`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constituição **v2.3.0** (emendada em 2026-10-09 para esta feature: exceção do boot no Princípio IV).

| Princípio | Verificação | Pré-pesquisa | Pós-design |
|-----------|-------------|--------------|------------|
| I. Fidelidade ao Currículo | Único dado factual alterado: papel do ItaliaMi, por decisão do autor (o site prevalece; o autor atualiza o PDF). "JSON" é grafia; o rodapé mantém o nome; nenhuma skill ou tecnologia some | PASS | PASS |
| II. Projetos Demonstráveis | Minimizar/fechar é ação do visitante, reversível e sem persistência; toda visita começa com as janelas abertas; sem JS e na impressão, sempre abertas; links e avisos de privado intactos | PASS | PASS |
| III. Saída Estática | Dock, terminal, fundos e janelas só acrescentam comportamento (ausentes no HTML sem JS); Valkey no sprite versionado gerado por `tools/`; **nenhuma dependência nova** (shaders vendorizados sobre helper próprio, R1); lockfiles atualizados | PASS | PASS |
| IV. Acessibilidade e Desempenho | Boot: exceção v2.3.0 aplicada à risca (não pulável, ≤ 7 s, nunca cortado, omitido com movimento reduzido e sem JS) (R4). Efeitos respeitam "reduzir movimento", inclusive ao vivo; fallback sem WebGL; terminal com `role=dialog`/`log` e foco gerenciado; botões das janelas com nome acessível e alvo de 24px; header revelado pelo foco; contraste garantido por painel e penumbra (R2, R13); console limpo | PASS com ressalva (fundo animado contínuo sem botão de pausa, ver Complexity Tracking) | PASS com ressalva |
| V. Identidade Visual Coerente | Dock, terminal e ícones estendem a metáfora Linux; barra de janela extraída e reutilizada (`TerminalBar`); cores e tamanhos novos em tokens (`--grape`, `--sith-badge`, `--hero-gap`, `--dock-space`, `--desktop-icon-size`, `--boot-panel`, `--hero-scrim`, `--loop-font`); cores dos canvas lidas dos tokens | PASS | PASS |
| Restrições de Conteúdo e Tecnologia | Nenhum dado pessoal novo; metadados intactos (`@unhead/vue` 2 mantido, R14) | PASS | PASS |
| Fluxo de Trabalho e Verificação | quickstart V1–V19 cobre build de produção, desktop + celular, sem JS, movimento reduzido (inclusive ao vivo), sem WebGL, impressão e CPU lenta | PASS | PASS |

### Justificativa de dependências (Princípio III)

| Item | Por quê | Peso no cliente |
|------|---------|-----------------|
| Faulty Terminal vendorizado (`vendor/vue-bits/FaultyTerminal.vue`, Vue Bits MIT + Commons Clause) | pedido do autor (item 4); shader copiado, `ogl` trocado pelo helper (R1) | ~2 KB gzip, bundle principal (o boot começa na montagem) |
| CRT Warp vendorizado (`vendor/vue-bits/CrtWarp.vue`) | pedido do autor (item 5); shader adaptado para a textura da chuva (R3), `three` trocado pelo helper | ~2 KB gzip, chunk separado com a chuva |
| `src/lib/webgl.ts` (próprio) | evita `three` (~130–170 KB gzip) e `ogl` | ~1 KB gzip |
| Logotipo do Valkey (dashboard-icons, Apache-2.0) | pedido do autor (item 10); símbolo no sprite já existente | +~0,3 KB no sprite |
| Atualizações (@playwright/test 1.64, happy-dom 20.14.6, vite 8.3.4) | pedido do autor (item 15) | 0 (desenvolvimento/build) |
| **Mantidas** typescript 6.0.3, @unhead/vue 2.1.17, beasties 0.3.5 | as mais novas (7, 3, 0.5) são incompatíveis com vue-tsc 3.3.12 e vite-ssg 28.3.0, ambos já os mais novos (R14, clarify Q2). Revisitar quando eles suportarem | — |

Removidos: `.hero-grid` (CSS), o canvas da chuva no DOM (`MatrixRain.vue` vira `lib/matrix-rain.ts`
+ `HeroCrt.vue`), a dica e os ouvintes de pulo do boot, a segunda linha do rodapé, o
`PromptLogo` do header (o componente continua no hero, no boot e no terminal).

## Project Structure

### Documentation (this feature)

```text
specs/004-dock-windows-crt/
├── plan.md                      # este arquivo
├── research.md                  # Phase 0: R1–R16
├── data-model.md                # Phase 1: tipos, janela, terminal, boot, chuva, tokens
├── quickstart.md                # Phase 1: cenários V1–V19
├── contracts/
│   ├── resume.schema.ts         # novo src/types/resume.ts (JSON, dashboard-, loopDirection)
│   ├── terminal-commands.md     # comandos, saídas, autocompletar, teclado, ARIA
│   └── page-contract.md         # HTML publicado e comportamento no cliente (revisão da 003)
├── checklists/
│   └── requirements.md
└── tasks.md                     # /speckit-tasks
```

### Source Code (repository root)

```text
index.html                                  # script inline: prazos 2055 ms (capa) e 7000 ms (motion) (R4)
package.json, package-lock.json,
pnpm-lock.yaml, pnpm-workspace.yaml         # versões (R14)

tools/build-tech-icons.mjs                  # fonte dashboard-icons (Valkey); sai lucide database (R11)

src/
├── assets/tech-icons/sprite.svg, NOTICE.md # regenerados (+dashboard-valkey, −lucide-database)
├── types/resume.ts                         # ← contracts/resume.schema.ts
├── data/resume.ts                          # JSON; ItaliaMi; loopDirection em 2 grupos
├── lib/
│   ├── tech-icons.ts                       # JSON; Valkey → dashboard-valkey
│   ├── webgl.ts                            # NOVO: helper de quadro cheio (R1), também em OffscreenCanvas
│   ├── scene-host.ts                       # NOVO: hospeda a cena num Web Worker ou na página (R1, revisão)
│   ├── scenes/                             # NOVO: scene.ts (contrato + frameLoop), serve.ts (lado do
│   │                                       #   worker), faulty.ts e crt.ts (shaders do Vue Bits)
│   ├── boot.ts                             # NOVO: constantes + bootFrame() (R4)
│   ├── terminal.ts                         # NOVO: run(), complete(), normalizeOption() (R7)
│   ├── matrix-rain.ts                      # NOVO: MATRIX_CHARS + MatrixRain (R3, R10)
│   └── viewport.ts                         # NOVO: --kb-offset pelo visualViewport (R7)
├── workers/                                # NOVO: faulty.worker.ts e crt.worker.ts (R1, revisão)
├── composables/
│   ├── useHeroPassed.ts                    # NOVO: IntersectionObserver do hero (R5)
│   └── useTerminalTyping.ts                # devolve { complete, replay } (R8)
├── styles/
│   ├── tokens.css                          # tokens novos (data-model)
│   └── base.css                            # body padding da dock; main container; impressão
├── components/
│   ├── vendor/vue-bits/
│   │   ├── FaultyTerminal.vue              # NOVO (vendorizado, R1, R2)
│   │   └── CrtWarp.vue                     # NOVO (vendorizado e adaptado, R1, R3)
│   ├── terminal/
│   │   ├── BootScreen.vue                  # linha do tempo, sem pulo, Faulty Terminal, painel (R4)
│   │   ├── HeroCrt.vue                     # NOVO: chuva fora da tela + CrtWarp (R3)
│   │   ├── MatrixRain.vue                  # REMOVIDO (lógica em lib/matrix-rain.ts)
│   │   ├── TerminalBar.vue                 # NOVO: barra de título + controles (R8)
│   │   ├── window-controls.ts              # NOVO: chave de injeção DesktopWindow → TerminalWindow
│   │   ├── TerminalWindow.vue              # usa TerminalBar; injeta windowControls
│   │   └── DesktopWindow.vue               # NOVO: estado, ícone, FLIP, foco (R8)
│   ├── dock/
│   │   ├── AppDock.vue                     # NOVO: dock + atalho + terminal (R7)
│   │   └── DockTerminal.vue                # NOVO: janela do terminal (R7)
│   ├── base/SkillLoop.vue                  # 1.7rem, direção, máscara 4rem (R9)
│   ├── layout/
│   │   ├── AppNav.vue                      # sem PromptLogo; centralizado; esconde no hero (R5)
│   │   └── AppFooter.vue                   # uma linha (R12)
│   └── sections/
│       ├── HeroSection.vue                 # sem .hero-grid; HeroCrt; penumbra; ▼ scroll acima da dock
│       ├── AboutSection.vue                # DesktopWindow kind=document
│       ├── ContactSection.vue              # DesktopWindow kind=script
│       ├── ProjectCard.vue                 # DesktopWindow kind=project (em volta do BaseCard)
│       ├── SkillsSection.vue               # passa loopDirection; fitas de borda a borda
│       └── EvidenceLink.vue                # sublinhado --grape / --sith-badge
└── App.vue                                 # AppDock; margem de meia tela antes do main (R6)

tests/
├── unit/        terminal.spec.ts, boot.spec.ts, matrix-rain.spec.ts (NOVOS); resume.data, tech-icons
├── component/   DesktopWindow.spec.ts, DockTerminal.spec.ts (NOVOS); TagChip, SkillLoop
└── e2e/         boot, header, dock-terminal, desktop-windows, hero-crt, content-polish (NOVOS);
                 support/boot.ts (waitBootEnd), support/contrast.ts (luminância por pixel),
                 support/webgl.ts (sem WebGL); motion, terminals, skills, reduced-motion, a11y,
                 links, layout, no-js, visual-cleanup, weight (ajustes, R16)

playwright.config.ts                         # projeto `webgl` (boot, hero-crt, motion, weight), 1 worker;
                                             # projeto `chromium` com WebGL desligado

DESIGN.md, README.md                        # dock, terminal, janelas, fundos, boot, fitas, ícones
```

**Structure Decision**: mesma estrutura das features anteriores. Duas pastas novas: `components/dock/`
(dock e terminal) e mais dois componentes em `vendor/vue-bits/`. A lógica testável (boot, terminal,
chuva, WebGL) fica em `src/lib/`, como `typing.ts` e `period.ts`.

## Fases de implementação (resumo para o /speckit-tasks)

1. **Setup**: atualizar as dependências e os dois lockfiles (US8, R14); medir a linha de base;
   `waitBootEnd` nos e2e existentes.
2. **Base**: tipos (`resume.schema.ts`), tokens, `lib/webgl.ts`, `lib/boot.ts`, `lib/matrix-rain.ts`,
   `lib/terminal.ts` com os testes de unidade.
3. **US1 (P1, boot)**: `FaultyTerminal`, `BootScreen` pela linha do tempo, sem pulo, script inline,
   e2e do boot.
4. **US3 (P1, header)**: `useHeroPassed`, `AppNav` escondido, centralizado e sem prompt, meia tela;
   e2e.
5. **US2 (P1, dock)**: `TerminalBar`, `AppDock`, `DockTerminal`, atalho, teclado virtual; e2e.
6. **US4 (P2, janelas)**: `useTerminalTyping` com `complete`/`replay`, `DesktopWindow`, integração
   nas 8 janelas; testes.
7. **US5 (P2, hero)**: `CrtWarp`, `HeroCrt`, chuva ASCII, sem grade, penumbra; e2e de contraste e
   sem WebGL.
8. **US6 (P2, skills)**: largura total, 1.7rem, direção; e2e.
9. **US7 (P3, conteúdo)**: rodapé, JSON, ItaliaMi, sublinhados, Valkey (gerador + sprite); testes.
10. **Polimento**: a11y e no-JS, peso, `DESIGN.md`/README, inspeção manual do quickstart.

## Complexity Tracking

| Violação | Por que é necessária | Alternativa mais simples rejeitada porque |
|----------|----------------------|-------------------------------------------|
| Princípio IV / WCAG 2.2.2: o fundo CRT do hero se move sozinho por mais de 5 s sem botão de pausa (como a chuva Matrix e os loops já faziam) | Pedido do autor (item 5). A falta de pausa já foi aceita na 001, quando o autor retirou o controle global de movimento (FR-035 da 001). Mitigações: parada total com "reduzir movimento" (inclusive ao vivo), parada fora da tela e com a aba oculta, 24 quadros por segundo, fundo decorativo (`aria-hidden`) com o conteúdo do hero completo e legível por cima | Um botão de pausa contraria a decisão do autor na 001; parar sozinho depois de 5 s descaracteriza o pedido |
| Boot sem pulo (antes vetado pelo Princípio IV) | Pedido do autor (item 12), agora permitido pela exceção da constituição v2.3.0, cumprida à risca (R4) | — (deixou de ser violação com a emenda; registrado aqui para rastreio) |
