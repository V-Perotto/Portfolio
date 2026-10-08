# Research: Refatoração do Portfólio para Vue 3 com Vue Bits e Tailwind

**Feature**: `001-vue-resume-refactor` | **Date**: 2026-10-06

Versões consultadas no registro npm em 2026-10-06. Código do Vue Bits lido no commit
`07c0f76d5567db022c2e3185dd97a2311e056c0c` (2026-09-21) de `DavidHDev/vue-bits`.

## R1. Pré-renderização (FR-012, Princípio III)

- **Decision**: `vite-ssg` 28.3 no modo **single page** (`import { ViteSSG } from 'vite-ssg/single-page'`),
  gerando um único `index.html` com todo o conteúdo no build.
- **Rationale**: o site é uma página só; o modo single page dispensa `vue-router` (peer opcional),
  aceita Vite 8 (`^8.0.0-0`) e já traz `@unhead/vue` 2.x para os metadados (FR-029). A hidratação
  no cliente reaproveita o HTML gerado, então não há salto de layout.
- **Alternatives considered**:
  - SPA pura (`createApp().mount`): HTML vazio sem JS — viola o FR-012 e o Princípio III.
  - Nuxt 4 com `nuxi generate`: resolve, mas traz roteamento, auto-imports e convenções demais
    para uma página única.
  - Script próprio com `@vue/server-renderer` no build: menos dependências, mas reimplementa o que o
    vite-ssg já faz (head, injeção do manifest, minificação).

## R2. Stack e versões

| Pacote | Versão | Papel |
|--------|--------|-------|
| `vue` | ^3.5.43 | framework |
| `vite` | ^8.3 | dev server e bundler |
| `@vitejs/plugin-vue` | ^6.0 | SFC |
| `vite-ssg` | ^28.3 | pré-renderização (R1) |
| `@unhead/vue` | ^2.1 | `useHead` — a mesma major que o vite-ssg usa internamente |
| `tailwindcss` + `@tailwindcss/vite` | ^4.3 | estilos (R4) |
| `motion-v` + `@vueuse/core` | ^2.6 / ^15 | exigidos pelo `BlurText` (peer do motion-v) |
| `typescript` | ~6.0.3 | **pinado na 6.0**, ver abaixo |
| `vue-tsc` | ^3.3 | checagem de tipos de SFC |
| `vitest` + `@vue/test-utils` + `happy-dom` | ^5.0 / ^2.5 / ^20 | testes unitários e de componente |
| `@playwright/test` + `@axe-core/playwright` | ^1.63 / ^4.13 | e2e e acessibilidade |

- **Decision (TypeScript)**: `~6.0.3`, a última linha baseada em JS.
- **Rationale**: o TypeScript 7 (`latest`) é o compilador nativo em Go; o `vue-tsc` depende da API
  JS do compilador via Volar, que não é garantida no 7. Rever quando o Volar anunciar suporte.
- **Ambiente**: Node 24.21 e npm 11.19 na máquina do autor; `npm` como gerenciador (lockfile
  `package-lock.json` versionado, Princípio III). `engines.node` = `>=22`.

## R3. Componentes Vue Bits: forma de instalação e dependências

- **Decision**: instalar `SpotlightCard`, `BlurText` e `LogoLoop` pelo CLI `jsrepo` (registro
  `@vue-bits`, variante TS + Tailwind), seguindo o comando de cada página da documentação, para
  `src/components/vendor/vue-bits/`. Se o CLI falhar, copiar os arquivos do commit pinado acima.
  Registrar no topo de cada arquivo a origem, o commit e a licença.
- **Rationale**: o Vue Bits distribui código-fonte para copiar (jsrepo), não um pacote npm; o código
  passa a ser do projeto e pode ser ajustado. A pasta `vendor/` deixa claro o que é de terceiros e
  facilita reaplicar atualizações.
- **Licença**: MIT + Commons Clause — permite uso em portfólio pessoal; só proíbe revender os
  componentes. Sem impedimento.

