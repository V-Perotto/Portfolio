import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ProjectCard from '@/components/sections/ProjectCard.vue'
import { resume } from '@/data/resume'
import { TECH_ICONS } from '@/lib/tech-icons'
import type { Project } from '@/types/resume'

const base = {
  id: 'demo',
  name: 'Demo',
  subtitle: 'Sub',
  command: 'demo --describe',
  purpose: 'Propósito',
  stack: ['Vue.js'],
  role: 'Autor',
  kind: 'pessoal',
  tag: '[projeto pessoal]',
} as const

describe('ProjectCard', () => {
  it('confidencial sem evidência mostra o motivo e nenhum link', () => {
    const project: Project = {
      ...base,
      stack: ['Vue.js'],
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
      stack: ['Vue.js'],
      evidence: [],
      confidential: true,
      noEvidenceReason: 'x',
      highlights: [{ value: '-40%', label: 'tempo de pesquisa' }],
    }
    const wrapper = mount(ProjectCard, { props: { project } })
    expect(wrapper.get('.t-desc').element.nextElementSibling?.classList.contains('metrics')).toBe(true)
  })

  it('sem métricas não renderiza o bloco de resultados nem texto vazio', () => {
    const project: Project = { ...base, stack: ['Vue.js'], evidence: [], confidential: true, noEvidenceReason: 'x' }
    const wrapper = mount(ProjectCard, { props: { project } })
    expect(wrapper.find('.metrics').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('undefined')
  })

  it('evidência vira link externo isolado', () => {
    const project: Project = {
      ...base,
      stack: ['Vue.js'],
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
      stack: ['Vue.js'],
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
      mount(ProjectCard, { props: { project: { ...base, stack: ['Vue.js'], evidence } as Project } })
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
    const project: Project = { ...base, stack: ['Vue.js'], inProgress: true, evidence: [], confidential: true, noEvidenceReason: 'x' }
    const name = mount(ProjectCard, { props: { project } }).get('h3')
    expect(name.get('.tag-now').text()).toBe('EM DESENVOLVIMENTO')
    expect(name.text()).not.toContain('PRESENTE')

    const done: Project = { ...base, stack: ['Vue.js'], evidence: [], confidential: true, noEvidenceReason: 'x' }
    expect(mount(ProjectCard, { props: { project: done } }).find('.tag-now').exists()).toBe(false)
  })

  it('exibe stack, papel e tipo', () => {
    const project: Project = { ...base, stack: ['Vue.js', 'TypeScript'], evidence: [], confidential: true, noEvidenceReason: 'x' }
    const text = mount(ProjectCard, { props: { project } }).text()
    expect(text).toContain('Vue.js')
    expect(text).toContain('TypeScript')
    expect(text).toContain('Autor')
    expect(text).toContain('pessoal')
  })

  it('rótulo de link sem accent no roxo do ">"; com accent, o neon do tema (FR-006 da 003)', () => {
    const project: Project = {
      ...base,
      stack: ['Vue.js'],
      evidence: [
        { label: 'Demo-Front · front-end', url: 'https://github.com/x/demo-front', kind: 'repositorio', private: true },
        { label: 'Tema', url: 'https://open-vsx.org/extension/x/tema', kind: 'marketplace', accent: 'grape' },
      ],
    }
    const labels = mount(ProjectCard, { props: { project } }).findAll('.t-theme-name > span:not(.prompt-dollar)')
    expect(labels[0]!.classes()).toEqual(['evidence-label'])
    expect(labels[1]!.classes()).toEqual(expect.arrayContaining(['neon', 'neon-grape']))
    expect(labels.some((l) => l.classes('hl-green'))).toBe(false)
  })

  it('o título da janela é o nome do projeto, sem "bash —" (FR-011 da 003)', () => {
    const project: Project = { ...base, stack: ['Vue.js'], evidence: [], confidential: true, noEvidenceReason: 'x' }
    expect(mount(ProjectCard, { props: { project } }).get('.terminal-title').text()).toBe('Demo')
  })

  // Feature 009 (FR-007 a FR-021, research R6 e R8; contracts/debianserver-window.md §1)
  describe('DebianServer (side-project com captura)', () => {
    const server = resume.projects.find((p) => p.id === 'debianserver')!

    it('selo EM PRODUÇÃO, dl com papel, tipo, desde e os detalhes, nessa ordem, e rodapé [side-project]', () => {
      const wrapper = mount(ProjectCard, { props: { project: server } })
      expect(wrapper.get('h3 .tag-now').text()).toBe('EM PRODUÇÃO')
      expect(wrapper.findAll('.project-meta dt').map((dt) => dt.text())).toEqual(['papel', 'tipo', 'desde', 'hardware', 'sistema', 'acesso'])
      const values = wrapper.findAll('.project-meta dd').map((dd) => dd.text())
      expect(values.slice(0, 3)).toEqual(['Autor: instalação, configuração e manutenção', 'side-project', '01 OUT 2026'])
      expect(values.slice(3)).toEqual(server.details!.map((d) => d.value))
      expect(wrapper.findAll('.project-stack li')).toHaveLength(6)
      expect(wrapper.get('.project-footer').text()).toContain('[side-project]')
    })

    it('# apps e os 6 apps, cada um com ícone decorativo, nome e explicação, na ordem dos dados', () => {
      const wrapper = mount(ProjectCard, { props: { project: server } })
      expect(wrapper.get('.apps-title').text()).toBe('# apps')
      expect(wrapper.get('.apps-title').attributes('aria-hidden')).toBe('true')
      const list = wrapper.get('ul.project-apps')
      expect(list.attributes('aria-label')).toBe('Apps do servidor')
      const items = list.findAll('li')
      expect(items).toHaveLength(6)
      items.forEach((li, i) => {
        const app = server.apps![i]!
        const icon = li.get('svg.tech-icon')
        expect(icon.attributes('aria-hidden')).toBe('true')
        expect(icon.get('use').attributes('href')).toMatch(new RegExp(`#${TECH_ICONS[app.name]}$`))
        expect(li.get('.app-name').text()).toBe(app.name)
        expect(li.get('.app-desc').text()).toBe(app.summary)
      })
    })

    it('na coluna de evidências: a linha da exceção e a captura, sem links nem aviso de privado (FR-015, analyze C1)', () => {
      const wrapper = mount(ProjectCard, { props: { project: server } })
      const links = wrapper.get('.project-links')
      const note = links.get('.no-evidence')
      expect(note.text()).toBe('# sem acesso público: a evidência é a captura do painel')
      expect(note.element.nextElementSibling?.classList.contains('project-shot')).toBe(true)
      expect(links.find('.t-badges').exists()).toBe(false)
      expect(links.findAll('.no-evidence')).toHaveLength(1)
      expect(links.findAll('a')).toHaveLength(1)
    })

    it('projeto sem os campos novos continua igual: sem desde, apps nem captura (FR-021)', () => {
      const srg = resume.projects.find((p) => p.id === 'srg')!
      const wrapper = mount(ProjectCard, { props: { project: srg } })
      expect(wrapper.findAll('.project-meta dt').map((dt) => dt.text())).toEqual(['papel', 'tipo'])
      expect(wrapper.find('.apps-title').exists()).toBe(false)
      expect(wrapper.find('.project-apps').exists()).toBe(false)
      expect(wrapper.find('.project-shot').exists()).toBe(false)
      expect(wrapper.get('h3 .tag-now').text()).toBe('EM DESENVOLVIMENTO')
    })
  })
})
