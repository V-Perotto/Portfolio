<script setup lang="ts">
import { FileCode } from '@lucide/vue'
import { computed, inject, nextTick, onBeforeUnmount, onMounted, provide, reactive, readonly, ref } from 'vue'
import BaseCard from '@/components/base/BaseCard.vue'
import ExternalLink from '@/components/base/ExternalLink.vue'
import ZoomFigure from '@/components/base/ZoomFigure.vue'
import BranchedMenu from '@/components/vendor/vue-bits/BranchedMenu.vue'
import type { EditorFile, EditorFolder } from '@/lib/editor-files'
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
/**
 * Arquivos já abertos (feature 010, research R6): os fechados ficam empilhados e só invisíveis, então um
 * `loading="lazy"` baixaria todas as imagens quando a janela chegasse perto da tela. Só o aberto e os já
 * vistos têm o `<img>`; os outros, a caixa com a proporção.
 */
const visited = reactive(new Set<string>())
const placeholderHeight = ref<number | null>(null)

const slot = ref<HTMLElement | null>(null)
const frame = ref<HTMLElement | null>(null)
const cards = ref<HTMLElement | null>(null)

const active = computed(() => props.folder.files.find((f) => f.id === activeId.value) ?? props.folder.files[0])
const asChild = (file: EditorFile) => ({ value: file.id, label: file.name, icon: FileCode })
/**
 * A árvore: a pasta raiz com os arquivos (006) ou, na janela de Certificados (feature 010, research R1),
 * uma pasta por plataforma, em acordeão (uma aberta por vez, a lista rolando por dentro).
 */
const tree = computed(() =>
  props.folder.groups
    ? props.folder.groups.map((group) => ({
        label: `${group.label}/`,
        value: group.label,
        // no HTML pré-renderizado, só as pastas: sem JS a árvore não aparece, e os 61 arquivos com os ramos
        // pesavam ~2,5 KB comprimidos (research R11); os arquivos entram na montagem, como os YAML
        children: hydrated.value ? group.files.map(asChild) : [],
      }))
    : [{ label: `${props.folder.label}/`, children: props.folder.files.map(asChild) }],
)
/** A pasta aberta (a do arquivo aberto), quando a janela tem várias. */
const openGroup = computed(() => active.value?.group ?? null)

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
  // com o visualizador de imagem aberto por cima (feature 010), o Esc e o Tab são dele
  if (document.querySelector('dialog[open]')) return
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
  visited.add(activeId.value)
  activeId.value = id
  if (maximized.value) revealCard(id)
}

/** Abrir outra pasta (feature 010, FR-004): abre o 1º arquivo dela; maximizada, os cartões voltam ao topo. */
async function onToggle(index: number, opened: boolean) {
  const first = props.folder.groups?.[index]?.files[0]
  if (!opened || !first) return
  visited.add(activeId.value)
  activeId.value = first.id
  await nextTick()
  cards.value?.scrollTo({ top: 0, behavior: 'instant' })
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
                  :exclusive="!!folder.groups"
                  :max-rows="folder.groups ? 8 : undefined"
                  color="var(--text)"
                  accent-color="var(--green-bright)"
                  line-color="var(--tree-line)"
                  muted-color="var(--text-dim)"
                  @select="select"
                  @toggle="onToggle"
                />
              </div>
              <div class="editor-pane">
                <div class="editor-files">
                  <article
                    v-for="file in files"
                    :key="file.id"
                    :class="['editor-file', { 'has-figure-side': file.figure?.placement === 'side' }]"
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
                    <ZoomFigure
                      v-if="file.figure"
                      class="editor-figure"
                      :data-placement="file.figure.placement"
                      :image="file.figure"
                      :caption="file.figure.caption"
                      :viewer-caption="file.figure.viewerCaption"
                      :sizes="file.figure.sizes"
                      :open-label="file.figure.openLabel"
                      :load="file.id === activeId || visited.has(file.id)"
                    />
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
                  <slot name="cards" :open-group="maximized && folder.groups ? openGroup : null" />
                </div>
              </div>
              <footer class="editor-footer mono">
                <!-- os caminhos de todos os arquivos ficam empilhados, invisíveis, na mesma célula: no celular o
                     caminho quebra em mais linhas, e o rodapé tem a altura do maior (feature 010, SC-003) -->
                <span class="editor-path-box">
                  <span class="editor-path">{{ active?.path }}</span>
                  <span v-for="file in files" :key="file.id" class="editor-path-sizer" aria-hidden="true">{{ file.path }}</span>
                </span>
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

/* acordeão (feature 010): abaixo de 760 px, a árvore fica acima do arquivo, e a lista da pasta aberta mostra 4
   linhas em vez de 8 (o `!important` vence o valor da prop, que o menu põe no `style`); maximizada, a árvore
   rola por inteiro, sem a altura reservada */
@media (max-width: 760px) {
  .editor-tree :deep(.bm-exclusive) { --bm-max-rows: 4 !important; }
}

.editor-frame.is-maximized .editor-tree :deep(.bm-exclusive) { min-height: auto; }

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

/* imagem do arquivo (feature 010, research R6): abaixo das linhas, alinhada ao código (depois da coluna dos
   números), com até 20rem; o `font-size` é o das linhas, para o `ch` bater */
.editor-figure {
  font-size: 0.85rem;
  min-width: 0;
}

.editor-figure[data-placement="below"],
.editor-figure[data-placement="side"] {
  width: min(calc(100% - 3.2ch - var(--spacing) * 7), 20rem);
  margin: calc(var(--spacing) * 2) 0 0 calc(3.2ch + var(--spacing) * 3);
}

/* a foto da experiência (feature 010, Q3, research R8): a partir de 900 px, à direita das linhas, numa coluna
   de 10 a 16rem; abaixo disso, embaixo delas, como a miniatura dos certificados. Em 1366 px, o resumo da Prime
   Control passa de 3 para 5 linhas, e a janela cresce 2 linhas (46 px), o limite do FR-017; uma foto menor
   (14rem) não poupava nenhuma linha */
@media (min-width: 900px) {
  .editor-file.has-figure-side {
    display: grid;
    grid-template-columns: minmax(0, 1fr) clamp(10rem, 36%, 16rem);
    column-gap: calc(var(--spacing) * 4);
    align-items: start;
    padding-right: calc(var(--spacing) * 4);
  }

  .editor-file.has-figure-side .editor-figure {
    grid-column: 2;
    grid-row: 1;
    width: auto;
    margin: 0;
  }
}

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

.editor-path-box {
  display: grid;
  min-width: 0;
}

.editor-path,
.editor-path-sizer {
  grid-area: 1 / 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.editor-path-sizer { visibility: hidden; }

/* largura fixa (até `33 / 33`): a posição não muda a largura que sobra para o caminho */
.editor-pos {
  flex: none;
  min-width: 7ch;
  text-align: right;
}

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
  /* só a propriedade sem prefixo: o minificador do build gera o `-webkit-`; escrita ao lado dela, ele
     descartava a sem prefixo, e o Chromium ficava sem o desfoque (achado na feature 009) */
  backdrop-filter: blur(var(--maximize-blur));
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
