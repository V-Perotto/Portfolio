<script setup lang="ts">
import { nextTick, onMounted, provide, readonly, ref } from 'vue'
import type { TerminalTyping } from '@/composables/useTerminalTyping'
import DesktopIcon, { type DesktopIconKind } from '@/components/base/DesktopIcon.vue'
import { canAnimate, finishAll, FLIP_EASING, FLIP_MS, toward } from '@/lib/flip'
import { WINDOW_CONTROLS } from './window-controls'

/**
 * Janela que minimiza e fecha como um arquivo de área de trabalho (feature 004, FR-001 a FR-011,
 * research R8). Embrulha o quadro visual da janela (o slot) e, no lugar dele, mostra um ícone
 * quadrado com o título embaixo enquanto a janela está minimizada ou fechada.
 *
 * - Minimizada: reabre completa (a digitação é concluída ao minimizar, FR-004).
 * - Fechada: reabre "recarregando", com os comandos digitados de novo (FR-005). A janela cresce já
 *   sem a saída dos comandos e só então digita, sem piscar o conteúdo inteiro (feature 006, FR-023,
 *   research R7).
 * - Encolher e crescer são animações FLIP de 320 ms (só transform, opacidade e a altura do
 *   contêiner), que partem de onde a janela estava mesmo quando o layout de minimizada muda o lugar da
 *   caixa (feature 005); sem movimento, a troca é direta (FR-008). O ícone é o `DesktopIcon`.
 * - Sem JavaScript, nada disto existe: a janela fica aberta e os controles são desenho (FR-009). Toda
 *   visita começa com as janelas abertas (FR-010); na impressão, saem abertas (FR-011).
 */
type WindowState = 'open' | 'minimized' | 'closed'

const props = defineProps<{ title: string; kind: DesktopIconKind }>()

const state = ref<WindowState>('open')
const mounted = ref(false)
/** O quadro continua visível, por cima, enquanto encolhe até o ícone. */
const leaving = ref(false)
const root = ref<HTMLElement | null>(null)
const frame = ref<HTMLElement | null>(null)
const icon = ref<InstanceType<typeof DesktopIcon> | null>(null)

let typing: TerminalTyping | null = null
let replayOnOpen = false
let running: Animation[] = []

function finishRunning() {
  const current = running
  running = []
  finishAll(current)
}

async function hide(next: 'minimized' | 'closed') {
  finishRunning()
  if (state.value !== 'open') return
  typing?.complete()
  if (next === 'closed') replayOnOpen = true

  const box = root.value
  const win = frame.value
  if (!canAnimate() || !box || !win) {
    state.value = next
    await nextTick()
    icon.value?.button?.focus()
    return
  }

  const first = win.getBoundingClientRect()
  const startHeight = box.offsetHeight
  win.style.width = `${first.width}px`
  leaving.value = true
  state.value = next
  await nextTick()
  const target = icon.value!.square!.getBoundingClientRect()
  const endHeight = box.offsetHeight
  // o quadro que encolhe fica no canto da caixa, e a caixa pode ter mudado de lugar ou de largura com o
  // layout de minimizada (o Contato à esquerda, os projetos lado a lado; feature 005, research R10): a
  // animação parte de onde a janela estava, medida a partir de onde o quadro está agora
  const now = win.getBoundingClientRect()
  icon.value?.button?.focus()

  const shrink = win.animate(
    [
      { transform: toward(now, first), opacity: 1 },
      { transform: toward(now, target), opacity: 0 },
    ],
    { duration: FLIP_MS, easing: FLIP_EASING },
  )
  const collapse = box.animate([{ height: `${startHeight}px` }, { height: `${endHeight}px` }], { duration: FLIP_MS, easing: FLIP_EASING })
  const appear = icon.value!.button!.animate(
    [
      { opacity: 0, transform: 'scale(0.6)' },
      { opacity: 1, transform: 'none' },
    ],
    { duration: FLIP_MS, easing: FLIP_EASING },
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
  // fechada: esconde comandos e saídas antes de a janela aparecer (ela cresce vazia, FR-023 da 006)
  if (replay) typing?.prepare()

  const box = root.value
  const square = icon.value?.square
  const after = () => {
    frame.value?.querySelector<HTMLButtonElement>('button.t-min')?.focus()
    // depois do foco: o foco dentro da janela completaria a digitação (feature 002)
    if (replay) typing?.replay()
  }
  if (!canAnimate() || !box || !square || !frame.value) {
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
    { duration: FLIP_MS, easing: FLIP_EASING },
  )
  const expand = box.animate([{ height: `${startHeight}px` }, { height: `${endHeight}px` }], { duration: FLIP_MS, easing: FLIP_EASING })
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
    <DesktopIcon
      v-if="mounted"
      v-show="state !== 'open'"
      ref="icon"
      :title="props.title"
      :kind="props.kind"
      @click="open"
    />
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

/* impressão: toda janela sai aberta e completa (FR-011) */
@media print {
  .desktop-window > .desktop-window-frame { display: block !important; position: static !important; }
  .desktop-icon { display: none !important; }
}
</style>
