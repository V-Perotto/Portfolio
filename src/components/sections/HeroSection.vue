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
    radial-gradient(ellipse at 30% 20%, color-mix(in srgb, var(--purple) 25%, transparent), transparent 55%),
    radial-gradient(ellipse at 75% 80%, color-mix(in srgb, var(--green) 18%, transparent), transparent 55%),
    var(--bg);
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(color-mix(in srgb, var(--purple-light) 7%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--purple-light) 7%, transparent) 1px, transparent 1px);
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
  margin-bottom: calc(var(--spacing) * 4.8);
  opacity: 0.8;
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
