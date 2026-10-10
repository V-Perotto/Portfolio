# Quickstart: validar a feature 008

**Feature**: `008-education-editor-window` | Contrato: [education-window](contracts/education-window.md) |
Dados: [data-model](data-model.md)

## Pré-requisitos

- Node ≥ 22, `npm ci` (ou `pnpm install`)
- `npx playwright install chromium`

## Comandos

```bash
npm run typecheck        # vue-tsc + tsc
npm run test             # Vitest: editor-files, resume.data, sections, terminal, sort, EducationCard, version
npm run build            # build estático em dist/
npm run test:e2e         # build + Playwright + axe
npm run preview          # http://localhost:4173/Portfolio/ para a inspeção manual
```

## Cenários

| # | Cenário | Como verificar | Esperado |
|---|---------|----------------|----------|
| V1 | Estrutura (US1, FR-001 a FR-004, FR-008, FR-011) | e2e `editor-windows.spec.ts`, entrada `formacao`: rolar até `#educacao` | título `educacao` e lead `apt list --installed \| grep formacao` intactos; janela `~/formacao` digita `code ~/formacao`; altura final já durante a digitação; árvore `formacao/` com 4 arquivos na ordem `2025_ciberseguranca.yml`, `2020_sistemas-de-informacao.yml`, `2020_empregotech.yml`, `2018_tecnico-ads.yml`; aba e rodapé `~/formacao/2025_ciberseguranca.yml` · `1 / 4` |
| V2 | Fatos de cada arquivo (FR-005 a FR-007, SC-001, SC-005) | mesmo e2e (V2 da 006) + `editor-files.spec.ts` | cada texto visível do cartão está no arquivo; `em_curso: true  # EM CURSO` só na Pós; `observacao` e `fontes` só no 1º Empregotech, com as 2 fontes como links `_blank` + `noopener noreferrer`; nenhuma chave fora da lista |
| V3 | Trocar de arquivo (FR-003, SC-002) | clicar e usar Enter/Espaço nos 4 arquivos | aba, rodapé (`3 / 4` no Empregotech) e `aria-current` acompanham; altura da janela igual (0 px) |
| V4 | Maximizar (FR-009, SC-003) | `□` da janela de Educação, 1366 × 800 e 390 × 844; escolher o Técnico na árvore; Esc | diálogo ≥ 90% (desktop) / ≥ 95% (celular); 4 cartões como hoje (período, `EM CURSO`, curso, instituição · local, observação, `fonte = …`); a lista rola até o cartão do Técnico; Esc restaura com o foco no `□` e o arquivo do Técnico aberto |
| V5 | Minimizar, fechar, reabrir (FR-010, FR-011) | `−` e ✕; clicar no ícone | ícone de pasta `~/formacao`; minimizada reabre completa; fechada digita `code ~/formacao` de novo sem piscar |
| V6 | Celular (FR-013, FR-020, SC-001) | 320 e 390 px, nas 4 janelas de editor | árvore acima do arquivo; `scrollWidth` da página = `innerWidth`; a observação quebra dentro do painel; nenhum nome da árvore cortado no meio da letra: em 320 px (rótulo de 130 px, ~18 caracteres), os 4 nomes da Educação e `2025-10_executiva-service.yml` terminam em `…`, dentro da árvore; em 390 px, só `2020_sistemas-de-informacao.yml` e `2025-10_executiva-service.yml`; ao abrir o de Sistemas de Informação, o rodapé mostra `~/formacao/2020_sistemas-de-informacao.yml` inteiro |
| V7 | Sem JS e impressão (FR-012, SC-004) | e2e `no-js.spec.ts`; `page.emulateMedia({ media: 'print' })` | os 4 cartões visíveis, cada texto uma vez; sem árvore, aba nem rodapé; 12 `.desktop-window` |
| V8 | `open educacao` (US2, FR-015, SC-006) | e2e `open-command.spec.ts`: do hero, com a janela aberta, minimizada e fechada; `open formacao`; 1366 × 768 e 390 × 844 | saída `→ ~/formacao`; terminal minimizado; janela maximizada em ≤ 1 s, página na seção Educação, foco no `□`; fechada abre já completa; ao restaurar, a página continua em `#educacao` |
| V9 | `help`, opções e Tab (FR-016, FR-017) | `help`; `open`; `open xyz`; `open ed` + Tab; `open e` + Tab; toque numa sugestão | 10 opções com `educacao` no fim; linha "projetos abrem; experiencia, challenges, comunitario e educacao abrem maximizados"; `open educacao`; `experiencia  educacao` |
| V10 | Seções que não abrem (FR-018) | `open sobre`, `skills`, `projetos`, `contato` | mensagem "essa seção não abre com o open. Use: find …"; nada abre nem rola |
| V11 | Movimento reduzido (FR-011) | e2e `reduced-motion.spec.ts`, `reducedMotion: 'reduce'`: chegar à seção; maximizar | janela completa, sem digitação (`data-t-state` final); maximizar sem animação (`getAnimations().length === 0`) |
| V12 | Acessibilidade e console (SC-008) | e2e `a11y.spec.ts`: janela `~/formacao` normal (arquivo do meio), maximizada e minimizada, ouvindo `console` e `pageerror` | 0 violações sérias/críticas; console sem erros do site |
| V13 | Peso (SC-007) | e2e `weight.spec.ts` | ≤ 500 KB no carregamento; HTML + CSS + JS iniciais ≤ 109.532 B + 2 KB gzip; nenhum pedido novo a terceiros |
| V14 | Versão (FR-019) | porta de acesso | `Bem-vindo ao Portfolio v2.7` |

## Inspeção manual (autor)

- No celular físico: rolar até a Educação, abrir o 1º Empregotech, tocar numa fonte (abre em nova aba),
  maximizar e restaurar; `open educacao` pelo terminal da dock.

## Inspeção registrada (2026-10-10, implementação)

Build de produção (`npm run preview`), Chromium do Playwright MCP:

- **1366 × 800**: janela `~/formacao` digitou `code ~/formacao` e terminou completa; árvore com os 4
  arquivos na ordem, nomes inteiros; `2020_empregotech.yml` aberto com `observacao` e a lista `fontes:`
  com os 2 links, rodapé `~/FORMACAO/2020_EMPREGOTECH.YML` · `3 / 4` (V1–V3). Maximizada: os 4 cartões
  de hoje, com o selo `EM CURSO` e as fontes; Esc restaura (V4).
- **`open educacao`** do hero: `help` com "projetos abrem; experiencia, challenges, comunitario e educacao
  abrem maximizados" e `… | comunitario | educacao`; saída `→ ~/formacao`, janela maximizada, foco em
  "Restaurar ~/formacao", terminal minimizado (V8, V9).
- **320 × 844**: árvore acima do arquivo; os 4 nomes com reticências (`2025_cibersegura…`), a aba com o
  nome inteiro, o rodapé quebrando a linha com o caminho inteiro; sem rolagem horizontal da página (V6).
- Console: 0 erros e 0 avisos na sessão inteira (V12).
- Automatizado: typecheck limpo; Vitest 221/221; Playwright 242/242 no build final (1ª rodada completa:
  241 + 1 falha de lista fixa de títulos, corrigida; 2ª rodada: 198 + 44 que caíram com
  `ERR_CONNECTION_REFUSED` quando o `vite preview` reaproveitado na porta 4173 parou no meio, repetidas
  com `--last-failed` e todas verdes). Peso: 110.149 B (+617 B sobre a 007).

Fica com o autor: o celular físico (tocar numa fonte, maximizar e restaurar, `open educacao`).
