<script setup lang="ts">
defineProps<{
  id: string
  title: string
  /** Linha de comando sob o título, ex.: `git log --carreira --reverse=false`. */
  lead?: string
}>()
</script>

<template>
  <section :id="id" class="section">
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
</style>
