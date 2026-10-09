<script setup lang="ts">
import AppDock from '@/components/dock/AppDock.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppNav from '@/components/layout/AppNav.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import EducationSection from '@/components/sections/EducationSection.vue'
import ExperienceSection from '@/components/sections/ExperienceSection.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import SkillsSection from '@/components/sections/SkillsSection.vue'
import AccessGate from '@/components/terminal/AccessGate.vue'
import Scanlines from '@/components/terminal/Scanlines.vue'
import { useHashAnchor } from '@/composables/useHashAnchor'
import { useHeadFromResume } from '@/composables/useHeadFromResume'
import { resume } from '@/data/resume'
import { visibleSections } from '@/lib/sections'

useHeadFromResume()
useHashAnchor()

const sections = visibleSections(resume)
const shows = (id: string) => sections.some((s) => s.id === id)
</script>

<template>
  <AccessGate />
  <Scanlines />
  <AppNav :sections="sections" />
  <HeroSection :profile="resume.profile" />
  <main>
    <AboutSection v-if="shows('sobre')" :profile="resume.profile" />
    <ExperienceSection v-if="shows('experiencia')" :experiences="resume.experiences" />
    <SkillsSection v-if="shows('skills')" :groups="resume.skillGroups" />
    <ProjectsSection v-if="shows('projetos')" :projects="resume.projects" :challenges="resume.challenges" :community="resume.community" />
    <EducationSection v-if="shows('educacao')" :education="resume.education" />
    <ContactSection v-if="shows('contato')" :contacts="resume.contacts" />
  </main>
  <AppFooter />
  <AppDock :sections="sections" />
</template>
