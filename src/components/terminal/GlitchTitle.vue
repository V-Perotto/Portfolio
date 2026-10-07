<script setup lang="ts">
/**
 * Nome com glitch (FR-032). As camadas coloridas ficam sempre (como antes, inclusive com movimento
 * reduzido); só a animação depende de `html.motion`.
 */
defineProps<{ text: string }>()
</script>

<template>
  <h1 class="glitch" :data-text="text">{{ text }}</h1>
</template>

<style scoped>
.glitch {
  position: relative;
  font-family: var(--font-mono);
  font-size: clamp(2.2rem, 7vw, 4.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.6;
  color: var(--text);
  text-shadow: 0 0 30px rgba(160, 106, 224, 0.35);
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  opacity: 0.85;
}

.glitch::before {
  color: var(--purple-glow);
  clip-path: inset(0 0 60% 0);
}

.glitch::after {
  color: var(--green-bright);
  clip-path: inset(60% 0 0 0);
}

html.motion .glitch::before { animation: glitch-shift 3.2s infinite steps(1); }
html.motion .glitch::after { animation: glitch-shift 2.7s infinite steps(1) reverse; }

@keyframes glitch-shift {
  0%, 87%, 100% { transform: translate(0, 0); opacity: 0; }
  88% { transform: translate(-4px, 2px); opacity: 0.8; }
  90% { transform: translate(4px, -2px); opacity: 0.8; }
  92% { transform: translate(-2px, -1px); opacity: 0.6; }
  94% { transform: translate(2px, 1px); opacity: 0.8; }
  96% { transform: translate(0, 0); opacity: 0; }
}
</style>
