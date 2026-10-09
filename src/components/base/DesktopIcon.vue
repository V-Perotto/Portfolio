<script setup lang="ts">
import { FileTerminal, FileText, FolderCode } from '@lucide/vue'
import { ref } from 'vue'

/**
 * "Arquivo da área de trabalho": quadrado com o ícone do tipo de arquivo e o título embaixo (FR-002 da
 * 004). É o ícone das janelas minimizadas ou fechadas (`DesktopWindow`) e o da porta de acesso
 * `acessar_portfolio.sh` (feature 005, research R1). Um clique (ou toque, Enter, Espaço) abre.
 */
export type DesktopIconKind = 'document' | 'script' | 'project'

const props = defineProps<{
  title: string
  kind: DesktopIconKind
  /** id do texto que descreve a ação (a dica da porta de acesso). */
  describedby?: string
}>()

const ICONS = { document: FileText, script: FileTerminal, project: FolderCode } as const

const button = ref<HTMLButtonElement | null>(null)
const square = ref<HTMLElement | null>(null)

// o FLIP de quem usa o ícone mede o quadrado; o foco vai para o botão
defineExpose({ button, square })
</script>

<template>
  <button
    ref="button"
    type="button"
    class="desktop-icon"
    :aria-label="`Abrir ${props.title}`"
    :aria-describedby="props.describedby"
  >
    <span ref="square" class="desktop-icon-square">
      <component :is="ICONS[props.kind]" class="desktop-icon-glyph" aria-hidden="true" />
    </span>
    <span class="desktop-icon-label mono">{{ props.title }}</span>
  </button>
</template>

<style scoped>
.desktop-icon {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  width: calc(var(--desktop-icon-size) + 2.5rem);
  padding: calc(var(--spacing) * 1.6);
  color: var(--text);
  background: none;
  border: 1px solid transparent;
  border-radius: var(--radius-card);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.desktop-icon-square {
  display: grid;
  place-items: center;
  width: var(--desktop-icon-size);
  height: var(--desktop-icon-size);
  color: var(--green-bright);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: 0 8px 28px color-mix(in srgb, var(--shadow) 45%, transparent);
  transition: border-color 0.2s, box-shadow 0.2s, color 0.2s;
}

.desktop-icon-glyph {
  width: 2.5rem;
  height: 2.5rem;
}

.desktop-icon-label {
  max-width: 100%;
  font-size: 0.8rem;
  line-height: 1.35;
  text-align: center;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.desktop-icon:hover,
.desktop-icon:focus-visible {
  background: color-mix(in srgb, var(--purple) 22%, transparent);
  border-color: color-mix(in srgb, var(--purple-light) 45%, transparent);
}

.desktop-icon:hover .desktop-icon-square,
.desktop-icon:focus-visible .desktop-icon-square {
  border-color: var(--purple-light);
  color: var(--purple-glow);
  box-shadow: 0 8px 28px color-mix(in srgb, var(--shadow) 45%, transparent), 0 0 20px color-mix(in srgb, var(--purple-light) 30%, transparent);
}
</style>
