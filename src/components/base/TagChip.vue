<script setup lang="ts">
import type { TechName } from '@/types/resume'
import TechIcon from './TechIcon.vue'

/** Chip de tecnologia: ícone à esquerda, na cor do texto, e o nome (FR-012 a FR-018 da 003). */
defineProps<{ tech: TechName }>()
</script>

<template>
  <li class="chip"><TechIcon :tech="tech" />{{ tech }}</li>
</template>

<style scoped>
.chip {
  /* o ícone tem 1em e cabe na linha do texto: a altura do chip não muda (FR-018) */
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--green-bright);
  background: color-mix(in srgb, var(--green) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--green-light) 35%, transparent);
  padding: calc(var(--spacing) * 0.88) calc(var(--spacing) * 2.4);
  border-radius: var(--radius-pill);
  transition: all 0.2s;
  cursor: default;
}

/* o ícone pinta com currentColor e acompanha o texto (FR-014) */
.chip:hover {
  background: var(--green);
  color: var(--on-accent);
  box-shadow: 0 0 14px color-mix(in srgb, var(--green-light) 55%, transparent);
  transform: translateY(-2px);
}
</style>
