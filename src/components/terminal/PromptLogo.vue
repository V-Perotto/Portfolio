<script setup lang="ts">
/** `viper@portfolio:~$` — logotipo da navegação e prefixo do prompt do hero. */
withDefaults(defineProps<{ cursor?: boolean }>(), { cursor: true })
</script>

<template>
  <span class="prompt"><span class="prompt-user">viper</span><span class="prompt-at">@</span><span class="prompt-host">portfolio</span><span class="prompt-colon">:</span><span class="prompt-path">~</span><span class="prompt-dollar">$</span><span v-if="cursor" class="nav-cursor" aria-hidden="true">▊</span></span>
</template>

<style scoped>
.nav-cursor {
  color: var(--green-bright);
  animation: blink 1.1s steps(1) infinite;
  margin-left: 2px;
}
</style>
