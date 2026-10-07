<script setup lang="ts">
import decorImg from '@/assets/img/image1-bg.webp'
import SectionShell from '@/components/layout/SectionShell.vue'
import type { Project } from '@/types/resume'
import ProjectCard from './ProjectCard.vue'

// ordem do arquivo de dados = relevância (Princípio II)
defineProps<{ projects: readonly Project[] }>()
</script>

<template>
  <SectionShell id="projetos" title="projetos" :decor="{ src: decorImg, tint: 'green', placement: 'right-alt' }">
    <ul class="projects-grid">
      <li v-for="project in projects" :key="project.id" v-reveal>
        <ProjectCard :project="project" />
      </li>
    </ul>
  </SectionShell>
</template>

<style scoped>
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: calc(var(--spacing) * 5.6);
  margin-top: calc(var(--spacing) * 6);
  list-style: none;
}
</style>
