<script setup lang="ts">
import ExternalLink from '@/components/base/ExternalLink.vue'
import SectionShell from '@/components/layout/SectionShell.vue'
import DesktopWindow from '@/components/terminal/DesktopWindow.vue'
import TerminalLine from '@/components/terminal/TerminalLine.vue'
import TerminalWindow from '@/components/terminal/TerminalWindow.vue'
import type { Contact } from '@/types/resume'

defineProps<{ contacts: readonly Contact[] }>()

const display = (contact: Contact) => contact.label ?? contact.url.replace(/^https?:\/\//, '')
</script>

<template>
  <SectionShell id="contato" title="contato">
    <DesktopWindow v-reveal class="contact-slot" title="contato.sh" kind="script">
      <div class="contact-window">
        <TerminalWindow title="contato.sh">
          <TerminalLine>./contato.sh --all</TerminalLine>
          <ul class="contact-list">
            <li v-for="contact in contacts" :key="contact.key">
              <span class="c-key">{{ contact.key }}</span><span class="c-sep">=</span>
              <ExternalLink :href="contact.url">{{ display(contact) }}</ExternalLink>
            </li>
          </ul>
          <TerminalLine>
            <span class="hl-green">Conexão estabelecida. Aguardando sua mensagem...</span><span class="cursor" aria-hidden="true">▊</span>
          </TerminalLine>
        </TerminalWindow>
      </div>
    </DesktopWindow>
  </SectionShell>
</template>

<style scoped>
/* aberta, a janela fica centralizada com até 720px; minimizada ou fechada, a caixa ocupa a largura da
   seção e o ícone fica à esquerda, como no Sobre e nos projetos (feature 005, FR-025) */
.contact-slot { margin-top: calc(var(--spacing) * 6); }

.contact-slot[data-window-state="open"] {
  margin-inline: auto;
  max-width: 720px;
}

.contact-window {
  border: 1px solid var(--border);
  border-radius: var(--radius-window);
  box-shadow: 0 8px 40px color-mix(in srgb, var(--shadow) 50%, transparent), 0 0 0 1px color-mix(in srgb, var(--purple-light) 8%, transparent);
  transition: box-shadow 0.25s, border-color 0.25s;
}

.contact-window:hover {
  border-color: var(--purple-light);
  box-shadow: 0 8px 40px color-mix(in srgb, var(--shadow) 50%, transparent), 0 0 24px color-mix(in srgb, var(--purple-light) 25%, transparent);
}

.contact-list {
  list-style: none;
  margin: calc(var(--spacing) * 1.6) 0 calc(var(--spacing) * 5.6);
}

.contact-list li {
  margin-bottom: calc(var(--spacing) * 2.2);
  overflow-wrap: anywhere;
}

.c-key { color: var(--purple-glow); }
.c-sep { color: var(--text-dim); margin: 0 calc(var(--spacing) * 1.6); }
</style>
