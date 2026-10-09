import { describe, expect, it } from 'vitest'
import { resume } from '@/data/resume'
import type { Project, YearMonth } from '@/types/resume'

// Regras de specs/002-projects-animated-terminals/data-model.md, seção "Validação" (que estende a da
// 001) — o que o tipo não cobre.

const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/
const experiences = [...resume.experiences]
const projects: Project[] = [...resume.projects]
const now = new Date()
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

describe('resume.ts — validação', () => {
  it('(1) datas "AAAA-MM" válidas, início ≤ fim e challenges criados até o mês atual', () => {
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
    for (const challenge of resume.challenges) {
      expect(challenge.created, challenge.id).toMatch(YEAR_MONTH)
      expect(challenge.created <= currentMonth, `${challenge.id}: criado no futuro`).toBe(true)
    }
    for (const item of resume.community) expect(item.date, item.id).toMatch(YEAR_MONTH)
  })

  it('(2) no máximo uma experiência sem término', () => {
    expect(experiences.filter((exp) => !('end' in exp) || !exp.end).length).toBeLessThanOrEqual(1)
  })

  it('(3) ids únicos em cada coleção', () => {
    const collections = {
      experiences: experiences.map((e) => e.id),
      skillGroups: resume.skillGroups.map((g) => g.id),
      projects: projects.map((p) => p.id),
      challenges: resume.challenges.map((c) => c.id),
      community: resume.community.map((c) => c.id),
    }
    for (const [name, ids] of Object.entries(collections)) {
      expect(new Set(ids).size, name).toBe(ids.length)
    }
  })

  it('(4) toda URL começa com https://', () => {
    const urls = [
      ...resume.contacts.map((c) => c.url),
      ...projects.flatMap((p) => p.evidence.flatMap((e) => [e.url, ...(e.badge ? [e.badge.src] : [])])),
      ...resume.challenges.map((c) => c.url),
      ...resume.community.map((c) => c.source.url),
      ...resume.education.flatMap((e) => (e.sources ?? []).map((s) => s.url)),
    ]
    for (const url of urls) expect(url).toMatch(/^https:\/\//)
  })

  it('(5) frases do prompt válidas', () => {
    const { typedPhrases, staticPhraseIndex } = resume.profile
    expect(typedPhrases[staticPhraseIndex]).toBeTruthy()
    for (const phrase of typedPhrases) expect(phrase.trim()).not.toBe('')
  })

  it('(6) projeto sem evidência é confidencial ou acadêmico e explica o motivo', () => {
    for (const project of projects) {
      if (project.evidence.length > 0) continue
      expect(project.confidential === true || project.kind === 'academico', project.id).toBe(true)
      expect(project.noEvidenceReason?.trim(), project.id).toBeTruthy()
    }
  })

  it('(7) "private" só em evidência de repositório', () => {
    for (const project of projects) {
      for (const evidence of project.evidence) {
        if (evidence.private) expect(evidence.kind, `${project.id}: ${evidence.label}`).toBe('repositorio')
      }
    }
  })

  it('(8) inventário da feature 002', () => {
    expect(resume.experiences).toHaveLength(5)
    expect(resume.skillGroups).toHaveLength(5)
    expect(projects.map((p) => p.id)).toEqual(['srg', 'vscode-themes', 'italiami', 'ocr-prontuarios', 'qclass-bot', 'monitoria'])
    expect(resume.challenges).toHaveLength(7)
    expect(resume.community).toHaveLength(1)
    expect(resume.education).toHaveLength(4)
    expect(resume.profile.attributes).toHaveLength(5)
    expect(resume.contacts).toHaveLength(2)
    expect(projects.filter((p) => p.inProgress).map((p) => p.id)).toEqual(['srg'])
    expect(projects.flatMap((p) => p.evidence).filter((e) => e.private)).toHaveLength(10)
  })
})
