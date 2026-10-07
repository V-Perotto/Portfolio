<script setup lang="ts">
import decorImg from '@/assets/img/image3-bg.webp'
import RichText from '@/components/base/RichText.vue'
import SectionShell from '@/components/layout/SectionShell.vue'
import TerminalLine from '@/components/terminal/TerminalLine.vue'
import TerminalWindow from '@/components/terminal/TerminalWindow.vue'
import type { Profile } from '@/types/resume'

defineProps<{ profile: Profile }>()
</script>

<template>
  <SectionShell id="sobre" title="sobre" :decor="{ src: decorImg, tint: 'green', placement: 'right' }">
    <div v-reveal class="about-window">
      <TerminalWindow title="bash — sobre.txt">
        <TerminalLine>cat sobre.txt</TerminalLine>
        <TerminalLine output><RichText :value="profile.about" /></TerminalLine>
        <TerminalLine>whois vittorio --info</TerminalLine>
        <ul class="badges">
          <li v-for="attr in profile.attributes" :key="attr.label" class="badge">
            <span aria-hidden="true">{{ attr.icon }}</span> {{ attr.label }}
          </li>
        </ul>
      </TerminalWindow>
    </div>
  </SectionShell>
</template>

<style scoped>
.about-window {
  margin-top: calc(var(--spacing) * 6);
  border: 1px solid var(--border);
  border-radius: var(--radius-window);
  box-shadow: 0 8px 40px color-mix(in srgb, var(--shadow) 50%, transparent), 0 0 0 1px color-mix(in srgb, var(--purple-light) 8%, transparent);
  transition: box-shadow 0.25s, border-color 0.25s;
}

.about-window:hover {
  border-color: var(--purple-light);
  box-shadow: 0 8px 40px color-mix(in srgb, var(--shadow) 50%, transparent), 0 0 24px color-mix(in srgb, var(--purple-light) 25%, transparent);
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2.4);
  list-style: none;
  margin-bottom: calc(var(--spacing) * 4);
}

.badge {
  border: 1px solid var(--green);
  background: color-mix(in srgb, var(--green) 15%, transparent);
  color: var(--green-bright);
  padding: calc(var(--spacing) * 1.2) calc(var(--spacing) * 2.8);
  border-radius: var(--radius-nav);
  font-size: 0.78rem;
}
</style>
