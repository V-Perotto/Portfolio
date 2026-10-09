<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, readonly, ref } from 'vue'
import DesktopIcon from '@/components/base/DesktopIcon.vue'
import FaultyTerminal from '@/components/vendor/vue-bits/FaultyTerminal.vue'
import TextType from '@/components/vendor/vue-bits/TextType.vue'
import {
  displayVersion,
  FADE_MS,
  FALLBACK_IP,
  GATE_LATEST_START_MS,
  OPEN_MS,
  REDUCED_HOLD_MS,
  SESSION_MS,
  sessionAt,
  sessionLines,
  type SessionLine,
} from '@/lib/boot'
import { canAnimate, finishAll, FLIP_EASING, FLIP_MS, toward } from '@/lib/flip'
import { lookupVisitorIp } from '@/lib/visitor-ip'
import TerminalWindow from './TerminalWindow.vue'
import { WINDOW_CONTROLS } from './window-controls'

/**
 * Porta de acesso (feature 005, FR-001 a FR-021; constituição v3.0.0, Princípio IV). No lugar do boot
 * que abria sozinho, a tela mostra só o ícone `acessar_portfolio.sh` sobre o Faulty Terminal. Abrir o
 * ícone abre uma janela de tamanho fixo, só com minimizar e fechar, onde a sessão SSH é digitada pelo
 * TextType. No fim da sessão, a porta sai e a página aparece.
 *
 * - Minimizar esconde a janela e a sessão continua; se ela terminar minimizada, a página abre igual
 *   (clarify Q1). Fechar descarta a sessão e encerra a tentativa; o ícone abre uma nova (Q2).
 * - A sessão é guiada pelo relógio (research R3): começa `OPEN_MS` depois do clique, no fim da
 *   animação de abrir, e termina em `SESSION_MS`, mesmo com timers atrasados.
 * - A janela nasce no tamanho final: as seis linhas ficam no DOM desde o primeiro quadro, as que ainda
 *   não apareceram invisíveis (research R4).
 * - Sem movimento: fundo liso, nada anima, a sessão aparece inteira e a página abre 1 s depois (FR-012).
 * - Enquanto existe, o resto de `#app` fica `inert`; o foco começa no ícone e, no fim, vai para a
 *   seção da âncora ou volta ao início do documento (research R7).
 * - Só no cliente e só com `html.booting`; montado tarde demais (> 2055 ms), não aparece (R2).
 */
type GateState = 'idle' | 'open' | 'minimized' | 'done'

const TITLE = 'acessar_portfolio.sh'

const active = ref(false)
const state = ref<GateState>('idle')
/** A janela está na tela (também enquanto encolhe até o ícone). */
const showWindow = ref(false)
/** A janela encolhe até o ícone, por cima dele. */
const leaving = ref(false)
/** Saída da porta (fade). */
const hiding = ref(false)
/** Fundo animado: há movimento na montagem. */
const motionBg = ref(false)
/** Sessão sem animação (movimento reduzido no início dela). */
const still = ref(false)
const touch = ref(false)
const tint = ref('#4ade9b')
const status = ref('')

const lines = ref<SessionLine[]>([])
const visible = ref(0)
const sessionId = ref(0)
const sessionStart = ref(0)

const gate = ref<HTMLElement | null>(null)
const icon = ref<InstanceType<typeof DesktopIcon> | null>(null)
const launcher = ref<HTMLElement | null>(null)
const win = ref<HTMLElement | null>(null)

const hint = computed(() => `# ${touch.value ? 'toque' : 'clique'} no ícone para conectar`)

/** IP do visitante, quando a consulta (uma por carga, desde que a porta aparece) já respondeu. Cada
 *  sessão usa o que houver no início dela, sem esperar (FR-014, FR-015). */
let visitorIp: string | null = null

let clock: ReturnType<typeof setTimeout> | null = null
let running: Animation[] = []
/** Cada abrir/minimizar/fechar invalida o fim de uma animação anterior. */
let animToken = 0
let inerted: HTMLElement[] = []

const html = () => document.documentElement

function stopClock() {
  if (clock) clearTimeout(clock)
  clock = null
}

function finishRunning() {
  const current = running
  running = []
  finishAll(current)
}

function startSession() {
  still.value = !html().classList.contains('motion')
  sessionId.value++
  lines.value = sessionLines(visitorIp ?? FALLBACK_IP, displayVersion(__PORTFOLIO_VERSION__), new Date().toLocaleString('pt-BR'))
  // com animação, o primeiro caractere sai no fim do crescimento da janela
  sessionStart.value = performance.now() + (still.value ? 0 : OPEN_MS)
  visible.value = still.value ? lines.value.length : 0
  status.value = 'Conectando ao portfólio…'

  const endAt = sessionStart.value + (still.value ? REDUCED_HOLD_MS : SESSION_MS)
  const tick = () => {
    clock = null
    const now = performance.now()
    if (!still.value) visible.value = sessionAt(now - sessionStart.value, lines.value)
    if (now >= endAt) return finish()
    clock = setTimeout(tick, 16)
  }
  stopClock()
  tick()
}

