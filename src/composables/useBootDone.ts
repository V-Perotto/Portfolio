import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * `true` quando não há tela de boot cobrindo a página (`html.booting` ausente). Efeitos que o
 * visitante precisa ver acontecer (revelação da tagline) esperam por isso.
 */
export function useBootDone(): Ref<boolean> {
  const done = ref(false)
  let observer: MutationObserver | null = null

  onMounted(() => {
    const root = document.documentElement
    const sync = () => {
      done.value = !root.classList.contains('booting')
      if (done.value) observer?.disconnect()
    }
    observer = new MutationObserver(sync)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    sync()
  })

  onBeforeUnmount(() => observer?.disconnect())

  return done
}
