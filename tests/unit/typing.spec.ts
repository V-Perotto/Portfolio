import { describe, expect, it } from 'vitest'
import { planTyping, TYPING_BUDGET_MS } from '@/lib/typing'

// research R5 da 002: ritmo da digitação dentro do orçamento (FR-026, SC-005)
describe('planTyping', () => {
  it('janela Sobre (2 comandos, 34 caracteres) digita perto do ritmo máximo de 45 ms', () => {
    const plan = planTyping(['cat sobre.txt'.length, 'whois vittorio --info'.length])
    expect(plan.tickMs).toBeGreaterThanOrEqual(40)
    expect(plan.tickMs).toBeLessThanOrEqual(45)
    expect(plan.charsPerTick).toBe(1)
    expect(plan.totalMs).toBeLessThanOrEqual(TYPING_BUDGET_MS)
  })

  it('comandos longos digitam mais rápido e cabem no orçamento', () => {
    const short = planTyping([20])
    const long = planTyping([400])
    expect(long.tickMs / long.charsPerTick).toBeLessThan(short.tickMs / short.charsPerTick)
    expect(long.totalMs).toBeLessThanOrEqual(TYPING_BUDGET_MS)
  })

  it('cabe em 2,2 s para 1 a 1000 caracteres e 1 a 5 comandos', () => {
    for (let steps = 1; steps <= 5; steps++) {
      for (const chars of [1, 7, 33, 66, 150, 333, 1000]) {
        const lengths = Array.from({ length: steps }, (_, i) => Math.ceil(chars / steps) + i)
        const plan = planTyping(lengths)
        expect(plan.totalMs, `${steps} comandos, ${chars} caracteres`).toBeLessThanOrEqual(TYPING_BUDGET_MS)
        expect(plan.tickMs).toBeGreaterThanOrEqual(16)
      }
    }
  })

  it('comando vazio ou lista vazia não quebra', () => {
    expect(planTyping([0]).totalMs).toBeLessThanOrEqual(TYPING_BUDGET_MS)
    expect(planTyping([]).totalMs).toBeLessThanOrEqual(TYPING_BUDGET_MS)
    expect(Number.isFinite(planTyping([0, 0]).tickMs)).toBe(true)
  })
})
