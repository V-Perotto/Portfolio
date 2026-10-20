import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import ImageViewer from '@/components/base/ImageViewer.vue'
import ZoomFigure from '@/components/base/ZoomFigure.vue'
import type { ImageFile } from '@/types/resume'

// Feature 010 (research R6 e R7; contracts/certificates-window.md §3 e §5): a figura que abre em tamanho real
// no visualizador único da página.
const image: ImageFile = {
  src: 'certificados/dio/2020-04-13_logica-programacao-640.webp',
  srcWidth: 640,
  full: 'certificados/dio/2020-04-13_logica-programacao-1200.webp',
  width: 1200,
  height: 849,
  alt: 'Certificado da DIO: Lógica de programação essencial, 4 h, 13/04/2020',
}
const props = {
  image,
  viewerCaption: '# DIO · Lógica de programação essencial · 13 ABR 2020',
  sizes: '(max-width: 760px) calc(100vw - 6rem), 20rem',
  openLabel: '(abre o certificado em tamanho real)',
}
const base = import.meta.env.BASE_URL

enableAutoUnmount(afterEach)
afterEach(() => {
  document.body.innerHTML = ''
  document.documentElement.classList.remove('window-maximized')
})

describe('ZoomFigure', () => {
  it('link para o tamanho real, proporção reservada, srcset, sizes e aviso; sem legenda quando não há', () => {
    const wrapper = mount(ZoomFigure, { props })
    const link = wrapper.get('a.shot-link')
    expect(link.attributes('href')).toBe(`${base}${image.full}`)
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
    expect(link.attributes('style')).toContain('aspect-ratio: 1200 / 849')
    const img = link.get('img')
    expect(img.attributes('loading')).toBe('lazy')
    expect(img.attributes('src')).toBe(`${base}${image.src}`)
    expect(img.attributes('srcset')).toBe(`${base}${image.src} 640w, ${base}${image.full} 1200w`)
    expect(img.attributes('sizes')).toBe(props.sizes)
    expect(link.get('.sr-only').text()).toBe('(abre o certificado em tamanho real)')
    expect(wrapper.find('figcaption').exists()).toBe(false)
  })

  it('com legenda, a figcaption no estilo dos comentários', () => {
    const wrapper = mount(ZoomFigure, { props: { ...props, caption: '# 1º dia na Prime Control · 15 OUT 2020' } })
    expect(wrapper.get('figcaption.shot-caption').text()).toBe('# 1º dia na Prime Control · 15 OUT 2020')
  })

  it('load=false: só a caixa com a proporção, sem <img>; o nome acessível continua (FR-009)', () => {
    const wrapper = mount(ZoomFigure, { props: { ...props, load: false } })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.get('a.shot-link').attributes('style')).toContain('aspect-ratio: 1200 / 849')
    expect(wrapper.get('.sr-only').text()).toBe(`${image.alt} (abre o certificado em tamanho real)`)
  })

  it('clique abre o visualizador com a imagem e a legenda; Ctrl+clique não; o foco volta ao link', async () => {
    const Host = defineComponent({ render: () => [h(ZoomFigure, props), h(ImageViewer)] })
    mount(Host, { attachTo: document.body })
    await flushPromises()
    const link = document.querySelector<HTMLAnchorElement>('a.shot-link')!
    const dialog = document.querySelector<HTMLDialogElement>('body > dialog.shot-viewer')!

    const withCtrl = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ctrlKey: true })
    const stop = (e: Event) => e.preventDefault()
    window.addEventListener('click', stop)
    link.dispatchEvent(withCtrl)
    window.removeEventListener('click', stop)
    await flushPromises()
    expect(dialog.open).toBe(false)

    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }))
    await flushPromises()
    expect(dialog.open).toBe(true)
    expect(dialog.querySelector('img.shot-full')?.getAttribute('src')).toBe(`${base}${image.full}`)
    expect(dialog.querySelector('img.shot-full')?.getAttribute('alt')).toBe(image.alt)
    expect(document.getElementById('image-viewer-caption')?.textContent).toBe(props.viewerCaption)

    dialog.dispatchEvent(new Event('cancel', { cancelable: true }))
    await flushPromises()
    expect(dialog.open).toBe(false)
    expect(document.activeElement).toBe(link)
  })
})
