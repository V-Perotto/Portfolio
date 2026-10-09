import { expect, test, TEST_IP, useIpService } from './support/test'
import { gotoGate, openGate, uncoveredAt, visibleLineTexts } from './support/gate'

// Feature 005, US2: a sessão SSH com o IP do visitante e a versão do portfólio (quickstart V9 e V10;
// FR-013 a FR-016; contracts/access-gate.md §3, contracts/ip-lookup.md).
test.use({ reducedMotion: 'no-preference' })

const LAST_LOGIN = /^Last login: \d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2} from /

/** As seis linhas no fim da sessão (a saída já começou). */
async function finalLines(page: import('@playwright/test').Page) {
  await openGate(page)
  await page.waitForFunction(() => !document.documentElement.classList.contains('booting'), null, { polling: 10, timeout: 6000 })
  return visibleLineTexts(page)
}

const expected = (ip: string) => [
  `anon@${ip}:~$ ssh viper@portfolio`,
  'Conectando ao portfolio...',
  'viper@portfolio password: ••••••••',
  'Autenticado. Bem-vindo ao Portfolio v2.5',
  LAST_LOGIN,
  'viper@portfolio:~$ ./iniciar_portfolio.sh',
]

function expectSession(lines: string[], ip: string) {
  expect(lines).toHaveLength(6)
  expected(ip).forEach((line, i) => {
    if (line instanceof RegExp) expect(lines[i]).toMatch(line)
    else expect(lines[i]).toBe(line)
  })
  expect(lines[4]!.endsWith(`from ${ip}`)).toBe(true)
}

test('com o serviço respondendo: o IP do visitante nas linhas 1 e 5 e a versão v2.5 (V9, V10, FR-013, FR-014, FR-016)', async ({ page }) => {
  await gotoGate(page)
  expectSession(await finalLines(page), TEST_IP)
})

test('serviço fora do ar ou bloqueado: 127.0.0.1, sem erro do site no console (V9, FR-015)', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    // a falha de rede que o próprio navegador registra não é erro do site (plan.md, Complexity Tracking)
    if (/Failed to load resource|ERR_FAILED|ERR_BLOCKED_BY_CLIENT/.test(m.text())) return
    errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(String(e)))
  await useIpService(page, { passthrough: true })
  await page.route('https://api.ipify.org/**', (route) => route.abort())
  await gotoGate(page)
  expectSession(await finalLines(page), '127.0.0.1')
  expect(errors).toEqual([])
})

test('resposta inválida (IPv6) → 127.0.0.1 (FR-015)', async ({ page }) => {
  await useIpService(page, { body: { ip: '2001:db8::1' } })
  await gotoGate(page)
  expectSession(await finalLines(page), '127.0.0.1')
})

test('serviço lento (6 s): 127.0.0.1, sem atrasar a sessão (FR-015)', async ({ page }) => {
  await useIpService(page, { delayMs: 6000 })
  await gotoGate(page)
  const t0 = await openGate(page)
  const at = await uncoveredAt(page)
  expect(at - t0).toBeLessThanOrEqual(4000)
  expect((await visibleLineTexts(page))[0]).toBe('anon@127.0.0.1:~$ ssh viper@portfolio')
})

test('IP que chega depois da 1ª abertura vale para a tentativa seguinte; um pedido por carga (FR-014)', async ({ page }) => {
  await useIpService(page, { delayMs: 3000 })
  await gotoGate(page)
  await openGate(page)
  await page.waitForTimeout(500)
  expect((await visibleLineTexts(page))[0]).toMatch(/^anon@127\.0\.0\.1:~\$ /)
  await page.locator('.gate-window button.t-close').click()
  await page.waitForTimeout(3200)
  await page.locator('.gate-icon').click()
  await page.waitForTimeout(320 + 700)
  expect((await visibleLineTexts(page))[0]).toBe(`anon@${TEST_IP}:~$ ssh viper@portfolio`)
  expect(await page.evaluate(() => (window as unknown as { __ipRequests: number }).__ipRequests)).toBe(1)
})

test('o IP não fica guardado em storage nem em cookies (FR-015)', async ({ page }) => {
  await gotoGate(page)
  await finalLines(page)
  await uncoveredAt(page)
  const stored = await page.evaluate(() => ({
    local: JSON.stringify({ ...localStorage }),
    session: JSON.stringify({ ...sessionStorage }),
    cookie: document.cookie,
  }))
  for (const value of Object.values(stored)) expect(value).not.toContain(TEST_IP)
})
