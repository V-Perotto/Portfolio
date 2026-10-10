# Research: comando `open`, terminal da dock minimizável, vinheta original do Letter Glitch e ajustes de texto (feature 007)

Decisões técnicas da fase 0. Cada uma resolve um ponto do plano. Os números de contraste foram
**medidos** em 2026-10-09 no build de produção da 006 (`dist/` do commit `37900be`), servido localmente,
com o Chromium do Playwright (`--disable-webgl`, o mesmo do projeto `chromium` dos testes), 1366 × 800
e 390 × 844, 8 a 10 quadros por medida. Os marcados com "calibrar" fecham na implementação, pelo e2e.

---

## R1. Opções do `open`: de onde vêm, nomes e alvos

**Decision**: uma função pura `openTargets(resume)` em `src/lib/sections.ts` (ao lado de
`visibleSections`) devolve a lista de alvos, **na ordem da página**:

| Opção | Alvo (id da janela) | Caminho na saída | Modo |
|-------|---------------------|------------------|------|
| `experiencia` | `experiencia` | `~/carreira` | maximizada |
| `srg`, `temas-vs-code`, `italiami`, `ocr-de-prontuarios`, `qclass-bot`, `monitor-de-curso` | `projetos/<opção>` | `~/projetos/<opção>` | aberta |
| `challenges` | `challenges` | `~/projetos/challenges` | maximizada |
| `comunitario` | `comunitario` | `~/projetos/comunitario` | maximizada |

- O nome do projeto é `slugify(project.name)` (Q3 do clarify), a função que a 006 já usa nos nomes dos
  arquivos YAML (`src/lib/editor-files.ts`): minúsculas, sem acentos, só letras e algarismos ligados por
  hífen. `'OCR de Prontuários'` → `ocr-de-prontuarios`; `'Temas VS Code'` → `temas-vs-code`.
- Cada alvo só existe se a coleção dele tiver conteúdo (`experiences`, `projects`, `challenges`,
  `community`), como no `visibleSections`.
- **Apelidos** (aceitos, mas fora da lista `OPTIONS` e do autocompletar): o caminho sem `~/`
  (`carreira`, `projetos/italiami`, `projetos/challenges`, `projetos/comunitario`). Quem copia o caminho
  da saída (`→ ~/projetos/italiami`) e roda `open ~/projetos/italiami` chega ao mesmo lugar; a
  normalização do `find` já tira o `~/`.
- O teste dos dados (`tests/unit/sections.spec.ts`) garante nomes únicos e sem colisão com
  `experiencia`, `challenges` e `comunitario` (FR-003).

**Rationale**: o terminal continua sem lista escrita à mão (um projeto novo vira opção sozinho, FR-002);
a ordem da página é a que o visitante vê ao rolar; os ids `projetos/<opção>` deixam claro, no registro
de janelas (R3), quem é projeto e quem é editor.

**Alternatives considered**: usar o `id` dos dados (`vscode-themes`, `monitoria`), recusado pelo autor
(Q3); listar os projetos antes da experiência (ordem diferente da página).

---

## R2. Motor do terminal: `open`, `help` e autocompletar

**Decision**: estender `src/lib/terminal.ts` (funções puras), sem mudar o que já existe para o `find`:

- `run(line, ctx)` e `complete(line, ctx)` recebem um contexto `{ sections, targets }` no lugar da lista
  de seções (o `DockTerminal` monta o contexto uma vez). `TerminalAction` ganha
  `{ type: 'open'; target: OpenTarget }`.
- `COMMANDS = ['help', 'find', 'open', 'clear', 'exit']`. O comando completado ganha espaço no fim se
  recebe opção (`find `, `open `).
- O autocompletar das opções vale para `find` e `open` com a mesma regra (um candidato completa; vários
  completam o prefixo comum e são listados; toque aplica). Para o `open`, os candidatos são os nomes de
  `targets` (sem os apelidos).
- Resolução da opção: `normalizeOption(arg)` (a do `find`) comparada com o nome e com o apelido de cada
  alvo; se não achar e a opção for uma seção da página (`sobre`, `skills`, `projetos`, `educacao`,
  `contato`), a mensagem sugere o `find`; senão, "não encontrado".
- Textos exatos no contrato [terminal-open.md](contracts/terminal-open.md).

**Rationale**: o motor é testado em unidade (Vitest) sem DOM, como na 004; o contexto evita um terceiro
parâmetro solto e deixa espaço para outro comando com opções.

