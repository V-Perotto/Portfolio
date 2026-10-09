# Implementation Plan: Porta de acesso no boot, IP real, Dot Field no hero e ajustes nas janelas

**Branch**: `001-vue-resume-refactor` (a 005 parte do estado da 004; nenhum branch novo) |
**Date**: 2026-10-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/005-access-gate-dotfield/spec.md`

## Summary

Sete pedidos do autor:

- **Porta de acesso (itens 1 e 5)**: a tela de boot deixa de abrir sozinha. Sobre o Faulty Terminal,
  aparece só o ícone `acessar_portfolio.sh` (o mesmo ícone de área de trabalho das janelas
  minimizadas), com uma dica embaixo. O clique abre uma janela de tamanho fixo, só com minimizar e
  fechar, e a sessão SSH é digitada pelo TextType do Vue Bits (vendorizado sem GSAP e guiado pelo
  relógio), 30% mais rápida. Minimizada, a sessão continua e o portfólio abre no fim. Fechada, a
  tentativa acaba e pode ser refeita pelo ícone. Com "reduzir movimento", a porta aparece sem
  animação. A constituição foi emendada para a v3.0.0 (Princípio IV).
- **Sessão (item 2)**: o IP público do visitante, consultado no ipify (com `127.0.0.1` de reserva),
  "Conectando ao portfolio..." e a versão `v2.4`, lida do `package.json` no build.
- **Controles das janelas (item 4)**: os ícones `minus`, `maximize-2` e `x` do Lucide, centrados nos
  círculos.
- **Ícones minimizados (itens 3 e 7)**: o do Contato vai para a esquerda, e os dos projetos ficam
  lado a lado, quebrando conforme a largura (2 / 5 / 6 por linha). O FLIP de encolher passa a partir
  do layout novo.
- **Hero (item 6)**: o CRT Warp e a chuva Matrix saem; entra o Dot Field do Vue Bits, em canvas 2D,
  com as cores do tema.

Nenhuma dependência nova entra no `package.json`. O TextType e o Dot Field são vendorizados sem
GSAP e sem bibliotecas.

## Technical Context

**Language/Version**: TypeScript ~6.0.3, Vue 3.5, Node ≥ 22 no build

**Primary Dependencies**: as da 004 (`vue`, `@unhead/vue` 2, `@vueuse/core`, `motion-v`,
`@lucide/vue`; `vite-ssg`, `vite` 8.3.4, Tailwind 4). **Nenhuma dependência nova**. Vendorizados do
Vue Bits: TextType (sem GSAP, R3) e Dot Field (R12). Serviço externo em tempo de execução: ipify
(R5, exceção do Princípio III).

**Storage**: N/A. O IP do visitante fica só na memória da página (FR-015). A versão vem do
`package.json` no build (R6).

**Testing**: `vue-tsc`; Vitest 5 + `@vue/test-utils` + `happy-dom` (linha do tempo da sessão, versão,
consulta do IP, TextType, AccessGate, DesktopWindow); Playwright 1.64 + `@axe-core/playwright` (e2e
sobre o build, com o ipify simulado por uma fixture comum, CPU lenta via CDP e WebGL desligado no
projeto principal) (R14).

**Target Platform**: navegadores evergreen (precisa de `inert` e `:has()`), desktop e celular; WebGL
opcional (só o fundo da porta); GitHub Pages em `/Portfolio/`.

**Project Type**: site estático pré-renderizado (SPA hidratada de página única).

**Performance Goals**:

- Do clique no ícone à página descoberta em ≤ 4 s (previsto 3,59 s: 320 ms para abrir, 2720 ms de
  sessão, 550 ms de saída), inclusive com a CPU 4× mais lenta. Com movimento reduzido, ≤ 1,2 s.
- Animações da porta e das janelas: 320 ms (só `transform`, `opacity` e a altura do contêiner).
- Dot Field: laço a 60 quadros por segundo só para o halo; canvas redesenhado ~7,5 vezes por segundo
  (troca do Sparkle); parado fora da tela e com a aba oculta.
- HTML + CSS + JS iniciais: no máximo +3 KB gzip sobre a linha de base medida no início (R15).

**Constraints**:

- Conteúdo completo e navegação por âncora sem JS: nada da porta no HTML pré-renderizado.
- A porta é operável por teclado e por leitor de tela, com a página inerte por trás.
- `prefers-reduced-motion`: a porta aparece sem nenhuma animação, e o Dot Field não aparece.
- O único pedido a terceiros novo é o ipify, com degradação silenciosa.
- Console sem erros do site, inclusive com o ipify bloqueado e sem WebGL.
- Sem rolagem horizontal a partir de 320 px, inclusive durante as animações de minimizar.
- Contraste ≥ 4,5:1 no nome do ícone e na dica sobre o Faulty Terminal, e no texto do hero sobre o
  Dot Field.

**Scale/Scope**:

- 1 componente substituído (`BootScreen` → `AccessGate`).
- 4 componentes novos: `DesktopIcon`, `TextType` vendorizado, `DotField` vendorizado, `HeroDots`.
- 3 módulos novos em `src/lib/`: `visitor-ip`, `flip`, `boot` reescrito.
- ~8 componentes alterados: `DesktopWindow`, `TerminalBar`, `TerminalWindow`, `ContactSection`,
  `ProjectsSection`, `HeroSection`, `App`, `DockTerminal` (só os ícones).
- 7 arquivos removidos (CRT e Matrix).
- ~25 specs e2e com o import da fixture trocado.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constituição **v3.0.0** (emendada em 2026-10-09 para esta feature: a exceção do boot no Princípio IV
vira uma porta de acesso).

| Princípio | Verificação | Pré-pesquisa | Pós-design |
|-----------|-------------|--------------|------------|
| I. Fidelidade ao Currículo | Nenhum dado do currículo muda. A versão `v2.4` é do site, não do currículo | PASS | PASS |
| II. Projetos Demonstráveis | Minimizar ou fechar continua reversível e sem persistência; o reagrupamento dos ícones mantém a ordem de relevância; sem JS e na impressão, as janelas saem abertas | PASS | PASS |
| III. Saída Estática | Porta, Dot Field e IP só existem no cliente (o HTML publicado continua com todo o conteúdo). O ipify é **exceção justificada**: decisão do autor (Q3), degrada para `127.0.0.1` sem erro do site, sem cookies nem referer (R5). **Nenhuma dependência nova** (TextType e Dot Field vendorizados sem GSAP, R3, R12). Versão lida do `package.json` no build (R6) | PASS (exceção registrada) | PASS |
| IV. Acessibilidade e Desempenho | Exceção v3.0.0 aplicada à risca: a porta espera a ação; depois dela, ≤ 4 s (3,59 s previstos, R3); sessão nunca cortada nem pulável; teclado e leitor de tela (`dialog`, foco no ícone, `inert` atrás, status anunciado, R7); fechar permite tentar de novo; sem JS e com JS atrasado, sem porta (R2); com movimento reduzido, porta sem animação. Ícones dos controles com nome acessível inalterado; contraste por penumbra (R8) e pela `--hero-scrim`; console limpo | PASS com ressalva (fundo animado contínuo sem pausa; ver Complexity Tracking) | PASS com ressalva |
| V. Identidade Visual Coerente | Reaproveita o ícone de área de trabalho (extraído para `DesktopIcon`), a `TerminalWindow`/`TerminalBar` e o FLIP da 004; ícones do Lucide, já usado; cores do Dot Field e largura da janela em tokens (`--dots-*`, `--gate-window-width`) | PASS | PASS |
| Restrições de Conteúdo e Tecnologia | O IP do visitante é exibido só para ele mesmo e não é publicado nem guardado; nenhum dado pessoal do autor novo | PASS | PASS |
| Fluxo de Trabalho e Verificação | O quickstart (V1–V18) cobre o build de produção, desktop e celular, sem JS, movimento reduzido (inclusive ao vivo), sem WebGL, ipify bloqueado, impressão e CPU lenta | PASS | PASS |

### Justificativa de dependências e recursos externos (Princípio III)

| Item | Por quê | Peso no cliente |
|------|---------|-----------------|
| TextType vendorizado (`vendor/vue-bits/TextType.vue`, MIT + Commons Clause) | pedido do autor (item 5); sem GSAP, guiado pelo relógio (R3) | ~1 KB gzip, pedaço inicial (a porta aparece na montagem) |
| Dot Field vendorizado (`vendor/vue-bits/DotField.vue`) | pedido do autor (item 6); canvas 2D, sem bibliotecas (R12) | ~2 KB gzip com o `HeroDots`, pedaço à parte, depois da porta |
| ipify (`https://api.ipify.org?format=json`) em tempo de execução | pedido do autor (item 2, Q3); site estático não conhece o IP; CORS `*`, sem chave (R5) | 1 pedido de 23 bytes; falha → `127.0.0.1` |
| Ícones `Minus`, `Maximize2`, `X` do `@lucide/vue` (já instalado) | pedido do autor (item 4) | ~0,3 KB gzip |
| Versão `2.4.0` no `package.json` (`define` no build) | pedido do autor (item 2, clarify) | só a string `2.4.0` |

