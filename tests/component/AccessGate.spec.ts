import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import AccessGate from '@/components/terminal/AccessGate.vue'
import { FADE_MS, OPEN_MS, REDUCED_HOLD_MS, SESSION_MS } from '@/lib/boot'

// Feature 005, US1 (data-model §1, contracts/access-gate.md): a porta de acesso e as transições dela.
const Page = defineComponent({ render: () => [h('nav', { id: 'page-nav' }, [h('a', { href: '#sobre' }, 'sobre')]), h(AccessGate)] })

let wrapper: VueWrapper | null = null
let savedAnimate: typeof HTMLElement.prototype.animate | undefined

const root = () => document.documentElement
const gate = () => document.querySelector<HTMLElement>('.access-gate')
const nav = () => document.getElementById('page-nav') as HTMLElement & { inert: boolean }

async function flush(ms = 0) {
  if (ms) vi.advanceTimersByTime(ms)
  await nextTick()
  await nextTick()
}

async function mountGate(classes = 'js booting motion') {
  root().className = classes
  wrapper = mount(Page, { attachTo: document.body, global: { stubs: { FaultyTerminal: true } } })
  await flush()
}

async function clickIcon() {
  document.querySelector<HTMLButtonElement>('.gate-icon')!.click()
  await flush()
}

