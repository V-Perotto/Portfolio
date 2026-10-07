<script setup lang="ts">
import { computed } from 'vue'
import LogoLoop from '@/components/vendor/vue-bits/LogoLoop.vue'
import type { SkillGroup } from '@/types/resume'

/**
 * Faixa contínua com as skills `featured` (FR-016), via LogoLoop do Vue Bits. Decorativa: a lista
 * acessível são os cartões de skills, então a faixa fica fora da árvore de acessibilidade e da
 * tabulação. O LogoLoop já para sozinho com prefers-reduced-motion.
 */
const props = defineProps<{ groups: readonly SkillGroup[] }>()

const logos = computed(() =>
  props.groups.flatMap((g) => g.items.filter((i) => i.featured).map((i) => ({ node: i.name, title: i.name }))),
)
</script>

<template>
  <div class="tech-marquee" aria-hidden="true">
    <LogoLoop
      :logos="logos"
      :speed="60"
      :gap="12"
      :logo-height="12"
      :pause-on-hover="true"
      :fade-out="true"
      fade-out-color="var(--bg)"
      aria-label="Tecnologias principais"
    >
      <template #renderItem="{ item }">
        <span class="marquee-chip">{{ 'node' in item ? item.node : '' }}</span>
      </template>
    </LogoLoop>
  </div>
</template>

<style scoped>
.tech-marquee {
  margin-bottom: 2rem;
}

/* mesmo visual do TagChip */
.marquee-chip {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--green-bright);
  background: rgba(32, 94, 68, 0.16);
  border: 1px solid rgba(47, 168, 118, 0.35);
  padding: 0.22rem 0.6rem;
  border-radius: var(--radius-pill);
  white-space: nowrap;
}
</style>
