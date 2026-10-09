import { describe, expect, it } from 'vitest'
import { loaderSchedule, MAX_WORK_MS, MIN_WORK_MS, SHOW_DONE_MS } from '@/lib/hero-loader'

// Feature 006, US5 (FR-039, FR-040, clarify): "done" quando o hero está pronto, nunca antes de 3 s; some
// 3 s depois.
describe('tempo do loader do hero', () => {
  it('hero pronto antes de 3 s: done aos 3 s', () => {
    expect(loaderSchedule(1000, 1500)).toEqual({ doneAt: 4000, hideAt: 7000 })
    expect(loaderSchedule(1000, 800).doneAt).toBe(1000 + MIN_WORK_MS)
  })

  it('hero pronto depois de 3 s: done quando ele fica pronto', () => {
    expect(loaderSchedule(0, 4200)).toEqual({ doneAt: 4200, hideAt: 7200 })
  })

  it('hero que nunca fica pronto: done aos 10 s', () => {
    expect(loaderSchedule(500, null).doneAt).toBe(500 + MAX_WORK_MS)
    expect(loaderSchedule(500, 99_000).doneAt).toBe(500 + MAX_WORK_MS)
  })

  it('some 3 s depois de done', () => {
    for (const ready of [null, 0, 3500, 9000]) {
      const { doneAt, hideAt } = loaderSchedule(0, ready)
      expect(hideAt - doneAt).toBe(SHOW_DONE_MS)
    }
  })
})
