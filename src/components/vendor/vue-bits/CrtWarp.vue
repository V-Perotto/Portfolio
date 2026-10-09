<!--
  Vue Bits — CRTWarp
  Origem: https://vue-bits.dev (Backgrounds/CRTWarp), de
  DavidHDev/vue-bits@07c0f76d5567db022c2e3185dd97a2311e056c0c
  src/content/Backgrounds/CRTWarp/CRTWarp.vue
  Licença: MIT + Commons Clause — Copyright (c) 2025 David Haz
  Modificações locais (feature 004, research R1 e R3):
  - o shader adaptado (a imagem do tubo é a chuva Matrix) e o laço estão em src/lib/scenes/crt.ts,
    uma cena sem DOM que roda num Web Worker quando o navegador permite (src/lib/scene-host.ts); o
    `three` foi trocado por src/lib/webgl.ts;
  - padrões = os parâmetros do autor (curvature 0,3, scanline 1 / 270, bloom 3 / raio 3, brightness 1,
    Render Quality "Performance" = dpr 0,75, Pixel Size "Smooth", Pointer Warp com força 1,5, Wave
    Amount 0, Wave Density 2,5, noise 0,125, RGB shift 0,01, 24 fps, speed 0,3, vignette 0,5);
  - o ponteiro é ouvido num elemento escolhido por quem usa (o hero inteiro), só de mouse;
  - para fora da tela e com a aba oculta; sem WebGL, não renderiza nada (FR-039); decorativo.
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { MatrixColors } from '@/lib/matrix-rain'
import type { CrtOptions } from '@/lib/scenes/crt'
import { hostScene, type SceneHost } from '@/lib/scene-host'

type Rgb = [number, number, number]

const props = withDefaults(
  defineProps<{
    bg: Rgb
    purple: Rgb
    green: Rgb
    matrix: MatrixColors
    /** Elemento cujo ponteiro deforma o tubo; padrão: o próprio fundo. */
    pointerHost?: HTMLElement | null
    speed?: number
    curvature?: number
    scanlineStrength?: number
    scanlineFrequency?: number
    bloom?: number
    bloomRadius?: number
    noise?: number
    vignette?: number
    brightness?: number
    pixelation?: number
    rgbShift?: number
    mouseReact?: boolean
    mouseStrength?: number
    dpr?: number
    fps?: number
    paused?: boolean
    intensity?: number
  }>(),
  {
    pointerHost: null,
    speed: 0.3,
    curvature: 0.3,
    scanlineStrength: 1,
    scanlineFrequency: 270,
    bloom: 3,
    bloomRadius: 3,
    noise: 0.125,
    vignette: 0.5,
    brightness: 1,
    pixelation: 1,
    rgbShift: 0.01,
    mouseReact: true,
    mouseStrength: 1.5,
    dpr: 0.75,
    fps: 24,
    paused: false,
    intensity: 0.6,
  },
)

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const failed = ref(false)
/** Desenhando agora (na tela e com a aba visível); exposto em `data-running` para conferência. */
const running = ref(true)

let host: SceneHost | null = null
let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null
let onScreen = true
let pointerEl: HTMLElement | null = null

const syncVisible = () => {
  running.value = onScreen && !document.hidden
  host?.visible(running.value)
}

const onPointerMove = (event: PointerEvent) => {
  if (event.pointerType !== 'mouse' || !pointerEl) return
  const rect = pointerEl.getBoundingClientRect()
  host?.pointer(((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1, -(((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1))
}
const onPointerLeave = () => host?.pointer(0, 0)

onMounted(() => {
  const el = canvas.value
  const box = container.value
  if (!el || !box) return
  const rgb = (c: Rgb): Rgb => [c[0], c[1], c[2]]
  // dados simples: as opções atravessam o postMessage do worker
  const options: CrtOptions = {
    speed: props.speed,
    curvature: props.curvature,
    scanlineStrength: props.scanlineStrength,
    scanlineFrequency: props.scanlineFrequency,
    bloom: props.bloom,
    bloomRadius: props.bloomRadius,
    noise: props.noise,
    vignette: props.vignette,
    brightness: props.brightness,
    pixelation: props.pixelation,
    rgbShift: props.rgbShift,
    mouseReact: props.mouseReact,
    mouseStrength: props.mouseStrength,
    dpr: Math.min(window.devicePixelRatio || 1, props.dpr),
    fps: props.fps,
    paused: props.paused,
    intensity: props.intensity,
    bg: rgb(props.bg),
    purple: rgb(props.purple),
    green: rgb(props.green),
    matrix: { purple: props.matrix.purple, green: props.matrix.green },
  }
  host = hostScene(
    el,
    {
      worker: () => new Worker(new URL('../../../workers/crt.worker.ts', import.meta.url), { type: 'module' }),
      load: () => import('@/lib/scenes/crt').then((m) => m.startCrt),
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

  intersectionObserver = new IntersectionObserver((entries) => {
    onScreen = entries[entries.length - 1]!.isIntersecting
    syncVisible()
  })
  intersectionObserver.observe(box)
  document.addEventListener('visibilitychange', syncVisible)

  if (props.mouseReact) {
    pointerEl = props.pointerHost ?? box
    pointerEl.addEventListener('pointermove', onPointerMove, { passive: true })
    pointerEl.addEventListener('pointerleave', onPointerLeave)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  document.removeEventListener('visibilitychange', syncVisible)
  pointerEl?.removeEventListener('pointermove', onPointerMove)
  pointerEl?.removeEventListener('pointerleave', onPointerLeave)
  host?.dispose()
  host = null
})
</script>

<template>
  <div ref="container" class="crt-warp" aria-hidden="true" :data-running="running">
    <canvas v-if="!failed" ref="canvas" class="crt-warp-canvas" />
  </div>
</template>

<style scoped>
.crt-warp {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.crt-warp-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
