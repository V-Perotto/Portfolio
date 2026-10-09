# Quickstart: validar a feature 002

**Feature**: `002-projects-animated-terminals`

## Pré-requisitos

- Node ≥ 22, dependências instaladas (`npm ci`), Chromium do Playwright (`npx playwright install
  chromium`).
- Constituição em v2.2.0 (`.specify/memory/constitution.md`).

## Comandos

```bash
npm run typecheck   # tipos: dados, ícones e contrato
npm test            # Vitest: dados, ordenação, ritmo da digitação, componentes
npm run test:e2e    # build de produção + Playwright sobre o preview
npm run preview     # inspeção manual em http://localhost:4173/Portfolio/
```

## Cenários

| # | Cenário | Como | Esperado |
|---|---------|------|----------|
| V1 | Um projeto por linha (US1, SC-001) | e2e `projects.spec.ts` em 1440, 768 e 320px | nenhum par de cartões de `#projetos .projects-grid > li` com o mesmo `top` |
| V2 | Ordem e links dos projetos (US1–US4, SC-002) | e2e + Vitest de inventário | ordem SRG, Temas, ItaliaMi, OCR, QClass, Monitor; todo cartão, exceto Monitor, com ≥ 1 `<a>` |
| V3 | Links privados avisados (FR-005, SC-003) | e2e: os 10 links para os repositórios privados | cada um contém "privado" visível e nome acessível com "repositório privado, pode não abrir"; todo cartão com link privado tem a linha `# repositório(s) privado(s)…` |
| V4 | Selo do SRG (FR-013) | e2e | "EM DESENVOLVIMENTO" só no cartão do SRG, sem período |
| V5 | Challenges (US5, SC-004) | Vitest de `byCreatedDesc` com a lista embaralhada + e2e | ordem CIEE-PR → Mobiis → Econet → Executiva Service → PandaVideo → NY Times (RPA) → Axya; 7 links públicos; datas `MMM AAAA` |
| V6 | Comunitário (US6) | e2e | sub-parte `comunitario` com JUN 2023, papel e link para pucpr.br |
| V7 | Empregotech (US7) | e2e + Vitest de `byStartYearDesc` | 3º item de `#educacao`, `2020 — 2020`, observação com "Prime Control", 2 links de fonte |
| V8 | Terminais digitam (US8, SC-005) | e2e com movimento: rolar até `#sobre` | saída com `opacity: 0` logo após entrar na tela; completa (`data-t-state="done"` em tudo) em ≤ 2,5 s |
| V9 | Pular a animação (FR-028) | e2e: clicar numa janela em animação; em outra, Tab até um link da saída | completa na hora; o link focado está visível |
| V10 | Sem movimento, sem JS, impressão (FR-029, SC-006) | e2e `reduced-motion`, `no-js` e `emulateMedia({ media: 'print' })` | nenhum `data-t-state` diferente de `done`; nenhum texto de janela com `opacity: 0` ou transparente |
| V11 | Leitor de tela (FR-030) | e2e: árvore de acessibilidade de `#sobre` durante a animação | contém o texto completo de `cat sobre.txt`; `.t-typed` fora da árvore |
| V12 | Sem deslocamento (FR-031, SC-007) | e2e: `PerformanceObserver('layout-shift')` enquanto `#contato` anima | soma 0 atribuída a nós dentro de `.terminal-window`; altura da janela igual antes e depois |
| V13 | Ícones (US9, SC-008) | e2e + inspeção do HTML gerado | 5 `svg.lucide` em `#skills h3`, com `aria-hidden="true"`; 0 requisições externas novas |
| V14 | Acessibilidade e console (SC-009) | e2e `a11y.spec.ts` existente | 0 violações axe, 0 erros e 0 avisos no console, desktop e mobile |
| V15 | Peso (SC-010, research R12) | build + medição gzip de `index.html` + CSS + JS inicial | ≤ 84,8 KB (linha de base 69,8 KB) |
| V16 | 320px (FR-039) | e2e `layout.spec.ts` existente | sem rolagem horizontal; URLs longas dos links quebram |

## Inspeção manual (constituição: Fluxo de Trabalho e Verificação)

1. `npm run build && npm run preview`, abrir em desktop e em 390px (DevTools).
2. Rolar devagar da seção Sobre até Contato: cada janela digita o comando e só então mostra a saída.
3. Repetir com "reduzir movimento" do sistema ativo e com JavaScript desativado: tudo pronto.
4. Clicar num link privado: a nova aba mostra o 404 do GitHub, e o aviso antes do clique deixou isso
   claro.
5. Conferir os textos novos contra o inventário do [data-model.md](data-model.md) (Princípio I) e
   lembrar o autor de atualizar o PDF do currículo.

## Resultados da validação (2026-10-08)

| Item | Resultado |
|------|-----------|
| `npm run typecheck` | ok |
| `npm test` (Vitest) | 55/55 em 11 arquivos |
| `npm run test:e2e` (Playwright) | 63/63, estável em três rodadas seguidas |
| V15 peso (gzip de HTML + CSS + JS inicial) | 80,2 KB (linha de base 69,8 KB; teto 84,8 KB) |
| Boot com a CPU 4× mais lenta | página descoberta em 4743–4911 ms (research R13) |
| Duração de cada janela com a CPU 4× mais lenta | 1,2–1,9 s do primeiro caractere ao fim |
| Inspeção manual 1440px e 390px (projetos, skills, educação) | ok: um projeto por linha, duas colunas internas no desktop, links privados avisados, selo só no SRG, challenges compactos do mais recente ao mais antigo, Empregotech entre Bacharelado e Técnico |
| Sem JavaScript / movimento reduzido / alto contraste | conteúdo completo; ícones e cadeado visíveis em forced colors; console sem erros nem avisos nos quatro cenários |
| Textos contra o inventário do `data-model.md` (Princípio I) | conferidos; nenhum fato fora do inventário; cliente do SRG não citado |

Pendente com o autor: atualizar o PDF do currículo com SRG, OCR de Prontuários, QClass-BOT,
challenges, Gincana Junina e 1º Empregotech (Princípio I; mesmo caso dos Temas VS Code).
