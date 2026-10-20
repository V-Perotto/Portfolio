<script setup lang="ts">
import { computed } from 'vue'
import { onViewerClick } from '@/lib/image-viewer'
import type { ImageFile } from '@/types/resume'

/**
 * Figura que abre em tamanho real (feature 010, research R6; veio do `ProjectScreenshot` da 009): a
 * captura do DebianServer, a miniatura de cada certificado e a foto do 1º dia na Prime Control.
 *
 * - Um link para a versão em tamanho real (nova aba), com o `<img>` preguiçoso, a proporção reservada
 *   (`width`/`height` e `aspect-ratio` no link) e um aviso só para o leitor de tela.
 * - Com JavaScript, o clique sem modificador (e o Enter) abre o visualizador único da página
 *   (`ImageViewer`); com modificador, o navegador segue o link. Sem JavaScript, é só o link.
 * - `load = false` desenha só a caixa vazia, com a proporção: a janela de Certificados empilha os 61
 *   arquivos, e só a miniatura do arquivo aberto (e dos já vistos) é baixada (FR-009).
 */
const props = withDefaults(
  defineProps<{
    image: ImageFile
    /** Legenda visível, no estilo `# …` dos comentários (ausente nos certificados). */
    caption?: string
    /** Legenda do visualizador. */
    viewerCaption: string
    /** `sizes` do `<img>`. */
    sizes: string
    /** Aviso `.sr-only` dentro do link: '(abre o certificado em tamanho real)'. */
    openLabel: string
    load?: boolean
  }>(),
  { caption: undefined, load: true },
)

const url = (path: string) => `${import.meta.env.BASE_URL}${path}`
const srcset = computed(() => `${url(props.image.src)} ${props.image.srcWidth}w, ${url(props.image.full)} ${props.image.width}w`)
const onClick = (e: MouseEvent) => onViewerClick(e, props.image, props.viewerCaption)
</script>

<template>
  <figure class="zoom-figure">
    <a
      class="shot-link"
      :href="url(image.full)"
      target="_blank"
      rel="noopener noreferrer"
      :style="{ aspectRatio: `${image.width} / ${image.height}` }"
      @click="onClick"
    >
      <!-- `loading` antes de `src`: quando o Vue cria a imagem no cliente, aplica os atributos nesta ordem, e
           um `src` aplicado antes do `lazy` faria o navegador baixar a imagem na hora -->
      <img
        v-if="load"
        loading="lazy"
        decoding="async"
        :width="image.width"
        :height="image.height"
        :alt="image.alt"
        :sizes="sizes"
        :srcset="srcset"
        :src="url(image.src)"
      />
      <span class="sr-only">{{ load ? openLabel : `${image.alt} ${openLabel}` }}</span>
    </a>
    <figcaption v-if="caption" class="shot-caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.zoom-figure { margin: 0; }

/* a figura inteira, sem corte nem distorção: a largura de quem a usa e a altura da proporção */
.shot-link {
  display: block;
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  overflow: hidden;
  background: var(--surface-2);
  cursor: zoom-in;
  transition: border-color 0.15s;
}

.shot-link:hover { border-color: var(--purple-light); }

.shot-link img {
  display: block;
  width: 100%;
  height: auto;
}

/* legenda no estilo dos comentários `#` das janelas */
.shot-caption {
  margin: calc(var(--spacing) * 2) 0 0 0;
  /* em duas linhas, a quebra fica equilibrada (a data não se parte no fim) */
  text-wrap: balance;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.82rem;
}
</style>