**Removidos**: `CrtWarp.vue`, `HeroCrt.vue`, `scenes/crt.ts`, `crt.worker.ts`, `matrix-rain.ts`
(e os testes deles), `bootFrame`, as constantes do teto de 7 s e o painel `.boot-body`.

## Project Structure

### Documentation (this feature)

```text
specs/005-access-gate-dotfield/
├── plan.md                      # este arquivo
├── research.md                  # Phase 0: R1–R15
├── data-model.md                # Phase 1: tentativa de acesso, sessão, TextType, Dot Field, tokens
├── quickstart.md                # Phase 1: cenários V1–V18
├── contracts/
│   ├── access-gate.md           # DOM, ARIA, classes do <html>, estados, tempos, textos
│   └── ip-lookup.md             # pedido, resposta, validação, reserva e privacidade
├── checklists/
│   └── requirements.md
└── tasks.md                     # /speckit-tasks
```

### Source Code (repository root)

```text
index.html                                  # booting também com movimento reduzido; sem o teto de 7 s;
                                            # segurança aos 3900 ms se a porta não apareceu (R2)
package.json, package-lock.json             # version 2.4.0 (R6)
vite.config.ts, vitest.config.ts            # define __PORTFOLIO_VERSION__ (R6)

src/
├── env.d.ts                                # declare const __PORTFOLIO_VERSION__
├── lib/
│   ├── boot.ts                             # REESCRITO: SESSION_LINES, sessionAt(), SESSION_MS 2720,
│   │                                       #   GATE_LATEST_START_MS 2055, APP_FAILED_MS 3900, FADE_MS,
│   │                                       #   REDUCED_HOLD_MS 1000, FALLBACK_IP, displayVersion() (R3, R6)
│   ├── visitor-ip.ts                       # NOVO: lookupVisitorIp() + isIPv4() (R5)
│   ├── flip.ts                             # NOVO: toward(), finishAll() (extraídos do DesktopWindow, R1, R10)
│   ├── matrix-rain.ts                      # REMOVIDO (R13)
│   ├── scenes/crt.ts                       # REMOVIDO
│   └── webgl.ts                            # cabeçalho sem o CRT; tokenRgb e hasWebGL ficam
├── workers/crt.worker.ts                   # REMOVIDO
├── styles/
│   ├── tokens.css                          # --dots-*, --gate-window-width (data-model)
│   └── base.css                            # .cursor de largura zero na porta; impressão sem .access-gate
├── components/
│   ├── vendor/vue-bits/
│   │   ├── TextType.vue                    # NOVO (vendorizado e adaptado, R3)
│   │   ├── DotField.vue                    # NOVO (vendorizado e adaptado, R12)
│   │   └── CrtWarp.vue                     # REMOVIDO
│   ├── base/DesktopIcon.vue                # NOVO: botão de área de trabalho extraído (R1)
│   ├── terminal/
│   │   ├── AccessGate.vue                  # NOVO (substitui BootScreen.vue): porta, janela, sessão,
│   │   │                                   #   IP, inert, foco, status (R1–R5, R7, R8)
│   │   ├── BootScreen.vue                  # REMOVIDO
│   │   ├── HeroDots.vue                    # NOVO: tokens → DotField (R12)
│   │   ├── HeroCrt.vue                     # REMOVIDO
│   │   ├── DesktopWindow.vue               # usa DesktopIcon e lib/flip; FLIP a partir do layout novo (R10)
│   │   ├── TerminalBar.vue                 # ícones Lucide; prop maximizable (R9)
│   │   └── TerminalWindow.vue              # repassa maximizable
│   └── sections/
│       ├── HeroSection.vue                 # HeroDots no lugar do HeroCrt; sem exigir WebGL (R12)
│       ├── ContactSection.vue              # centralizado só aberto (R10)
│       └── ProjectsSection.vue             # lista flex-wrap com :has() (R11)
└── App.vue                                 # AccessGate no lugar do BootScreen

tests/
├── unit/        boot.spec.ts (reescrito), visitor-ip.spec.ts (NOVO); matrix-rain.spec.ts (REMOVIDO)
├── component/   TextType.spec.ts, AccessGate.spec.ts (NOVOS); DesktopWindow.spec.ts (ajuste)
└── e2e/         support/test.ts (NOVO: fixture do ipify), support/boot.ts (enterPortfolio);
                 access-gate, window-controls, minimized-layout, hero-dots (NOVOS); boot (sessão,
                 IP, versão, CPU lenta); hero-crt (REMOVIDO); ~25 specs com o import da fixture;
                 weight (ipify na lista de permitidos); reduced-motion, no-js, a11y, motion (ajustes)

playwright.config.ts                        # projeto webgl: boot, motion, weight (sem hero-crt)

DESIGN.md, README.md                        # porta de acesso, Dot Field, controles Lucide, versão
```

