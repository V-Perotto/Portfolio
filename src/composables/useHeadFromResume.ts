import { useHead } from '@unhead/vue'
import { resume } from '@/data/resume'

/** Título, descrição e Open Graph a partir de `resume.profile.seo` (FR-029). */
export function useHeadFromResume(): void {
  const { seo } = resume.profile
  // o caminho vem do `base` do Vite; o domínio é o do GitHub Pages
  const url = new URL(import.meta.env.BASE_URL, 'https://v-perotto.github.io').href

  useHead({
    title: seo.title,
    meta: [
      { name: 'description', content: seo.description },
      { property: 'og:title', content: seo.title },
      { property: 'og:description', content: seo.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: url },
      { property: 'og:locale', content: 'pt_BR' },
      ...(seo.ogImage ? [{ property: 'og:image', content: new URL(seo.ogImage, url).href }] : []),
    ],
  })
}
