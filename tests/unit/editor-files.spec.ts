import { describe, expect, it } from 'vitest'
import { resume } from '@/data/resume'
import { challengeFolder, communityFolder, educationFolder, experienceFolder, fileText, slugify, type EditorFolder } from '@/lib/editor-files'
import { formatPeriod, formatYearMonth, formatYears } from '@/lib/period'
import { byCreatedDesc, byStartDesc, byStartYearDesc } from '@/lib/sort'

// Feature 006 (FR-005 a FR-009, SC-001, research R3): os arquivos YAML das janelas de editor trazem
// todos os fatos dos cartões, e só eles (Princípio I). Feature 008 (FR-003 a FR-007, data-model §3): a
// pasta `~/formacao`, com um arquivo por formação.

const KEYS = {
  carreira: ['cargo', 'empresa', 'local', 'periodo', 'atual', 'resumo', 'resultados', 'stack'],
  challenges: ['nome', 'criado', 'resumo', 'stack', 'repositorio'],
  comunitario: ['nome', 'instituicao', 'local', 'data', 'resumo', 'papel', 'fonte'],
  formacao: ['curso', 'instituicao', 'local', 'periodo', 'em_curso', 'observacao', 'fontes'],
} as const

const folders = (): EditorFolder[] => [
  experienceFolder(resume.experiences),
  challengeFolder(resume.challenges),
  communityFolder(resume.community),
  educationFolder(resume.education),
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

  it('cada formação traz todos os fatos do cartão; EM CURSO só na em andamento; fontes em lista de links', () => {
    const { files } = educationFolder(resume.education)
    byStartYearDesc(resume.education).forEach((edu, i) => {
      const file = files[i]!
      const text = fileText(file)
      expect(file.id).toBe(edu.id)
      for (const fact of [edu.course, edu.institution, edu.location, formatYears(edu.startYear, edu.endYear)]) expect(text).toContain(fact)
      expect(text.includes('em_curso: true  # EM CURSO')).toBe(edu.status === 'em-curso')
      expect(text.includes('observacao: >')).toBe(!!edu.note)
      if (edu.note) expect(text).toContain(edu.note)
      expect(text.includes('fontes:')).toBe(!!edu.sources)
      const links = file.lines.filter((l) => l.tokens.some((tok) => tok.kind === 'link'))
      expect(links.map((l) => l.tokens)).toEqual(
        (edu.sources ?? []).map((src) => [
          { kind: 'punct', text: '- ' },
          { kind: 'link', text: src.label, href: src.url },
        ]),
      )
      for (const l of links) expect(l.indent).toBe(1)
    })
    const empregotech = files.find((f) => f.id === 'empregotech')!
    expect(fileText(empregotech)).toContain('fontes:\n  - overbr.com.br\n  - curitiba.pr.gov.br')
  })

  it('pasta ~/formacao: nomes AAAA_<id>.yml na ordem da seção e o cabeçalho', () => {
    const folder = educationFolder(resume.education)
    expect(folder.label).toBe('formacao')
    expect(folder.path).toBe('~/formacao')
    expect(folder.files.map((f) => f.name)).toEqual([
      '2025_ciberseguranca.yml',
      '2020_sistemas-de-informacao.yml',
      '2020_empregotech.yml',
      '2018_tecnico-ads.yml',
    ])
    expect(folder.files[0]!.path).toBe('~/formacao/2025_ciberseguranca.yml')
    expect(fileText(folder.files[0]!).split('\n')[0]).toBe('# 1 / 4 · Pós-Graduação em Cibersegurança')
    expect(fileText(folder.files[0]!)).toBe(
      [
        '# 1 / 4 · Pós-Graduação em Cibersegurança',
        'curso: Pós-Graduação em Cibersegurança',
        'instituicao: PUC-PR',
        'local: Curitiba - PR',
        'periodo: 2025 — 2027',
        'em_curso: true  # EM CURSO',
      ].join('\n'),
    )
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
    const [carreira, challenges, comunitario, formacao] = folders()
    expect(carreira!.path).toBe('~/carreira')
    expect(challenges!.path).toBe('~/projetos/challenges')
    expect(comunitario!.path).toBe('~/projetos/comunitario')
    expect(formacao!.path).toBe('~/formacao')
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
    expect(formacao!.files.map((f) => f.id)).toEqual(byStartYearDesc(resume.education).map((e) => e.id))
    for (const folder of folders())
      folder.files.forEach((file, i) => {
        expect(file.position).toBe(i + 1)
        expect(file.total).toBe(folder.files.length)
        expect(file.path).toBe(`${folder.path}/${file.name}`)
        // AAAA-MM_<slug>.yml; na formação, que só tem anos, AAAA_<id>.yml (feature 008)
        expect(file.name).toMatch(folder.label === 'formacao' ? /^\d{4}_[a-z0-9-]+\.yml$/ : /^\d{4}-\d{2}_[a-z0-9-]+\.yml$/)
      })
  })

  it('slugify', () => {
    expect(slugify('NY Times (RPA)')).toBe('ny-times-rpa')
    expect(slugify('CIEE-PR')).toBe('ciee-pr')
    expect(slugify('Gincana Junina')).toBe('gincana-junina')
    expect(slugify('Ação Única')).toBe('acao-unica')
  })
})
