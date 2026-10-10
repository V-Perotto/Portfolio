<script setup lang="ts">
import { computed } from 'vue'
import SectionShell from '@/components/layout/SectionShell.vue'
import EditorWindow from '@/components/terminal/EditorWindow.vue'
import { experienceFolder } from '@/lib/editor-files'
import { byStartDesc } from '@/lib/sort'
import type { Experience } from '@/types/resume'
import ExperienceCard from './ExperienceCard.vue'

/**
 * Experiência numa janela de editor (feature 006, FR-001, clarify Q1): `code ~/carreira`, a árvore com
 * um arquivo YAML por vínculo e, maximizada, sem JavaScript ou na impressão, a linha do tempo de
 * cartões de antes (Q2, FR-012).
 */
const props = defineProps<{ experiences: readonly Experience[] }>()
const ordered = computed(() => byStartDesc(props.experiences))
const folder = computed(() => experienceFolder(props.experiences))
</script>

<template>
  <SectionShell id="experiencia" title="experiencia" lead="git log --carreira --reverse=false">
    <EditorWindow v-reveal :folder="folder" window-id="experiencia">
      <template #cards>
        <ol class="timeline">
          <li v-for="exp in ordered" :key="exp.id" class="timeline-item" :data-card-id="exp.id">
            <div class="timeline-marker" aria-hidden="true" />
            <ExperienceCard :experience="exp" />
          </li>
        </ol>
      </template>
    </EditorWindow>
  </SectionShell>
</template>

<style scoped>
.timeline {
  position: relative;
  padding-left: calc(var(--spacing) * 8);
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
  box-shadow: 0 0 10px color-mix(in srgb, var(--purple-light) 50%, transparent);
}

.timeline-item {
  position: relative;
  margin-bottom: calc(var(--spacing) * 8);
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
  box-shadow: 0 0 12px color-mix(in srgb, var(--green-bright) 70%, transparent);
}

@media (max-width: 760px) {
  .timeline { padding-left: calc(var(--spacing) * 6.4); }
  .timeline-marker { left: -1.6rem; width: 13px; height: 13px; }
}
</style>
