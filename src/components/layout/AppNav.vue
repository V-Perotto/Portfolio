<script setup lang="ts">
import { ref } from 'vue'
import PromptLogo from '@/components/terminal/PromptLogo.vue'
import { useActiveSection } from '@/composables/useActiveSection'
import type { NavSection } from '@/lib/sections'

const props = defineProps<{ sections: readonly NavSection[] }>()

const open = ref(false)
const active = useActiveSection(() => props.sections.map((s) => s.id))

const close = () => {
  open.value = false
}
</script>

<template>
  <nav class="navbar" aria-label="Principal">
    <div class="nav-inner">
      <a href="#home" class="nav-logo"><PromptLogo /></a>
      <button
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
  background: rgba(10, 6, 18, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}

.nav-inner {
  max-width: var(--container-page);
  margin: 0 auto;
  padding: 0.9rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.nav-logo {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  text-decoration: none;
  white-space: nowrap;
}

.nav-links {
  display: flex;
  gap: 0.9rem;
  list-style: none;
}

.nav-links a {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text-dim);
  text-decoration: none;
  /* mesma métrica do .nav-cta para o destaque .active não deslocar o layout */
  border: 1px solid transparent;
  padding: 0.25rem 0.7rem;
  border-radius: var(--radius-nav);
  transition: color 0.2s, text-shadow 0.2s, border-color 0.2s, background 0.2s;
}

.nav-links a:hover {
  color: var(--green-bright);
  text-shadow: 0 0 12px rgba(74, 222, 155, 0.6);
}

.nav-links a.nav-cta {
  color: var(--purple-glow);
  border: 1px solid var(--purple);
  transition: all 0.2s;
}

.nav-links a.nav-cta:hover {
  background: var(--purple);
  color: #fff;
  box-shadow: 0 0 16px rgba(123, 63, 179, 0.5);
  text-shadow: none;
}

/* seção ativa destacada em verde (espelho do .nav-cta) */
.nav-links a.active,
.nav-links a.nav-cta.active {
  color: var(--green-bright);
  border-color: var(--green);
  background: rgba(32, 94, 68, 0.12);
  box-shadow: 0 0 14px rgba(47, 168, 118, 0.35);
  text-shadow: none;
}

.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
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

@media (max-width: 760px) {
  /* menu recolhível só quando há JS para abri-lo */
  html.js .nav-toggle { display: flex; }

  html.js .nav-links {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    gap: 0;
    background: rgba(10, 6, 18, 0.97);
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
    padding: 0.9rem 1.5rem;
  }

  html.js .nav-links a.nav-cta { border: none; border-radius: 0; padding: 0.9rem 1.5rem; }

  /* sem JS: a navegação fica no fluxo, com os links expostos em linhas */
  html:not(.js) .navbar { position: static; }
  html:not(.js) .nav-inner { flex-wrap: wrap; }
  html:not(.js) .nav-links { flex-wrap: wrap; gap: 0.4rem; }
}
</style>
