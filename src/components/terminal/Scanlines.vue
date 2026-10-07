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
    color-mix(in srgb, var(--shadow) 8%, transparent) 3px,
    color-mix(in srgb, var(--shadow) 8%, transparent) 4px
  );
  mix-blend-mode: multiply;
}
</style>
