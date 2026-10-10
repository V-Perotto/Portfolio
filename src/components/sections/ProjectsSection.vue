<script setup lang="ts">
import { computed } from 'vue'
import SectionShell from '@/components/layout/SectionShell.vue'
import SectionSubpart from '@/components/layout/SectionSubpart.vue'
import EditorWindow from '@/components/terminal/EditorWindow.vue'
import { challengeFolder, communityFolder } from '@/lib/editor-files'
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
// challenges e comunitário em janelas de editor, uma por sub-parte (feature 006, FR-001, clarify Q1);
// os cartões de antes ficam para a janela maximizada, para o sem-JS e para a impressão (FR-012)
const challengeFiles = computed(() => challengeFolder(props.challenges))
const communityFiles = computed(() => communityFolder(props.community))
</script>

<template>
  <SectionShell id="projetos" title="projetos">
    <ul class="projects-grid">
      <li v-for="project in projects" :key="project.id" v-reveal>
        <ProjectCard :project="project" />
      </li>
    </ul>
    <SectionSubpart v-if="challenges.length" title="challenges" lead="ls -lt ~/projetos/challenges">
      <EditorWindow v-reveal :folder="challengeFiles" window-id="challenges">
        <template #cards>
          <ol class="subpart-list">
            <li v-for="challenge in orderedChallenges" :key="challenge.id" :data-card-id="challenge.id">
              <ChallengeCard :challenge="challenge" />
            </li>
          </ol>
        </template>
      </EditorWindow>
    </SectionSubpart>
    <SectionSubpart v-if="community.length" title="comunitario" lead="cat ~/projetos/comunitario/*.md">
      <EditorWindow v-reveal :folder="communityFiles" window-id="comunitario">
        <template #cards>
          <ul class="subpart-list">
            <li v-for="item in community" :key="item.id" :data-card-id="item.id">
              <CommunityCard :project="item" />
            </li>
          </ul>
        </template>
      </EditorWindow>
    </SectionSubpart>
  </SectionShell>
</template>

<style scoped>
/* um projeto aberto por linha em todas as larguras (FR-001 da 002). Minimizados ou fechados, os ícones
   em sequência ficam lado a lado, alinhados à esquerda, e quebram de linha conforme a largura: 2 no
   celular de 320px, 5 com 768px, os 6 a partir de 1024px (feature 005, FR-026, research R11). Entre
   janelas abertas continua o espaço de antes: 1,8 + 2 + 1,8 = 5,6 × --spacing (FR-027) */
.projects-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: calc(var(--spacing) * 2);
  margin-top: calc(var(--spacing) * 4.2);
  list-style: none;
}

.projects-grid > li { flex: 0 0 auto; }

.projects-grid > li:has(> .desktop-window[data-window-state="open"]) {
  flex: 1 0 100%;
  min-width: 0;
  margin-block: calc(var(--spacing) * 1.8);
}
.subpart-list {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);
  list-style: none;
}
</style>
