<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import LatticeLoader from '@/components/vendor/vue-bits/LatticeLoader.vue'
import { useBootDone } from '@/composables/useBootDone'
import { useMotion } from '@/composables/useMotion'
import { loaderSchedule, SHOW_DONE_MS, type LoaderPhase } from '@/lib/hero-loader'

/**
 * Primeira linha do hero (feature 006, FR-036 a FR-043, research R13; contracts/hero-and-gate.md §2): o
 * Lattice Loader do Vue Bits no lugar de `[ OK ] Inicializando portfolio.service ...`.
 *
 * - HTML pré-renderizado e sem JavaScript: o estado final (✓ verde, "carregado com sucesso"), que não
 *   some. No cliente, com movimento, a linha volta a "trabalhando" na montagem (ainda sob a porta).
 * - Do fim da porta (página descoberta), trabalha até o hero ficar pronto (fontes e o primeiro quadro
 *   do fundo animado), nunca menos de 3 s; 3 s depois de "pronto", a linha inteira some, sem mover nada
 *   (o espaço continua reservado: `visibility: hidden`).
 * - "Reduzir movimento": pronta desde o início, some 3 s depois de descoberta, sem transição. Ligado no
 *   meio da visita: pronta na hora.
 * - Fora da tela, a onda pausa (o relógio segue). Sem anúncio ao leitor de tela (o texto é comum).
 */
const props = defineProps<{
  /** O fundo animado do hero desenhou o primeiro quadro (ou não existe no modo atual). */
  backgroundReady: boolean
}>()

const motion = useMotion()
const bootDone = useBootDone()

const phase = ref<LoaderPhase>('done')
const paused = ref(false)
const root = ref<HTMLElement | null>(null)

let revealedAt: number | null = null
let fontsAt: number | null = null
let readyAt: number | null = null
let doneTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null
let observer: IntersectionObserver | null = null

function clearTimers() {
  if (doneTimer) clearTimeout(doneTimer)
  if (hideTimer) clearTimeout(hideTimer)
  doneTimer = hideTimer = null
}

const at = (time: number, fn: () => void) => setTimeout(fn, Math.max(0, time - performance.now()))

/** Recalcula "pronto" e "some" a partir do que já se sabe. */
function schedule() {
  if (revealedAt === null) return
  clearTimers()
  if (phase.value === 'hidden') return
  if (phase.value === 'done') {
    // sem movimento (ou desligado no meio): só falta sumir
    hideTimer = at(Math.max(performance.now(), revealedAt) + SHOW_DONE_MS, () => (phase.value = 'hidden'))
    return
  }
  const { doneAt, hideAt } = loaderSchedule(revealedAt, readyAt)
  doneTimer = at(doneAt, () => (phase.value = 'done'))
  hideTimer = at(hideAt, () => (phase.value = 'hidden'))
}

function markReady() {
  if (readyAt !== null || fontsAt === null || !props.backgroundReady) return
  readyAt = performance.now()
  schedule()
}

watch(
  () => props.backgroundReady,
  () => markReady(),
)

watch(bootDone, (done) => {
  if (!done || revealedAt !== null) return
  revealedAt = performance.now()
  schedule()
})

// "reduzir movimento" ligado no meio da visita: pronto na hora, some 3 s depois (FR-041)
watch(motion, (on) => {
  if (on || phase.value !== 'working') return
  phase.value = 'done'
  if (revealedAt !== null) {
    clearTimers()
    hideTimer = setTimeout(() => (phase.value = 'hidden'), SHOW_DONE_MS)
  }
})

onMounted(() => {
  if (motion.value) phase.value = 'working'
  void document.fonts.ready.then(() => {
    fontsAt = performance.now()
    markReady()
  })
  if (bootDone.value && revealedAt === null) {
    revealedAt = performance.now()
    schedule()
  }
  if (root.value && typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(([entry]) => {
      paused.value = !entry?.isIntersecting
    })
    observer.observe(root.value)
  }
})

onBeforeUnmount(() => {
  clearTimers()
  observer?.disconnect()
})
</script>

<template>
  <p ref="root" class="hero-boot mono" :data-loader="phase">
    <LatticeLoader
      :status="phase === 'working' ? 'working' : 'done'"
      label="Inicializando portfolio.service"
      done-label="portfolio.service carregado com sucesso!"
      :grid="3"
      :gap="1"
      :idle-opacity="0.15"
      glow
      shape="square"
      color="var(--loader-working)"
      done-color="var(--loader-done)"
      :paused="paused"
    />
  </p>
</template>

<style scoped>
/* some sem sair do lugar: o espaço da linha continua reservado e nada no hero se move (FR-039) */
.hero-boot[data-loader="hidden"] {
  opacity: 0;
  visibility: hidden;
}

html.motion .hero-boot { transition: opacity 0.5s ease, visibility 0.5s ease; }

@media print {
  .hero-boot { display: none; }
}
</style>
