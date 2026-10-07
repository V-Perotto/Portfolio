<script setup lang="ts">
import BaseCard from '@/components/base/BaseCard.vue'
import MetricBadge from '@/components/base/MetricBadge.vue'
import TagChip from '@/components/base/TagChip.vue'
import TerminalLine from '@/components/terminal/TerminalLine.vue'
import TerminalWindow from '@/components/terminal/TerminalWindow.vue'
import type { Project, ProjectKind } from '@/types/resume'
import EvidenceLink from './EvidenceLink.vue'

defineProps<{ project: Project }>()

const KIND_LABEL: Record<ProjectKind, string> = {
  pessoal: 'pessoal',
  academico: 'acadêmico',
  'open-source': 'open source',
  profissional: 'profissional',
}
</script>

<template>
  <BaseCard variant="window">
    <TerminalWindow :title="`bash — ${project.id}`">
      <TerminalLine>{{ project.command }}</TerminalLine>
      <h3 class="t-output project-name">
        <span class="hl-purple">{{ project.name }}</span> — {{ project.subtitle }}
      </h3>
      <p class="t-output t-desc">{{ project.purpose }}</p>
      <ul v-if="project.highlights?.length" class="metrics" aria-label="Resultados">
        <MetricBadge v-for="metric in project.highlights" :key="metric.label" :metric="metric" />
      </ul>
      <dl class="project-meta">
        <div><dt>papel</dt><dd>{{ project.role }}</dd></div>
        <div><dt>tipo</dt><dd>{{ KIND_LABEL[project.kind] }}</dd></div>
      </dl>
      <ul class="chips project-stack" aria-label="Stack">
        <TagChip v-for="tech in project.stack" :key="tech">{{ tech }}</TagChip>
      </ul>
      <ul v-if="project.evidence.length" class="t-badges">
        <EvidenceLink v-for="evidence in project.evidence" :key="evidence.url" :evidence="evidence" />
      </ul>
      <p v-else class="t-output no-evidence"># {{ project.noEvidenceReason }}</p>
      <p class="t-line project-footer">
        <span class="hl-green">{{ project.tag }}</span> <span class="t-exit">exit 0</span>
      </p>
    </TerminalWindow>
  </BaseCard>
</template>

<style scoped>
.project-name {
  font-size: inherit;
  font-weight: 400;
  color: var(--text-dim);
  margin: 0 0 calc(var(--spacing) * 4) 0;
}

.t-desc {
  color: var(--text);
  font-family: var(--font-sans);
  margin: 0 0 calc(var(--spacing) * 4) 0;
}

.project-meta {
  margin-bottom: calc(var(--spacing) * 3.2);
  font-size: 0.82rem;
}

.project-meta div { display: flex; gap: calc(var(--spacing) * 1.6); }
.project-meta dt { color: var(--purple-glow); flex-shrink: 0; white-space: nowrap; }
.project-meta dt::after { content: " ="; color: var(--text-dim); }
.project-meta dd { color: var(--text); }

.project-stack { margin-bottom: calc(var(--spacing) * 4); }

.metrics {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 1.6) calc(var(--spacing) * 4.8);
  list-style: none;
  margin-bottom: calc(var(--spacing) * 4);
}

.t-badges {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: calc(var(--spacing) * 3.6);
  margin-bottom: calc(var(--spacing) * 4);
  list-style: none;
}

.no-evidence { color: var(--text-dim); font-style: italic; }

/* rodapé "[...] exit 0" desce para o fundo: cartões da grade com a mesma altura */
.project-footer {
  margin-top: auto;
  margin-bottom: 0;
}

.t-exit { color: var(--text-dim); font-size: 0.8rem; margin-left: calc(var(--spacing) * 2.4); }
</style>
