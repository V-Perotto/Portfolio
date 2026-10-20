<script setup lang="ts">
import { computed } from 'vue'
import SectionShell from '@/components/layout/SectionShell.vue'
import EditorWindow from '@/components/terminal/EditorWindow.vue'
import { byIssuedDesc } from '@/lib/certificates'
import { certificateFolder } from '@/lib/editor-files'
import type { CertificatePlatform } from '@/types/resume'
import CertificateCard from './CertificateCard.vue'

/**
 * Certificados numa janela de editor (feature 010, FR-001 a FR-016; contracts/certificates-window.md §1 e
 * §4): `code ~/certificados`, a árvore com uma pasta por plataforma, em acordeão, e um arquivo YAML por
 * certificado, com a miniatura. Os cartões, agrupados por plataforma, aparecem na janela maximizada (só os
 * da pasta aberta: `openGroup`), sem JavaScript e na impressão (todos, FR-014).
 */
const props = defineProps<{ platforms: readonly CertificatePlatform[] }>()
const folder = computed(() => certificateFolder(props.platforms))
const groups = computed(() =>
  props.platforms.map((platform) => ({ platform, certificates: byIssuedDesc(platform.certificates) })),
)
</script>

<template>
  <SectionShell id="certificados" title="certificados" lead="ls -R ~/certificados">
    <EditorWindow v-reveal :folder="folder" window-id="certificados">
      <template #cards="{ openGroup }">
        <section
          v-for="{ platform, certificates } in groups"
          :key="platform.id"
          class="cert-group"
          :data-card-group="platform.id"
          :hidden="openGroup != null && openGroup !== platform.id"
        >
          <h3 class="cert-group-title mono">{{ platform.name }} · {{ certificates.length }} {{ certificates.length === 1 ? 'certificado' : 'certificados' }}</h3>
          <ol class="cert-list">
            <li v-for="cert in certificates" :key="cert.id" :data-card-id="`${platform.id}/${cert.id}`">
              <CertificateCard :platform="platform" :certificate="cert" />
            </li>
          </ol>
        </section>
      </template>
    </EditorWindow>
  </SectionShell>
</template>

<style scoped>
.cert-group + .cert-group { margin-top: calc(var(--spacing) * 8); }

.cert-group-title {
  margin-bottom: calc(var(--spacing) * 3.2);
  color: var(--green-bright);
  font-size: 0.9rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.cert-list {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 3.2);
  list-style: none;
}
</style>
