<script setup lang="ts">
import type { RichText } from '@/types/resume'

defineProps<{ value: RichText }>()
</script>

<template>
  <template v-for="(part, i) in value" :key="i">
    <template v-if="typeof part === 'string'">{{ part }}</template>
    <span v-else :class="`hl-${part.highlight}`">{{ part.text }}</span>
  </template>
</template>
