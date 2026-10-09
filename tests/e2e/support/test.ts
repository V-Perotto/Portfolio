import { test as base, type BrowserContext, type Page } from '@playwright/test'

/**
 * `test` e `expect` dos e2e (feature 005, research R14): o mesmo do Playwright, com a consulta do IP do
 * visitante (ipify, contracts/ip-lookup.md) respondida dentro da página em todo contexto. Nenhum teste
 * chega ao serviço real, e o IP exibido é previsível (faixa de documentação TEST-NET-3).
 *
 * A resposta vem de um script de página que embrulha o `fetch`, e não de `route()`: com uma rota, o
 * Chromium intercepta todos os pedidos e desliga o cache, o que pesa nas medidas de tempo do boot.
 */
export * from '@playwright/test'

export const TEST_IP = '203.0.113.7'
export const IP_SERVICE = 'https://api.ipify.org/**'

export interface IpServiceOptions {
  /** IP devolvido; `null` = o pedido falha (como um bloqueador faria). */
  ip?: string | null
  /** Corpo da resposta no lugar de `{ ip }` (respostas inválidas). */
  body?: unknown
  /** Atraso da resposta, em ms. */
  delayMs?: number
  /** Deixa o pedido ir à rede (para testar com `page.route`). */
  passthrough?: boolean
}

/** Script de página (serializado pelo Playwright): conta os pedidos em `window.__ipRequests`. */
function stubIpService(options: Required<IpServiceOptions>): void {
  const w = window as unknown as { __ipRequests: number; __nativeFetch?: typeof fetch }
  // o fetch de verdade, mesmo com outro stub instalado antes (o do contexto)
  const native = (w.__nativeFetch ??= window.fetch.bind(window))
  const previous = window.fetch.bind(window)
  w.__ipRequests = 0
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    if (!url.startsWith('https://api.ipify.org')) return previous(input, init)
    w.__ipRequests++
    if (options.passthrough) return native(input, init)
    return new Promise<Response>((resolve, reject) => {
      const timer = setTimeout(() => {
        if (options.ip === null && options.body === null) reject(new TypeError('Failed to fetch'))
        else resolve(new Response(JSON.stringify(options.body ?? { ip: options.ip }), { headers: { 'content-type': 'application/json' } }))
      }, options.delayMs)
      init?.signal?.addEventListener('abort', () => {
        clearTimeout(timer)
        reject(new DOMException('The operation was aborted.', 'AbortError'))
      })
    })
  }
}

const withDefaults = (options: IpServiceOptions): Required<IpServiceOptions> => ({
  ip: TEST_IP,
  body: null,
  delayMs: 0,
  passthrough: false,
  ...options,
})

/** Responde o ipify em todas as páginas do contexto (contextos criados à mão: `browser.newContext()`). */
export async function mockIpService(context: BrowserContext, options: IpServiceOptions = {}): Promise<void> {
  await context.addInitScript(stubIpService, withDefaults(options))
}

/** Troca a resposta do ipify só nesta página (chamar antes do `goto`). */
export async function useIpService(page: Page, options: IpServiceOptions): Promise<void> {
  await page.addInitScript(stubIpService, withDefaults(options))
}

export const test = base.extend({
  context: async ({ context }, use) => {
    await mockIpService(context)
    await use(context)
  },
})
