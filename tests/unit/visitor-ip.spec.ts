import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { IP_SERVICE_URL, isIPv4, lookupVisitorIp } from '@/lib/visitor-ip'

// Feature 005, US2 (FR-014, FR-015, contracts/ip-lookup.md): a consulta do IP nunca falha alto.
const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }))

describe('lookupVisitorIp', () => {
  const consoleSpies = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn'), vi.spyOn(console, 'log')]

  beforeEach(() => consoleSpies.forEach((s) => s.mockClear()))
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
    for (const spy of consoleSpies) expect(spy).not.toHaveBeenCalled()
  })

  it('devolve o IPv4 e pede sem cookies, sem referer e sem cache', async () => {
    const fetchMock = vi.fn(() => json({ ip: '203.0.113.7' }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(lookupVisitorIp()).resolves.toBe('203.0.113.7')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(IP_SERVICE_URL)
    expect(init).toMatchObject({ credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store' })
    expect(init.signal).toBeInstanceOf(AbortSignal)
  })

  it.each([
    ['IPv6', { ip: '2001:db8::1' }],
    ['octeto acima de 255', { ip: '256.1.1.1' }],
    ['zero à esquerda', { ip: '01.2.3.4' }],
    ['texto', { ip: '<b>oi</b>' }],
    ['sem ip', { origin: '1.2.3.4' }],
    ['JSON inválido', '{nope'],
  ])('resposta inválida (%s) → null', async (_, body) => {
    vi.stubGlobal('fetch', () => json(body))
    await expect(lookupVisitorIp()).resolves.toBeNull()
  })

  it('status 500 → null', async () => {
    vi.stubGlobal('fetch', () => json({ ip: '203.0.113.7' }, 500))
    await expect(lookupVisitorIp()).resolves.toBeNull()
  })

  it('erro de rede (bloqueador) → null', async () => {
    vi.stubGlobal('fetch', () => Promise.reject(new TypeError('Failed to fetch')))
    await expect(lookupVisitorIp()).resolves.toBeNull()
  })

  it('tempo esgotado (5 s) → null', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      (_url: string, init: RequestInit) =>
        new Promise((_, reject) => init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))),
    )
    const result = lookupVisitorIp()
    vi.advanceTimersByTime(5000)
    await expect(result).resolves.toBeNull()
  })
})

describe('isIPv4', () => {
  it.each(['0.0.0.0', '127.0.0.1', '203.0.113.7', '255.255.255.255'])('aceita %s', (ip) => expect(isIPv4(ip)).toBe(true))
  it.each(['1.2.3', '1.2.3.4.5', '1.2.3.256', ' 1.2.3.4', '::1', 7])('recusa %s', (ip) => expect(isIPv4(ip)).toBe(false))
})
