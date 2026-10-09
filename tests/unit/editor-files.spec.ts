import { describe, expect, it } from 'vitest'
import { resume } from '@/data/resume'
import { challengeFolder, communityFolder, experienceFolder, fileText, slugify, type EditorFolder } from '@/lib/editor-files'
import { formatPeriod, formatYearMonth } from '@/lib/period'
import { byCreatedDesc, byStartDesc } from '@/lib/sort'

// Feature 006 (FR-005 a FR-009, SC-001, research R3): os arquivos YAML das janelas de editor trazem
// todos os fatos dos cartões, e só eles (Princípio I).

const KEYS = {
  carreira: ['cargo', 'empresa', 'local', 'periodo', 'atual', 'resumo', 'resultados', 'stack'],
  challenges: ['nome', 'criado', 'resumo', 'stack', 'repositorio'],
  comunitario: ['nome', 'instituicao', 'local', 'data', 'resumo', 'papel', 'fonte'],
} as const

const folders = (): EditorFolder[] => [
  experienceFolder(resume.experiences),
  challengeFolder(resume.challenges),
  communityFolder(resume.community),
]

describe('arquivos das janelas de editor', () => {
  it('cada experiência traz todos os fatos do cartão', () => {
    const { files } = experienceFolder(resume.experiences)
    byStartDesc(resume.experiences).forEach((exp, i) => {
      const text = fileText(files[i]!)
      expect(files[i]!.id).toBe(exp.id)
      for (const fact of [exp.role, exp.company, exp.location, formatPeriod(exp.start, exp.end), exp.summary, ...exp.tech])
        expect(text).toContain(fact)
      for (const metric of exp.highlights ?? []) {
        expect(text).toContain(metric.value)
        expect(text).toContain(metric.label)
      }
      expect(text.includes('# HEAD')).toBe(!exp.end)
    })
  })

  it('cada challenge traz todos os fatos do cartão, com o repositório como link', () => {
    const { files } = challengeFolder(resume.challenges)
    byCreatedDesc(resume.challenges).forEach((ch, i) => {
      const file = files[i]!
      const text = fileText(file)
      for (const fact of [ch.name, formatYearMonth(ch.created), ch.summary, ...ch.stack]) expect(text).toContain(fact)
      const links = file.lines.flatMap((l) => l.tokens).filter((tok) => tok.kind === 'link')
      expect(links).toEqual([{ kind: 'link', text: ch.url.replace(/^https?:\/\//, ''), href: ch.url }])
    })
  })

  it('cada projeto comunitário traz todos os fatos do cartão, com a fonte como link', () => {
    const { files } = communityFolder(resume.community)
    resume.community.forEach((p, i) => {
      const file = files[i]!
      const text = fileText(file)
      for (const fact of [p.name, p.institution, p.location, formatYearMonth(p.date), p.summary, p.role, p.source.label])
        expect(text).toContain(fact)
      const links = file.lines.flatMap((l) => l.tokens).filter((tok) => tok.kind === 'link')
      expect(links).toEqual([{ kind: 'link', text: p.source.label, href: p.source.url }])
    })
  })

  it('só as chaves previstas aparecem, e a 1ª linha é o comentário com a posição', () => {
    for (const folder of folders()) {
      const allowed = KEYS[folder.label as keyof typeof KEYS]
      for (const file of folder.files) {
        expect(file.lines[0]!.tokens).toEqual([expect.objectContaining({ kind: 'comment', text: expect.stringMatching(new RegExp(`^# ${file.position} / ${file.total} · `)) })])
        for (const l of file.lines) for (const tok of l.tokens) if (tok.kind === 'key') expect(allowed).toContain(tok.text)
        for (const l of file.lines) for (const tok of l.tokens) if (tok.kind === 'link') expect(tok.href).toMatch(/^https:\/\//)
      }
    }
  })

  it('nomes, caminhos e posições', () => {
    const [carreira, challenges, comunitario] = folders()
    expect(carreira!.path).toBe('~/carreira')
    expect(challenges!.path).toBe('~/projetos/challenges')
    expect(comunitario!.path).toBe('~/projetos/comunitario')
    const names = folders().flatMap((f) => f.files.map((file) => file.name))
    expect(new Set(names).size).toBe(names.length)
    expect(names).toEqual(
      expect.arrayContaining([
        '2026-03_confidencial.yml',
        '2025-10_executiva-service.yml',
        '2024-01_ny-times-rpa.yml',
        '2026-09_ciee-pr.yml',
        '2023-06_gincana-junina.yml',
      ]),
    )
    expect(carreira!.files.map((f) => f.id)).toEqual(byStartDesc(resume.experiences).map((e) => e.id))
    expect(challenges!.files.map((f) => f.id)).toEqual(byCreatedDesc(resume.challenges).map((c) => c.id))
    for (const folder of folders())
      folder.files.forEach((file, i) => {
        expect(file.position).toBe(i + 1)
        expect(file.total).toBe(folder.files.length)
        expect(file.path).toBe(`${folder.path}/${file.name}`)
        expect(file.name).toMatch(/^\d{4}-\d{2}_[a-z0-9-]+\.yml$/)
      })
  })

  it('slugify', () => {
    expect(slugify('NY Times (RPA)')).toBe('ny-times-rpa')
    expect(slugify('CIEE-PR')).toBe('ciee-pr')
    expect(slugify('Gincana Junina')).toBe('gincana-junina')
    expect(slugify('Ação Única')).toBe('acao-unica')
  })
})
