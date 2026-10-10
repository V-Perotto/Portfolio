<script setup lang="ts">
import { Maximize2, Minimize2, Minus, X } from '@lucide/vue'

/**
 * Barra de título das janelas de terminal (research R8 da 004): o título e os controles minimizar,
 * maximizar e fechar, com os ícones `minus`, `maximize-2` e `x` do Lucide, centrados nos círculos
 * (feature 005, FR-022 a FR-024, research R9).
 *
 * - `decorative` (padrão): os três controles são desenho, num contêiner `aria-hidden` — é o HTML
 *   pré-renderizado, e o que fica sem JavaScript (FR-009).
 * - `functional`: `−` e `✕` viram botões com nome acessível que inclui o título (FR-001). Com
 *   `minimizable: false`, só o `✕` funciona. O terminal da dock minimiza desde a feature 007, com nomes
 *   próprios (`minimizeLabel`, `closeLabel`), porque o título dele é o prompt.
 *
 * O `□` (feature 006, FR-013, FR-025, research R9) tem três modos: `none` não existe (a porta de
 * acesso); `disabled` é desenho com aparência de desativado, sem hover (as janelas que não maximizam);
 * `on` é um botão que maximiza e restaura (as janelas de editor), e vira `disabled` no desenho
 * decorativo, porque sem JavaScript nada maximiza.
 */
export type MaximizeMode = 'none' | 'disabled' | 'on'

const props = withDefaults(
  defineProps<{
    title: string
    controls?: 'decorative' | 'functional'
    minimizable?: boolean
    maximize?: MaximizeMode
    /** Janela maximizada: o `□` vira "Restaurar". */
    maximized?: boolean
    /** Nome acessível do −; padrão "Minimizar <título>". */
    minimizeLabel?: string
    /** Nome acessível do ✕; padrão "Fechar <título>". */
    closeLabel?: string
  }>(),
  { controls: 'decorative', minimizable: true, maximize: 'disabled', maximized: false, minimizeLabel: undefined, closeLabel: undefined },
)

const emit = defineEmits<{ minimize: []; maximize: []; close: [] }>()
</script>

<template>
  <div class="terminal-bar">
    <span class="terminal-title mono">{{ title }}</span>
    <div v-if="props.controls === 'decorative'" class="t-controls" aria-hidden="true">
      <span class="t-btn t-min"><Minus class="t-icon" :size="12" :stroke-width="2.5" aria-hidden="true" /></span>
      <span v-if="props.maximize !== 'none'" class="t-btn t-max t-btn--disabled"><Maximize2 class="t-icon" :size="12" :stroke-width="2.5" aria-hidden="true" /></span>
      <span class="t-btn t-close"><X class="t-icon" :size="12" :stroke-width="2.5" aria-hidden="true" /></span>
    </div>
    <div v-else class="t-controls">
      <button
        v-if="props.minimizable"
        type="button"
        class="t-btn t-min"
        :aria-label="props.minimizeLabel ?? `Minimizar ${props.title}`"
        @click="emit('minimize')"
      >
        <Minus class="t-icon" :size="12" :stroke-width="2.5" aria-hidden="true" />
      </button>
      <span v-else class="t-btn t-min" aria-hidden="true"><Minus class="t-icon" :size="12" :stroke-width="2.5" aria-hidden="true" /></span>
      <button
        v-if="props.maximize === 'on'"
        type="button"
        class="t-btn t-max"
        :aria-label="`${props.maximized ? 'Restaurar' : 'Maximizar'} ${props.title}`"
        @click="emit('maximize')"
      >
        <Minimize2 v-if="props.maximized" class="t-icon" :size="12" :stroke-width="2.5" aria-hidden="true" />
        <Maximize2 v-else class="t-icon" :size="12" :stroke-width="2.5" aria-hidden="true" />
      </button>
      <span v-else-if="props.maximize === 'disabled'" class="t-btn t-max t-btn--disabled" aria-hidden="true"><Maximize2 class="t-icon" :size="12" :stroke-width="2.5" aria-hidden="true" /></span>
      <button
        type="button"
        class="t-btn t-close"
        :aria-label="props.closeLabel ?? `Fechar ${props.title}`"
        @click="emit('close')"
      >
        <X class="t-icon" :size="12" :stroke-width="2.5" aria-hidden="true" />
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
  line-height: 0;
  user-select: none;
  transition: filter 0.15s;
}

/* o ícone é simétrico no viewBox: em bloco, o centro dele cai no centro do círculo (FR-023, R9) */
.t-icon {
  display: block;
  width: 12px;
  height: 12px;
  flex: none;
}

/* botão de verdade: sem a aparência padrão; o desenho de 20px continua, e o alvo de clique sobe para
   24 × 24 px (WCAG 2.5.8) com uma área invisível em volta */
button.t-btn { cursor: pointer; }
button.t-btn:hover { filter: brightness(1.35); }
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

.t-close {
  background: var(--purple);
  border: 1px solid var(--purple-light);
  color: var(--on-purple);
}

/* □ das janelas que não maximizam: aparência de desativado, sem reação ao hover nem cursor de clique
   (feature 006, FR-025; componente desativado não precisa do contraste mínimo, WCAG 1.4.11) */
.t-btn--disabled {
  opacity: 0.35;
  filter: saturate(0.4);
  cursor: default;
}
</style>
