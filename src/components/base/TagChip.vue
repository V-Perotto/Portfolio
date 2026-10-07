<template>
  <li class="chip"><slot /></li>
</template>

<style scoped>
.chip {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--green-bright);
  background: color-mix(in srgb, var(--green) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--green-light) 35%, transparent);
  padding: calc(var(--spacing) * 0.88) calc(var(--spacing) * 2.4);
  border-radius: var(--radius-pill);
  transition: all 0.2s;
  cursor: default;
}

.chip:hover {
  background: var(--green);
  color: var(--on-accent);
  box-shadow: 0 0 14px color-mix(in srgb, var(--green-light) 55%, transparent);
  transform: translateY(-2px);
}
</style>
