<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useBootDone } from '@/composables/useBootDone'
import { useMotion } from '@/composables/useMotion'

/**
 * Frase revelada palavra a palavra pelo BlurText do Vue Bits (FR-015), em até 1,5 s.
 * No HTML pré-renderizado e sem movimento, é texto puro e visível (research R6); o BlurText só
 * entra no cliente, com movimento, depois da tela de boot — e em chunk separado (motion-v).
 */
const props = defineProps<{ text: string }>()

const BlurText = defineAsyncComponent(() => import('@/components/vendor/vue-bits/BlurText.vue'))

const motion = useMotion()
const bootDone = useBootDone()
const animate = computed(() => motion.value && bootDone.value)

// BlurText leva (palavras - 1) × delay + 2 × 0,35 s; sobra 0,8 s para o escalonamento
const delay = computed(() => Math.floor(800 / Math.max(props.text.split(' ').length - 1, 1)))
</script>

<template>
  <div class="reveal-text">
    <template v-if="animate">
      <span class="sr-only">{{ text }}</span>
      <BlurText :text="text" :delay="delay" animate-by="words" direction="top" class-name="justify-center" aria-hidden="true" />
    </template>
    <template v-else>{{ text }}</template>
  </div>
</template>