**Alternatives considered**: um motor separado para o `open` (duplicaria a normalização e o
autocompletar); passar as opções como `NavSection[]` com um campo a mais (misturaria seção e janela).

---

## R3. Registro de janelas: como o terminal abre uma janela

**Decision**: um registro em módulo, `src/lib/windows.ts`, com um `Map<string, WindowHandle>`:

- `DesktopWindow` ganha a prop opcional `windowId`. Com ela, registra no `onMounted` (só no cliente) um
  `WindowHandle` e o retira no `onBeforeUnmount`. Os projetos passam `projetos/<slug>`; o
  `EditorWindow` passa o id da seção (`experiencia`, `challenges`, `comunitario`).
- `WindowHandle`:
  - `state()`: `'open' | 'minimized' | 'closed'`;
  - `element()`: a caixa da janela (`.desktop-window`), para rolar até ela;
  - `open({ complete?, onLayout? })`: reabre como o ícone (o `open()` que já existe). Com
    `complete: true`, uma janela **fechada** reabre já completa (não prepara nem repete a digitação: o
    `hide()` já completou a digitação ao fechar). `onLayout` roda logo depois que a janela volta ao
    layout (estado `open` + `nextTick`), antes da animação de crescer: é onde o chamador rola a página,
    já com a posição final da janela (os ícones de projetos minimizados ficam lado a lado, e a janela
    aberta ocupa uma linha inteira, então a posição muda ao abrir);
  - `maximize()`: só nas janelas de editor; o `EditorFrame` o entrega ao `DesktopWindow` por um método
    novo do `WINDOW_CONTROLS` (`exposeMaximize(fn)`), porque é ele quem sabe maximizar (006 R5).
- Uma função `openWindow(target, { motion })` (em `src/lib/windows.ts`) faz o fluxo do R4 a partir do
  registro; o `AppDock` só a chama.

**Rationale**: o terminal (na dock) e as janelas (nas seções) estão em ramos diferentes da árvore de
componentes; um registro em módulo é o caminho mais curto e tipado, sem eventos globais nem estado
compartilhado em `provide` no `App`. Sem JavaScript, nada disso existe (o terminal também não).

**Alternatives considered**: `CustomEvent` no elemento da janela (sem tipos e sem retorno para esperar
a animação); `provide`/`inject` a partir do `App` (exige mexer no `App.vue` e em todas as seções para
algo que só a dock usa); procurar a janela no DOM e clicar no ícone (frágil e sem o "já completa").

---

## R4. Fluxo do `open`

**Decision**:

1. O `DockTerminal` roda a linha; a saída recebe `→ <caminho>`; ele emite `open(target)`.
2. O `AppDock` minimiza o terminal (R5) **sem** levar o foco ao botão da dock, e, em paralelo, chama
   `openWindow(target)`.
3. **Projeto** (`mode: 'open'`): se a janela estiver minimizada ou fechada, `handle.open({ onLayout })`
   (fechada: digita de novo, sem piscar, 006 FR-023); no `onLayout`, a página rola até a janela; se ela
   já estava aberta, só rola. A rolagem só acontece se o topo da barra de título não estiver entre a base
   do header (o `scroll-padding-top` do `html`, `--nav-height`) e a metade da tela (FR-004), e leva a
   barra até logo abaixo do header. O foco vai para o `−` da janela (`focus({ preventScroll: true })`,
   para não brigar com a rolagem) — o mesmo foco de quando o ícone a reabre; o `DesktopWindow` passa a
   dar esse foco com `preventScroll` também ao reabrir pelo ícone (a janela já está na tela).
   **Decidido na implementação**: a rolagem com movimento é própria, de duração fixa (`glideTo`, 450 ms,
   desaceleração cúbica, interrompida por roda ou toque), e não o `scrollIntoView` suave do `find`:
   medido no e2e, o suave nativo do Chromium levou 1,2–1,6 s do hero até os projetos, acima do 1 s da
   SC-001. Sem movimento, de uma vez.
4. **Editor** (`mode: 'maximize'`): rola até a janela **sem animação**; se ela estiver minimizada ou
   fechada, `handle.open({ complete: true, instant: true })` (volta já completa e sem crescer a partir do
   ícone: a animação que o visitante vê é a de maximizar; com as duas em sequência, o e2e mediu 1,1 s);
   então `handle.maximize()` (FLIP de 320 ms a partir do lugar dela, foco no `□`, 006 FR-017). A rolagem
   é instantânea porque a janela maximizada trava a rolagem da página (`html.window-maximized`): uma
   rolagem suave em curso seria cortada no meio, e, ao restaurar, a página não estaria na seção.