describe('AccessGate', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
    // a consulta do IP nunca sai para a rede nos testes (contracts/ip-lookup.md)
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(JSON.stringify({ ip: '203.0.113.7' })))))
    // sem a Web Animations API: as trocas são diretas e o relógio da sessão segue o mesmo
    savedAnimate = HTMLElement.prototype.animate
    ;(HTMLElement.prototype as { animate?: unknown }).animate = undefined
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    document.body.innerHTML = ''
    root().className = ''
    HTMLElement.prototype.animate = savedAnimate!
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('monta só com o ícone, foco nele, html.gate e o resto da página inerte (FR-001 a FR-003)', async () => {
    await mountGate()
    expect(gate()?.dataset.gateState).toBe('idle')
    expect(root().classList.contains('gate')).toBe(true)
    expect(nav().inert).toBe(true)
    const icon = document.querySelector<HTMLButtonElement>('.gate-icon')!
    expect(icon.getAttribute('aria-label')).toBe('Abrir acessar_portfolio.sh')
    expect(icon.getAttribute('aria-describedby')).toBe('gate-hint')
    expect(document.activeElement).toBe(icon)
    expect(document.getElementById('gate-hint')?.textContent).toBe('# clique no ícone para conectar')
  })

  it('abrir: janela só com minimizar e fechar; no fim da sessão a página abre (FR-004, FR-006, FR-009)', async () => {
    await mountGate()
    await clickIcon()
    expect(gate()?.dataset.gateState).toBe('open')
    expect(document.querySelector('.gate-window button.t-min')?.getAttribute('aria-label')).toBe('Minimizar acessar_portfolio.sh')
    expect(document.querySelector('.gate-window button.t-close')?.getAttribute('aria-label')).toBe('Fechar acessar_portfolio.sh')
    expect(document.querySelector('.gate-window .t-max')).toBeNull()
    expect(document.querySelectorAll('.gate-session .boot-line')).toHaveLength(6)

    await flush(OPEN_MS + SESSION_MS + 16)
    expect(gate()?.dataset.gateState).toBe('done')
    expect(root().classList.contains('booting')).toBe(false)
    expect(root().classList.contains('gate')).toBe(false)
    expect(nav().inert).toBe(false)
    expect(document.querySelectorAll('.gate-session .boot-pending')).toHaveLength(0)

    await flush(FADE_MS)
    expect(gate()).toBeNull()
  })

  it('minimizada, a sessão continua e a página abre no fim (FR-007, clarify Q1)', async () => {
    await mountGate()
    await clickIcon()
    await flush(OPEN_MS + 300)
    document.querySelector<HTMLButtonElement>('.gate-window button.t-min')!.click()
    await flush()
    expect(gate()?.dataset.gateState).toBe('minimized')
    expect(document.activeElement).toBe(document.querySelector('.gate-icon'))

    await flush(SESSION_MS)
    expect(root().classList.contains('booting')).toBe(false)
    expect(gate()?.dataset.gateState).toBe('done')
  })

  it('minimizar e reabrir mostra o ponto atual, sem recomeçar', async () => {
    await mountGate()
    await clickIcon()
    await flush(OPEN_MS + 1100)
    const before = document.querySelectorAll('.gate-session .boot-line:not(.boot-pending)').length
    document.querySelector<HTMLButtonElement>('.gate-window button.t-min')!.click()
    await flush(400)
    await clickIcon()
    const after = document.querySelectorAll('.gate-session .boot-line:not(.boot-pending)').length
    expect(after).toBeGreaterThanOrEqual(before)
    expect(after).toBeGreaterThan(0)
  })

  it('fechar encerra a tentativa; o ícone abre uma nova, desde a linha 1 (FR-008, Q2)', async () => {
    await mountGate()
    await clickIcon()
    await flush(OPEN_MS + 1200)
    document.querySelector<HTMLButtonElement>('.gate-window button.t-close')!.click()
    await flush()
    expect(gate()?.dataset.gateState).toBe('idle')
    expect(document.querySelector('.access-gate [role="status"]')?.textContent).toBe('Conexão encerrada')

    await flush(SESSION_MS + 1000)
    expect(root().classList.contains('booting')).toBe(true)
    expect(gate()?.dataset.gateState).toBe('idle')

    await clickIcon()
    expect(document.querySelectorAll('.gate-session .boot-pending')).toHaveLength(6)
    await flush(OPEN_MS + SESSION_MS + 16)
    expect(root().classList.contains('booting')).toBe(false)
  })

  it('sem movimento: sessão inteira na hora, página 1 s depois, sem fade (FR-012)', async () => {
    await mountGate('js booting')
    expect(document.querySelector('faulty-terminal-stub')).toBeNull()
    await clickIcon()
    expect(document.querySelectorAll('.gate-session .boot-line')).toHaveLength(6)
    expect(document.querySelectorAll('.gate-session .boot-pending')).toHaveLength(0)
    await flush(REDUCED_HOLD_MS - 50)
    expect(root().classList.contains('booting')).toBe(true)
    await flush(66)
    expect(root().classList.contains('booting')).toBe(false)
    expect(gate()).toBeNull()
  })

  it('montada depois de 2055 ms: sem porta, e a capa sai (FR-011)', async () => {
    vi.advanceTimersByTime(2100)
    await mountGate()
    expect(gate()).toBeNull()
    expect(root().classList.contains('booting')).toBe(false)
  })

  it('consulta o IP uma vez e a sessão usa o IP e a versão (FR-014, FR-016)', async () => {
    await mountGate()
    expect(fetch).toHaveBeenCalledTimes(1)
    await clickIcon()
    await flush(OPEN_MS + SESSION_MS - 100)
    expect(document.querySelector('.gate-session .boot-line')?.textContent).toContain('anon@203.0.113.7')
    expect(document.querySelectorAll('.gate-session .boot-line')[4]?.textContent).toMatch(/from 203\.0\.113\.7$/)
    expect(document.querySelectorAll('.gate-session .boot-line')[3]?.textContent).toContain('Bem-vindo ao Portfolio v2.6')
  })

  it('sem resposta do serviço, a sessão usa 127.0.0.1', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))))
    await mountGate()
    await clickIcon()
    expect(document.querySelector('.gate-session .boot-line')?.textContent).toContain('anon@127.0.0.1')
  })

  it('sem html.booting (sem capa), não aparece', async () => {
    await mountGate('js motion')
    expect(gate()).toBeNull()
  })
})
