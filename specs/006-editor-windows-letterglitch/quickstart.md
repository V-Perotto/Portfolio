# Quickstart: validar a feature 006

**Feature**: `006-editor-windows-letterglitch` | Contratos: [editor-window](contracts/editor-window.md),
[hero-and-gate](contracts/hero-and-gate.md) | Dados: [data-model](data-model.md)

## Pré-requisitos

- Node ≥ 22, `npm ci` (ou `pnpm install`)
- `npx playwright install chromium`

## Comandos

```bash
npm run typecheck        # vue-tsc + tsc
npm run test             # Vitest: editor-files, hero-loader, curvatura, Letter Glitch, componentes
node tools/build-favicon.mjs   # só se os tokens de cor mudarem (os arquivos gerados são versionados)
npm run build            # build estático em dist/
npm run test:e2e         # build + Playwright + axe
npm run preview          # http://localhost:4173/Portfolio/ para a inspeção manual
```

## Cenários

| # | Cenário | Como verificar | Esperado |
|---|---------|----------------|----------|
| V1 | Editor na Experiência (US1, FR-001 a FR-009) | e2e `editor-windows.spec.ts` em 1366 px: rolar até `#experiencia` | janela `~/carreira`; `code ~/carreira` digitado; depois aba, árvore com 5 arquivos na ordem (2026-03 … 2020-10), arquivo 1 aberto com números de linha, rodapé `~/carreira/2026-03_confidencial.yml` · `1 / 5` |
| V2 | Conteúdo × cartões (FR-006, SC-001) | para cada item das 3 janelas, abrir o arquivo e comparar o texto com o do cartão (cargo, empresa, local, período, resumo, resultados, stack; nome, data, link…) | todos os fatos presentes, mesmo texto, mesmo formato de período; links com `target="_blank"` e `rel="noopener noreferrer"` |
| V3 | Trocar de arquivo (FR-004, FR-010, SC-002) | clicar em cada arquivo; repetir só com teclado (Tab até a árvore, Enter/Espaço) | altura do `.editor-frame` constante (0 px); `aria-current` no aberto; foco no botão escolhido; nada abaixo da janela se move |
| V4 | Celular (FR-011) | 320 e 390 px | árvore acima do arquivo; `scrollWidth ≤ clientWidth` na página; linhas longas quebram dentro do painel |
| V5 | Maximizar (FR-013, FR-015 a FR-017, SC-003) | `.t-max`; medir o `.editor-frame`; 20 Tabs; Esc; repetir com clique no fundo e com o botão | ≥ 95% (desktop) / ≥ 95% (390 px) da tela; `#app[inert]`; desfoque presente; árvore à esquerda e cartões no lugar do arquivo; o foco não sai da janela; Esc/clique fora/botão restauram no mesmo lugar e na mesma rolagem, com foco no `.t-max`; ≤ 400 ms cada |
| V6 | Árvore com a janela maximizada (FR-016) | maximizar Challenges e escolher o 6º arquivo | o painel de cartões rola até o 6º cartão; restaurar abre o arquivo 6 |
| V7 | Minimizar/fechar maximizada (FR-018) | maximizar e clicar em `−`; repetir com `✕` | restaura e encolhe até o ícone no lugar da janela; sem desfoque nem `inert` depois |
| V8 | Ctrl+Alt+T maximizada (edge case) | maximizar e apertar Ctrl+Alt+T | o terminal da dock não abre |
| V9 | Sem JS e impressão (FR-012) | `javaScriptEnabled: false`; `emulateMedia({ media: 'print' })` | as 3 seções mostram todos os cartões de hoje; sem árvore nem YAML visíveis; o texto de cada item aparece uma vez na árvore de acessibilidade |
| V10 | Página no hero no fim da porta (US2, FR-020, FR-021, SC-004) | rolar 2500 px e recarregar; abrir `/#projetos`; recarregar com `#contato` | ao fim da porta, `scrollY = 0` e `location.hash = ''` nos três casos; `history.length` não aumenta |
| V11 | Sem porta (FR-022) | atrasar o bundle em 2,5 s com `/#projetos` | a página fica na âncora; o site não rola |
| V12 | Reabrir sem piscar (US3, FR-023, FR-024, SC-005) | fechar e reabrir cada uma das 11 janelas; amostrar a cada 16 ms a opacidade das saídas durante o crescimento e a digitação | nenhuma saída com opacidade > 0 antes de o comando dela terminar; minimizada reabre completa; com movimento reduzido, reabre completa |
| V13 | `□` desativado (US7, FR-025, SC-008) | captura do `.t-max` com e sem o mouse sobre ele, em Sobre, um projeto, Contato e terminal da dock | capturas iguais; opacidade ≤ 0,4; `cursor: default`; na porta, sem `□` |
| V14 | Dica da dock (FR-026, FR-027, SC-009) | mouse sobre o botão; Tab até ele; Esc; abrir o terminal; `hasTouch` | dica `Ctrl + Alt + T` em ≤ 300 ms com o mouse e na hora com o foco; some com Esc e ao abrir; nenhum `title`; em toque, não aparece |
| V15 | Favicon (FR-028) | `dist/` e `<head>` | `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` respondem 200; o SVG tem o traço verde, o fundo escuro e o filtro roxo |
| V16 | Letter Glitch (US4, FR-029 a FR-031, FR-034) | `hero-glitch.spec.ts` em 1366 e 390 px; duas capturas com 200 ms de intervalo; redimensionar | canvas no hero, sem Dot Field; pixels das letras mudam entre as capturas; cantos mais escuros que o anel (vinheta das bordas); centro mais escuro que o anel (vinheta central); letras não distorcem ao redimensionar |
| V17 | Contraste do hero (FR-032, SC-006) | 10 quadros, texto transparente, `support/contrast.ts` | ≥ 4,5:1 em todo texto do hero, 1366 e 390 px |
| V18 | Letter Glitch parado (FR-033) | rolar para fora do hero; aba oculta; ligar "reduzir movimento" no meio | `.letter-glitch[data-paused]` fora da tela e com a aba oculta (a cena recebe `visible(false)`), e duas capturas do canvas iguais nesse estado; com movimento reduzido, `.hero-glitch` sai e ficam os degradês; console limpo |
| V19 | Lattice Loader (US5, FR-037 a FR-044, SC-007) | entrar no portfólio; registrar `data-loader` e o texto a cada 100 ms; medir os retângulos do hero antes e depois de `hidden`; movimento reduzido; sem JS | `working` (roxo, "Inicializando portfolio.service") → `done` entre 3,0 e 3,5 s (verde, "portfolio.service carregado com sucesso!") → `hidden` 3 s depois; retângulos iguais; sem `role="status"`; reduzido: `done` → `hidden` em 3 s sem fade; sem JS: `done` fixo |
| V20 | Vinheta da porta (US6, FR-035) | captura do anel em volta do ícone antes/depois; contraste em 10 quadros (projeto `webgl`) | anel mais claro que hoje (o Faulty aparece); nome do ícone e dica ≥ 4,5:1 |
| V21 | Curvatura (FR-036, SC-010) | unidade `curvatureFor`; captura da porta a 390 × 844 | 0,2 em 1366 × 768 e 1920 × 1080; ≈ 0,052 em 390 × 844; linhas do fundo só levemente curvas |
| V22 | Versão (FR-045) | `version.spec.ts`; linha 4 da sessão | `Bem-vindo ao Portfolio v2.5` |
| V23 | Peso, a11y e console (SC-011, SC-012) | `weight.spec.ts`; `a11y.spec.ts` com a janela normal, maximizada e minimizada, movimento reduzido e sem JS | inicial ≤ 500 KB e HTML+CSS+JS iniciais ≤ 91.642 B + 18 KB gzip (medido 107.695 B); nenhum pedido novo a terceiros; 0 violações do axe; 0 erros do site no console |

