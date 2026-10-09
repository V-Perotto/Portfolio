import { describe, expect, it } from 'vitest'
import {
  APP_FAILED_MS,
  BOOT_COMMAND,
  BOOT_DEADLINE_MS,
  BOOT_FADE_MS,
  BOOT_LATEST_START_MS,
  BOOT_SAFETY_MS,
  BOOT_SEQUENCE_MS,
  bootFrame,
  lineText,
} from '@/lib/boot'
import indexHtml from '../../index.html?raw'

// Feature 004, US1 (FR-030 a FR-032, research R4): a sessão do boot é uma função pura do tempo.
describe('linha do tempo do boot', () => {
  it('no instante 0 há só o prompt anônimo com o primeiro caractere do ssh', () => {
    const lines = bootFrame(0)
    expect(lines).toHaveLength(1)
    expect(lineText(lines[0]!)).toBe('anon@127.0.0.1:~$ s')
  })

  it('no fim da sequência a sessão está inteira, terminando em ./iniciar_portfolio.sh completo', () => {
    const lines = bootFrame(BOOT_SEQUENCE_MS, '09/10/2026, 10:00:00').map(lineText)
    expect(lines).toEqual([
      'anon@127.0.0.1:~$ ssh viper@portfolio',
      'Conectando a portfolio na porta 22...',
      "viper@portfolio's password: ••••••••",
      'Autenticado. Bem-vindo ao PortfolioOS 1.0 LTS',
      'Last login: 09/10/2026, 10:00:00 from 127.0.0.1',
      `viper@portfolio:~$ ${BOOT_COMMAND}`,
    ])
  })

  it('o último caractere do comando sai 350 ms antes do fim (a pausa da sequência anterior)', () => {
    const before = bootFrame(BOOT_SEQUENCE_MS - 351).map(lineText)
    const at = bootFrame(BOOT_SEQUENCE_MS - 350).map(lineText)
    expect(before.at(-1)).toBe('viper@portfolio:~$ ./iniciar_portfolio.s')
    expect(at.at(-1)).toBe(`viper@portfolio:~$ ${BOOT_COMMAND}`)
  })

  it('o texto só cresce com o tempo', () => {
    let previous = ''
    for (let t = 0; t <= BOOT_SEQUENCE_MS + 100; t += 7) {
      const text = bootFrame(t).map(lineText).join('\n')
      expect(text.startsWith(previous)).toBe(true)
      previous = text
    }
  })

  it('constantes: sequência de 3895 ms e início mais tardio de 2055 ms dentro do teto de 7 s', () => {
    expect(BOOT_SEQUENCE_MS).toBe(3895)
    expect(BOOT_DEADLINE_MS).toBe(7000)
    expect(BOOT_LATEST_START_MS).toBe(BOOT_DEADLINE_MS - BOOT_SEQUENCE_MS - BOOT_FADE_MS - BOOT_SAFETY_MS)
    expect(BOOT_LATEST_START_MS).toBe(2055)
  })

  it('o script inline de index.html usa os mesmos prazos', () => {
    const script = indexHtml.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? ''
    expect(script).toContain(`at(${BOOT_LATEST_START_MS},`)
    expect(script).toContain(`at(${APP_FAILED_MS},`)
    expect(script).toContain(`at(${BOOT_DEADLINE_MS},`)
  })
})
