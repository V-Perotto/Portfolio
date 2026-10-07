<script setup lang="ts">
import { computed } from 'vue'
import SectionShell from '@/components/layout/SectionShell.vue'
import { byStartDesc } from '@/lib/sort'
import type { Experience } from '@/types/resume'
import ExperienceCard from './ExperienceCard.vue'

const props = defineProps<{ experiences: readonly Experience[] }>()
const ordered = computed(() => byStartDesc(props.experiences))
</script>

<template>
  <SectionShell id="experiencia" title="experiencia" lead="git log --carreira --reverse=false">
    <ol class="timeline">
      <li v-for="exp in ordered" :key="exp.id" v-reveal class="timeline-item">
        <div class="timeline-marker" aria-hidden="true" />
        <ExperienceCard :experience="exp" />
      </li>
    </ol>
  </SectionShell>
</template>

<style scoped>
.timeline {
  position: relative;
  padding-left: 2rem;
  list-style: none;
}

.timeline::before {
  content: "";
  position: absolute;
  left: 7px;
  top: 6px;
  bottom: 6px;
  width: 2px;
  background: linear-gradient(180deg, var(--purple-light), var(--green-light));
  box-shadow: 0 0 10px rgba(123, 63, 179, 0.5);
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
}

.timeline-marker {
  position: absolute;
  left: -2rem;
  top: 1.4rem;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--bg);
  border: 3px solid var(--green-bright);
  box-shadow: 0 0 12px rgba(74, 222, 155, 0.7);
}

@media (max-width: 760px) {
  .timeline { padding-left: 1.6rem; }
  .timeline-marker { left: -1.6rem; width: 13px; height: 13px; }
}
</style>
