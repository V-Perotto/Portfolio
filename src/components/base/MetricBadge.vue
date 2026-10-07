<script setup lang="ts">
import type { Metric } from '@/types/resume'

defineProps<{ metric: Metric }>()
</script>

<template>
  <li class="metric">
    <span class="metric-value mono">{{ metric.value }}</span>
    <span class="metric-label">{{ metric.label }}</span>
  </li>
</template>

<style scoped>
.metric {
  display: inline-flex;
  align-items: baseline;
  gap: 0.4rem;
  font-size: 0.85rem;
}

.metric-value {
  color: var(--green-bright);
  font-weight: 700;
}

.metric-label { color: var(--text-dim); }
</style>
