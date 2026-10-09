# Data Model: feature 006

Tipos e estados que a feature introduz ou muda. Os dados do currículo (`src/data/resume.ts`,
`src/types/resume.ts`) **não mudam** (Princípio I).

## 1. Arquivo do editor (`src/lib/editor-files.ts`)

```ts
type SyntaxKind = 'key' | 'str' | 'date' | 'punct' | 'comment' | 'link'

interface Token {
  kind: SyntaxKind
  text: string
  /** só em `link`: abre em nova aba (ExternalLink) */
  href?: string
}

interface EditorLine {
  /** recuo em níveis (0 = chave de topo; 1 = item de lista ou texto de bloco) */
  indent: 0 | 1
  tokens: Token[]
}

interface EditorFile {
  /** id do item no currículo (estável; chave do v-for e do Branched Menu) */
  id: string
  /** `AAAA-MM_<slug>.yml` (R3) */
  name: string
  /** `~/carreira/2026-03_confidencial.yml` */
  path: string
  /** 1-based, na ordem da seção */
  position: number
  total: number
  lines: EditorLine[]
}

interface EditorFolder {
  /** `carreira` | `challenges` | `comunitario` */
  label: string
  /** `~/carreira` | `~/projetos/challenges` | `~/projetos/comunitario` (título da janela e do comando) */
  path: string
  files: EditorFile[]
}
```

Funções (puras):

| Função | Entrada | Saída |
|--------|---------|-------|
| `experienceFolder(experiences)` | `Experience[]` (ordenadas por `byStartDesc`) | `EditorFolder` `carreira` |
| `challengeFolder(challenges)` | `Challenge[]` (ordenados por `byCreatedDesc`) | `EditorFolder` `challenges` |
| `communityFolder(community)` | `CommunityProject[]` | `EditorFolder` `comunitario` |
| `slugify(text)` | texto | minúsculas, sem acentos, não alfanuméricos → `-`, sem `-` nas pontas |

Regras de validação (testes de unidade):

- todo campo exibido no cartão do item aparece no arquivo, com o mesmo texto (períodos e datas pelo
  `formatPeriod`/`formatYearMonth`); nenhum outro fato aparece (o comentário da 1ª linha só repete o
  nome/cargo e a posição);
- nomes únicos na pasta; `position` de 1 a `total`, na ordem da seção;
- `link` tem `href` http(s) e `text` = o endereço sem o protocolo (como nos cartões).

Chaves por tipo (ordem de exibição):

| Tipo | Chaves |
|------|--------|
| Experiência | `cargo`, `empresa`, `local`, `periodo`, `atual` (só sem `end`: `true  # HEAD`), `resumo` (bloco `>`), `resultados` (só se houver: `- <valor>: <rótulo>`), `stack` (`[a, b, c]`) |
| Challenge | `nome`, `criado`, `resumo` (bloco `>`), `stack`, `repositorio` (link) |
| Comunitário | `nome`, `instituicao`, `local`, `data`, `resumo` (bloco `>`), `papel`, `fonte` (link, rótulo `pucpr.br`) |

## 2. Janela de editor (`EditorWindow.vue`)

Props: `folder: EditorFolder`; slot `cards` (os cartões atuais). O ícone minimizado é sempre o de pasta de código (`project`).

Estado:

| Campo | Tipo | Inicial | Notas |
|-------|------|---------|-------|
| `activeId` | `string` | `folder.files[0].id` | arquivo aberto; o mesmo no SSR e na hidratação |
| `maximized` | `boolean` | `false` | toda visita começa restaurada (004 FR-010) |
| `placeholderHeight` | `number \| null` | `null` | altura do lugar enquanto maximizada (R5) |

Visão (`data-editor-view`): `file` (normal) | `cards` (maximizada). Sem JS e na impressão, o CSS mostra
os cartões (R2).

Transições:

```text
                 maximize (□, Enter/Espaço no □)
   normal ───────────────────────────────────────► maximizada
     ▲  ◄──────────────────────────────────────── │
     │     restore (□, Esc, clique no fundo)       │
     │                                              │ minimize/close
     │                                              ▼
     │                                  restore (sem animação) → DesktopWindow.hide()
     │
   DesktopWindow: open ⇄ minimized/closed (004), inalterado
```

Efeitos de `maximized = true`: `html.window-maximized`, `#app.inert = true`, Teleport ativo, backdrop
visível, laço de foco, ouvinte de Esc. Todos desfeitos ao restaurar e no `onBeforeUnmount`.

## 3. Controles das janelas (`window-controls.ts`, `TerminalBar.vue`)

```ts
type MaximizeMode = 'none' | 'disabled' | 'on'

interface WindowControls {
  mounted: Readonly<Ref<boolean>>
  minimize(): void
  close(): void
  register(typing: TerminalTyping): void
  /** só nas janelas de editor */
  maximize?: { active: Readonly<Ref<boolean>>; toggle(): void }
}
```

`TerminalBar` props: `maximize: MaximizeMode` (padrão `disabled`; substitui `maximizable: boolean`),
`maximized: boolean`. Emite `maximize`. `TerminalWindow` decide: com `controls.maximize`, `on`; a porta
de acesso passa `none`; o resto, `disabled`. Decorativo (SSR/sem JS): `on` vira `disabled`.

## 4. Digitação (`useTerminalTyping`)

`TerminalTyping` ganha `prepare()`:

| Método | Efeito |
|--------|--------|
| `prepare()` | aplica `data-t-anim` e `pending` em comandos e saídas, sem ouvintes nem timers; marca `prepared` |
| `replay()` | se `prepared`, liga `pointerdown`/`focusin` e digita; senão, `prepare()` + o mesmo |
| `complete()` | inalterado (termina na hora, limpa `prepared`) |

