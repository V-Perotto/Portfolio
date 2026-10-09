<script setup lang="ts">
/**
 * Barra de título das janelas de terminal (research R8 da 004): o título e os controles `−` `□` `✕`.
 *
 * - `decorative` (padrão): os três controles são desenho, num contêiner `aria-hidden` — é o HTML
 *   pré-renderizado, e o que fica sem JavaScript (FR-009).
 * - `functional`: `−` e `✕` viram botões com nome acessível que inclui o título (FR-001); o `□`
 *   continua desenho. Com `minimizable: false` (terminal da dock), só o `✕` funciona.
 */
const props = withDefaults(
  defineProps<{
    title: string
    controls?: 'decorative' | 'functional'
    minimizable?: boolean
    /** Nome acessível do ✕; padrão "Fechar <título>". */
    closeLabel?: string
  }>(),
  { controls: 'decorative', minimizable: true, closeLabel: undefined },
)

const emit = defineEmits<{ minimize: []; close: [] }>()
</script>

<template>
  <div class="terminal-bar">
    <span class="terminal-title mono">{{ title }}</span>
    <div v-if="props.controls === 'decorative'" class="t-controls" aria-hidden="true">
      <span class="t-btn t-min">−</span>
      <span class="t-btn t-max">□</span>
      <span class="t-btn t-close">✕</span>
    </div>
    <div v-else class="t-controls">
      <button
        v-if="props.minimizable"
        type="button"
        class="t-btn t-min"
        :aria-label="`Minimizar ${props.title}`"
        @click="emit('minimize')"
      >
        <span aria-hidden="true">−</span>
      </button>
      <span v-else class="t-btn t-min" aria-hidden="true">−</span>
      <span class="t-btn t-max" aria-hidden="true">□</span>
      <button
        type="button"
        class="t-btn t-close"
        :aria-label="props.closeLabel ?? `Fechar ${props.title}`"
        @click="emit('close')"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.terminal-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: calc(var(--spacing) * 1.8) calc(var(--spacing) * 2.4);
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
  gap: calc(var(--spacing) * 1.5);
}

.t-btn {
  position: relative;
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  padding: 0;
  border-radius: 50%;
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1;
  user-select: none;
  transition: filter 0.15s;
}

.t-btn:hover { filter: brightness(1.35); }

/* botão de verdade: sem a aparência padrão; o desenho de 20px continua, e o alvo de clique sobe para
   24 × 24 px (WCAG 2.5.8) com uma área invisível em volta */
button.t-btn { cursor: pointer; }
button.t-btn::before {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: 50%;
}

.t-min, .t-max {
  background: color-mix(in srgb, var(--green) 15%, transparent);
  border: 1px solid var(--green);
  color: var(--green-bright);
}

/* o glifo □ assenta na baseline e fica visualmente baixo dentro do círculo */
.t-max { padding-bottom: calc(var(--spacing) * 0.75); }

.t-close {
  background: var(--purple);
  border: 1px solid var(--purple-light);
  color: var(--on-purple);
}
</style>
