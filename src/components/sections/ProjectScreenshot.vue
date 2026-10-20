<script setup lang="ts">
import ZoomFigure from '@/components/base/ZoomFigure.vue'
import { formatYearMonth } from '@/lib/period'
import type { Screenshot } from '@/types/resume'

/**
 * Captura de tela como evidência de projeto (feature 009, FR-015 a FR-019, research R5 e R7;
 * contracts/debianserver-window.md §1 e §2): a 4ª exceção do Princípio II (v3.1.0), infraestrutura
 * pessoal sem acesso público.
 *
 * - Na janela: a versão de 800 px (ou a de tamanho real, pelo `srcset`), preguiçosa, com a proporção
 *   reservada, dentro de um link para a de tamanho real, e a legenda datada.
 * - Com JavaScript, o link abre o visualizador da página. Feature 010 (research R7): o `<dialog>` que
 *   ficava aqui virou o visualizador único (`ImageViewer`, no `<body>`), que também serve às miniaturas
 *   dos certificados e à foto da Prime Control; a figura é o `ZoomFigure`. O comportamento não mudou.
 * - Sem JavaScript (e na impressão), não há diálogo: o link abre a imagem em nova aba.
 */
const props = defineProps<{ shot: Screenshot; id: string }>()

const caption = `# ${props.shot.caption} · ${formatYearMonth(props.shot.captured)}`
</script>

<template>
  <ZoomFigure
    class="project-shot"
    :data-shot="id"
    :image="shot"
    :caption="caption"
    :viewer-caption="caption"
    sizes="(min-width: 900px) 24rem, calc(100vw - 4rem)"
    open-label="(abre a captura em tamanho real)"
  />
</template>

<style scoped>
.project-shot { margin: 0 0 calc(var(--spacing) * 4) 0; }
</style>
