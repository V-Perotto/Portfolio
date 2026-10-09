<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import PromptLogo from '@/components/terminal/PromptLogo.vue'
import TerminalBar from '@/components/terminal/TerminalBar.vue'
import type { NavSection, SectionId } from '@/lib/sections'
import { complete, completeWith, run } from '@/lib/terminal'

/**
 * Janela do terminal da dock (feature 004, FR-019 a FR-025, research R7; contrato em
 * specs/004-dock-windows-crt/contracts/terminal-commands.md). Diálogo não modal: o foco não fica
 * preso, e a saída é um `role="log"` que o leitor de tela anuncia.
 *
 * O prompt é um <input> de verdade (edição, colar, seleção e teclado virtual nativos), com o cursor
 * nativo escondido; o bloco `▊` e o texto fantasma da conclusão são desenhados por cima, na posição
 * do cursor (fonte monoespaçada: 1 caractere = 1ch).
 */
const props = defineProps<{ sections: readonly NavSection[] }>()
const emit = defineEmits<{ close: []; goto: [id: SectionId] }>()

interface Line {
  kind: 'cmd' | 'out'
  text: string
}

const lines = ref<Line[]>([])
const value = ref('')
const caret = ref(0)
const scroll = ref(0)
const focused = ref(false)
const input = ref<HTMLInputElement | null>(null)
const log = ref<HTMLElement | null>(null)

const history: string[] = []
let historyIndex = 0
/** O que estava sendo digitado antes de percorrer o histórico. */
let draft = ''

const completion = computed(() => complete(value.value, props.sections))
/** O que falta da conclusão única, mostrado em cinza depois do texto (Tab ou → aceitam). */
const ghost = computed(() => {
  const { line, candidates } = completion.value
  return candidates.length === 1 && line.startsWith(value.value) ? line.slice(value.value.length) : ''
})
/** Sugestões tocáveis: só quando há o que escolher (FR-024, toque). */
const suggestions = computed(() => {
  const { line, candidates } = completion.value
  if (!value.value.trim() || !candidates.length) return []
  return candidates.length === 1 && line === value.value ? [] : candidates
})

const syncCaret = () => {
  const el = input.value
  if (!el) return
  caret.value = el.selectionStart ?? value.value.length
  scroll.value = el.scrollLeft
}

const scrollLogToEnd = () =>
  nextTick(() => {
    const el = log.value
    if (el) el.scrollTop = el.scrollHeight
  })

function setValue(next: string) {
  value.value = next
  nextTick(() => {
    const el = input.value
    if (!el) return
    el.setSelectionRange(next.length, next.length)
    el.scrollLeft = el.scrollWidth
    syncCaret()
  })
}

function execute() {
  const line = value.value
  lines.value.push({ kind: 'cmd', text: line })
  if (line.trim()) history.push(line)
  historyIndex = history.length
  draft = ''
  const { output, action } = run(line, props.sections)
  if (action.type === 'clear') lines.value = []
  lines.value.push(...output.map((text) => ({ kind: 'out' as const, text })))
  setValue('')
  scrollLogToEnd()
  if (action.type === 'exit') emit('close')
  else if (action.type === 'goto') emit('goto', action.id)
}

function onTab() {
  const { line, candidates } = completion.value
  if (line !== value.value) return setValue(line)
  if (candidates.length > 1) {
    lines.value.push({ kind: 'cmd', text: value.value }, { kind: 'out', text: candidates.join('  ') })
    scrollLogToEnd()
  }
}

function browseHistory(step: -1 | 1) {
  if (!history.length) return
  if (historyIndex === history.length) draft = value.value
  historyIndex = Math.min(history.length, Math.max(0, historyIndex + step))
  setValue(historyIndex === history.length ? draft : history[historyIndex]!)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    execute()
  } else if (e.key === 'Tab' && !e.shiftKey) {
    e.preventDefault()
    onTab()
  } else if (e.key === 'ArrowRight' && ghost.value && caret.value === value.value.length) {
    e.preventDefault()
    setValue(value.value + ghost.value)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    browseHistory(-1)
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    browseHistory(1)
  }
}

function pick(candidate: string) {
  setValue(completeWith(value.value, candidate))
  input.value?.focus()
}

function onDialogKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  e.preventDefault()
  emit('close')
}

defineExpose({
  focusInput: () => input.value?.focus(),
})
</script>

