/**
 * Hospeda uma cena de fundo animada (feature 004, research R1): num Web Worker, com o canvas
 * transferido (`OffscreenCanvas`), quando o navegador tem WebGL em `OffscreenCanvas`; senão, na
 * thread principal, com o freio de `frameLoop`. Quem usa só informa tamanho, ponteiro e visibilidade.
 *
 * As opções vão para o worker por `postMessage`: precisam ser dados simples (sem proxies do Vue).
 */
import type { Scene, SceneFactory } from '@/lib/scenes/scene'
import type { HostMessage, WorkerMessage } from '@/lib/scenes/serve'
import { hasOffscreenWebGL } from '@/lib/webgl'

export interface SceneSpec<O> {
  /** `new Worker(new URL('…', import.meta.url), { type: 'module' })`, escrito por quem chama para o
   *  Vite empacotar o worker. */
  worker: () => Worker
  /** Fábrica da cena para a thread principal (import dinâmico). */
  load: () => Promise<SceneFactory<O>>
}

export interface SceneHost {
  resize(cssWidth: number, cssHeight: number): void
  pointer(x: number, y: number): void
  visible(visible: boolean): void
  dispose(): void
}

const NOOP_HOST: SceneHost = { resize() {}, pointer() {}, visible() {}, dispose() {} }

function hostInWorker<O>(canvas: HTMLCanvasElement, spec: SceneSpec<O>, options: O, onFail: () => void): SceneHost {
  let worker: Worker | null = null
  const send = (message: HostMessage) => worker?.postMessage(message)
  const dispose = () => {
    send({ type: 'dispose' })
    const w = worker
    worker = null
    // o worker se fecha sozinho depois de liberar o WebGL; terminate só garante
    setTimeout(() => w?.terminate(), 100)
  }
  const fail = () => {
    dispose()
    onFail()
  }
  try {
    const offscreen = canvas.transferControlToOffscreen()
    worker = spec.worker()
    worker.onmessage = ({ data }: MessageEvent<WorkerMessage>) => {
      if (data.type === 'failed') fail()
    }
    worker.onerror = (event) => {
      event.preventDefault()
      fail()
    }
    worker.postMessage({ type: 'init', canvas: offscreen, options } satisfies HostMessage, [offscreen])
  } catch {
    fail()
    return NOOP_HOST
  }
  return {
    resize: (width, height) => send({ type: 'resize', width, height }),
    pointer: (x, y) => send({ type: 'pointer', x, y }),
    visible: (visible) => send({ type: 'visible', visible }),
    dispose,
  }
}

function hostInPage<O>(canvas: HTMLCanvasElement, spec: SceneSpec<O>, options: O, onFail: () => void): SceneHost {
  let scene: Scene | null = null
  let disposed = false
  // o que chegou antes de a cena carregar
  let size: [number, number] | null = null
  let point: [number, number] | null = null
  let shown = true
  spec
    .load()
    .then((factory) => {
      if (disposed) return
      scene = factory(canvas, options, { guard: true })
      if (!scene) return onFail()
      if (size) scene.resize(...size)
      if (point) scene.pointer(...point)
      if (!shown) scene.visible(false)
    })
    .catch(() => {
      if (!disposed) onFail()
    })
  return {
    resize(width, height) {
      size = [width, height]
      scene?.resize(width, height)
    },
    pointer(x, y) {
      point = [x, y]
      scene?.pointer(x, y)
    },
    visible(visible) {
      shown = visible
      scene?.visible(visible)
    },
    dispose() {
      disposed = true
      scene?.dispose()
      scene = null
    },
  }
}

export function hostScene<O>(canvas: HTMLCanvasElement, spec: SceneSpec<O>, options: O, onFail: () => void): SceneHost {
  return hasOffscreenWebGL() ? hostInWorker(canvas, spec, options, onFail) : hostInPage(canvas, spec, options, onFail)
}
