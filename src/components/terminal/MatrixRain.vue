<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useMotion } from '@/composables/useMotion'

/** Chuva matrix no fundo do hero (FR-032) — porte do canvas anterior; só no cliente e com movimento. */
const motion = useMotion()
const canvas = ref<HTMLCanvasElement | null>(null)

const CHARS = 'アイウエオカキクケコ01<>[]{}$#@&%*+=;/\\|~^'
const FONT_SIZE = 15

/** Cores do canvas vindas dos tokens (Princípio V): o canvas não entende `var()`, então lê os
 *  valores calculados uma vez, na montagem. */
const colors = { purple: '', green: '', bg: '' }

function readColors() {
  const css = getComputedStyle(document.documentElement)
  const token = (name: string) => css.getPropertyValue(name).trim()
  colors.purple = token('--purple-light')
  colors.green = token('--green-light')
  colors.bg = token('--bg')
}

let drops: number[] = []
let frame: number | null = null
let last = 0
let resizeObserver: ResizeObserver | null = null
let visibilityObserver: IntersectionObserver | null = null

function resize() {
  const el = canvas.value
  const host = el?.parentElement
  if (!el || !host) return
  el.width = host.offsetWidth
  el.height = host.offsetHeight
  drops = Array.from({ length: Math.floor(el.width / FONT_SIZE) }, () => Math.floor(Math.random() * -50))
}

function draw(ctx: CanvasRenderingContext2D, el: HTMLCanvasElement) {
  // rastro: o fundo da página com 12% de opacidade apaga aos poucos os caracteres anteriores
  ctx.globalAlpha = 0.12
  ctx.fillStyle = colors.bg
  ctx.fillRect(0, 0, el.width, el.height)
  ctx.globalAlpha = 1
  ctx.font = `${FONT_SIZE}px monospace`
  for (let i = 0; i < drops.length; i++) {
    const char = CHARS[Math.floor(Math.random() * CHARS.length)] ?? '0'
    // alterna verde/roxo entre colunas para casar com a paleta
    ctx.fillStyle = i % 3 === 0 ? colors.purple : colors.green
    const y = drops[i] ?? 0
    ctx.fillText(char, i * FONT_SIZE, y * FONT_SIZE)
    drops[i] = y * FONT_SIZE > el.height && Math.random() > 0.975 ? 0 : y + 1
  }
}

function loop(ts: number) {
  const el = canvas.value
  const ctx = el?.getContext('2d')
  if (!el || !ctx) return
  if (ts - last > 55) {
    // ~18 fps: chuva mais lenta e menos CPU
    draw(ctx, el)
    last = ts
  }
  frame = requestAnimationFrame(loop)
}

function stop() {
  if (frame !== null) cancelAnimationFrame(frame)
  frame = null
}

function setup() {
  const el = canvas.value
  const host = el?.parentElement
  if (!el || !host) return
  readColors()
  resize()
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host)
  // pausa quando o hero sai da tela
  visibilityObserver = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) {
      if (frame === null) frame = requestAnimationFrame(loop)
    } else stop()
  })
  visibilityObserver.observe(host)
}

function teardown() {
  stop()
  resizeObserver?.disconnect()
  visibilityObserver?.disconnect()
}

onMounted(() => watch(canvas, (el) => (el ? setup() : teardown()), { flush: 'post', immediate: true }))
onBeforeUnmount(teardown)
</script>

<template>
  <canvas v-if="motion" ref="canvas" class="matrix" aria-hidden="true" />
</template>

<style scoped>
.matrix {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.35;
}
</style>
