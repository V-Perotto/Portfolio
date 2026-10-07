<script setup lang="ts">
import { computed } from 'vue'
import LogoLoop from '@/components/vendor/vue-bits/LogoLoop.vue'
import { useMotion } from '@/composables/useMotion'
import type { SkillGroup } from '@/types/resume'

/**
 * Faixa contínua com as skills `featured` (FR-016), via LogoLoop do Vue Bits. Decorativa: a lista
 * acessível são os cartões de skills, então a faixa fica fora da árvore de acessibilidade e da
 * tabulação. Sem movimento (HTML pré-renderizado, preferência do sistema ou controle desligado,
 * FR-020/FR-035), mostra a primeira cópia parada no lugar do LogoLoop.
 */
const props = defineProps<{ groups: readonly SkillGroup[] }>()
const motion = useMotion()

const logos = computed(() =>
  props.groups.flatMap((g) => g.items.filter((i) => i.featured).map((i) => ({ node: i.name, title: i.name }))),
)
</script>

<template>
  <div class="tech-marquee" aria-hidden="true">
    <LogoLoop
      v-if="motion"
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
    <ul v-else class="marquee-static">
      <li v-for="logo in logos" :key="logo.node"><span class="marquee-chip">{{ logo.node }}</span></li>
    </ul>
  </div>
</template>

<style scoped>
.tech-marquee {
  margin-bottom: calc(var(--spacing) * 8);
}

/* mesma faixa, parada: uma linha só, cortada nas bordas com o mesmo esmaecimento do LogoLoop */
.marquee-static {
  display: flex;
  gap: calc(var(--spacing) * 3);
  list-style: none;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}

/* mesmo visual do TagChip */
.marquee-chip {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--green-bright);
  background: color-mix(in srgb, var(--green) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--green-light) 35%, transparent);
  padding: calc(var(--spacing) * 0.88) calc(var(--spacing) * 2.4);
  border-radius: var(--radius-pill);
  white-space: nowrap;
}
</style>
