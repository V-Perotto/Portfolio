import type { Education, Experience } from '@/types/resume'

// "AAAA-MM" ordena corretamente como string.

/** Experiências da mais recente para a mais antiga (FR-004). Não muta o original. */
export function byStartDesc(list: readonly Experience[]): Experience[] {
  return [...list].sort((a, b) => b.start.localeCompare(a.start))
}

/** Formações da mais recente para a mais antiga (FR-004). Não muta o original. */
export function byStartYearDesc(list: readonly Education[]): Education[] {
  return [...list].sort((a, b) => b.startYear - a.startYear)
}
