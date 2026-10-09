import type { Challenge, Education, Experience } from '@/types/resume'

// "AAAA-MM" ordena corretamente como string.

/** Experiências da mais recente para a mais antiga (FR-004). Não muta o original. */
export function byStartDesc(list: readonly Experience[]): Experience[] {
  return [...list].sort((a, b) => b.start.localeCompare(a.start))
}

/** Formações da mais recente para a mais antiga (FR-004); no mesmo ano de início, a de término mais
 *  recente vem antes (FR-024 da 002). Não muta o original. */
export function byStartYearDesc(list: readonly Education[]): Education[] {
  return [...list].sort((a, b) => b.startYear - a.startYear || b.endYear - a.endYear)
}

/** Challenges pela data de criação, do mais recente para o mais antigo; empate pelo nome (FR-015). */
export function byCreatedDesc(list: readonly Challenge[]): Challenge[] {
  return [...list].sort((a, b) => b.created.localeCompare(a.created) || a.name.localeCompare(b.name, 'pt-BR'))
}
