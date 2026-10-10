<script setup lang="ts">
import { SquareTerminal } from '@lucide/vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useBootDone } from '@/composables/useBootDone'
import { useMotion } from '@/composables/useMotion'
import { canAnimate, finishAll, FLIP_EASING, FLIP_MS, toward } from '@/lib/flip'
import type { NavSection, OpenTarget, SectionId } from '@/lib/sections'
import { trackKeyboardOffset } from '@/lib/viewport'
import { openWindow } from '@/lib/windows'
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
 *
 * Feature 007 (FR-010 a FR-017, research R5, contracts/dock-minimize.md): o terminal tem três estados.
 * Aberto, o `−`, o botão da dock e o Ctrl+Alt+T o minimizam: ele encolhe até o botão (FLIP de 320 ms,
 * como as janelas encolhem até o ícone) e fica montado e invisível (`opacity: 0` + `inert`), com
 * a sessão inteira; o botão e o atalho o restauram, crescendo a partir do botão. Fechar (`exit`, ✕, Esc)
 * continua descendo e apagando a sessão. O ponto sob o botão: cheio aberto, vazado minimizado.
 */
type TerminalState = 'closed' | 'open' | 'minimized'

const props = defineProps<{ sections: readonly NavSection[]; targets: readonly OpenTarget[] }>()

const mounted = ref(false)
const bootDone = useBootDone()
const motion = useMotion()
const state = ref<TerminalState>('closed')
/** O terminal continua visível, por cima, enquanto encolhe até o botão. */
const leaving = ref(false)
const button = ref<HTMLButtonElement | null>(null)
const terminal = ref<InstanceType<typeof DockTerminal> | null>(null)
let running: Animation[] = []

const LABELS: Record<TerminalState, string> = {
  closed: 'Abrir terminal (Ctrl+Alt+T)',
  open: 'Minimizar terminal (Ctrl+Alt+T)',
  minimized: 'Restaurar terminal (Ctrl+Alt+T)',
}
const label = computed(() => LABELS[state.value])
const terminalEl = () => terminal.value?.$el as HTMLElement | undefined

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
  const show = state.value !== 'open' && !dismissed && (hovered || focused)
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

/** Fechado → aberto, com uma sessão nova (sobe da dock pela `<Transition>`). */
async function show() {
  state.value = 'open'
  syncTip()
  await nextTick()
  terminal.value?.focusInput()
}

/** Aberto → fechado: apaga a sessão (o componente sai). */
async function close() {
  finishAll(running)
  leaving.value = false
  state.value = 'closed'
  syncTip()
  await nextTick()
  button.value?.focus()
}

/**
 * Aberto → minimizado: encolhe até o botão da dock e some, guardando a sessão. O `open` do terminal
 * minimiza sem trazer o foco para a dock (ele vai para a janela aberta, research R4).
 */
async function minimize({ focusButton = true } = {}) {
  if (state.value !== 'open') return
  finishAll(running)
  const el = terminalEl()
  const target = button.value?.getBoundingClientRect()
  const from = el?.getBoundingClientRect()
  state.value = 'minimized'
  syncTip()
  if (focusButton) button.value?.focus()
  if (!canAnimate() || !el || !target || !from) return
  leaving.value = true
  const shrink = el.animate(
    [
      { transform: 'none', opacity: 1 },
      { transform: toward(from, target), opacity: 0 },
    ],
    { duration: FLIP_MS, easing: FLIP_EASING },
  )
  running = [shrink]
  await shrink.finished.catch(() => {})
  if (running[0] === shrink) leaving.value = false
}

/** Minimizado → aberto: cresce a partir do botão, com a sessão como estava e o foco no prompt. */
async function restore() {
  if (state.value !== 'minimized') return
  finishAll(running)
  leaving.value = false
  state.value = 'open'
  syncTip()
  await nextTick()
  const el = terminalEl()
  const from = button.value?.getBoundingClientRect()
  if (canAnimate() && el && from) {
    running = [
      el.animate(
        [
          { transform: toward(el.getBoundingClientRect(), from), opacity: 0 },
          { transform: 'none', opacity: 1 },
        ],
        { duration: FLIP_MS, easing: FLIP_EASING },
      ),
    ]
  }
  terminal.value?.focusInput()
}

/** Botão da dock e Ctrl+Alt+T: abre, minimiza ou restaura (Q2: como numa barra de tarefas). */
const toggle = () => (state.value === 'closed' ? show() : state.value === 'open' ? minimize() : restore())

/**
 * `open <opção>` (feature 007, research R4): o terminal minimiza sozinho, sem trazer o foco para a dock
 * (clarify), e, ao mesmo tempo, a janela abre (ou maximiza) e recebe o foco.
 */
function onOpen(target: OpenTarget) {
  void minimize({ focusButton: false })
  void openWindow(target, { motion: motion.value })
}

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
  finishAll(running)
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('keydown', onTipKeydown)
  if (hoverTimer) clearTimeout(hoverTimer)
  stopKeyboardOffset?.()
})
</script>

<template>
  <div v-if="mounted && bootDone" class="app-dock-root">
    <Transition name="dock-terminal">
      <DockTerminal
        v-if="state !== 'closed'"
        ref="terminal"
        :class="['dock-terminal-window', { 'is-minimized': state === 'minimized' && !leaving }]"
        :inert="state === 'minimized'"
        :sections="props.sections"
        :targets="props.targets"
        @close="close"
        @minimize="minimize()"
        @goto="goto"
        @open="onOpen"
      />
    </Transition>
    <div class="app-dock">
      <div class="dock-item" @pointerenter="onPointerEnter" @pointerleave="onPointerLeave">
        <button
          ref="button"
          type="button"
          class="dock-btn"
          :data-terminal="state"
          :aria-label="label"
          :aria-expanded="state === 'open'"
          :aria-controls="state === 'open' ? 'dock-terminal' : undefined"
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

/* indicador, como numa dock de sistema: ponto cheio com o terminal aberto, vazado com ele minimizado
   (feature 007, FR-013, clarify); o contorno em --green-bright passa de 9:1 sobre a dock */
.dock-btn[data-terminal="open"]::after,
.dock-btn[data-terminal="minimized"]::after {
  content: "";
  position: absolute;
  bottom: -0.55rem;
  width: 0.3rem;
  height: 0.3rem;
  border-radius: 50%;
  background: var(--green-bright);
}

.dock-btn[data-terminal="minimized"]::after {
  bottom: -0.575rem;
  width: 0.35rem;
  height: 0.35rem;
  box-sizing: border-box;
  background: transparent;
  border: 1px solid var(--green-bright);
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
  /* o FLIP de minimizar e restaurar mede a partir do canto de cima à esquerda (lib/flip); a
     <Transition> de abrir e fechar troca a origem enquanto roda */
  transform-origin: top left;
}

/* minimizado (feature 007, research R5): invisível e fora do Tab e do leitor de tela (com `inert`), mas
   ainda no layout, para a saída e o prompt voltarem com a mesma rolagem e o mesmo cursor. `opacity`, e
   não `visibility`: sem movimento, a regra global de base.css dá a todo elemento uma transição de
   0,01 ms, e a `visibility` herdada pelos filhos transitaria, deixando o prompt "escondido" (sem aceitar
   o foco) no quadro em que o terminal volta */
.dock-terminal-window.is-minimized {
  opacity: 0;
  pointer-events: none;
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
