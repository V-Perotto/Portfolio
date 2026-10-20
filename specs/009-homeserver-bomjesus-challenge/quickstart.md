# Quickstart: validar a feature 009

**Feature**: `009-homeserver-bomjesus-challenge` | Contrato:
[debianserver-window](contracts/debianserver-window.md) | Dados: [data-model](data-model.md)

## Pré-requisitos

- Node ≥ 22, `npm ci` (ou `pnpm install`)
- `npx playwright install chromium`
- Só para regerar assets (rede): `node tools/build-tech-icons.mjs --preview /tmp/icons.html` e
  `node tools/build-screenshots.mjs`

## Comandos

```bash
npm run typecheck        # vue-tsc + tsc
npm run test             # Vitest: resume.data, editor-files, sections, terminal, tech-icons, version, ProjectCard, ProjectScreenshot
npm run build            # build estático em dist/
npm run test:e2e         # build + Playwright + axe
npm run preview          # http://localhost:4173/Portfolio/ para a inspeção manual
```

## Cenários

| # | Cenário | Como verificar | Esperado |
|---|---------|----------------|----------|
| V1 | Ordem dos projetos (FR-006) | e2e `projects.spec.ts` | janelas: SRG, DebianServer, Temas VS Code, ItaliaMi, OCR de Prontuários, QClass-BOT, Monitor de Curso |
| V2 | Fatos do DebianServer (FR-007 a FR-013, SC-001) | e2e em 320, 768, 1366, 1920 px | `DebianServer — Meu homeserver`, `EM PRODUÇÃO`; `dl` com papel, tipo `side-project`, desde `01 OUT 2026`, hardware, sistema, acesso; 6 chips com ícone; `# apps` + 6 itens com ícone, nome e explicação, na ordem; rodapé `[side-project]  exit 0`; `scrollWidth` = `innerWidth` |
| V3 | Captura na janela (FR-015 a FR-017, FR-019) | e2e + inspeção em 1366 e 390 px | figura na coluna da direita (≥ 900 px) ou depois das informações; inteira, sem corte; legenda `# painel do CasaOS do DebianServer · OUT 2026`; `alt` com a data e os números do painel; `width`/`height` 1396 × 809 |
| V4 | Carregamento preguiçoso e peso (SC-003, SC-004) | e2e `weight.spec.ts` | nenhum `.webp` pedido no hero; ao rolar até o DebianServer, só uma das duas larguras; 800 px ≤ 120 KB, 1396 px ≤ 300 KB; deslocamento de layout 0 na janela; HTML + CSS + JS iniciais ≤ linha de base + 4 KB |
| V5 | Visualizador (FR-018, SC-009) | e2e `screenshot-viewer.spec.ts`, 320/768/1366/1920 px | clique, toque e Enter abrem em ≤ 400 ms; imagem inteira (sem rolagem); página e dock inertes; Ctrl+Alt+T não abre o terminal; Esc, ✕ e clique no fundo fecham em ≤ 400 ms; foco volta ao print; página na mesma posição |
| V6 | Clique com modificador | Ctrl+clique / botão do meio no print | o diálogo não abre; a imagem abre em nova aba |
| V7 | Sem JavaScript (SC-006) | e2e `no-js.spec.ts` | janela do DebianServer completa, com a captura e os 6 apps; o print é um link `_blank` para o WebP de 1396 px; nenhum `<dialog>` no HTML; cartão do Bom Jesus (FAE) em 1º nos Challenges |
| V8 | Impressão | `page.emulateMedia({ media: 'print' })` | janela completa com a captura; challenge novo entre os cartões; cada conteúdo uma vez |
| V9 | Reduzir movimento | e2e `reduced-motion.spec.ts` | nenhuma animação no visualizador nem na janela nova |
| V10 | Challenge Bom Jesus (FAE) (FR-001 a FR-005, SC-002) | e2e `editor-windows.spec.ts` | 8 arquivos; 1º `2026-10_bom-jesus-fae.yml` aberto, `1 / 8`; `nome`, `criado: OUT 2026`, `resumo`, `stack` (6), `repositorio` como link; em 320 px o nome termina em `…` e o rodapé mostra o nome inteiro; maximizada: o cartão em 1º |
| V11 | `open debianserver` (FR-023, SC-007) | e2e `open-command.spec.ts`, 1366 × 768 e 390 × 844, janela aberta/minimizada/fechada | saída `→ ~/projetos/debianserver`; terminal minimizado; janela aberta e à vista em ≤ 1 s; 11 opções no `help`, depois de `srg`; `open deb` + Tab completa |
| V12 | Ícones minimizados (FR-024) | e2e `minimized-layout.spec.ts` | 7 ícones lado a lado, na ordem: 4 linhas em 320 px, 2 em 768 px, 1 em 1024 px; sem rolagem horizontal |
| V13 | Acessibilidade e console (SC-005) | e2e `a11y.spec.ts` | 0 violações axe e 0 erros do site no console: DebianServer aberto, minimizado, visualizador aberto, movimento reduzido, sem JS; Challenges aberta e maximizada |
| V14 | Privacidade (FR-020, SC-008) | e2e de varredura do `dist/index.html` + unidade dos WebP | nenhum IPv4 privado/CGNAT, `.ts.net` ou porta no HTML; os WebP sem `EXIF`/`XMP ` |
| V15 | Ícones novos | `node tools/build-tech-icons.mjs --preview /tmp/icons.html`, abrir a prévia | os 13 ícones legíveis a 16 e 32 px numa cor só; CasaOS, OpenWebUI e Samba sem borrão (senão, a reserva do Lucide do R3) |
| V16 | Versão | sessão da porta | `v2.8` |
| V17 | GPU real e celular físico (autor) | `npm run preview` num celular da rede | visualizador abre e fecha no toque; imagem nítida; nada fora da tela |

