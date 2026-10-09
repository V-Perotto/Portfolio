<script setup lang="ts">
import BaseCard from '@/components/base/BaseCard.vue'
import ExternalLink from '@/components/base/ExternalLink.vue'
import { formatYearMonth } from '@/lib/period'
import type { CommunityProject } from '@/types/resume'

/** Projeto comunitário ou de extensão: não técnico, sem stack (FR-018, FR-019, constituição v2.2.0). */
defineProps<{ project: CommunityProject }>()
</script>

<template>
  <BaseCard variant="card">
    <p class="card-date mono">// {{ formatYearMonth(project.date) }}</p>
    <h4 class="card-role">{{ project.name }}</h4>
    <p class="card-company mono">{{ project.institution }} · {{ project.location }}</p>
    <p class="card-desc">{{ project.summary }}</p>
    <dl class="community-meta mono">
      <div><dt>papel</dt><dd>{{ project.role }}</dd></div>
      <div>
        <dt>fonte</dt>
        <dd><ExternalLink :href="project.source.url">{{ project.source.label }}</ExternalLink></dd>
      </div>
    </dl>
  </BaseCard>
</template>

<style scoped>
/* pares chave = valor, como os metadados da janela de projeto */
.community-meta { font-size: 0.82rem; }
.community-meta div { display: flex; gap: calc(var(--spacing) * 1.6); }
.community-meta dt { color: var(--purple-glow); flex-shrink: 0; white-space: nowrap; }
.community-meta dt::after { content: " ="; color: var(--text-dim); }
.community-meta dd { color: var(--text); min-width: 0; overflow-wrap: anywhere; }
</style>
