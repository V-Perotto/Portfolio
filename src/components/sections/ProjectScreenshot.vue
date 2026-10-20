<script setup lang="ts">
import { X } from '@lucide/vue'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { canAnimate, FLIP_EASING } from '@/lib/flip'
import { formatYearMonth } from '@/lib/period'
import type { Screenshot } from '@/types/resume'

/**
 * Captura de tela como evidência de projeto (feature 009, FR-015 a FR-019, research R5 e R7;
 * contracts/debianserver-window.md §1 e §2): a 4ª exceção do Princípio II (v3.1.0), infraestrutura
 * pessoal sem acesso público.
 *
 * - Na janela: a versão de 800 px (ou a de tamanho real, pelo `srcset`), preguiçosa, com a proporção
 *   reservada (`width`/`height`), dentro de um link para a de tamanho real, e a legenda datada.
 * - Com JavaScript, o link abre um visualizador na própria página (clarify): um `<dialog>` modal nativo,
 *   que deixa o resto da página inerte e prende o foco; o `html` ganha a classe `window-maximized`, a da
 *   janela maximizada (a página não rola e o Ctrl+Alt+T da dock não abre o terminal por cima). Esc, o ✕
 *   e o clique no fundo fecham, e o foco volta ao link. Clique com modificador segue o link (nova aba).
 * - Sem JavaScript (e na impressão), não há diálogo: o link abre a imagem em nova aba. O diálogo só
 *   existe depois da hidratação, então o HTML pré-renderizado não repete a imagem.
 */
const props = defineProps<{ shot: Screenshot; id: string }>()

const url = (path: string) => `${import.meta.env.BASE_URL}${path}`
const caption = `# ${props.shot.caption} · ${formatYearMonth(props.shot.captured)}`
const captionId = `shot-viewer-caption-${props.id}`

/** Duração de abrir e de fechar (SC-009: no máximo 400 ms cada). */
const VIEWER_MS = 200

const hydrated = ref(false)
const link = ref<HTMLAnchorElement | null>(null)
const dialog = ref<HTMLDialogElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
let closing: Animation | null = null
/** A posição da página ao abrir: fechar volta a ela (o bloqueio da rolagem pode mexer no layout por trás). */
let savedScrollY = 0

onMounted(() => (hydrated.value = true))

function lockPage(on: boolean) {
  document.documentElement.classList.toggle('window-maximized', on)
}

async function onClick(e: MouseEvent) {
  // Ctrl/⌘/Shift/Alt ou outro botão: o navegador abre a imagem como abriria qualquer link
  if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return
  const el = dialog.value
  if (!el || typeof el.showModal !== 'function') return
  e.preventDefault()
  if (el.open) return
  closing?.cancel()
  closing = null
  // sem foco no link ao abrir: ao fechar, o diálogo devolveria o foco a ele rolando a página até ele
  // (no celular, o link pode estar só em parte na tela); quem devolve o foco, sem rolar, é o onClosed
  ;(document.activeElement as HTMLElement | null)?.blur()
  savedScrollY = window.scrollY
  el.showModal()
  lockPage(true)
  await nextTick()
  closeButton.value?.focus({ preventScroll: true })
  if (canAnimate()) {
    el.animate([{ opacity: 0, transform: 'scale(0.96)' }, { opacity: 1, transform: 'none' }], {
      duration: VIEWER_MS,
      easing: FLIP_EASING,
    })
  }
}

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
  lockPage(false)
  // no celular, a página travada (`overflow: hidden`) muda de layout por trás do fundo, e a ancoragem de
  // rolagem do navegador não volta ao mesmo ponto: a página volta à posição de quando abriu
  window.scrollTo({ top: savedScrollY, behavior: 'instant' })
  link.value?.focus({ preventScroll: true })
}

onBeforeUnmount(() => {
  if (dialog.value?.open) dialog.value.close()
  lockPage(false)
})
</script>

<template>
  <figure class="project-shot">
    <a ref="link" class="shot-link" :href="url(shot.full)" target="_blank" rel="noopener noreferrer" @click="onClick">
      <!-- `loading` antes de `src`: quando o Vue cria a imagem no cliente, aplica os atributos nesta ordem, e
           um `src` aplicado antes do `lazy` faria o navegador baixar a imagem na hora -->
      <img
        loading="lazy"
        decoding="async"
        :width="shot.width"
        :height="shot.height"
        :alt="shot.alt"
        sizes="(min-width: 900px) 24rem, calc(100vw - 4rem)"
        :srcset="`${url(shot.src)} ${shot.srcWidth}w, ${url(shot.full)} ${shot.width}w`"
        :src="url(shot.src)"
      />
      <span class="sr-only">(abre a captura em tamanho real)</span>
    </a>
    <figcaption class="shot-caption">{{ caption }}</figcaption>
  </figure>
  <dialog
    v-if="hydrated"
    ref="dialog"
    class="shot-viewer"
    :aria-labelledby="captionId"
    @cancel="onCancel"
    @click="onBackdrop"
    @close="onClosed"
  >
    <!-- preguiçosa: com o diálogo fechado ela não aparece e não é baixada; só ao abrir (SC-003) -->
    <img class="shot-full" loading="lazy" decoding="async" :width="shot.width" :height="shot.height" :alt="shot.alt" :src="url(shot.full)" />
    <p :id="captionId" class="shot-caption">{{ caption }}</p>
    <button ref="closeButton" type="button" class="shot-close" aria-label="Fechar a captura" @click="close">
      <X :size="20" :stroke-width="2.5" aria-hidden="true" />
    </button>
  </dialog>
</template>

<style scoped>
.project-shot { margin: 0 0 calc(var(--spacing) * 4) 0; }

/* a figura inteira, sem corte nem distorção: a largura da coluna e a altura da proporção (FR-015) */
.shot-link {
  display: block;
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  overflow: hidden;
  cursor: zoom-in;
  transition: border-color 0.15s;
}

.shot-link:hover { border-color: var(--purple-light); }

.shot-link img {
  display: block;
  width: 100%;
  height: auto;
}

/* legenda no estilo dos comentários `#` das janelas (FR-016) */
.shot-caption {
  margin: calc(var(--spacing) * 2) 0 0 0;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.82rem;
}

/* ---------- visualizador (research R7) ---------- */

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

/* inteira, sem rolagem: cabe na largura e deixa lugar para a legenda e o ✕ (SC-009) */
.shot-full {
  display: block;
  width: auto;
  height: auto;
  max-width: min(1396px, 100%);
  max-height: calc(100dvh - 7rem);
  object-fit: contain;
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
}

.shot-viewer .shot-caption { margin: 0; text-align: center; }

/* alvo de toque de 44 × 44 px (FR-018) */
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
