<script setup lang="ts">
import BaseCard from '@/components/base/BaseCard.vue'
import MetricBadge from '@/components/base/MetricBadge.vue'
import TagChip from '@/components/base/TagChip.vue'
import { formatPeriod } from '@/lib/period'
import type { Experience } from '@/types/resume'

defineProps<{ experience: Experience }>()
</script>

<template>
  <BaseCard variant="card">
    <p class="card-date mono">
      // {{ formatPeriod(experience.start, experience.end) }}
      <span v-if="!experience.end" class="tag-now">HEAD</span>
    </p>
    <h3 class="card-role">{{ experience.role }}</h3>
    <p class="card-company mono">{{ experience.company }} · {{ experience.location }}</p>
    <p class="card-desc">{{ experience.summary }}</p>
    <ul v-if="experience.highlights?.length" class="metrics" aria-label="Resultados">
      <MetricBadge v-for="metric in experience.highlights" :key="metric.label" :metric="metric" />
    </ul>
    <ul class="chips" aria-label="Tecnologias">
      <TagChip v-for="tech in experience.tech" :key="tech">{{ tech }}</TagChip>
    </ul>
  </BaseCard>
</template>

<style scoped>
.metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.2rem;
  list-style: none;
  margin-bottom: 1rem;
}
</style>
