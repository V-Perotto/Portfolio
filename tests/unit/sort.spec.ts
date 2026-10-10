import { describe, expect, it } from 'vitest'
import { byCreatedDesc, byStartYearDesc } from '@/lib/sort'
import type { Challenge, Education } from '@/types/resume'

const challenge = (name: string, created: Challenge['created']): Challenge => ({
  id: name.toLowerCase(),
  name,
  created,
  summary: 'x',
  stack: ['TypeScript'],
  url: `https://github.com/x/${name}`,
})

describe('byCreatedDesc (FR-015, SC-004)', () => {
  it('ordena do mais recente para o mais antigo, qualquer que seja a ordem de entrada', () => {
    const shuffled = [challenge('B', '2024-01'), challenge('D', '2026-09'), challenge('A', '2023-07'), challenge('C', '2025-10')]
    expect(byCreatedDesc(shuffled).map((c) => c.name)).toEqual(['D', 'C', 'B', 'A'])
  })

  it('no mesmo mês, desempata pelo nome', () => {
    expect(byCreatedDesc([challenge('Zeta', '2026-01'), challenge('Alfa', '2026-01')]).map((c) => c.name)).toEqual(['Alfa', 'Zeta'])
  })

  it('não muta a lista original', () => {
    const list = [challenge('A', '2023-07'), challenge('B', '2026-09')]
    byCreatedDesc(list)
    expect(list.map((c) => c.name)).toEqual(['A', 'B'])
  })
})

describe('byStartYearDesc (FR-024)', () => {
  const edu = (course: string, startYear: number, endYear: number): Education => ({
    id: course.toLowerCase(),
    course,
    institution: 'x',
    location: 'x',
    startYear,
    endYear,
    status: 'concluido',
  })

  it('mesmo ano de início: a de término mais recente vem antes', () => {
    const list = [edu('Técnico', 2018, 2019), edu('Empregotech', 2020, 2020), edu('Bacharelado', 2020, 2024), edu('Pós', 2025, 2027)]
    expect(byStartYearDesc(list).map((e) => e.course)).toEqual(['Pós', 'Bacharelado', 'Empregotech', 'Técnico'])
  })
})
