<script setup lang="ts">
import { FileTerminal, FileText, FolderCode } from '@lucide/vue'
import { nextTick, onMounted, provide, readonly, ref } from 'vue'
import type { TerminalTyping } from '@/composables/useTerminalTyping'
import { WINDOW_CONTROLS } from './window-controls'

/**
 * Janela que minimiza e fecha como um arquivo de área de trabalho (feature 004, FR-001 a FR-011,
 * research R8). Embrulha o quadro visual da janela (o slot) e, no lugar dele, mostra um ícone
 * quadrado com o título embaixo enquanto a janela está minimizada ou fechada.
 *
 * - Minimizada: reabre completa (a digitação é concluída ao minimizar, FR-004).
 * - Fechada: reabre "recarregando", com os comandos digitados de novo (FR-005).
 * - Encolher e crescer são animações FLIP de 320 ms (só transform, opacidade e a altura do
 *   contêiner); sem movimento, a troca é direta (FR-008).
 * - Sem JavaScript, nada disto existe: a janela fica aberta e os controles são desenho (FR-009). Toda
 *   visita começa com as janelas abertas (FR-010); na impressão, saem abertas (FR-011).
 */
type WindowKind = 'document' | 'script' | 'project'
type WindowState = 'open' | 'minimized' | 'closed'

const props = defineProps<{ title: string; kind: WindowKind }>()

const ICONS = { document: FileText, script: FileTerminal, project: FolderCode } as const
/** Duração de cada animação (FR-006: no máximo 400 ms). */
const DURATION = 320
const EASING = 'cubic-bezier(0.2, 0.7, 0.2, 1)'

const state = ref<WindowState>('open')
const mounted = ref(false)
/** O quadro continua visível, por cima, enquanto encolhe até o ícone. */
const leaving = ref(false)
const root = ref<HTMLElement | null>(null)
const frame = ref<HTMLElement | null>(null)
const icon = ref<HTMLButtonElement | null>(null)

let typing: TerminalTyping | null = null
let replayOnOpen = false
let running: Animation[] = []

const animated = () =>
  document.documentElement.classList.contains('motion') && typeof HTMLElement.prototype.animate === 'function'

function finishRunning() {
  const current = running
  running = []
  current.forEach((animation) => animation.finish())
}

/** Transform que leva o retângulo `from` para o `to` (origem no canto de cima, à esquerda). */
const toward = (from: DOMRect, to: DOMRect) =>
  `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${Math.max(to.width / from.width, 0.01)}, ${Math.max(to.height / from.height, 0.01)})`

async function hide(next: 'minimized' | 'closed') {
  finishRunning()
  if (state.value !== 'open') return
  typing?.complete()
  if (next === 'closed') replayOnOpen = true

  const box = root.value
  const win = frame.value
  if (!animated() || !box || !win) {
    state.value = next
    await nextTick()
    icon.value?.focus()
    return
  }

  const first = win.getBoundingClientRect()
  const startHeight = box.offsetHeight
  win.style.width = `${first.width}px`
  leaving.value = true
  state.value = next
  await nextTick()
  const target = icon.value!.querySelector('.desktop-icon-square')!.getBoundingClientRect()
  const endHeight = box.offsetHeight
  icon.value?.focus()

  const shrink = win.animate(
    [
      { transform: 'none', opacity: 1 },
      { transform: toward(first, target), opacity: 0 },
    ],
    { duration: DURATION, easing: EASING },
  )
  const collapse = box.animate([{ height: `${startHeight}px` }, { height: `${endHeight}px` }], { duration: DURATION, easing: EASING })
  const appear = icon.value!.animate(
    [
      { opacity: 0, transform: 'scale(0.6)' },
      { opacity: 1, transform: 'none' },
    ],
    { duration: DURATION, easing: EASING },
  )
  running = [shrink, collapse, appear]
  await shrink.finished.catch(() => {})
  leaving.value = false
  win.style.width = ''
}

