<!--
  Vue Bits — LetterGlitch
  Origem: https://vue-bits.dev (Backgrounds/LetterGlitch), de
  DavidHDev/vue-bits@07c0f76d5567db022c2e3185dd97a2311e056c0c
  src/content/Backgrounds/LetterGlitch/LetterGlitch.vue
  Licença: MIT + Commons Clause — Copyright (c) 2025 David Haz
  Modificações locais (feature 006, research R12):
  - o desenho virou uma cena sem DOM (src/lib/scenes/letter-glitch.ts), que roda num Web Worker com
    `OffscreenCanvas` 2D quando o navegador permite, ou na thread principal com o freio da 004;
  - as cores chegam como RGB (lidas dos tokens por quem usa), com a transparência das letras à parte;
  - as duas vinhetas continuam em DOM, com os degradês dos tokens `--glitch-vignette-*` (a das bordas
    é a do original; a central foi calibrada para o contraste do texto, clarify);
  - tamanho pelo `ResizeObserver` do contêiner (o original lia o avô do canvas no `resize` da janela),
    escala de pixels até 2, até 60 quadros por segundo no worker e 30 na página;
  - `pause()`/`resume()` (o hero fora da tela) e pausa com a aba oculta; `ready` no primeiro quadro ou
    na falha; decorativo (`aria-hidden`); CSS com escopo no lugar das classes do Tailwind.
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { GlitchOptions, Rgb } from '@/lib/scenes/letter-glitch'
import { hostScene, type SceneHost } from '@/lib/scene-host'

const props = withDefaults(
  defineProps<{
    /** "glitch colors", RGB de 0 a 255. */
    colors: Rgb[]
    /** Transparência das letras (0–1). */
    alpha?: number
    glitchSpeed?: number
    smooth?: boolean
    centerVignette?: boolean
    outerVignette?: boolean
  }>(),
  { alpha: 1, glitchSpeed: 50, smooth: true, centerVignette: false, outerVignette: false },
)

const emit = defineEmits<{ ready: [] }>()

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const failed = ref(false)
const paused = ref(false)

let host: SceneHost | null = null
let resizeObserver: ResizeObserver | null = null
let announced = false

const announce = () => {
  if (announced) return
  announced = true
  emit('ready')
}

const sync = () => host?.visible(!paused.value && !document.hidden)
const onVisibility = () => sync()

function pause() {
  paused.value = true
  sync()
}

function resume() {
  paused.value = false
  sync()
}

defineExpose({ pause, resume })

onMounted(() => {
  const el = canvas.value
  const box = container.value
  if (!el || !box) return
  const inWorker = typeof Worker !== 'undefined'
  // dados simples: as opções atravessam o postMessage do worker
  const options: GlitchOptions = {
    colors: props.colors.map((c) => [c[0], c[1], c[2]] as Rgb),
    alpha: props.alpha,
    glitchSpeed: props.glitchSpeed,
    smooth: props.smooth,
    fontSize: 16,
    charWidth: 10,
    charHeight: 20,
    maxFps: inWorker ? 60 : 30,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
  }
  host = hostScene(
    el,
    {
      worker: () => new Worker(new URL('../../../workers/letter-glitch.worker.ts', import.meta.url), { type: 'module' }),
      load: () => import('@/lib/scenes/letter-glitch').then((m) => m.startLetterGlitch),
    },
    options,
    () => {
      failed.value = true
      announce()
    },
    { context: '2d', onFirstFrame: announce },
  )
  const resize = () => host?.resize(box.offsetWidth, box.offsetHeight)
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(box)
  resize()
  document.addEventListener('visibilitychange', onVisibility)
  sync()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
  host?.dispose()
  host = null
})
</script>

<template>
  <div ref="container" class="letter-glitch" aria-hidden="true" :data-paused="paused || undefined">
    <canvas v-if="!failed" ref="canvas" class="letter-glitch-canvas" />
    <div v-if="outerVignette" class="letter-glitch-outer" />
    <div v-if="centerVignette" class="letter-glitch-center" />
  </div>
</template>

<style scoped>
.letter-glitch {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.letter-glitch-canvas,
.letter-glitch-outer,
.letter-glitch-center {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.letter-glitch-canvas { display: block; }

.letter-glitch-outer { background: var(--glitch-vignette-outer); }
.letter-glitch-center { background: var(--glitch-vignette-center); }
</style>