| Componente | Dependências | Observações relevantes |
|------------|--------------|------------------------|
| `SpotlightCard` | só `vue` | `rounded-3xl p-8` fixos no root; aceita `className`; trata `focus`/`blur`, mas o `div` não é focável |
| `BlurText` | `vue`, `motion-v` | **renderiza cada palavra com `opacity: 0` + `blur(10px)` no estado inicial** — no HTML pré-renderizado o texto fica invisível sem JS (ver R6) |
| `LogoLoop` | só `vue` | aceita itens de texto (`node`), `pauseOnHover`, `ariaLabel`; marca cópias duplicadas com `aria-hidden`; já respeita `prefers-reduced-motion` |

- **Ajustes feitos no código copiado (2026-10-07, T093)**, todos registrados no cabeçalho de cada
  arquivo:
  - `BlurText`: só tipos, para o `noUncheckedIndexedAccess` do projeto (filtro de `undefined` em
    `buildKeyframes`, `entry?.` no observer), e `tag="span"` → `as="span"` no `Motion` — o motion-v
    2.x usa `as`; com `tag`, cada palavra virava um `<div>` dentro do `<p>`.
  - `SpotlightCard`: `duration-500` → `duration-200` (hover/foco em 150–250 ms) e a classe
    `spotlight-layer` na camada de brilho, para o `BaseCard` acendê-la no foco por teclado e apagá-la
    em telas de toque (FR-014).
  - `LogoLoop`: sem mudanças. O `TechMarquee` troca o componente por uma faixa parada quando não há
    movimento, em vez de depender só do `matchMedia` interno dele (FR-035).

## R4. Tailwind v4 com CSS Variables

- **Decision**: configuração CSS-first do Tailwind v4. `src/styles/tokens.css` declara as variáveis
  atuais em `:root` (`--bg`, `--purple-glow`, …) e um bloco `@theme inline` as expõe como
  utilitários (`--color-bg: var(--bg)` → `bg-bg`, `text-purple-glow`, `font-mono`).
- **Rationale**: atende "Tailwind com CSS Variables para a paleta dark" sem `tailwind.config.js`; os
  valores continuam em um único lugar (Princípio V), e os componentes Vue Bits, que já usam classes
  Tailwind, funcionam sem adaptação.
- **Alternatives considered**: Tailwind v3 com `tailwind.config.js` — legado; CSS puro sem
  Tailwind — contraria o requisito do usuário e os componentes Vue Bits.
- **Contraste sob o realce (FR-022, T097, 2026-10-07)**: a camada do `SpotlightCard` tem opacidade
  0,6, então o brilho efetivo no pico é 0,6 × alfa do `--spotlight`. Com alfa 0,18 (10,8% de
  `--purple-glow` misturado ao fundo), `--text-dim` caía para 4,49:1 sobre `--surface` e 4,25:1
  sobre `--surface-2` (barra das janelas de projeto). O alfa passou a 0,10 (6% efetivo):
  `--text-dim` 4,76:1 / 4,52:1, `--green-light` 5,82:1 / 5,53:1, `--purple-glow` 4,69:1 sobre
  `--surface` (onde ele aparece como texto), `--text` ≥ 11:1. Cálculo: luminância relativa WCAG
  sobre a mistura linear em sRGB do fundo com `#a06ae0`.

## R5. Porte do CSS atual (FR-030, paridade visual)

- **Decision**: híbrido. Layout, espaçamento e estados simples viram utilitários Tailwind nos
  templates; efeitos complexos do tema (glitch com `::before/::after`, scanlines, cursor piscando,
  `pulse-glow`, keyframes do boot, timeline com marcadores) migram como CSS escopado
  (`<style scoped>`) no componente dono, usando os tokens. O CSS portado troca cada raio, largura e
  espaçamento de seção pelo token equivalente da T012 (Princípio V).
- **Rationale**: reescrever keyframes e pseudo-elementos em utilitários piora a leitura sem ganho;
  manter o CSS original perto do componente preserva o visual atual com risco mínimo.
- **Verificação**: screenshots da versão atual (baseline) e da nova nas mesmas larguras, comparados
  lado a lado (quickstart, cenário V3).

## R6. Animações sem esconder conteúdo (FR-012, FR-018, FR-020)

