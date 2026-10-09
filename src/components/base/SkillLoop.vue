<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useMotion } from '@/composables/useMotion'
import type { SkillItem } from '@/types/resume'
import TechIcon from './TechIcon.vue'

/**
 * Loop das skills de um grupo (FR-021 a FR-029 da 003; research R4 e R5). O visual vem do Text Loop
 * do Vue Bits na forma "line": uma fita que atravessa a largura, os itens correndo sobre ela da
 * direita para a esquerda, o separador ✦ e a pausa com o ponteiro em cima. Não é cópia dele: o Text
 * Loop desenha só texto num <textPath> e depende do GSAP, e aqui cada item é ícone + nome.
 *
 * Só acrescenta movimento. O HTML pré-renderizado é uma lista com todas as skills, uma vez; sem
 * `html.motion` (sem JS, "reduzir movimento") e na impressão, ela quebra em linhas dentro da fita.
 * Com movimento, a fita tem uma linha só desde o primeiro paint (o script do <head> decide a classe),
 * e, depois de montar, o componente mede a sequência, acrescenta cópias `aria-hidden` até cobrir a
 * largura e liga a animação CSS, que só roda com o loop na tela.
 */
const props = defineProps<{ items: readonly SkillItem[] }>()

/** Velocidade da trilha. Em 320px a fita tem ~288px: um item leva ~7 s para atravessar (FR-028). */
const SPEED_PX_PER_S = 40

const motion = useMotion()
const root = ref<HTMLElement | null>(null)
const seq = ref<HTMLElement | null>(null)
const copies = ref(0)
const shift = ref(0)
const ready = ref(false)
const visible = ref(false)

let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null

function measure() {
  const width = root.value?.clientWidth ?? 0
  const seqWidth = seq.value?.getBoundingClientRect().width ?? 0
  if (!motion.value || !width || !seqWidth) {
    ready.value = false
    copies.value = 0
    return
  }
  shift.value = seqWidth
  // a trilha anda uma sequência inteira e recomeça: as cópias cobrem a largura durante o trajeto
  copies.value = Math.max(1, Math.ceil(width / seqWidth))
  ready.value = true
}

onMounted(() => {
  const el = root.value!
  // a largura dos nomes depende da Iosevka: mede de novo quando as fontes chegam
  void (document.fonts?.ready ?? Promise.resolve()).then(measure)
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => measure())
    resizeObserver.observe(el)
  }
  if (typeof IntersectionObserver !== 'undefined') {
    intersectionObserver = new IntersectionObserver(([entry]) => {
      visible.value = entry?.isIntersecting ?? false
    })
    intersectionObserver.observe(el)
  }
})

// "reduzir movimento" ligado ou desligado no meio da visita: a lista muda de forma, mede de novo
watch(motion, () => nextTick(measure))
watch(() => props.items, () => nextTick(measure), { deep: true })

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
})
</script>

<template>
  <div
    ref="root"
    class="skill-loop"
    :data-loop-ready="ready || undefined"
    :data-loop-visible="visible || undefined"
    :style="ready ? { '--loop-shift': `${shift}px`, '--loop-duration': `${shift / SPEED_PX_PER_S}s` } : undefined"
  >
    <div class="loop-track">
      <ul ref="seq" class="loop-seq" role="list">
        <li v-for="item in items" :key="item.name" class="loop-item">
          <TechIcon :tech="item.name" />
          <span class="loop-name">{{ item.name }}</span>
          <span class="loop-sep" aria-hidden="true">✦</span>
        </li>
      </ul>
      <ul v-for="n in copies" :key="n" class="loop-seq" aria-hidden="true" data-loop-copy>
        <li v-for="item in items" :key="item.name" class="loop-item">
          <TechIcon :tech="item.name" />
          <span class="loop-name">{{ item.name }}</span>
          <span class="loop-sep">✦</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* a fita: faixa roxa com fios em cima e embaixo (research R5) */
.skill-loop {
  background: var(--ribbon-bg);
  border-block: 1px solid var(--ribbon-edge);
  padding: calc(var(--spacing) * 2.4) calc(var(--spacing) * 4);
}

.loop-seq {
  display: flex;
  flex-wrap: wrap;
  row-gap: calc(var(--spacing) * 2);
  list-style: none;
}

.loop-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--green-bright);
  white-space: nowrap;
}

.loop-sep {
  color: var(--purple-glow);
  margin-inline: 0.7em 1em;
}

/* parado (sem JS, "reduzir movimento"): o último separador não aponta para nada */
html:not(.motion) .loop-item:last-child .loop-sep { display: none; }
html:not(.motion) [data-loop-copy] { display: none; }

/* com movimento: uma linha só desde o primeiro paint, sem mudar de altura ao ligar a animação
   (FR-029); as bordas esmaecem como a entrada e a saída da fita do Text Loop */
html.motion .skill-loop {
  overflow: hidden;
  padding-inline: 0;
  -webkit-mask-image: linear-gradient(to right, transparent, black 2.5rem, black calc(100% - 2.5rem), transparent);
  mask-image: linear-gradient(to right, transparent, black 2.5rem, black calc(100% - 2.5rem), transparent);
}

html.motion .loop-track {
  display: flex;
  width: max-content;
}

html.motion .loop-seq {
  flex-wrap: nowrap;
  flex-shrink: 0;
}

html.motion .skill-loop[data-loop-ready] .loop-track {
  animation: skill-loop var(--loop-duration) linear infinite;
  animation-play-state: paused;
  will-change: transform;
}

/* só anda na tela (FR-024) e para com o ponteiro em cima (FR-023) */
html.motion .skill-loop[data-loop-ready][data-loop-visible] .loop-track { animation-play-state: running; }
html.motion .skill-loop[data-loop-ready][data-loop-visible]:hover .loop-track { animation-play-state: paused; }

@keyframes skill-loop {
  to { transform: translateX(calc(-1 * var(--loop-shift))); }
}

/* impressão: a lista parada e completa, mesmo com movimento ligado na tela (FR-025) */
@media print {
  html.motion .skill-loop {
    overflow: visible;
    padding-inline: calc(var(--spacing) * 4);
    -webkit-mask-image: none;
    mask-image: none;
  }

  html.motion .loop-track { width: auto; }
  html.motion .loop-seq { flex-wrap: wrap; flex-shrink: 1; }
  html.motion .skill-loop .loop-track { animation: none; transform: none; }
  [data-loop-copy] { display: none; }
  .loop-item:last-child .loop-sep { display: none; }
}
</style>
