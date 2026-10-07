<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Tela de boot SSH (FR-031) — porte da sequência anterior. Só existe no cliente e só quando o
 * script inline marcou `html.booting` (há movimento). Termina sozinha em até 4,8 s ou com
 * qualquer tecla/clique, e remove `html.booting`, liberando a capa que cobre a página.
 */
interface Part {
  cls?: string
  text: string
}

const active = ref(false)
const hiding = ref(false)
const lines = ref<Part[][]>([])

let finished = false
const timers: ReturnType<typeof setTimeout>[] = []
const schedule = (delay: number, fn: () => void) => timers.push(setTimeout(fn, delay))

const PROMPT = (user: string, host: string): Part[] => [
  { cls: 'prompt-user', text: user },
  { cls: 'prompt-at', text: '@' },
  { cls: 'prompt-host', text: host },
  { cls: 'prompt-colon', text: ':' },
  { cls: 'prompt-path', text: '~' },
  { cls: 'prompt-dollar', text: '$ ' },
]

function addLine(parts: Part[]): Part[][] {
  lines.value.push(parts.map((p) => ({ ...p })))
  return lines.value
}

/** digita `text` num trecho novo no fim da última linha */
function typeInto(text: string, speed: number, cls: string | undefined, onDone: () => void) {
  const line = lines.value[lines.value.length - 1]
  if (!line) return
  line.push({ cls, text: '' })
  const part = line[line.length - 1]!
  let i = 0
  const step = () => {
    if (finished) return
    part.text = text.slice(0, ++i)
    if (i < text.length) schedule(speed, step)
    else schedule(0, onDone)
  }
  step()
}

function finish() {
  if (finished) return
  finished = true
  timers.forEach(clearTimeout)
  document.removeEventListener('keydown', finish)
  document.documentElement.classList.remove('booting')
  hiding.value = true
  setTimeout(() => {
    active.value = false
  }, 600)
}

onMounted(async () => {
  if (!document.documentElement.classList.contains('booting')) return
  active.value = true
  await nextTick()

  document.addEventListener('keydown', finish)
  schedule(4800, finish) // teto: nunca passa de 5 s

  addLine(PROMPT('anon', '127.0.0.1'))
  typeInto('ssh viper@portfolio', 42, undefined, () => {
    schedule(250, () => {
      addLine([{ cls: 'boot-dim', text: 'Conectando a portfolio na porta 22...' }])
      schedule(500, () => {
        addLine([{ text: "viper@portfolio's password: " }])
        typeInto('••••••••', 55, undefined, () => {
          schedule(450, () => {
            addLine([{ cls: 'boot-ok', text: 'Autenticado. ' }, { text: 'Bem-vindo ao PortfolioOS 1.0 LTS' }])
            schedule(300, () => {
              const now = new Date().toLocaleString('pt-BR')
              addLine([{ cls: 'boot-dim', text: `Last login: ${now} from 127.0.0.1` }])
              schedule(400, () => {
                addLine(PROMPT('viper', 'portfolio'))
                typeInto('./iniciar_portfolio.sh', 24, 'boot-ok', () => schedule(350, finish))
              })
            })
          })
        })
      })
    })
  })
})

onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  document.removeEventListener('keydown', finish)
})
</script>

<template>
  <div v-if="active" :class="['boot-screen', { 'boot-hidden': hiding }]" @click="finish">
    <div class="boot-body mono" aria-hidden="true">
      <p v-for="(line, i) in lines" :key="i" class="boot-line">
        <span v-for="(part, j) in line" :key="j" :class="part.cls">{{ part.text }}</span><span v-if="i === lines.length - 1" class="cursor">▊</span>
      </p>
    </div>
    <p class="boot-skip mono">[ pressione qualquer tecla para pular ]</p>
  </div>
</template>

<style scoped>
.boot-screen {
  position: fixed;
  inset: 0;
  z-index: 9999; /* acima da capa html.booting::before (9998) */
  background: var(--bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.boot-screen.boot-hidden {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.5s ease, visibility 0.5s ease;
}

.boot-body {
  width: min(680px, 100%);
  font-size: clamp(0.78rem, 2.2vw, 0.95rem);
  color: var(--text);
  line-height: 1.75;
}

.boot-line { min-height: 1.75em; }
.boot-dim { color: var(--text-dim); }
.boot-ok { color: var(--green-bright); }

.boot-skip {
  position: absolute;
  bottom: 2rem;
  color: var(--text-dim);
  font-size: 0.72rem; /* sem o opacity: 0.7 anterior, que deixava a dica abaixo de 4,5:1 (FR-022) */
}
</style>
