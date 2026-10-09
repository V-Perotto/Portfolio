<script setup lang="ts">
import type { EditorFolder } from '@/lib/editor-files'
import DesktopWindow from './DesktopWindow.vue'
import EditorFrame from './EditorFrame.vue'

/**
 * Janela de editor de Experiência, Challenges e Comunitário (feature 006, FR-001 a FR-019, research
 * R1): uma janela de área de trabalho (minimiza e fecha até o ícone de pasta de código, 004) com o
 * editor dentro. O editor fica num componente à parte (`EditorFrame`) porque ele recebe os controles
 * do `DesktopWindow` e os repassa ao terminal com o maximizar (um `provide` daqui não chegaria ao slot).
 */
defineProps<{ folder: EditorFolder }>()
</script>

<template>
  <DesktopWindow class="editor-window" :title="folder.path" kind="project" :data-editor="folder.label">
    <EditorFrame :folder="folder">
      <template #cards><slot name="cards" /></template>
    </EditorFrame>
  </DesktopWindow>
</template>
