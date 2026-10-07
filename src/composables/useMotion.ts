import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * `true` quando o cliente pode animar: o script inline do <head> marcou `html.motion` e o
 * visitante não pediu movimento reduzido. Sempre `false` no servidor (HTML pré-renderizado).
 */
export function useMotion(): Ref<boolean> {
  const motion = ref(false)
  let query: MediaQueryList | null = null

  const sync = () => {
    motion.value = document.documentElement.classList.contains('motion') && !query?.matches
  }

  onMounted(() => {
    query = window.matchMedia('(prefers-reduced-motion: reduce)')
    query.addEventListener('change', sync)
    sync()
  })

  onBeforeUnmount(() => query?.removeEventListener('change', sync))

  return motion
}
