import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import SkillLoop from '@/components/base/SkillLoop.vue'
import type { SkillItem } from '@/types/resume'

// Loop de skills (feature 003, FR-021, FR-025, FR-026; contracts/page-contract.md, seção #skills)
const items: SkillItem[] = [{ name: 'TypeScript' }, { name: 'Valkey' }, { name: 'Docker' }]

const parse = (html: string) => new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')

describe('SkillLoop', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.documentElement.classList.remove('motion')
  })

  it('pré-renderiza uma lista só, com todas as skills e nenhuma cópia (FR-025, FR-026)', async () => {
    const doc = parse(await renderToString(createSSRApp({ render: () => h(SkillLoop, { items }) })))
    const lists = doc.querySelectorAll('ul')
    expect(lists).toHaveLength(1)
    expect(lists[0]!.getAttribute('role')).toBe('list')
    expect(lists[0]!.hasAttribute('aria-hidden')).toBe(false)
    expect(doc.querySelector('[data-loop-copy], [data-loop-ready], [data-loop-visible]')).toBeNull()

    const lis = [...lists[0]!.querySelectorAll(':scope > li')]
    expect(lis.map((li) => li.querySelector('.loop-name')?.textContent)).toEqual(['TypeScript', 'Valkey', 'Docker'])
    for (const li of lis) {
      // ícone decorativo antes do nome; separador fora da árvore de acessibilidade
      expect(li.firstElementChild?.matches('svg.tech-icon[aria-hidden="true"]')).toBe(true)
      expect(li.querySelector('.loop-sep')?.getAttribute('aria-hidden')).toBe('true')
      expect(li.querySelector('.loop-sep')?.textContent).toBe('✦')
    }
    expect(lis[1]!.querySelector('use')?.getAttribute('href')).toMatch(/#lucide-database$/)
  })

  it('sem movimento, continua uma lista só depois de montar', async () => {
    const wrapper = mount(SkillLoop, { props: { items } })
    await new Promise((r) => setTimeout(r))
    await nextTick()
    expect(wrapper.findAll('ul')).toHaveLength(1)
    expect(wrapper.find('[data-loop-ready]').exists()).toBe(false)
  })

  it('com movimento, cria as cópias fora da árvore de acessibilidade (FR-026)', async () => {
    document.documentElement.classList.add('motion')
    // happy-dom não calcula layout: sequência de 300px numa fita de 700px → 3 cópias
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      return { width: this.matches('ul') ? 300 : 700 } as DOMRect
    })
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(700)

    // useMotion guarda o estado no módulo (lido no primeiro mount): módulos novos para ler o `motion`
    vi.resetModules()
    const { default: FreshLoop } = await import('@/components/base/SkillLoop.vue')
    const wrapper = mount(FreshLoop, { props: { items }, attachTo: document.body })
    await vi.waitFor(() => expect(wrapper.find('[data-loop-ready]').exists()).toBe(true))
    const copies = wrapper.findAll('[data-loop-copy]')
    expect(copies).toHaveLength(3)
    for (const copy of copies) expect(copy.attributes('aria-hidden')).toBe('true')
    expect(wrapper.findAll('ul:not([aria-hidden])')).toHaveLength(1)
    // 300px a 40 px/s
    const style = wrapper.find('.skill-loop').attributes('style')
    expect(style).toContain('--loop-shift: 300px')
    expect(style).toContain('--loop-duration: 7.5s')
    wrapper.unmount()
  })
})
