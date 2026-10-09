# Quickstart: validar a feature 005

**Feature**: `005-access-gate-dotfield` | Contratos: [access-gate](contracts/access-gate.md),
[ip-lookup](contracts/ip-lookup.md) | Dados: [data-model](data-model.md)

## Pré-requisitos

- Node ≥ 22, `npm ci` (ou `pnpm install`)
- `npx playwright install chromium`
- Rede só para a inspeção manual do IP real (os testes simulam o ipify)

## Comandos

```bash
npm run typecheck        # vue-tsc + tsc
npm run test             # Vitest: linha do tempo, versão, IP, TextType, AccessGate, DesktopWindow
npm run build            # build estático em dist/
npm run test:e2e         # build + Playwright + axe
npm run preview          # http://localhost:4173/Portfolio/ para a inspeção manual
```

## Cenários

| # | Cenário | Como verificar | Esperado |
|---|---------|----------------|----------|
| V1 | Porta na carga (US1, FR-001 a FR-003) | e2e `access-gate.spec.ts` em 1366 e 390 px | só o ícone `acessar_portfolio.sh` e a dica no centro, sobre o Faulty Terminal; foco no ícone; Tab não sai da porta; clique fora não faz nada; `#app > *:not(.access-gate)` com `inert` |
| V2 | Abrir e sessão (FR-004 a FR-006, FR-013, FR-018) | clicar (e, em outro teste, Enter) no ícone; amostrar a altura da janela a cada 100 ms | janela cresce em ≤ 400 ms; altura constante do primeiro ao último quadro; barra só com `.t-min` e `.t-close`; seis linhas iguais ao [contrato](contracts/access-gate.md#3-textos-da-sessão-fr-013); cursor só na linha em curso |
| V3 | Página descoberta (FR-009, SC-002) | medir do clique até `booting` sair, 10 vezes em 1366 px e 10 em 390 px com CPU 4× mais lenta (CDP) | ≤ 4000 ms em 100%; foco no início do documento (o Tab chega à navegação); dock visível depois |
| V4 | Minimizar continua (FR-007, clarify Q1) | minimizar 300 ms depois de abrir; reabrir 600 ms depois; minimizar de novo e esperar | ao reabrir, linhas já digitadas e digitação em curso (não recomeça); minimizada até o fim, a página abre sozinha no mesmo tempo total |
| V5 | Fechar e tentar de novo (FR-008, Q2) | fechar no meio; esperar 4 s; fechar no último instante (depois de `./iniciar_portfolio.sh`); abrir de novo | página continua coberta; foco no ícone; status "Conexão encerrada"; nova tentativa começa na linha 1 |
| V6 | Movimento reduzido (FR-012) | `emulateMedia({ reducedMotion: 'reduce' })` | porta sobre fundo liso (sem canvas); janela abre sem animação, com as seis linhas na hora; página descoberta em ≤ 1200 ms, sem fade |
| V7 | JS atrasado e sem JS (FR-011) | atrasar o bundle em 2,5 s (`page.route`); bloquear o JS; desligar o JS | sem porta: página direto; com JS bloqueado, capa sai em ~2,1 s; sem JS, nada da porta e conteúdo completo |
| V8 | Âncora (Edge Case) | abrir `/#projetos`, entrar | ao fim, `#projetos` no topo abaixo do header, foco nele |
| V9 | IP real e reserva (US2, FR-014, FR-015, SC-003) | fixture com `203.0.113.7`; outro teste com `route.abort()`; outro com atraso de 6 s | `203.0.113.7` nas linhas 1 e 5; `127.0.0.1` com falha e com atraso; sem erro do site no console (só a falha de rede do próprio navegador, filtrada); um único pedido ao ipify por carga |
| V10 | Versão (FR-016, SC-004) | unidade compara com `package.json`; e2e lê a linha 4 | `Bem-vindo ao Portfolio v2.4` |
| V11 | Contraste na porta (FR-001, FR-021) | e2e com `support/contrast.ts`: 10 quadros do Faulty Terminal, texto transparente, luminância máxima sob o nome do ícone e a dica | ≥ 4,5:1 |
| V12 | Controles Lucide (US4, FR-022 a FR-024, SC-005) | e2e `window-controls.spec.ts`: em sobre, um projeto, contato, dock e porta, medir o centro do SVG × o centro do `.t-btn`; HTML sem JS | Δ ≤ 0,5 px em x e y; SVGs de 12 px; `lucide-minus`, `lucide-maximize-2`, `lucide-x`; sem JS, os mesmos ícones decorativos |
| V13 | Contato à esquerda (FR-025, SC-006) | e2e `minimized-layout.spec.ts` em 320/768/1366/1920 px: minimizar o contato | `icon.left − h2.left` ≤ 1 px (igual ao do Sobre); aberto, a janela continua centralizada com ≤ 720 px; a animação parte da janela centralizada (primeiro quadro no lugar de antes) |
| V14 | Projetos lado a lado (FR-026, FR-027, SC-007) | minimizar os 6 em 320/768/1024/1366/1920 px; depois abrir o 2º; medir `scrollWidth` a cada quadro durante uma animação | 3 / 2 / 1 / 1 / 1 linhas, alinhadas à esquerda, na ordem; com o 2º aberto: ícone 1, janela 2 numa linha própria, ícones 3–6 numa linha; nunca `scrollWidth > clientWidth` |
| V15 | Dot Field (US3, FR-028 a FR-031) | e2e `hero-dots.spec.ts` + screenshot em 1366 e 390 px; mover o mouse sobre o hero | canvas no hero; sem `.hero-crt`; pixels no canto superior esquerdo arroxeados e no inferior direito esverdeados; halo aparece com o mouse em movimento e some parado; pontos não se deslocam |
| V16 | Contraste do hero (FR-032, SC-008) | 10 quadros do hero animado, texto transparente | texto ≥ 4,5:1 |
| V17 | Dot Field parado (FR-033) | rolar para fora do hero; aba oculta; ligar "reduzir movimento" no meio da visita | sem redesenho fora da tela; o componente sai com movimento reduzido (degradês estáticos); sem erros; ouvintes de `mousemove`/`resize` removidos ao sair |
| V18 | Peso, a11y e console (SC-009, SC-010) | `weight.spec.ts`, `a11y.spec.ts` na porta, com a janela aberta e minimizada, depois do acesso, com movimento reduzido e sem JS | inicial ≤ 500 KB e ≤ linha de base + 3 KB gzip; únicos pedidos de fora: badges e ipify; 0 violações do axe; 0 erros do site no console |

## Inspeção manual (autor)

Feito na implementação (2026-10-09), com screenshots em `.playwright-mcp/` tirados num Chromium com
a GPU da máquina (`--ignore-gpu-blocklist --enable-gpu --use-angle=gl`): porta parada e aberta a 390
px, hero com o Dot Field a 1366 e 390 px, projetos minimizados a 390 px (2 por linha) e a 1366 px (6
numa linha), Contato minimizado à esquerda. O Chromium dos testes usa WebGL por software
(SwiftShader), em que abrir a janela sobre o Faulty Terminal para os quadros por ~2 s; com a GPU
real, não (research R1, revisões). Por isso os e2e medem tempo por relógio, e não por quadros.

Fica com o autor:

- Abrir o `npm run preview` no navegador do dia a dia (GPU real): Faulty Terminal atrás da porta,
  abrir, minimizar e fechar a janela, e o Dot Field no hero, com o halo seguindo o mouse.
- Conferir o IP real na sessão e, com um bloqueador de anúncios que barre o `api.ipify.org`, a
  reserva `127.0.0.1`.
- Celular físico: dica "toque no ícone", janela inteira na tela, ícones dos projetos 2 por linha.
