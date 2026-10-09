/**
 * Contrato das cenas de fundo animadas (feature 004, research R1): código sem DOM, que roda num Web
 * Worker (com `OffscreenCanvas`) ou na thread principal (`HTMLCanvasElement`). Quem hospeda
 * (src/lib/scene-host.ts) só repassa tamanho, visibilidade e ponteiro.
 */
import type { AnyCanvas } from '@/lib/webgl'

export interface Scene {
  /** Novo tamanho CSS da área do fundo. */
  resize(cssWidth: number, cssHeight: number): void
  /** Ponteiro normalizado (−1..1; 0,0 = centro). Cenas sem ponteiro ignoram. */
  pointer(x: number, y: number): void
  /** Fora da tela ou aba oculta: a cena para de desenhar. */
  visible(visible: boolean): void
  dispose(): void
}

export type SceneFactory<O> = (canvas: AnyCanvas, options: O, env: SceneEnv) => Scene | null

export interface SceneEnv {
  /** Na thread principal, a cena congela se ficar lenta demais (protege timers e interação). */
  guard: boolean
}

/** Intervalo a partir do qual um quadro conta como lento (na thread principal). */
const SLOW_FRAME_MS = 250
/** Quadros lentos seguidos que congelam a animação. */
const SLOW_FRAMES_TO_FREEZE = 3

const raf: (cb: (t: number) => void) => number =
  typeof requestAnimationFrame === 'function'
    ? (cb) => requestAnimationFrame(cb)
    : (cb) => setTimeout(() => cb(performance.now()), 16) as unknown as number
const caf: (id: number) => void =
  typeof cancelAnimationFrame === 'function' ? (id) => cancelAnimationFrame(id) : (id) => clearTimeout(id)

/**
 * Laço de animação com teto de quadros por segundo. Com `guard`, para de vez depois de
 * `SLOW_FRAMES_TO_FREEZE` intervalos seguidos acima de `SLOW_FRAME_MS` (o último quadro fica).
 */
export function frameLoop(fps: number, guard: boolean, frame: (t: number) => void) {
  const interval = 1000 / fps
  let id = 0
  let running = false
  let frozen = false
  let last = -Infinity
  let previous = 0
  let slow = 0
  const step = (t: number) => {
    if (!running) return
    if (guard && previous) {
      slow = t - previous > SLOW_FRAME_MS ? slow + 1 : 0
      if (slow >= SLOW_FRAMES_TO_FREEZE) {
        frozen = true
        running = false
        return
      }
    }
    previous = t
    id = raf(step)
    if (t - last < interval) return
    last = t
    frame(t)
  }
  return {
    start() {
      if (running || frozen) return
      running = true
      previous = 0
      id = raf(step)
    },
    stop() {
      running = false
      caf(id)
    },
  }
}
