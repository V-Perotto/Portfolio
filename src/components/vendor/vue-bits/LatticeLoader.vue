<!--
  Vue Bits — LatticeLoader
  Origem: https://vue-bits.dev/micro/lattice-loader, de
  DavidHDev/vue-bits@07c0f76d5567db022c2e3185dd97a2311e056c0c
  src/content/Micro/LatticeLoader/LatticeLoader.vue
  Licença: MIT + Commons Clause — Copyright (c) 2025 David Haz
  Modificações locais (feature 006, research R13):
  - CSS com escopo no lugar das classes do Tailwind, com as mesmas variáveis `--ll-*` e os mesmos
    `@keyframes lattice-*` (globais, como no original);
  - sem o `role="status"` nem o texto `sr-only` que anunciava cada troca de estado (na primeira linha do
    hero, o anúncio seria ruído para o leitor de tela): o rótulo ativo é texto comum, e os outros ficam
    `aria-hidden`;
  - sem o cronômetro (o autor pediu Show Timer off) e sem as props `elapsed` e `className`;
  - o texto acompanha a cor do estado (`color` trabalhando, `doneColor` pronto), como o autor pediu;
  - tamanho do texto herdado quando `fontSize` não é dado (`1em`);
  - prop `paused`: a onda para (fora da tela).
-->
<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

export type LatticeStatus = 'working' | 'done' | 'error'
export type LatticePatternName = 'arrow' | 'dots' | 'orbit' | 'ripple' | 'snake' | 'spiral' | 'sweep' | 'spin' | 'rain' | 'pulse'
export type LatticeGrid = 3 | 4

type ResolvedPattern = { cells: (number | null)[]; loop: number; scale: number; lit?: number }

const PATTERNS: Record<LatticePatternName, Partial<Record<LatticeGrid, ResolvedPattern>>> = {
  arrow: { 3: { cells: [1, 2, 3, 0, 1, 2, 1, 2, 3], loop: 7.2, scale: 1 } },
  dots: { 3: { cells: [0, 1, 2, 0, 1, 2, 0, 1, 2], loop: 3, scale: 2.4 } },
  ripple: { 3: { cells: [2, 1, 2, 1, 0, 1, 2, 1, 2], loop: 4.8, scale: 1.5 } },
  spiral: { 3: { cells: [0, 1, 2, 7, 8, 3, 6, 5, 4], loop: 9, scale: 1.2, lit: 0.35 } },
  orbit: {
    3: { cells: [0, 1, 2, 7, null, 3, 6, 5, 4], loop: 8, scale: 1.2 },
    4: { cells: [0, 1, 2, 3, 11, null, null, 4, 10, null, null, 5, 9, 8, 7, 6], loop: 6, scale: 1.2, lit: 0.45 },
  },
  snake: {
    3: { cells: [0, 1, 2, 5, 4, 3, 6, 7, 8], loop: 9, scale: 1, lit: 0.35 },
    4: { cells: [0, 1, 2, 3, 7, 6, 5, 4, 8, 9, 10, 11, 15, 14, 13, 12], loop: 16, scale: 1, lit: 0.25 },
  },
  sweep: { 4: { cells: [0, 1, 2, 3, 1, 2, 3, 4, 2, 3, 4, 5, 3, 4, 5, 6], loop: 5, scale: 1, lit: 0.45 } },
  spin: { 4: { cells: [0, 0, 1, 1, 0, 0, 1, 1, 3, 3, 2, 2, 3, 3, 2, 2], loop: 4, scale: 1.6, lit: 0.35 } },
  rain: { 4: { cells: [0, 2, 1, 3, 1, 3, 2, 4, 2, 4, 3, 5, 3, 5, 4, 6], loop: 4, scale: 1.2, lit: 0.35 } },
  pulse: { 4: { cells: [2, 1, 1, 2, 1, 0, 0, 1, 1, 0, 0, 1, 2, 1, 1, 2], loop: 2.4, scale: 2.5, lit: 0.45 } },
}
const DEFAULT_PATTERN: Record<LatticeGrid, LatticePatternName> = { 3: 'orbit', 4: 'sweep' }
/** Células acesas das marcas de pronto (✓) e de erro (✕). */
const MARKS: Record<LatticeGrid, Record<'done' | 'error', number[]>> = {
  3: { done: [2, 3, 5, 7], error: [0, 2, 4, 6, 8] },
  4: { done: [7, 8, 10, 13], error: [0, 3, 5, 6, 9, 10, 12, 15] },
}
const LIT: Record<number, string> = { 62: 'll-lit-62', 45: 'll-lit-45', 35: 'll-lit-35', 25: 'll-lit-25' }

