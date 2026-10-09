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

  it('link privado mostra "privado" e avisa no nome acessível que pode não abrir (FR-005)', () => {
    const project: Project = {
      ...base,
      stack: ['Vue'],
      evidence: [{ label: 'Repo', url: 'https://github.com/x/repo', kind: 'repositorio', private: true }],
    }
    const link = mount(ProjectCard, { props: { project } }).get('a')
    expect(link.get('.private-tag').text()).toBe('privado')
    expect(link.find('svg.lucide-lock').attributes('aria-hidden')).toBe('true')
    // nome acessível ≈ texto sem os nós aria-hidden (cadeado e etiqueta visual)
    const named = link.element.cloneNode(true) as HTMLElement
    named.querySelectorAll('[aria-hidden="true"]').forEach((el) => el.remove())
    expect(named.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'github.com/x/repo repositório privado, pode não abrir (abre em nova aba)',
    )
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
  })

  it('aviso de privado no singular, no plural e também ao lado de link público', () => {
    const priv = (n: number) => ({ label: `R${n}`, url: `https://github.com/x/r${n}`, kind: 'repositorio', private: true }) as const
    const pub = { label: 'Pub', url: 'https://example.com', kind: 'demo' } as const
    const note = (evidence: Project['evidence']) =>
      mount(ProjectCard, { props: { project: { ...base, stack: ['Vue'], evidence } as Project } })
        .findAll('.no-evidence')
        .map((p) => p.text())

    expect(note([priv(1)])).toEqual(['# repositório privado: pode abrir uma página de "não encontrado" para quem não tem acesso.'])
    expect(note([priv(1), priv(2)])).toEqual(['# repositórios privados: podem abrir uma página de "não encontrado" para quem não tem acesso.'])
    expect(note([pub, priv(1)])).toHaveLength(1)
    expect(note([pub])).toEqual([])
  })

  it('relatedTo aparece como "contexto" e some sem ele (FR-009)', () => {
    const withRelated: Project = { ...base, stack: ['Python'], relatedTo: 'Quadritech Tecnologia', evidence: [], confidential: true, noEvidenceReason: 'x' }
    const meta = mount(ProjectCard, { props: { project: withRelated } }).get('.project-meta')
    expect(meta.text()).toContain('contexto')
    expect(meta.text()).toContain('Quadritech Tecnologia')

    const without: Project = { ...base, stack: ['Python'], evidence: [], confidential: true, noEvidenceReason: 'x' }
    expect(mount(ProjectCard, { props: { project: without } }).get('.project-meta').text()).not.toContain('contexto')
  })

  it('selo EM DESENVOLVIMENTO só com inProgress, sem período (FR-013)', () => {
    const project: Project = { ...base, stack: ['Vue'], inProgress: true, evidence: [], confidential: true, noEvidenceReason: 'x' }
    const name = mount(ProjectCard, { props: { project } }).get('h3')
    expect(name.get('.tag-now').text()).toBe('EM DESENVOLVIMENTO')
    expect(name.text()).not.toContain('PRESENTE')

    const done: Project = { ...base, stack: ['Vue'], evidence: [], confidential: true, noEvidenceReason: 'x' }
    expect(mount(ProjectCard, { props: { project: done } }).find('.tag-now').exists()).toBe(false)
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
