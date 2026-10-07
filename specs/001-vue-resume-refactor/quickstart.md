# Quickstart: validar a refatoração

**Feature**: `001-vue-resume-refactor`

Guia para rodar o projeto e provar, ponta a ponta, que a feature cumpre a spec. Detalhes de dados
em [data-model.md](data-model.md); garantias do HTML em
[contracts/page-contract.md](contracts/page-contract.md).

## Pré-requisitos

- Node ≥ 22 (testado com 24.21) e npm ≥ 10.
- Navegadores do Playwright: `npx playwright install chromium`.

## Comandos

| Comando | O que faz |
|---------|-----------|
| `npm ci` | instala exatamente o lockfile |
| `npm run dev` | dev server com hot reload em `http://localhost:5173/Portfolio/` |
| `npm run typecheck` | `vue-tsc --noEmit` — inclui a validação de tipos do `resume.ts` |
| `npm run test` | Vitest (dados, formatação, componentes) |
| `npm run build` | `typecheck` + `vite-ssg build` → `dist/` |
| `npm run preview` | serve `dist/` em `http://localhost:4173/Portfolio/` |
| `npm run test:e2e` | build + Playwright contra o `preview` |

## Baseline visual (antes de remover a versão atual)

Antes de apagar `index.html`, `css/` e `js/` da raiz, capturar screenshots da versão atual em 360,
768, 1280 e 1920px, por seção, em `specs/001-vue-resume-refactor/baseline/` (não versionado se
pesar; basta mantê-lo local até a validação V3).

## Cenários de validação

### V1. Paridade de conteúdo (US1, SC-001)

`npm run test` → o teste de paridade confere as contagens (5/5/3/3/5/2). Depois, abrir o preview e
comparar cada experiência, projeto e formação com o currículo PDF.
**Esperado**: nenhuma diferença factual.

### V2. Dados como fonte única (US3, FR-002, SC-002)

1. Em `src/data/resume.ts`, apagar o campo `role` de uma experiência → `npm run build`.
   **Esperado**: falha com o arquivo, a linha e o nome do campo.
2. Restaurar; adicionar uma experiência fictícia com `start: '2019-01'` → `npm run build && npm run preview`.
   **Esperado**: ela aparece por último na timeline, no mesmo estilo; nenhum outro arquivo mudou
   (`git status` só mostra `resume.ts`).
3. Remover a experiência fictícia. **Esperado**: some sem deixar espaço vazio.

### V3. Identidade visual preservada (FR-030 a FR-034)

Comparar as screenshots do preview com o baseline, por seção e largura.
**Esperado**: mesma paleta, tipografia, prompt, janelas de terminal, timeline e chips. Diferenças
aceitas: realce do SpotlightCard, revelação do BlurText e a nova faixa de tecnologias.

### V4. Sem JavaScript (FR-012, Princípio III)

`npm run test:e2e -- --grep "sem JS"` (contexto com `javaScriptEnabled: false`).
**Esperado**: todo o texto do currículo visível, nenhuma tela de boot, âncoras funcionando, prompt do
hero com o cargo principal.

### V5. Movimento reduzido (FR-020, SC-007)

`npm run test:e2e -- --grep "movimento reduzido"` (`reducedMotion: 'reduce'`).
**Esperado**: sem boot, sem matrix, sem glitch, sem digitação, tagline visível de imediato, faixa de
tecnologias parada; dois screenshots com 2 s de intervalo são idênticos.

### V6. Efeitos com movimento (US4)

Manual no preview, com mouse:
- Boot some sozinho em ≤ 5 s, ou antes com qualquer tecla/clique.
- Hero: glitch no nome, prompt digitando as 5 frases em loop, matrix ao fundo, tagline revelada
  palavra a palavra em ≤ 1,5 s.
- Cartões de experiência, skill, projeto e formação: brilho roxo segue o cursor.
- Faixa de tecnologias rola e pausa no hover.

### V7. Teclado e acessibilidade (FR-021 a FR-024, SC-005, SC-006)

`npm run test:e2e -- --grep "a11y"` → axe sem violações `critical`/`serious`. Manual: navegar a página
toda só com Tab/Shift+Tab/Enter; abrir e fechar o menu mobile pelo teclado.
**Esperado**: foco sempre visível; links dos projetos mostram o realce do cartão via `:focus-within`.

### V8. Responsividade e console (FR-025, FR-026, SC-008, SC-009)

`npm run test:e2e -- --grep "layout"` em 360, 768, 1280 e 1920px.
**Esperado**: `scrollWidth <= clientWidth` em todas; zero mensagens de erro/aviso no console.

### V9. Âncoras e links (SC-010, FR-011)

`npm run test:e2e -- --grep "links"`.
**Esperado**: `/Portfolio/#projetos` (e as demais) abre na seção certa; todos os links externos com
`target="_blank"` e `rel="noopener noreferrer"`.

### V10. Badges indisponíveis (SC-011)

`npm run test:e2e -- --grep "badges"` (rota `img.shields.io` bloqueada).
**Esperado**: cartão de Temas VS Code com nomes e links intactos, sem deslocamento de layout.

### V11. Desempenho (SC-004, SC-012)

`npx lighthouse http://localhost:4173/Portfolio/ --preset=desktop` e com `--form-factor=mobile
--throttling-method=simulate`.
**Esperado**: LCP < 2,5 s (sem contar o boot: medir também com `reducedMotion`), CLS < 0,1,
acessibilidade ≥ 95, peso transferido ≤ 500 KB sem os badges.

### V12. Publicação (R9)

Depois de configurar o Pages para "GitHub Actions" e fazer o merge: o workflow fica verde e
`https://v-perotto.github.io/Portfolio/` serve o build novo (ver `view-source:` — conteúdo no HTML).
