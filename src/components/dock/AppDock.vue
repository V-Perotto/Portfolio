<script setup lang="ts">
import { SquareTerminal } from '@lucide/vue'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useBootDone } from '@/composables/useBootDone'
import { useMotion } from '@/composables/useMotion'
import type { NavSection, SectionId } from '@/lib/sections'
import { trackKeyboardOffset } from '@/lib/viewport'
import DockTerminal from './DockTerminal.vue'

/**
 * Dock no centro inferior da tela com o terminal do site (feature 004, FR-017 a FR-027, research R7).
 * Só existe no cliente e depois do boot (sem JavaScript, não há dock: FR-026). O terminal abre e fecha
 * pelo botão da dock e por Ctrl+Alt+T; também fecha por `exit`, pelo ✕ e por Esc (FR-019). Onde o
 * sistema operacional captura o Ctrl+Alt+T (Ubuntu e outros Linux), a dock é o caminho (clarify).
 *
 * A dica do botão (feature 006, FR-026, FR-027, research R10) é do próprio site, com o atalho
 * `Ctrl + Alt + T`, no lugar da dica nativa (`title`): aparece com o mouse parado sobre o botão (150 ms)
 * e com o foco pelo teclado; continua com o ponteiro sobre ela; some ao sair, com Esc e ao abrir o
 * terminal; não existe no toque. O nome acessível do botão já cita o atalho: a dica é `aria-hidden`.
 */
const props = defineProps<{ sections: readonly NavSection[] }>()

const mounted = ref(false)
const bootDone = useBootDone()
const motion = useMotion()
const open = ref(false)
const button = ref<HTMLButtonElement | null>(null)
const terminal = ref<InstanceType<typeof DockTerminal> | null>(null)

/** Dica visível; o ponteiro (depois da espera) e o foco de teclado a pedem, Esc a dispensa. */
const tip = ref(false)
let hovered = false
let focused = false
let dismissed = false
let hoverTimer: ReturnType<typeof setTimeout> | null = null
const TIP_DELAY_MS = 150

function onTipKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  dismissed = true
  syncTip()
}

function syncTip() {
  const show = !open.value && !dismissed && (hovered || focused)
  if (show === tip.value) return
  tip.value = show
  if (show) document.addEventListener('keydown', onTipKeydown)
  else document.removeEventListener('keydown', onTipKeydown)
}

function onPointerEnter(e: PointerEvent) {
  if (e.pointerType === 'touch') return
  if (hoverTimer) clearTimeout(hoverTimer)
  hoverTimer = setTimeout(() => {
    hovered = true
    syncTip()
  }, TIP_DELAY_MS)
}

function onPointerLeave() {
  if (hoverTimer) clearTimeout(hoverTimer)
  hoverTimer = null
  hovered = false
  if (!focused) dismissed = false
  syncTip()
}

function onFocus() {
  focused = !!button.value?.matches(':focus-visible')
  syncTip()
}

function onBlur() {
  focused = false
  if (!hovered) dismissed = false
  syncTip()
}

async function show() {
  open.value = true
  syncTip()
  await nextTick()
  terminal.value?.focusInput()
}

async function close() {
  open.value = false
  await nextTick()
  button.value?.focus()
}

const toggle = () => (open.value ? close() : show())

/** `find <seção>`: rola até a seção e troca o hash sem pular; o terminal continua aberto (clarify). */
function goto(id: SectionId) {
  document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: motion.value ? 'smooth' : 'instant' })
  history.replaceState(null, '', `#${id}`)
}

function onKeydown(e: KeyboardEvent) {
  if (!e.ctrlKey || !e.altKey || e.shiftKey || e.metaKey || e.code !== 'KeyT') return
  if (!mounted.value || !bootDone.value) return
  // com uma janela de editor maximizada (diálogo modal), o terminal não abre por cima (feature 006)
  if (document.documentElement.classList.contains('window-maximized')) return
  e.preventDefault()
  void toggle()
}

let stopKeyboardOffset: (() => void) | null = null

