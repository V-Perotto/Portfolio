<script setup lang="ts">
import { computed } from 'vue'
import spriteUrl from '@/assets/tech-icons/sprite.svg?url&no-inline'
import { TECH_ICONS } from '@/lib/tech-icons'
import type { TechName } from '@/types/resume'

/**
 * Ícone de uma tecnologia (chips e loops de skills; FR-012 a FR-018 da 003). Um <use> para o sprite,
 * que é um arquivo do próprio site (research R2): aparece sem JavaScript, não pede nada a terceiros e
 * pinta com a cor do texto em volta (`currentColor`), inclusive no hover e no alto contraste.
 * Decorativo: o nome da tecnologia vem ao lado, em texto.
 */
const props = defineProps<{ tech: TechName }>()
const href = computed(() => `${spriteUrl}#${TECH_ICONS[props.tech]}`)
</script>

<template>
  <svg class="tech-icon" aria-hidden="true" focusable="false"><use :href="href" /></svg>
</template>

<style scoped>
.tech-icon {
  display: inline-block;
  width: var(--icon-tech);
  height: var(--icon-tech);
  flex-shrink: 0;
  fill: currentColor;
}
</style>
