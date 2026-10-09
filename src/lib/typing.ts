/**
 * Ritmo da digitação das janelas de terminal (research R5 da 002). Função pura: recebe o tamanho
 * de cada comando da janela e devolve um plano que cabe no orçamento, qualquer que seja o tamanho
 * dos comandos (FR-026: a janela fica completa em até 2,5 s).
 */
export interface TypingPlan {
  /** Espera antes do primeiro caractere. */
  initialDelay: number
  /** Pausa depois de digitar cada comando, antes de a saída dele aparecer. */
  pauseAfter: number
  /** Intervalo entre tiques. */
  tickMs: number
  /** Caracteres revelados por tique (mais de 1 quando o texto é longo). */
  charsPerTick: number
  /** Duração total prevista. */
  totalMs: number
}

/** Orçamento da janela inteira, abaixo dos 2,5 s do FR-026 com folga para timers atrasados. */
export const TYPING_BUDGET_MS = 2200
const INITIAL_DELAY_MS = 150
const PAUSE_MS = 220
const MAX_CHAR_MS = 45
/** Menor intervalo útil entre tiques (~1 quadro a 60 Hz). */
const MIN_TICK_MS = 16

export function planTyping(commandLengths: readonly number[]): TypingPlan {
  const lengths = commandLengths.map((n) => Math.max(0, Math.floor(n)))
  const steps = Math.max(lengths.length, 1)
  const chars = lengths.reduce((sum, n) => sum + n, 0)

  // com muitos comandos, as pausas encolhem para não comerem o orçamento da digitação
  const pauseAfter = Math.min(PAUSE_MS, Math.floor(((TYPING_BUDGET_MS - INITIAL_DELAY_MS) * 0.4) / steps))
  // cada comando pode arredondar para cima um tique: reserva um tique máximo por comando
  const typingBudget = TYPING_BUDGET_MS - INITIAL_DELAY_MS - steps * (pauseAfter + MAX_CHAR_MS)

  let tickMs = MIN_TICK_MS
  let charsPerTick = 1
  if (chars > 0) {
    const msPerChar = Math.min(MAX_CHAR_MS, typingBudget / chars)
    if (msPerChar >= MIN_TICK_MS) tickMs = Math.floor(msPerChar)
    else charsPerTick = Math.ceil(MIN_TICK_MS / msPerChar)
  }

  const ticks = lengths.reduce((sum, n) => sum + Math.ceil(n / charsPerTick), 0)
  const totalMs = INITIAL_DELAY_MS + ticks * tickMs + lengths.length * pauseAfter
  return { initialDelay: INITIAL_DELAY_MS, pauseAfter, tickMs, charsPerTick, totalMs }
}
