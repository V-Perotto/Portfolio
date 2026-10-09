import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, inject, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import DesktopWindow from '@/components/terminal/DesktopWindow.vue'
import TerminalLine from '@/components/terminal/TerminalLine.vue'
import TerminalWindow from '@/components/terminal/TerminalWindow.vue'
import { WINDOW_CONTROLS } from '@/components/terminal/window-controls'

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
    const typing = { complete: vi.fn(), replay: vi.fn() }
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
