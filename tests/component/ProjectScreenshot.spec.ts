import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import ProjectScreenshot from '@/components/sections/ProjectScreenshot.vue'
import type { Screenshot } from '@/types/resume'

// Feature 009 (FR-015 a FR-019, research R5 e R7; contracts/debianserver-window.md §1 e §2): a captura
// como evidência e o visualizador na página.
const shot: Screenshot = {
  src: 'projetos/demo/painel-2026-10-20-800.webp',
  srcWidth: 800,
  full: 'projetos/demo/painel-2026-10-20-1396.webp',
  width: 1396,
  height: 809,
  alt: 'Painel do servidor em 20/10/2026',
  caption: 'painel do CasaOS do DebianServer',
  captured: '2026-10',
}

const base = import.meta.env.BASE_URL

afterEach(() => {
  document.body.innerHTML = ''
  document.documentElement.classList.remove('window-maximized')
})

describe('ProjectScreenshot', () => {
  it('figura: link para o tamanho real, imagem preguiçosa com srcset e proporção, aviso e legenda (FR-015 a FR-018)', () => {
    const wrapper = mount(ProjectScreenshot, { props: { shot, id: 'demo' } })
    const link = wrapper.get('a.shot-link')
    expect(link.attributes('href')).toBe(`${base}projetos/demo/painel-2026-10-20-1396.webp`)
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
    const img = link.get('img')
    expect(img.attributes('loading')).toBe('lazy')
    expect(img.attributes('width')).toBe('1396')
    expect(img.attributes('height')).toBe('809')
    expect(img.attributes('alt')).toBe('Painel do servidor em 20/10/2026')
    expect(img.attributes('srcset')).toBe(
      `${base}projetos/demo/painel-2026-10-20-800.webp 800w, ${base}projetos/demo/painel-2026-10-20-1396.webp 1396w`,
    )
    expect(link.get('.sr-only').text()).toBe('(abre a captura em tamanho real)')
    expect(wrapper.get('figcaption').text()).toBe('# painel do CasaOS do DebianServer · OUT 2026')
  })

  it('sem JavaScript (HTML pré-renderizado), não há diálogo: a imagem aparece uma vez só', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(ProjectScreenshot, { shot, id: 'demo' }) }))
    expect(html).not.toContain('<dialog')
    expect(html.match(/<img/g)).toHaveLength(1)
  })

  it('o clique sem modificador abre o visualizador, prende a página e não segue o link', async () => {
    const wrapper = mount(ProjectScreenshot, { props: { shot, id: 'demo' }, attachTo: document.body })
    await nextTick()
    const dialog = wrapper.get('dialog.shot-viewer').element as HTMLDialogElement
    expect(dialog.getAttribute('aria-labelledby')).toBe('shot-viewer-caption-demo')
    expect(wrapper.get('#shot-viewer-caption-demo').text()).toBe('# painel do CasaOS do DebianServer · OUT 2026')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    wrapper.get('a.shot-link').element.dispatchEvent(event)
    await nextTick()
    expect(event.defaultPrevented).toBe(true)
    expect(dialog.open).toBe(true)
    expect(document.documentElement.classList.contains('window-maximized')).toBe(true)
    expect(document.activeElement).toBe(wrapper.get('button.shot-close').element)
  })

  it('clique com Ctrl não abre o visualizador (o navegador abre a nova aba)', async () => {
    const wrapper = mount(ProjectScreenshot, { props: { shot, id: 'demo' }, attachTo: document.body })
    await nextTick()
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ctrlKey: true })
    // depois do componente decidir, o teste impede a navegação (o happy-dom abriria a aba nova)
    let preventedByComponent: boolean | null = null
    const stop = (e: Event) => {
      preventedByComponent = e.defaultPrevented
      e.preventDefault()
    }
    window.addEventListener('click', stop)
    wrapper.get('a.shot-link').element.dispatchEvent(event)
    window.removeEventListener('click', stop)
    await nextTick()
    expect(preventedByComponent).toBe(false)
    expect((wrapper.get('dialog').element as HTMLDialogElement).open).toBe(false)
  })

  it('o ✕ e o Esc fecham, soltam a página e devolvem o foco ao link', async () => {
    const wrapper = mount(ProjectScreenshot, { props: { shot, id: 'demo' }, attachTo: document.body })
    await nextTick()
    const dialog = wrapper.get('dialog').element as HTMLDialogElement
    const link = wrapper.get('a.shot-link')
    for (const closeWith of ['button', 'escape'] as const) {
      await link.trigger('click', { button: 0 })
      expect(dialog.open).toBe(true)
      if (closeWith === 'button') await wrapper.get('button.shot-close').trigger('click')
      else dialog.dispatchEvent(new Event('cancel', { cancelable: true }))
      await nextTick()
      expect(dialog.open, closeWith).toBe(false)
      expect(document.documentElement.classList.contains('window-maximized'), closeWith).toBe(false)
      expect(document.activeElement, closeWith).toBe(link.element)
    }
  })

  it('clique no fundo (o próprio diálogo) fecha; clique na imagem não', async () => {
    const wrapper = mount(ProjectScreenshot, { props: { shot, id: 'demo' }, attachTo: document.body })
    await nextTick()
    const dialog = wrapper.get('dialog').element as HTMLDialogElement
    await wrapper.get('a.shot-link').trigger('click', { button: 0 })
    await wrapper.get('img.shot-full').trigger('click')
    expect(dialog.open).toBe(true)
    await wrapper.get('dialog').trigger('click')
    expect(dialog.open).toBe(false)
  })
})
