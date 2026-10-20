import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import BranchedMenu from '@/components/vendor/vue-bits/BranchedMenu.vue'

// Feature 006, US1 (FR-003, FR-004, FR-010, research R4): o Branched Menu vendorizado é a árvore de
// arquivos das janelas de editor.
const items = [
  {
    label: 'carreira/',
    children: [
      { value: 'a', label: '2026-03_a.yml' },
      { value: 'b', label: '2025-04_b.yml' },
      { value: 'c', label: '2023-10_c.yml' },
    ],
  },
]

const mountMenu = (active = 'a', extra: Record<string, unknown> = {}) =>
  mount(BranchedMenu, { props: { items, active, ariaLabel: 'Arquivos de ~/carreira', radius: 0, ...extra } })

describe('BranchedMenu', () => {
  it('renderiza a pasta, os arquivos e o nome acessível do menu', () => {
    const wrapper = mountMenu()
    expect(wrapper.get('nav').attributes('aria-label')).toBe('Arquivos de ~/carreira')
    expect(wrapper.get('.bm-head').text()).toBe('carreira/')
    expect(wrapper.findAll('.bm-child').map((b) => b.text())).toEqual(['2026-03_a.yml', '2025-04_b.yml', '2023-10_c.yml'])
    expect(wrapper.findAll('.bm-child').map((b) => b.attributes('data-value'))).toEqual(['a', 'b', 'c'])
  })

  it('clique e Enter num arquivo emitem select com o valor', async () => {
    const wrapper = mountMenu()
    await wrapper.findAll('.bm-child')[1]!.trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toBe('b')
    // Enter num <button> dispara click no navegador; aqui, o próprio click
    await wrapper.findAll('.bm-child')[2]!.trigger('click')
    expect(wrapper.emitted('select')?.[1]?.[0]).toBe('c')
  })

  it('aria-current e data-active seguem a prop active', async () => {
    const wrapper = mountMenu('a')
    expect(wrapper.findAll('.bm-child')[0]!.attributes('aria-current')).toBe('true')
    await wrapper.setProps({ active: 'c' })
    expect(wrapper.findAll('.bm-child')[0]!.attributes('aria-current')).toBeUndefined()
    expect(wrapper.findAll('.bm-child')[2]!.attributes('aria-current')).toBe('true')
    expect(wrapper.findAll('.bm-child')[2]!.attributes('data-active')).toBe('')
  })

  it('a pasta dobra e desdobra: aria-expanded e tabindex dos arquivos', async () => {
    const wrapper = mountMenu()
    const head = wrapper.get('.bm-head')
    expect(head.attributes('aria-expanded')).toBe('true')
    expect(wrapper.findAll('.bm-child').every((b) => b.attributes('tabindex') === '0')).toBe(true)
    await head.trigger('click')
    await nextTick()
    expect(head.attributes('aria-expanded')).toBe('false')
    expect(wrapper.findAll('.bm-child').every((b) => b.attributes('tabindex') === '-1')).toBe(true)
  })

  it('radius 0: ramos em ângulo reto (arco de raio 0)', () => {
    const wrapper = mountMenu()
    const branches = wrapper.findAll('.bm-path:not(.bm-reach)').slice(1)
    expect(branches).toHaveLength(3)
    for (const path of branches) expect(path.attributes('d')).toContain('A 0 0 0 0 0')
  })

  it('o ramo do arquivo ativo é o único desenhado por inteiro', () => {
    const wrapper = mountMenu('b')
    const offsets = wrapper.findAll('.bm-reach').map((p) => (p.element as SVGPathElement).style.strokeDashoffset)
    expect(offsets[1]).toBe('0')
    expect(offsets[0]).not.toBe('0')
    expect(offsets[2]).not.toBe('0')
  })

  // Feature 010 (research R1; contracts/certificates-window.md §2): o acordeão da janela de Certificados
  describe('modo exclusivo (feature 010)', () => {
    const folders = [
      { label: 'dio/', value: 'dio', children: [1, 2, 3, 4, 5].map((n) => ({ value: `dio/${n}`, label: `dio-${n}.yml` })) },
      { label: 'udemy/', value: 'udemy', children: [1, 2].map((n) => ({ value: `udemy/${n}`, label: `udemy-${n}.yml` })) },
      { label: 'senai/', value: 'senai', children: [{ value: 'senai/1', label: 'senai-1.yml' }] },
    ]
    const mountFolders = (extra: Record<string, unknown> = {}) =>
      mount(BranchedMenu, { props: { items: folders, active: 'dio/1', exclusive: true, maxRows: 4, ...extra } })
    const openHeads = (wrapper: ReturnType<typeof mountFolders>) =>
      wrapper.findAll('.bm-head').map((h) => h.attributes('aria-expanded'))

    it('abre só a 1ª pasta; abrir outra fecha a anterior e emite toggle', async () => {
      const wrapper = mountFolders()
      expect(openHeads(wrapper)).toEqual(['true', 'false', 'false'])
      await wrapper.findAll('.bm-head')[1]!.trigger('click')
      expect(openHeads(wrapper)).toEqual(['false', 'true', 'false'])
      expect(wrapper.emitted('toggle')?.[0]).toEqual([1, true])
    })

    it('clicar na pasta aberta não a fecha nem emite toggle (FR-004)', async () => {
      const wrapper = mountFolders()
      await wrapper.findAll('.bm-head')[0]!.trigger('click')
      expect(openHeads(wrapper)).toEqual(['true', 'false', 'false'])
      expect(wrapper.emitted('toggle')).toBeUndefined()
    })

    it('a dobra fechada é inert; a aberta não (fora do Tab e do leitor de tela)', async () => {
      const wrapper = mountFolders()
      const folds = () => wrapper.findAll('.bm-fold').map((f) => f.attributes('inert'))
      expect(folds()).toEqual([undefined, '', ''])
      await wrapper.findAll('.bm-head')[2]!.trigger('click')
      expect(folds()).toEqual(['', '', undefined])
    })

    it('maxRows: as variáveis da rolagem e da altura reservada no nav (FR-005, SC-003)', () => {
      const nav = mountFolders().get('nav')
      expect(nav.classes()).toContain('bm-exclusive')
      const style = nav.attributes('style') ?? ''
      expect(style).toContain('--bm-max-rows: 4')
      expect(style).toContain('--bm-sections: 3')
      expect(style).toContain('--bm-largest: 5')
    })
  })

  it('sem exclusive: a pasta aberta fecha de novo, sem as variáveis do acordeão (como na 006)', async () => {
    const wrapper = mountMenu()
    expect(wrapper.get('nav').classes()).not.toContain('bm-exclusive')
    expect(wrapper.get('nav').attributes('style')).not.toContain('--bm-max-rows')
    await wrapper.get('.bm-head').trigger('click')
    expect(wrapper.get('.bm-head').attributes('aria-expanded')).toBe('false')
    expect(wrapper.get('.bm-fold').attributes('inert')).toBe('')
  })
})
