<script setup lang="ts">
import SkillLoop from '@/components/base/SkillLoop.vue'
import SectionShell from '@/components/layout/SectionShell.vue'
import SectionSubpart from '@/components/layout/SectionSubpart.vue'
import { SKILL_ICONS } from '@/lib/icons'
import type { SkillGroup } from '@/types/resume'

/** Um grupo de skills por sub-parte, cada um com seu loop (FR-020 a FR-022, FR-030 da 003). */
defineProps<{ groups: readonly SkillGroup[] }>()
</script>

<template>
  <SectionShell id="skills" title="skills" lead="ls -la /usr/lib/vittorio/">
    <SectionSubpart v-for="group in groups" :key="group.id" v-reveal :title="group.id" class="skill-subpart">
      <template #icon><component :is="SKILL_ICONS[group.icon]" class="skill-icon" aria-hidden="true" /></template>
      <SkillLoop :items="group.items" />
    </SectionSubpart>
  </SectionShell>
</template>

<style scoped>
/* cinco sub-partes seguidas: mais juntas que as de projetos, que vêm depois de cartões grandes (a
   margem da primeira se funde com a do lead da seção) */
.section-subpart.skill-subpart { margin-top: calc(var(--spacing) * 9); }

/* ícone Lucide do grupo (SVG em currentColor): cor e tamanho dos tokens, alinhado ao título (FR-036 da 002) */
.skill-icon {
  display: inline-block;
  width: var(--icon-skill);
  height: var(--icon-skill);
  color: var(--green-bright);
  margin-right: calc(var(--spacing) * 2);
  vertical-align: -0.3em;
}
</style>