5. Tempo total: minimizar o terminal (320 ms) em paralelo com abrir (≤ 320 ms) e rolar (450 ms), ou com
   maximizar (320 ms) → abaixo de 1 s (SC-001). Com "reduzir movimento", tudo é imediato (FR-009).

**Rationale**: reaproveita as animações e o foco que as janelas já têm (Princípio V); o único caso novo
é "reabrir já completa", que o `complete` cobre.

**Alternatives considered**: rolar suave e esperar o fim antes de maximizar (mais lento e frágil:
não há evento confiável de fim de rolagem suave em todos os navegadores); maximizar sem rolar (ao
restaurar, a página estaria onde o visitante estava, e não "redirecionada" para a seção).

---

## R5. Minimizar o terminal da dock

**Decision**:

- O `AppDock` troca o `open: boolean` por `state: 'closed' | 'open' | 'minimized'`.
- O `DockTerminal` continua montado enquanto o terminal estiver minimizado (`v-if="state !== 'closed'"`),
  e a sessão (as linhas, o histórico, o texto do prompt, o cursor e a rolagem da saída) fica onde já
  está: no próprio componente. Fechar desmonta o componente e apaga tudo, como hoje (FR-014).
- Minimizado, o terminal fica com `opacity: 0`, `pointer-events: none` e `inert`: some da tela, do Tab e
  do leitor de tela, mas **mantém o layout**, então a rolagem da saída e a posição do cursor do
  `<input>` voltam intactas (com `display: none`, o Chromium perde o `scrollTop` da saída). Na
  implementação, `visibility: hidden` foi trocado por `opacity: 0`: sem movimento, a regra global do
  `base.css` dá a todo elemento uma transição de 0,01 ms, e a `visibility` herdada pelos filhos
  transitava (um quadro "escondida"), então o prompt recusava o foco ao restaurar.
- Animação (Q4 do clarify): FLIP com a Web Animations API, como o `DesktopWindow` (`lib/flip`:
  `toward`, `FLIP_MS` = 320 ms, `FLIP_EASING`, `canAnimate()`; com `transform-origin: top left` no
  terminal durante a animação, porque o `toward` mede a partir do canto de cima à esquerda): ao minimizar, o terminal encolhe até o
  retângulo do botão da dock e some (opacidade → 0); ao restaurar, cresce a partir dele. Fechar e abrir
  do zero continuam com a `<Transition>` de hoje (desce 1,5 rem e some), e a troca de `minimized` para
  `open` não passa pela `<Transition>` (só muda um atributo, não o `v-if`). Uma animação em curso é
  terminada antes de começar outra (`finishAll`), como no `DesktopWindow`.
