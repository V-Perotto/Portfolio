/*
 * Vue Bits — LetterGlitch (cena)
 * Origem: https://vue-bits.dev (Backgrounds/LetterGlitch), de
 * DavidHDev/vue-bits@07c0f76d5567db022c2e3185dd97a2311e056c0c
 * src/content/Backgrounds/LetterGlitch/LetterGlitch.vue
 * Licença: MIT + Commons Clause — Copyright (c) 2025 David Haz
 * Modificações locais (feature 006, research R12):
 * - o laço de desenho virou uma cena sem DOM, que roda num Web Worker (src/workers/letter-glitch.worker.ts,
 *   com `OffscreenCanvas` 2D) ou na thread principal, com o freio da 004 (src/lib/scene-host.ts);
 * - cores guardadas como números RGB: a transição suave funciona em toda troca (o original guardava a
 *   cor como `#hex` e depois como `rgb()`, e parava de interpolar depois da primeira);
 * - a transição vai linearmente da cor de antes à nova (o original interpolava a partir da cor do quadro
 *   anterior, o que dá o mesmo começo e um fim mais lento);
 * - as letras são desenhadas agrupadas por cor (menos trocas de `fillStyle`), com a transparência das
 *   letras do tema (`alpha`);
 * - teto de quadros, pausa (`visible(false)`) e aviso do primeiro quadro (o hero pronto, R13).
 * As vinhetas ficam na casca, em src/components/vendor/vue-bits/LetterGlitch.vue.
 */
import type { AnyCanvas } from '@/lib/webgl'
import { frameLoop, type SceneFactory } from './scene'

export type Rgb = [number, number, number]

export interface GlitchOptions {
  /** "glitch colors", de 0 a 255. */
  colors: Rgb[]
  /** Transparência das letras (0–1). */
  alpha: number
  /** Intervalo entre trocas de letras, em ms (Glitch Speed). */
  glitchSpeed: number
  /** Transição suave de cor (Smooth Animation). */
  smooth: boolean
  fontSize: number
  charWidth: number
  charHeight: number
  maxFps: number
  dpr: number
}

/** Letras, símbolos e algarismos do original. */
export const GLITCH_CHARS = [
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ...'!@#$&*()-_+=/[]{};:<>,',
  ...'0123456789',
]

/** Fração das letras que trocam a cada `glitchSpeed` (a do original). */
const UPDATE_SHARE = 0.05
/** Avanço da transição suave por quadro (a do original: ~20 quadros). */
const SMOOTH_STEP = 0.05

interface Letter {
  char: string
  from: Rgb
  to: Rgb
  color: Rgb
  progress: number
}

export const gridSize = (width: number, height: number, charWidth = 10, charHeight = 20) => ({
  columns: Math.ceil(width / charWidth),
  rows: Math.ceil(height / charHeight),
})

export const pickColor = (colors: readonly Rgb[], random: () => number = Math.random): Rgb =>
  colors[Math.floor(random() * colors.length)] ?? [0, 0, 0]

export const lerpColor = (a: Rgb, b: Rgb, t: number): Rgb => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
]

const randomChar = () => GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]!

export const startLetterGlitch: SceneFactory<GlitchOptions> = (canvas: AnyCanvas, o, env) => {
  let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null
  try {
    ctx = (canvas as OffscreenCanvas).getContext('2d')
  } catch {
    ctx = null
  }
  if (!ctx || !o.colors.length) return null
  const g = ctx

  let width = 0
  let height = 0
  let columns = 0
  let letters: Letter[] = []
  let lastGlitch = -Infinity
  let firstFrame = true

  function reset(w: number, h: number) {
    width = w
    height = h
    canvas.width = Math.max(1, Math.round(w * o.dpr))
    canvas.height = Math.max(1, Math.round(h * o.dpr))
    g.setTransform(o.dpr, 0, 0, o.dpr, 0, 0)
    const grid = gridSize(w, h, o.charWidth, o.charHeight)
    columns = grid.columns
    letters = Array.from({ length: grid.columns * grid.rows }, () => {
      const color = pickColor(o.colors)
      return { char: randomChar(), from: color, to: color, color, progress: 1 }
    })
  }

  function update() {
    const count = Math.max(1, Math.floor(letters.length * UPDATE_SHARE))
    for (let i = 0; i < count; i++) {
      const letter = letters[Math.floor(Math.random() * letters.length)]
      if (!letter) continue
      letter.char = randomChar()
      letter.from = letter.color
      letter.to = pickColor(o.colors)
      if (o.smooth) letter.progress = 0
      else {
        letter.color = letter.to
        letter.progress = 1
      }
    }
  }

  function advance() {
    for (const letter of letters) {
      if (letter.progress >= 1) continue
      letter.progress = Math.min(1, letter.progress + SMOOTH_STEP)
      letter.color = lerpColor(letter.from, letter.to, letter.progress)
    }
  }

  function draw() {
    g.clearRect(0, 0, width, height)
    g.font = `${o.fontSize}px monospace`
    g.textBaseline = 'top'
    // agrupadas por cor: poucas trocas de fillStyle por quadro
    const groups = new Map<string, number[]>()
    letters.forEach((letter, index) => {
      const key = `${letter.color[0]},${letter.color[1]},${letter.color[2]}`
      const group = groups.get(key)
      if (group) group.push(index)
      else groups.set(key, [index])
    })
    for (const [key, indexes] of groups) {
      g.fillStyle = `rgba(${key}, ${o.alpha})`
      for (const index of indexes) {
        const x = (index % columns) * o.charWidth
        const y = Math.floor(index / columns) * o.charHeight
        g.fillText(letters[index]!.char, x, y)
      }
    }
  }

  const loop = frameLoop(o.maxFps, env.guard, (t) => {
    if (!letters.length) return
    if (t - lastGlitch >= o.glitchSpeed) {
      update()
      lastGlitch = t
    }
    if (o.smooth) advance()
    draw()
    if (firstFrame) {
      firstFrame = false
      env.onFirstFrame?.()
    }
  })
  loop.start()

  return {
    resize(w, h) {
      if (w < 1 || h < 1) return
      reset(w, h)
      draw()
    },
    pointer() {},
    visible(visible) {
      if (visible) loop.start()
      else loop.stop()
    },
    dispose() {
      loop.stop()
      letters = []
    },
  }
}
