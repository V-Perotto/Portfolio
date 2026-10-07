<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useMotion } from '@/composables/useMotion'

/**
 * Prompt que digita e apaga as frases em loop (FR-032) — porte do efeito anterior. No HTML
 * pré-renderizado e com movimento reduzido mostra a frase estática.
 */
const props = defineProps<{ phrases: readonly string[]; staticIndex: number }>()

const shown = ref(props.phrases[props.staticIndex] ?? '')
const motion = useMotion()
let timer: ReturnType<typeof setTimeout> | undefined

function start() {
  let phraseIndex = 0
  let charIndex = 0
  let deleting = false

  const tick = () => {
    const phrase = props.phrases[phraseIndex] ?? ''
    if (!deleting) {
      charIndex++
      shown.value = phrase.slice(0, charIndex)
      if (charIndex >= phrase.length) {
        deleting = true
        timer = setTimeout(tick, 1800) // pausa com a frase completa
        return
      }
      timer = setTimeout(tick, 65 + Math.random() * 60)
    } else {
      charIndex--
      shown.value = phrase.slice(0, charIndex)
      if (charIndex <= 0) {
        deleting = false
        phraseIndex = (phraseIndex + 1) % props.phrases.length
        timer = setTimeout(tick, 400)
        return
      }
      timer = setTimeout(tick, 30)
    }
  }

  shown.value = ''
  timer = setTimeout(tick, 900)
}

watch(motion, (on) => {
  clearTimeout(timer)
  if (on) start()
  else shown.value = props.phrases[props.staticIndex] ?? ''
})

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <span class="typed">{{ shown }}</span>
</template>

<style scoped>
.typed { color: var(--green-bright); }
</style>
