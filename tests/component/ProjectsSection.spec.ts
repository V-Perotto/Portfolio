import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import type { Challenge, CommunityProject, Project } from '@/types/resume'

// sub-partes da seção de projetos (FR-003, FR-015, FR-018)
const project: Project = {
  id: 'demo',
  name: 'Demo',
  subtitle: 'Sub',
  command: './run demo',
  purpose: 'Propósito',
  stack: ['Vue'],
  role: 'Autor',
  kind: 'pessoal',
  tag: '[projeto pessoal]',
  evidence: [{ label: 'Repo', url: 'https://example.com/repo', kind: 'repositorio' }],
}

const challenge = (name: string, created: Challenge['created']): Challenge => ({
  id: name.toLowerCase(),
  name,
  created,
  summary: `Resumo ${name}`,
  stack: ['TS'],
  url: `https://github.com/x/${name}`,
})

const community: CommunityProject = {
  id: 'gincana',
  name: 'Gincana',
  institution: 'PUC-PR',
  location: 'Curitiba - PR',
  date: '2023-06',
  summary: 'Resumo',
  role: 'Organizador',
  source: { label: 'pucpr.br', url: 'https://www.pucpr.br/noticia' },
}

const mountSection = (props: { challenges?: Challenge[]; community?: CommunityProject[] }) =>
  mount(ProjectsSection, {
    props: { projects: [project], challenges: props.challenges ?? [], community: props.community ?? [] },
    global: { directives: { reveal: {} } },
  })

describe('ProjectsSection', () => {
  it('challenges em data de criação desc, qualquer que seja a ordem recebida (SC-004)', () => {
    const wrapper = mountSection({
      challenges: [challenge('Antigo', '2023-07'), challenge('Novo', '2026-09'), challenge('Meio', '2025-10')],
    })
    const titles = wrapper.findAll('.subpart-list h4').map((h) => h.text())
    expect(titles).toEqual(['Novo', 'Meio', 'Antigo'])
    expect(wrapper.text()).toContain('SET 2026')
  })

  it('a sub-parte comunitária vem depois da de challenges, sem stack (FR-003, FR-019)', () => {
    const wrapper = mountSection({ challenges: [challenge('Novo', '2026-09')], community: [community] })
    const titles = wrapper.findAll('.project-subpart h3').map((h) => h.text().replace(/[#/]/g, '').trim())
    expect(titles).toEqual(['challenges', 'comunitario'])
    const card = wrapper.findAll('.project-subpart')[1]!
    expect(card.text()).toContain('JUN 2023')
    expect(card.text()).toContain('Organizador')
    expect(card.find('[aria-label="Stack"]').exists()).toBe(false)
    expect(card.get('a').attributes('href')).toBe('https://www.pucpr.br/noticia')
  })

  it('sem challenges nem comunitário, as sub-partes não aparecem', () => {
    const wrapper = mountSection({})
    expect(wrapper.findAll('.project-subpart')).toHaveLength(0)
  })
})