## Registro da validação (2026-10-20)

- **Suítes**: `npm run typecheck` limpo; Vitest **239/239** (30 arquivos); Playwright **262/262**
  (`npm run test:e2e`, 7,7 min, 4 workers).
- **Peso** (V4): HTML + CSS + JS iniciais **115.268 B** gzip, +5.119 B sobre a 008 (110.149 B); teto
  revisado para +6 KB (research R10). Carregamento inicial 329 KB (≤ 500 KB). Captura: 800 px = 17,2 KB,
  1396 px = 68,1 KB, sem `ICCP`/`EXIF`/`XMP`. No hero, nenhum `.webp` pedido; a de 800 px chega perto da
  janela e a de 1396 px só ao abrir o visualizador.
- **Inspeção** (`npm run preview`, Chromium com `--ignore-gpu-blocklist --enable-gpu --use-angle=gl`,
  1366 × 800 e 390 × 844): `open debianserver` pelo terminal da dock leva à janela; janela completa
  (selo, metadados, 6 chips, `# apps` com ícones, a linha da exceção e a captura); visualizador sobre a
  página escurecida e desfocada, Esc devolve o foco; minimizada, o ícone de projeto `DebianServer`; a
  janela de Challenges com `2026-10_bom-jesus-fae.yml` em `1 / 8`; console sem erros do site.
- **Prévia dos ícones** (V15): os 13 novos legíveis a 16 e 32 px; nenhum precisou da reserva do Lucide.
- **Achado durante a validação**: o desfoque do fundo da janela maximizada (006) nunca era aplicado no
  Chromium, porque o minificador descartava o `backdrop-filter` sem prefixo quando o `-webkit-` vinha
  escrito ao lado; corrigido no `EditorFrame` e no visualizador (DESIGN.md, Don't).
- **Fica com o autor**: GPU real e celular físico (V17); conferir no celular o visualizador e o toque
  no ✕; atualizar o PDF do currículo (o challenge, o servidor e as 7 tecnologias novas não estão nele).
