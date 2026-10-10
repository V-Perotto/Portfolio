<script setup lang="ts">
import { computed } from 'vue'
import SectionShell from '@/components/layout/SectionShell.vue'
import EditorWindow from '@/components/terminal/EditorWindow.vue'
import { educationFolder } from '@/lib/editor-files'
import { byStartYearDesc } from '@/lib/sort'
import type { Education } from '@/types/resume'
import EducationCard from './EducationCard.vue'

/**
 * Educação numa janela de editor (feature 008, FR-001, Q2), como Challenges e Comunitário: `code ~/formacao`,
 * a árvore com um arquivo YAML por formação e, maximizada, sem JavaScript ou na impressão, os cartões de
 * antes (006 FR-012). Os cartões não revelam um a um: quem entra na tela é a janela (research R6).
 */
const props = defineProps<{ education: readonly Education[] }>()
const ordered = computed(() => byStartYearDesc(props.education))
const folder = computed(() => educationFolder(props.education))
</script>

<template>
  <SectionShell id="educacao" title="educacao" lead="apt list --installed | grep formacao">
    <EditorWindow v-reveal :folder="folder" window-id="educacao">
      <template #cards>
        <ol class="edu-list">
          <li v-for="edu in ordered" :key="edu.id" :data-card-id="edu.id">
            <EducationCard :education="edu" />
          </li>
        </ol>
      </template>
    </EditorWindow>
  </SectionShell>
</template>

<style scoped>
.edu-list {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4.8);
  list-style: none;
}
</style>
