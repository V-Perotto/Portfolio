<script setup lang="ts">
import BaseCard from '@/components/base/BaseCard.vue'
import ExternalLink from '@/components/base/ExternalLink.vue'
import TagChip from '@/components/base/TagChip.vue'
import { formatYearMonth } from '@/lib/period'
import type { Challenge } from '@/types/resume'

/**
 * Desafio técnico público: data de criação, nome, o que pede, stack e o repositório (FR-016).
 * Em desktop vira uma linha de log compacta, com a data numa coluna à esquerda (FR-017); a ordem de
 * leitura continua data → nome → descrição → stack → link.
 */
defineProps<{ challenge: Challenge }>()
</script>

<template>
  <BaseCard variant="card">
    <div class="challenge">
      <p class="card-date mono challenge-date">// {{ formatYearMonth(challenge.created) }}</p>
      <h4 class="card-role challenge-name">{{ challenge.name }}</h4>
      <p class="card-desc challenge-desc">{{ challenge.summary }}</p>
      <ul class="chips challenge-stack" aria-label="Stack">
        <TagChip v-for="tech in challenge.stack" :key="tech" :tech="tech" />
      </ul>
      <p class="challenge-repo mono">
        <span class="prompt-dollar" aria-hidden="true">&gt; </span>
        <ExternalLink :href="challenge.url">{{ challenge.url.replace(/^https?:\/\//, '') }}</ExternalLink>
      </p>
    </div>
  </BaseCard>
</template>

<style scoped>
.challenge-stack { margin-bottom: calc(var(--spacing) * 3.2); }

.challenge-repo {
  font-size: 0.85rem;
  overflow-wrap: anywhere;
}

@media (min-width: 900px) {
  .challenge {
    display: grid;
    grid-template-columns: 6.5rem minmax(0, 1fr) auto;
    grid-template-areas:
      "date name repo"
      "date desc desc"
      "date stack stack";
    column-gap: calc(var(--spacing) * 6);
    align-items: baseline;
  }

  .challenge-date { grid-area: date; margin: 0; }
  .challenge-name { grid-area: name; margin: 0; }
  .challenge-repo { grid-area: repo; justify-self: end; text-align: right; }
  .challenge-desc { grid-area: desc; margin: calc(var(--spacing) * 1.2) 0 calc(var(--spacing) * 2.4); }
  .challenge-stack { grid-area: stack; margin: 0; }
}
</style>
