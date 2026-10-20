import { describe, expect, it } from 'vitest'
import { resume } from '@/data/resume'
import {
  certificateFolder,
  challengeFolder,
  communityFolder,
  educationFolder,
  experienceFolder,
  fileText,
  slugify,
  type EditorFolder,
} from '@/lib/editor-files'
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

  // Feature 009 (FR-001 a FR-005, SC-002): o Bom Jesus (FAE), o mais recente, é o 1º de 8
  it('challenge Bom Jesus (FAE): 1º arquivo, 1 / 8, com os fatos e o repositório como link', () => {
    const folder = challengeFolder(resume.challenges)
    expect(folder.files).toHaveLength(8)
    const first = folder.files[0]!
    expect(first.name).toBe('2026-10_bom-jesus-fae.yml')
    expect(first.path).toBe('~/projetos/challenges/2026-10_bom-jesus-fae.yml')
    expect([first.position, first.total]).toEqual([1, 8])
    const text = fileText(first)
    expect(text.split('\n')[0]).toBe('# 1 / 8 · Bom Jesus (FAE)')
    expect(text).toContain('OUT 2026')
    expect(text).toContain('Gestão acadêmica: API REST e interface web')
    const stack = ['Java', 'Spring Boot', 'Vue 3', 'TypeScript', 'H2', 'Docker']
    const positions = stack.map((tech) => text.indexOf(tech))
    expect(positions.every((at) => at >= 0)).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
    const links = first.lines.flatMap((l) => l.tokens).filter((tok) => tok.kind === 'link')
    expect(links).toEqual([
      { kind: 'link', text: 'github.com/V-Perotto/bomjesus-challenge', href: 'https://github.com/V-Perotto/bomjesus-challenge' },
    ])
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
        '2026-10_bom-jesus-fae.yml',
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

  // Feature 010 (FR-003 a FR-011, research R3 e R5; contracts/certificates-window.md §3)
  describe('certificados', () => {
    const folder = certificateFolder(resume.certificatePlatforms)
    const groups = folder.groups!
    const file = (id: string) => folder.files.find((f) => f.id === id)!

    it('pasta ~/certificados com 5 pastas na ordem do autor e a posição contada na pasta', () => {
      expect(folder.label).toBe('certificados')
      expect(folder.path).toBe('~/certificados')
      expect(groups.map((g) => g.label)).toEqual(['dio', 'prime-academy', 'udemy', 'senai', 'promenady'])
      expect(groups.map((g) => g.title)).toEqual(['DIO', 'Prime Academy', 'Udemy', 'SENAI', 'Promenady'])
      expect(groups.map((g) => g.files.length)).toEqual([33, 20, 2, 1, 5])
      expect(folder.files).toEqual(groups.flatMap((g) => g.files))
      for (const group of groups)
        group.files.forEach((f, i) => {
          expect(f.position).toBe(i + 1)
          expect(f.total).toBe(group.files.length)
          expect(f.group).toBe(group.label)
          expect(f.path).toBe(`~/certificados/${group.label}/${f.name}`)
          expect(f.name).toMatch(/^\d{4}-\d{2}-\d{2}_[a-z0-9-]+\.yml$/)
          expect(f.name.length).toBeLessThanOrEqual(35)
        })
    })

    it('1º da DIO: o bootcamp com tipo, data, carga horária e o link de verificação (contrato §3)', () => {
      const first = groups[0]!.files[0]!
      expect(first.id).toBe('dio/empregotech-basico')
      expect(fileText(first)).toBe(
        [
          '# 1 / 33 · Programa EmpregoTech Curitiba - Básico',
          'curso: Programa EmpregoTech Curitiba - Básico',
          'plataforma: DIO',
          'tipo: bootcamp',
          'emitido: 29 JUL 2020',
          'carga_horaria: 39 h',
          'verificacao: hermes.dio.me/certificates/207D7222.pdf',
        ].join('\n'),
      )
      const link = first.lines.at(-1)!.tokens.find((tok) => tok.kind === 'link')!
      expect(link.href).toBe('https://hermes.dio.me/certificates/207D7222.pdf')
    })

    it('Prime Academy com codigo (texto), Promenady com o link host · código, SENAI com a ementa e o código omitido (R5, C2, C3)', () => {
      const apis = fileText(file('prime-academy/apis'))
      expect(apis).toContain('codigo: 666923b8ee6805a1a5040c2ddcb47d02')
      expect(file('prime-academy/apis').lines.some((l) => l.tokens.some((tok) => tok.kind === 'link'))).toBe(false)
      const promenady = file('promenady/formacao-consultores')
      expect(fileText(promenady)).toContain('verificacao: e-certificado.com · 1641756A81BF361B10825550')
      expect(promenady.lines.at(-1)!.tokens.find((tok) => tok.kind === 'link')!.href).toBe(
        'https://e-certificado.com/login/autenticar?c=1641756A81BF361B10825550',
      )
      const senai = fileText(file('senai/ia'))
      expect(senai).toContain('ementa: [Inteligência Artificial, Aprendizagem de máquina,')
      expect(senai.split('\n').at(-1)).toBe('# código omitido por privacidade')
      expect(senai).not.toMatch(/codigo:|verificacao:/)
    })

    it('ordem da pasta: data desc., e no mesmo dia a dos dados (DIO, 01 JUL 2020)', () => {
      const julyFirst = groups[0]!.files.filter((f) => f.name.startsWith('2020-07-01_')).map((f) => f.id)
      expect(julyFirst).toEqual(['dio/redux', 'dio/js-com-react', 'dio/reactjs-web', 'dio/react-typescript', 'dio/intro-reactjs'])
    })

    it('cada arquivo tem a miniatura abaixo das linhas, com o texto alternativo e a legenda do visualizador (FR-009)', () => {
      const f = file('dio/logica-programacao').figure!
      expect(f).toMatchObject({
        src: 'certificados/dio/2020-04-13_logica-programacao-640.webp',
        full: 'certificados/dio/2020-04-13_logica-programacao-1200.webp',
        placement: 'below',
        openLabel: '(abre o certificado em tamanho real)',
        alt: 'Certificado da DIO: Lógica de programação essencial, 4 h, 13/04/2020',
        viewerCaption: '# DIO · Lógica de programação essencial · 13 ABR 2020',
      })
      expect(f.caption).toBeUndefined()
      expect(folder.files.every((x) => x.figure?.placement === 'below')).toBe(true)
    })

    it('só as chaves previstas', () => {
      const allowed = ['curso', 'plataforma', 'tipo', 'emitido', 'carga_horaria', 'ementa', 'verificacao', 'codigo']
      for (const f of folder.files) for (const l of f.lines) for (const tok of l.tokens) if (tok.kind === 'key') expect(allowed).toContain(tok.text)
    })
  })

  // Feature 010 (FR-017, Q3; research R8): a foto do 1º dia ao lado das linhas do arquivo da Prime Control
  it('só a Prime Control tem a foto, ao lado das linhas, com a legenda datada; as linhas não mudam', () => {
    const carreira = experienceFolder(resume.experiences)
    const withFigure = carreira.files.filter((f) => f.figure)
    expect(withFigure.map((f) => f.id)).toEqual(['prime-control'])
    const prime = withFigure[0]!
    expect(prime.name).toBe('2020-10_prime-control.yml')
    expect(prime.figure).toMatchObject({
      src: 'carreira/prime-control/integracao-2020-10-15-512.webp',
      full: 'carreira/prime-control/integracao-2020-10-15-1024.webp',
      placement: 'side',
      caption: '# 1º dia na Prime Control · 15 OUT 2020',
      viewerCaption: '# 1º dia na Prime Control · 15 OUT 2020',
      openLabel: '(abre a foto em tamanho real)',
    })
    expect(fileText(prime)).toContain('periodo: OUT 2020 — OUT 2022')
    expect(fileText(prime)).not.toContain('foto')
  })
})
