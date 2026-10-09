# Quickstart: validar a feature 003

**Feature**: `003-devicons-skill-loops`

## Pré-requisitos

- Node ≥ 22, dependências instaladas (`npm ci`), Chromium do Playwright (`npx playwright install
  chromium`).
- Só para regenerar o sprite de ícones: acesso à rede (jsDelivr e vectorlogo.zone) e `npx`.

## Comandos

```bash
node tools/build-tech-icons.mjs   # regenera src/assets/tech-icons/sprite.svg e NOTICE.md (só quando mudar o registro)
npm run typecheck                 # TechName × dados × TECH_ICONS
npm test                          # Vitest: dados, registro × sprite, componentes
npm run test:e2e                  # build de produção + Playwright sobre o preview
npm run preview                   # inspeção manual em http://localhost:4173/Portfolio/
```

## Cenários

| # | Cenário | Como | Esperado |
|---|---------|------|----------|
| V1 | Sem imagens de fundo (US3, SC-001) | e2e: requisições da página + `ls dist/assets` | 0 `.section-decor`; 0 requisições e 0 arquivos `image*-bg*.webp` |
| V2 | Comandos (US6, SC-002) | e2e | texto da página sem `./run`; `[data-t-cmd]` com cor `--text-dim` em Sobre, projetos e Contato; `.prompt-dollar` roxo; "Conexão estabelecida…" verde; durante a digitação, `.t-typed` com a mesma cor |
| V3 | Títulos (US7, SC-002) | e2e | `.terminal-title` = `sobre.txt`, os 6 nomes de projeto, `contato.sh`; nenhum com `bash` |
| V4 | Rótulos (US2, SC-003) | e2e | `.t-theme-name` sem `.neon` com cor `--purple-glow`; os 2 `.neon` com a cor do tema |
| V5 | Links sublinhados (US2, SC-003) | e2e: todo `a[target=_blank]` | sublinhado tracejado de 1px na cor do link em repouso (no `<a>`, no `.evidence-url` ou na `img` do badge); com `hover()` e com foco por Tab, ganha `text-shadow`/`drop-shadow`, mantém o sublinhado e não muda de posição; badge bloqueado → domínio com um sublinhado só; menu, logotipo, botões do hero, "▼ scroll" e link de pular sem sublinhado |
| V6 | Ícones nos chips (US4, SC-004) | e2e + Vitest registro × sprite | todo `.chip` com 1 `svg.tech-icon` antes do texto; todo `use[href]` do mesmo domínio e com `#id` presente no sprite; cor do `svg` = cor do texto, também em hover; altura do chip igual à de antes (±1px) |
| V7 | Sem faixa (US5, SC-005) | e2e, com e sem movimento | 0 `.tech-marquee`; depois do lead de `#skills` vem a primeira sub-parte |
| V8 | Sub-partes e loops (US1, SC-005) | e2e com movimento | 5 `h3` em `#skills` na ordem dos grupos, cada um com `svg.lucide`; 5 `.skill-loop`; 28 `li` acessíveis no total; a trilha se move para a esquerda (dois `getBoundingClientRect` com 500 ms de intervalo) a no máximo 48 px/s; com `hover()`, para |
| V9 | Loop fora da tela (FR-024) | e2e | com `#skills` fora da viewport, `animation-play-state` da trilha = `paused` |
| V10 | Sem movimento, sem JS, impressão (FR-025, SC-006) | e2e `reduced-motion`, `no-js` e `emulateMedia({ media: 'print' })` | 0 cópias visíveis; as 28 skills visíveis e dentro da fita (nenhuma cortada) |
| V11 | Leitor de tela (FR-026) | e2e: árvore de acessibilidade de `#skills` com movimento | cada grupo é uma lista com as skills dele, uma vez; cópias e `✦` fora da árvore |
| V12 | Sem deslocamento e 320px (FR-029, SC-007) | e2e `PerformanceObserver('layout-shift')` ao carregar e rolar até `#skills`; `layout.spec.ts` em 320px | soma 0 atribuída a `.skill-loop`; sem rolagem horizontal; nomes ≥ 12px |
| V13 | Acessibilidade e console (SC-008) | e2e `a11y.spec.ts` | 0 violações axe, 0 erros e 0 avisos no console, desktop e mobile; no alto contraste, ícones, sublinhados e fita visíveis |
| V14 | Peso (SC-009, research R11) | build + gzip de `index.html` + CSS + JS inicial; `weight.spec.ts` | ≤ 95,3 KB (linha de base 80,3 KB); carregamento inicial ≤ 500 KB |
| V15 | Requisições a terceiros (FR-013) | e2e: lista de requisições | 0 para devicon.dev, vectorlogo.zone, jsdelivr.net; sprite servido pelo próprio site |

## Inspeção manual (constituição: Fluxo de Trabalho e Verificação)

1. `npm run build && npm run preview`, abrir em desktop (1440px) e em 390px (DevTools).
2. Fundo: Sobre, Skills e Projetos sem imagem atrás.
3. Janelas: títulos sem `bash —`, comandos apagados, `$` roxo; Sobre e Contato também.
4. Projetos: rótulos em roxo, links em verde e sublinhados; passar o mouse só acende o brilho; Tab
   mostra o anel de foco e o brilho; os nomes dos temas continuam em neon.
5. Chips de experiências, projetos e challenges: ícone à esquerda, na cor do texto; no hover o ícone
   muda junto. Conferir que SAP SD tem o logotipo vazado e que Valkey, OCR e LLMs têm o ícone
   genérico do assunto.
6. Skills: 5 sub-partes, cada uma com a fita correndo da direita para a esquerda; mouse em cima
   pausa. Repetir com "reduzir movimento" e sem JavaScript: as skills ficam paradas e todas
   visíveis.
7. Abrir o sprite gerado numa grade (cenário do script `tools/build-tech-icons.mjs --preview`) e
   conferir que nenhum ícone virou borrão ao ganhar uma cor só.