const props = withDefaults(
  defineProps<{
    label?: string
    doneLabel?: string
    errorLabel?: string
    status?: LatticeStatus
    pattern?: LatticePatternName
    grid?: LatticeGrid
    shape?: 'square' | 'round'
    color?: string
    doneColor?: string
    errorColor?: string
    cellSize?: number
    gap?: number
    fontSize?: number
    step?: number
    idleOpacity?: number
    glow?: boolean
    glowColor?: string
    paused?: boolean
  }>(),
  {
    label: 'Thinking',
    doneLabel: 'Done in',
    errorLabel: 'Failed after',
    status: 'working',
    pattern: 'orbit',
    grid: 3,
    shape: 'round',
    color: 'currentColor',
    doneColor: '#22c55e',
    errorColor: '#ef4444',
    cellSize: 6,
    gap: 2,
    fontSize: undefined,
    step: 90,
    idleOpacity: 0.15,
    glow: false,
    glowColor: '',
    paused: false,
  },
)

const n = computed<LatticeGrid>(() => (props.grid === 4 ? 4 : 3))
const pat = computed(() => PATTERNS[props.pattern]?.[n.value] ?? (PATTERNS[DEFAULT_PATTERN[n.value]][n.value] as ResolvedPattern))
const marks = computed(() => MARKS[n.value])
const d = computed(() => props.step * pat.value.scale)
const cycle = computed(() => Math.round(pat.value.loop * d.value))

let lastMark: 'done' | 'error' = 'done'
const mark = computed(() => {
  if (props.status !== 'working') lastMark = props.status
  return lastMark
})

const litClass = computed(() => LIT[Math.round((pat.value.lit ?? 0.62) * 100)] ?? LIT[62])

const rootStyle = computed(
  () =>
    ({
      '--ll-n': n.value,
      '--ll-cell': `${props.cellSize}px`,
      '--ll-gap': `${props.gap}px`,
      '--ll-font': props.fontSize ? `${props.fontSize}px` : '1em',
      '--ll-color': props.color,
      '--ll-mark': props.status === 'error' ? props.errorColor : props.doneColor,
      '--ll-idle': props.idleOpacity,
      '--ll-glow': props.glowColor || props.color,
      '--ll-mark-glow': props.glowColor || (props.status === 'error' ? props.errorColor : props.doneColor),
      '--ll-cycle': `${cycle.value}ms`,
      '--ll-peak': 1,
      '--ll-ease-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
      '--ll-ease-in-out': 'cubic-bezier(0.77, 0, 0.175, 1)',
    }) as CSSProperties,
)
</script>

<template>
  <span
    class="lattice-loader"
    :data-status="status"
    :data-shape="shape"
    :data-glow="glow ? '' : undefined"
    :data-paused="paused ? '' : undefined"
    :style="rootStyle"
  >
    <span class="ll-grid" aria-hidden="true">
      <span class="ll-run">
        <span
          v-for="(unit, i) in pat.cells"
          :key="i"
          :class="['ll-cell', unit == null ? 'll-hole' : ['ll-lit', litClass]]"
          :style="unit == null ? undefined : { animationDelay: `${Math.round(unit * d)}ms` }"
        />
      </span>
      <span class="ll-mark">
        <span v-for="(_, i) in pat.cells" :key="i" class="ll-cell ll-mark-cell" :data-on="marks[mark].includes(i) ? '' : undefined" />
      </span>
    </span>
    <span class="ll-label">
      <span class="ll-text" :data-active="status === 'working' ? '' : undefined" :aria-hidden="status === 'working' ? undefined : 'true'">{{ label }}</span>
      <span class="ll-text" :data-active="status === 'done' ? '' : undefined" :aria-hidden="status === 'done' ? undefined : 'true'">{{ doneLabel }}</span>
      <span class="ll-text" :data-active="status === 'error' ? '' : undefined" :aria-hidden="status === 'error' ? undefined : 'true'">{{ errorLabel }}</span>
    </span>
  </span>
</template>

