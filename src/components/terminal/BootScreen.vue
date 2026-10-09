<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import FaultyTerminal from '@/components/vendor/vue-bits/FaultyTerminal.vue'
import {
  BOOT_DEADLINE_MS,
  BOOT_FADE_MS,
  BOOT_LATEST_START_MS,
  BOOT_SAFETY_MS,
  BOOT_SEQUENCE_MS,
  bootFrame,
  type BootLine,
} from '@/lib/boot'

/**
 * Tela de boot SSH (FR-028 a FR-033 da 004; constituição v2.3.0). Só existe no cliente e só quando o
 * script inline marcou `html.booting` (há movimento). Não é pulável: a sessão é desenhada inteira
 * pela linha do tempo de src/lib/boot.ts, guiada pelo relógio, sobre o Faulty Terminal do Vue Bits.
 * No fim remove `html.booting`, liberando a capa que cobre a página, e some com um fade. É
 * decorativa: fica fora da árvore de acessibilidade e não mexe no foco (FR-036 da 001).
 */

const active = ref(false)
const hiding = ref(false)
const lines = ref<BootLine[]>([])
/** Cor dos dígitos do Faulty Terminal: o verde-neon do tema (research R2). */
const tint = ref('#4ade9b')

let finished = false
let startedAt = 0
let lastLogin = ''
const timers: ReturnType<typeof setTimeout>[] = []

const draw = (elapsed: number) => {
  lines.value = bootFrame(elapsed, lastLogin)
}

/** Redesenha pelo relógio: timers atrasados não acumulam atraso (research R4). */
function tick() {
  if (finished) return
  const elapsed = performance.now() - startedAt
  draw(elapsed)
  if (elapsed < BOOT_SEQUENCE_MS) timers.push(setTimeout(tick, 16))
}

function finish() {
  if (finished) return
  finished = true
  timers.forEach(clearTimeout)
  // nunca sai cortado (FR-030): se a CPU atrasou o relógio, a sessão aparece inteira antes do fade
  draw(BOOT_SEQUENCE_MS)
  document.documentElement.classList.remove('booting')
  hiding.value = true
  setTimeout(() => {
    active.value = false
  }, BOOT_FADE_MS)
}

onMounted(async () => {
  const root = document.documentElement
  if (!root.classList.contains('booting')) return
  // o JS chegou tarde demais para a sessão caber inteira no teto: sem boot (FR-032)
  if (performance.now() > BOOT_LATEST_START_MS) {
    root.classList.remove('booting')
    return
  }
  tint.value = getComputedStyle(root).getPropertyValue('--green-bright').trim() || tint.value
  lastLogin = new Date().toLocaleString('pt-BR')
  active.value = true
  await nextTick()

  startedAt = performance.now()
  draw(0)
  timers.push(setTimeout(tick, 16))
  timers.push(setTimeout(finish, BOOT_SEQUENCE_MS))
  // segurança: com timers muito atrasados, a saída começa no mais tardar no fim natural do boot mais
  // tardio possível, e a folga absorve o atraso até o teto de 7 s
  timers.push(setTimeout(finish, Math.max(0, BOOT_DEADLINE_MS - BOOT_FADE_MS - BOOT_SAFETY_MS - performance.now())))
})

onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <div v-if="active" :class="['boot-screen', { 'boot-hidden': hiding }]" aria-hidden="true">
    <FaultyTerminal class="boot-bg" :tint="tint" />
    <div class="boot-body mono">
      <p v-for="(line, i) in lines" :key="i" class="boot-line">
        <span v-for="(part, j) in line" :key="j" :class="part.cls">{{ part.text }}</span><span v-if="i === lines.length - 1" class="cursor">▊</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.boot-screen {
  position: fixed;
  inset: 0;
  z-index: 9999; /* acima da capa html.booting::before (9998) */
  background: var(--bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: calc(var(--spacing) * 6);
}

.boot-screen.boot-hidden {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.5s ease, visibility 0.5s ease;
}

/* o Faulty Terminal ocupa a tela toda, atrás do painel */
.boot-bg {
  position: absolute;
  inset: 0;
}

/* painel sob o texto: o contraste não depende do quadro do shader (FR-029) */
.boot-body {
  position: relative;
  width: min(680px, 100%);
  font-size: clamp(0.78rem, 2.2vw, 0.95rem);
  color: var(--text);
  line-height: 1.75;
  background: var(--boot-panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-window);
  padding: calc(var(--spacing) * 5) calc(var(--spacing) * 6);
}

.boot-line { min-height: 1.75em; }
.boot-dim { color: var(--text-dim); }
.boot-ok { color: var(--green-bright); }
</style>
