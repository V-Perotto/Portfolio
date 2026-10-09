<!--
  Vue Bits — FaultyTerminal
  Origem: https://vue-bits.dev (Backgrounds/FaultyTerminal), de
  DavidHDev/vue-bits@07c0f76d5567db022c2e3185dd97a2311e056c0c
  src/content/Backgrounds/FaultyTerminal/FaultyTerminal.vue
  Licença: MIT + Commons Clause — Copyright (c) 2025 David Haz
  Modificações locais (feature 004, research R1 e R2):
  - o shader (sem mudança) e o laço de animação estão em src/lib/scenes/faulty.ts, uma cena sem DOM
    que roda num Web Worker quando o navegador permite (src/lib/scene-host.ts); o `ogl` foi trocado
    por src/lib/webgl.ts;
  - padrões = os parâmetros do autor (scale 3, digitSize 3, speed 1, noiseAmp 0,5, brightness 0,5,
    scanlineIntensity 1,4, curvature 0,2, sem mouse, animação de carregamento ligada);
  - resolução limitada a 1× e no máximo 30 quadros por segundo (o boot tem prazo, R2);
  - sem WebGL, não renderiza nada (FR-033); decorativo (`aria-hidden`).
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { FaultyOptions } from '@/lib/scenes/faulty'
import { hostScene, type SceneHost } from '@/lib/scene-host'

const props = withDefaults(
  defineProps<{
    scale?: number
    gridMul?: [number, number]
    digitSize?: number
    timeScale?: number
    scanlineIntensity?: number
    glitchAmount?: number
    flickerAmount?: number
    noiseAmp?: number
    chromaticAberration?: number
    dither?: number
    curvature?: number
    /** Cor dos dígitos, `#rrggbb` (lida de um token por quem usa). */
    tint?: string
    pageLoadAnimation?: boolean
    brightness?: number
    /** Teto de quadros por segundo. */
    maxFps?: number
    /** Teto da escala de pixels. */
    maxDpr?: number
  }>(),
  {
    scale: 3,
    gridMul: () => [2, 1],
    digitSize: 3,
    timeScale: 1,
    scanlineIntensity: 1.4,
    glitchAmount: 1,
    flickerAmount: 1,
    noiseAmp: 0.5,
    chromaticAberration: 0,
    dither: 0,
    curvature: 0.2,
    tint: '#ffffff',
    pageLoadAnimation: true,
    brightness: 0.5,
    maxFps: 30,
    maxDpr: 1,
  },
)

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim()
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  const num = parseInt(h, 16)
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255]
}

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const failed = ref(false)

let host: SceneHost | null = null
let resizeObserver: ResizeObserver | null = null
const onVisibility = () => host?.visible(!document.hidden)

onMounted(() => {
  const el = canvas.value
  const box = container.value
  if (!el || !box) return
  // dados simples: as opções atravessam o postMessage do worker
  const options: FaultyOptions = {
    scale: props.scale,
    gridMul: [props.gridMul[0], props.gridMul[1]],
    digitSize: props.digitSize,
    timeScale: props.timeScale,
    scanlineIntensity: props.scanlineIntensity,
    glitchAmount: props.glitchAmount,
    flickerAmount: props.flickerAmount,
    noiseAmp: props.noiseAmp,
    chromaticAberration: props.chromaticAberration,
    dither: props.dither,
    curvature: props.curvature,
    tint: hexToRgb(props.tint),
    pageLoadAnimation: props.pageLoadAnimation,
    brightness: props.brightness,
    maxFps: props.maxFps,
    dpr: Math.min(window.devicePixelRatio || 1, props.maxDpr),
  }
  host = hostScene(
    el,
    {
      worker: () => new Worker(new URL('../../../workers/faulty.worker.ts', import.meta.url), { type: 'module' }),
      load: () => import('@/lib/scenes/faulty').then((m) => m.startFaulty),
    },
    options,
    () => {
      failed.value = true
    },
  )
  const resize = () => host?.resize(box.offsetWidth, box.offsetHeight)
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(box)
  resize()
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
  host?.dispose()
  host = null
})
</script>

<template>
  <div ref="container" class="faulty-terminal" aria-hidden="true">
    <canvas v-if="!failed" ref="canvas" class="faulty-terminal-canvas" />
  </div>
</template>

<style scoped>
.faulty-terminal {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.faulty-terminal-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
