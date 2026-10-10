import { mount, type VueWrapper } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import DockTerminal from '@/components/dock/DockTerminal.vue'
import { resume } from '@/data/resume'
import { openTargets, visibleSections } from '@/lib/sections'

// Feature 004, US2 (FR-019 a FR-025): o terminal da dock com o motor de src/lib/terminal.ts.
const sections = visibleSections(resume)

const targets = openTargets(resume)
const setup = () => mount(DockTerminal, { props: { sections, targets }, attachTo: document.body })

async function typeLine(wrapper: VueWrapper, text: string) {
  const input = wrapper.get('input')
  await input.setValue(text)
}

async function press(wrapper: VueWrapper, key: string) {
  await wrapper.get('input').trigger('keydown', { key })
  await nextTick()
}

describe('DockTerminal', () => {
  it('é um diálogo com saída anunciada e prompt rotulado', () => {
    const wrapper = setup()
    expect(wrapper.get('[role="dialog"]').attributes('aria-label')).toBe('Terminal')
    expect(wrapper.get('[role="log"]').attributes('aria-live')).toBe('polite')
    expect(wrapper.get('label[for="dock-terminal-input"]').text()).toBe('Comando')
    expect(wrapper.get('button.t-close').attributes('aria-label')).toBe('Fechar terminal')
    wrapper.unmount()
  })

  // Feature 007 (FR-010): o − minimiza; o □ continua desativado e o ✕ continua fechando.
  it('o − é um botão "Minimizar terminal" que emite minimize', async () => {
    const wrapper = setup()
    const min = wrapper.get('button.t-min')
    expect(min.attributes('aria-label')).toBe('Minimizar terminal')
    await min.trigger('click')
    expect(wrapper.emitted('minimize')).toHaveLength(1)
    expect(wrapper.emitted('close')).toBeUndefined()
    expect(wrapper.get('.t-max').classes()).toContain('t-btn--disabled')
    expect(wrapper.find('button.t-max').exists()).toBe(false)
    wrapper.unmount()
  })

  it('help escreve a ajuda na saída', async () => {
    const wrapper = setup()
    await typeLine(wrapper, 'help')
    await press(wrapper, 'Enter')
    const log = wrapper.get('[role="log"]').text()
    expect(log).toContain('help')
    expect(log).toContain('find <OPTIONS>')
    expect(log).toContain('OPTIONS: sobre | experiencia | skills | projetos | educacao | contato')
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('')
    wrapper.unmount()
  })

  it('Tab completa a opção do find', async () => {
    const wrapper = setup()
    await typeLine(wrapper, 'find pro')
    await press(wrapper, 'Tab')
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('find projetos')
    wrapper.unmount()
  })

  it('com vários candidatos, as sugestões aparecem e o toque aplica', async () => {
    const wrapper = setup()
    await typeLine(wrapper, 'find e')
    const chips = wrapper.findAll('.dt-chip')
    expect(chips.map((c) => c.text())).toEqual(['experiencia', 'educacao'])
    await chips[1]!.trigger('click')
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('find educacao')
    wrapper.unmount()
  })

  it('↑ traz o último comando; clear esvazia a saída', async () => {
    const wrapper = setup()
    await typeLine(wrapper, 'help')
    await press(wrapper, 'Enter')
    await press(wrapper, 'ArrowUp')
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('help')
    await typeLine(wrapper, 'clear')
    await press(wrapper, 'Enter')
    expect(wrapper.findAll('.dt-line')).toHaveLength(0)
    wrapper.unmount()
  })

  it('find <seção> emite goto e mantém o foco no prompt', async () => {
    const wrapper = setup()
    const input = wrapper.get('input').element as HTMLInputElement
    input.focus()
    await typeLine(wrapper, 'find sobre')
    await press(wrapper, 'Enter')
    expect(wrapper.emitted('goto')).toEqual([['sobre']])
    expect(wrapper.emitted('close')).toBeUndefined()
    expect(document.activeElement).toBe(input)
    expect(wrapper.get('[role="log"]').text()).toContain('→ ~/sobre')
    wrapper.unmount()
  })

  // Feature 007 (FR-001, FR-006, FR-008): o comando open.
  it('open <projeto> escreve o caminho e emite open com o alvo', async () => {
    const wrapper = setup()
    await typeLine(wrapper, 'open italiami')
    await press(wrapper, 'Enter')
    expect(wrapper.get('[role="log"]').text()).toContain('→ ~/projetos/italiami')
    expect(wrapper.emitted('open')).toEqual([[targets.find((t) => t.name === 'italiami')]])
    wrapper.unmount()
  })

  it('open de uma seção que ele não abre sugere o find e não emite', async () => {
    const wrapper = setup()
    await typeLine(wrapper, 'open sobre')
    await press(wrapper, 'Enter')
    expect(wrapper.get('[role="log"]').text()).toContain(`open: 'sobre': essa seção não abre com o open. Use: find sobre`)
    expect(wrapper.emitted('open')).toBeUndefined()
    wrapper.unmount()
  })

  it('Tab completa a opção do open', async () => {
    const wrapper = setup()
    await typeLine(wrapper, 'open it')
    await press(wrapper, 'Tab')
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('open italiami')
    wrapper.unmount()
  })

  it('exit, Esc e o ✕ fecham', async () => {
    const wrapper = setup()
    await typeLine(wrapper, 'exit')
    await press(wrapper, 'Enter')
    await wrapper.get('[role="dialog"]').trigger('keydown', { key: 'Escape' })
    await wrapper.get('button.t-close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(3)
    wrapper.unmount()
  })
})
