import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'
import { useMotion } from '@/composables/useMotion'
import { planTyping, TYPING_BUDGET_MS, type TypingPlan } from '@/lib/typing'

/**
 * Janela de terminal que digita ao entrar na tela (FR-025 a FR-033; research R3–R6 da 002).
 *
 * Só acrescenta comportamento: o HTML pré-renderizado é a janela completa, e os estados escondidos
 * (`data-t-state`, CSS em base.css) só existem depois que este composable os aplica, com movimento.
 * O texto real nunca sai do fluxo nem da árvore de acessibilidade: o comando fica transparente sob
 * uma cópia `aria-hidden` que digita, e a saída fica com `opacity: 0` até o comando terminar.
 *
 * Passos = filhos diretos do corpo: cada `[data-t-cmd]` abre um passo, e os elementos seguintes, até
 * o próximo comando, são a saída dele.
 *
 * Feature 004 (janelas que minimizam e fecham, FR-004, FR-005): devolve `complete()`, que termina a
 * digitação na hora (minimizar), e `replay()`, que digita tudo de novo, com o mesmo plano e o mesmo
 * teto (reabrir uma janela fechada). Sem movimento, `replay()` não faz nada.
 *
 * Feature 006 (FR-023, research R7): `prepare()` esconde comandos e saídas sem começar nada; quem
 * reabre a janela chama antes de ela crescer, e o `replay()` depois só digita. Assim a janela cresce
 * vazia e não pisca o conteúdo inteiro antes de "recarregar".
 */
type StepState = 'pending' | 'typing' | 'done'

interface Step {
  cmd: HTMLElement
  outputs: HTMLElement[]
}

/**
 * A janela começa quando o topo passa de 80% da altura da tela (vale para janela de qualquer altura).
 * A área observada se estende para tudo acima dessa linha: numa rolagem rápida, a janela pode pular de
 * "abaixo da tela" para "acima da tela" entre dois quadros sem nunca cruzar a viewport, e só assim o
 * observer percebe que ela já passou (edge case "rolagem rápida até o fim" da spec).
 */
const ROOT_MARGIN = '100000px 0px -20% 0px'
/** Teto rígido: com a CPU ocupada os timers atrasam, mas a janela completa até aqui (FR-026: 2,5 s). */
const HARD_CAP_MS = TYPING_BUDGET_MS + 250

export interface TerminalTyping {
  complete(): void
  replay(): void
  prepare(): void
}

