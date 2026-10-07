<script setup lang="ts">
import decorImg from '@/assets/img/image2-bg.webp'
import TechMarquee from '@/components/base/TechMarquee.vue'
import SectionShell from '@/components/layout/SectionShell.vue'
import type { SkillGroup } from '@/types/resume'
import SkillGroupCard from './SkillGroupCard.vue'

defineProps<{ groups: readonly SkillGroup[] }>()
</script>

<template>
  <SectionShell
    id="skills"
    title="skills"
    lead="ls -la /usr/lib/vittorio/"
    :decor="{ src: decorImg, tint: 'purple', placement: 'left' }"
  >
    <TechMarquee :groups="groups" />
    <ul class="skills-grid">
      <li v-for="group in groups" :key="group.id" v-reveal>
        <SkillGroupCard :group="group" />
      </li>
    </ul>
  </SectionShell>
</template>

<style scoped>
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: calc(var(--spacing) * 4.8);
  list-style: none;
}
</style>
