# Contract: vinheta e halo do hero, Sobre e tagline

**Feature**: `007-open-command-dock-minimize` | FR-018 a FR-025 | `src/styles/tokens.css`,
`src/components/sections/HeroSection.vue`, `src/components/sections/AboutSection.vue`,
`src/data/resume.ts`

## Letter Glitch do hero

| Item | 006 | 007 |
|------|-----|-----|
| Vinheta central | preto 96% → 90% aos 40% → transparente aos 80% | **a do componente**: preto 80% no centro → transparente aos 60% do raio (`circle`) |
| Vinheta das bordas | transparente até 60% → preto aos 100% | igual |
| Letras | `--glitch-alpha` 0,55, cores do tema, Glitch Speed 10, suave | igual |
| Penumbra sob o texto | nenhuma | nenhuma (FR-020) |
| Sem movimento / sem JS / impressão | degradês estáticos, sem vinhetas | igual |

## Halo do texto (FR-021, Q3 e Q5)

- Existe só com o fundo animado: o `<header id="home">` recebe `data-glitch` enquanto o `HeroGlitch`
  está montado; o CSS é `.hero[data-glitch] <alvo> { text-shadow: var(--hero-halo) }`.
- Alvos: só os textos que, medidos sem halo, ficam abaixo de 4,5:1. Pela medição do plano (research
  R7), **a tagline** (`.hero-sub`) e **o texto do loader** (`.hero-boot .ll-text`, nas duas fases).
  Outro texto só entra se o e2e o reprovar sem halo.
- Não ganham halo: o nome com glitch (`h1`), a linha do prompt, a grade do loader, os botões.
- `--hero-halo`: contorno preto sólido de 2 px (sombras sem desfoque nos deslocamentos de −2 a 2 px)
  e esfumado `0 0 4px #000, 0 0 8px rgb(0 0 0 / 0.8)`. Na impressão, `none`.
- Contraste exigido: ≥ 4,5:1 entre a cor do texto e o pior pixel da vizinhança de 2 px dos traços, em
  10 quadros (5 por fase no loader), 1366 × 800 e 390 × 844 (método no research R8).
- Extensão: no máximo 10 px além dos traços; a 12 px ou mais de qualquer texto, o fundo é o mesmo com e
  sem halo (SC-005).

## Botão `ping vittorio` (`.btn-ghost`) sobre o glitch

`.hero[data-glitch] .btn-ghost { background: color-mix(in srgb, var(--green) 12%, var(--bg)); }` — o
mesmo verde translúcido de hoje, agora sobre o `--bg` em vez do glitch. Rótulo `--green-bright`: 11:1.
Hover e foco sem mudança.

## Os demais textos do hero

Sem mudança de cor nem de estilo; medidos como na 006 (a maior luminância na caixa do texto, fundo dos
botões tirado) e precisam de ≥ 4,5:1: `h1`, `.hero-terminal`, `.btn-primary`, `.hero-scroll`.

## Sobre (FR-022, FR-023)

| Trecho | Cor antes | Cor depois |
|--------|-----------|------------|
| `$ cat sobre.txt`, `$ whois vittorio --info` | `--text-dim` (`$` roxo) | igual |
| texto de `cat sobre.txt` | `--text-dim` | **`--text`** (classe `about-text`) |
| "TypeScript", "Vue" (`.hl-green`) | verde | igual |
| selos de atributos | verde | igual |

Igual com e sem JavaScript (só CSS). Na impressão, os tokens do tema claro.

## Tagline (FR-024, FR-025)

`profile.tagline = 'Transformando processos em sistemas escaláveis'` (sem ponto final). Aparece igual
no HTML pré-renderizado, na revelação animada (BlurText, palavra a palavra), com movimento reduzido e
na impressão. `<title>` e `meta description` não mudam.
