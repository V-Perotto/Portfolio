/**
 * Chuva Matrix do fundo do hero (FR-032 da 001; feature 004, FR-037, research R3 e R10). Desenha num
 * contexto 2D qualquer (canvas da página ou `OffscreenCanvas` de um worker): o resultado é a imagem
 * que o tubo CRT exibe. O rastro some para o preto (12% por passo), e o shader do CRT soma a chuva ao
 * fundo do hero.
 */

/** Letras latinas, algarismos e caracteres especiais do teclado; nada de katakana (FR-037). */
export const MATRIX_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*&%$#@!?+=-<>[]{}()/\\|~^;:'

/** Intervalo entre passos da chuva (~18 por segundo, como antes). */
export const MATRIX_STEP_MS = 55

/** Tamanho da fonte em px CSS. */
const FONT_SIZE = 15

export interface MatrixColors {
  /** Cor de uma a cada 3 colunas. */
  purple: string
  /** Cor das demais colunas. */
  green: string
}

type Context2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

export class MatrixRain {
  private drops: number[] = []
  private width = 0
  private height = 0
  private size = FONT_SIZE

  constructor(
    private readonly colors: MatrixColors,
    private readonly random: () => number = Math.random,
  ) {}

  /** `width`/`height` em pixels do canvas; `scale` = pixels do canvas por px CSS. */
  resize(width: number, height: number, scale: number) {
    this.width = width
    this.height = height
    this.size = FONT_SIZE * scale
    this.drops = Array.from({ length: Math.floor(width / this.size) }, () => Math.floor(this.random() * -50))
  }

  step(ctx: Context2D) {
    ctx.globalAlpha = 0.12
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, this.width, this.height)
    ctx.globalAlpha = 1
    ctx.font = `${this.size}px monospace`
    for (let i = 0; i < this.drops.length; i++) {
      const char = MATRIX_CHARS[Math.floor(this.random() * MATRIX_CHARS.length)] ?? '0'
      ctx.fillStyle = i % 3 === 0 ? this.colors.purple : this.colors.green
      const y = this.drops[i] ?? 0
      ctx.fillText(char, i * this.size, y * this.size)
      this.drops[i] = y * this.size > this.height && this.random() > 0.975 ? 0 : y + 1
    }
  }
}
