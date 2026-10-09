import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EducationCard from '@/components/sections/EducationCard.vue'
import type { Education } from '@/types/resume'

// observação e fontes opcionais na formação (FR-021 a FR-023)
const base: Education = {
  course: 'Curso',
  institution: 'Instituição',
  location: 'Curitiba - PR',
  startYear: 2020,
  endYear: 2020,
  status: 'concluido',
}

describe('EducationCard', () => {
  it('mostra observação e fontes como links externos isolados', () => {
    const education: Education = {
      ...base,
      note: 'Abriu a porta para a Prime Control.',
      sources: [
        { label: 'overbr.com.br', url: 'https://overbr.com.br/x' },
        { label: 'curitiba.pr.gov.br', url: 'https://www.curitiba.pr.gov.br/y' },
      ],
    }
    const wrapper = mount(EducationCard, { props: { education } })
    expect(wrapper.get('.edu-note').text()).toBe('Abriu a porta para a Prime Control.')
    const links = wrapper.get('[aria-label="Fontes"]').findAll('a')
    expect(links.map((a) => a.attributes('href'))).toEqual(['https://overbr.com.br/x', 'https://www.curitiba.pr.gov.br/y'])
    for (const a of links) {
      expect(a.attributes('target')).toBe('_blank')
      expect(a.attributes('rel')).toBe('noopener noreferrer')
    }
    expect(wrapper.text()).toContain('2020 — 2020')
  })

  it('sem observação nem fontes, o cartão fica como antes', () => {
    const wrapper = mount(EducationCard, { props: { education: base } })
    expect(wrapper.find('.edu-note').exists()).toBe(false)
    expect(wrapper.find('[aria-label="Fontes"]').exists()).toBe(false)
    expect(wrapper.findAll('a')).toHaveLength(0)
  })
})
