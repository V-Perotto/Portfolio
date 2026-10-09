/**
 * Tempo do Lattice Loader da primeira linha do hero (feature 006, FR-039 e FR-040, research R13,
 * data-model §5). Função pura, no relógio de `performance.now()`:
 *
 * - o loader trabalha desde que a página é descoberta (`revealedAt`) e passa a "done" quando o hero
 *   está pronto, nunca antes de 3 s (clarify); se o hero não ficar pronto, passa aos 10 s;
 * - 3 s depois de "done", a linha some.
 */
export type LoaderPhase = 'working' | 'done' | 'hidden'

export interface LoaderSchedule {
  doneAt: number
  hideAt: number
}

export const MIN_WORK_MS = 3000
export const MAX_WORK_MS = 10000
export const SHOW_DONE_MS = 3000

export function loaderSchedule(revealedAt: number, readyAt: number | null): LoaderSchedule {
  const waited = readyAt === null ? Infinity : readyAt - revealedAt
  const doneAt = revealedAt + Math.min(MAX_WORK_MS, Math.max(MIN_WORK_MS, waited))
  return { doneAt, hideAt: doneAt + SHOW_DONE_MS }
}
