<script setup lang="ts">
import { computed } from 'vue'
import SectionShell from '@/components/layout/SectionShell.vue'
import SectionSubpart from '@/components/layout/SectionSubpart.vue'
import { byCreatedDesc } from '@/lib/sort'
import type { Challenge, CommunityProject, Project } from '@/types/resume'
import ChallengeCard from './ChallengeCard.vue'
import CommunityCard from './CommunityCard.vue'
import ProjectCard from './ProjectCard.vue'

// projetos: ordem do arquivo de dados = relevância (Princípio II); challenges: data de criação (FR-015)
const props = defineProps<{
  projects: readonly Project[]
  challenges: readonly Challenge[]
  community: readonly CommunityProject[]
}>()
const orderedChallenges = computed(() => byCreatedDesc(props.challenges))
</script>

<template>
  <SectionShell id="projetos" title="projetos">
    <ul class="projects-grid">
      <li v-for="project in projects" :key="project.id" v-reveal>
        <ProjectCard :project="project" />
      </li>
    </ul>
    <SectionSubpart v-if="challenges.length" title="challenges" lead="ls -lt ~/projetos/challenges">
      <ol class="subpart-list">
        <li v-for="challenge in orderedChallenges" :key="challenge.id" v-reveal>
          <ChallengeCard :challenge="challenge" />
        </li>
      </ol>
    </SectionSubpart>
    <SectionSubpart v-if="community.length" title="comunitario" lead="cat ~/projetos/comunitario/*.md">
      <ul class="subpart-list">
        <li v-for="item in community" :key="item.id" v-reveal>
          <CommunityCard :project="item" />
        </li>
      </ul>
    </SectionSubpart>
  </SectionShell>
</template>

<style scoped>
/* um projeto por linha em todas as larguras (FR-001) */
.projects-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: calc(var(--spacing) * 5.6);
  margin-top: calc(var(--spacing) * 6);
  list-style: none;
}
.subpart-list {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);
  list-style: none;
}
</style>
