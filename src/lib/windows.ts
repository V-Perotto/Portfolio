/**
 * Registro das janelas que o terminal da dock abre pelo comando `open` (feature 007, research R3 e R4;
 * data-model §3). O terminal (na dock) e as janelas (nas seções) estão em ramos diferentes da árvore de
 * componentes: cada `DesktopWindow` com `windowId` se registra aqui ao montar e sai ao desmontar. Só
 * existe no cliente; sem JavaScript, não há terminal nem registro.
 */
import type { OpenTarget } from '@/lib/sections'

export type WindowState = 'open' | 'minimized' | 'closed'

export interface OpenOptions {
  /** Fechada: reabre já completa, sem digitar de novo (janela de editor pelo `open`, FR-005). */
  complete?: boolean
  /** Sem a animação de crescer a partir do ícone (o `open` maximiza logo em seguida, com a dele). */
  instant?: boolean
  /** Roda quando a janela volta ao layout, antes da animação de crescer (para rolar até ela). */
  onLayout?: () => void
}

export interface WindowHandle {
  state(): WindowState
  /** A caixa da janela (`.desktop-window`): é até ela que a página rola. */
  element(): HTMLElement | null
  /** Reabre como o ícone; resolve quando a animação termina (já aberta: resolve na hora). */
  open(options?: OpenOptions): Promise<void>
  /** Só nas janelas de editor (feature 006, research R5): resolve maximizada, com o foco no `□`. */
  maximize?(): Promise<void>
}

const windows = new Map<string, WindowHandle>()

/** Registra a janela; devolve a função que a retira (só se o registro ainda for o dela). */
export function registerWindow(id: string, handle: WindowHandle): () => void {
  windows.set(id, handle)
  return () => {
    if (windows.get(id) === handle) windows.delete(id)
  }
}

export const getWindow = (id: string): WindowHandle | undefined => windows.get(id)

/** A base do header: o `scroll-padding-top` do `html` (`--nav-height`), que o `find` também respeita. */
const headerBottom = () => Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0

/** O topo da barra de título está "logo abaixo do header" (FR-004): entre a base dele e a metade da tela. */
function titleBarInView(el: HTMLElement): boolean {
  const top = el.getBoundingClientRect().top
  return top >= headerBottom() - 1 && top <= window.innerHeight / 2
}

/** Duração da rolagem do `open` com movimento. */
const GLIDE_MS = 450

/**
 * Rola até a barra de título ficar logo abaixo do header. Com movimento, numa duração fixa (o suave nativo
 * do Chromium passou de 1,2 s do hero até os projetos, acima do 1 s da SC-001); sem, de uma vez. Uma
 * rolagem do visitante (roda ou toque) interrompe; no fim, corrige se o layout mudou no caminho.
 */
function glideTo(el: HTMLElement, motion: boolean) {
  const targetOf = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    return Math.max(0, Math.min(max, window.scrollY + el.getBoundingClientRect().top - headerBottom()))
  }
  if (!motion) return window.scrollTo({ top: targetOf(), behavior: 'instant' })
  const start = window.scrollY
  const delta = targetOf() - start
  const began = performance.now()
  let cancelled = false
  const cancel = () => (cancelled = true)
  window.addEventListener('wheel', cancel, { passive: true, once: true })
  window.addEventListener('touchstart', cancel, { passive: true, once: true })
  const stop = () => {
    window.removeEventListener('wheel', cancel)
    window.removeEventListener('touchstart', cancel)
  }
  const step = (now: number) => {
    if (cancelled) return stop()
    const t = Math.min(1, (now - began) / GLIDE_MS)
    window.scrollTo({ top: start + delta * (1 - (1 - t) ** 3), behavior: 'instant' })
    if (t < 1) return void requestAnimationFrame(step)
    stop()
    const target = targetOf()
    if (Math.abs(window.scrollY - target) > 2) window.scrollTo({ top: target, behavior: 'instant' })
  }
  requestAnimationFrame(step)
}

/**
 * O comando `open` (research R4, contracts/terminal-open.md). Projeto: reabre a janela se estiver
 * minimizada ou fechada (como o ícone), rola até ela (`glideTo`) e põe o foco no `−` dela. Janela de
 * editor: rola até ela sem animação (maximizada, a página não rola, e uma rolagem suave seria cortada no
 * meio), reabre já completa se preciso e maximiza (o foco vai para o `□`).
 */
export async function openWindow(target: OpenTarget, { motion }: { motion: boolean }): Promise<void> {
  const handle = getWindow(target.windowId)
  const box = () => handle?.element() ?? null
  if (!handle) return

  if (target.mode === 'maximize') {
    box()?.scrollIntoView({ block: 'start', behavior: 'instant' })
    // reabre já completa e sem crescer: a animação que o visitante vê é a de maximizar (SC-001: ≤ 1 s)
    if (handle.state() !== 'open') await handle.open({ complete: true, instant: true })
    await handle.maximize?.()
    return
  }

  const reveal = () => {
    const el = box()
    if (el && !titleBarInView(el)) glideTo(el, motion)
  }
  if (handle.state() !== 'open') await handle.open({ onLayout: reveal })
  else reveal()
  box()?.querySelector<HTMLButtonElement>('button.t-min')?.focus({ preventScroll: true })
}
