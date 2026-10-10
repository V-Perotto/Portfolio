import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import RevealText from '@/components/base/RevealText.vue'

// research R6: no HTML pré-renderizado a frase é texto puro e visível (FR-012, FR-018).
describe('RevealText (SSR)', () => {
  it('renderiza a frase inteira como texto, sem estado inicial de animação', async () => {
    const text = 'Transformando processos em sistemas escaláveis'
    const html = await renderToString(createSSRApp({ render: () => h(RevealText, { text }) }))
    expect(html).toContain(text)
    expect(html).not.toMatch(/opacity:\s*0/)
    expect(html).not.toMatch(/blur\(/)
  })
})
