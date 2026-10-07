<script setup lang="ts">
import BaseCard from '@/components/base/BaseCard.vue'
import TagChip from '@/components/base/TagChip.vue'
import type { SkillGroup } from '@/types/resume'

defineProps<{ group: SkillGroup }>()
</script>

<template>
  <BaseCard variant="skill">
    <h3 class="skill-cat mono">
      <span class="skill-icon" aria-hidden="true">{{ group.icon }}</span> {{ group.id }}/
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
  margin-bottom: 1rem;
}

.skill-icon {
  color: var(--green-bright);
  margin-right: 0.5rem;
  font-size: 1.35rem;
  vertical-align: -0.12em;
}
</style>
