/**
 * Lado do worker do protocolo de cenas (src/lib/scene-host.ts): recebe o `OffscreenCanvas` e as
 * opções, cria a cena e repassa tamanho, ponteiro e visibilidade. Sem WebGL, avisa `failed`.
 */
import type { SceneFactory } from './scene'

export type HostMessage =
  | { type: 'init'; canvas: OffscreenCanvas; options: unknown }
  | { type: 'resize'; width: number; height: number }
  | { type: 'pointer'; x: number; y: number }
  | { type: 'visible'; visible: boolean }
  | { type: 'dispose' }

export type WorkerMessage = { type: 'ready' } | { type: 'failed' }

interface WorkerScope {
  postMessage(message: WorkerMessage): void
  onmessage: ((event: MessageEvent<HostMessage>) => void) | null
  close(): void
}

export function serveScene<O>(factory: SceneFactory<O>): void {
  const scope = self as unknown as WorkerScope
  let scene: ReturnType<SceneFactory<O>> = null
  scope.onmessage = ({ data }) => {
    switch (data.type) {
      case 'init':
        scene = factory(data.canvas, data.options as O, { guard: false })
        scope.postMessage(scene ? { type: 'ready' } : { type: 'failed' })
        break
      case 'resize':
        scene?.resize(data.width, data.height)
        break
      case 'pointer':
        scene?.pointer(data.x, data.y)
        break
      case 'visible':
        scene?.visible(data.visible)
        break
      case 'dispose':
        scene?.dispose()
        scene = null
        scope.close()
        break
    }
  }
}
