<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import DotField from '@/components/vendor/vue-bits/DotField.vue'
import { tokenRgb } from '@/lib/webgl'

/**
 * Fundo do hero (feature 005, FR-028 a FR-033, research R12): o Dot Field do Vue Bits com os parâmetros
 * do autor (Dot Radius 2, Cursor Force 0, Bulge Only off, Sparkle on, Glow Radius 80). Só existe no
 * cliente, com movimento e depois da porta de acesso (quem decide é o HeroSection, que o carrega num
 * pedaço à parte). As cores vêm dos tokens `--dots-*` (FR-030); fora da tela, o laço para.
 */
type Rgb = [number, number, number]

const ready = ref(false)
const field = ref<InstanceType<typeof DotField> | null>(null)
const from = ref('')
const to = ref('')
const glow = ref('')

let observer: IntersectionObserver | null = null

/** `rgba()` de um token de cor (hex) com a transparência de outro token: o canvas não lê color-mix. */
function rgba(color: string, alpha: string): string {
  const [r, g, b] = tokenRgb(color).map((v) => Math.round(v * 255)) as Rgb
  const a = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(alpha)) || 0
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

onMounted(() => {
  from.value = rgba('--dots-from', '--dots-from-alpha')
  to.value = rgba('--dots-to', '--dots-to-alpha')
  glow.value = rgba('--dots-glow', '--dots-glow-alpha')
  ready.value = true

  const hero = document.getElementById('home')
  if (!hero || typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) field.value?.resume()
    else field.value?.pause()
  })
  observer.observe(hero)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div v-if="ready" class="hero-dots">
    <DotField
      ref="field"
      :dot-radius="2"
      :cursor-force="0"
      :bulge-only="false"
      :sparkle="true"
      :glow-radius="80"
      :gradient-from="from"
      :gradient-to="to"
      :glow-color="glow"
    />
  </div>
</template>

<style scoped>
.hero-dots {
  position: absolute;
  inset: 0;
  animation: dots-on 0.6s ease both;
}

/* os pontos acendem aos poucos, sobre os degradês estáticos */
@keyframes dots-on {
  from { opacity: 0; }
}
</style>
