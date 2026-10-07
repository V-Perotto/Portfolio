import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ExperienceCard from '@/components/sections/ExperienceCard.vue'
import type { Experience } from '@/types/resume'

const base: Experience = {
  id: 'demo',
  role: 'Dev',
  company: 'Empresa',
  location: 'Curitiba - PR',
  start: '2024-01',
  end: '2024-06',
  summary: 'Resumo',
  tech: ['Vue'],
}

describe('ExperienceCard', () => {
  it('sem highlights não renderiza o bloco de resultados', () => {
    const wrapper = mount(ExperienceCard, { props: { experience: base } })
    expect(wrapper.find('.metrics').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('undefined')
  })

  it('com highlights renderiza cada métrica', () => {
    const experience: Experience = { ...base, highlights: [{ value: '-40%', label: 'tempo' }] }
    const wrapper = mount(ExperienceCard, { props: { experience } })
    expect(wrapper.find('.metrics').text()).toContain('-40%')
  })

  it('vínculo encerrado: período fechado e sem selo', () => {
    const wrapper = mount(ExperienceCard, { props: { experience: base } })
    expect(wrapper.text()).toContain('JAN 2024 — JUN 2024')
    expect(wrapper.find('.tag-now').exists()).toBe(false)
  })

  it('vínculo em andamento: PRESENTE e selo HEAD', () => {
    const { end: _end, ...open } = base
    const wrapper = mount(ExperienceCard, { props: { experience: open } })
    expect(wrapper.text()).toContain('JAN 2024 — PRESENTE')
    expect(wrapper.get('.tag-now').text()).toBe('HEAD')
  })
})