- O botão `−` da barra: `TerminalBar` com `minimizable` e uma prop nova `minimizeLabel` ("Minimizar
  terminal"; o padrão continua "Minimizar <título>"), como o `closeLabel` que já existe.
- Botão da dock: clique e Ctrl+Alt+T fazem `closed → open`, `open → minimized` (Q2 do specify) e
  `minimized → open`. Nome acessível por estado (FR-016); `aria-expanded` só é `true` com o terminal
  aberto; a dica (006) aparece com o terminal fechado ou minimizado.
- Indicador (Q2 do clarify): o `::after` de hoje, por estado: aberto, o ponto cheio em
  `--green-bright`; minimizado, o mesmo ponto vazado (fundo transparente, contorno de 1 px em
  `--green-bright`), um pouco maior para o contorno ler (0,35 rem); fechado, nada. `--green-bright` sobre
  o fundo da dock (`--surface` a 85% sobre o `--bg`) passa de 9:1, acima dos 3:1 pedidos.
- Foco: minimizar pelo `−`, pela dock ou pelo atalho leva o foco ao botão da dock; minimizar pelo `open`
  não (o foco vai para a janela, R4). Restaurar põe o foco no prompt (`focusInput`), e o navegador
  devolve a seleção que o `<input>` tinha.

**Decidido na implementação** (consequências medidas no e2e):

- Ao restaurar, o foco no prompt faz o navegador rolar a saída o mínimo para mostrá-lo, se ele estava
  meio cortado (o elemento focado é revelado; WCAG 2.4.11). A rolagem guardada é preservada, menos esse
  ajuste.
- O `help` ganhou 6 linhas (o bloco do `open`) e o terminal passou a chegar à altura máxima
  (`min(60svh, 28rem)`); numa tela de 720 px, depois de `help` e `find projetos`, ele cobria o título da
  seção (004 FR-022, e2e da 004). A altura máxima passou a `min(50svh, 28rem)`: igual a partir de ~900 px
  de altura, 72 px menor numa tela de 720 px.

**Rationale**: guardar a sessão no componente montado é o mais simples e não precisa de estado novo; o
`visibility` preserva o que o `display: none` perderia; o FLIP é o mesmo das janelas, então "minimizar"
tem a mesma cara em todo o site, e a descida curta continua significando "fechar".

**Alternatives considered**: guardar a sessão num store e remontar (mais código e o risco de perder a
rolagem); `v-show` (o `display: none` perde a rolagem e dispararia a `<Transition>` de fechar).

---

## R6. Vinheta central original do Letter Glitch

**Decision**: `--glitch-vignette-center: radial-gradient(circle, rgb(0 0 0 / 0.8) 0%, transparent 60%)`,
o degradê do componente original (`rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%`; `transparent` interpola
igual no CSS atual, em espaço pré-multiplicado). A vinheta das bordas e o `--glitch-alpha` (0,55) ficam
como estão (FR-019, FR-021).

**Verificação (SC-005)**: com o canvas escondido e um fundo branco no contêiner do Letter Glitch, a
camada da vinheta central sozinha dá, no centro, 20% do branco (sRGB ≈ 51) e, a partir de 60% do raio,
o branco puro. Tolerância de 2 pontos percentuais. Com o canvas visível, um anel a ~45% do raio tem
letras acesas (luminância média acima da do centro).

---

## R7. Contraste com a vinheta original: o halo

**Medido sem halo, com a vinheta original** (pior quadro, a maior luminância na caixa do texto, o
método do e2e da 006):

| Texto | 1366 × 800 | 390 × 844 |
|-------|-----------|-----------|
| nome (`h1`) | 5,42 | 5,36 |
| linha do prompt | 9,69 | 8,63 |
| **tagline** (`--text-dim`) | **2,41** | **2,28** |
| botão `./ver_experiencia.sh` (fundo tirado) | 11,91 | 9,27 |
| botão `ping vittorio` (fundo tirado) | 5,96 | **4,19** |
| `▼ scroll` | 5,32 | 4,76 |
| **loader, trabalhando** (`--loader-working`, método do `hero-loader.spec.ts`) | **2,89** | **1,88** |
| loader, "done" (`--loader-done`) | 5,62 | **3,80** |

(Com a vinheta calibrada da 006, todos ≥ 5,4. O loader foi medido no `/speckit-analyze` (achado C1):
ele fica perto do topo do bloco de texto, onde a vinheta original já está fraca, e o roxo do
"trabalhando" tem quase a luminância do Dim Lilac.)

**Decision**:

- **Tagline e texto do loader**: halo no token `--hero-halo`, aplicado só aos textos que reprovam
  (Q5 do clarify) e só com o fundo animado (`.hero[data-glitch] .hero-sub` e
  `.hero[data-glitch] .hero-boot .ll-text`; o atributo vem do `HeroSection` quando o `HeroGlitch` está na
  tela). A grade do loader (as células) não ganha halo: é decorativa.
  O halo é um **contorno escuro sólido de 2 px** (as sombras sem desfoque em todos os deslocamentos
  inteiros de até 2 px, mais uma no próprio lugar) mais um **esfumado curto por fora**
  (`0 0 4px #000, 0 0 8px rgb(0 0 0 / 0.8)`). Ponto de partida, calibrar no e2e.
- **Botão `ping vittorio`**: o fundo dele, hoje translúcido (12% de `--green` sobre o que estiver
  atrás), passa a ser opaco com o fundo animado: `color-mix(in srgb, var(--green) 12%, var(--bg))`, a
  mesma cor sobre o fundo liso. O rótulo fica em 11:1. É o "fundo próprio" do FR-021, e não um halo.
- **Os demais** passam sem halo; se o e2e de 10 quadros pegar algum abaixo de 4,5:1 (o `▼ scroll` no
  celular, 4,76, é o mais perto), ele entra no `--hero-halo` pela regra do FR-021 (calibrar).

O loader com halo fecha na calibração (T028), pelo mesmo método, com o mesmo `--hero-halo` de partida.

**Medido com halo na tagline (já com o texto curto do item 5)**, contraste entre o texto e o pior pixel
da **vizinhança de 2 px em volta dos traços** (R8), pior de 10 quadros:

| Halo | 1366 × 800 | 390 × 844 |
|------|-----------|-----------|
| nenhum | 2,78 | 2,32 |
| esfumado só (`0 0 2px`, `0 0 4px`, `0 0 8px` em preto) | 3,16 | 2,98 |
| contorno sólido de 1 px | 2,74 | 2,52 |
| contorno sólido de 2 px | 5,11 | 4,63 |
| **contorno sólido de 2 px + esfumado `4px`/`8px`** | **4,89** | **5,15** |

Um halo só esfumado não basta: os traços da Iosevka a 16 px têm ~1,5 px, e o desfoque espalha pouca
sombra em volta deles. O contorno sólido resolve; o esfumado por fora suaviza a borda do contorno sobre
as letras do fundo e dá folga no celular. Nas capturas, o glitch continua aceso até ~1 linha do texto, e
a tagline não parece mais grossa (o contorno é escuro sobre fundo escuro).

**Rationale**: o WCAG (Understanding 1.4.3, texto sobre imagem) aceita um halo em volta das letras e
manda medir o contraste entre o texto e o halo; é o recurso que mantém o glitch visível mais perto do
texto, que era o que o autor queria ao trocar a vinheta (Q3 do specify).

**Calibração final (T028, 2026-10-10)**, pelos e2e (`hero-glitch.spec.ts`, 10 quadros;
`hero-loader.spec.ts`, 5 quadros por fase), com o `--hero-halo` de partida (contorno sólido de 2 px +
esfumado `4px`/`8px`), estável em 5 repetições:

| Texto | Método | 1366 × 800 | 390 × 844 |
|-------|--------|-----------|-----------|
| tagline | vizinhança (halo) | 4,93 | 4,72 |
| loader, trabalhando | vizinhança (halo) | 4,94 | 4,62 |
| loader, "done" | vizinhança (halo) | 5,24 | 10,01 |
| nome (`h1`) | caixa | 5,42 | 5,36 |
| linha do prompt | caixa | 7,73 | 6,30 |
| `./ver_experiencia.sh` (fundo tirado) | caixa | 11,91 | 9,27 |
| `ping vittorio` (fundo opaco) | caixa | 11,00 | 11,00 |
| `▼ scroll` | caixa | 5,32 | 4,96 |

Um contorno de 3 px não mudou os números do loader: o que os derrubava era a medição (a fase do loader
troca pelo relógio no meio dela, e um texto em meio pixel com e sem `filter` caía em pixels diferentes
na máscara); o teste passou a medir o rótulo de cada fase fixo e a manter o `filter` na máscara. O
contorno ficou em 2 px. Nenhum outro texto precisou de halo.

**Extensão do halo** (SC-005): o contorno vai 2 px além dos traços e o esfumado se perde perto de
8 px; a 12 px ou mais de qualquer texto, o fundo é o mesmo com e sem halo (verificado no e2e, T027).

**Alternatives considered**: halo só esfumado (medido: não passa); letras do fundo mais apagadas
(recusado na Q3); tagline em `--text` (recusado: o FR-021 não muda as cores do texto); halo em todo
texto do hero (recusado na Q5).

**Observação fora do escopo**: no celular, a frase digitada na linha do prompt
(`echo "TypeScript · Vue · PostgreSQL"`) quebra em duas linhas e empurra a tagline e os botões para
baixo enquanto é digitada. Isso já acontece na 006; esta feature não muda, mas o e2e de contraste fixa a
altura da linha do prompt durante a medição (R8) para que a máscara das letras e o fundo coincidam.

---

## R8. Como medir o contraste com halo (e2e)

**Decision**: um helper novo em `tests/e2e/support/contrast.ts`, `haloContrast(page, selector, frames)`:

1. Fixa a altura da linha do prompt (`min-height: 3.6em`) enquanto mede (R7, observação).
2. **Máscara das letras**: com o `.hero-glitch` escondido, o hero em preto e o texto em branco sem
   sombra, captura a caixa do texto (+12 px); pixels com luminância > 0,25 são traço.
3. **Vizinhança**: os pixels a até 2 px CSS (× DPR) de um traço, sem os pixels de borda antisserrilhada
   da própria letra (luminância > 0,05 na máscara).
4. **Fundo**: em cada quadro, com o texto transparente e o halo mantido (a sombra continua desenhada
   com `color: transparent`), a maior luminância na vizinhança; contraste contra a cor do texto.

O texto do loader também é medido assim (no `hero-loader.spec.ts`, nas duas fases, 1366 e 390 px, com 5
quadros, porque cada fase dura ~3 s). Os textos sem halo continuam medidos como na 006 (a maior luminância na caixa inteira, com o fundo dos
botões tirado), menos o `ping vittorio`, que passa a ter fundo opaco e é medido contra ele.

**Rationale**: é o que o WCAG pede para texto com halo (o fundo que conta é o que encosta nas letras);
medir a caixa inteira acharia as letras do glitch entre as palavras e as linhas, que o halo não precisa
cobrir.

**Alternatives considered**: o quantil da caixa (não distingue o que encosta no texto); tirar a
máscara do DOM (as caixas de linha não dão a forma dos traços).

---

## R9. Texto do Sobre na cor padrão

**Decision**: a linha de saída `cat sobre.txt` do `AboutSection` recebe a classe `about-text`, com
`color: var(--text)` no CSS com escopo do componente (`.about-window .about-text`, mais específico que
o `.t-output` do `TerminalLine`), o mesmo padrão do `.t-desc` do `ProjectCard`. Os destaques
(`RichText`, `.hl-green`) têm cor própria e não mudam. `--text` sobre `--surface` dá 12,6:1; na
impressão, os tokens do tema claro já trocam o `--text`.

**Alternatives considered**: mudar o `.t-output` do `TerminalLine` para `--text` (mudaria todas as
saídas de todas as janelas, fora do pedido; a 003 decidiu os comentários em Dim Lilac).

---

## R10. Tagline

**Decision**: `profile.tagline` em `src/data/resume.ts` passa a "Transformando processos em sistemas
escaláveis" (sem ponto final). O `RevealText` recalcula o escalonamento das palavras sozinho (5 palavras
→ 200 ms entre elas, ainda ≤ 1,5 s). Os metadados de SEO (`profile.seo`) não usam a tagline e não mudam
(FR-025). O teste de componente do `RevealText` usa o texto como exemplo e passa a usar o novo.

