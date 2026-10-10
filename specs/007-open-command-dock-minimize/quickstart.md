# Quickstart: validar a feature 007

**Feature**: `007-open-command-dock-minimize` | Contratos: [terminal-open](contracts/terminal-open.md),
[dock-minimize](contracts/dock-minimize.md), [hero-and-about](contracts/hero-and-about.md) | Dados:
[data-model](data-model.md)

## Pré-requisitos

- Node ≥ 22, `npm ci` (ou `pnpm install`)
- `npx playwright install chromium`

## Comandos

```bash
npm run typecheck        # vue-tsc + tsc
npm run test             # Vitest: terminal, sections (openTargets), DockTerminal, DesktopWindow, RevealText
npm run build            # build estático em dist/
npm run test:e2e         # build + Playwright + axe
npm run preview          # http://localhost:4173/Portfolio/ para a inspeção manual
```

## Cenários

| # | Cenário | Como verificar | Esperado |
|---|---------|----------------|----------|
| V1 | `open` de um projeto aberto (US1, FR-001, FR-003, FR-004) | e2e `open-command.spec.ts`, 1366 × 768: no hero, abrir o terminal, `open italiami` | saída `→ ~/projetos/italiami`; terminal minimizado (`data-terminal="minimized"`); barra de título da janela do ItaliaMi logo abaixo do header em ≤ 1 s; foco no `−` dela |
| V2 | `open` de projeto minimizado e fechado (FR-004) | minimizar a janela do SRG e rodar `open srg`; fechar a do QClass-BOT e rodar `open qclass-bot`; amostrar a opacidade das saídas | SRG reabre completo; QClass-BOT reabre e digita de novo, sem nenhuma saída visível antes do comando dela (006 FR-023); ambos na tela, com o foco no `−` |
| V3 | `open` das janelas de editor (FR-005) | `open experiencia`; Esc; restaurar o terminal; `open challenges` com a janela fechada; `open ~/projetos/comunitario` com ela minimizada | cada uma maximizada (≥ 90% da tela), página na seção dela, `#app[inert]`, foco no `□`; a fechada abre já completa (sem `data-t-state` pendente); ao restaurar, a janela no lugar, `scrollY` na seção, foco no `□`, terminal minimizado; restaurar o terminal mostra o `open` e o `→` na saída |
| V4 | Todas as opções (SC-001) | as 9 opções × janela aberta/minimizada/fechada, em 1366 × 768 e 390 × 844 | 100% chegam ao estado certo em ≤ 1 s |
| V5 | Erros (FR-006, SC-002) | `open`; `open xyz`; `open sobre`, `skills`, `projetos`, `educacao`, `Contato` | mensagens do contrato; nada abre nem rola (`scrollY` igual, estados das janelas iguais); terminal aberto, foco no prompt |
| V6 | `help` e Tab (FR-007, FR-008) | `help`; `o` + Tab; `open it` + Tab; `open c` + Tab; toque numa sugestão (`hasTouch`) | bloco do `help` do contrato; `open `; `open italiami`; `challenges  comunitario` na saída; a sugestão tocada completa a linha |
| V7 | Movimento reduzido no `open` (FR-009) | `reducedMotion: 'reduce'`; `open italiami` e `open experiencia` | rolagem instantânea; janela aberta/maximizada sem animação; terminal minimizado sem animação |
| V8 | Minimizar pelo `−` (US2, FR-010 a FR-013) | rodar `help` e `find sobre`, digitar `fi` sem Enter, rolar a saída para cima, clicar no `−` | terminal some em ≤ 400 ms, encolhendo até o botão; foco no botão; `aria-label="Restaurar terminal (Ctrl+Alt+T)"`; ponto vazado sob o botão; `#dock-terminal[inert]` |
| V9 | Restaurar (FR-012, FR-013, SC-004) | clicar na dock; repetir minimizando e restaurando por Ctrl+Alt+T | mesmas linhas da saída, mesmo `scrollTop`, `fi` no prompt com o cursor no fim, ↑ traz `find sobre`; foco no prompt; ≤ 400 ms |
| V10 | Dock e atalho com o terminal aberto (FR-016, Q2) | com o terminal aberto, clicar na dock; depois Ctrl+Alt+T duas vezes | minimiza, restaura, minimiza; nomes acessíveis "Minimizar…"/"Restaurar…" conforme o estado |
| V11 | Fechar apaga a sessão (FR-014, FR-015) | com saída, `exit`; reabrir; repetir com ✕ e Esc; recarregar com o terminal minimizado | ao reabrir, 0 linhas e ↑ sem histórico; recarregado, `data-terminal="closed"` |
| V12 | Dica e Ctrl+Alt+T com maximizada (FR-017; 006) | terminal minimizado: mouse sobre o botão; maximizar uma janela de editor e apertar Ctrl+Alt+T | dica `Ctrl + Alt + T` aparece; com a maximizada, o terminal não restaura |
| V13 | Vinheta original (US3, FR-018, SC-005) | e2e `hero-glitch.spec.ts`: canvas e vinheta das bordas escondidos, fundo branco no `.letter-glitch`; amostrar o centro e pontos a 30%, 60% e 80% do raio | centro ≈ 20% do branco (± 2 p.p.); 60% e 80% = branco; com o canvas, letras acesas a ~45% do raio |
| V14 | Contraste com halo (FR-021, SC-005, SC-006) | 10 quadros, 1366 × 800 e 390 × 844: tagline pela vizinhança de 2 px (research R8); loader nas duas fases, 5 quadros cada, pelo mesmo método (`hero-loader.spec.ts`); demais textos pela caixa; fundo a 12 px da tagline com e sem halo | todos ≥ 4,5:1; `text-shadow` só na `.hero-sub` e no `.ll-text` do loader (e em quem o e2e tiver reprovado); a 12 px do texto, fundo igual com e sem halo; `ping vittorio` com fundo opaco; sem `::before` de penumbra no `.hero-content` |
| V15 | Halo só com o fundo animado (FR-021) | `reducedMotion: 'reduce'`; sem JS; impressão | `.hero` sem `data-glitch`; tagline sem `text-shadow`; `ping vittorio` com o fundo translúcido de hoje |
| V16 | Sobre (US4, FR-022, FR-023, SC-007) | cor calculada do texto do `cat sobre.txt` × `.t-desc` de um projeto; com e sem JS | iguais (`rgb(216, 210, 228)`); "TypeScript"/"Vue" em verde; as duas linhas de comando continuam `--text-dim` |
| V17 | Tagline (US5, FR-024, FR-025, SC-008) | `dist/index.html`; hero com movimento depois da revelação; movimento reduzido; sem JS; `<title>` e `meta description` | texto exato `Transformando processos em sistemas escaláveis`, sem `—` nem ponto; SEO igual ao da 006 |
| V18 | Versão (FR-026) | `version.spec.ts`; linha 4 da sessão da porta | `Bem-vindo ao Portfolio v2.6` |
| V19 | Peso, a11y e console (SC-009, SC-010) | `weight.spec.ts`; `a11y.spec.ts` com o terminal aberto, minimizado, o editor maximizado pelo `open`, movimento reduzido e sem JS | HTML+CSS+JS iniciais ≤ 107.695 B + 3 KB gzip; nenhum pedido novo a terceiros; 0 violações do axe; 0 erros do site no console |

