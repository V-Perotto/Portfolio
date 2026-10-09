import { describe, expect, it } from 'vitest'
import {
  APP_FAILED_MS,
  BOOT_COMMAND,
  displayVersion,
  GATE_LATEST_START_MS,
  SESSION_MS,
  sessionAt,
  sessionLines,
  sessionLineText,
  typedEnd,
} from '@/lib/boot'
import indexHtml from '../../index.html?raw'

/** Duração da sessão da 004 (3895 ms), a referência do "diminuir um pouco" (FR-020). */
const BOOT_004_MS = 3895

// Feature 005 (FR-013, FR-016, FR-020, research R3): a sessão da porta de acesso.
describe('sessão da porta (005)', () => {
  const lines = sessionLines('203.0.113.7', 'v2.4', '09/10/2026, 10:00:00')

  it('as seis linhas, no texto do contrato', () => {
    expect(lines.map(sessionLineText)).toEqual([
      'anon@203.0.113.7:~$ ssh viper@portfolio',
      'Conectando ao portfolio...',
      'viper@portfolio password: ••••••••',
      'Autenticado. Bem-vindo ao Portfolio v2.4',
      'Last login: 09/10/2026, 10:00:00 from 203.0.113.7',
      `viper@portfolio:~$ ${BOOT_COMMAND}`,
    ])
  })

  it('cada linha só aparece depois do último caractere da anterior', () => {
    for (let i = 1; i < lines.length; i++) expect(lines[i]!.at).toBeGreaterThan(typedEnd(lines[i - 1]!))
  })

  it('o comando termina em 2475 ms e a sessão em 2720 ms, no máximo 75% da 004 (FR-020)', () => {
    expect(typedEnd(lines.at(-1)!)).toBe(2475)
    expect(SESSION_MS).toBe(2720)
    expect(SESSION_MS).toBeLessThanOrEqual(2900)
    expect(SESSION_MS / BOOT_004_MS).toBeLessThanOrEqual(0.75)
  })

  it('velocidades e pausas são as da 004 × 0,7', () => {
    const before = { ssh: 42, password: 55, run: 24, pauses: [250, 500, 450, 300, 400, 350] }
    const ratio = (a: number, b: number) => a / b
    const [ssh, , password, , , run] = lines
    for (const [now, then] of [
      [ssh!.typed!.speed, before.ssh],
      [password!.typed!.speed, before.password],
      [run!.typed!.speed, before.run],
    ] as const) {
      expect(ratio(now, then)).toBeGreaterThanOrEqual(0.69)
      expect(ratio(now, then)).toBeLessThanOrEqual(0.71)
    }
    const pauses = [...lines.slice(1).map((line, i) => line.at - typedEnd(lines[i]!)), SESSION_MS - typedEnd(lines.at(-1)!)]
    pauses.forEach((pause, i) => {
      expect(ratio(pause, before.pauses[i]!)).toBeGreaterThanOrEqual(0.69)
      expect(ratio(pause, before.pauses[i]!)).toBeLessThanOrEqual(0.71)
    })
  })

  it('as linhas visíveis só crescem com o tempo', () => {
    let previous = 0
    for (let t = -100; t <= SESSION_MS; t += 7) {
      const visible = sessionAt(t, lines)
      expect(visible).toBeGreaterThanOrEqual(previous)
      previous = visible
    }
    expect(sessionAt(-1, lines)).toBe(0)
    expect(sessionAt(0, lines)).toBe(1)
    expect(sessionAt(SESSION_MS, lines)).toBe(6)
  })

  it('displayVersion mostra só a maior e a menor', () => {
    expect(displayVersion('2.4.0')).toBe('v2.4')
    expect(displayVersion('10.12.3')).toBe('v10.12')
  })
})

// Feature 005 (FR-011, research R2): os prazos do script inline de index.html, sem teto de 7 s.
describe('script inline da porta', () => {
  const script = indexHtml.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? ''

  it('usa os prazos de src/lib/boot.ts e não tem mais o teto de 7 s', () => {
    expect(GATE_LATEST_START_MS).toBe(2055)
    expect(APP_FAILED_MS).toBe(3900)
    expect(script).toContain(`at(${GATE_LATEST_START_MS},`)
    expect(script).toContain(`at(${APP_FAILED_MS},`)
    expect(script).not.toContain('7000')
  })

  it('a capa vale com e sem movimento; aos 3900 ms sai se a porta não apareceu', () => {
    expect(script).toContain("root.classList.add('js', 'booting')")
    expect(script).toMatch(/else if \(!has\('gate'\)\)/)
  })
})
