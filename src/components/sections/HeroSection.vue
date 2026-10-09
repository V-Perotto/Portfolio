<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import RevealText from '@/components/base/RevealText.vue'
import GlitchTitle from '@/components/terminal/GlitchTitle.vue'
import HeroLoader from '@/components/terminal/HeroLoader.vue'
import PromptLogo from '@/components/terminal/PromptLogo.vue'
import TypedPrompt from '@/components/terminal/TypedPrompt.vue'
import { useBootDone } from '@/composables/useBootDone'
import { useMotion } from '@/composables/useMotion'
import type { Profile } from '@/types/resume'

defineProps<{ profile: Profile }>()

/**
 * Fundo Letter Glitch (feature 006, FR-029 a FR-034, research R12; no lugar do Dot Field da 005): pedaço
 * à parte, carregado só no cliente, com movimento, depois da porta de acesso. É canvas 2D (num worker
 * quando dá): não depende de WebGL. As vinhetas do próprio Letter Glitch são as únicas (a penumbra sob o
 * texto saiu, FR-032). Sem JS ou com "reduzir movimento" (inclusive ligado no meio da visita), o fundo
 * são os degradês estáticos do .hero.
 */
const HeroGlitch = defineAsyncComponent(() => import('@/components/terminal/HeroGlitch.vue'))
const motion = useMotion()
const bootDone = useBootDone()
/** O fundo animado desenhou o primeiro quadro (ou falhou). Sem fundo animado no modo atual, pronto. */
const glitchReady = ref(false)
const heroBackgroundReady = computed(() => !motion.value || glitchReady.value)
</script>

<template>
  <header id="home" class="hero">
    <HeroGlitch v-if="motion && bootDone" @ready="glitchReady = true" />
    <div class="hero-content">
      <!-- Lattice Loader no lugar do "[ OK ] Inicializando portfolio.service ..." (feature 006, FR-036) -->
      <HeroLoader :background-ready="heroBackgroundReady" />
      <GlitchTitle :text="profile.name" />
      <p class="hero-terminal mono">
        <PromptLogo :cursor="false" />&nbsp;<TypedPrompt :phrases="profile.typedPhrases" :static-index="profile.staticPhraseIndex" /><span class="cursor" aria-hidden="true">▊</span>
      </p>
      <RevealText class="hero-sub" :text="profile.tagline" />
      <div class="hero-actions">
        <a href="#experiencia" class="btn btn-primary">./ver_experiencia.sh</a>
        <a href="#contato" class="btn btn-ghost">ping vittorio</a>
      </div>
    </div>
    <a href="#sobre" class="hero-scroll mono" aria-label="Rolar para a seção sobre">▼ scroll</a>
  </header>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--hero-pad);
  overflow: hidden;
  background:
    radial-gradient(ellipse at 30% 20%, color-mix(in srgb, var(--purple) 25%, transparent), transparent 55%),
    radial-gradient(ellipse at 75% 80%, color-mix(in srgb, var(--green) 18%, transparent), transparent 55%),
    var(--bg);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: var(--container-hero);
}

.hero-boot {
  color: var(--green-light);
  font-size: 0.8rem;
  min-height: 1.6em;
  margin-bottom: calc(var(--spacing) * 4.8);
  /* sem o opacity: 0.8 anterior, que deixava a linha em ~4,5:1 no fundo liso e abaixo disso sobre
     o fundo animado (FR-038 da 004, FR-032 da 005, FR-032 da 006); o verde cheio dá 6,3:1 */
}


.hero-terminal {
  margin-top: calc(var(--spacing) * 5.6);
  font-size: clamp(0.95rem, 2.4vw, 1.25rem);
  color: var(--text);
  min-height: 1.8em;
}


.hero-sub {
  margin-top: calc(var(--spacing) * 4.8);
  color: var(--text-dim);
  font-size: 1.02rem;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  margin-top: calc(var(--spacing) * 8.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--spacing) * 4);
}

.btn {
  font-family: var(--font-mono);
  font-size: 0.92rem;
  text-decoration: none;
  padding: calc(var(--spacing) * 2.8) calc(var(--spacing) * 5.6);
  border-radius: var(--radius-btn);
  transition: all 0.25s;
}

.btn-primary {
  background: var(--purple);
  color: var(--on-accent);
  border: 1px solid var(--purple-light);
  box-shadow: 0 0 18px color-mix(in srgb, var(--purple) 55%, transparent);
}

.btn-primary:hover {
  background: var(--purple-light);
  box-shadow: 0 0 28px color-mix(in srgb, var(--purple-light) 75%, transparent);
  transform: translateY(-2px);
}

.btn-ghost {
  color: var(--green-bright);
  border: 1px solid var(--green);
  background: color-mix(in srgb, var(--green) 12%, transparent);
}

.btn-ghost:hover {
  background: var(--green);
  color: var(--on-accent);
  box-shadow: 0 0 22px color-mix(in srgb, var(--green-light) 50%, transparent);
  transform: translateY(-2px);
}

/* --text, e não --text-dim: perto da borda de baixo, a vinheta central do Letter Glitch não chega, e o
   cinza ficava em 3,2:1 sobre as letras no celular (FR-032 da 006, research R12); assim, ≥ 6,7:1 */
.hero-scroll {
  position: absolute;
  bottom: 1.6rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  color: var(--text);
  text-decoration: none;
  font-size: 0.78rem;
  animation: float 2.2s ease-in-out infinite;
}

.hero-scroll:hover { color: var(--green-bright); }

/* com JS, a dock ocupa o centro de baixo da tela (feature 004): o "▼ scroll" sobe para cima dela */
html.js .hero-scroll { bottom: calc(var(--dock-space) + 0.6rem); }

@keyframes float {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(6px); }
}
</style>
