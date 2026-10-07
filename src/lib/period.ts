import type { YearMonth } from '@/types/resume'

const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

/** `'2026-03'` → `'MAR 2026'` */
export function formatYearMonth(value: YearMonth): string {
  const [year, month] = value.split('-')
  const label = MONTHS[Number(month) - 1]
  if (!year || !label) throw new Error(`Data inválida: "${value}" (esperado "AAAA-MM")`)
  return `${label} ${year}`
}

/** `'MAR 2026 — JUL 2026'`, ou `'MAR 2026 — PRESENTE'` sem término (FR-005). */
export function formatPeriod(start: YearMonth, end?: YearMonth): string {
  return `${formatYearMonth(start)} — ${end ? formatYearMonth(end) : 'PRESENTE'}`
}

/** `'2025 — 2027'` */
export function formatYears(start: number, end: number): string {
  return `${start} — ${end}`
}
