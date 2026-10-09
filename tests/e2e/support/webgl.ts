/**
 * Script de `page.addInitScript`: o navegador passa a não ter WebGL, nem no canvas da página nem no
 * `OffscreenCanvas` (que o worker das cenas usaria). Os fundos animados têm de cair no estático
 * (FR-033, FR-039).
 */
export function noWebGL(): void {
  const patch = (proto: { getContext: (...args: never[]) => unknown }) => {
    const original = proto.getContext
    proto.getContext = function (this: unknown, type: string, ...args: unknown[]) {
      if (/webgl/.test(type)) return null
      return (original as (...a: unknown[]) => unknown).call(this, type, ...args)
    } as typeof original
  }
  patch(HTMLCanvasElement.prototype as never)
  if (typeof OffscreenCanvas !== 'undefined') patch(OffscreenCanvas.prototype as never)
}
