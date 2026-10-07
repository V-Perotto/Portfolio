<script setup lang="ts">
import SpotlightCard from '@/components/vendor/vue-bits/SpotlightCard.vue'

/**
 * Cartão com o realce do SpotlightCard (FR-014) e o visual dos cartões atuais:
 * - `card`: experiência e formação (borda esquerda roxa, desliza para a direita no hover)
 * - `skill`: grupos de skills (sobe no hover)
 * - `window`: projetos (contém uma TerminalWindow; sem padding próprio)
 * Foco por teclado em algo dentro do cartão aplica o mesmo realce (:focus-within, research R8).
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
  padding: 1.4rem 1.6rem;
}

.base-card--card:hover,
.base-card--card:focus-within {
  transform: translateX(6px);
  border-left-color: var(--green-bright);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.45), 0 0 20px rgba(47, 168, 118, 0.18);
}

.base-card--skill {
  padding: 1.4rem;
}

.base-card--skill:hover,
.base-card--skill:focus-within {
  border-color: var(--purple-light);
  box-shadow: 0 0 24px rgba(123, 63, 179, 0.22);
  transform: translateY(-4px);
}

.base-card--window {
  padding: 0;
  border-radius: var(--radius-window);
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(123, 63, 179, 0.08);
  transition: box-shadow 0.3s, border-color 0.3s;
}

.base-card--window:hover,
.base-card--window:focus-within {
  border-color: var(--purple-light);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(123, 63, 179, 0.25);
}
</style>
