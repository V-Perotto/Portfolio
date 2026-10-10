<script setup lang="ts">
import { FileCode } from '@lucide/vue'
import { computed, inject, nextTick, onBeforeUnmount, onMounted, provide, readonly, ref } from 'vue'
import BaseCard from '@/components/base/BaseCard.vue'
import ExternalLink from '@/components/base/ExternalLink.vue'
import BranchedMenu from '@/components/vendor/vue-bits/BranchedMenu.vue'
import type { EditorFolder } from '@/lib/editor-files'
import { canAnimate, finishAll, FLIP_EASING, FLIP_MS, toward } from '@/lib/flip'
import TerminalLine from './TerminalLine.vue'
import TerminalWindow from './TerminalWindow.vue'
import { WINDOW_CONTROLS } from './window-controls'

/**
 * O editor das janelas de Experiência, Challenges, Comunitário e Educação (feature 006, research R1–R5;
 * contracts/editor-window.md; a Educação entrou na feature 008). Dentro do `DesktopWindow` (via `EditorWindow`):
 *
 * - O terminal digita `code <pasta>` e o editor é a saída do comando (clarify): abas, a árvore de
 *   arquivos (Branched Menu, radius 0), o arquivo YAML aberto, com números de linha, e o rodapé.
 * - Três visões no mesmo HTML (R2): com JS, o arquivo aberto (`data-editor-view="file"`); maximizada,
 *   a árvore e os cartões de hoje (`cards`); sem JS e na impressão, só os cartões (CSS). Os arquivos
 *   ficam empilhados na mesma célula, os fechados invisíveis: a janela tem a altura do maior e não
 *   muda ao trocar de arquivo (FR-004).
 * - Maximizar (R5): o quadro vai para o `<body>` por Teleport, sem remontar, e cobre ~95% da tela; o
 *   lugar dele na página guarda a altura; a página fica desfocada e inerte (`#app[inert]`), sem rolar
 *   (`html.window-maximized`); o foco fica no quadro (laço de Tab); Esc, o `□` e o clique no fundo
 *   restauram. Minimizar ou fechar maximizada restaura antes (FR-018).
 */
const props = defineProps<{ folder: EditorFolder }>()

const parent = inject(WINDOW_CONTROLS, null)

const activeId = ref(props.folder.files[0]?.id ?? '')
const maximized = ref(false)
/**
 * No HTML pré-renderizado, só o 1º arquivo (o aberto): sem JS, quem aparece são os cartões, e os
 * arquivos YAML só pesariam (~6 KB comprimidos, research R17); com JS, os outros entram na montagem.
 */
const hydrated = ref(false)
const files = computed(() => (hydrated.value ? props.folder.files : props.folder.files.slice(0, 1)))
const placeholderHeight = ref<number | null>(null)

const slot = ref<HTMLElement | null>(null)
const frame = ref<HTMLElement | null>(null)
const cards = ref<HTMLElement | null>(null)

const active = computed(() => props.folder.files.find((f) => f.id === activeId.value) ?? props.folder.files[0])
const tree = computed(() => [
  {
    label: `${props.folder.label}/`,
    children: props.folder.files.map((file) => ({ value: file.id, label: file.name, icon: FileCode })),
  },
])

