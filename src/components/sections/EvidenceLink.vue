<script setup lang="ts">
import ExternalLink from '@/components/base/ExternalLink.vue'
import type { Evidence } from '@/types/resume'

defineProps<{ evidence: Evidence }>()
</script>

<template>
  <li class="t-theme">
    <p class="t-theme-name">
      <span class="prompt-dollar">&gt; </span><span :class="evidence.accent ? ['neon', `neon-${evidence.accent}`] : 'hl-green'" :data-text="evidence.label">{{ evidence.label }}</span>
    </p>
    <ExternalLink :href="evidence.url" :class="['evidence-link', evidence.accent && `evidence-${evidence.accent}`]">
      <img v-if="evidence.badge" :src="evidence.badge.src" :alt="evidence.badge.alt" loading="lazy" decoding="async">
      <span v-else class="evidence-url">{{ evidence.url.replace(/^https?:\/\//, '') }}</span>
    </ExternalLink>
  </li>
</template>

<style scoped>
.t-theme-name {
  color: var(--text);
  margin-bottom: 0.35rem;
}

/* letreiro neon nos nomes dos temas. O texto fica estável (contraste ≥ 4,5:1, FR-022); só o
   brilho, numa camada por cima com texto transparente, pisca. */
.neon {
  position: relative;
}

.neon::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  color: transparent;
  pointer-events: none;
  animation: neon-flicker 3.4s linear infinite;
}

.neon-grape { color: var(--green-bright); }

.neon-grape::after {
  text-shadow:
    0 0 4px rgba(74, 222, 155, 0.9),
    0 0 10px rgba(74, 222, 155, 0.6),
    0 0 18px rgba(160, 106, 224, 0.75),
    0 0 32px rgba(160, 106, 224, 0.5);
}

/* #ff5b5b original ficava em 4,3:1 contra o próprio brilho; #ff6b6b atinge 4,75:1 (FR-022) */
.neon-sith { color: #ff6b6b; }

.neon-sith::after {
  text-shadow:
    0 0 4px rgba(255, 91, 91, 0.9),
    0 0 10px rgba(217, 4, 4, 0.75),
    0 0 18px rgba(217, 4, 4, 0.55),
    0 0 32px rgba(217, 4, 4, 0.4);
  animation: neon-flicker 2.9s linear infinite reverse;
}

@keyframes neon-flicker {
  0%, 6%, 10%, 100% { opacity: 1; }
  7% { opacity: 0.55; }
  9% { opacity: 0.8; }
  42% { opacity: 1; }
  43% { opacity: 0.7; }
  44% { opacity: 1; }
  70% { opacity: 0.92; }
}

.evidence-link {
  display: inline-block;
  transition: transform 0.2s, filter 0.2s;
}

.evidence-link:hover,
.evidence-link:focus-visible {
  transform: translateY(-2px);
  filter: drop-shadow(0 0 8px rgba(123, 63, 179, 0.55));
}

/* o badge do Shadow Lord brilha em vermelho, na cor do tema */
.evidence-sith:hover,
.evidence-sith:focus-visible {
  filter: drop-shadow(0 0 8px rgba(217, 4, 4, 0.65));
}

/* altura reservada: se o serviço de badges falhar, o cartão não muda de tamanho (SC-011) */
.evidence-link img {
  display: block;
  height: 28px;
  width: auto;
  max-width: 100%;
  overflow: hidden;
  font-size: 0.75rem;
  color: var(--text-dim);
}

.evidence-url { color: var(--green-bright); }
</style>
