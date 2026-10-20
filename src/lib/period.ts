import type { YearMonth, YearMonthDay } from '@/types/resume'

const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

/** `'2026-03'` → `'MAR 2026'` */
export function formatYearMonth(value: YearMonth): string {
  const [year, month] = value.split('-')
  const label = MONTHS[Number(month) - 1]
  if (!year || !label) throw new Error(`Data inválida: "${value}" (esperado "AAAA-MM")`)
  return `${label} ${year}`
}

/** `'2026-10-01'` → `'01 OUT 2026'`: data com o dia, no formato dos meses da página (feature 009). */
export function formatDate(value: YearMonthDay): string {
  const [year, month, day] = value.split('-')
  const label = MONTHS[Number(month) - 1]
  if (!year || !label || !day || !/^\d{2}$/.test(day) || Number(day) < 1 || Number(day) > 31)
    throw new Error(`Data inválida: "${value}" (esperado "AAAA-MM-DD")`)
  return `${day} ${label} ${year}`
}

/** `'MAR 2026 — JUL 2026'`, ou `'MAR 2026 — PRESENTE'` sem término (FR-005). */
export function formatPeriod(start: YearMonth, end?: YearMonth): string {
  return `${formatYearMonth(start)} — ${end ? formatYearMonth(end) : 'PRESENTE'}`
}

/** `'2025 — 2027'` */
export function formatYears(start: number, end: number): string {
  return `${start} — ${end}`
}
