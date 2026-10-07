<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <div class="terminal-window">
    <div class="terminal-bar">
      <span class="terminal-title mono">{{ title }}</span>
      <div class="t-controls" aria-hidden="true">
        <span class="t-btn t-min">−</span>
        <span class="t-btn t-max">□</span>
        <span class="t-btn t-close">✕</span>
      </div>
    </div>
    <div class="terminal-body mono">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.terminal-window {
  background: var(--surface);
  border-radius: var(--radius-window);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.terminal-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0.45rem 0.6rem;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
}

.terminal-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: var(--text-dim);
  white-space: nowrap;
}

.t-controls {
  display: flex;
  gap: 6px;
}

.t-btn {
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1;
  user-select: none;
  transition: filter 0.15s;
}

.t-btn:hover { filter: brightness(1.35); }

.t-min, .t-max {
  background: rgba(32, 94, 68, 0.15);
  border: 1px solid var(--green);
  color: var(--green-bright);
}

/* o glifo □ assenta na baseline e fica visualmente baixo dentro do círculo */
.t-max { padding-bottom: 3px; }

.t-close {
  background: var(--purple);
  border: 1px solid var(--purple-light);
  color: #e6ddf2;
}

.terminal-body {
  padding: 1.3rem 1.4rem;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

@media (max-width: 760px) {
  .terminal-body { padding: 1rem; font-size: 0.82rem; }
}
</style>
