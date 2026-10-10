import { describe, expect, it } from 'vitest'
import { resume } from '@/data/resume'
import { openTargets, visibleSections } from '@/lib/sections'
import type { Resume } from '@/types/resume'

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

// Feature 007 (FR-002, FR-003, research R1): alvos do comando `open`.
describe('openTargets', () => {
  it('as 9 opções na ordem da página', () => {
    expect(openTargets(resume).map((t) => t.name)).toEqual([
      'experiencia',
      'srg',
      'temas-vs-code',
      'italiami',
      'ocr-de-prontuarios',
      'qclass-bot',
      'monitor-de-curso',
      'challenges',
      'comunitario',
    ])
  })

  it('nomes únicos, em slug, e nenhum projeto com o nome de uma janela de editor (FR-003)', () => {
    const names = openTargets(resume).map((t) => t.name)
    expect(new Set(names).size).toBe(names.length)
    for (const name of names) expect(name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    const projects = openTargets(resume).filter((t) => t.mode === 'open')
    for (const reserved of ['experiencia', 'challenges', 'comunitario']) expect(projects.map((t) => t.name)).not.toContain(reserved)
  })

  it('projeto abre; experiência, challenges e comunitário maximizam (Q1)', () => {
    const byName = Object.fromEntries(openTargets(resume).map((t) => [t.name, t]))
    expect(byName['italiami']).toEqual({
      name: 'italiami',
      windowId: 'projetos/italiami',
      path: '~/projetos/italiami',
      alias: 'projetos/italiami',
      mode: 'open',
    })
    expect(byName['experiencia']).toEqual({ name: 'experiencia', windowId: 'experiencia', path: '~/carreira', alias: 'carreira', mode: 'maximize' })
    expect(byName['challenges']).toMatchObject({ windowId: 'challenges', path: '~/projetos/challenges', alias: 'projetos/challenges', mode: 'maximize' })
    expect(byName['comunitario']).toMatchObject({ windowId: 'comunitario', path: '~/projetos/comunitario', alias: 'projetos/comunitario', mode: 'maximize' })
  })

  it('coleção vazia não tem alvo', () => {
    // o tipo exige ao menos um vínculo; o caso vazio só existe para provar a regra
    const empty = { ...resume, experiences: [], challenges: [], community: [] } as unknown as Resume
    const names = openTargets(empty).map((t) => t.name)
    expect(names).toEqual(['srg', 'temas-vs-code', 'italiami', 'ocr-de-prontuarios', 'qclass-bot', 'monitor-de-curso'])
  })
})
