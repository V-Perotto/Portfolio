import { describe, expect, it } from 'vitest'
import { GLITCH_CHARS, gridSize, lerpColor, pickColor, type Rgb } from '@/lib/scenes/letter-glitch'

// Feature 006, US4 (FR-030, FR-031, research R12): a cena do Letter Glitch.
describe('Letter Glitch', () => {
  it('grade de células de 10 × 20 px', () => {
    expect(gridSize(1366, 768)).toEqual({ columns: 137, rows: 39 })
    expect(gridSize(390, 844)).toEqual({ columns: 39, rows: 43 })
  })

  it('caracteres do original: letras, símbolos e algarismos', () => {
    expect(GLITCH_CHARS).toHaveLength(26 + 22 + 10)
    expect(GLITCH_CHARS).toContain('A')
    expect(GLITCH_CHARS).toContain('{')
    expect(GLITCH_CHARS).toContain('9')
  })

  it('interpolação numérica, também em transições encadeadas (o defeito do original)', () => {
    const green: Rgb = [74, 222, 155]
    const purple: Rgb = [160, 106, 224]
    const dark: Rgb = [32, 94, 68]
    expect(lerpColor(green, purple, 0)).toEqual(green)
    expect(lerpColor(green, purple, 1)).toEqual(purple)
    expect(lerpColor(green, purple, 0.5)).toEqual([117, 164, 190])
    // segunda troca a partir de uma cor intermediária: continua interpolando
    const middle = lerpColor(green, purple, 0.35)
    const next = lerpColor(middle, dark, 0.5)
    expect(next).not.toEqual(middle)
    expect(lerpColor(middle, dark, 1)).toEqual(dark)
  })

  it('sorteio só entre as cores dadas', () => {
    const colors: Rgb[] = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]
    for (const r of [0, 0.34, 0.67, 0.999]) expect(colors).toContainEqual(pickColor(colors, () => r))
  })
})
