import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import TextType from '@/components/vendor/vue-bits/TextType.vue'
import source from '@/components/vendor/vue-bits/TextType.vue?raw'

// Feature 005, FR-017 (research R3, data-model §3): o TextType do Vue Bits, sem GSAP e guiado pelo relógio.
const content = (wrapper: ReturnType<typeof mount>) => wrapper.get('.text-type-content').text()

describe('TextType vendorizado', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('um caractere no instante zero e um novo a cada typingSpeed', async () => {
    const wrapper = mount(TextType, { props: { text: 'ssh viper', typingSpeed: 20 } })
    await nextTick()
    expect(content(wrapper)).toBe('s')
    // tiques de 16 ms: no de 48 ms, floor(48 / 20) + 1 = 3 caracteres
    vi.advanceTimersByTime(48)
    await nextTick()
    expect(content(wrapper)).toBe('ssh')
  })

  it('startAt no passado: já mostra o que o relógio manda, sem deriva', async () => {
    const wrapper = mount(TextType, { props: { text: 'abcdefghij', typingSpeed: 20, startAt: performance.now() - 100 } })
    await nextTick()
    expect(content(wrapper)).toBe('abcdef')
  })

  it('startAt no futuro: nada digitado até lá', async () => {
    const wrapper = mount(TextType, { props: { text: 'abc', typingSpeed: 10, startAt: performance.now() + 50 } })
    await nextTick()
    expect(content(wrapper)).toBe('')
    vi.advanceTimersByTime(64)
    await nextTick()
    expect(content(wrapper)).toBe('ab')
  })

  it('complete uma única vez, no fim do texto', async () => {
    const wrapper = mount(TextType, { props: { text: 'abc', typingSpeed: 10 } })
    vi.advanceTimersByTime(500)
    await nextTick()
    expect(content(wrapper)).toBe('abc')
    expect(wrapper.emitted('complete')).toEqual([['abc', 0]])
  })

  it('instant mostra tudo na hora e avisa o fim', async () => {
    const wrapper = mount(TextType, { props: { text: 'abc', typingSpeed: 1000, instant: true } })
    await nextTick()
    expect(content(wrapper)).toBe('abc')
    expect(wrapper.emitted('complete')).toHaveLength(1)
  })

  it('reserve deixa o resto no DOM, invisível', async () => {
    const wrapper = mount(TextType, { props: { text: 'abcd', typingSpeed: 100, reserve: true } })
    await nextTick()
    expect(wrapper.get('.text-type-ghost').text()).toBe('bcd')
    vi.advanceTimersByTime(400)
    await nextTick()
    expect(wrapper.find('.text-type-ghost').exists()).toBe(false)
  })

  it('cursor ▊ decorativo com a classe do site; showCursor false tira', async () => {
    const withCursor = mount(TextType, { props: { text: 'a' } })
    const cursor = withCursor.get('.text-type-cursor')
    expect(cursor.text()).toBe('▊')
    expect(cursor.classes()).toContain('cursor')
    expect(cursor.attributes('aria-hidden')).toBe('true')
    const without = mount(TextType, { props: { text: 'a', showCursor: false } })
    expect(without.find('.text-type-cursor').exists()).toBe(false)
  })

  it('várias frases com loop: apaga e digita a seguinte', async () => {
    const wrapper = mount(TextType, { props: { text: ['ab', 'cd'], typingSpeed: 10, pauseDuration: 100, deletingSpeed: 10, loop: true } })
    // 'ab' até 10 ms, pausa até 110, apaga até 130, 'cd' a partir de 130 (tique de 144 ms)
    vi.advanceTimersByTime(128)
    await nextTick()
    expect(content(wrapper)).toBe('')
    vi.advanceTimersByTime(16)
    await nextTick()
    expect(content(wrapper)).toBe('cd')
    expect(wrapper.emitted('complete')).toEqual([
      ['ab', 0],
      ['cd', 1],
    ])
  })

  it('não usa GSAP', () => {
    expect(source).not.toMatch(/from ['"]gsap['"]/)
  })
})