## Inspeção na implementação (2026-10-10)

Build de produção servido localmente, Chromium com GPU (`--ignore-gpu-blocklist --enable-gpu
--use-angle=gl`), 1366 × 800 e 390 × 844, console sem erros nos dois:

- Hero (V13–V15): vinheta central original, letras acesas até perto do bloco de texto; a tagline e o
  texto do loader com o contorno escuro do halo, legíveis; `ping vittorio` com fundo opaco.
- `open italiami` (V1): terminal minimizado (ponto vazado sob o botão), janela do ItaliaMi com a barra de
  título logo abaixo do header e o foco no `−`.
- `open experiencia` (V3): janela de editor maximizada, árvore e cartões; Esc devolve à seção.
- Sobre (V16): o texto do `cat sobre.txt` em Lavender Ash, com TypeScript e Vue em verde; comandos em Dim
  Lilac.
- Celular: o `help` com o bloco do `open` quebra as linhas dentro do terminal, sem rolagem horizontal.
- Suíte: Vitest 215, Playwright 237/237 (8,4 min, 4 navegadores); HTML + CSS + JS iniciais 109.532 B gzip
  (+1.837 B sobre a 006; teto +3 KB).

## Inspeção manual (autor)

- Celular físico: `open` com o teclado virtual aberto (ele fecha quando o terminal minimiza); minimizar
  e restaurar pelo toque na dock.
- GPU real: o halo da tagline e a vinheta original sobre o Letter Glitch a 60 qps (os testes usam o
  Chromium sem GPU).
