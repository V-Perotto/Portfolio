import { describe, expect, it } from 'vitest'
import { resume } from '@/data/resume'
import { visibleSections } from '@/lib/sections'

describe('visibleSections', () => {
  it('ordem fixa das seções', () => {
    expect(visibleSections(resume).map((s) => s.id)).toEqual([
      'sobre',
      'experiencia',
      'skills',
      'projetos',
      'educacao',
      'contato',
    ])
  })

  it('rótulo no formato ~/id', () => {
    expect(visibleSections(resume)[0]?.label).toBe('~/sobre')
  })

  it('coleção vazia remove a seção', () => {
    const ids = visibleSections({ ...resume, education: [] }).map((s) => s.id)
    expect(ids).not.toContain('educacao')
    expect(ids).toHaveLength(5)
  })
})
