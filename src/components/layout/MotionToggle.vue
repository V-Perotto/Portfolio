<script setup lang="ts">
import { setMotion, useMotion } from '@/composables/useMotion'

/**
 * Controle de movimento da navegação (FR-035): para matrix, glitch, digitação, faixa de
 * tecnologias e cursor piscando, no mesmo estado final do movimento reduzido, e lembra a escolha.
 * Só existe com JS (o CSS o esconde em `html:not(.js)`); no HTML pré-renderizado sai como "off"
 * e passa ao estado real na montagem.
 */
const motion = useMotion()
</script>

<template>
  <button type="button" class="motion-toggle js-only" :aria-pressed="motion" @click="setMotion(!motion)">
    motion: {{ motion ? 'on' : 'off' }}
  </button>
</template>

<style scoped>
.motion-toggle {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text-dim);
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-nav);
  padding: calc(var(--spacing) * 1) calc(var(--spacing) * 2.8);
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s, border-color 0.2s;
}

.motion-toggle:hover {
  color: var(--green-bright);
  border-color: var(--green);
}

.motion-toggle[aria-pressed="true"] { color: var(--green-bright); }
</style>
