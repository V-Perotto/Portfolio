<!--
  Vue Bits — BranchedMenu
  Origem: https://vue-bits.dev/micro/branched-menu, de
  DavidHDev/vue-bits@07c0f76d5567db022c2e3185dd97a2311e056c0c
  src/content/Micro/BranchedMenu/BranchedMenu.vue
  Licença: MIT + Commons Clause — Copyright (c) 2025 David Haz
  Modificações locais (feature 006, research R4):
  - CSS com escopo no lugar das classes do Tailwind, com as mesmas variáveis `--bm-*`;
  - ícones dos filhos são componentes (o Lucide do site), sem o `@hugeicons/vue` e sem os ícones e
    itens de exemplo do original;
  - o filho ativo é controlado pela prop `active` (quem usa sabe qual arquivo está aberto); o evento
    `select` continua; `data-value` em cada filho;
  - `ariaLabel` no `<nav>`; `mutedColor` opcional para o texto ocioso (o `color-mix` do original fica
    como padrão); o contorno de foco do site continua (o original tirava o `outline`);
  - transições desligadas com "reduzir movimento" (`prefers-reduced-motion` e `html:not(.motion)`);
  - sem `className`.
-->
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, type Component, type CSSProperties } from 'vue'

export interface BranchedMenuChild {
  value: string
  label: string
  icon?: Component
}

export interface BranchedMenuItem {
  label: string
  value?: string
  children?: BranchedMenuChild[]
}

const PAD = 6
const MARK = 16

const toSet = (open: number | number[]) => new Set(Array.isArray(open) ? open : open >= 0 ? [open] : [])

const props = withDefaults(
  defineProps<{
    items: BranchedMenuItem[]
    active: string
    defaultOpen?: number | number[]
    ariaLabel?: string
    color?: string
    accentColor?: string
    lineColor?: string
    mutedColor?: string
    width?: number
    rowHeight?: number
    indent?: number
    trunk?: number
    radius?: number
    lineWidth?: number
    fontSize?: number
    drawDuration?: number
    foldDuration?: number
  }>(),
  {
    defaultOpen: 0,
    ariaLabel: undefined,
    color: '#f5f5f5',
    accentColor: '#f5f5f5',
    lineColor: '#3f3f46',
    mutedColor: undefined,
    width: 240,
    rowHeight: 36,
    indent: 40,
    trunk: 14,
    radius: 10,
    lineWidth: 1.5,
    fontSize: 14,
    drawDuration: 400,
    foldDuration: 300,
  },
)

const emit = defineEmits<{
  select: [value: string, item: BranchedMenuChild | BranchedMenuItem]
  toggle: [index: number, open: boolean]
}>()

const open = ref<Set<number>>(toSet(props.defaultOpen))

const navRef = ref<HTMLElement | null>(null)
const markerRef = ref<HTMLSpanElement | null>(null)
const heads: (HTMLButtonElement | null)[] = []
let resizeObserver: ResizeObserver | null = null

const activeSection = computed(() => props.items.findIndex((it) => it.children?.some((kid) => kid.value === props.active)))
const markerShown = computed(() => activeSection.value >= 0 && open.value.has(activeSection.value))

const place = (glide: boolean) => {
  const m = markerRef.value
  const el = heads[activeSection.value]
  if (!m) return
  const on = markerShown.value && el
  if (!glide) m.style.transition = 'none'
  if (on) m.style.top = `${el.offsetTop + (el.offsetHeight - MARK) / 2}px`
  m.toggleAttribute('data-on', Boolean(on))
  if (!glide) {
    void m.offsetHeight
    m.style.transition = ''
  }
}

const bindMarker = () => {
  resizeObserver?.disconnect()
  place(true)
  if (typeof ResizeObserver === 'undefined') return
  let first = true
  resizeObserver = new ResizeObserver(() => {
    if (first) {
      first = false
      return
    }
    place(false)
  })
  if (navRef.value) resizeObserver.observe(navRef.value)
}