<style scoped>
.lattice-loader {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: calc(var(--ll-font) * 0.625);
  font-family: inherit;
  font-size: var(--ll-font);
  line-height: 1;
  color: var(--ll-color);
  transition: color 200ms ease;
}

.lattice-loader[data-status="done"],
.lattice-loader[data-status="error"] { color: var(--ll-mark); }

.ll-grid {
  display: grid;
  flex-shrink: 0;
}

.ll-run,
.ll-mark {
  grid-area: 1 / 1;
  display: grid;
  grid-template-columns: repeat(var(--ll-n), var(--ll-cell));
  gap: var(--ll-gap);
}

.ll-run { transition: opacity 200ms ease; }

.lattice-loader:not([data-status="working"]) .ll-run { opacity: 0; }

.lattice-loader:not([data-status="working"]) .ll-run > span,
.lattice-loader[data-paused] .ll-run > span { animation-play-state: paused; }

.ll-cell {
  width: var(--ll-cell);
  height: var(--ll-cell);
  border-radius: max(1px, calc(var(--ll-cell) * 0.25));
  background: var(--ll-color);
}

.lattice-loader[data-shape="round"] .ll-cell { border-radius: 9999px; }

.ll-hole { opacity: calc(var(--ll-idle) * 0.47); }

.ll-lit {
  opacity: var(--ll-idle);
  animation-duration: var(--ll-cycle);
  animation-iteration-count: infinite;
  animation-timing-function: var(--ll-ease-in-out);
}

.ll-lit-62 { animation-name: lattice-on; }
.ll-lit-45 { animation-name: lattice-on-45; }
.ll-lit-35 { animation-name: lattice-on-35; }
.ll-lit-25 { animation-name: lattice-on-25; }

.lattice-loader[data-glow] .ll-lit { box-shadow: 0 0 calc(var(--ll-cell) * 1.2) calc(var(--ll-cell) * 0.12) var(--ll-glow); }

.ll-mark {
  transform-origin: center;
  opacity: 0;
  transform: scale(0.9);
  transition: opacity 160ms var(--ll-ease-out), transform 160ms var(--ll-ease-out);
}

.lattice-loader:not([data-status="working"]) .ll-mark {
  opacity: 1;
  transform: none;
  transition: opacity 200ms ease, transform 200ms var(--ll-ease-out);
}

.ll-mark-cell {
  opacity: var(--ll-idle);
  transition: opacity 200ms ease, background-color 200ms ease;
}

.ll-mark-cell[data-on] {
  background: var(--ll-mark);
  opacity: var(--ll-peak);
}

.lattice-loader[data-glow] .ll-mark-cell[data-on] { box-shadow: 0 0 calc(var(--ll-cell) * 1.2) calc(var(--ll-cell) * 0.12) var(--ll-mark-glow); }

.ll-label {
  position: relative;
  display: inline-block;
  font-weight: 500;
}

.ll-text {
  position: absolute;
  top: 0;
  left: 0;
  white-space: nowrap;
  opacity: 0;
  filter: blur(2px);
  transition: opacity 200ms ease, filter 200ms ease;
}

.ll-text[data-active] {
  position: static;
  opacity: 1;
  filter: blur(0);
}

@media (prefers-reduced-motion: reduce) {
  .ll-run { --ll-peak: 0.7; }
  .ll-run > span {
    animation-delay: 0ms !important;
    animation-duration: 1400ms !important;
  }
  .ll-mark { transform: none !important; }
  .ll-text { filter: none !important; }
}
</style>

<style>
@keyframes lattice-on {
  0%, 100% { opacity: var(--ll-idle); }
  18%, 42% { opacity: var(--ll-peak); }
  62% { opacity: var(--ll-idle); }
}

@keyframes lattice-on-45 {
  0%, 100% { opacity: var(--ll-idle); }
  13%, 31% { opacity: var(--ll-peak); }
  45% { opacity: var(--ll-idle); }
}

@keyframes lattice-on-35 {
  0%, 100% { opacity: var(--ll-idle); }
  10%, 24% { opacity: var(--ll-peak); }
  35% { opacity: var(--ll-idle); }
}

@keyframes lattice-on-25 {
  0%, 100% { opacity: var(--ll-idle); }
  7%, 17% { opacity: var(--ll-peak); }
  25% { opacity: var(--ll-idle); }
}
</style>
