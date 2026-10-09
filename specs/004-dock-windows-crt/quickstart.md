# Quickstart: validar a feature 004

**Feature**: `004-dock-windows-crt` | Contratos: [page-contract](contracts/page-contract.md),
[terminal-commands](contracts/terminal-commands.md) | Dados: [data-model](data-model.md)

## Pré-requisitos

- Node ≥ 22, `npm ci` (ou `pnpm install`)
- `npx playwright install chromium` (de novo depois da atualização do Playwright para 1.64)
- Para regenerar o sprite (só no T do Valkey): rede e `npx`

## Comandos

```bash
npm run typecheck        # vue-tsc + tsc
npm run test             # Vitest: dados, motor do terminal, linha do tempo do boot, chuva, componentes
npm run build            # build estático em dist/
npm run test:e2e         # build + Playwright + axe
npm run preview          # http://localhost:4173/Portfolio/ para a inspeção manual
node tools/build-tech-icons.mjs --preview /tmp/icons.html   # só se o sprite mudar
```

## Cenários

| # | Cenário | Como verificar | Esperado |
|---|---------|----------------|----------|
| V1 | Boot inteiro (US1, SC-001) | e2e `boot.spec.ts`: 20 recargas em 1440px e 20 em 390px com CPU 4× mais lenta (CDP `Emulation.setCPUThrottlingRate`); registrar o texto da última linha e o instante em que a página fica descoberta | última linha `./iniciar_portfolio.sh` completa em 100% das recargas com boot; descoberta ≤ 7000 ms |
| V2 | Boot sem pulo (FR-031) | clicar, tocar e apertar Esc/Enter/Espaço durante o boot | o boot continua; não há dica de pulo |
| V3 | JS atrasado (FR-032) | atrasar o bundle em 2,5 s (`page.route`) | sem boot; página descoberta assim que o JS chega, sempre < 7 s; com o JS bloqueado, capa sai em ~2,1 s |
| V4 | Faulty Terminal (FR-028 a FR-030) | screenshot do boot em 1440 e 390px; contraste do texto sobre o painel | fundo com os dígitos acendendo; texto ≥ 4,5:1 |
| V5 | Header só depois do hero (US3, SC-003) | e2e `header.spec.ts`: rolar em passos de 50px; registrar visibilidade do header × posição do hero | invisível com o hero sob o header; visível ≤ 300 ms depois (no e2e, medido em quadros: a classe chega em ≤ 3 quadros, para não depender da carga da máquina); título do Sobre nunca coberto; Tab no topo revela o header |
| V6 | Espaço de meia tela (FR-014) | medir `#sobre h2.top − #home.bottom` em 1440×900 e 390×844 | 50% da altura da janela ± 5% |
| V7 | Dock e terminal (US2, SC-002) | e2e `dock-terminal.spec.ts`: abrir pela dock e por Ctrl+Alt+T; `help`; `find pro` + Tab + Enter; `find Experiência`; `foo`; `find xyz`; ↑; `clear`; `exit`; ✕; Esc | saídas iguais às do [contrato](contracts/terminal-commands.md); seção no topo abaixo do header e acima do terminal; terminal aberto depois do `find`; foco de volta na dock ao fechar |
| V8 | Header centralizado (FR-017) | em 1440px, centro do grupo de links × centro da tela; em 390px, centro do botão do menu | diferença ≤ 2px; sem o prompt no header |
| V9 | Janelas: minimizar (US4, FR-002 a FR-004) | e2e `desktop-windows.spec.ts`: minimizar o SRG durante a digitação; medir a duração da animação; abrir | ícone FolderCode + "SRG" no lugar; conteúdo seguinte sobe; animação ≤ 400 ms; reabre completo, sem digitar |
| V10 | Janelas: fechar (FR-005) | fechar `sobre.txt` e abrir | ícone FileText; ao abrir, os comandos digitam de novo e terminam em ≤ 2,5 s |
| V11 | Janelas: teclado e leitor de tela (FR-007) | Tab até "Minimizar contato.sh", Enter, Enter no ícone | nomes acessíveis certos; foco no ícone e depois no botão de minimizar |
| V12 | Fundo CRT (US5) | screenshot do hero em 1440 e 390px; mover o mouse; inspecionar o canvas | tubo com curvatura, scanlines e vinheta; chuva só com ASCII; o tubo deforma com o mouse; sem `.hero-grid` |
| V13 | Contraste do hero (FR-038, SC-005) | e2e `hero-crt.spec.ts`: 10 quadros, texto transparente, luminância máxima sob cada caixa | texto ≥ 4,5:1, botões ≥ 3:1 |
| V14 | Skills (US6, SC-007) | e2e `skills.spec.ts` em 320/768/1440/1920px | fitas de borda a borda do `main`, sem rolagem horizontal; `font-size` 27,2px (1,7rem); `conceitos_web` e `desenho_de_processos` andando para a direita |
| V15 | Conteúdo (US7) | e2e `content-polish.spec.ts` | rodapé com 1 linha; chip `JSON`; sublinhados `--grape`/`--sith-badge`; `#dashboard-valkey` no SRG e no loop; papel do ItaliaMi |
| V16 | Dependências (US8, SC-009) | `npm outdated`; `npm ls typescript @unhead/vue beasties`; `pnpm install --frozen-lockfile` | só TypeScript, @unhead/vue e beasties fora da mais nova, com o motivo no plano; lockfiles coerentes |
| V17 | Degradação (FR-009, FR-016, FR-026, FR-033, FR-039) | sem JS; "reduzir movimento"; sem WebGL (`getContext` → `null`); "reduzir movimento" ligado no meio | sem dock, terminal, canvas nem ícones; navegação como hoje; janelas abertas; fundos estáticos; console sem erro |
| V18 | Acessibilidade (SC-008) | `a11y.spec.ts` ampliado: terminal aberto, janela minimizada, header escondido | axe sem violações críticas/sérias |
| V19 | Peso (SC-006) | `weight.spec.ts` e gzip dos assets | inicial ≤ 95,3 KB gzip (HTML+CSS+JS); total ≤ 500 KB |

## Inspeção manual (constituição: Fluxo de Trabalho e Verificação)

1. `npm run build && npm run preview`, em desktop (1440×900) e celular (390×844, toque).
2. Assistir ao boot do começo ao fim, três vezes, com e sem CPU lenta: nada pula e nada corta.
3. Rolar do hero ao Sobre devagar: o hero fica limpo, o header surge no vazio, centralizado.
4. Abrir o terminal pela dock (no Linux, o Ctrl+Alt+T pode abrir o terminal do sistema; é o caso
   previsto na spec). No Windows ou no macOS, testar também o atalho. No celular, digitar `find`
   e tocar numa sugestão; conferir que o teclado virtual não cobre o prompt.
5. Minimizar e fechar as três janelas de tipos diferentes; abrir de novo; imprimir a página (prévia de
   impressão) com janelas minimizadas e conferir que saem completas.
6. Repetir 2–5 com "reduzir movimento" e com JavaScript desativado.
7. Console sem erros em todos os passos.
