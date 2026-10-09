import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TagChip from '@/components/base/TagChip.vue'
import type { TechName } from '@/types/resume'

// Chip de tecnologia com ícone à esquerda (feature 003, FR-012 a FR-015)
const chip = (tech: TechName) => mount(TagChip, { props: { tech } })

describe('TagChip', () => {
  it('ícone decorativo antes do nome, apontando para o símbolo da tecnologia no sprite', () => {
    const li = chip('TypeScript').get('li')
    const icon = li.element.firstElementChild!
    expect(icon.matches('svg.tech-icon')).toBe(true)
    expect(icon.getAttribute('aria-hidden')).toBe('true')
    expect(icon.querySelector('use')?.getAttribute('href')).toMatch(/sprite[^#]*#devicon-typescript$/)
  })

  it('segue a ordem de fontes: devicon, vectorlogo.zone, Lucide', () => {
    const href = (tech: TechName) => chip(tech).get('use').attributes('href')
    expect(href('SAP SD')).toMatch(/#vectorlogo-sap$/)
    expect(href('Nginx')).toMatch(/#vectorlogo-nginx$/)
    expect(href('Valkey')).toMatch(/#dashboard-valkey$/)
  })

  it('o texto do chip é só o nome da tecnologia', () => {
    expect(chip('Vue 3').text()).toBe('Vue 3')
  })
})
