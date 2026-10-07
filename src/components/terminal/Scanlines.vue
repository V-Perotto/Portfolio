<template>
  <div class="scanlines" aria-hidden="true" />
</template>

<style scoped>
/* scanlines globais (bem sutis) */
.scanlines {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 999;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 3px,
    rgba(0, 0, 0, 0.08) 3px,
    rgba(0, 0, 0, 0.08) 4px
  );
  mix-blend-mode: multiply;
}
</style>