export function useTerminalTyping(windowEl: Ref<HTMLElement | null>, bodyEl: Ref<HTMLElement | null>): TerminalTyping {
  const motion = useMotion()
  const root = typeof document === 'undefined' ? null : document.documentElement

  let phase: 'idle' | 'armed' | 'running' | 'done' = 'idle'
  /** Estados escondidos aplicados por `prepare()`, à espera do `replay()`. */
  let prepared = false
  let steps: Step[] = []
  let visible = false
  let intersection: IntersectionObserver | null = null
  let bootWatch: MutationObserver | null = null
  const timers: ReturnType<typeof setTimeout>[] = []
  const schedule = (delay: number, fn: () => void) => timers.push(setTimeout(fn, delay))

  const setState = (el: HTMLElement, state: StepState) => el.setAttribute('data-t-state', state)
  const booting = () => root?.classList.contains('booting') ?? false

  function stopWatching() {
    intersection?.disconnect()
    bootWatch?.disconnect()
    intersection = bootWatch = null
    windowEl.value?.removeEventListener('pointerdown', finish)
    windowEl.value?.removeEventListener('focusin', finish)
  }

  /** Completa tudo na hora: fim natural, pulo (clique, toque, foco) ou movimento desligado. */
  function finish() {
    if (phase !== 'armed' && phase !== 'running' && !prepared) return
    prepared = false
    windowEl.value?.removeAttribute('data-t-instant')
    phase = 'done'
    timers.forEach(clearTimeout)
    timers.length = 0
    for (const { cmd, outputs } of steps) {
      cmd.querySelector(':scope > .t-typed')?.remove()
      setState(cmd, 'done')
      outputs.forEach((el) => setState(el, 'done'))
    }
    stopWatching()
  }

  function collectSteps(body: HTMLElement) {
    if (steps.length) return
    let current: Step | null = null
    for (const child of Array.from(body.children) as HTMLElement[]) {
      if (child.hasAttribute('data-t-cmd')) {
        current = { cmd: child, outputs: [] }
        steps.push(current)
      } else if (current) {
        current.outputs.push(child)
      } // antes do primeiro comando: fica visível desde o início
    }
  }

  /** Esconde comandos e saídas (o estado inicial da digitação), sem ouvintes nem timers. */
  function hide(win: HTMLElement, body: HTMLElement): boolean {
    collectSteps(body)
    if (!steps.length) return false
    win.setAttribute('data-t-anim', '')
    for (const { cmd, outputs } of steps) {
      cmd.querySelector(':scope > .t-typed')?.remove()
      setState(cmd, 'pending')
      outputs.forEach((el) => setState(el, 'pending'))
    }
    return true
  }

  function listen(win: HTMLElement) {
    win.addEventListener('pointerdown', finish)
    win.addEventListener('focusin', finish)
    phase = 'armed'
  }

  function arm(win: HTMLElement, body: HTMLElement): boolean {
    if (!hide(win, body)) return false
    listen(win)
    return true
  }

  /** Janela fechada, antes de crescer de novo: comandos e saídas escondidos, nada começa (R7). */
  function prepareReplay() {
    const win = windowEl.value
    const body = bodyEl.value
    if (!win || !body || !root?.classList.contains('motion')) return
    timers.forEach(clearTimeout)
    timers.length = 0
    stopWatching()
    phase = 'idle'
    // sem a transição de opacidade das saídas: reaberta logo depois de fechar, a janela ainda pode estar
    // na tela (encolhendo), e a saída sumiria aos poucos, à vista; ela some na hora
    win.setAttribute('data-t-instant', '')
    prepared = hide(win, body)
  }

  /** Janela fechada e reaberta: digita tudo de novo, na hora (ela está na tela). */
  function replay() {
    const win = windowEl.value
    const body = bodyEl.value
    if (!win || !body || !root?.classList.contains('motion')) return
    if (prepared) {
      // já escondida antes de crescer: só liga os ouvintes (depois do foco no −, que os dispararia)
      prepared = false
      win.removeAttribute('data-t-instant')
      listen(win)
    } else {
      timers.forEach(clearTimeout)
      timers.length = 0
      stopWatching()
      if (!arm(win, body)) return
    }
    visible = true
    run()
  }

  function tryStart() {
    if (phase !== 'armed' || !visible || booting()) return
    // já passou inteira para cima da tela: ninguém vê a digitação, completa na hora
    if ((windowEl.value?.getBoundingClientRect().bottom ?? 0) <= 0) finish()
    else run()
  }

  /** Cópia do comando sem texto, com os nós de texto a preencher (o `$ ` do prompt já vem pronto). */
  function prepare(cmd: HTMLElement) {
    const source = cmd.querySelector<HTMLElement>(':scope > .t-cmd')
    const overlay = document.createElement('span')
    overlay.className = 't-typed'
    overlay.setAttribute('aria-hidden', 'true')
    const texts: { node: Text; full: string }[] = []
    if (source) {
      const copy = source.cloneNode(true) as HTMLElement
      copy.className = 't-typed-text'
      const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT)
      while (walker.nextNode()) {
        const node = walker.currentNode as Text
        if (node.parentElement?.closest('.prompt-dollar')) continue
        texts.push({ node, full: node.data })
        node.data = ''
      }
      overlay.append(copy)
    }
    return { overlay, texts }
  }

  function typeStep(step: Step, plan: TypingPlan, prepared: ReturnType<typeof prepare>, onTyped: () => void) {
    const { overlay, texts } = prepared
    step.cmd.append(overlay)
    setState(step.cmd, 'typing')
    const total = texts.reduce((sum, t) => sum + t.full.length, 0)
    const msPerChar = plan.tickMs / plan.charsPerTick
    const startedAt = performance.now()
    let shown = 0
    const render = (count: number) => {
      let rest = count
      for (const text of texts) {
        const take = Math.min(rest, text.full.length)
        text.node.data = text.full.slice(0, take)
        rest -= take
      }
    }
    const tick = () => {
      if (phase !== 'running') return
      // segue o relógio: se os timers atrasarem (CPU ocupada), alcança o que já devia estar digitado
      const byClock = Math.floor((performance.now() - startedAt) / msPerChar) + 1
      shown = Math.min(total, Math.max(shown + plan.charsPerTick, byClock))
      render(shown)
      if (shown < total) schedule(plan.tickMs, tick)
      else onTyped()
    }
    tick()
  }

  function run() {
    phase = 'running'
    intersection?.disconnect()
    bootWatch?.disconnect()
    const prepared = steps.map((step) => prepare(step.cmd))
    const plan = planTyping(prepared.map((p) => p.texts.reduce((sum, t) => sum + t.full.length, 0)))
    schedule(HARD_CAP_MS, finish)

    let i = 0
    const next = () => {
      if (phase !== 'running') return
      const step = steps[i]
      if (!step) return finish()
      typeStep(step, plan, prepared[i]!, () => {
        // comando digitado: o texto real assume no mesmo lugar; depois da pausa ("enter"), a saída
        step.cmd.querySelector(':scope > .t-typed')?.remove()
        setState(step.cmd, 'done')
        schedule(plan.pauseAfter, () => {
          step.outputs.forEach((el) => setState(el, 'done'))
          i++
          next()
        })
      })
    }
    schedule(plan.initialDelay, next)
  }

  onMounted(() => {
    const win = windowEl.value
    const body = bodyEl.value
    if (!win || !body || !root) return
    if (!root.classList.contains('motion') || !('IntersectionObserver' in window)) return

    // research R4: abaixo da dobra → anima ao entrar; visível sob a capa de boot → anima quando ela
    // sai; visível sem capa ou acima da dobra → fica completa (esconder texto já visto faria piscar)
    const rect = win.getBoundingClientRect()
    const below = rect.top >= window.innerHeight
    const inView = rect.bottom > 0 && rect.top < window.innerHeight
    if (!below && !(inView && booting())) return
    if (!arm(win, body)) return

    intersection = new IntersectionObserver(
      (entries) => {
        visible = entries[entries.length - 1]!.isIntersecting
        tryStart()
      },
      { rootMargin: ROOT_MARGIN },
    )
    intersection.observe(win)
    bootWatch = new MutationObserver(tryStart)
    bootWatch.observe(root, { attributes: true, attributeFilter: ['class'] })
  })

  // "reduzir movimento" ligado no meio da visita: tudo completo na hora (FR-029)
  watch(motion, (on) => {
    if (!on) finish()
  })

  onBeforeUnmount(() => {
    timers.forEach(clearTimeout)
    stopWatching()
  })

  return { complete: finish, replay, prepare: prepareReplay }
}
