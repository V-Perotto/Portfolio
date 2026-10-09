<!--
  Vue Bits — TextType
  Origem: https://vue-bits.dev (TextAnimations/TextType), de
  DavidHDev/vue-bits@07c0f76d5567db022c2e3185dd97a2311e056c0c
  src/content/TextAnimations/TextType/TextType.vue
  Licença: MIT + Commons Clause — Copyright (c) 2025 David Haz
  Modificações locais (feature 005, research R3):
  - sem GSAP: o cursor pisca com a classe `.cursor` do site (que para sem movimento); padrão `▊`;
  - guiado pelo relógio: os caracteres visíveis saem de `performance.now()` a cada tique de 16 ms, e um
    timer atrasado não acumula atraso; `startAt` põe vários TextType num relógio só;
  - evento `complete` quando uma frase termina de ser digitada (uma vez por frase);
  - `instant` mostra a frase inteira na hora (movimento reduzido); `reserve` deixa o resto ainda não
    digitado no DOM, invisível, para a linha já ocupar o tamanho final;
  - `loop` desligado por padrão; com várias frases e `loop`, apaga e digita a seguinte (como o
    original), e sem `loop` para na última, digitada; saem `textColors`, `variableSpeed`,
    `startOnVisible`, `reverseMode` e `hideCursorWhileTyping` (sem uso no site);
  - sem as classes do Tailwind; o cursor é decorativo (`aria-hidden`).
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    text: string | string[]
    as?: string
    typingSpeed?: number
    initialDelay?: number
    pauseDuration?: number
    deletingSpeed?: number
    loop?: boolean
    showCursor?: boolean
    cursorCharacter?: string
    cursorClassName?: string
    /** `performance.now()` em que a digitação deveria começar; padrão: a montagem. */
    startAt?: number
    instant?: boolean
    reserve?: boolean
  }>(),
  {
    as: 'span',
    typingSpeed: 50,
    initialDelay: 0,
    pauseDuration: 2000,
    deletingSpeed: 30,
    loop: false,
    showCursor: true,
    cursorCharacter: '▊',
    cursorClassName: '',
    startAt: undefined,
    instant: false,
    reserve: false,
  },
)

const emit = defineEmits<{ complete: [sentence: string, index: number] }>()

const sentences = computed(() => (Array.isArray(props.text) ? props.text : [props.text]))
const index = ref(0)
const shown = ref('')
const current = computed(() => sentences.value[index.value] ?? '')
const rest = computed(() => (current.value.startsWith(shown.value) ? current.value.slice(shown.value.length) : ''))

type Phase = 'typing' | 'pausing' | 'deleting' | 'done'
let phase: Phase = 'typing'
/** Instante em que a fase atual começou (relógio, não o tique em que foi notada). */
let phaseStart = props.startAt ?? performance.now()
let timer: ReturnType<typeof setTimeout> | null = null

const hasNext = () => sentences.value.length > 1 && (props.loop || index.value < sentences.value.length - 1)

function step(now: number) {
  const text = current.value
  if (phase === 'typing') {
    const delay = index.value === 0 ? props.initialDelay : 0
    const elapsed = now - phaseStart - delay
    const count = elapsed < 0 ? 0 : Math.min(text.length, Math.floor(elapsed / props.typingSpeed) + 1)
    shown.value = text.slice(0, count)
    if (count < text.length) return
    emit('complete', text, index.value)
    if (!hasNext()) {
      phase = 'done'
      return
    }
    phase = 'pausing'
    phaseStart += delay + Math.max(0, text.length - 1) * props.typingSpeed
  }
  if (phase === 'pausing') {
    if (now < phaseStart + props.pauseDuration) return
    phase = 'deleting'
    phaseStart += props.pauseDuration
  }
  if (phase === 'deleting') {
    const removed = Math.floor((now - phaseStart) / props.deletingSpeed) + 1
    shown.value = text.slice(0, Math.max(0, text.length - removed))
    if (removed < text.length) return
    phaseStart += text.length * props.deletingSpeed
    index.value = (index.value + 1) % sentences.value.length
    phase = 'typing'
    step(now)
  }
}

function tick() {
  timer = null
  step(performance.now())
  if (phase !== 'done') timer = setTimeout(tick, 16)
}

onMounted(() => {
  if (props.instant) {
    shown.value = current.value
    phase = 'done'
    emit('complete', current.value, index.value)
    return
  }
  tick()
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <component :is="props.as" class="text-type">
    <span class="text-type-content">{{ shown }}</span>
    <span v-if="props.showCursor" :class="['cursor', 'text-type-cursor', props.cursorClassName]" aria-hidden="true">{{
      props.cursorCharacter
    }}</span>
    <span v-if="props.reserve && rest" class="text-type-ghost" aria-hidden="true">{{ rest }}</span>
  </component>
</template>

<style scoped>
.text-type { white-space: pre-wrap; }

/* o texto ainda não digitado ocupa o lugar final, sem aparecer (research R4) */
.text-type-ghost { visibility: hidden; }
</style>
