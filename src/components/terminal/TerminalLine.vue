<script setup lang="ts">
/**
 * `$ comando` (padrão) ou uma linha de saída (`output`), como em um terminal.
 * A linha de comando leva `data-t-cmd`: é ela que a janela digita ao entrar na tela (FR-025, research
 * R6 da 002). O texto real fica sempre em `.t-cmd`; a sobreposição que digita é criada pelo
 * useTerminalTyping, nunca pelo Vue, então o HTML pré-renderizado é o texto completo.
 */
withDefaults(defineProps<{ output?: boolean; tag?: string }>(), { output: false, tag: 'p' })
</script>

<template>
  <component :is="tag" v-if="output" class="t-output"><slot /></component>
  <component :is="tag" v-else class="t-line" data-t-cmd><span class="t-cmd"><span class="prompt-dollar" aria-hidden="true">$ </span><slot /></span></component>
</template>

<style scoped>
/* o comando fica em Dim Lilac, a cor dos comentários `#` (FR-004 da 003): é contexto, e o conteúdo da
   janela é o destaque. O `$` e trechos com classe própria (.hl-green) mantêm a cor; a cópia que digita
   (.t-typed) é filha da linha e já nasce nesta cor (FR-005) */
.t-line { color: var(--text-dim); margin-bottom: calc(var(--spacing) * 2); }

.t-output {
  color: var(--text-dim);
  margin: 0 0 calc(var(--spacing) * 4) 0;
  white-space: pre-line;
}
</style>
