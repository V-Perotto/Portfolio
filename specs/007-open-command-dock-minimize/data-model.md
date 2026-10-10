# Data Model: feature 007

Tipos e estados que a feature introduz ou muda. Os dados do currículo (`src/data/resume.ts`,
`src/types/resume.ts`) só mudam na tagline (`profile.tagline`, FR-024); nenhum fato do currículo muda
(Princípio I).

## 1. Alvo do `open` (`src/lib/sections.ts`)

```ts
type OpenMode = 'open' | 'maximize'

interface OpenTarget {
  /** o que o visitante digita e o Tab completa: `experiencia`, `srg`, `temas-vs-code`, … */
  name: string
  /** id da janela no registro (R3): `experiencia` | `projetos/<name>` | `challenges` | `comunitario` */
  windowId: string
  /** caminho mostrado na saída, sem o `→ `: `~/carreira`, `~/projetos/srg`, … */
  path: string
  /** apelido aceito, mas fora do `OPTIONS` e do autocompletar: o caminho sem `~/` */
  alias: string
  /** projetos abrem; as janelas de editor maximizam (Q1) */
  mode: OpenMode
}

function openTargets(resume: Resume): OpenTarget[]
```

**Regras** (validadas em `tests/unit/sections.spec.ts`):

- Ordem da página: `experiencia`, os projetos na ordem dos dados (relevância, Princípio II),
  `challenges`, `comunitario`.
- `name` de projeto = `slugify(project.name)` (`src/lib/editor-files.ts`); `windowId` =
  `projetos/<name>`; `path` = `~/projetos/<name>`.
- Nomes únicos, todos casam com `^[a-z0-9]+(-[a-z0-9]+)*$`, nenhum projeto se chama `experiencia`,
  `challenges` ou `comunitario`.
- Coleção vazia → sem o alvo dela (como `visibleSections`).
- Hoje: 9 alvos.

## 2. Motor do terminal (`src/lib/terminal.ts`)

```ts
interface TerminalContext {
  /** as seções do menu, para o `find` e para a dica do `open` (FR-006) */
  sections: readonly NavSection[]
  /** os alvos do `open` */
  targets: readonly OpenTarget[]
}

type TerminalAction =
  | { type: 'none' }
  | { type: 'clear' }
  | { type: 'exit' }
  | { type: 'goto'; id: SectionId }
  | { type: 'open'; target: OpenTarget } // novo

const COMMANDS = ['help', 'find', 'open', 'clear', 'exit'] as const

function run(line: string, ctx: TerminalContext): TerminalResult
function complete(line: string, ctx: TerminalContext): Completion
function completeWith(line: string, candidate: string): string
function helpText(ctx: TerminalContext): string[]
```

`TerminalResult` e `Completion` não mudam. Saídas e regras: [terminal-open.md](contracts/terminal-open.md).

## 3. Registro de janelas (`src/lib/windows.ts`)

```ts
type WindowState = 'open' | 'minimized' | 'closed'

interface OpenOptions {
  /** fechada: reabre já completa, sem digitar de novo (editor pelo `open`, FR-005) */
  complete?: boolean
  /** sem a animação de crescer (o editor pelo `open` maximiza logo em seguida; R4) */
  instant?: boolean
  /** roda quando a janela volta ao layout, antes da animação de crescer (para rolar, R4) */
  onLayout?: () => void
}

interface WindowHandle {
  state(): WindowState
  /** a caixa da janela (`.desktop-window`): o que se rola até a barra de título */
  element(): HTMLElement | null
  /** reabre como o ícone; resolve quando a animação termina (já aberta: resolve na hora) */
  open(options?: OpenOptions): Promise<void>
  /** só nas janelas de editor (006 R5); resolve com a janela maximizada e o foco no `□` */
  maximize?(): Promise<void>
}

function registerWindow(id: string, handle: WindowHandle): () => void // devolve o "desregistrar"
function getWindow(id: string): WindowHandle | undefined
function openWindow(target: OpenTarget, options: { motion: boolean }): Promise<void> // R4
```

