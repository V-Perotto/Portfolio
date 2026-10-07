<script setup lang="ts">
/** `$ comando` (padrão) ou uma linha de saída (`output`), como em um terminal. */
withDefaults(defineProps<{ output?: boolean; tag?: string }>(), { output: false, tag: 'p' })
</script>

<template>
  <component :is="tag" v-if="output" class="t-output"><slot /></component>
  <component :is="tag" v-else class="t-line"><span class="prompt-dollar" aria-hidden="true">$ </span><slot /></component>
</template>

<style scoped>
.t-line { color: var(--text); margin-bottom: calc(var(--spacing) * 2); }

.t-output {
  color: var(--text-dim);
  margin: 0 0 calc(var(--spacing) * 4) 0;
  white-space: pre-line;
}
</style>