let running: Animation[] = []
let token = 0
const root = () => document.documentElement
const app = () => document.getElementById('app')

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusables(): HTMLElement[] {
  return [...(frame.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter((el) => el.getClientRects().length > 0)
}

// sem rolar: a página fica onde estava (ao restaurar, a janela ainda pode estar no meio da animação)
const focusMax = () => frame.value?.querySelector<HTMLButtonElement>('button.t-max')?.focus({ preventScroll: true })

/** Maximizada, o diálogo: Esc restaura; o Tab circula dentro do quadro (FR-017). */
function onKeydown(e: KeyboardEvent) {
  if (!maximized.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    void restore()
    return
  }
  if (e.key !== 'Tab') return
  const items = focusables()
  if (!items.length) return
  const first = items[0]!
  const last = items[items.length - 1]!
  const current = document.activeElement as HTMLElement | null
  const inside = !!current && !!frame.value?.contains(current)
  if (e.shiftKey && (current === first || !inside)) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && (current === last || !inside)) {
    e.preventDefault()
    first.focus()
  }
}

function lockPage(on: boolean) {
  root().classList.toggle('window-maximized', on)
  const el = app()
  if (el) el.inert = on
  if (on) document.addEventListener('keydown', onKeydown, true)
  else document.removeEventListener('keydown', onKeydown, true)
}

function flip(first: DOMRect) {
  const el = frame.value
  if (!el || !canAnimate()) return
  const last = el.getBoundingClientRect()
  running = [
    el.animate([{ transform: toward(last, first) }, { transform: 'none' }], { duration: FLIP_MS, easing: FLIP_EASING }),
  ]
}

async function maximize() {
  if (maximized.value || !frame.value || !slot.value) return
  finishAll(running)
  const mine = ++token
  const first = frame.value.getBoundingClientRect()
  placeholderHeight.value = slot.value.offsetHeight
  maximized.value = true
  lockPage(true)
  await nextTick()
  if (mine !== token) return
  flip(first)
  focusMax()
  // a lista de cartões já abre no item aberto (FR-016)
  revealCard(activeId.value, false)
}

/** Volta ao lugar na página; `animate: false` quando vem de minimizar ou fechar (FR-018). */
async function restore(animate = true) {
  if (!maximized.value) return
  finishAll(running)
  const mine = ++token
  const first = frame.value?.getBoundingClientRect()
  maximized.value = false
  lockPage(false)
  await nextTick()
  placeholderHeight.value = null
  if (mine !== token) return
  if (animate && first) flip(first)
  focusMax()
}

const toggle = () => (maximized.value ? restore() : maximize())

provide(WINDOW_CONTROLS, {
  mounted: parent?.mounted ?? readonly(ref(false)),
  register: (typing) => parent?.register(typing),
  minimize: () => void restore(false).then(() => parent?.minimize()),
  close: () => void restore(false).then(() => parent?.close()),
  maximize: { active: readonly(maximized), toggle: () => void toggle() },
  exposeMaximize: parent?.exposeMaximize,
})

// o comando `open` do terminal da dock maximiza esta janela pelo registro do DesktopWindow (feature 007)
parent?.exposeMaximize?.(() => maximize())

/** Maximizada, rola a lista até o cartão do item, se o título dele não estiver à vista (FR-016). */
function revealCard(id: string, glide = true) {
  const list = cards.value
  const card = list?.querySelector<HTMLElement>(`[data-card-id="${CSS.escape(id)}"]`)
  if (!list || !card) return
  const box = list.getBoundingClientRect()
  const title = (card.querySelector<HTMLElement>('h3, h4') ?? card).getBoundingClientRect()
  if (title.top >= box.top && title.bottom <= box.bottom) return
  const smooth = glide && root().classList.contains('motion')
  list.scrollTo({ top: list.scrollTop + card.getBoundingClientRect().top - box.top - 16, behavior: smooth ? 'smooth' : 'instant' })
}

function select(id: string) {
  activeId.value = id
  if (maximized.value) revealCard(id)
}

onMounted(() => {
  hydrated.value = true
})

onBeforeUnmount(() => {
  finishAll(running)
  if (maximized.value) lockPage(false)
})
</script>

<template>
  <div ref="slot" class="editor-slot" :style="placeholderHeight ? { height: `${placeholderHeight}px` } : undefined">
    <Teleport to="body" :disabled="!maximized">
      <div v-if="maximized" class="maximize-backdrop" aria-hidden="true" @click="restore()" />
      <div
        ref="frame"
        :class="['editor-frame', { 'is-maximized': maximized }]"
        :data-editor-view="maximized ? 'cards' : 'file'"
        :role="maximized ? 'dialog' : undefined"
        :aria-modal="maximized ? 'true' : undefined"
        :aria-label="maximized ? `${folder.path} (maximizada)` : undefined"
      >
        <BaseCard variant="window">
          <TerminalWindow :title="folder.path">
            <TerminalLine>code {{ folder.path }}</TerminalLine>
            <div class="editor">
              <div class="editor-tabs" aria-hidden="true">
                <span class="editor-tab is-active">{{ active?.name }}</span>
              </div>
              <div class="editor-tree">
                <BranchedMenu
                  :items="tree"
                  :active="activeId"
                  :aria-label="`Arquivos de ${folder.path}`"
                  :radius="0"
                  :width="300"
                  color="var(--text)"
                  accent-color="var(--green-bright)"
                  line-color="var(--tree-line)"
                  muted-color="var(--text-dim)"
                  @select="select"
                />
              </div>
              <div class="editor-pane">
                <div class="editor-files">
                  <article
                    v-for="file in files"
                    :key="file.id"
                    class="editor-file"
                    :data-file-id="file.id"
                    :data-active="file.id === activeId ? '' : undefined"
                    :aria-label="file.name"
                  >
                    <ol class="editor-lines">
                      <li v-for="(line, n) in file.lines" :key="n" class="editor-line">
                        <span class="editor-ln" aria-hidden="true">{{ n + 1 }}</span>
                        <span :class="['editor-code', `editor-indent-${line.indent}`]"><template v-for="(tok, k) in line.tokens" :key="k"><ExternalLink v-if="tok.kind === 'link' && tok.href" class="tok tok-link" :href="tok.href">{{ tok.text }}</ExternalLink><span v-else :class="['tok', `tok-${tok.kind}`]">{{ tok.text }}</span></template></span>
                      </li>
                    </ol>
                  </article>
                </div>
                <!-- maximizada, a lista rola por dentro: vira uma região focável, para rolar pelo teclado mesmo
                     quando os cartões não têm links (Experiência; axe scrollable-region-focusable, feature 007) -->
                <div
                  ref="cards"
                  class="editor-cards"
                  :tabindex="maximized ? 0 : undefined"
                  :role="maximized ? 'region' : undefined"
                  :aria-label="maximized ? `Cartões de ${folder.path}` : undefined"
                >
                  <slot name="cards" />
                </div>
              </div>
              <footer class="editor-footer mono">
                <span class="editor-path">{{ active?.path }}</span>
                <span class="editor-pos">{{ active?.position }} / {{ active?.total }}</span>
              </footer>
            </div>
          </TerminalWindow>
        </BaseCard>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.editor-frame { transform-origin: top left; }

/* ---------- editor ---------- */

.editor {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas:
    "tabs tabs"
    "tree pane"
    "foot foot";
  margin-top: calc(var(--spacing) * 1.6);
  background: var(--editor-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  overflow: hidden;
}

.editor-tabs {
  grid-area: tabs;
  display: flex;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
  font-size: 0.8rem;
}

.editor-tab {
  padding: calc(var(--spacing) * 2.4) calc(var(--spacing) * 4);
  color: var(--text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.editor-tab.is-active {
  color: var(--text);
  background: var(--editor-bg);
  box-shadow: inset 0 -1px 0 var(--green-bright);
}

.editor-tree {
  grid-area: tree;
  min-width: 0;
  padding: calc(var(--spacing) * 3) calc(var(--spacing) * 3) calc(var(--spacing) * 3) calc(var(--spacing) * 4);
  border-right: 1px solid var(--border);
  overflow-x: auto;
}

/* no celular, o nome que não cabe termina em reticências, como no explorer do VS Code, em vez de ser cortado
   no meio da letra pelo `overflow: hidden` da dobra do Branched Menu; o nome inteiro continua no texto do
   botão (nome acessível) e no rodapé (feature 008, FR-020, research R13) */
.editor-tree :deep(.bm-label) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.editor-pane {
  grid-area: pane;
  min-width: 0;
  display: grid;
}

/* todos os arquivos na mesma célula: a altura é a do maior; os fechados ficam invisíveis (e fora da
   árvore de acessibilidade) */
.editor-files {
  display: grid;
  padding: calc(var(--spacing) * 3) 0;
}

.editor-file { grid-area: 1 / 1; min-width: 0; }
.editor-file:not([data-active]) { visibility: hidden; }

.editor-lines {
  list-style: none;
  font-size: 0.85rem;
  line-height: 1.7;
}

.editor-line {
  display: grid;
  grid-template-columns: 3.2ch minmax(0, 1fr);
  column-gap: calc(var(--spacing) * 3);
  padding-right: calc(var(--spacing) * 4);
}

.editor-ln {
  color: var(--editor-gutter);
  text-align: right;
  user-select: none;
}

/* linhas longas quebram com recuo: a continuação fica 2 colunas para dentro */
.editor-code {
  min-width: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  padding-left: 2ch;
  text-indent: -2ch;
}

.editor-code.editor-indent-1 { padding-left: 4ch; }

.tok-key { color: var(--syntax-key); }
.tok-str { color: var(--syntax-str); }
.tok-date { color: var(--syntax-date); }
.tok-punct { color: var(--syntax-punct); }
.tok-comment { color: var(--syntax-comment); font-style: italic; }

.editor-cards {
  display: none;
  min-width: 0;
  padding: calc(var(--spacing) * 4);
}

.editor-footer {
  grid-area: foot;
  display: flex;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 2.4) calc(var(--spacing) * 4);
  border-top: 1px solid var(--border);
  color: var(--text-dim);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.editor-path {
  min-width: 0;
  overflow-wrap: anywhere;
}

.editor-pos { flex: none; }

/* abaixo de 760px, a árvore fica acima do arquivo */
@media (max-width: 760px) {
  .editor {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "tabs"
      "tree"
      "pane"
      "foot";
  }

  .editor-tree {
    border-right: 0;
    border-bottom: 1px solid var(--border);
  }

  .editor-lines { font-size: 0.78rem; }
}

/* ---------- visões (research R2) ---------- */

/* maximizada: a árvore e os cartões de hoje, no lugar do arquivo (clarify Q2) */
.editor-frame[data-editor-view="cards"] .editor-files { display: none; }
.editor-frame[data-editor-view="cards"] .editor-cards { display: block; }

/* sem JavaScript, com o JS principal falho (html.app-failed: a árvore não funcionaria) e na impressão:
   só os cartões, com todo o conteúdo (FR-012, Princípio III) */
html:not(.js) .editor-tabs,
html:not(.js) .editor-tree,
html:not(.js) .editor-files,
html:not(.js) .editor-footer,
html.app-failed .editor-tabs,
html.app-failed .editor-tree,
html.app-failed .editor-files,
html.app-failed .editor-footer { display: none; }

html:not(.js) .editor-cards,
html.app-failed .editor-cards {
  display: block;
  padding: 0;
}

html:not(.js) .editor,
html.app-failed .editor {
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: "pane";
  background: none;
  border: 0;
}

@media print {
  .editor-tabs, .editor-tree, .editor-files, .editor-footer { display: none !important; }
  .editor-cards { display: block !important; padding: 0; }
  .editor {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "pane";
    background: none;
    border: 0;
  }
}

/* ---------- maximizada (research R5) ---------- */

.maximize-backdrop {
  position: fixed;
  inset: 0;
  z-index: 900;
  background: var(--maximize-scrim);
  backdrop-filter: blur(var(--maximize-blur));
  -webkit-backdrop-filter: blur(var(--maximize-blur));
}

html.motion .maximize-backdrop { animation: backdrop-in 0.2s ease both; }

@keyframes backdrop-in {
  from { opacity: 0; }
}

.editor-frame.is-maximized {
  position: fixed;
  inset: max(2.5vh, 0.75rem) max(2.5vw, 0.75rem);
  z-index: 901;
  display: flex;
  flex-direction: column;
}

/* a janela ocupa o quadro inteiro; a árvore e os cartões rolam por dentro */
.editor-frame.is-maximized > :deep(.base-card) { flex: 1; min-height: 0; }
.editor-frame.is-maximized :deep(.terminal-window) { min-height: 0; }
.editor-frame.is-maximized :deep(.terminal-body) { min-height: 0; }

.editor-frame.is-maximized .editor {
  flex: 1;
  min-height: 0;
  grid-template-rows: auto minmax(0, 1fr) auto;
}

.editor-frame.is-maximized .editor-tree,
.editor-frame.is-maximized .editor-cards {
  overflow: auto;
  overscroll-behavior: contain;
}

.editor-frame.is-maximized .editor-pane {
  min-height: 0;
  grid-template-rows: minmax(0, 1fr);
}

@media (max-width: 760px) {
  .editor-frame.is-maximized { inset: 0.5rem; }
  .editor-frame.is-maximized .editor { grid-template-rows: auto auto minmax(0, 1fr) auto; }
  .editor-frame.is-maximized .editor-tree { max-height: 30vh; }
}

@media print {
  .maximize-backdrop { display: none; }
  .editor-frame.is-maximized { position: static; }
}
</style>
