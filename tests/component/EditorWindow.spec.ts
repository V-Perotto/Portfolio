import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import EditorWindow from '@/components/terminal/EditorWindow.vue'
import { resume } from '@/data/resume'
import { experienceFolder } from '@/lib/editor-files'

// Feature 006, US1 (FR-001 a FR-018; contracts/editor-window.md): janela de editor com árvore,
// arquivos, rodapé e maximizar.
const folder = experienceFolder(resume.experiences)

function mountEditor() {
  const app = document.createElement('div')
  app.id = 'app'
  document.body.append(app)
  return mount(EditorWindow, {
    props: { folder, windowId: 'experiencia' },
    slots: {
      cards: () =>
        h(
          'ol',
          folder.files.map((file) => h('li', { 'data-card-id': file.id }, [h('h3', file.name)])),
        ),
    },
    attachTo: app,
  })
}

const frame = () => document.querySelector<HTMLElement>('.editor-frame')!
const path = () => document.querySelector('.editor-path')?.textContent
const pos = () => document.querySelector('.editor-pos')?.textContent?.replace(/\s+/g, ' ')

describe('EditorWindow', () => {
  beforeEach(() => document.documentElement.classList.add('js'))
  afterEach(() => {
    document.body.innerHTML = ''
    document.documentElement.className = ''
  })

  it('comando, aba, árvore e o 1º arquivo aberto', async () => {
    const wrapper = mountEditor()
    await nextTick()
    expect(wrapper.get('.t-line').text()).toContain('code ~/carreira')
    expect(wrapper.get('.editor-tab').text()).toBe(folder.files[0]!.name)
    expect(wrapper.findAll('.bm-child')).toHaveLength(folder.files.length)
    expect(wrapper.get('.editor-file[data-active]').attributes('data-file-id')).toBe(folder.files[0]!.id)
    expect(path()).toBe(folder.files[0]!.path)
    expect(pos()).toBe(`1 / ${folder.files.length}`)
    expect(frame().dataset.editorView).toBe('file')
    wrapper.unmount()
  })

  it('escolher o 3º arquivo troca o aberto, a aba e o rodapé', async () => {
    const wrapper = mountEditor()
    await nextTick()
    await wrapper.findAll('.bm-child')[2]!.trigger('click')
    expect(wrapper.get('.editor-file[data-active]').attributes('data-file-id')).toBe(folder.files[2]!.id)
    expect(wrapper.findAll('.editor-file[data-active]')).toHaveLength(1)
    expect(wrapper.get('.editor-tab').text()).toBe(folder.files[2]!.name)
    expect(path()).toBe(folder.files[2]!.path)
    expect(pos()).toBe(`3 / ${folder.files.length}`)
    wrapper.unmount()
  })

  it('maximizar: diálogo no <body>, página inerte, cartões; Esc restaura', async () => {
    const wrapper = mountEditor()
    await nextTick()
    await wrapper.get('button.t-max').trigger('click')
    await nextTick()
    await nextTick()
    const root = document.documentElement
    expect(root.classList.contains('window-maximized')).toBe(true)
    expect(document.getElementById('app')!.inert).toBe(true)
    expect(frame().parentElement).toBe(document.body)
    expect(frame().getAttribute('role')).toBe('dialog')
    expect(frame().getAttribute('aria-modal')).toBe('true')
    expect(frame().dataset.editorView).toBe('cards')
    expect(document.querySelector('.maximize-backdrop')).not.toBeNull()
    expect(document.querySelector('button.t-max')?.getAttribute('aria-label')).toBe('Restaurar ~/carreira')

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    await nextTick()
    expect(root.classList.contains('window-maximized')).toBe(false)
    expect(document.getElementById('app')!.inert).toBe(false)
    expect(frame().getAttribute('role')).toBeNull()
    expect(frame().dataset.editorView).toBe('file')
    expect(document.querySelector('.maximize-backdrop')).toBeNull()
    expect(document.querySelector('button.t-max')?.getAttribute('aria-label')).toBe('Maximizar ~/carreira')
    wrapper.unmount()
  })

  it('minimizar maximizada: restaura antes e vira ícone', async () => {
    const wrapper = mountEditor()
    await nextTick()
    await wrapper.get('button.t-max').trigger('click')
    await nextTick()
    await nextTick()
    document.querySelector<HTMLButtonElement>('button.t-min')!.click()
    await nextTick()
    await nextTick()
    await nextTick()
    expect(document.documentElement.classList.contains('window-maximized')).toBe(false)
    expect(document.getElementById('app')!.inert).toBe(false)
    expect(wrapper.get('.desktop-window').attributes('data-window-state')).toBe('minimized')
    wrapper.unmount()
  })
})
