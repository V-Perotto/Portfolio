import { describe, expect, it } from 'vitest'
import { resume } from '@/data/resume'
import type { Project, YearMonth } from '@/types/resume'

// Regras de specs/001-vue-resume-refactor/data-model.md, seção "Validação" — o que o tipo não cobre.

const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/
const experiences = [...resume.experiences]
const projects: Project[] = [...resume.projects]

describe('resume.ts — validação', () => {
  it('(1) datas "AAAA-MM" válidas e início ≤ fim', () => {
    for (const exp of experiences) {
      const end: YearMonth | undefined = 'end' in exp ? exp.end : undefined
      expect(exp.start, exp.id).toMatch(YEAR_MONTH)
      if (end) {
        expect(end, exp.id).toMatch(YEAR_MONTH)
        expect(exp.start <= end, `${exp.id}: start ${exp.start} > end ${end}`).toBe(true)
      }
    }
    for (const edu of resume.education) {
      expect(edu.startYear <= edu.endYear, edu.course).toBe(true)
    }
  })

  it('(2) no máximo uma experiência sem término', () => {
    expect(experiences.filter((exp) => !('end' in exp) || !exp.end).length).toBeLessThanOrEqual(1)
  })

  it('(3) ids únicos em cada coleção', () => {
    const collections = {
      experiences: experiences.map((e) => e.id),
      skillGroups: resume.skillGroups.map((g) => g.id),
      projects: projects.map((p) => p.id),
    }
    for (const [name, ids] of Object.entries(collections)) {
      expect(new Set(ids).size, name).toBe(ids.length)
    }
  })

  it('(4) toda URL começa com https://', () => {
    const urls = [
      ...resume.contacts.map((c) => c.url),
      ...projects.flatMap((p) => p.evidence.flatMap((e) => [e.url, ...(e.badge ? [e.badge.src] : [])])),
    ]
    for (const url of urls) expect(url).toMatch(/^https:\/\//)
  })

  it('(5) frases do prompt válidas', () => {
    const { typedPhrases, staticPhraseIndex } = resume.profile
    expect(typedPhrases[staticPhraseIndex]).toBeTruthy()
    for (const phrase of typedPhrases) expect(phrase.trim()).not.toBe('')
  })

  it('(6) projeto sem evidência explica o motivo', () => {
    for (const project of projects) {
      if (project.evidence.length === 0) expect(project.noEvidenceReason?.trim(), project.id).toBeTruthy()
    }
  })

  it('(7) paridade com a página anterior (SC-001)', () => {
    expect(resume.experiences).toHaveLength(5)
    expect(resume.skillGroups).toHaveLength(5)
    expect(resume.projects).toHaveLength(3)
    expect(resume.education).toHaveLength(3)
    expect(resume.profile.attributes).toHaveLength(5)
    expect(resume.contacts).toHaveLength(2)
  })
})
