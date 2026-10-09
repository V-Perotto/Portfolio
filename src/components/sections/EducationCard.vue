<script setup lang="ts">
import BaseCard from '@/components/base/BaseCard.vue'
import ExternalLink from '@/components/base/ExternalLink.vue'
import { formatYears } from '@/lib/period'
import type { Education } from '@/types/resume'

defineProps<{ education: Education }>()
</script>

<template>
  <BaseCard variant="card">
    <p class="card-date mono">
      // {{ formatYears(education.startYear, education.endYear) }}
      <span v-if="education.status === 'em-curso'" class="tag-now">EM CURSO</span>
    </p>
    <h3 class="card-role">{{ education.course }}</h3>
    <p class="card-company mono">{{ education.institution }} · {{ education.location }}</p>
    <!-- observação e fontes são opcionais (FR-021 a FR-023) -->
    <p v-if="education.note" class="card-desc edu-note">{{ education.note }}</p>
    <ul v-if="education.sources" class="edu-sources mono" aria-label="Fontes">
      <li v-for="source in education.sources" :key="source.url">
        <span class="src-key">fonte</span><span class="src-sep" aria-hidden="true"> = </span>
        <ExternalLink :href="source.url" class="src-link">{{ source.label }}</ExternalLink>
      </li>
    </ul>
  </BaseCard>
</template>

<style scoped>
.edu-note { color: var(--text); }

/* a última linha do cartão não leva margem extra */
.edu-note:last-child { margin-bottom: 0; }

.edu-sources {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 1.2) calc(var(--spacing) * 6);
  list-style: none;
  font-size: 0.82rem;
}

.src-key { color: var(--purple-glow); }
.src-sep { color: var(--text-dim); }

.src-link {
  color: var(--green-bright);
  text-decoration: none;
  border-bottom: 1px dashed transparent;
  transition: border-color 0.2s, text-shadow 0.2s;
}

.src-link:hover {
  border-bottom-color: var(--green-bright);
  text-shadow: 0 0 12px color-mix(in srgb, var(--green-bright) 70%, transparent);
}
</style>
