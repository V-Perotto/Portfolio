<script setup lang="ts">
import { computed } from 'vue'
import SectionShell from '@/components/layout/SectionShell.vue'
import { byStartYearDesc } from '@/lib/sort'
import type { Education } from '@/types/resume'
import EducationCard from './EducationCard.vue'

const props = defineProps<{ education: readonly Education[] }>()
const ordered = computed(() => byStartYearDesc(props.education))
</script>

<template>
  <SectionShell id="educacao" title="educacao" lead="apt list --installed | grep formacao">
    <ol class="edu-list">
      <li v-for="edu in ordered" :key="edu.course" v-reveal>
        <EducationCard :education="edu" />
      </li>
    </ol>
  </SectionShell>
</template>

<style scoped>
.edu-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  list-style: none;
}
</style>
