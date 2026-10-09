<script setup lang="ts">
import { Lock } from '@lucide/vue'
import { onMounted, ref } from 'vue'
import ExternalLink from '@/components/base/ExternalLink.vue'
import type { Evidence } from '@/types/resume'

const props = defineProps<{ evidence: Evidence }>()

/**
 * Badge dinâmico (FR-011): ocupa sempre a mesma caixa, carregue ou não. Se a imagem falhar, no lugar
 * dela aparece o domínio da evidência como texto do link, sem ícone de imagem quebrada.
 */
const badge = ref<HTMLImageElement | null>(null)
const badgeFailed = ref(false)
const host = new URL(props.evidence.url).host
const path = props.evidence.url.replace(/^https?:\/\//, '')

onMounted(() => {
  // o erro pode ter acontecido antes da hidratação, quando ainda não havia ouvinte
  const img = badge.value
  if (img?.complete && img.naturalWidth === 0) badgeFailed.value = true
})
</script>

<template>
  <li class="t-theme">
    <p class="t-theme-name">
      <span class="prompt-dollar" aria-hidden="true">&gt; </span><span :class="evidence.accent ? ['neon', `neon-${evidence.accent}`] : 'hl-green'" :data-text="evidence.label">{{ evidence.label }}</span>
    </p>
    <!-- repositório privado (FR-005, FR-006): cadeado e "privado" visíveis antes do clique; o nome
         acessível fica "… repositório privado, pode não abrir (abre em nova aba)" -->
    <ExternalLink v-if="evidence.private" :href="evidence.url" class="evidence-link evidence-private">
      <Lock class="private-lock" aria-hidden="true" />
      <span class="evidence-url">{{ path }}</span>
      <span class="private-tag" aria-hidden="true">privado</span>
      <span class="sr-only"> repositório privado, pode não abrir</span>
    </ExternalLink>
    <ExternalLink v-else :href="evidence.url" :class="['evidence-link', evidence.accent && `evidence-${evidence.accent}`]">
      <span v-if="evidence.badge" class="badge-box">
        <span v-if="badgeFailed" class="evidence-url">{{ host }}</span>
        <img
          v-else
          ref="badge"
          :src="evidence.badge.src"
          :alt="evidence.badge.alt"
          loading="lazy"
          decoding="async"
          @error="badgeFailed = true"
        >
      </span>
      <span v-else class="evidence-url">{{ path }}</span>
    </ExternalLink>
  </li>
</template>

<style scoped>
.t-theme-name {
  color: var(--text);
  margin-bottom: calc(var(--spacing) * 1.4);
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
    0 0 4px color-mix(in srgb, var(--green-bright) 90%, transparent),
    0 0 10px color-mix(in srgb, var(--green-bright) 60%, transparent),
    0 0 18px color-mix(in srgb, var(--purple-glow) 75%, transparent),
    0 0 32px color-mix(in srgb, var(--purple-glow) 50%, transparent);
}

/* o vermelho original (--sith-glow) ficava em 4,3:1 contra o próprio brilho; --sith atinge 4,75:1 (FR-022) */
.neon-sith { color: var(--sith); }

.neon-sith::after {
  text-shadow:
    0 0 4px color-mix(in srgb, var(--sith-glow) 90%, transparent),
    0 0 10px color-mix(in srgb, var(--sith-deep) 75%, transparent),
    0 0 18px color-mix(in srgb, var(--sith-deep) 55%, transparent),
    0 0 32px color-mix(in srgb, var(--sith-deep) 40%, transparent);
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
  /* bloco, não inline: a altura não depende da linha de base do badge ou do texto (FR-011) */
  display: flex;
  width: fit-content;
  transition: transform 0.2s, filter 0.2s;
}

.evidence-link:hover,
.evidence-link:focus-visible {
  transform: translateY(-2px);
  filter: drop-shadow(0 0 8px color-mix(in srgb, var(--purple-light) 55%, transparent));
}

/* o badge do Shadow Lord brilha em vermelho, na cor do tema */
.evidence-sith:hover,
.evidence-sith:focus-visible {
  filter: drop-shadow(0 0 8px color-mix(in srgb, var(--sith-deep) 65%, transparent));
}

/* caixa reservada do badge (FR-011, SC-011): os badges "for-the-badge" têm 28px de altura e ~174px
   de largura (varia com o número de downloads); a caixa não muda se a imagem carregar, atrasar ou
   falhar */
.badge-box {
  display: flex;
  align-items: center;
  width: 190px;
  max-width: 100%;
  height: 28px;
}

.badge-box img {
  display: block;
  height: 28px;
  width: auto;
  max-width: 100%;
}

.evidence-url { color: var(--green-bright); }

/* link privado: cadeado, caminho e etiqueta numa linha que quebra em telas estreitas (FR-039) */
.evidence-private {
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 1.6);
  max-width: 100%;
}

.evidence-private .evidence-url {
  min-width: 0;
  overflow-wrap: anywhere;
}

.private-lock {
  width: var(--icon-inline);
  height: var(--icon-inline);
  flex-shrink: 0;
  color: var(--text-dim);
}

.private-tag {
  color: var(--text-dim);
  font-size: 0.72rem;
  line-height: 1.5;
  border: 1px solid var(--border);
  border-radius: var(--radius-nav);
  padding: 0 calc(var(--spacing) * 1.6);
}
</style>
