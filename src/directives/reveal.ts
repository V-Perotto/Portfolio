import type { Directive } from 'vue'

/**
 * `v-reveal`: entrada suave ao rolar (FR-017) — porte do `.reveal` anterior.
 * O estado escondido é aplicado pelo próprio JS depois de montar, e só a elementos ainda abaixo
 * da dobra: se o JS não rodar, nada fica invisível (FR-018); com movimento reduzido, nada muda.
 */
const PENDING = 'reveal-pending'

let observer: IntersectionObserver | null = null

function getObserver(): IntersectionObserver {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.remove(PENDING)
        observer?.unobserve(entry.target)
      }
    },
    { threshold: 0.12 },
  )
  return observer
}

export const vReveal: Directive<HTMLElement> = {
  mounted(el) {
    const root = document.documentElement
    const motion = root.classList.contains('motion') && !matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!motion || !('IntersectionObserver' in window)) return
    if (el.getBoundingClientRect().top < window.innerHeight) return // já visível: não esconde

    el.classList.add('reveal', PENDING)
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
