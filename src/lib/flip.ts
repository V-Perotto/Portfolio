/**
 * Animações FLIP das janelas que viram ícone de área de trabalho (feature 004, research R8),
 * compartilhadas pelo `DesktopWindow` e pela porta de acesso (feature 005, research R1 e R10).
 * Só `transform` e `opacity`; sem movimento, quem chama troca de estado sem animar.
 */

/** Duração de cada animação (FR-006 da 004 e FR-004 da 005: no máximo 400 ms). */
export const FLIP_MS = 320
export const FLIP_EASING = 'cubic-bezier(0.2, 0.7, 0.2, 1)'

/** Há movimento (classe `motion` no `<html>`) e o navegador anima elementos? */
export const canAnimate = (): boolean =>
  document.documentElement.classList.contains('motion') && typeof HTMLElement.prototype.animate === 'function'

/** Transform que leva o retângulo `from` para o `to` (origem no canto de cima, à esquerda). */
export const toward = (from: DOMRect, to: DOMRect): string =>
  `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${Math.max(to.width / from.width, 0.01)}, ${Math.max(to.height / from.height, 0.01)})`

/** Leva as animações em curso ao estado final na hora (um novo pedido nunca espera o anterior). */
export function finishAll(animations: readonly Animation[]): void {
  animations.forEach((animation) => animation.finish())
}
