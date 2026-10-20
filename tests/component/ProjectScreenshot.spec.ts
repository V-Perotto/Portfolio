import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import ImageViewer from '@/components/base/ImageViewer.vue'
import ProjectScreenshot from '@/components/sections/ProjectScreenshot.vue'
import type { Screenshot } from '@/types/resume'

// Feature 009 (FR-015 a FR-019, research R5 e R7; contracts/debianserver-window.md §1 e §2): a captura
// como evidência e o visualizador na página. Feature 010 (research R7): o visualizador é o `ImageViewer`
// único, levado ao <body>; os testes do diálogo montam os dois juntos.
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

enableAutoUnmount(afterEach)

/** A captura e o visualizador da página, como no App.vue. */
const Host = defineComponent({ render: () => [h(ProjectScreenshot, { shot, id: 'demo' }), h(ImageViewer)] })
async function mountWithViewer() {
  const wrapper = mount(Host, { attachTo: document.body })
  await flushPromises()
  return wrapper
}
const dialogEl = () => document.querySelector<HTMLDialogElement>('body > dialog.shot-viewer')!
const linkEl = () => document.querySelector<HTMLAnchorElement>('a.shot-link')!

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

  it('o clique sem modificador abre o visualizador do <body>, prende a página e não segue o link', async () => {
    await mountWithViewer()
    const dialog = dialogEl()
    expect(dialog.getAttribute('aria-labelledby')).toBe('image-viewer-caption')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    linkEl().dispatchEvent(event)
    await flushPromises()
    expect(event.defaultPrevented).toBe(true)
    expect(dialog.open).toBe(true)
    expect(document.getElementById('image-viewer-caption')?.textContent).toBe('# painel do CasaOS do DebianServer · OUT 2026')
    expect(dialog.querySelector('img.shot-full')?.getAttribute('src')).toBe(`${base}projetos/demo/painel-2026-10-20-1396.webp`)
    expect(document.documentElement.classList.contains('window-maximized')).toBe(true)
    expect(document.activeElement).toBe(dialog.querySelector('button.shot-close'))
  })

  it('clique com Ctrl não abre o visualizador (o navegador abre a nova aba)', async () => {
    await mountWithViewer()
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ctrlKey: true })
    // depois do componente decidir, o teste impede a navegação (o happy-dom abriria a aba nova)
    let preventedByComponent: boolean | null = null
    const stop = (e: Event) => {
      preventedByComponent = e.defaultPrevented
      e.preventDefault()
    }
    window.addEventListener('click', stop)
    linkEl().dispatchEvent(event)
    window.removeEventListener('click', stop)
    await flushPromises()
    expect(preventedByComponent).toBe(false)
    expect(dialogEl().open).toBe(false)
  })

  it('o ✕ e o Esc fecham, soltam a página e devolvem o foco ao link', async () => {
    await mountWithViewer()
    const dialog = dialogEl()
    for (const closeWith of ['button', 'escape'] as const) {
      linkEl().dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }))
      await flushPromises()
      expect(dialog.open).toBe(true)
      if (closeWith === 'button') dialog.querySelector<HTMLButtonElement>('button.shot-close')!.click()
      else dialog.dispatchEvent(new Event('cancel', { cancelable: true }))
      await flushPromises()
      expect(dialog.open, closeWith).toBe(false)
      expect(document.documentElement.classList.contains('window-maximized'), closeWith).toBe(false)
      expect(document.activeElement, closeWith).toBe(linkEl())
    }
  })

  it('com a janela maximizada por baixo, fechar não solta a página (feature 010, research R7)', async () => {
    await mountWithViewer()
    document.documentElement.classList.add('window-maximized')
    linkEl().dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }))
    await flushPromises()
    dialogEl().querySelector<HTMLButtonElement>('button.shot-close')!.click()
    await flushPromises()
    expect(dialogEl().open).toBe(false)
    expect(document.documentElement.classList.contains('window-maximized')).toBe(true)
  })

  it('clique no fundo (o próprio diálogo) fecha; clique na imagem não', async () => {
    await mountWithViewer()
    const dialog = dialogEl()
    linkEl().dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }))
    await flushPromises()
    dialog.querySelector<HTMLImageElement>('img.shot-full')!.click()
    await flushPromises()
    expect(dialog.open).toBe(true)
    dialog.click()
    await flushPromises()
    expect(dialog.open).toBe(false)
  })
})
