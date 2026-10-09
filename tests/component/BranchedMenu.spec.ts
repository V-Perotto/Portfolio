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
})
