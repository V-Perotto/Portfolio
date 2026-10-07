import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * Seção ativa para o destaque da navegação (FR-009) — porte do scrollspy anterior: ativa a última
 * seção cujo topo já passou da linha de leitura (45% da viewport), recalculado a cada scroll, para
 * não dessincronizar em scroll rápido/suave.
 */
export function useActiveSection(ids: () => readonly string[]): Ref<string | null> {
  const active = ref<string | null>(null)
  let ticking = false

  const update = () => {
    ticking = false
    const probe = window.innerHeight * 0.45
    let current: string | null = null
    for (const id of ids()) {
      const el = document.getElementById(id)
      if (el && el.getBoundingClientRect().top <= probe) current = id
    }
    active.value = current
  }

  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(update)
  }

  onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    update()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  })

  return active
}
