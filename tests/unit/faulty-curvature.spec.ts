import { describe, expect, it } from 'vitest'
import { curvatureFor } from '@/lib/scenes/faulty'

// Feature 006, US6 (FR-036, SC-010, research R15): no celular, o fundo da porta só levemente curvo.
describe('curvatura do Faulty Terminal', () => {
  it('desktop 16:9 ou mais largo: a curvatura de sempre', () => {
    expect(curvatureFor(0.2, 1366, 768)).toBeCloseTo(0.2, 10)
    expect(curvatureFor(0.2, 1920, 1080)).toBeCloseTo(0.2, 3)
    expect(curvatureFor(0.2, 2560, 1080)).toBe(0.2)
  })

  it('celular em retrato e tablet: proporcionalmente menos', () => {
    expect(curvatureFor(0.2, 390, 844)).toBeCloseTo(0.052, 3)
    expect(curvatureFor(0.2, 768, 1024)).toBeCloseTo(0.084, 3)
    expect(curvatureFor(0.2, 320, 640)).toBeCloseTo(0.0562, 3)
  })

  it('o arqueamento relativo à largura nunca passa o do desktop 16:9', () => {
    const bow = (w: number, h: number) => curvatureFor(0.2, w, h) * (h / w)
    const desktop = bow(1366, 768)
    for (const [w, h] of [[390, 844], [768, 1024], [1280, 1024], [1440, 900], [320, 568]] as const)
      expect(bow(w, h)).toBeLessThanOrEqual(desktop + 1e-9)
  })

  it('nunca maior que a curvatura de base; tamanho inválido não quebra', () => {
    for (const [w, h] of [[100, 50], [50, 100], [1, 1000]] as const) expect(curvatureFor(0.2, w, h)).toBeLessThanOrEqual(0.2)
    expect(curvatureFor(0.2, 0, 0)).toBe(0.2)
  })
})
