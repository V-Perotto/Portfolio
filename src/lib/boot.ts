/**
 * Linha do tempo da tela de boot (feature 004, FR-030 a FR-032, research R4).
 *
 * A sessão SSH é uma função pura do tempo: `bootFrame(ms)` devolve as linhas visíveis naquele
 * instante. O `BootScreen` só mede o relógio e redesenha; se os timers atrasarem (CPU ocupada), o
 * quadro seguinte já mostra o que o relógio manda, sem acumular atraso. Texto, classes e ritmo são os
 * da sequência anterior (FR-031: o ritmo não muda).
 *
 * Os prazos também estão no script inline de `index.html`, que não importa módulos:
 * tests/unit/boot.spec.ts confere que os números batem.
 */

export interface BootPart {
  cls?: string
  text: string
}

export type BootLine = BootPart[]

/** Duração da sessão inteira, do primeiro caractere ao fim da pausa depois do último comando. */
export const BOOT_SEQUENCE_MS = 3895
/** Saída da tela (o fade do CSS tem 0,5 s). */
export const BOOT_FADE_MS = 550
/** Folga para timers atrasados entre o fim previsto e o teto (com a CPU ocupada, os timers chegaram
 *  a atrasar ~400 ms nos testes; 250 ms não bastavam). */
export const BOOT_SAFETY_MS = 500
/** Teto: página totalmente descoberta, contado do início da navegação (constituição v2.3.0). */
export const BOOT_DEADLINE_MS = 7000
/** Sem o JS principal até este instante, o script inline o dá como falho (`html.app-failed`): o
 *  movimento sai e a página fica no estado final (o mesmo prazo da 002). */
export const APP_FAILED_MS = 3900
/** Último instante (desde o início da navegação) em que o boot ainda cabe inteiro no teto. */
export const BOOT_LATEST_START_MS = BOOT_DEADLINE_MS - BOOT_SEQUENCE_MS - BOOT_FADE_MS - BOOT_SAFETY_MS

const prompt = (user: string, host: string): BootPart[] => [
  { cls: 'prompt-user', text: user },
  { cls: 'prompt-at', text: '@' },
  { cls: 'prompt-host', text: host },
  { cls: 'prompt-colon', text: ':' },
  { cls: 'prompt-path', text: '~' },
  { cls: 'prompt-dollar', text: '$ ' },
]

/** Trecho digitado: o primeiro caractere sai em `start`, e um novo a cada `speed` ms. */
function typed(text: string, start: number, speed: number, t: number, cls?: string): BootPart {
  const count = t < start ? 0 : Math.min(text.length, Math.floor((t - start) / speed) + 1)
  return cls ? { cls, text: text.slice(0, count) } : { text: text.slice(0, count) }
}

/** Instantes (ms desde o início do boot) em que cada linha aparece. */
const AT = {
  ssh: 0,
  connecting: 1006, // 18 × 42 ms de "ssh viper@portfolio" + 250
  password: 1506, // + 500
  authenticated: 2341, // + 7 × 55 ms da senha + 450
  lastLogin: 2641, // + 300
  run: 3041, // + 400; depois, 21 × 24 ms de "./iniciar_portfolio.sh" + 350 = 3895
} as const

export const BOOT_COMMAND = './iniciar_portfolio.sh'

/**
 * Linhas visíveis `elapsedMs` depois do início do boot. `now` é a data exibida em "Last login"
 * (parâmetro, para a função continuar pura).
 */
export function bootFrame(elapsedMs: number, now = ''): BootLine[] {
  const t = Math.max(0, elapsedMs)
  const lines: BootLine[] = [[...prompt('anon', '127.0.0.1'), typed('ssh viper@portfolio', AT.ssh, 42, t)]]
  if (t >= AT.connecting) lines.push([{ cls: 'boot-dim', text: 'Conectando a portfolio na porta 22...' }])
  if (t >= AT.password) lines.push([{ text: "viper@portfolio's password: " }, typed('••••••••', AT.password, 55, t)])
  if (t >= AT.authenticated) {
    lines.push([{ cls: 'boot-ok', text: 'Autenticado. ' }, { text: 'Bem-vindo ao PortfolioOS 1.0 LTS' }])
  }
  if (t >= AT.lastLogin) lines.push([{ cls: 'boot-dim', text: `Last login: ${now} from 127.0.0.1` }])
  if (t >= AT.run) lines.push([...prompt('viper', 'portfolio'), typed(BOOT_COMMAND, AT.run, 24, t, 'boot-ok')])
  return lines
}

/** Texto corrido de uma linha (testes e conferências). */
export const lineText = (line: BootLine): string => line.map((p) => p.text).join('')
