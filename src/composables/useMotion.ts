import { onMounted, readonly, ref, type Ref } from 'vue'

/**
 * Estado de movimento compartilhado pela página inteira. A fonte da verdade é a classe `motion` no
 * <html>, que o script inline do <head> decide antes do primeiro paint: a escolha salva no controle
 * de movimento (FR-035) ou, sem escolha, a preferência do sistema (FR-020). Sempre `false` no
 * servidor (HTML pré-renderizado) e até a montagem, para a hidratação bater com o HTML.
 */
const STORAGE_KEY = 'motion'
const motion = ref(false)
let initialized = false

const root = () => document.documentElement

function apply(on: boolean) {
  root().classList.toggle('motion', on)
  motion.value = on
}

function storedChoice(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function init() {
  if (initialized) return
  initialized = true
  motion.value = root().classList.contains('motion')

  // mudar "reduzir movimento" no sistema durante a visita vale na hora (FR-020), a menos que o
  // visitante tenha feito uma escolha explícita no controle
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    if (storedChoice() === null) apply(!e.matches)
  })
}

/** Liga ou desliga o movimento da página e lembra a escolha deste visitante (FR-035). */
export function setMotion(on: boolean): void {
  apply(on)
  try {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off')
  } catch {
    // sem armazenamento (navegação privada, bloqueio): vale só para esta visita
  }
}

export function useMotion(): Readonly<Ref<boolean>> {
  onMounted(init)
  return readonly(motion)
}