/** O resto de `#app` sai do alcance do teclado, do mouse e do leitor de tela (FR-002). */
function lockPage() {
  const self = gate.value
  const parent = self?.parentElement
  if (!self || !parent) return
  inerted = [...parent.children].filter((el): el is HTMLElement => el !== self && el instanceof HTMLElement && !el.inert)
  inerted.forEach((el) => (el.inert = true))
}

function releasePage() {
  inerted.forEach((el) => (el.inert = false))
  inerted = []
}

/**
 * Fim do acesso (FR-009): com âncora no endereço, foco na seção dela; sem âncora, o foco volta ao
 * início do documento, como numa carga normal, e o primeiro Tab chega à navegação.
 */
function focusPage() {
  const id = decodeURIComponent(location.hash.slice(1))
  const target = id ? document.getElementById(id) : null
  if (!target) {
    ;(document.activeElement as HTMLElement | null)?.blur()
    return
  }
  target.scrollIntoView({ block: 'start', behavior: 'instant' })
  if (!target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1')
    target.setAttribute('data-gate-focus', '')
    target.addEventListener(
      'blur',
      () => {
        target.removeAttribute('tabindex')
        target.removeAttribute('data-gate-focus')
      },
      { once: true },
    )
  }
  target.focus({ preventScroll: true })
}

function finish() {
  if (state.value === 'done' || !active.value) return
  stopClock()
  finishRunning()
  visible.value = lines.value.length
  state.value = 'done'
  status.value = ''
  html().classList.remove('gate', 'booting')
  releasePage()
  focusPage()
  if (still.value || !html().classList.contains('motion')) {
    active.value = false
    return
  }
  hiding.value = true
  setTimeout(() => {
    active.value = false
  }, FADE_MS)
}

