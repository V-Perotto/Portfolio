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
  tech: ['Vue.js'],
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

  // Feature 010 (FR-021): a foto do 1º dia no cartão da Prime Control
  it('com photo, a figura com a legenda datada e o texto alternativo; sem photo, nenhuma figura', () => {
    const experience: Experience = {
      ...base,
      photo: {
        src: 'carreira/demo/foto-512.webp',
        srcWidth: 512,
        full: 'carreira/demo/foto-1024.webp',
        width: 1024,
        height: 768,
        alt: 'Integração em 15/10/2020',
        caption: '1º dia na Prime Control',
        taken: '2020-10-15',
      },
    }
    const wrapper = mount(ExperienceCard, { props: { experience } })
    expect(wrapper.get('figure.exp-photo figcaption').text()).toBe('# 1º dia na Prime Control · 15 OUT 2020')
    expect(wrapper.get('figure.exp-photo img').attributes('alt')).toBe('Integração em 15/10/2020')
    expect(wrapper.get('figure.exp-photo a.shot-link').attributes('href')).toBe(`${import.meta.env.BASE_URL}carreira/demo/foto-1024.webp`)
    expect(mount(ExperienceCard, { props: { experience: base } }).find('figure').exists()).toBe(false)
  })
})
