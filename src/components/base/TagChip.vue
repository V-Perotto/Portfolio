<template>
  <li class="chip"><slot /></li>
</template>

<style scoped>
.chip {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--green-bright);
  background: rgba(32, 94, 68, 0.16);
  border: 1px solid rgba(47, 168, 118, 0.35);
  padding: 0.22rem 0.6rem;
  border-radius: var(--radius-pill);
  transition: all 0.2s;
  cursor: default;
}

.chip:hover {
  background: var(--green);
  color: #fff;
  box-shadow: 0 0 14px rgba(47, 168, 118, 0.55);
  transform: translateY(-2px);
}
</style>
