import { describe, expect, it } from 'vitest'
import { MATRIX_CHARS, MatrixRain } from '@/lib/matrix-rain'

// Feature 004, US5 (FR-037): a chuva usa letras, algarismos e caracteres especiais, sem katakana.
describe('chuva Matrix', () => {
  it('tem maiúsculas, minúsculas, algarismos e *&%$#@', () => {
    for (const range of ['ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz', '0123456789', '*&%$#@']) {
      for (const c of range) expect(MATRIX_CHARS).toContain(c)
    }
  })

  it('só ASCII imprimível: nenhum katakana nem outro alfabeto', () => {
    expect(MATRIX_CHARS).toMatch(/^[\x21-\x7e]+$/)
    expect(MATRIX_CHARS).not.toMatch(/[゠-ヿ]/)
  })

  it('desenha só caracteres da lista, alternando as cores, e recomeça colunas que passam do fim', () => {
    const drawn: { char: string; color: string; y: number }[] = []
    let fill = ''
    const ctx = {
      globalAlpha: 1,
      font: '',
      set fillStyle(v: string) {
        fill = v
      },
      get fillStyle() {
        return fill
      },
      fillRect() {},
      fillText(char: string, _x: number, y: number) {
        drawn.push({ char, color: fill, y })
      },
    } as unknown as CanvasRenderingContext2D
    let n = 0
    const random = () => ((n = (n * 9301 + 49297) % 233280) / 233280)
    const rain = new MatrixRain({ purple: 'P', green: 'G' }, random)
    rain.resize(150, 60, 1) // 10 colunas de 15px, 4 linhas
    for (let i = 0; i < 400; i++) rain.step(ctx)
    expect(drawn.every((d) => MATRIX_CHARS.includes(d.char))).toBe(true)
    expect(drawn.slice(0, 10).map((d) => d.color)).toEqual(['P', 'G', 'G', 'P', 'G', 'G', 'P', 'G', 'G', 'P'])
    // depois de passar do fim, alguma coluna voltou ao topo
    const late = drawn.slice(-1000)
    expect(late.some((d) => d.y === 0)).toBe(true)
  })
})
