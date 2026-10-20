<script setup lang="ts">
import BaseCard from '@/components/base/BaseCard.vue'
import ZoomFigure from '@/components/base/ZoomFigure.vue'
import MetricBadge from '@/components/base/MetricBadge.vue'
import TagChip from '@/components/base/TagChip.vue'
import { formatDate, formatPeriod } from '@/lib/period'
import type { Experience } from '@/types/resume'

/**
 * Cartão de experiência (a linha do tempo da janela maximizada, sem JS e na impressão). Feature 010 (FR-021):
 * a experiência com `photo` (a Prime Control) mostra a foto do 1º dia depois dos chips, com a legenda datada.
 */
const props = defineProps<{ experience: Experience }>()
const photoCaption = props.experience.photo
  ? `# ${props.experience.photo.caption} · ${formatDate(props.experience.photo.taken)}`
  : ''
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
      <TagChip v-for="tech in experience.tech" :key="tech" :tech="tech" />
    </ul>
    <ZoomFigure
      v-if="experience.photo"
      class="exp-photo"
      :image="experience.photo"
      :caption="photoCaption"
      :viewer-caption="photoCaption"
      sizes="(max-width: 760px) calc(100vw - 6rem), 20rem"
      open-label="(abre a foto em tamanho real)"
    />
  </BaseCard>
</template>

<style scoped>
.exp-photo {
  width: min(100%, 20rem);
  margin-top: calc(var(--spacing) * 4.8);
}

.metrics {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 1.6) calc(var(--spacing) * 4.8);
  list-style: none;
  margin-bottom: calc(var(--spacing) * 4);
}
</style>
