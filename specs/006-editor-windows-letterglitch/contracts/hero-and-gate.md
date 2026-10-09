# Contrato: hero (Letter Glitch, Lattice Loader), fim da porta, dock e favicon

**Feature**: `006-editor-windows-letterglitch` | Requisitos: FR-020 a FR-022, FR-026 a FR-044 |
Pesquisa: R8, R10–R15

## 1. Fim da porta de acesso (FR-020 a FR-022, R8)

| Momento | Observável |
|---------|-----------|
| script inline do `<head>` (com JS) | `history.scrollRestoration === 'manual'` |
| fim da porta (`booting` e `gate` saem) | `scrollY === 0`; `location.hash === ''` (sem entrada nova em `history.length`); `document.activeElement` = `body` |
| sem porta (JS tarde) | o site não chama `scrollTo`; a âncora, se houver, continua |
| sem JS | âncoras nativas |

## 2. Hero

```html
<header id="home" class="hero">
  <!-- cliente, com movimento, depois da porta (async) -->
  <div class="hero-glitch">
    <div class="letter-glitch" aria-hidden="true">
      <canvas class="letter-glitch-canvas"></canvas>
      <div class="letter-glitch-outer"></div>
      <div class="letter-glitch-center"></div>
    </div>
  </div>
  <div class="hero-content">
    <p class="hero-boot mono" data-loader="working|done|hidden">
      <span class="lattice-loader" data-status="working|done" data-shape="square" data-glow>
        <span class="ll-grid" aria-hidden="true">…9 células…</span>
        <span class="ll-label">
          <span class="ll-text" [data-active]>Inicializando portfolio.service</span>
          <span class="ll-text" [data-active]>portfolio.service carregado com sucesso!</span>
        </span>
      </span>
    </p>
    <h1>…</h1> …
  </div>
</header>
```

| Item | Contrato |
|------|----------|
| `.hero-glitch` | só com `html.motion`, depois de `booting` sair; nenhum `.hero-dots`, `.dot-field`, penumbra `.hero-content::before` |
| letras | 3 cores dos tokens `--glitch-*` com `--glitch-alpha`; troca contínua; sem `getImageData` (o canvas pode estar num worker) |
| vinhetas | `.letter-glitch-outer` (`--glitch-vignette-outer`) e `.letter-glitch-center` (`--glitch-vignette-center`) |
| pausa | `.letter-glitch[data-paused]` e nenhum quadro novo com `#home` fora da tela ou `document.hidden`; com "reduzir movimento" (também ao vivo), `.hero-glitch` sai do DOM |
| contraste | texto de `#home h1`, `.hero-terminal`, `.hero-sub`, `.hero-boot`, `.btn-primary`, `.btn-ghost`, `.hero-scroll` ≥ 4,5:1 sobre a luminância máxima do fundo, em 10 quadros, 1366 e 390 px |
| `.hero-boot[data-loader]` | SSR/sem JS: `done` (estático, não some); com movimento: `working` → `done` entre `revealedAt + 3000` e `+ 10000` (assim que o hero está pronto, nunca antes de 3000) → `hidden` 3000 ms depois (`visibility: hidden`, fade ≤ 0,6 s); movimento reduzido: `done` → `hidden` em `revealedAt + 3000`, sem fade |
| geometria | o `getBoundingClientRect()` de `h1`, `.hero-terminal`, `.hero-sub`, `.hero-actions` é igual (±0 px) antes e depois de `hidden`; a altura do `.hero-boot` não muda entre os estados |
| cores do loader | `working`: células e texto `--loader-working`; `done`: ✓ e texto `--loader-done` |
| a11y | sem `role="status"`, sem texto `sr-only` no loader; só o `.ll-text[data-active]` na árvore de acessibilidade |

## 3. Porta de acesso (FR-035, FR-036)

| Item | Contrato |
|------|----------|
| `.gate-launcher::before` | `background: var(--gate-vignette)`; o Faulty Terminal visível em volta do ícone (luminância média do anel entre 6 e 10 rem do centro > a de hoje) |
| contraste | `.gate-icon .desktop-icon-label` e `.gate-hint` ≥ 4,5:1 em 10 quadros |
| curvatura | uniforme `uCurvature` = `curvatureFor(0.2, w, h)`: 0,2 em 1366 × 768; ≈ 0,052 em 390 × 844 |

## 4. Dica da dock (FR-026, FR-027, R10)

```html
<div class="app-dock">
  <div class="dock-item">
    <button class="dock-btn" aria-label="Abrir terminal (Ctrl+Alt+T)">…</button>   <!-- sem title -->
    <span class="dock-tip mono" aria-hidden="true" [data-show]>
      <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>T</kbd>
    </span>
  </div>
</div>
```

| Gatilho | `data-show` |
|---------|-------------|
| mouse parado sobre o botão | em ≤ 300 ms (150 ms de espera) |
| foco por teclado (`:focus-visible`) | na hora |
| ponteiro sobre a dica | continua |
| sair com o ponteiro e o foco; Esc; abrir o terminal | some |
| toque | nunca |

## 5. Favicon (FR-028, R11)

```html
<link rel="icon" href="/Portfolio/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/Portfolio/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/Portfolio/apple-touch-icon.png">
```

`favicon.svg`: o desenho `square-terminal` do Lucide em traço `--green-bright`, quadrado com fundo
`--bg`, brilho `--purple-light` (filtro de desfoque) atrás. Os três arquivos existem no `dist/` e
respondem 200.
