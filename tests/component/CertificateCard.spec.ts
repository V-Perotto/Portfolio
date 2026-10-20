import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import ImageViewer from '@/components/base/ImageViewer.vue'
import CertificateCard from '@/components/sections/CertificateCard.vue'
import { resume } from '@/data/resume'
import type { CertificatePlatform } from '@/types/resume'

// Feature 010 (FR-013, research R3 e R5; contracts/certificates-window.md §4): o cartão do certificado.
const platform = (id: string) => resume.certificatePlatforms.find((p) => p.id === id)!
const cert = (p: CertificatePlatform, id: string) => p.certificates.find((c) => c.id === id)!
const base = import.meta.env.BASE_URL

enableAutoUnmount(afterEach)
afterEach(() => {
  document.body.innerHTML = ''
  document.documentElement.classList.remove('window-maximized')
})

describe('CertificateCard', () => {
  it('bootcamp da DIO: data · horas, título, plataforma · tipo, link de verificação e ver certificado', () => {
    const dio = platform('dio')
    const wrapper = mount(CertificateCard, { props: { platform: dio, certificate: cert(dio, 'empregotech-basico') } })
    expect(wrapper.get('.cert-date').text()).toBe('// 29 JUL 2020 · 39 h')
    expect(wrapper.get('h4').text()).toBe('Programa EmpregoTech Curitiba - Básico')
    expect(wrapper.get('.cert-meta').text()).toBe('DIO · bootcamp')
    const verify = wrapper.get('.cert-links a.ext-link:not(.cert-view)')
    expect(verify.attributes('href')).toBe('https://hermes.dio.me/certificates/207D7222.pdf')
    expect(verify.attributes('target')).toBe('_blank')
    expect(verify.attributes('rel')).toBe('noopener noreferrer')
    expect(verify.text()).toContain('hermes.dio.me/certificates/207D7222.pdf')
    const view = wrapper.get('a.cert-view')
    expect(view.attributes('href')).toBe(`${base}certificados/dio/2020-07-29_empregotech-basico-1200.webp`)
    expect(view.attributes('target')).toBe('_blank')
    expect(view.text()).toContain('ver certificado')
    expect(view.get('.sr-only').text()).toBe(': Programa EmpregoTech Curitiba - Básico, em tamanho real')
  })

  it('Prime Academy: o código como texto, sem link de verificação (C3)', () => {
    const prime = platform('prime-academy')
    const wrapper = mount(CertificateCard, { props: { platform: prime, certificate: cert(prime, 'apis') } })
    expect(wrapper.get('.cert-meta').text()).toBe('Prime Academy')
    expect(wrapper.get('.cert-code').text()).toBe('código 666923b8ee6805a1a5040c2ddcb47d02')
    expect(wrapper.findAll('.cert-links a')).toHaveLength(1)
  })

  it('Promenady: o link do e-certificado com o texto host · código', () => {
    const promenady = platform('promenady')
    const wrapper = mount(CertificateCard, { props: { platform: promenady, certificate: cert(promenady, 'formacao-consultores') } })
    const verify = wrapper.get('.cert-links a.ext-link:not(.cert-view)')
    expect(verify.attributes('href')).toBe('https://e-certificado.com/login/autenticar?c=1641756A81BF361B10825550')
    expect(verify.text()).toContain('e-certificado.com · 1641756A81BF361B10825550')
  })

  it('SENAI: a ementa e o código omitido por privacidade, sem nenhum código (C2)', () => {
    const senai = platform('senai')
    const wrapper = mount(CertificateCard, { props: { platform: senai, certificate: cert(senai, 'ia') } })
    expect(wrapper.get('.cert-syllabus').text()).toMatch(/^Ementa: Inteligência Artificial, Aprendizagem de máquina, .*robótica\.$/)
    expect(wrapper.get('.cert-code').text()).toBe('código omitido por privacidade')
    expect(wrapper.findAll('.cert-links a')).toHaveLength(1)
  })

  it('ver certificado abre o visualizador com a imagem e a legenda; com Ctrl, segue o link', async () => {
    const dio = platform('dio')
    const Host = defineComponent({
      render: () => [h(CertificateCard, { platform: dio, certificate: cert(dio, 'logica-programacao') }), h(ImageViewer)],
    })
    mount(Host, { attachTo: document.body })
    await flushPromises()
    const view = document.querySelector<HTMLAnchorElement>('a.cert-view')!
    const dialog = document.querySelector<HTMLDialogElement>('body > dialog.shot-viewer')!

    const stop = (e: Event) => e.preventDefault()
    window.addEventListener('click', stop)
    view.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ctrlKey: true }))
    window.removeEventListener('click', stop)
    await flushPromises()
    expect(dialog.open).toBe(false)

    view.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }))
    await flushPromises()
    expect(dialog.open).toBe(true)
    expect(dialog.querySelector('img.shot-full')?.getAttribute('src')).toBe(`${base}certificados/dio/2020-04-13_logica-programacao-1200.webp`)
    expect(document.getElementById('image-viewer-caption')?.textContent).toBe('# DIO · Lógica de programação essencial · 13 ABR 2020')
  })
})