**Structure Decision**: a mesma das features anteriores. A lógica testável (linha do tempo, IP, FLIP)
fica em `src/lib/`; os componentes do Vue Bits, em `vendor/vue-bits/`; o ícone extraído vai para
`components/base/`, ao lado dos outros componentes reutilizáveis.

## Fases de implementação (resumo para o /speckit-tasks)

1. **Setup**: medir a linha de base de peso; versão 2.4.0 e `define`; fixture do ipify e
   `enterPortfolio` nos e2e (com a porta ainda inexistente, o helper aceita o boot antigo).
2. **Base**: `lib/boot.ts` reescrito, `lib/visitor-ip.ts`, `lib/flip.ts`, tokens, `DesktopIcon`
   extraído, `TerminalBar` com `maximizable`, com os testes de unidade.
3. **US1 + US2 (P1, porta e sessão)**: `TextType` vendorizado, `AccessGate`, script inline, `App`,
   remoção do `BootScreen`; e2e da porta e da sessão.
4. **US3 (P2, hero)**: `DotField`, `HeroDots`, `HeroSection`, remoção do CRT e da chuva; e2e.
5. **US4 (P2, controles)**: ícones Lucide no `TerminalBar`; e2e do centro.
6. **US5 (P2, ícones minimizados)**: FLIP a partir do layout novo, Contato, projetos; e2e.
7. **Polimento**: a11y, sem JS, movimento reduzido, peso, `DESIGN.md`/README, inspeção manual do
   quickstart.

