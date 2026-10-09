<script setup lang="ts">
defineProps<{ href: string }>()
</script>

<template>
  <a :href="href" class="ext-link" target="_blank" rel="noopener noreferrer">
    <slot />
    <span class="sr-only"> (abre em nova aba)</span>
  </a>
</template>