Sem movimento, `prepare()` e `replay()` não fazem nada.

## 5. Loader do hero (`src/lib/hero-loader.ts`, `HeroLoader.vue`)

```ts
type LoaderPhase = 'working' | 'done' | 'hidden'

interface LoaderSchedule {
  doneAt: number   // ms (relógio de performance.now)
  hideAt: number
}

const MIN_WORK_MS = 3000
const MAX_WORK_MS = 10000
const SHOW_DONE_MS = 3000

function loaderSchedule(revealedAt: number, readyAt: number | null): LoaderSchedule
// doneAt = revealedAt + clamp(max(MIN_WORK_MS, (readyAt ?? ∞) − revealedAt), MIN_WORK_MS, MAX_WORK_MS)
// hideAt = doneAt + SHOW_DONE_MS
```

| Modo | Fases |
|------|-------|
| SSR / sem JS | `done` (estático, nunca `hidden`) |
| Com movimento | montado: `working` → descoberto (`revealedAt`) → `doneAt`: `done` → `hideAt`: `hidden` (fade 0,5 s) |
| "Reduzir movimento" | `done` desde a montagem → `revealedAt + 3000`: `hidden` (sem fade) |
| Movimento desligado no meio | vai para `done` na hora; `hideAt` = 3 s depois |

`readyAt` = instante em que `document.fonts.ready` resolveu **e** o fundo do hero avisou o primeiro
quadro (ou falhou, ou não existe no modo atual).

`LatticeLoader` props usadas: `status: 'working' | 'done'`, `label`, `doneLabel`, `grid: 3`, `gap: 1`,
`idleOpacity: 0.15`, `showTimer: false`, `glow: true`, `shape: 'square'`, `color`, `doneColor`
(`var(--purple-glow)`, `var(--green-bright)`), `paused: boolean` (novo: pausa as animações).

## 6. Letter Glitch (`lib/scenes/letter-glitch.ts`)

```ts
interface GlitchOptions {
  colors: [number, number, number][]  // RGB 0–255, dos tokens --glitch-dark/green/purple
  alpha: number                        // --glitch-alpha (calibrar; ponto de partida 0.6)
  glitchSpeed: number                  // 10
  smooth: boolean                      // true
  fontSize: number                     // 16 (padrão)
  charWidth: number                    // 10
  charHeight: number                   // 20
  maxFps: number                       // 60 no worker, 30 na página
  dpr: number                          // min(devicePixelRatio, 2)
}

interface Letter { char: string; from: RGB; to: RGB; color: RGB; progress: number }
```

A cena implementa `Scene` (004) e manda `{ type: 'frame' }` depois do primeiro quadro desenhado
(protocolo `serve.ts` ganha a mensagem `frame`; `SceneHost` ganha `onFirstFrame`). `hostScene` ganha a
opção `context: '2d' | 'webgl'` (padrão `webgl`, o Faulty) para decidir entre worker e página.

## 7. Faulty Terminal

`curvatureFor(base: number, width: number, height: number): number` =
`base * Math.min(1, (768 / 1366) * width / height)`; a cena aplica no `resize` (R15).

## 8. Tokens novos e removidos (`src/styles/tokens.css`)

| Token | Valor (ponto de partida) | Uso |
|-------|--------------------------|-----|
| `--tree-line` | `var(--purple)` | linhas do Branched Menu |
| `--editor-bg` | `var(--bg-alt)` | fundo do painel de código |
| `--editor-gutter` | `var(--text-dim)` | números de linha |
| `--syntax-key` | `var(--purple-glow)` | chaves YAML |
| `--syntax-str` | `var(--text)` | textos |
| `--syntax-date` | `var(--green-bright)` | datas e períodos |
| `--syntax-punct` | `var(--text-dim)` | `:`, `-`, `[ ]`, `>` |
| `--syntax-comment` | `var(--text-dim)` | `# …` |
| `--editor-tree-width` | `300px` | largura máxima da árvore (R4; 260 cortava o nome mais longo, medido na implementação) |
| `--maximize-scrim` | `color-mix(in srgb, var(--bg) 55%, transparent)` | fundo da janela maximizada |
| `--maximize-blur` | `6px` | desfoque da página |
| `--glitch-dark` / `--glitch-green` / `--glitch-purple` | `var(--green)` / `var(--green-bright)` / `var(--purple-glow)` | cores das letras |
| `--glitch-alpha` | `0.55` (calibrado, R12) | intensidade das letras |
| `--glitch-vignette-center` | `radial-gradient(circle, rgb(0 0 0 / .96) 0%, rgb(0 0 0 / .9) 40%, transparent 80%)` (calibrado, R12) | vinheta central |
| `--glitch-vignette-outer` | `radial-gradient(circle, transparent 60%, #000 100%)` | vinheta das bordas (padrão) |
| `--gate-vignette` | `radial-gradient(closest-side, rgb(0 0 0 / .94) 0%, rgb(0 0 0 / .9) 72%, transparent 100%)` (calibrado, R14; caixa centrada no texto) | sob o nome do ícone e a dica da porta |
| `--loader-working` / `--loader-done` | `var(--purple-glow)` / `var(--green-bright)` | Lattice Loader |

Removidos: `--dots-from`, `--dots-to`, `--dots-glow`, `--dots-*-alpha`, `--hero-scrim` e, se nada mais
usar, `--boot-panel`. Na impressão, os tokens novos de fundo ficam transparentes.

## 9. Dica da dock (`AppDock.vue`)

| Campo | Tipo | Notas |
|-------|------|-------|
| `tip` | `boolean` | visível; `false` com o terminal aberto |
| timer | `setTimeout` de 150 ms | só para `pointerenter` de mouse/caneta |
