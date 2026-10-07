<script setup lang="ts">
import RevealText from '@/components/base/RevealText.vue'
import GlitchTitle from '@/components/terminal/GlitchTitle.vue'
import MatrixRain from '@/components/terminal/MatrixRain.vue'
import PromptLogo from '@/components/terminal/PromptLogo.vue'
import TypedPrompt from '@/components/terminal/TypedPrompt.vue'
import type { Profile } from '@/types/resume'

defineProps<{ profile: Profile }>()
</script>

<template>
  <header id="home" class="hero">
    <MatrixRain />
    <div class="hero-grid" aria-hidden="true" />
    <div class="hero-content">
      <p class="hero-boot mono">[ OK ] Inicializando portfolio.service ...</p>
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
    radial-gradient(ellipse at 30% 20%, rgba(70, 32, 102, 0.25), transparent 55%),
    radial-gradient(ellipse at 75% 80%, rgba(32, 94, 68, 0.18), transparent 55%),
    var(--bg);
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(123, 63, 179, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(123, 63, 179, 0.07) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: var(--container-hero);
}

.hero-boot {
  color: var(--green-light);
  font-size: 0.8rem;
  margin-bottom: 1.2rem;
  opacity: 0.8;
}


.hero-terminal {
  margin-top: 1.4rem;
  font-size: clamp(0.95rem, 2.4vw, 1.25rem);
  color: var(--text);
  min-height: 1.8em;
}


.hero-sub {
  margin-top: 1.2rem;
  color: var(--text-dim);
  font-size: 1.02rem;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  margin-top: 2.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.btn {
  font-family: var(--font-mono);
  font-size: 0.92rem;
  text-decoration: none;
  padding: 0.7rem 1.4rem;
  border-radius: var(--radius-btn);
  transition: all 0.25s;
}

.btn-primary {
  background: var(--purple);
  color: #fff;
  border: 1px solid var(--purple-light);
  box-shadow: 0 0 18px rgba(70, 32, 102, 0.55);
}

.btn-primary:hover {
  background: var(--purple-light);
  box-shadow: 0 0 28px rgba(123, 63, 179, 0.75);
  transform: translateY(-2px);
}

.btn-ghost {
  color: var(--green-bright);
  border: 1px solid var(--green);
  background: rgba(32, 94, 68, 0.12);
}

.btn-ghost:hover {
  background: var(--green);
  color: #fff;
  box-shadow: 0 0 22px rgba(47, 168, 118, 0.5);
  transform: translateY(-2px);
}

.hero-scroll {
  position: absolute;
  bottom: 1.6rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  color: var(--text-dim);
  text-decoration: none;
  font-size: 0.78rem;
  animation: float 2.2s ease-in-out infinite;
}

.hero-scroll:hover { color: var(--green-bright); }

@keyframes float {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(6px); }
}
</style>