onMounted(() => {
  mounted.value = true
  document.addEventListener('keydown', onKeydown)
  stopKeyboardOffset = trackKeyboardOffset()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('keydown', onTipKeydown)
  if (hoverTimer) clearTimeout(hoverTimer)
  stopKeyboardOffset?.()
})
</script>

<template>
  <div v-if="mounted && bootDone" class="app-dock-root">
    <Transition name="dock-terminal">
      <DockTerminal v-if="open" ref="terminal" class="dock-terminal-window" :sections="props.sections" @close="close" @goto="goto" />
    </Transition>
    <div class="app-dock">
      <div class="dock-item" @pointerenter="onPointerEnter" @pointerleave="onPointerLeave">
        <button
          ref="button"
          type="button"
          :class="['dock-btn', { 'dock-btn-open': open }]"
          :aria-label="open ? 'Fechar terminal (Ctrl+Alt+T)' : 'Abrir terminal (Ctrl+Alt+T)'"
          :aria-expanded="open"
          :aria-controls="open ? 'dock-terminal' : undefined"
          @click="toggle"
          @focus="onFocus"
          @blur="onBlur"
        >
          <SquareTerminal class="dock-icon" aria-hidden="true" />
        </button>
        <span class="dock-tip mono" aria-hidden="true" :data-show="tip || undefined">
          <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>T</kbd>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-dock {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(0.75rem + var(--kb-offset, 0px));
  width: fit-content;
  margin-inline: auto;
  z-index: 90;
  display: flex;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 1.6);
  background: color-mix(in srgb, var(--surface) 85%, transparent);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: 0 8px 32px color-mix(in srgb, var(--shadow) 55%, transparent);
}

.dock-item {
  position: relative;
  display: grid;
}

/* dica do botão (feature 006, FR-026, FR-027): acima dele, no estilo das janelas do site */
.dock-tip {
  position: absolute;
  bottom: calc(100% + 0.75rem);
  left: 50%;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.55rem;
  white-space: nowrap;
  font-size: 0.78rem;
  color: var(--text-dim);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-btn);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--shadow) 45%, transparent), 0 0 14px color-mix(in srgb, var(--purple-light) 25%, transparent);
  transform: translate(-50%, 4px);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

/* ponte invisível no vão até o botão: o ponteiro passa do botão para a dica sem ela sumir */
.dock-tip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  height: 0.85rem;
}

.dock-tip[data-show] {
  transform: translate(-50%, 0);
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

html.motion .dock-tip { transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s ease; }

.dock-tip kbd {
  font-family: inherit;
  font-size: inherit;
  line-height: 1.4;
  padding: 0 0.35rem;
  color: var(--green-bright);
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-nav);
}

@media (hover: none) {
  .dock-tip { display: none; }
}

.dock-btn {
  position: relative;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  color: var(--green-bright);
  background: color-mix(in srgb, var(--green) 12%, transparent);
  border: 1px solid var(--green);
  border-radius: var(--radius-btn);
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, color 0.2s;
}

.dock-btn:hover,
.dock-btn:focus-visible {
  background: var(--green);
  color: var(--on-green);
  box-shadow: 0 0 18px color-mix(in srgb, var(--green-light) 45%, transparent);
}

/* indicador de "aberto", como numa dock de sistema */
.dock-btn-open::after {
  content: "";
  position: absolute;
  bottom: -0.55rem;
  width: 0.3rem;
  height: 0.3rem;
  border-radius: 50%;
  background: var(--green-bright);
}

.dock-icon {
  width: 1.4rem;
  height: 1.4rem;
}

.dock-terminal-window {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(var(--dock-space) + 0.5rem + var(--kb-offset, 0px));
  width: min(720px, calc(100% - 2rem));
  margin-inline: auto;
  z-index: 95;
}

/* sobe a partir da dock (FR-019); sem animação com "reduzir movimento" */
html.motion .dock-terminal-enter-active,
html.motion .dock-terminal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
  transform-origin: bottom center;
}

html.motion .dock-terminal-enter-from,
html.motion .dock-terminal-leave-to {
  opacity: 0;
  transform: translateY(1.5rem) scale(0.97);
}

@media print {
  .app-dock-root { display: none; }
}
</style>
