<script setup lang="ts">
import ExternalLink from '@/components/base/ExternalLink.vue'
import SectionShell from '@/components/layout/SectionShell.vue'
import TerminalLine from '@/components/terminal/TerminalLine.vue'
import TerminalWindow from '@/components/terminal/TerminalWindow.vue'
import type { Contact } from '@/types/resume'

defineProps<{ contacts: readonly Contact[] }>()

const display = (contact: Contact) => contact.label ?? contact.url.replace(/^https?:\/\//, '')
</script>

<template>
  <SectionShell id="contato" title="contato">
    <div v-reveal class="contact-window">
      <TerminalWindow title="bash — contato.sh">
        <TerminalLine>./contato.sh --all</TerminalLine>
        <ul class="contact-list">
          <li v-for="contact in contacts" :key="contact.key">
            <span class="c-key">{{ contact.key }}</span><span class="c-sep">=</span>
            <ExternalLink :href="contact.url" class="c-val">{{ display(contact) }}</ExternalLink>
          </li>
        </ul>
        <TerminalLine>
          <span class="hl-green">Conexão estabelecida. Aguardando sua mensagem...</span><span class="cursor" aria-hidden="true">▊</span>
        </TerminalLine>
      </TerminalWindow>
    </div>
  </SectionShell>
</template>

<style scoped>
.contact-window {
  margin: calc(var(--spacing) * 6) auto 0;
  max-width: 720px;
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

.c-val {
  color: var(--green-bright);
  text-decoration: none;
  border-bottom: 1px dashed transparent;
  transition: border-color 0.2s, text-shadow 0.2s;
}

.c-val:hover {
  border-bottom-color: var(--green-bright);
  text-shadow: 0 0 12px color-mix(in srgb, var(--green-bright) 70%, transparent);
}
</style>