`WindowControls` (`src/components/terminal/window-controls.ts`) ganha
`exposeMaximize?(fn: () => Promise<void>): void`: o `EditorFrame` entrega o seu maximizar ao
`DesktopWindow`, que o põe no `WindowHandle`.

`DesktopWindow` ganha a prop `windowId?: string`. Ids em uso:

| Janela | `windowId` |
|--------|------------|
| cada projeto (`ProjectCard`) | `projetos/<slugify(project.name)>` |
| Experiência (`EditorWindow`) | `experiencia` |
| Challenges | `challenges` |
| Comunitário | `comunitario` |
| Sobre, Contato | — (não são alvo do `open`) |

## 4. Terminal da dock (`src/components/dock/AppDock.vue`)

```ts
type DockTerminalState = 'closed' | 'open' | 'minimized'
```

| De | Evento | Para | Animação | Foco | Sessão |
|----|--------|------|----------|------|--------|
| `closed` | clique na dock, Ctrl+Alt+T | `open` | sobe da dock (`<Transition>`, como hoje) | prompt | nova (vazia) |
| `open` | `−`, clique na dock, Ctrl+Alt+T | `minimized` | encolhe até o botão (FLIP 320 ms) | botão da dock | guardada |
| `open` | `open <opção>` válido | `minimized` | encolhe até o botão (FLIP 320 ms) | a janela aberta (R4) | guardada |
| `minimized` | clique na dock, Ctrl+Alt+T | `open` | cresce a partir do botão (FLIP 320 ms) | prompt (seleção do input restaurada) | a mesma |
| `open` | ✕, `exit`, Esc | `closed` | desce e some (`<Transition>`, como hoje) | botão da dock | apagada |
| qualquer | recarregar a página | `closed` | — | — | apagada |

- Com uma janela maximizada (`html.window-maximized`), Ctrl+Alt+T não faz nada (006), em qualquer
  estado; a dock fica inerte com a página.
- Com "reduzir movimento", todas as transições são imediatas.
- **Sessão** = o que está no `DockTerminal` montado: `lines`, `history`, `historyIndex`, `draft`,
  `value`, a seleção do `<input>` e o `scrollTop` da saída. Minimizado, o componente continua montado,
  com `opacity: 0`, `pointer-events: none` e `inert` (R5).

**Botão da dock por estado**:

| Estado | `aria-label` | `aria-expanded` | Indicador (`::after`) | Dica `Ctrl + Alt + T` |
|--------|--------------|-----------------|------------------------|-----------------------|
| `closed` | `Abrir terminal (Ctrl+Alt+T)` | `false` | nenhum | sim |
| `open` | `Minimizar terminal (Ctrl+Alt+T)` | `true` | ponto cheio `--green-bright` | não |
| `minimized` | `Restaurar terminal (Ctrl+Alt+T)` | `false` | ponto vazado (contorno 1 px `--green-bright`) | sim |

## 5. Tokens (`src/styles/tokens.css`)

| Token | Antes (006) | Depois (007) |
|-------|-------------|--------------|
| `--glitch-vignette-center` | `radial-gradient(circle, rgb(0 0 0 / 0.96) 0%, rgb(0 0 0 / 0.9) 40%, transparent 80%)` | `radial-gradient(circle, rgb(0 0 0 / 0.8) 0%, transparent 60%)` (o do componente, FR-018) |
| `--glitch-alpha` | `0.55` | `0.55` (não muda, FR-021) |
| `--hero-halo` | — | contorno sólido de 2 px em preto + `0 0 4px #000, 0 0 8px rgb(0 0 0 / 0.8)` (R7; calibrar), na tagline e no texto do loader, só com o fundo animado. Na impressão: `none` |

O fundo opaco do `ping vittorio` com o glitch é `color-mix(in srgb, var(--green) 12%, var(--bg))`, a
mesma conta de hoje com `--bg` no lugar de `transparent`.

## 6. Conteúdo

| Campo | Antes | Depois |
|-------|-------|--------|
| `profile.tagline` | `Transformando processos em sistemas escaláveis — de APIs a agentes de IA.` | `Transformando processos em sistemas escaláveis` |
| `package.json` `version` | `2.5.0` | `2.6.0` |