---

## R11. Versão

**Decision**: `package.json` e `package-lock.json` em `2.6.0` (005 FR-016); `tests/unit/version.spec.ts`
espera `v2.6`.

---

## R12. Testes, peso e documentação

**Testes**:

- Unidade: `terminal.spec.ts` (`open` com cada opção, apelido, normalização, sem opção, inválida,
  seção que não é opção, `help`, autocompletar de `o`, `open it`, `open `), `sections.spec.ts`
  (`openTargets`: ordem, nomes, unicidade, coleções vazias).
- Componente: `DockTerminal.spec.ts` (`−` funcional com "Minimizar terminal", emite `minimize`; `open`
  emite o alvo), `DesktopWindow.spec.ts` (registro, `open({ complete })` não repete a digitação,
  `onLayout` antes da animação), `RevealText.spec.ts` (texto novo).
- e2e: novo `open-command.spec.ts` (US1: 9 opções × aberta/minimizada/fechada, rolagem, foco, terminal
  minimizado, restaurar o editor, erros, Tab, movimento reduzido, celular); `dock-terminal.spec.ts`
  (US2: `−`, dock e Ctrl+Alt+T minimizam e restauram com a sessão; ✕/`exit`/Esc fecham e apagam; ponto
  cheio/vazado; nomes acessíveis; dica com o terminal minimizado); `hero-glitch.spec.ts` (US3: vinheta
  original por pixel, contraste com halo pelo R8, fundo opaco do `ping vittorio`, sem penumbra); Sobre e
  tagline em `content-polish.spec.ts` (US4, US5); `a11y.spec.ts` com o terminal minimizado e o editor
  maximizado pelo `open`; `weight.spec.ts` com a nova linha de base.

**Peso** (SC-009): linha de base da 006 medida agora, **107.695 B** gzip (HTML + CSS + JS iniciais, sem
workers; mesmo método do `weight.spec.ts`). Estimativa da 007: +1,5 KB (motor do `open` ~0,5 KB,
registro e fluxo ~0,4 KB, minimizar na dock ~0,4 KB, CSS do halo e do indicador ~0,2 KB). Teto: +3 KB
(≤ 110.767 B). **Medido na implementação**: 109.532 B (+1.837 B), dentro do teto.

**Documentação**: depois da implementação, `DESIGN.md` (dock: estados e indicador; Letter Glitch:
vinheta original e halo; Sobre) e `README.md` (comandos do terminal), em commit separado, como nas
features anteriores.

**Numeração**: o boot em dispositivo (`specs/insumos/002-boot-dispositivo.md`) passa a ser a 008.
