import { describe, expect, it } from 'vitest'
import { resume } from '@/data/resume'
import { TECH_ICONS } from '@/lib/tech-icons'
import type { Project, YearMonth } from '@/types/resume'

// Regras de specs/002-projects-animated-terminals/data-model.md e specs/003-devicons-skill-loops/
// data-model.md, seções "Validação" (que estendem a da 001) — o que o tipo não cobre.

const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/
/** Imagens em `public/`, pelo caminho relativo ao `base` (feature 009: capturas de tela). */
const PUBLIC_IMAGES = new Set(Object.keys(import.meta.glob('../../public/**/*.webp')).map((path) => path.replace('../../public/', '')))
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
      education: resume.education.map((e) => e.id),
    }
    for (const [name, ids] of Object.entries(collections)) {
      expect(new Set(ids).size, name).toBe(ids.length)
    }
  })

  // Feature 008 (FR-004, research R3): o id da formação é o slug do arquivo `AAAA_<id>.yml` da janela
  // `~/formacao`, que precisa ser curto
  it('(3b) id de formação em slug, com o nome do arquivo em até 31 caracteres', () => {
    for (const edu of resume.education) {
      expect(edu.id, edu.course).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      expect(`${edu.startYear}_${edu.id}.yml`.length, edu.id).toBeLessThanOrEqual(31)
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

  it('(6) projeto sem link é confidencial ou acadêmico com motivo, ou side-project com captura (Princípio II v3.1.0)', () => {
    for (const project of projects) {
      if (project.evidence.length > 0) continue
      if (project.screenshot) {
        expect(project.kind, project.id).toBe('side-project')
        continue
      }
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

  it('(8) inventário da feature 009', () => {
    expect(resume.experiences).toHaveLength(5)
    expect(resume.skillGroups).toHaveLength(5)
    // o DebianServer entrou em 2º, depois do SRG (feature 009, Q2)
    expect(projects.map((p) => p.id)).toEqual(['srg', 'debianserver', 'vscode-themes', 'italiami', 'ocr-prontuarios', 'qclass-bot', 'monitoria'])
    // o Bom Jesus (FAE) entrou na feature 009
    expect(resume.challenges).toHaveLength(8)
    expect(resume.community).toHaveLength(1)
    expect(resume.education).toHaveLength(4)
    expect(resume.profile.attributes).toHaveLength(5)
    expect(resume.contacts).toHaveLength(2)
    expect(projects.filter((p) => p.inProgress).map((p) => p.id)).toEqual(['srg'])
    expect(projects.filter((p) => p.inProductionSince).map((p) => p.id)).toEqual(['debianserver'])
    const server = projects.find((p) => p.id === 'debianserver')!
    expect(server.details?.map((d) => d.label)).toEqual(['hardware', 'sistema', 'acesso'])
    expect(server.apps?.map((a) => a.name)).toEqual(['Ente Photos', 'OpenWebUI', 'Kiwix', 'Syncthing', 'SearXNG', 'Watchtower'])
    expect(projects.flatMap((p) => p.evidence).filter((e) => e.private)).toHaveLength(10)
  })

  it('(9) comandos das janelas sem o prefixo ./run (FR-003 da 003)', () => {
    expect(projects.filter((p) => p.command.startsWith('./run')).map((p) => p.id)).toEqual([])
  })

  it('(10) skills: 5 grupos e 28 skills, na ordem; toda tecnologia exibida tem ícone (003)', () => {
    expect(resume.skillGroups.map((g) => [g.id, g.items.length])).toEqual([
      ['linguagens_frameworks', 8],
      ['conceitos_web', 2],
      ['gestao_de_dados', 3],
      ['desenho_de_processos', 6],
      ['devops_qualidade', 9],
    ])
    expect(resume.skillGroups.flatMap((g) => g.items).every((i) => Object.keys(i).join() === 'name')).toBe(true)
    const shown = [
      ...resume.skillGroups.flatMap((g) => g.items.map((i) => i.name)),
      ...resume.experiences.flatMap((e) => e.tech),
      ...projects.flatMap((p) => p.stack),
      ...projects.flatMap((p) => (p.apps ?? []).map((app) => app.name)),
      ...resume.challenges.flatMap((c) => c.stack),
    ]
    expect(shown.filter((name) => !TECH_ICONS[name])).toEqual([])
  })

  it('(11) loops: conceitos_web e desenho_de_processos andam para a direita, os outros no padrão (FR-046 da 004)', () => {
    expect(resume.skillGroups.map((g) => [g.id, g.loopDirection])).toEqual([
      ['linguagens_frameworks', undefined],
      ['conceitos_web', 'to-right'],
      ['gestao_de_dados', undefined],
      ['desenho_de_processos', 'to-right'],
      ['devops_qualidade', undefined],
    ])
  })

  it('(12) conteúdo da feature 004: chip JSON e papel no ItaliaMi (FR-041, FR-047)', () => {
    const shown = [...resume.experiences.flatMap((e) => e.tech), ...projects.flatMap((p) => p.stack), ...resume.challenges.flatMap((c) => c.stack)]
    expect(shown).not.toContain('JSON de tema')
    expect(projects.find((p) => p.id === 'vscode-themes')!.stack).toContain('JSON')
    expect(projects.find((p) => p.id === 'italiami')!.role).toBe('Autor e desenvolvedor')
  })

  // Feature 009 (data-model §3): selo de produção, detalhes, apps e a captura de tela
  it('(13) EM PRODUÇÃO e EM DESENVOLVIMENTO nunca no mesmo projeto; desde em "AAAA-MM-DD", até hoje', () => {
    const today = `${currentMonth}-${String(now.getDate()).padStart(2, '0')}`
    for (const project of projects) {
      expect(!!project.inProgress && !!project.inProductionSince, project.id).toBe(false)
      if (project.inProductionSince) {
        expect(project.inProductionSince, project.id).toMatch(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
        expect(project.inProductionSince <= today, `${project.id}: em produção no futuro`).toBe(true)
      }
    }
    // o DebianServer entrou em produção em 1º de outubro de 2026 (pedido do autor)
    expect(projects.find((p) => p.id === 'debianserver')!.inProductionSince).toBe('2026-10-01')
  })

  it('(14) rótulos de details em minúsculas sem acento, únicos no projeto; apps com explicação', () => {
    for (const project of projects) {
      const labels = (project.details ?? []).map((d) => d.label)
      for (const label of labels) expect(label, project.id).toMatch(/^[a-z]+$/)
      expect(new Set(labels).size, project.id).toBe(labels.length)
      for (const detail of project.details ?? []) expect(detail.value.trim(), `${project.id}: ${detail.label}`).not.toBe('')
      for (const app of project.apps ?? []) expect(app.summary.trim(), `${project.id}: ${app.name}`).not.toBe('')
    }
  })

  it('(15) captura com texto alternativo, legenda e arquivos WebP relativos que existem em public/', () => {
    for (const project of projects) {
      const shot = project.screenshot
      if (!shot) continue
      expect(shot.alt.trim(), project.id).not.toBe('')
      expect(shot.caption.trim(), project.id).not.toBe('')
      expect(shot.captured, project.id).toMatch(YEAR_MONTH)
      // o texto alternativo cita a data da captura (DD/MM/AAAA do mesmo mês)
      const [year, month] = shot.captured.split('-')
      expect(shot.alt, project.id).toMatch(new RegExp(`\\b\\d{2}/${month}/${year}\\b`))
      for (const path of [shot.src, shot.full]) {
        expect(path, project.id).not.toMatch(/^\/|^[a-z]+:/)
        expect(path, project.id).toMatch(/\.webp$/)
        expect(PUBLIC_IMAGES.has(path), path).toBe(true)
      }
      expect(shot.srcWidth, project.id).toBeLessThan(shot.width)
    }
  })

  it('(16) nada nos projetos localiza ou dá acesso a um servidor: sem IP, .ts.net ou porta (FR-020)', () => {
    for (const project of projects) {
      const texts = [
        project.purpose,
        project.role,
        ...(project.details ?? []).map((d) => d.value),
        ...(project.apps ?? []).map((a) => a.summary),
        ...(project.screenshot ? [project.screenshot.alt, project.screenshot.caption] : []),
      ]
      for (const text of texts) {
        expect(text, project.id).not.toMatch(/\b\d{1,3}(\.\d{1,3}){3}\b/)
        expect(text, project.id).not.toMatch(/\.ts\.net/)
        expect(text, project.id).not.toMatch(/:\d{2,5}\b/)
      }
    }
  })
})
