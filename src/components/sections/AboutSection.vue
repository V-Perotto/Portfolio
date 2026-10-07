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
  margin-top: 1.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-window);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(123, 63, 179, 0.08);
  transition: box-shadow 0.3s, border-color 0.3s;
}

.about-window:hover {
  border-color: var(--purple-light);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(123, 63, 179, 0.25);
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  list-style: none;
  margin-bottom: 1rem;
}

.badge {
  border: 1px solid var(--green);
  background: rgba(32, 94, 68, 0.15);
  color: var(--green-bright);
  padding: 0.3rem 0.7rem;
  border-radius: var(--radius-nav);
  font-size: 0.78rem;
}
</style>
