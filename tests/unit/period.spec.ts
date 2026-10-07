import { describe, expect, it } from 'vitest'
import { formatPeriod, formatYearMonth, formatYears } from '@/lib/period'
import type { YearMonth } from '@/types/resume'

describe('formatYearMonth', () => {
  const expected = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

  it.each(expected.map((label, i) => [i + 1, label] as const))('mês %i → %s', (month, label) => {
    const value = `2024-${String(month).padStart(2, '0')}` as YearMonth
    expect(formatYearMonth(value)).toBe(`${label} 2024`)
  })

  it('rejeita mês inexistente', () => {
    expect(() => formatYearMonth('2024-13')).toThrow()
  })
})

describe('formatPeriod', () => {
  it('formata período fechado com travessão', () => {
    expect(formatPeriod('2026-03', '2026-07')).toBe('MAR 2026 — JUL 2026')
  })

  it('formata período em andamento', () => {
    expect(formatPeriod('2026-03')).toBe('MAR 2026 — PRESENTE')
  })
})

describe('formatYears', () => {
  it('formata intervalo de anos', () => {
    expect(formatYears(2025, 2027)).toBe('2025 — 2027')
  })
})
