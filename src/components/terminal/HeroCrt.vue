<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CrtWarp from '@/components/vendor/vue-bits/CrtWarp.vue'
import type { MatrixColors } from '@/lib/matrix-rain'
import { tokenRgb } from '@/lib/webgl'

/**
 * Fundo do hero (feature 004, FR-034 a FR-039, research R3): o tubo CRT do Vue Bits exibindo a chuva
 * Matrix. Só existe no cliente, com movimento e WebGL, depois do boot (quem decide é o HeroSection,
 * que o carrega num chunk à parte). As cores vêm dos tokens (FR-036); o ponteiro do hero inteiro
 * deforma o tubo.
 */
type Rgb = [number, number, number]

const ready = ref(false)
const hero = ref<HTMLElement | null>(null)
const bg = ref<Rgb>([0, 0, 0])
const purple = ref<Rgb>([0, 0, 0])
const green = ref<Rgb>([0, 0, 0])
const matrix = ref<MatrixColors>({ purple: '#7b3fb3', green: '#2fa876' })

onMounted(() => {
  const css = getComputedStyle(document.documentElement)
  bg.value = tokenRgb('--bg')
  purple.value = tokenRgb('--purple')
  green.value = tokenRgb('--green')
  matrix.value = {
    purple: css.getPropertyValue('--purple-light').trim() || matrix.value.purple,
    green: css.getPropertyValue('--green-light').trim() || matrix.value.green,
  }
  hero.value = document.getElementById('home')
  ready.value = true
})
</script>

<template>
  <CrtWarp v-if="ready" class="hero-crt" :bg="bg" :purple="purple" :green="green" :matrix="matrix" :pointer-host="hero" />
</template>

<style scoped>
.hero-crt {
  position: absolute;
  inset: 0;
  animation: crt-on 0.6s ease both;
}

/* o tubo liga aos poucos, sobre os degradês estáticos */
@keyframes crt-on {
  from { opacity: 0; }
}
</style>
