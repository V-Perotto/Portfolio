import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, inject, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import DesktopWindow from '@/components/terminal/DesktopWindow.vue'
import TerminalLine from '@/components/terminal/TerminalLine.vue'
import TerminalWindow from '@/components/terminal/TerminalWindow.vue'
import { WINDOW_CONTROLS } from '@/components/terminal/window-controls'
import { getWindow } from '@/lib/windows'

// Feature 004, US4 (FR-001 a FR-011): janelas que minimizam e fecham como ícones de área de trabalho.
const terminal = (title: string) => () => h(TerminalWindow, { title }, () => [h(TerminalLine, null, () => 'cat sobre.txt')])

describe('DesktopWindow', () => {
  it('no HTML pré-renderizado: controles só desenho e nenhum ícone (FR-009)', async () => {
    const app = createSSRApp({ render: () => h(DesktopWindow, { title: 'sobre.txt', kind: 'document' }, { default: terminal('sobre.txt') }) })
    const html = await renderToString(app)
    expect(html).toContain('class="t-controls" aria-hidden="true"')
    expect(html).not.toContain('<button')
    expect(html).not.toContain('desktop-icon')
  })

  it('montada: − e ✕ são botões com o título no nome acessível (FR-001)', async () => {
    const wrapper = mount(DesktopWindow, { props: { title: 'SRG', kind: 'project' }, slots: { default: terminal('SRG') } })
    await nextTick()
    expect(wrapper.get('button.t-min').attributes('aria-label')).toBe('Minimizar SRG')
    expect(wrapper.get('button.t-close').attributes('aria-label')).toBe('Fechar SRG')
    expect(wrapper.get('.t-max').attributes('aria-hidden')).toBe('true')
  })

  it.each([
    ['document', 'lucide-file-text'],
    ['script', 'lucide-file-terminal'],
    ['project', 'lucide-folder-code'],
  ] as const)('minimizar mostra o ícone do tipo %s e o título; abrir volta (FR-002, FR-003)', async (kind, iconClass) => {
    const wrapper = mount(DesktopWindow, { props: { title: 'contato.sh', kind }, slots: { default: terminal('contato.sh') }, attachTo: document.body })
    await nextTick()
    await wrapper.get('button.t-min').trigger('click')
    await nextTick()
    expect(wrapper.get('.desktop-window').attributes('data-window-state')).toBe('minimized')
    const icon = wrapper.get('button.desktop-icon')
    expect(icon.isVisible()).toBe(true)
    expect(icon.attributes('aria-label')).toBe('Abrir contato.sh')
    expect(icon.text()).toBe('contato.sh')
    expect(icon.find('svg').classes()).toContain(iconClass)
    expect(document.activeElement).toBe(icon.element)
    await icon.trigger('click')
    await nextTick()
    await nextTick()
    expect(wrapper.get('.desktop-window').attributes('data-window-state')).toBe('open')
    expect(document.activeElement).toBe(wrapper.get('button.t-min').element)
    wrapper.unmount()
  })

  it('minimizar completa a digitação; fechar e abrir digita de novo (FR-004, FR-005)', async () => {
    const typing = { complete: vi.fn(), replay: vi.fn(), prepare: vi.fn() }
    const Child = defineComponent({
      setup() {
        const controls = inject(WINDOW_CONTROLS)!
        controls.register(typing)
        return () =>
          h('div', [
            h('button', { class: 'min', onClick: () => controls.minimize() }),
            h('button', { class: 'close', onClick: () => controls.close() }),
          ])
      },
    })
    const wrapper = mount(DesktopWindow, { props: { title: 'X', kind: 'project' }, slots: { default: () => h(Child) } })
    await nextTick()
    await wrapper.get('button.min').trigger('click')
    expect(typing.complete).toHaveBeenCalledTimes(1)
    await wrapper.get('button.desktop-icon').trigger('click')
    await nextTick()
    await nextTick()
    expect(typing.replay).not.toHaveBeenCalled()

    await wrapper.get('button.close').trigger('click')
    expect(typing.complete).toHaveBeenCalledTimes(2)
    await nextTick()
    expect(wrapper.get('.desktop-window').attributes('data-window-state')).toBe('closed')
    await wrapper.get('button.desktop-icon').trigger('click')
    await nextTick()
    await nextTick()
    expect(typing.replay).toHaveBeenCalledTimes(1)
  })

  it('fechada: prepara a digitação com a janela ainda fechada e só digita depois de abrir (FR-023 da 006)', async () => {
    const calls: string[] = []
    let state = () => ''
    const typing = {
      complete: vi.fn(),
      prepare: vi.fn(() => calls.push(`prepare:${state()}`)),
      replay: vi.fn(() => calls.push(`replay:${state()}`)),
    }
    const Child = defineComponent({
      setup() {
        const controls = inject(WINDOW_CONTROLS)!
        controls.register(typing)
        return () => h('button', { class: 'close', onClick: () => controls.close() })
      },
    })
    const wrapper = mount(DesktopWindow, { props: { title: 'X', kind: 'project' }, slots: { default: () => h(Child) } })
    state = () => wrapper.get('.desktop-window').attributes('data-window-state')!
    await nextTick()
    await wrapper.get('button.close').trigger('click')
    await nextTick()
    await wrapper.get('button.desktop-icon').trigger('click')
    await nextTick()
    await nextTick()
    expect(calls).toEqual(['prepare:closed', 'replay:open'])
  })

  it('com movimento, a janela reaberta mostra só o comando, e a saída espera a digitação (FR-023 da 006)', async () => {
    document.documentElement.classList.add('motion')
    try {
      const body = () => [h(TerminalLine, null, () => 'cat sobre.txt'), h('p', { class: 'out' }, 'saída')]
      const wrapper = mount(DesktopWindow, {
        props: { title: 'sobre.txt', kind: 'document' },
        slots: { default: () => h(TerminalWindow, { title: 'sobre.txt' }, body) },
        attachTo: document.body,
      })
      await nextTick()
      await wrapper.get('button.t-close').trigger('click')
      await nextTick()
      await wrapper.get('button.desktop-icon').trigger('click')
      // logo depois de reabrir: a saída está escondida, à espera do comando
      await nextTick()
      expect(wrapper.get('p.out').attributes('data-t-state')).toBe('pending')
      wrapper.unmount()
    } finally {
      document.documentElement.classList.remove('motion')
    }
  })

  // Feature 007 (research R3): registro de janelas para o comando `open` do terminal da dock.
  it('com windowId, entra no registro ao montar e sai ao desmontar', async () => {
    const wrapper = mount(DesktopWindow, { props: { title: 'SRG', kind: 'project', windowId: 'projetos/srg' }, slots: { default: terminal('SRG') } })
    await nextTick()
    const handle = getWindow('projetos/srg')!
    expect(handle.state()).toBe('open')
    expect(handle.element()).toBe(wrapper.get('.desktop-window').element)
    wrapper.unmount()
    expect(getWindow('projetos/srg')).toBeUndefined()
  })

  it('open({ complete }) reabre uma janela fechada já completa, sem preparar nem repetir a digitação', async () => {
    const typing = { complete: vi.fn(), replay: vi.fn(), prepare: vi.fn() }
    const Child = defineComponent({
      setup() {
        const controls = inject(WINDOW_CONTROLS)!
        controls.register(typing)
        return () => h('button', { class: 'close', onClick: () => controls.close() })
      },
    })
    const wrapper = mount(DesktopWindow, { props: { title: 'X', kind: 'project', windowId: 'x' }, slots: { default: () => h(Child) } })
    await nextTick()
    await wrapper.get('button.close').trigger('click')
    await nextTick()
    expect(getWindow('x')!.state()).toBe('closed')
    await getWindow('x')!.open({ complete: true })
    expect(wrapper.get('.desktop-window').attributes('data-window-state')).toBe('open')
    expect(typing.prepare).not.toHaveBeenCalled()
    expect(typing.replay).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('open({ onLayout }) chama o onLayout uma vez, com a janela já aberta; aberta, open() não muda nada', async () => {
    const wrapper = mount(DesktopWindow, { props: { title: 'SRG', kind: 'project', windowId: 'projetos/srg' }, slots: { default: terminal('SRG') } })
    await nextTick()
    await wrapper.get('button.t-min').trigger('click')
    await nextTick()
    const seen: string[] = []
    const onLayout = vi.fn(() => seen.push(wrapper.get('.desktop-window').attributes('data-window-state')!))
    await getWindow('projetos/srg')!.open({ onLayout })
    expect(onLayout).toHaveBeenCalledTimes(1)
    expect(seen).toEqual(['open'])
    const again = vi.fn()
    await getWindow('projetos/srg')!.open({ onLayout: again })
    expect(again).not.toHaveBeenCalled()
    expect(wrapper.get('.desktop-window').attributes('data-window-state')).toBe('open')
    wrapper.unmount()
  })

  it('sem movimento, nenhuma animação (FR-008)', async () => {
    const animate = vi.spyOn(HTMLElement.prototype, 'animate')
    const wrapper = mount(DesktopWindow, { props: { title: 'SRG', kind: 'project' }, slots: { default: terminal('SRG') } })
    await nextTick()
    await wrapper.get('button.t-close').trigger('click')
    await nextTick()
    await wrapper.get('button.desktop-icon').trigger('click')
    await nextTick()
    expect(animate).not.toHaveBeenCalled()
    animate.mockRestore()
  })
})
