<script setup lang="ts">
import ExternalLink from '@/components/base/ExternalLink.vue'
import { certificateCaption, certificateImage, formatHours, verificationText } from '@/lib/certificates'
import { onViewerClick } from '@/lib/image-viewer'
import { formatDate } from '@/lib/period'
import type { Certificate, CertificatePlatform } from '@/types/resume'

/**
 * Certificado em cartão (feature 010, FR-013, research R3; contracts/certificates-window.md §4): na janela
 * maximizada, sem JavaScript e na impressão. Os mesmos fatos do arquivo YAML: data · carga horária,
 * título, plataforma (e o tipo, quando impresso), a ementa, a verificação e o link `ver certificado` para a
 * imagem em tamanho real. Sem miniatura: a pasta da DIO maximizada baixaria 33 de uma vez. No desktop,
 * como o cartão de challenge, a data fica numa coluna à esquerda.
 *
 * Sem o `BaseCard` (o brilho do SpotlightCard): são 61 cartões, e a camada do brilho em cada um pesava no
 * HTML pré-renderizado (research R11). A borda e o realce no hover e no foco são os do `base-card--card`.
 */
const props = defineProps<{ certificate: Certificate; platform: CertificatePlatform }>()

const image = certificateImage(props.platform, props.certificate)
const caption = certificateCaption(props.platform, props.certificate)
const fullUrl = `${import.meta.env.BASE_URL}${image.full}`
const onView = (e: MouseEvent) => onViewerClick(e, image, caption)
</script>

<template>
  <article class="cert-card">
    <div class="cert">
      <p class="card-date mono cert-date">// {{ formatDate(certificate.issued) }} · {{ formatHours(certificate.hours) }}</p>
      <h4 class="card-role cert-title">{{ certificate.title }}</h4>
      <p class="card-company mono cert-meta">{{ platform.name }}<template v-if="certificate.kind"> · {{ certificate.kind }}</template></p>
      <p v-if="certificate.syllabus" class="card-desc cert-syllabus">Ementa: {{ certificate.syllabus.join(', ') }}.</p>
      <p class="cert-links mono">
        <span class="prompt-dollar" aria-hidden="true">&gt; </span>
        <ExternalLink v-if="certificate.verification?.url" :href="certificate.verification.url">{{
          verificationText(certificate.verification)
        }}</ExternalLink>
        <span v-else-if="certificate.verification" class="cert-code">código {{ certificate.verification.code }}</span>
        <span v-else class="cert-code">código omitido por privacidade</span>
        <span class="cert-sep" aria-hidden="true"> · </span>
        <a class="ext-link cert-view" :href="fullUrl" target="_blank" rel="noopener noreferrer" @click="onView"
          >ver certificado<span class="sr-only">: {{ certificate.title }}, em tamanho real</span></a
        >
      </p>
    </div>
  </article>
</template>

<style scoped>
/* o visual do `base-card--card`, sem o brilho */
.cert-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--purple-light);
  border-radius: var(--radius-card);
  padding: calc(var(--spacing) * 4.8) calc(var(--spacing) * 6.4);
  transition: border-color 0.25s;
}

.cert-card:hover,
.cert-card:focus-within { border-left-color: var(--green-bright); }

.cert-title { font-size: 1rem; }
.cert-meta { margin-bottom: calc(var(--spacing) * 2.4); }
.cert-syllabus { font-size: 0.88rem; margin-bottom: calc(var(--spacing) * 2.4); }

.cert-links {
  font-size: 0.82rem;
  overflow-wrap: anywhere;
}

.cert-code,
.cert-sep { color: var(--text-dim); }

@media (min-width: 900px) {
  .cert {
    display: grid;
    grid-template-columns: 9rem minmax(0, 1fr);
    grid-template-areas:
      "date title"
      "date meta"
      "date syllabus"
      "date links";
    column-gap: calc(var(--spacing) * 6);
    align-items: baseline;
  }

  .cert-date { grid-area: date; margin: 0; }
  .cert-title { grid-area: title; }
  .cert-meta { grid-area: meta; }
  .cert-syllabus { grid-area: syllabus; }
  .cert-links { grid-area: links; }
}
</style>
