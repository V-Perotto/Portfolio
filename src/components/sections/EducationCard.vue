<script setup lang="ts">
import BaseCard from '@/components/base/BaseCard.vue'
import { formatYears } from '@/lib/period'
import type { Education } from '@/types/resume'

defineProps<{ education: Education }>()
</script>

<template>
  <BaseCard variant="card">
    <p class="card-date mono">
      // {{ formatYears(education.startYear, education.endYear) }}
      <span v-if="education.status === 'em-curso'" class="tag-now">EM CURSO</span>
    </p>
    <h3 class="card-role">{{ education.course }}</h3>
    <p class="card-company mono">{{ education.institution }} · {{ education.location }}</p>
  </BaseCard>
</template>