<template>
  <section id="dock-terminal" class="dock-terminal" role="dialog" aria-label="Terminal" @keydown="onDialogKeydown">
    <TerminalBar
      title="viper@portfolio: ~"
      controls="functional"
      :minimizable="false"
      close-label="Fechar terminal"
      @close="emit('close')"
    />
    <div ref="log" class="dt-body mono">
      <div class="dt-log" role="log" aria-live="polite">
        <p v-for="(line, i) in lines" :key="i" :class="['dt-line', `dt-${line.kind}`]">
          <template v-if="line.kind === 'cmd'"><PromptLogo :cursor="false" /> {{ line.text }}</template>
          <template v-else>{{ line.text }}</template>
        </p>
      </div>
      <div class="dt-prompt">
        <PromptLogo :cursor="false" aria-hidden="true" />
        <div class="dt-field">
          <label class="sr-only" for="dock-terminal-input">Comando</label>
          <input
            id="dock-terminal-input"
            ref="input"
            v-model="value"
            class="dt-input"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            enterkeyhint="send"
            @keydown="onKeydown"
            @input="syncCaret"
            @keyup="syncCaret"
            @click="syncCaret"
            @select="syncCaret"
            @scroll="syncCaret"
            @focus="focused = true; syncCaret()"
            @blur="focused = false"
          >
          <span class="dt-overlay" aria-hidden="true" :style="{ '--caret': caret, '--len': value.length, '--scroll': `${scroll}px` }">
            <span v-if="ghost" class="dt-ghost">{{ ghost }}</span>
            <span :class="['dt-cursor', { 'dt-cursor-idle': !focused }]">▊</span>
          </span>
        </div>
      </div>
      <div v-if="suggestions.length" class="dt-suggest" role="group" aria-label="Sugestões">
        <button v-for="candidate in suggestions" :key="candidate" type="button" class="dt-chip" @click="pick(candidate)">
          {{ candidate }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dock-terminal {
  display: flex;
  flex-direction: column;
  max-height: min(60svh, 28rem);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-window);
  overflow: hidden;
  box-shadow: 0 12px 48px color-mix(in srgb, var(--shadow) 60%, transparent), 0 0 0 1px color-mix(in srgb, var(--purple-light) 10%, transparent);
  transition: border-color 0.2s, box-shadow 0.2s;
}

/* o bloco ▊ mostra onde está o foco; a borda acende junto */
.dock-terminal:focus-within {
  border-color: var(--purple-light);
  box-shadow: 0 12px 48px color-mix(in srgb, var(--shadow) 60%, transparent), 0 0 24px color-mix(in srgb, var(--purple-light) 25%, transparent);
}

.dt-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: calc(var(--spacing) * 4) calc(var(--spacing) * 5);
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text);
}

.dt-line {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.dt-out { color: var(--text-dim); }
.dt-cmd { color: var(--text); }

.dt-prompt {
  display: flex;
  align-items: baseline;
  gap: 1ch;
}

.dt-field {
  position: relative;
  flex: 1;
  min-width: 0;
}

.dt-input {
  width: 100%;
  font: inherit;
  color: var(--text);
  background: transparent;
  border: 0;
  padding: 0;
  outline: none;
  caret-color: transparent;
}

/* o foco é mostrado pelo bloco ▊ e pela borda da janela, não pelo contorno do campo */
.dt-input:focus-visible { outline: none; }

.dt-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  white-space: pre;
  overflow: hidden;
}

.dt-ghost {
  position: absolute;
  left: calc(var(--len) * 1ch - var(--scroll));
  color: var(--text-dim);
}

.dt-cursor {
  position: absolute;
  left: calc(var(--caret) * 1ch - var(--scroll));
  color: var(--green-bright);
  animation: blink 1.1s steps(1) infinite;
}

.dt-cursor-idle {
  animation: none;
  opacity: 0.45;
}

.dt-suggest {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
  margin-top: calc(var(--spacing) * 2.4);
}

.dt-chip {
  font: inherit;
  font-size: 0.8rem;
  color: var(--green-bright);
  background: color-mix(in srgb, var(--green) 15%, transparent);
  border: 1px solid var(--green);
  border-radius: var(--radius-nav);
  padding: calc(var(--spacing) * 1) calc(var(--spacing) * 2.4);
  min-height: 24px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.dt-chip:hover,
.dt-chip:focus-visible {
  background: var(--green);
  color: var(--on-green);
}

html:not(.motion) .dt-cursor { animation: none; }

@media (max-width: 760px) {
  .dt-body { padding: calc(var(--spacing) * 3.2); font-size: 0.82rem; }
}
</style>
