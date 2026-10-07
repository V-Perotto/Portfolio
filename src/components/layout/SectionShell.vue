<script setup lang="ts">
export interface SectionDecor {
  src: string
  tint: 'green' | 'purple'
  /** Posição da imagem decorativa, como no layout anterior. */
  placement: 'right' | 'right-alt' | 'left'
}

defineProps<{
  id: string
  title: string
  /** Linha de comando sob o título, ex.: `git log --carreira --reverse=false`. */
  lead?: string
  decor?: SectionDecor
}>()
</script>

<template>
  <section :id="id" class="section">
    <div v-if="decor" class="section-decor" aria-hidden="true">
      <img
        :class="['decor-img', `tint-${decor.tint}`, `decor-${decor.placement}`]"
        :src="decor.src"
        alt=""
        loading="lazy"
        decoding="async"
      >
    </div>
    <h2 class="section-title mono">
      <span class="title-hash" aria-hidden="true">##</span> {{ title }}<span class="title-slash" aria-hidden="true">/</span>
    </h2>
    <p v-if="lead" class="section-lead mono"><span aria-hidden="true">$ </span>{{ lead }}</p>
    <slot />
  </section>
</template>

<style scoped>
.section {
  position: relative;
  max-width: var(--container-page);
  margin: 0 auto;
  padding: var(--section-pad);
}

/* conteúdo real fica acima da camada decorativa */
.section > :not(.section-decor) {
  position: relative;
  z-index: 1;
}

.section-decor {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.decor-img {
  position: absolute;
  width: 620px;
  max-width: 75%;
  opacity: 0.12;
  /* fade contido em 50%x50% do box: alpha chega a ~0 antes de qualquer borda ou corte da seção */
  -webkit-mask-image: radial-gradient(ellipse 50% 50% at center, black 0%, color-mix(in srgb, var(--shadow) 70%, transparent) 40%, transparent 88%);
  mask-image: radial-gradient(ellipse 50% 50% at center, black 0%, color-mix(in srgb, var(--shadow) 70%, transparent) 40%, transparent 88%);
}

/* tint: neutraliza a cor original e reaplica o matiz do tema */
.tint-green { filter: grayscale(90%) sepia(65%) hue-rotate(95deg) saturate(2.4) brightness(0.85); }
.tint-purple { filter: grayscale(90%) sepia(65%) hue-rotate(215deg) saturate(2.6) brightness(0.85); }

.decor-right { top: -2rem; right: -140px; transform: rotate(6deg); }
.decor-right-alt { top: -1rem; right: -130px; transform: rotate(6deg); }
.decor-left { top: 3rem; left: -150px; transform: rotate(-5deg); }

.section-title {
  font-size: clamp(1.5rem, 4vw, 2.1rem);
  font-weight: 700;
  color: var(--text);
  margin-bottom: calc(var(--spacing) * 2.4);
}

.title-hash { color: var(--purple-glow); margin-right: calc(var(--spacing) * 2); }
.title-slash { color: var(--green-bright); }

.section-lead {
  color: var(--text-dim);
  font-size: 0.85rem;
  margin-bottom: calc(var(--spacing) * 8);
}

@media (max-width: 760px) {
  .decor-img { opacity: 0.07; width: 260px; }
}
</style>