onMounted(bindMarker)
onUnmounted(() => resizeObserver?.disconnect())
watch(() => [activeSection.value, markerShown.value, props.items, props.fontSize, props.rowHeight], bindMarker, {
  flush: 'post',
})

const select = (value: string, item: BranchedMenuChild | BranchedMenuItem) => emit('select', value, item)
const toggle = (i: number) => {
  const next = new Set(open.value)
  const isOpen = !next.has(i)
  if (isOpen) next.add(i)
  else next.delete(i)
  open.value = next
  emit('toggle', i, isOpen)
}

const r = computed(() => Math.max(0, Math.min(props.radius, props.rowHeight / 2 - 2)))
const endX = computed(() => props.indent - 8)
const rowY = (k: number) => PAD + k * props.rowHeight + props.rowHeight / 2
const branch = (k: number) =>
  `M ${props.trunk} ${rowY(k) - r.value} A ${r.value} ${r.value} 0 0 0 ${props.trunk + r.value} ${rowY(k)} H ${endX.value}`
const reach = (k: number) =>
  `M ${props.trunk} 0 V ${rowY(k) - r.value} A ${r.value} ${r.value} 0 0 0 ${props.trunk + r.value} ${rowY(k)} H ${endX.value}`
const length = (k: number) => rowY(k) - r.value + (Math.PI * r.value) / 2 + (endX.value - props.trunk - r.value)
const trunkPath = (count: number) => `M ${props.trunk} 0 V ${rowY(count - 1) - r.value}`

const navStyle = computed(
  () =>
    ({
      '--bm-w': `${props.width}px`,
      '--bm-ink': props.color,
      '--bm-accent': props.accentColor,
      '--bm-line': props.lineColor,
      '--bm-font': `${props.fontSize}px`,
      '--bm-row': `${props.rowHeight}px`,
      '--bm-indent': `${props.indent}px`,
      '--bm-line-w': props.lineWidth,
      '--bm-draw': `${props.drawDuration}ms`,
      '--bm-muted': props.mutedColor ?? `color-mix(in srgb, ${props.color} 55%, transparent)`,
      '--bm-fold': `${props.foldDuration}ms`,
    }) as CSSProperties,
)
</script>