## Inspeção na implementação (2026-10-09)

Feita no build servido (`npm run preview`), com screenshots num Chromium com a GPU da máquina
(`--ignore-gpu-blocklist --enable-gpu --use-angle=gl`), em 1366 × 800 e 390 × 844, console sem erros:

- hero com o Letter Glitch e o Lattice Loader trabalhando (grade roxa) e pronto (✓ verde);
- as três janelas de editor (árvore, YAML numerado, rodapé; a do Comunitário, com um arquivo, no
  celular) e a de Challenges maximizada com o 4º arquivo escolhido (a lista rolada até o cartão dele);
- a dica `Ctrl + Alt + T` da dock;
- a porta antes e depois da vinheta nova (o halo grande sumiu; os dígitos aparecem em volta do ícone)
  e a curvatura nova no celular (linhas só levemente curvas);
- o favicon ampliado sobre aba clara e escura.

Suíte: Vitest 189/189; Playwright 206/206 com 4 workers (`playwright.config.ts`; com ~9 navegadores
em paralelo, os testes de tempo da porta oscilam). Peso: HTML + CSS + JS iniciais 107.695 B gzip
(+16,0 KB sobre a 005; SC-011 revisada para +18 KB, research R17), carregamento inicial 318,6 KB.

## Inspeção manual (autor)

Com `npm run preview` no navegador do dia a dia (GPU real) e num celular físico:

- As três janelas de editor: aparência ao lado da imagem de referência, troca de arquivo, maximizar e
  restaurar, desfoque da página.
- O Letter Glitch no hero (ritmo da troca, intensidade das letras e das vinhetas) e o Lattice Loader.
- O favicon numa aba clara e numa escura.
- A porta no celular: vinheta mais leve e curvatura suave.