async function openWindow() {
  if (state.value === 'open' || state.value === 'done') return
  finishRunning()
  const token = ++animToken
  // do ícone parado (idle), uma tentativa nova; minimizada, a sessão segue de onde está (clarify Q1)
  if (state.value === 'idle') startSession()
  const from = icon.value?.square?.getBoundingClientRect()
  state.value = 'open'
  showWindow.value = true
  leaving.value = false
  await nextTick()
  if (token !== animToken) return
  win.value?.querySelector<HTMLButtonElement>('button.t-min')?.focus()
  if (!canAnimate() || !from || !win.value) return
  const last = win.value.getBoundingClientRect()
  running = [
    win.value.animate(
      [
        { transform: toward(last, from), opacity: 0 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: FLIP_MS, easing: FLIP_EASING },
    ),
  ]
}

async function hideWindow(next: 'minimized' | 'idle') {
  if (state.value !== 'open') return
  finishRunning()
  const token = ++animToken
  const closing = sessionId.value
  if (next === 'idle') {
    // fechar encerra a tentativa: a sessão para aqui e o portfólio não abre (FR-008)
    stopClock()
    status.value = 'Conexão encerrada'
  }
  const first = win.value?.getBoundingClientRect()
  const animate = canAnimate() && !!first
  state.value = next
  leaving.value = animate
  if (!animate) showWindow.value = false
  await nextTick()
  if (token !== animToken) return
  icon.value?.button?.focus()

  if (animate && win.value && first) {
    const target = icon.value?.square?.getBoundingClientRect()
    if (target) {
      const shrink = win.value.animate(
        [
          { transform: 'none', opacity: 1 },
          { transform: toward(first, target), opacity: 0 },
        ],
        { duration: FLIP_MS, easing: FLIP_EASING },
      )
      const appear = launcher.value?.animate(
        [
          { opacity: 0, transform: 'scale(0.6)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: FLIP_MS, easing: FLIP_EASING },
      )
      running = appear ? [shrink, appear] : [shrink]
      await shrink.finished.catch(() => {})
    }
    if (token !== animToken) return
    leaving.value = false
    showWindow.value = false
  }
  if (next === 'idle' && sessionId.value === closing) lines.value = []
}

provide(WINDOW_CONTROLS, {
  mounted: readonly(ref(true)),
  minimize: () => void hideWindow('minimized'),
  close: () => void hideWindow('idle'),
  register: () => {},
})

onMounted(async () => {
  const root = html()
  if (!root.classList.contains('booting')) return
  // o JS chegou tarde: a capa já saiu ou está para sair, e a página está à vista (FR-011, R2)
  if (performance.now() > GATE_LATEST_START_MS) {
    root.classList.remove('booting')
    return
  }
  motionBg.value = root.classList.contains('motion')
  tint.value = getComputedStyle(root).getPropertyValue('--green-bright').trim() || tint.value
  touch.value = window.matchMedia('(hover: none) and (pointer: coarse)').matches
  root.classList.add('gate')
  active.value = true
  void lookupVisitorIp().then((ip) => {
    visitorIp = ip
  })
  await nextTick()
  lockPage()
  icon.value?.button?.focus()
})

onBeforeUnmount(() => {
  stopClock()
  finishRunning()
  releasePage()
  html().classList.remove('gate')
})
</script>

<template>
  <div
    v-if="active"
    ref="gate"
    :class="['access-gate', { 'gate-leaving': hiding, 'gate-still': !motionBg }]"
    role="dialog"
    aria-modal="true"
    aria-label="Acesso ao portfólio"
    :data-gate-state="state"
  >
    <FaultyTerminal v-if="motionBg" class="gate-bg" :tint="tint" />
    <div class="gate-stage">
      <div v-show="!showWindow || leaving" ref="launcher" class="gate-launcher">
        <DesktopIcon ref="icon" class="gate-icon" :title="TITLE" kind="script" describedby="gate-hint" @click="openWindow" />
        <p id="gate-hint" class="gate-hint mono">{{ hint }}</p>
      </div>
      <div v-show="showWindow" ref="win" class="gate-window">
        <TerminalWindow :title="TITLE" :animate="false" :maximizable="false">
          <!-- decorativo, como o boot da 004: o status abaixo diz o que acontece (research R7) -->
          <div class="gate-session" aria-hidden="true">
            <p v-for="(line, i) in lines" :key="`${sessionId}-${i}`" :class="['boot-line', { 'boot-pending': i >= visible }]">
              <span v-for="(part, j) in line.parts" :key="j" :class="part.cls">{{ part.text }}</span>
              <TextType
                v-if="line.typed"
                :class="line.typed.cls"
                :text="line.typed.text"
                :typing-speed="line.typed.speed"
                :start-at="sessionStart + line.at"
                :instant="still"
                :show-cursor="i === visible - 1"
                reserve
              /><span v-else-if="i === visible - 1" class="cursor" aria-hidden="true">▊</span>
            </p>
          </div>
        </TerminalWindow>
      </div>
    </div>
    <p class="sr-only" role="status">{{ status }}</p>
  </div>
</template>

<style scoped>
.access-gate {
  position: fixed;
  inset: 0;
  z-index: 9999; /* acima da capa html.booting::before (9998) */
  display: grid;
  padding: calc(var(--spacing) * 4);
  overflow: hidden;
  background: var(--bg);
}

.access-gate.gate-leaving {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.5s ease, visibility 0.5s ease;
}

/* o Faulty Terminal ocupa a tela toda, atrás do ícone e da janela */
.gate-bg {
  position: absolute;
  inset: 0;
}

/* uma célula só: o ícone e a janela se sobrepõem, os dois no centro, sem transform (o FLIP usa o
   transform) */
.gate-stage {
  position: relative;
  display: grid;
  place-items: center;
  min-width: 0;
}

.gate-stage > * { grid-area: 1 / 1; }

.gate-launcher {
  position: relative;
  /* contexto de empilhamento próprio: a penumbra (z -1) fica atrás do ícone, mas na frente do fundo */
  isolation: isolate;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--spacing) * 3);
}

/* o nome é mais longo que o das janelas: o ícone cresce para ele caber numa linha */
.gate-launcher .gate-icon {
  width: auto;
  min-width: calc(var(--desktop-icon-size) + 2.5rem);
  padding-inline: calc(var(--spacing) * 3);
}

/* penumbra sob o nome do ícone e a dica: o contraste não depende do quadro do Faulty Terminal
   (FR-001, research R8); `closest-side` some antes das bordas, sem desenhar uma caixa */
.gate-launcher::before {
  content: "";
  position: absolute;
  inset: -5rem -7rem;
  z-index: -1;
  background: radial-gradient(closest-side, var(--boot-panel) 70%, transparent);
  pointer-events: none;
}

.gate-hint {
  color: var(--text-dim);
  font-size: 0.8rem;
  text-align: center;
}

.gate-window {
  position: relative;
  z-index: 2;
  width: min(var(--gate-window-width), 100%);
  transform-origin: top left;
  border: 1px solid var(--border);
  border-radius: var(--radius-window);
  box-shadow: 0 8px 40px color-mix(in srgb, var(--shadow) 50%, transparent), 0 0 0 1px color-mix(in srgb, var(--purple-light) 8%, transparent);
}

.gate-session {
  font-size: clamp(0.78rem, 2.2vw, 0.9rem);
  line-height: 1.75;
  color: var(--text);
  overflow-wrap: anywhere;
}

.boot-line { min-height: 1.75em; }

/* a linha que ainda não apareceu ocupa o lugar final, sem aparecer (FR-005, research R4) */
.boot-pending { visibility: hidden; }

/* cursor sem largura: a quebra de linha é a mesma com e sem ele (research R4) */
.gate-session :deep(.cursor) {
  display: inline-block;
  width: 0;
}

.boot-dim { color: var(--text-dim); }
.boot-ok { color: var(--green-bright); }
</style>