<template>
  <nav ref="navRef" class="branched-menu" :aria-label="ariaLabel" :style="navStyle">
    <span ref="markerRef" class="bm-marker" aria-hidden="true" />
    <div
      v-for="(item, i) in items"
      :key="item.value ?? item.label"
      class="bm-section"
      :data-open="item.children && open.has(i) ? '' : undefined"
    >
      <button
        :ref="(el) => (heads[i] = el as HTMLButtonElement | null)"
        type="button"
        class="bm-head"
        :aria-expanded="item.children ? open.has(i) : undefined"
        :aria-current="!item.children && (item.value ?? item.label) === active ? 'true' : undefined"
        :data-active="!item.children && (item.value ?? item.label) === active ? '' : undefined"
        @click="item.children ? toggle(i) : select(item.value ?? item.label, item)"
      >
        {{ item.label }}
      </button>
      <div v-if="item.children" class="bm-fold">
        <div class="bm-fold-inner">
          <div class="bm-rows" :style="{ height: `${PAD * 2 + item.children.length * rowHeight}px` }">
            <svg
              class="bm-lines"
              :width="indent"
              :height="PAD * 2 + item.children.length * rowHeight"
              aria-hidden="true"
            >
              <path class="bm-path" :d="trunkPath(item.children.length)" />
              <path v-for="(kid, k) in item.children" :key="`line-${kid.value}`" class="bm-path" :d="branch(k)" />
              <path
                v-for="(kid, k) in item.children"
                :key="`reach-${kid.value}`"
                class="bm-path bm-reach"
                :d="reach(k)"
                :style="{ strokeDasharray: length(k), strokeDashoffset: kid.value === active ? 0 : length(k) }"
              />
            </svg>
            <button
              v-for="kid in item.children"
              :key="kid.value"
              type="button"
              class="bm-child"
              :aria-current="kid.value === active ? 'true' : undefined"
              :data-active="kid.value === active ? '' : undefined"
              :data-value="kid.value"
              :tabindex="open.has(i) ? 0 : -1"
              @click="select(kid.value, kid)"
            >
              <span v-if="kid.icon" class="bm-icon" aria-hidden="true">
                <component :is="kid.icon" :size="16" :stroke-width="1.8" />
              </span>
              <span class="bm-label">{{ kid.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.branched-menu {
  position: relative;
  display: flex;
  flex-direction: column;
  width: fit-content;
  max-width: min(var(--bm-w), 100%);
  padding-left: 14px;
  line-height: 1.2;
  color: var(--bm-ink);
  font-family: inherit;
  font-size: var(--bm-font);
}

/* trilho vertical, que some embaixo */
.branched-menu::before {
  content: "";
  position: absolute;
  top: 8px;
  bottom: 0;
  left: 0;
  width: 2px;
  border-radius: 1px;
  background: linear-gradient(to bottom, var(--bm-line) 0%, var(--bm-line) 55%, transparent 100%);
}

.bm-marker {
  position: absolute;
  top: -1px;
  left: 0;
  z-index: 1;
  width: 2px;
  height: 16px;
  border-radius: 1px;
  background: var(--bm-accent);
  opacity: 0;
  transition: top 220ms cubic-bezier(0.23, 1, 0.32, 1), opacity 150ms ease;
}

.bm-marker[data-on] { opacity: 1; }

.bm-section {
  display: flex;
  flex-direction: column;
}

.bm-head {
  display: block;
  margin: 0;
  padding: 9px 0;
  border: 0;
  background: transparent;
  font-family: inherit;
  font-size: calc(var(--bm-font) + 1px);
  font-weight: 500;
  text-align: left;
  color: var(--bm-muted);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: color 200ms ease;
}

.bm-section[data-open] > .bm-head,
.bm-head[data-active],
.bm-head:hover { color: var(--bm-ink); }

.bm-fold {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--bm-fold) cubic-bezier(0.23, 1, 0.32, 1);
}

.bm-section[data-open] > .bm-fold { grid-template-rows: 1fr; }

.bm-fold-inner {
  min-height: 0;
  overflow: hidden;
}

.bm-rows {
  position: relative;
  box-sizing: border-box;
  padding-block: 6px;
}

.bm-lines {
  position: absolute;
  top: 0;
  left: 0;
  overflow: visible;
  pointer-events: none;
  opacity: 0;
  transition: opacity 200ms ease;
}

.bm-section[data-open] .bm-lines {
  opacity: 1;
  transition: opacity 250ms ease 100ms;
}

.bm-path {
  fill: none;
  stroke: var(--bm-line);
  stroke-width: var(--bm-line-w);
  stroke-linecap: round;
  stroke-linejoin: round;
}

.bm-reach {
  stroke: var(--bm-accent);
  transition: stroke-dashoffset var(--bm-draw) cubic-bezier(0.23, 1, 0.32, 1);
}

.bm-child {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: var(--bm-row);
  margin: 0;
  padding: 0 0 0 var(--bm-indent);
  border: 0;
  background: transparent;
  font-family: inherit;
  text-align: left;
  color: var(--bm-muted);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: color 200ms ease;
}

.bm-child:hover { color: var(--bm-ink); }

.bm-child[data-active] {
  color: var(--bm-accent);
  font-weight: 500;
}

.bm-icon {
  display: inline-flex;
  flex: none;
}

.bm-label { white-space: nowrap; }

/* "reduzir movimento": nada desliza, dobra nem desenha (o marcador só acende) */
@media (prefers-reduced-motion: reduce) {
  .bm-marker { transition: opacity 150ms ease; }
  .bm-fold, .bm-reach, .bm-lines, .bm-section[data-open] .bm-lines { transition: none; }
}

html:not(.motion) .bm-marker { transition: opacity 150ms ease; }

html:not(.motion) .bm-fold,
html:not(.motion) .bm-reach,
html:not(.motion) .bm-lines { transition: none; }
</style>
