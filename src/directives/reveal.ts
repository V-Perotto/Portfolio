import type { Directive } from 'vue'

/**
 * `v-reveal`: entrada suave ao rolar (FR-017) — porte do `.reveal` anterior.
 * O estado escondido é aplicado pelo próprio JS depois de montar, e só a elementos ainda abaixo
 * da dobra: se o JS não rodar, nada fica invisível (FR-018); sem movimento, nada muda — e o CSS
 * só esconde sob `html.motion`, então desligar o controle de movimento mostra o que faltava.
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
    // `html.motion` já reflete a preferência do sistema e a escolha do controle (FR-020, FR-035)
    const motion = document.documentElement.classList.contains('motion')
    if (!motion || !('IntersectionObserver' in window)) return
    if (el.getBoundingClientRect().top < window.innerHeight) return // já visível: não esconde

    el.classList.add('reveal', PENDING)
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
