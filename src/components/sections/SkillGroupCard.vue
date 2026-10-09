<script setup lang="ts">
import BaseCard from '@/components/base/BaseCard.vue'
import TagChip from '@/components/base/TagChip.vue'
import { SKILL_ICONS } from '@/lib/icons'
import type { SkillGroup } from '@/types/resume'

defineProps<{ group: SkillGroup }>()
</script>

<template>
  <BaseCard variant="skill">
    <h3 class="skill-cat mono">
      <component :is="SKILL_ICONS[group.icon]" class="skill-icon" aria-hidden="true" /> {{ group.id }}/
    </h3>
    <ul class="chips">
      <TagChip v-for="item in group.items" :key="item.name">{{ item.name }}</TagChip>
    </ul>
  </BaseCard>
</template>

<style scoped>
.skill-cat {
  color: var(--purple-glow);
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: calc(var(--spacing) * 4);
  /* ids longos (linguagens_frameworks) quebram com texto ampliado em vez de vazar (FR-025) */
  overflow-wrap: anywhere;
}

/* ícone Lucide (SVG em currentColor): cor e tamanho dos tokens, alinhado ao texto (FR-036) */
.skill-icon {
  display: inline-block;
  width: var(--icon-skill);
  height: var(--icon-skill);
  color: var(--green-bright);
  margin-right: calc(var(--spacing) * 2);
  vertical-align: -0.35em;
}
</style>
