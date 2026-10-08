<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import PromptLogo from '@/components/terminal/PromptLogo.vue'
import { useActiveSection } from '@/composables/useActiveSection'
import type { NavSection } from '@/lib/sections'

const props = defineProps<{ sections: readonly NavSection[] }>()

const open = ref(false)
const toggle = ref<HTMLButtonElement | null>(null)
const active = useActiveSection(() => props.sections.map((s) => s.id))

const close = () => {
  open.value = false
}

// Esc fecha o menu aberto e devolve o foco ao botão (FR-009); o foco nunca fica preso no menu
const onKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return
  close()
  toggle.value?.focus()
}

watch(open, (isOpen) => {
  if (isOpen) document.addEventListener('keydown', onKeydown)
  else document.removeEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <nav class="navbar" aria-label="Principal">
    <div class="nav-inner">
      <a href="#home" class="nav-logo"><PromptLogo /></a>
      <button
        ref="toggle"
        type="button"
        :class="['nav-toggle', { open }]"
        aria-controls="navLinks"
        :aria-expanded="open"
        :aria-label="open ? 'Fechar menu' : 'Abrir menu'"
        @click="open = !open"
      >
        <span /><span /><span />
      </button>
      <ul id="navLinks" :class="['nav-links', { open }]">
        <li v-for="(section, i) in sections" :key="section.id">
          <a
            :href="`#${section.id}`"
            :class="{ 'nav-cta': i === sections.length - 1, active: active === section.id }"
            :aria-current="active === section.id ? 'location' : undefined"
            @click="close"
          >{{ section.label }}</a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: color-mix(in srgb, var(--bg) 85%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}

.nav-inner {
  max-width: var(--container-page);
  margin: 0 auto;
  padding: calc(var(--spacing) * 3.6) calc(var(--spacing) * 6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
}

.nav-logo {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  text-decoration: none;
  white-space: nowrap;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 3.6);
  list-style: none;
}

.nav-links a {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text-dim);
  text-decoration: none;
  /* mesma métrica do .nav-cta para o destaque .active não deslocar o layout */
  border: 1px solid transparent;
  padding: calc(var(--spacing) * 1) calc(var(--spacing) * 2.8);
  border-radius: var(--radius-nav);
  transition: color 0.2s, text-shadow 0.2s, border-color 0.2s, background 0.2s;
}

.nav-links a:hover {
  color: var(--green-bright);
  text-shadow: 0 0 12px color-mix(in srgb, var(--green-bright) 60%, transparent);
}

.nav-links a.nav-cta {
  color: var(--purple-glow);
  border: 1px solid var(--purple);
  transition: all 0.2s;
}

.nav-links a.nav-cta:hover {
  background: var(--purple);
  color: var(--on-accent);
  box-shadow: 0 0 16px color-mix(in srgb, var(--purple-light) 50%, transparent);
  text-shadow: none;
}

/* seção ativa destacada em verde (espelho do .nav-cta) */
.nav-links a.active,
.nav-links a.nav-cta.active {
  color: var(--green-bright);
  border-color: var(--green);
  background: color-mix(in srgb, var(--green) 12%, transparent);
  box-shadow: 0 0 14px color-mix(in srgb, var(--green-light) 35%, transparent);
  text-shadow: none;
}

.nav-toggle {
  display: none;
  flex-direction: column;
  gap: calc(var(--spacing) * 1.25);
  background: none;
  border: none;
  cursor: pointer;
  padding: calc(var(--spacing) * 1.5);
}

.nav-toggle span {
  width: 24px;
  height: 2px;
  background: var(--green-bright);
  transition: transform 0.25s, opacity 0.25s;
}

.nav-toggle.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.nav-toggle.open span:nth-child(2) { opacity: 0; }
.nav-toggle.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* recolhe até 840px: os 6 links precisam de ~815px em linha (com 760px, cortavam entre 761 e ~835px) */
@media (max-width: 840px) {
  /* menu recolhível só quando há JS para abri-lo */
  html.js .nav-toggle { display: flex; }

  html.js .nav-links {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    background: color-mix(in srgb, var(--bg) 97%, transparent);
    border-bottom: 1px solid var(--border);
    max-height: 0;
    overflow: hidden;
    /* fechado também sai da ordem de tabulação; a visibilidade só some depois da animação */
    visibility: hidden;
    transition: max-height 0.3s ease, visibility 0s linear 0.3s;
  }

  html.js .nav-links.open {
    max-height: 340px;
    visibility: visible;
    transition: max-height 0.3s ease;
  }

  html.js .nav-links li { border-top: 1px solid var(--border); }

  html.js .nav-links a {
    display: block;
    padding: calc(var(--spacing) * 3.6) calc(var(--spacing) * 6);
  }

  html.js .nav-links a.nav-cta { border: none; border-radius: 0; padding: calc(var(--spacing) * 3.6) calc(var(--spacing) * 6); }

  /* sem JS: a navegação fica no fluxo, com os links expostos em linhas */
  html:not(.js) .navbar { position: static; }
  html:not(.js) .nav-inner { flex-wrap: wrap; }
  html:not(.js) .nav-links { flex-wrap: wrap; gap: calc(var(--spacing) * 1.6); }
}
</style>
