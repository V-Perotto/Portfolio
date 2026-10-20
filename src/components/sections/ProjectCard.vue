<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from '@/components/base/BaseCard.vue'
import MetricBadge from '@/components/base/MetricBadge.vue'
import TagChip from '@/components/base/TagChip.vue'
import TechIcon from '@/components/base/TechIcon.vue'
import DesktopWindow from '@/components/terminal/DesktopWindow.vue'
import TerminalLine from '@/components/terminal/TerminalLine.vue'
import TerminalWindow from '@/components/terminal/TerminalWindow.vue'
import type { Project, ProjectKind } from '@/types/resume'
import { formatDate } from '@/lib/period'
import { projectWindowId } from '@/lib/sections'
import EvidenceLink from './EvidenceLink.vue'
import ProjectScreenshot from './ProjectScreenshot.vue'

const props = defineProps<{ project: Project }>()

const KIND_LABEL: Record<ProjectKind, string> = {
  pessoal: 'pessoal',
  academico: 'acadêmico',
  'open-source': 'open source',
  profissional: 'profissional',
  'side-project': 'side-project',
}

/** Todo link privado avisa que pode não abrir (FR-005, constituição v2.2.0). */
const privateCount = computed(() => props.project.evidence.filter((e) => e.private).length)
</script>

<template>
  <DesktopWindow :title="project.name" kind="project" :window-id="projectWindowId(project.name)">
    <BaseCard variant="window">
      <TerminalWindow :title="project.name">
        <TerminalLine>{{ project.command }}</TerminalLine>
        <!-- saída do comando: informações à esquerda e links à direita a partir de 900px (research R7) -->
        <div class="project-body">
          <div class="project-info">
            <h3 class="t-output project-name">
              <span class="hl-purple">{{ project.name }}</span> — {{ project.subtitle }}
              <span v-if="project.inProgress" class="tag-now">EM DESENVOLVIMENTO</span>
              <span v-if="project.inProductionSince" class="tag-now">EM PRODUÇÃO</span>
            </h3>
            <p class="t-output t-desc">{{ project.purpose }}</p>
            <ul v-if="project.highlights?.length" class="metrics" aria-label="Resultados">
              <MetricBadge v-for="metric in project.highlights" :key="metric.label" :metric="metric" />
            </ul>
            <dl class="project-meta">
              <div><dt>papel</dt><dd>{{ project.role }}</dd></div>
              <div><dt>tipo</dt><dd>{{ KIND_LABEL[project.kind] }}</dd></div>
              <div v-if="project.inProductionSince"><dt>desde</dt><dd>{{ formatDate(project.inProductionSince) }}</dd></div>
              <div v-if="project.relatedTo"><dt>contexto</dt><dd>{{ project.relatedTo }}</dd></div>
              <div v-for="detail in project.details" :key="detail.label"><dt>{{ detail.label }}</dt><dd>{{ detail.value }}</dd></div>
            </dl>
            <ul class="chips project-stack" aria-label="Stack">
              <TagChip v-for="tech in project.stack" :key="tech" :tech="tech" />
            </ul>
            <!-- apps do servidor (feature 009, FR-012, FR-013, research R6): ícone na cor do texto, nome e uma linha -->
            <template v-if="project.apps">
              <p class="t-output apps-title" aria-hidden="true"># apps</p>
              <ul class="project-apps" aria-label="Apps do servidor">
                <li v-for="app in project.apps" :key="app.name">
                  <span class="app-name hl-purple"><TechIcon :tech="app.name" />{{ app.name }}</span>
                  <span class="app-desc">{{ app.summary }}</span>
                </li>
              </ul>
            </template>
          </div>
          <div class="project-links">
            <!-- Princípio II v3.1.0: infraestrutura sem acesso público, comprovada pela captura; a exceção fica
                 explícita no projeto, como o aviso de repositório privado (feature 009, FR-015, analyze C1) -->
            <template v-if="project.screenshot">
              <p class="t-output no-evidence"># sem acesso público: a evidência é a captura do painel</p>
              <ProjectScreenshot :shot="project.screenshot" :id="project.id" />
            </template>
            <ul v-else-if="project.evidence.length" class="t-badges">
              <EvidenceLink v-for="evidence in project.evidence" :key="evidence.url" :evidence="evidence" />
            </ul>
            <p v-else class="t-output no-evidence"># {{ project.noEvidenceReason }}</p>
            <p v-if="privateCount === 1" class="t-output no-evidence">
              # repositório privado: pode abrir uma página de "não encontrado" para quem não tem acesso.
            </p>
            <p v-else-if="privateCount > 1" class="t-output no-evidence">
              # repositórios privados: podem abrir uma página de "não encontrado" para quem não tem acesso.
            </p>
          </div>
        </div>
        <p class="t-line project-footer">
          <span class="hl-green">{{ project.tag }}</span> <span class="t-exit">exit 0</span>
        </p>
      </TerminalWindow>
    </BaseCard>
  </DesktopWindow>
</template>

<style scoped>
.project-name {
  font-size: inherit;
  font-weight: 400;
  color: var(--text-dim);
  margin: 0 0 calc(var(--spacing) * 4) 0;
}

/* selo de projeto em andamento (FR-013): o mesmo do vínculo atual, sem quebrar no meio */
.project-name .tag-now {
  display: inline-block;
  white-space: nowrap;
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

/* apps do servidor (feature 009, research R6): nome com ícone em roxo e a explicação em texto corrido;
   a partir de 600px, em duas colunas alinhadas (nome | explicação) */
.apps-title { color: var(--text-dim); margin: 0 0 calc(var(--spacing) * 2) 0; }

.project-apps {
  display: grid;
  gap: calc(var(--spacing) * 2.4);
  margin-bottom: calc(var(--spacing) * 4);
  list-style: none;
}

.project-apps li {
  display: grid;
  gap: calc(var(--spacing) * 0.8);
  min-width: 0;
}

.app-name {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing) * 1.6);
  white-space: nowrap;
}

.app-desc {
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 0.9rem;
}

@media (min-width: 600px) {
  .project-apps { grid-template-columns: max-content minmax(0, 1fr); column-gap: calc(var(--spacing) * 4); }
  /* subgrid em vez de `display: contents`, que em alguns leitores de tela tira o papel de item de lista */
  .project-apps li {
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    column-gap: calc(var(--spacing) * 4);
    align-items: baseline;
  }
}

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

.no-evidence { color: var(--text-dim); font-style: italic; margin-bottom: calc(var(--spacing) * 4); }

.project-info, .project-links { min-width: 0; }

/* cartão de largura inteira: a prosa fica numa coluna legível e os links (até 5) ao lado, em vez de
   esticar o cartão para baixo (research R7) */
@media (min-width: 900px) {
  .project-body {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
    column-gap: calc(var(--spacing) * 10);
  }

  .project-links {
    border-left: 1px solid var(--border);
    padding-left: calc(var(--spacing) * 6);
  }
}

/* rodapé "[...] exit 0" desce para o fundo: cartões da grade com a mesma altura */
.project-footer {
  margin-top: auto;
  margin-bottom: 0;
}

.t-exit { color: var(--text-dim); font-size: 0.8rem; margin-left: calc(var(--spacing) * 2.4); }
</style>
