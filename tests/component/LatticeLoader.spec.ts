import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LatticeLoader from '@/components/vendor/vue-bits/LatticeLoader.vue'

// Feature 006, US5 (FR-036 a FR-041, research R13): o Lattice Loader vendorizado.
const props = {
  label: 'Inicializando portfolio.service',
  doneLabel: 'portfolio.service carregado com sucesso!',
  grid: 3 as const,
  gap: 1,
  idleOpacity: 0.15,
  glow: true,
  shape: 'square' as const,
  color: 'var(--loader-working)',
  doneColor: 'var(--loader-done)',
}

const activeText = (wrapper: ReturnType<typeof mount>) => wrapper.get('.ll-text[data-active]').text()

describe('LatticeLoader', () => {
  it('trabalhando: rótulo de trabalho, 9 células (8 acesas em onda, 1 furo), cor de trabalho', () => {
    const wrapper = mount(LatticeLoader, { props: { ...props, status: 'working' } })
    expect(activeText(wrapper)).toBe('Inicializando portfolio.service')
    expect(wrapper.findAll('.ll-run .ll-cell')).toHaveLength(9)
    expect(wrapper.findAll('.ll-run .ll-lit')).toHaveLength(8)
    expect(wrapper.findAll('.ll-run .ll-hole')).toHaveLength(1)
    const style = wrapper.get('.lattice-loader').attributes('style')
    expect(style).toContain('--ll-color: var(--loader-working)')
    expect(style).toContain('--ll-gap: 1px')
    expect(style).toContain('--ll-idle: 0.15')
    expect(wrapper.get('.lattice-loader').attributes('data-shape')).toBe('square')
    expect(wrapper.get('.lattice-loader').attributes('data-glow')).toBe('')
  })

  it('pronto: rótulo de pronto e o ✓ (células 2, 3, 5 e 7) na cor de pronto', () => {
    const wrapper = mount(LatticeLoader, { props: { ...props, status: 'done' } })
    expect(activeText(wrapper)).toBe('portfolio.service carregado com sucesso!')
    const on = wrapper.findAll('.ll-mark-cell').map((c, i) => (c.attributes('data-on') === '' ? i : -1)).filter((i) => i >= 0)
    expect(on).toEqual([2, 3, 5, 7])
    expect(wrapper.get('.lattice-loader').attributes('style')).toContain('--ll-mark: var(--loader-done)')
  })

  it('sem anúncio ao leitor de tela; só o rótulo ativo fora do aria-hidden; grade decorativa', () => {
    const wrapper = mount(LatticeLoader, { props: { ...props, status: 'working' } })
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(wrapper.find('.sr-only').exists()).toBe(false)
    expect(wrapper.get('.ll-grid').attributes('aria-hidden')).toBe('true')
    const texts = wrapper.findAll('.ll-text')
    expect(texts.filter((t) => t.attributes('aria-hidden') !== 'true').map((t) => t.text())).toEqual(['Inicializando portfolio.service'])
  })

  it('pausado: marca a raiz (a onda para por CSS)', async () => {
    const wrapper = mount(LatticeLoader, { props: { ...props, status: 'working', paused: false } })
    expect(wrapper.get('.lattice-loader').attributes('data-paused')).toBeUndefined()
    await wrapper.setProps({ paused: true })
    expect(wrapper.get('.lattice-loader').attributes('data-paused')).toBe('')
  })
})
