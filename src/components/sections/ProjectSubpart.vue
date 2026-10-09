<script setup lang="ts">
/**
 * Sub-parte da seção de projetos (challenges, comunitário): um subdiretório de `~/projetos`, com o
 * mesmo cabeçalho das seções, um nível abaixo (The Directory Listing Rule do DESIGN.md, FR-003).
 */
defineProps<{
  title: string
  /** Linha de comando sob o título, ex.: `ls -lt ~/projetos/challenges`. */
  lead: string
}>()
</script>

<template>
  <div class="project-subpart">
    <h3 class="subpart-title mono">
      <span class="title-hash" aria-hidden="true">###</span> {{ title }}<span class="title-slash" aria-hidden="true">/</span>
    </h3>
    <p class="subpart-lead mono"><span aria-hidden="true">$ </span>{{ lead }}</p>
    <slot />
  </div>
</template>

<style scoped>
.project-subpart {
  margin-top: calc(var(--spacing) * 16);
}

.subpart-title {
  font-size: clamp(1.15rem, 3vw, 1.45rem);
  font-weight: 700;
  color: var(--text);
  margin-bottom: calc(var(--spacing) * 2);
}

.title-hash { color: var(--purple-glow); margin-right: calc(var(--spacing) * 2); }
.title-slash { color: var(--green-bright); }

.subpart-lead {
  color: var(--text-dim);
  font-size: 0.85rem;
  margin-bottom: calc(var(--spacing) * 6);
}
</style>
