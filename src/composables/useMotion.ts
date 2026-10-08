import { onMounted, readonly, ref, type Ref } from 'vue'

/**
 * Estado de movimento compartilhado pela página inteira. A fonte da verdade é a classe `motion` no
 * <html>, que o script inline do <head> decide antes do primeiro paint pela preferência do sistema
 * (FR-020). Sempre `false` no servidor (HTML pré-renderizado) e até a montagem, para a hidratação
 * bater com o HTML.
 */
const motion = ref(false)
let initialized = false

function init() {
  if (initialized) return
  initialized = true
  const root = document.documentElement
  motion.value = root.classList.contains('motion')

  // mudar "reduzir movimento" no sistema durante a visita vale na hora (FR-020)
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    root.classList.toggle('motion', !e.matches)
    motion.value = !e.matches
  })
}

export function useMotion(): Readonly<Ref<boolean>> {
  onMounted(init)
  return readonly(motion)
}