async function open() {
  finishRunning()
  if (state.value === 'open') return
  const replay = replayOnOpen
  replayOnOpen = false

  const box = root.value
  const square = icon.value?.querySelector('.desktop-icon-square')
  const after = () => {
    frame.value?.querySelector<HTMLButtonElement>('button.t-min')?.focus()
    // depois do foco: o foco dentro da janela completaria a digitação (feature 002)
    if (replay) typing?.replay()
  }
  if (!animated() || !box || !square || !frame.value) {
    state.value = 'open'
    await nextTick()
    return after()
  }

  const from = square.getBoundingClientRect()
  const startHeight = box.offsetHeight
  state.value = 'open'
  await nextTick()
  const win = frame.value
  const last = win.getBoundingClientRect()
  const endHeight = box.offsetHeight

  const grow = win.animate(
    [
      { transform: toward(last, from), opacity: 0 },
      { transform: 'none', opacity: 1 },
    ],
    { duration: DURATION, easing: EASING },
  )
  const expand = box.animate([{ height: `${startHeight}px` }, { height: `${endHeight}px` }], { duration: DURATION, easing: EASING })
  running = [grow, expand]
  await grow.finished.catch(() => {})
  after()
}

provide(WINDOW_CONTROLS, {
  mounted: readonly(mounted),
  minimize: () => void hide('minimized'),
  close: () => void hide('closed'),
  register: (t) => {
    typing = t
  },
})

onMounted(() => {
  mounted.value = true
})
</script>

<template>
  <div ref="root" class="desktop-window" :data-window-state="state">
    <div ref="frame" :class="['desktop-window-frame', { leaving }]">
      <slot />
    </div>
    <button
      v-if="mounted"
      v-show="state !== 'open'"
      ref="icon"
      type="button"
      class="desktop-icon"
      :aria-label="`Abrir ${props.title}`"
      @click="open"
    >
      <span class="desktop-icon-square">
        <component :is="ICONS[props.kind]" class="desktop-icon-glyph" aria-hidden="true" />
      </span>
      <span class="desktop-icon-label mono">{{ props.title }}</span>
    </button>
  </div>
</template>

<style scoped>
.desktop-window { position: relative; }

/* minimizada ou fechada: o quadro sai do fluxo; enquanto encolhe, fica por cima do ícone */
.desktop-window:not([data-window-state="open"]) > .desktop-window-frame:not(.leaving) { display: none; }

.desktop-window-frame.leaving {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  pointer-events: none;
  transform-origin: top left;
}

.desktop-window-frame { transform-origin: top left; }

/* o "arquivo da área de trabalho": quadrado com o ícone e o título embaixo (FR-002) */
.desktop-icon {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  width: calc(var(--desktop-icon-size) + 2.5rem);
  padding: calc(var(--spacing) * 1.6);
  color: var(--text);
  background: none;
  border: 1px solid transparent;
  border-radius: var(--radius-card);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.desktop-icon-square {
  display: grid;
  place-items: center;
  width: var(--desktop-icon-size);
  height: var(--desktop-icon-size);
  color: var(--green-bright);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: 0 8px 28px color-mix(in srgb, var(--shadow) 45%, transparent);
  transition: border-color 0.2s, box-shadow 0.2s, color 0.2s;
}

.desktop-icon-glyph {
  width: 2.5rem;
  height: 2.5rem;
}

.desktop-icon-label {
  max-width: 100%;
  font-size: 0.8rem;
  line-height: 1.35;
  text-align: center;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.desktop-icon:hover,
.desktop-icon:focus-visible {
  background: color-mix(in srgb, var(--purple) 22%, transparent);
  border-color: color-mix(in srgb, var(--purple-light) 45%, transparent);
}

.desktop-icon:hover .desktop-icon-square,
.desktop-icon:focus-visible .desktop-icon-square {
  border-color: var(--purple-light);
  color: var(--purple-glow);
  box-shadow: 0 8px 28px color-mix(in srgb, var(--shadow) 45%, transparent), 0 0 20px color-mix(in srgb, var(--purple-light) 30%, transparent);
}

/* impressão: toda janela sai aberta e completa (FR-011) */
@media print {
  .desktop-window > .desktop-window-frame { display: block !important; position: static !important; }
  .desktop-icon { display: none !important; }
}
</style>
