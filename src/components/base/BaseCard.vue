<script setup lang="ts">
import SpotlightCard from '@/components/vendor/vue-bits/SpotlightCard.vue'

/**
 * Cartão com o realce do SpotlightCard (FR-014) e o visual dos cartões atuais:
 * - `card`: experiência e formação (borda esquerda roxa, desliza para a direita no hover)
 * - `skill`: grupos de skills (sobe no hover)
 * - `window`: projetos (contém uma TerminalWindow; sem padding próprio)
 * Foco por teclado em algo dentro do cartão acende o mesmo brilho, centralizado (:focus-within,
 * research R8). Em telas de toque o brilho não aparece: o toque emula `mouseenter` e o deixaria
 * aceso.
 */
withDefaults(defineProps<{ variant?: 'card' | 'skill' | 'window' }>(), { variant: 'card' })
</script>

<template>
  <SpotlightCard :class-name="`base-card base-card--${variant}`" spotlight-color="var(--spotlight)">
    <slot />
  </SpotlightCard>
</template>

<style scoped>
.base-card {
  height: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
}

.base-card--card {
  border-left: 3px solid var(--purple-light);
  padding: calc(var(--spacing) * 5.6) calc(var(--spacing) * 6.4);
}

.base-card--card:hover,
.base-card--card:focus-within {
  transform: translateX(6px);
  border-left-color: var(--green-bright);
  box-shadow: 0 4px 30px color-mix(in srgb, var(--shadow) 45%, transparent), 0 0 20px color-mix(in srgb, var(--green-light) 18%, transparent);
}

.base-card--skill {
  padding: calc(var(--spacing) * 5.6);
}

.base-card--skill:hover,
.base-card--skill:focus-within {
  border-color: var(--purple-light);
  box-shadow: 0 0 24px color-mix(in srgb, var(--purple-light) 22%, transparent);
  transform: translateY(-4px);
}

.base-card--window {
  padding: 0;
  border-radius: var(--radius-window);
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 40px color-mix(in srgb, var(--shadow) 50%, transparent), 0 0 0 1px color-mix(in srgb, var(--purple-light) 8%, transparent);
  transition: box-shadow 0.25s, border-color 0.25s;
}

.base-card--window:hover,
.base-card--window:focus-within {
  border-color: var(--purple-light);
  box-shadow: 0 8px 40px color-mix(in srgb, var(--shadow) 50%, transparent), 0 0 24px color-mix(in srgb, var(--purple-light) 25%, transparent);
}

/* foco por teclado num link do cartão: o mesmo brilho do hover, centralizado (FR-014) */
.base-card:focus-within :deep(.spotlight-layer) {
  opacity: 0.6 !important;
  background: radial-gradient(circle at 50% 50%, var(--spotlight), transparent 80%) !important;
}

/* sem ponteiro com hover (toque): sem brilho (FR-014) */
@media not ((hover: hover) and (pointer: fine)) {
  .base-card :deep(.spotlight-layer) { display: none; }
}
</style>