## Complexity Tracking

| Violação | Por que é necessária | Alternativa mais simples rejeitada porque |
|----------|----------------------|-------------------------------------------|
| Princípio IV / WCAG 2.2.2: o Dot Field do hero cintila sozinho por mais de 5 s sem botão de pausa (como o CRT da 004 e os loops) | Pedido do autor (item 6). A falta de pausa já foi aceita na 001, quando o autor retirou o controle global de movimento. Mitigações: some com "reduzir movimento" (inclusive ao vivo), para fora da tela e com a aba oculta, o canvas muda só ~7,5 vezes por segundo, fundo decorativo (`aria-hidden`) sob a penumbra do texto | Um botão de pausa contraria a decisão do autor na 001 |
| Porta sem teto de tempo (antes vetada pelo Princípio IV) | Pedido do autor (item 1), agora permitido pela exceção da constituição v3.0.0, cumprida à risca (R2, R3, R7) | — (deixou de ser violação com a emenda; registrado aqui para rastreio) |
| Pedido a terceiro em tempo de execução (ipify) | Pedido do autor (item 2, Q3): o site estático não tem como saber o IP | Manter `127.0.0.1` fixo (rejeitado no Q3); é exceção prevista no Princípio III, com degradação (R5) |
| Princípio IV ("console sem erros") com o ipify bloqueado ou fora do ar | Quando um bloqueador ou a rede derruba o pedido, o próprio navegador grava a falha (`net::ERR_BLOCKED_BY_CLIENT`, `ERR_FAILED`) no console, e nenhum código da página consegue suprimir. É a mesma situação dos badges do shields.io. Leitura adotada: o console fica sem erros do site em funcionamento normal (os e2e simulam o ipify); a falha de um terceiro é o caso "degradar com elegância" do Princípio III, em que o site não lança nem registra nada e mostra `127.0.0.1` | Não consultar o IP (rejeitado no Q3); um proxy próprio (exigiria servidor, contra o Princípio III) |