- **Decision**: padrão "progressive enhancement" com classe no `<html>`:
  1. Um script inline mínimo no `<head>` de `index.html` adiciona `js` ao `<html>` e, se
     `prefers-reduced-motion` não estiver ativo, também `motion`.
  2. Estados iniciais escondidos (revelação ao rolar, frase do hero antes do BlurText) só valem sob
     `html.js.motion`. Sem JS ou com movimento reduzido, o CSS nem os aplica.
  3. `RevealText.vue` pré-renderiza a frase como texto normal; no cliente, depois do mount e só com
     `motion`, troca pelo `BlurText` (que roda uma vez). Assim o HTML estático sempre tem o texto
     visível e o leitor de tela recebe a frase inteira (`aria-label` no container, palavras com
     `aria-hidden`).
  4. Revelação ao rolar vira a diretiva `v-reveal` (IntersectionObserver, ~30 linhas), porta direta
     do `.reveal` atual, com fallback "visível" se o observer não existir.
- **Rationale**: atende o FR-018 mesmo que um script falhe, sem flash: o estado escondido só existe
  quando o próprio JS confirmou que vai animar.
- **Acréscimos na implementação (2026-10-07, T093/T096)**:
  - `html.motion` virou a fonte única de "há movimento": o script inline a decide pela
    preferência do sistema, e o CSS de movimento reduzido passou de `@media (prefers-reduced-motion)`
    para `html:not(.motion)`. `useMotion` é um estado compartilhado que acompanha mudanças da
    preferência durante a visita. (Entre 2026-10-07 e 2026-10-08 houve também um controle
    "motion: on/off" na navegação com escolha salva, FR-035; removido a pedido do autor.)
  - `useBootDone`: a revelação da frase do hero espera a tela de boot sair, senão rodaria escondida
    atrás dela.
  - `useHashAnchor`: links diretos (`/#projetos`) reposicionam na âncora depois que as fontes
    `font-display: swap` chegam e reflowam o texto, se o visitante ainda não rolou; sem isso o
    SC-010 falhava de forma intermitente.
  - O prazo da tela de boot é contado do início da navegação (`performance.now()`), no script
    inline e no `BootScreen`: a página fica descoberta antes de 5 s mesmo com o bundle atrasado, e o
    boot nem aparece se sobrar menos de 1 s (FR-031).
- **Alternatives considered**: Vue Bits `FadeContent`/`AnimatedContent` para a revelação — ambos
  dependem de GSAP + ScrollTrigger (~70 KB) para algo que a diretiva resolve; `<ClientOnly>` no
  hero — o texto sumiria do HTML estático.

## R7. Tela de boot, matrix, glitch e digitação (FR-031, FR-032)

- **Decision**: portar os quatro efeitos de `js/main.js` como componentes próprios em
  `src/components/terminal/`, renderizados **só no cliente** quando dependem de runtime (boot e
  matrix). Para não haver flash do conteúdo antes do boot, o script inline do R6 também adiciona
  `booting` ao `<html>` quando há `motion`; o CSS cobre a tela com o fundo enquanto `html.booting`
  existir, e o `BootScreen` remove a classe ao terminar ou ao ser pulado (com teto de 4,8 s no
  próprio script inline, caso o bundle falhe).
- **Rationale**: o boot usa `new Date()` e digitação temporizada — renderizá-lo no build geraria
  divergência de hidratação e travaria visitantes sem JS. O teto no script inline garante o limite
  de 5 s (FR-031) mesmo com erro de carregamento.
- **Alternatives considered** (Vue Bits): `GlitchText` — CSS puro, mas com outra cadência e
  cores; `TextType` — depende de GSAP; `LetterGlitch`/`FaultyTerminal` — visual diferente da chuva
  matrix e mais pesados. Todos rejeitados pela decisão Q2 (visual atual mantido).

## R8. Foco por teclado nos cartões (FR-014)

- **Decision**: `BaseCard` aplica o realce também em `:focus-within` (anel de foco nos links internos
  e brilho do cartão). Cartões sem elemento interativo (experiência, skill, formação) **não** ganham
  `tabindex`.
- **Rationale**: tornar focável um bloco não interativo cria paradas de tabulação inúteis (WCAG
  2.4.3). Como o realce é decorativo (FR-019), nada se perde. Interpretação do FR-014: "estado de foco
  equivalente quando o cartão contém algo focável" — registrada aqui para revisão.

## R9. Hospedagem e publicação

- **Situação atual**: GitHub Pages ativo em `https://v-perotto.github.io/Portfolio/`, servindo a raiz
  do branch.
