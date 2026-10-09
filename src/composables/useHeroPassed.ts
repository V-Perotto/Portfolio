import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * `true` quando o hero saiu da tela: a borda de baixo dele passou da borda de baixo do header (feature
 * 004, FR-012, research R5). Até montar (e no servidor) é `false`. Um IntersectionObserver com a
 * margem de cima igual à altura do header dá o estado certo também quando a página carrega no meio.
 */
export function useHeroPassed(): Ref<boolean> {
  const passed = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    const hero = document.getElementById('home')
    if (!hero || typeof IntersectionObserver === 'undefined') {
      passed.value = true
      return
    }
    const nav = document.querySelector<HTMLElement>('.navbar')
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    const fallback = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 4.5) * rem
    const height = Math.round(nav?.offsetHeight || fallback)
    observer = new IntersectionObserver(
      (entries) => {
        passed.value = !entries[entries.length - 1]!.isIntersecting
      },
      { rootMargin: `-${height}px 0px 0px 0px` },
    )
    observer.observe(hero)
  })

  onBeforeUnmount(() => observer?.disconnect())

  return passed
}
