<script setup lang="ts">
import { inject, ref } from 'vue'
import { useTerminalTyping } from '@/composables/useTerminalTyping'
import TerminalBar from './TerminalBar.vue'
import { WINDOW_CONTROLS } from './window-controls'

/**
 * Janela de terminal. Com `animate` (padrão), digita os comandos ao entrar na tela (FR-025 da 002).
 * Dentro de um `DesktopWindow` (feature 004), `−` e `✕` funcionam depois de montar. Quem oferece o
 * maximizar nos controles (as janelas de editor, feature 006) ganha o `□` funcional; o resto, o `□`
 * desativado (`maximize="none"` tira o `□`: a porta de acesso).
 */
const props = withDefaults(defineProps<{ title: string; animate?: boolean; maximize?: 'none' | 'disabled' }>(), {
  animate: true,
  maximize: 'disabled',
})

const win = ref<HTMLElement | null>(null)
const body = ref<HTMLElement | null>(null)
const controls = inject(WINDOW_CONTROLS, null)
const typing = props.animate ? useTerminalTyping(win, body) : { complete() {}, replay() {}, prepare() {} }
controls?.register(typing)
</script>

<template>
  <div ref="win" class="terminal-window">
    <TerminalBar
      :title="title"
      :controls="controls?.mounted.value ? 'functional' : 'decorative'"
      :maximize="controls?.maximize ? 'on' : props.maximize"
      :maximized="controls?.maximize?.active.value ?? false"
      @minimize="controls?.minimize()"
      @maximize="controls?.maximize?.toggle()"
      @close="controls?.close()"
    />
    <div ref="body" class="terminal-body mono">
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

.terminal-body {
  padding: calc(var(--spacing) * 5.2) calc(var(--spacing) * 5.6);
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

@media (max-width: 760px) {
  .terminal-body { padding: calc(var(--spacing) * 4); font-size: 0.82rem; }
}
</style>
