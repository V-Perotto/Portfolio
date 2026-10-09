<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import LetterGlitch from '@/components/vendor/vue-bits/LetterGlitch.vue'
import type { Rgb } from '@/lib/scenes/letter-glitch'
import { tokenRgb } from '@/lib/webgl'

/**
 * Fundo do hero (feature 006, FR-029 a FR-034, research R12): o Letter Glitch do Vue Bits com os
 * parâmetros do autor (Glitch Speed 10, Smooth on, Center Vignette on, Outer Vignette on), no lugar do
 * Dot Field da 005. As cores vêm dos tokens `--glitch-*` (uma escura e duas de destaque, no papel das
 * três do componente), com a intensidade `--glitch-alpha`. Só existe no cliente, com movimento e depois
 * da porta de acesso (quem decide é o HeroSection, que o carrega num pedaço à parte); fora da tela, para.
 * Avisa `ready` no primeiro quadro (o loader do hero espera por ele, R13).
 */
const emit = defineEmits<{ ready: [] }>()

const colors = ref<Rgb[]>([])
const alpha = ref(1)
const glitch = ref<InstanceType<typeof LetterGlitch> | null>(null)

let observer: IntersectionObserver | null = null

const rgb = (token: string): Rgb => tokenRgb(token).map((v) => Math.round(v * 255)) as Rgb

onMounted(() => {
  colors.value = [rgb('--glitch-dark'), rgb('--glitch-green'), rgb('--glitch-purple')]
  alpha.value = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--glitch-alpha')) || 1

  const hero = document.getElementById('home')
  if (!hero || typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) glitch.value?.resume()
    else glitch.value?.pause()
  })
  observer.observe(hero)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div v-if="colors.length" class="hero-glitch">
    <LetterGlitch
      ref="glitch"
      :colors="colors"
      :alpha="alpha"
      :glitch-speed="10"
      smooth
      center-vignette
      outer-vignette
      @ready="emit('ready')"
    />
  </div>
</template>

<style scoped>
.hero-glitch {
  position: absolute;
  inset: 0;
  animation: glitch-on 0.6s ease both;
}

/* as letras acendem aos poucos, sobre os degradês estáticos */
@keyframes glitch-on {
  from { opacity: 0; }
}
</style>
