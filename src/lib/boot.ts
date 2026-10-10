/**
 * Sessão SSH da porta de acesso (feature 005, FR-013 a FR-020, research R3, data-model §2).
 *
 * A sessão começa no clique no ícone `acessar_portfolio.sh` (no fim da animação de abrir a janela) e é
 * uma função pura do tempo: `sessionAt(ms)` diz quantas linhas estão visíveis, e cada trecho digitado é
 * um TextType que começa no instante da sua linha, no mesmo relógio. Timers atrasados (CPU ocupada) não
 * acumulam atraso: o quadro seguinte mostra o que o relógio manda. Velocidades e pausas são as da 004
 * × 0,7.
 *
 * `GATE_LATEST_START_MS` e `APP_FAILED_MS` também estão no script inline de `index.html`, que não
 * importa módulos: tests/unit/boot.spec.ts confere que os números batem.
 */

export interface BootPart {
  cls?: string
  text: string
}

/** Sem o JS principal até este instante, o script inline o dá como falho (`html.app-failed`): o
 *  movimento sai e a página fica no estado final (o mesmo prazo da 002). Com ele, mas sem a porta na
 *  tela, a capa sai (research R2). */
export const APP_FAILED_MS = 3900

export const BOOT_COMMAND = './iniciar_portfolio.sh'

const prompt = (user: string, host: string): BootPart[] => [
  { cls: 'prompt-user', text: user },
  { cls: 'prompt-at', text: '@' },
  { cls: 'prompt-host', text: host },
  { cls: 'prompt-colon', text: ':' },
  { cls: 'prompt-path', text: '~' },
  { cls: 'prompt-dollar', text: '$ ' },
]

/** Trecho digitado de uma linha: o TextType mostra um caractere a cada `speed` ms. */
export interface TypedPart {
  text: string
  speed: number
  cls?: string
}

export interface SessionLine {
  /** ms desde o início da sessão em que a linha aparece (e o trecho digitado começa). */
  at: number
  /** Prefixo fixo (prompt, rótulo), com a classe de cor de cada trecho. */
  parts: BootPart[]
  typed?: TypedPart
}

/** Do primeiro caractere ao fim da pausa depois de `./iniciar_portfolio.sh` (FR-020: ≤ 2900 ms). */
export const SESSION_MS = 2720
/** Último instante (desde o início da navegação) em que a porta ainda pode aparecer: depois disso, a
 *  capa já saiu e a página está à vista (FR-011, research R2; o mesmo limite da 004). */
export const GATE_LATEST_START_MS = 2055
/** Crescer e encolher a janela da porta (as janelas da 004). */
export const OPEN_MS = 320
/** Saída da porta (o fade do CSS tem 0,5 s; FR-009: ≤ 0,6 s). */
export const FADE_MS = 550
/** Com movimento reduzido, a sessão aparece de uma vez e a página abre depois disto (FR-012). */
export const REDUCED_HOLD_MS = 1000
/** IP da sessão quando o do visitante não chegou a tempo (FR-015). */
export const FALLBACK_IP = '127.0.0.1'

/** Instantes das linhas e velocidades: os da 004 × 0,7 (research R3). */
const SESSION_AT = { ssh: 0, connecting: 697, password: 1047, authenticated: 1628, lastLogin: 1838, run: 2118 } as const
const SPEED = { ssh: 29, password: 38, run: 17 } as const

/** As seis linhas da sessão (FR-013), com o IP, a versão (`v2.7`) e a data de "Last login". */
export function sessionLines(ip: string, version: string, lastLogin: string): SessionLine[] {
  return [
    { at: SESSION_AT.ssh, parts: prompt('anon', ip), typed: { text: 'ssh viper@portfolio', speed: SPEED.ssh } },
    { at: SESSION_AT.connecting, parts: [{ cls: 'boot-dim', text: 'Conectando ao portfolio...' }] },
    { at: SESSION_AT.password, parts: [{ text: 'viper@portfolio password: ' }], typed: { text: '••••••••', speed: SPEED.password } },
    {
      at: SESSION_AT.authenticated,
      parts: [{ cls: 'boot-ok', text: 'Autenticado. ' }, { text: `Bem-vindo ao Portfolio ${version}` }],
    },
    { at: SESSION_AT.lastLogin, parts: [{ cls: 'boot-dim', text: `Last login: ${lastLogin} from ${ip}` }] },
    { at: SESSION_AT.run, parts: prompt('viper', 'portfolio'), typed: { text: BOOT_COMMAND, speed: SPEED.run, cls: 'boot-ok' } },
  ]
}

/** Instante do último caractere da linha (o próprio `at`, se ela não tem trecho digitado). */
export const typedEnd = (line: SessionLine): number =>
  line.typed ? line.at + (line.typed.text.length - 1) * line.typed.speed : line.at

/** Quantas linhas estão visíveis `elapsed` ms depois do início da sessão. */
export const sessionAt = (elapsed: number, lines: readonly SessionLine[]): number =>
  lines.filter((line) => elapsed >= line.at).length

/** `'2.4.0'` → `'v2.4'`: a versão do package.json como a sessão a exibe (FR-016). */
export function displayVersion(semver: string): string {
  const [major = '0', minor = '0'] = semver.split('.')
  return `v${major}.${minor}`
}

/** Texto corrido de uma linha da sessão, com o trecho digitado inteiro (testes e conferências). */
export const sessionLineText = (line: SessionLine): string =>
  line.parts.map((p) => p.text).join('') + (line.typed?.text ?? '')