- **Decision**: `base: '/Portfolio/'` no Vite; publicar `dist/` por GitHub Actions
  (`actions/upload-pages-artifact` + `actions/deploy-pages`), rodando `npm ci`, os testes e o build.
- **Risco**: assim que o novo `index.html` (template do Vite) entrar na `main`, o Pages no modo
  "branch" serviria o template sem build. A fonte do Pages precisa mudar para **GitHub Actions**
  nas configurações do repositório **antes** do merge — ação manual do autor.

## R10. Fontes e assets

- **Decision**: `fonts/*.woff2` → `public/fonts/` (URLs estáveis para o `preload`, com o prefixo do
  `base`); `img/*.webp` (decorativas) → `src/assets/img/` (hash no nome, cache longo). `img/*.png`
  não são referenciados na página atual e não migram. `tools/build-fonts.sh` passa a gravar em
  `public/fonts/`; o conjunto de caracteres do subset não muda.
- **Rationale**: o `preload` de fonte precisa de URL previsível; imagens se beneficiam do hash.

## R11. Estratégia de testes

- **Decision**:
  - **Tipos (gate do build)**: `vue-tsc --noEmit` antes do `vite-ssg build`. Um campo faltando ou
    com tipo errado em `resume.ts` falha com arquivo, linha e nome do campo (FR-002).
  - **Unitários (Vitest)**: `formatPeriod`, ordenação por data, invariantes dos dados que o tipo
    não cobre (datas `AAAA-MM` válidas, início ≤ fim, ids únicos, URLs `https://`, contagens da
    paridade do SC-001).
  - **Componente (Vitest + Test Utils)**: itens opcionais ausentes não geram blocos vazios (US3
    cenário 3); `RevealText` renderiza texto puro no servidor.
  - **E2E (Playwright, sobre `vite preview` do build)**: âncoras, menu mobile, JS desligado,
    movimento reduzido, 4 larguras sem rolagem horizontal, console limpo, badges bloqueados, links
    externos, foco visível; `axe` sem violações críticas/sérias (SC-005).
  - **Desempenho**: Lighthouse manual no build (quickstart) para SC-004 e SC-012; o Playwright
    mede o peso transferido.

## R12. Orçamento de peso (SC-012)

- **Medição atual**: as 3 imagens decorativas `.webp` somam 433 KB e as 6 fontes `.woff2`, 189 KB —
  622 KB só em assets, acima dos 500 KB do SC-012 mesmo sem nenhum JS.
- **Decision**: o SC-012 é medido no **carregamento inicial sem rolagem** (as imagens decorativas
  são `loading="lazy"` e ficam fora da dobra). Orçamento: HTML + CSS ≤ 60 KB, JS ≤ 150 KB, fontes
  ≤ 190 KB (gzip/brotli onde se aplica). Além disso, reencodar as 3 imagens decorativas para ≤ 60 KB
  cada (elas aparecem com tint e baixa opacidade, então a perda de qualidade não é visível).
- **Rationale**: mantém o SC-012 significativo para o que o visitante baixa ao abrir a página e
  reduz o total da visita completa para ~400 KB + JS.
- **Verificação**: teste e2e soma `transferSize` dos recursos no `load` sem rolagem, falha acima de
  500 KB; o build imprime o tamanho dos chunks.
- **LCP móvel (SC-004, T089, 2026-10-07)**: Lighthouse 12, perfil móvel (4G simulado), Chrome com
  `--force-prefers-reduced-motion` (sem a tela de boot, como pede o SC-004), 3 execuções sobre o
  `vite preview`. O elemento de LCP é o `<h1>` do hero em Iosevka 800, com 84% do tempo em "render
  delay": as 6 fontes entram no caminho crítico porque toda a página está no HTML pré-renderizado.
  Antes: LCP 2,8 / 2,8 / 3,0 s. Opção 1 da T089 (peso 800 só com as letras do nome — 32 KB → 4 KB —
  e `preload` com `fetchpriority="high"`): LCP 2,4 / 2,4 / 2,4 s, CLS 0,005, performance 0,98. As
  opções 2 e 3 não foram necessárias. O subset sai de `tools/build-fonts.sh`, que lê o nome de
  `src/data/resume.ts`; `tests/unit/fonts.spec.ts` acusa se o nome mudar sem regerar a fonte.
