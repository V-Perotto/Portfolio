<script setup lang="ts">
/**
 * Sub-parte de uma seção (challenges e comunitário em projetos; os grupos de skills): um subdiretório
 * da seção, com o mesmo cabeçalho das seções, um nível abaixo (The Directory Listing Rule do
 * DESIGN.md; FR-003 da 002, FR-020 da 003). O slot `icon` vai entre o `###` e o título.
 */
defineProps<{
  title: string
  /** Linha de comando sob o título, ex.: `ls -lt ~/projetos/challenges`. */
  lead?: string
}>()
</script>

<template>
  <div class="section-subpart">
    <h3 class="subpart-title mono">
      <span class="title-hash" aria-hidden="true">###</span> <slot name="icon" />{{ title }}<span class="title-slash" aria-hidden="true">/</span>
    </h3>
    <p v-if="lead" class="subpart-lead mono"><span aria-hidden="true">$ </span>{{ lead }}</p>
    <slot />
  </div>
</template>

<style scoped>
.section-subpart {
  margin-top: calc(var(--spacing) * 16);
}

.subpart-title {
  font-size: clamp(1.15rem, 3vw, 1.45rem);
  font-weight: 700;
  color: var(--text);
  margin-bottom: calc(var(--spacing) * 2);
  /* ids longos (linguagens_frameworks) quebram em vez de vazar em telas estreitas */
  overflow-wrap: anywhere;
}

.title-hash { color: var(--purple-glow); margin-right: calc(var(--spacing) * 2); }
.title-slash { color: var(--green-bright); }

.subpart-lead {
  color: var(--text-dim);
  font-size: 0.85rem;
  margin-bottom: calc(var(--spacing) * 6);
}

/* sem lead, o conteúdo vem logo abaixo do título */
.subpart-title:has(+ :not(.subpart-lead)) { margin-bottom: calc(var(--spacing) * 4); }
</style>
