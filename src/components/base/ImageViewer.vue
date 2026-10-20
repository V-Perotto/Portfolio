<script setup lang="ts">
import { X } from '@lucide/vue'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { canAnimate, FLIP_EASING } from '@/lib/flip'
import { viewerReady, viewerRequest, type ViewerRequest } from '@/lib/image-viewer'

/**
 * O visualizador de imagem único da página (feature 010, research R7; contracts/certificates-window.md §5),
 * com o comportamento do visualizador da captura da 009 (FR-018 e SC-009 de lá): um `<dialog>` modal
 * nativo, que deixa o resto da página inerte e prende o foco; o `html` ganha a classe `window-maximized`, a
 * da janela maximizada (a página não rola e o Ctrl+Alt+T da dock não abre o terminal por cima). Esc, o ✕ e
 * o clique no fundo fecham, e o foco volta a quem abriu.
 *
 * - Montado uma vez, no `App.vue`, e levado ao `<body>` (fora do `#app`): a janela de editor maximizada
 *   torna o `#app` inerte, e um diálogo dentro dele ficaria inerte também.
 * - Só existe depois da hidratação: sem JavaScript e na impressão, as figuras são links para a imagem.
 * - Aberto por cima da janela maximizada, só tira a classe `window-maximized` ao fechar se foi ele que a
 *   pôs: a janela continua maximizada, com a página travada por trás.
 */

/** Duração de abrir e de fechar (SC-009 da 009: no máximo 400 ms cada). */
const VIEWER_MS = 200

const url = (path: string) => `${import.meta.env.BASE_URL}${path}`

const hydrated = ref(false)
const dialog = ref<HTMLDialogElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
/** O pedido em exibição: fica até o diálogo terminar de fechar (a imagem não some no meio da animação). */
const shown = ref<ViewerRequest | null>(null)
let closing: Animation | null = null
/** A posição da página ao abrir: fechar volta a ela (o bloqueio da rolagem pode mexer no layout por trás). */
let savedScrollY = 0
/** A classe `window-maximized` já estava no `html` (janela maximizada por baixo). */
let wasLocked = false

onMounted(() => {
  hydrated.value = true
  viewerReady.value = true
})

const root = () => document.documentElement

async function open(request: ViewerRequest) {
  closing?.cancel()
  closing = null
  shown.value = request
  await nextTick()
  const el = dialog.value
  if (!el || typeof el.showModal !== 'function') return
  if (el.open) return
  // sem foco no gatilho ao abrir: ao fechar, o diálogo devolveria o foco a ele rolando a página até ele
  // (no celular, ele pode estar só em parte na tela); quem devolve o foco, sem rolar, é o onClosed
  ;(document.activeElement as HTMLElement | null)?.blur()
  savedScrollY = window.scrollY
  wasLocked = root().classList.contains('window-maximized')
  el.showModal()
  root().classList.add('window-maximized')
  await nextTick()
  closeButton.value?.focus({ preventScroll: true })
  if (canAnimate()) {
    el.animate([{ opacity: 0, transform: 'scale(0.96)' }, { opacity: 1, transform: 'none' }], {
      duration: VIEWER_MS,
      easing: FLIP_EASING,
    })
  }
}

watch(viewerRequest, (request) => {
  if (request) void open(request)
})

function close() {
  const el = dialog.value
  if (!el?.open || closing) return
  if (!canAnimate()) return el.close()
  closing = el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(0.96)' }], {
    duration: VIEWER_MS,
    easing: FLIP_EASING,
    fill: 'forwards',
  })
  closing.finished
    .then(() => {
      el.close()
    })
    .catch(() => {
      // cancelada por uma nova abertura: o diálogo continua aberto
    })
}

/** Esc: o diálogo fecha pelo mesmo caminho do ✕ (com a animação). */
function onCancel(e: Event) {
  e.preventDefault()
  close()
}

/** O diálogo cobre a tela inteira: um clique nele mesmo (não na imagem, na legenda ou no ✕) é o fundo. */
function onBackdrop(e: MouseEvent) {
  if (e.target === dialog.value) close()
}

function onClosed() {
  closing?.cancel()
  closing = null
  if (!wasLocked) root().classList.remove('window-maximized')
  // no celular, a página travada (`overflow: hidden`) muda de layout por trás do fundo, e a ancoragem de
  // rolagem do navegador não volta ao mesmo ponto: a página volta à posição de quando abriu
  if (!wasLocked) window.scrollTo({ top: savedScrollY, behavior: 'instant' })
  const trigger = shown.value?.trigger
  viewerRequest.value = null
  trigger?.focus({ preventScroll: true })
}

onBeforeUnmount(() => {
  viewerReady.value = false
  if (dialog.value?.open) dialog.value.close()
})
</script>

<template>
  <Teleport v-if="hydrated" to="body">
    <dialog
      ref="dialog"
      class="shot-viewer"
      aria-labelledby="image-viewer-caption"
      @cancel="onCancel"
      @click="onBackdrop"
      @close="onClosed"
    >
      <template v-if="shown">
        <img
          class="shot-full"
          decoding="async"
          :width="shown.image.width"
          :height="shown.image.height"
          :alt="shown.image.alt"
          :src="url(shown.image.full)"
          :style="{ maxWidth: `min(${shown.image.width}px, 100%)` }"
        />
        <p id="image-viewer-caption" class="shot-caption">{{ shown.caption }}</p>
      </template>
      <button ref="closeButton" type="button" class="shot-close" aria-label="Fechar a imagem" @click="close">
        <X :size="20" :stroke-width="2.5" aria-hidden="true" />
      </button>
    </dialog>
  </Teleport>
</template>

<style scoped>
/* cobre a tela inteira: o clique fora da imagem cai no próprio diálogo, que é o "fundo" */
.shot-viewer {
  width: 100vw;
  max-width: 100vw;
  height: 100dvh;
  max-height: 100dvh;
  margin: 0;
  padding: 1rem;
  border: 0;
  background: transparent;
  color: var(--text);
  overflow: hidden;
}

.shot-viewer[open] {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: calc(var(--spacing) * 2);
}

/* o mesmo fundo da janela maximizada (escurecido e desfocado) */
.shot-viewer::backdrop {
  background: var(--maximize-scrim);
  /* só a propriedade sem prefixo: o minificador do build gera o `-webkit-`; escrita ao lado dela, ele
     descartava a sem prefixo, e o Chromium ficava sem o desfoque (achado na feature 009) */
  backdrop-filter: blur(var(--maximize-blur));
}

html.motion .shot-viewer[open]::backdrop { animation: shot-backdrop-in 0.2s ease both; }

@keyframes shot-backdrop-in {
  from { opacity: 0; }
}

/* inteira, sem rolagem: cabe na largura e deixa lugar para a legenda e o ✕ (SC-009 da 009) */
.shot-full {
  display: block;
  width: auto;
  height: auto;
  max-height: calc(100dvh - 7rem);
  object-fit: contain;
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
}

/* legenda no estilo dos comentários `#` das janelas */
.shot-caption {
  margin: 0;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  text-align: center;
  overflow-wrap: anywhere;
}

/* alvo de toque de 44 × 44 px (FR-018 da 009) */
.shot-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  padding: 0;
  border-radius: 50%;
  background: var(--purple);
  border: 1px solid var(--purple-light);
  color: var(--on-purple);
  cursor: pointer;
  transition: filter 0.15s;
}

.shot-close:hover { filter: brightness(1.35); }

@media print {
  .shot-viewer { display: none; }
}
</style>
