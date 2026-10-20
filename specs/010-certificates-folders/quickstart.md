# Quickstart: validar a feature 010

**Feature**: `010-certificates-folders` | Contrato:
[certificates-window](contracts/certificates-window.md) | Dados: [data-model](data-model.md)

## Pré-requisitos

- Node ≥ 22 (o `tools/build-certificates.mjs` pede Node ≥ 23.6, por ler o `resume.ts` direto), `npm ci`
  (ou `pnpm install`)
- `npx playwright install chromium`
- Só para regerar as imagens: `pdftoppm` (pacote `poppler-utils`) e a pasta de origem com os 62 arquivos
  (`~/Documents/certificados`, ou `CERTIFICADOS_DIR=<pasta>`). A pasta fica fora do repositório.

## Comandos

```bash
node tools/build-certificates.mjs   # gera public/certificados/** e public/carreira/** (falha acima dos tetos)
npm run typecheck                   # vue-tsc + tsc
npm run test                        # Vitest
npm run build                       # build estático em dist/
npm run test:e2e                    # build + Playwright + axe
npm run preview                     # http://localhost:4173/Portfolio/ para a inspeção manual
```

## Cenários

| # | Cenário | Como verificar | Esperado |
|---|---------|----------------|----------|
| V1 | Seção e menu (FR-001, FR-023) | e2e + inspeção | `#certificados` entre Educação e Contato; título `certificados`, linha `ls -R ~/certificados`; `~/certificados` no menu (7 itens, sem rolagem horizontal a partir de 841 px); `find certificados` rola até lá |
| V2 | Janela e árvore (FR-002 a FR-004, SC-001) | e2e em 320, 768, 1366, 1920 px | `code ~/certificados` digitado; 5 pastas na ordem `dio/`, `prime-academy/`, `udemy/`, `senai/`, `promenady/`; a DIO aberta com 33 arquivos e o 1º aberto (`1 / 33`); as outras fechadas, com a dobra `inert` |
| V3 | Acordeão (FR-004, SC-002) | e2e: clique, toque e Enter/Espaço em cada pasta | sempre uma pasta aberta; abrir outra fecha a anterior e abre o 1º arquivo dela (`1 / 20`, `1 / 2`, `1 / 1`, `1 / 5`); clicar na aberta não a fecha |
| V4 | Rolagem só dentro da pasta (FR-005, SC-002) | e2e: roda do mouse sobre a lista da DIO até o fim; Tab até o 33º | a lista rola até o 33º, e `window.scrollY` não muda; o 33º focado fica à vista; 8 linhas visíveis no desktop, 4 abaixo de 760 px; Udemy, SENAI e Promenady não rolam |
| V5 | Altura fixa (FR-015, SC-003) | e2e: altura do `.editor-frame` em cada pasta e em 3 arquivos de cada | 0 px de diferença (±0,5) em 1366 e 390 px |
| V6 | Fatos de cada arquivo (FR-006 a FR-008, SC-001) | e2e: 1 arquivo de cada plataforma contra o data-model; Vitest para os 61 | nome `AAAA-MM-DD_<slug>.yml`; `curso`, `plataforma`, `emitido` `DD MÊS AAAA`, `carga_horaria` `N h`; `tipo: bootcamp` só nos 2 da DIO; `ementa` só no SENAI; DIO, Udemy e Promenady com link em nova aba (`noopener noreferrer`); Prime Academy com `codigo:`; SENAI com `# código omitido por privacidade` |
| V7 | Miniatura e visualizador (FR-009, SC-006, SC-011) | e2e + inspeção | miniatura abaixo das linhas, inteira, com `alt` gerado; ao entrar na seção, no máximo 1 `.webp` pedido; trocar de arquivo pede só a miniatura dele; clique ou Enter abre o visualizador com a imagem inteira em 320–1920 px; Esc, ✕ ou fundo fecham; o foco volta à miniatura; ≤ 400 ms |
| V8 | Maximizada (FR-012) | e2e + `open certificados` | cobre ≥ 90% (desktop) / ≥ 95% (celular); só o grupo da pasta aberta; abrir a Prime Academy troca para os 20 cartões dela; escolher um arquivo rola até o cartão; `ver certificado` abre o visualizador por cima; Esc fecha só o visualizador; outro Esc restaura a janela |
| V9 | Sem JS e impressão (FR-014, SC-004) | e2e `no-js` + `emulateMedia('print')` | 5 grupos (`DIO · 33 certificados`…), 61 cartões, cada um uma vez; `ver certificado` é um link para a imagem em nova aba; nenhum `<dialog>` |
| V10 | Privacidade do SENAI (FR-010, SC-005) | e2e `privacy` (pixels das 5 tarjas, ~preto, nas 2 versões) + varredura de padrões no `dist/` e em `public/` + **inspeção visual** do tamanho real | RG, CPF, data de nascimento, naturalidade e código ilegíveis; nome, curso, data de conclusão e carga horária legíveis; nenhum padrão de CPF/RG/data de nascimento no texto publicado |
| V11 | Foto da Prime Control (FR-017 a FR-021, SC-006) | e2e em 1366, 1920, 768, 390 px + **inspeção visual** do autor | à direita das linhas a partir de 900 px, embaixo abaixo disso; legenda `# 1º dia na Prime Control · 15 OUT 2020`; período `OUT 2020 — OUT 2022`; janela de Experiência ≤ 453 + 46 px em 1366 e 1920 px, igual nos 5 arquivos; no cartão maximizado e sem JS; **só o rosto do autor nítido** |
| V12 | `open certificados` (FR-022, SC-009) | e2e `open-command` com a janela aberta, minimizada e fechada, em 1366 × 768 e 390 × 844 | `→ ~/certificados`, terminal minimizado, janela maximizada em ≤ 1 s, foco dentro; 12 opções no `open` e no `help`; `open cert` + Tab completa |
| V13 | Movimento reduzido | e2e `reduced-motion` | nenhuma animação nova: a dobra troca na hora, e o visualizador abre e fecha sem animação |
| V14 | Acessibilidade e console (SC-008) | e2e `a11y` | 0 violações axe com cada pasta aberta, maximizada, minimizada, com o visualizador aberto, sem JS, e na Experiência com a foto; 0 erros do site no console |
| V15 | Peso (SC-007, SC-011) | e2e `weight` + saída do `build-certificates` | carregamento inicial ≤ 500 KB; HTML + CSS + JS ≤ linha de base + 10 KB gzip; nenhum `.webp` novo no hero; miniaturas ≤ 40 KB, tamanho real ≤ 200 KB, foto 512 ≤ 60 KB, 1024 ≤ 150 KB |
| V16 | Metadados | Vitest (cabeçalho de todos os `.webp` de `public/`) | sem `ICCP`, `EXIF` nem `XMP ` |
| V17 | Outras janelas de editor | e2e `editor-windows` | Experiência, Challenges, Comunitário e Educação iguais à 009 (pasta raiz aberta, mesma altura), exceto a foto na Prime Control |
| V18 | Links da Udemy (C4) | **autor**, num navegador comum | `ude.my/UC-fa70c848-…` e `ude.my/UC-6d75d1fc-…` abrem os certificados do Robot Framework em nome do autor; se não abrirem, os 2 passam para `codigo:` |
| V19 | Versão (FR-024) | Vitest `version` + porta | `2.9.0`; sessão da porta com `v2.9` |

## Resultado (2026-10-20, T035)

- **Automático, verde**: `npm run typecheck`; Vitest 286 testes (34 arquivos); Playwright 296 testes. Na
  1ª rodada completa, 292 passaram e 4 falharam: 3 contagens antigas (14 janelas, o título
  `~/certificados`, as opções do `find`), corrigidas, e o dos badges, que passou de 30 s esperando o
  shields.io e passou ao rodar sozinho. Isso cobre V1–V10, V12–V17 e V19.
- **Inspeção visual (feita na implementação)**:
  - V10: as 5 tarjas do SENAI nas duas larguras;
  - V11: a posição da foto em 1366 e 390 px, e o desfoque dos 5 rostos de terceiros nas duas larguras;
  - capturas do build servido em 1366 e 390 px (Certificados com a DIO, o SENAI e maximizada;
    Experiência com a foto), sem JS e com movimento reduzido, com o console sem erros.
- **Com o autor (2026-10-20, aprovado)**: V18 (os 2 links da Udemy num navegador comum) e a conferência
  final do desfoque da foto (V11) e das tarjas do SENAI (V10).
