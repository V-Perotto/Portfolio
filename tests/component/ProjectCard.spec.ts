import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ProjectCard from '@/components/sections/ProjectCard.vue'
import type { Project } from '@/types/resume'

const base = {
  id: 'demo',
  name: 'Demo',
  subtitle: 'Sub',
  command: './run demo',
  purpose: 'Propósito',
  stack: ['Vue'],
  role: 'Autor',
  kind: 'pessoal',
  tag: '[projeto pessoal]',
} as const

describe('ProjectCard', () => {
  it('confidencial sem evidência mostra o motivo e nenhum link', () => {
    const project: Project = {
      ...base,
      stack: ['Vue'],
      evidence: [],
      confidential: true,
      noEvidenceReason: 'Projeto confidencial, sem link público.',
    }
    const wrapper = mount(ProjectCard, { props: { project } })
    expect(wrapper.text()).toContain('Projeto confidencial, sem link público.')
    expect(wrapper.findAll('a')).toHaveLength(0)
  })

  it('métricas vêm logo depois da descrição', () => {
    const project: Project = {
      ...base,
      stack: ['Vue'],
      evidence: [],
      confidential: true,
      noEvidenceReason: 'x',
      highlights: [{ value: '-40%', label: 'tempo de pesquisa' }],
    }
    const wrapper = mount(ProjectCard, { props: { project } })
    expect(wrapper.get('.t-desc').element.nextElementSibling?.classList.contains('metrics')).toBe(true)
  })

  it('sem métricas não renderiza o bloco de resultados nem texto vazio', () => {
    const project: Project = { ...base, stack: ['Vue'], evidence: [], confidential: true, noEvidenceReason: 'x' }
    const wrapper = mount(ProjectCard, { props: { project } })
    expect(wrapper.find('.metrics').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('undefined')
  })

  it('evidência vira link externo isolado', () => {
    const project: Project = {
      ...base,
      stack: ['Vue'],
      evidence: [{ label: 'Repo', url: 'https://example.com/repo', kind: 'repositorio' }],
    }
    const wrapper = mount(ProjectCard, { props: { project } })
    const link = wrapper.get('a')
    expect(link.attributes('href')).toBe('https://example.com/repo')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
  })

  it('exibe stack, papel e tipo', () => {
    const project: Project = { ...base, stack: ['Vue', 'TS'], evidence: [], confidential: true, noEvidenceReason: 'x' }
    const text = mount(ProjectCard, { props: { project } }).text()
    expect(text).toContain('Vue')
    expect(text).toContain('TS')
    expect(text).toContain('Autor')
    expect(text).toContain('pessoal')
  })
})
