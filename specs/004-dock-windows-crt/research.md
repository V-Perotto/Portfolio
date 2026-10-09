# Research: Janelas de área de trabalho, dock com terminal e telas CRT

**Feature**: `004-dock-windows-crt` | **Date**: 2026-10-09 | **Spec**: [spec.md](spec.md)

Cada decisão segue o formato Decisão / Racional / Alternativas. As medições foram feitas em
2026-10-09 com o build atual (estado da 003) e com o Vue Bits em
`DavidHDev/vue-bits@07c0f76d5567db022c2e3185dd97a2311e056c0c`, o mesmo commit de onde vieram o
`SpotlightCard` e o `BlurText`.

## R1 — Fundos WebGL sem `ogl` nem `three`: shaders vendorizados sobre um helper próprio

**Decisão**: vendorizar o Faulty Terminal e o CRT Warp do Vue Bits como componentes próprios em
`src/components/vendor/vue-bits/`, com o cabeçalho de origem, licença e modificações (o mesmo padrão
do `SpotlightCard`). Os **shaders GLSL são copiados como estão** (com as modificações do R3 no CRT),
mas a camada de renderização troca as bibliotecas por um helper mínimo, `src/lib/webgl.ts`
(~80 linhas): cria o contexto, compila o programa, desenha um triângulo que cobre a tela, aplica os
uniforms, redimensiona com `ResizeObserver` e libera tudo no `dispose`. Os dois componentes usam o
mesmo helper.

**Racional**: o Faulty Terminal original usa `ogl` (Renderer, Program, Mesh, Triangle, Color) e o CRT
Warp usa `three` (cena, câmera ortográfica, `ShaderMaterial`, `WebGLRenderer`). Os dois só desenham um
retângulo de tela cheia com um fragment shader. O `three` sozinho pesaria ~130–170 KB gzip, mais que
o JS inteiro do site hoje (51,7 KB gzip). O `ogl` é leve, mas seria uma dependência a mais só pelo
boot. O helper fica em ~1 KB gzip e não entra no `package.json`. O Princípio III pede justificar cada
dependência nova, e aqui não entra nenhuma.

**Alternativas**: `three` (peso proibitivo); `ogl` só para o Faulty Terminal e `three` para o CRT
(duas bibliotecas para o mesmo trabalho); portar o CRT para `ogl` (ainda uma dependência). Copiar os
componentes como estão (`jsrepo add`) foi descartado pelo peso e porque o CRT precisa de
modificação de qualquer jeito (R3).

**Revisão na implementação (T012, 2026-10-09): as cenas rodam num Web Worker.** Medido no Chromium
headless, com WebGL por software: na thread principal, cada quadro do Faulty Terminal em 1440×900
levava ~620 ms e atrasava os timers da página em ~1 s em média. A página só ficava descoberta aos
7,5 s, acima do teto. Com o mesmo shader num worker (`canvas.transferControlToOffscreen()`), o atraso
dos timers caiu para 0,2 ms. Numa GPU de verdade o custo é bem menor, mas o teto do boot é rígido
(constituição v2.3.0), e o hero não deve pesar na interação (INP). Por isso:

- cada cena (`src/lib/scenes/faulty.ts`, `src/lib/scenes/crt.ts`) é código sem DOM, que roda tanto
  num worker (`src/workers/*.worker.ts`) quanto na thread principal;
- `src/lib/scene-host.ts` escolhe: com WebGL em `OffscreenCanvas` (Chrome, Edge, Firefox ≥ 105,
  Safari ≥ 17), worker; sem ele, thread principal, com um freio: três quadros seguidos com mais de
  250 ms de intervalo congelam a animação no último quadro;
- a thread principal só repassa tamanho, visibilidade e ponteiro;
- os componentes vendorizados (`FaultyTerminal.vue`, `CrtWarp.vue`) ficam finos (canvas + host), e os
  shaders copiados do Vue Bits, com o cabeçalho de origem e licença, ficam nos módulos de cena.

## R2 — Faulty Terminal na tela de boot: parâmetros, cor e custo

**Decisão**: o boot ganha o `FaultyTerminal` ao fundo, atrás do texto, com os parâmetros do autor:
`scale 3`, `digitSize 3`, `timeScale 1` (Speed), `noiseAmp 0.5`, `brightness 0.5`,
`scanlineIntensity 1.4`, `curvature 0.2`, `mouseReact false` e `pageLoadAnimation true` (as células
acendem ao longo de 2 s). Os demais parâmetros ficam no padrão do componente (`gridMul [2, 1]`,
`glitchAmount 1`, `flickerAmount 1`, sem aberração cromática nem dither). A cor (`tint`) vem do token
`--green-bright` (o demo usa `#A7EF9E`, um verde claro; o mais próximo no tema é o verde-neon). A
resolução fica em `min(devicePixelRatio, 1)`, e os quadros em no máximo 30 por segundo.

O texto do boot ganha um painel atrás de si (`--boot-panel`: o fundo da página a 92%, com borda e
raio de janela), para o contraste não depender do quadro do shader (FR-029). A cor do canvas é lida
dos tokens na montagem, como a chuva Matrix já faz.

**Racional**: o fragment shader do Faulty Terminal chama `digit()` 10 vezes por pixel, e cada chamada
avalia 5 `fbm`. Em 1440×900 com `dpr 2`, isso é pesado para GPU integrada e celular, e o boot tem
prazo (R4). Limitar a resolução a 1× e o ritmo a 30 quadros por segundo não muda o visual de forma
perceptível, porque com `scale 3` e `digitSize 3` os "dígitos" são grandes. O painel sob o texto
resolve o contraste em qualquer quadro, já que os dígitos acesos chegam a ~50% de brilho.

**Alternativas**: `dpr 2` do original (custo alto no prazo do boot); texto sem painel (contraste
variando com o shader, sem garantir 4,5:1); a cor `#A7EF9E` literal (fora dos tokens, Princípio V).

## R3 — CRT Warp sobre a chuva Matrix: a chuva vira a textura do tubo

**Decisão**: o fundo do hero passa a ser `HeroCrt.vue`, que junta as duas coisas:

1. A chuva Matrix continua desenhada num canvas 2D (agora **fora da tela**, sem estar no DOM), pela
   lógica atual extraída para `src/lib/matrix-rain.ts`: colunas, rastro com o fundo a 12%, verde e
   roxo alternados, um passo a cada 55 ms. A diferença está nos caracteres (R10).
2. O CRT Warp (shader vendorizado) recebe esse canvas como **textura** e aplica o tubo. A função
   `referencePlasma()` do original, que com **Wave Amount = 0** devolve um valor constante (a onda
   some), é trocada por uma amostra da textura da chuva multiplicada pelas scanlines. O resto do
   shader fica igual: curvatura (`crtCurve`), bloom com raio (8 amostras em volta), RGB shift (canais
   vermelho e azul deslocados), vinheta, ruído e deformação pelo ponteiro.

Parâmetros do autor, já convertidos a partir dos rótulos do demo: `curvature 0.3`,
`scanlineStrength 1`, `scanlineFrequency 270`, `bloom 3`, `bloomRadius 3`, `brightness 1`,
`dpr 0.75` (Render Quality = Performance), `pixelation 1` (Smooth), `mouseReact true` com
`mouseStrength 1.5` (Pointer Warp), `waveAmplitude 0`, `waveFrequency 2.5`, `noise 0.125`,
`rgbShift 0.01`, `fps 24`, `paused false`, `speed 0.3` e `vignette 0.5`. A cor de fundo do tubo
reproduz, no shader, o fundo atual do hero (`--bg` com os dois degradês radiais roxo e verde), lidos
dos tokens. Assim o tubo curva e esmaece o fundo inteiro, como uma tela real.

O canvas 2D da chuva usa a mesma escala de 0,75×. A textura só é reenviada quando a chuva deu um
passo, no máximo 24 vezes por segundo.

**Ponteiro**: o original ouve `pointermove` no próprio contêiner, mas o conteúdo do hero fica por
cima do canvas e engoliria os eventos. A escuta passa para o `<header id="home">` inteiro e só reage
a `pointerType === 'mouse'`. No toque, o tubo fica na posição neutra (edge case da spec).

**Racional**: "Ele deverá ter efeito com as letras do Matrix" + "Wave Amount = 0". Sem a onda, o CRT
sozinho é uma tela de brilho uniforme com scanlines, que cobriria o hero de verde e mataria o
contraste. Usar a chuva como a imagem do tubo é o que dá sentido aos dois pedidos juntos (itens 5 e
6), e reaproveita a chuva que já existe. A cor de fundo pelo shader (e não um canvas transparente
sobre o CSS) deixa o ruído, a vinheta e a curvatura valerem para a tela inteira.

**Alternativas**: CRT com a onda de plasma e a chuva por cima (contraria "Wave Amount = 0" e o "efeito
com as letras"); chuva desenhada direto no shader, com um atlas de glifos e o estado das colunas em
uniforms (bem mais complexo, sem ganho visível); canvas transparente sobre os degradês em CSS (o
ruído e a vinheta não alcançariam o fundo).

## R4 — Boot inteiro, sem pulo e com teto de 7 s: linha do tempo pelo relógio

**Decisão**:

- **Sequência e ritmo atuais**, sem mudança de texto nem de velocidade (FR-031): 18 × 42 ms de
  `ssh viper@portfolio`, +250, +500, 7 × 55 ms da senha, +450, +300, +400, 21 × 24 ms de
  `./iniciar_portfolio.sh` e +350 → **`BOOT_SEQUENCE_MS = 3895`**. A saída (fade) continua com
  **`BOOT_FADE_MS = 550`**.
- **Linha do tempo pura** em `src/lib/boot.ts`: `bootFrame(elapsedMs)` devolve as linhas visíveis
  naquele instante. O `BootScreen` mede o tempo desde o próprio início (`performance.now()`) e
  redesenha a cada ~16 ms. Timers atrasados (CPU ocupada) não acumulam atraso: o quadro seguinte já
  mostra o que o relógio manda. Hoje cada passo encadeia um `setTimeout`, e o atraso se soma.
- **Teto**: **`BOOT_DEADLINE_MS = 7000`**, contados do início da navegação. O boot só começa se
  `agora + 3895 + 550 + 500 de folga ≤ 7000`, ou seja, com montagem em até **2055 ms**
  (`BOOT_LATEST_START_MS`). Montagem mais tarde = sem boot (FR-032).
- **Garantia de nunca cortar**: um timer de segurança em `7000 − 550 − 500` (o fim natural do boot mais tardio) força o fim. Se o relógio
  ainda não tiver chegado ao fim da sequência (CPU muito lenta), o quadro final (todas as linhas
  completas) é desenhado antes do fade. Assim o boot nunca sai com uma linha pela metade, e a página
  fica descoberta em até 7 s.
- **Sem pulo**: saem o ouvinte de `keydown`, o `@click` e a dica "[ pressione qualquer tecla para
  pular ]" (FR-031).
- **Script inline de `index.html`**: dois prazos em vez de um. Em `2055 ms`, se o JS principal ainda
  não marcou `html.app-loaded`, tira `booting`: o boot já não cabe, então a capa sai e a página
  aparece. Em `7000 ms`, se o JS nunca rodou, tira também `motion` (como hoje faz aos 3,9 s). O
  JS que só chega atrasado não perde as animações do resto da página.
- **Teste de sincronia**: um teste do Vitest lê `index.html` e confere que os dois números batem
  com as constantes de `src/lib/boot.ts`.

**Revisão na implementação (T016)**: a folga começou em 250 ms (início até 2305 ms); com a CPU ocupada (13 páginas em paralelo nos e2e), os timers atrasaram até ~400 ms e a página ficou descoberta aos 7,04–7,07 s. A folga passou a 500 ms (início até 2055 ms). **SC-001 (T016, `BOOT_RUNS=20`)**: 20/20 recargas com boot em 1440×900 (página descoberta no máximo aos 5370 ms) e 20/20 em 390×844 com CPU 4× mais lenta (no máximo aos 5298 ms); em todas, a última linha antes do fade era `./iniciar_portfolio.sh` completo.

**Racional**: o corte vem de somar uma sequência de 3,9 s, que só começa quando o JS monta, dentro de
um prazo de 3,9 s contado do início da navegação. A emenda v2.3.0 da constituição permite o teto de
7 s e exige que o boot nunca apareça cortado. O relógio absoluto é o que torna "nunca cortado"
verificável sob CPU 4× mais lenta. O prazo de ~2,1 s no script inline evita que um JS atrasado ou
quebrado deixe a página atrás de uma capa vazia por 7 s.

**Alternativas**: acelerar a digitação para caber em 5 s (rejeitado pelo autor no Q1); manter o
encadeamento de `setTimeout` (o atraso se acumula e a sequência estoura o teto); deixar a capa até os
7 s quando o JS falha (7 s de tela vazia).

## R5 — Header só depois do hero

**Decisão**: novo composable `useHeroPassed()`, com um `IntersectionObserver` sobre o `#home` e
`rootMargin: -<altura do header>px 0px 0px 0px`. O hero "saiu" quando a borda de baixo dele passa da
borda de baixo do header. A altura vem do token `--nav-height`, lida na montagem. O `AppNav` aplica
`.nav-shown` enquanto o hero não está na tela. O CSS, só com `html.js`, esconde o header sem a classe:
`transform: translateY(-100%)`, `opacity: 0`, `pointer-events: none` e transição de 250 ms (sem
transição com `html:not(.motion)`). `.navbar:focus-within` mostra o header, porque os links continuam
na ordem do Tab e o foco revela a barra (FR-013). Por isso o esconderijo não usa `visibility: hidden`
nem `inert`, que tirariam os links do teclado. Quando o hero volta à tela, o menu do celular fecha.

**Revisão na implementação (T070)**: o CSS que esconde o header exige `html.app-loaded` (ou a capa
`html.booting`) e a ausência de `html.app-failed`. Com só `html.js`, um JS principal que falhasse
deixaria o header escondido até o timer de 3,9 s do script inline, e sob carga esse timer atrasou.
Assim, sem o app o header nunca fica escondido. O custo é, com movimento reduzido, o header aparecer
por um instante no topo antes de o JS carregar.

**Racional**: o `IntersectionObserver` não roda a cada rolagem e já dá o estado inicial certo quando
a página carrega no meio. O padrão "escondido até o hero sair" é o do pedido, e o `:focus-within`
cumpre o critério de foco visível (WCAG 2.4.7 / 2.4.11).

**Alternativas**: `scroll` + `getBoundingClientRect` (mais trabalho por quadro); `visibility: hidden`
(o teclado não alcança o menu no hero); sumir só com `opacity` (os links invisíveis receberiam
clique).

## R6 — Espaço de meia tela antes da seção Sobre

**Decisão**: o token `--hero-gap: 50svh` e a regra `.hero + main { margin-top: max(0px,
calc(var(--hero-gap) - 5rem)); }`. Os 5rem são o `padding-top` atual de toda seção
(`--section-pad`), e a soma dá ~50% da altura da tela entre o fim do hero e o título do Sobre. É
margem, e não padding da seção: a navegação por âncora (`#sobre`, `find sobre`) para no topo da
seção, como nas outras. `svh` (a menor altura da tela, sem a barra do navegador do celular) evita
que o espaço mude enquanto a barra aparece e some. Vale com e sem JS.

**Alternativas**: `padding-top` no `#sobre` (a âncora pararia meia tela acima do título); `vh` (no
celular, muda de tamanho com a barra do navegador).

## R7 — Dock e terminal

**Decisão**: componentes novos `src/components/dock/AppDock.vue` (barra fixa no centro de baixo, com o
botão de ícone `SquareTerminal` do Lucide) e `src/components/dock/DockTerminal.vue` (a janela do
terminal). O motor de comandos é uma função pura, `src/lib/terminal.ts`, com os testes no Vitest.

- **Só no cliente**: o `AppDock` não renderiza nada até montar e até o boot acabar (`useBootDone`).
  Sem JS, não existe (FR-026). Na impressão, `display: none`.
- **Abrir e fechar**: clique na dock, Ctrl+Alt+T (`ctrlKey && altKey && code === 'KeyT'`, com
  `preventDefault`), `exit`, ✕ na barra, Esc. Ao abrir, o foco vai para o prompt; ao fechar, volta ao
  botão da dock. O `<Transition>` sobe o terminal a partir da dock (translateY + opacidade, 200 ms;
  nenhum com `html:not(.motion)`).
- **Semântica**: o terminal é um `role="dialog"` **não modal**, com `aria-label="Terminal"`, e o foco
  não fica preso. A saída é `role="log"` com `aria-live="polite"`. O prompt é um `<input>` com rótulo
  oculto ("Comando"), `autocomplete="off"`, `autocapitalize="off"`, `spellcheck="false"` e
  `enterkeyhint="send"`. O botão da dock tem `aria-expanded` e `aria-controls`, com o nome "Abrir
  terminal (Ctrl+Alt+T)".
- **Cursor `▊`**: o `<input>` real fica transparente (texto e caret) sobre um espelho que desenha
  `viper@portfolio:~$ `, o texto antes do caret, o bloco `▊` piscando na posição do caret e o resto.
  A posição vem de `selectionStart`, atualizada em `input`, `keyup`, `click` e `select`.
- **Autocompletar**: `complete(linha, seções)` devolve a única conclusão possível ou a lista de
  candidatos. O que falta da conclusão única aparece em cinza depois do cursor ("texto fantasma"). Tab
  aceita (e → no fim da linha). Com vários candidatos, o Tab lista todos na saída, como no bash.
  Enquanto houver candidatos, eles também aparecem como botões tocáveis sob o prompt (FR-024, toque).
- **Histórico**: ↑/↓ percorrem os comandos da visita, guardados só em memória.
- **`find`**: normaliza a opção (minúsculas, sem acento, sem `~/` nem `/` no fim) e procura entre as
  seções visíveis (`visibleSections(resume)`, a mesma lista do menu). Ao achar, rola com
  `scrollIntoView({ block: 'start' })` (suave só com movimento), atualiza o hash com
  `history.replaceState` (sem pulo) e escreve `→ ~/projetos` na saída. O terminal continua aberto,
  com o foco no prompt (clarify).
- **Sem cobrir conteúdo** (FR-027): o `body` ganha `padding-bottom: var(--dock-space)` (altura da
  dock + folga), e o "▼ scroll" do hero sobe para `bottom: calc(var(--dock-space) + 0.6rem)`. O
  terminal tem altura máxima `min(60svh, 28rem)` e rola por dentro.
- **Teclado virtual**: com `visualViewport`, a variável `--kb-offset` empurra a dock e o terminal para
  cima do teclado no celular.
- **Visual**: a barra do terminal reaproveita a barra das janelas (R8), com título
  `viper@portfolio: ~` e só o ✕ funcional. As cores e fontes são as do tema.

**Racional**: a lógica de comandos é pura e testável sem DOM. O padrão "input transparente sobre
espelho" é o único jeito de ter o cursor em bloco sem perder edição nativa, colar e IME. Diálogo não
modal com `role="log"` é o padrão de console acessível: leitor de tela ouve as respostas, e o
visitante pode sair com Tab.

**Alternativas**: `contenteditable` (edição, colagem e IME frágeis); `<dialog>` modal (prenderia o
foco, mas o terminal é uma ferramenta lateral); xterm.js (~100 KB, uma emulação de terminal inteira
para quatro comandos); caret nativo sem bloco (perde o `▊` pedido).

## R8 — Janelas que minimizam e fecham

**Decisão**:

- **Componente novo `DesktopWindow.vue`** (`src/components/terminal/`), que embrulha o quadro visual
  da janela (o `BaseCard` dos projetos, a `.about-window` e a `.contact-window`) e o ícone de área de
  trabalho. Ele guarda o estado (`open | minimized | closed`) e o oferece ao `TerminalWindow` por
  `provide/inject` (`windowControls`). O `TerminalWindow` sem `DesktopWindow` em volta continua como
  hoje.
- **Barra extraída**: `TerminalBar.vue` (título + controles), usada pelo `TerminalWindow` e pelo
  terminal da dock. Antes de montar, os controles são `<span>` dentro de um contêiner `aria-hidden`,
  idênticos ao HTML de hoje (sem JS, FR-009). Depois de montar, `−` e `✕` viram `<button>` com
  `aria-label` ("Minimizar SRG", "Fechar SRG"), e o `□` continua decorativo. O alvo de clique sobe
  para 24 × 24 px com um pseudo-elemento, sem mudar o desenho de 20 px (WCAG 2.5.8).
- **Ícone de área de trabalho**: um `<button>` com `aria-label="Abrir <título>"` e, dentro, o ícone
  Lucide pelo tipo (`FileText` para documento, `FileTerminal` para script, `FolderCode` para
  projeto) num quadrado de `--desktop-icon-size` (5.5rem), com o título embaixo (até 2 linhas, com
  reticências). O tipo vem de uma prop do `DesktopWindow`: `document` no Sobre, `script` no
  Contato e `project` nos cartões.
- **Animação (FLIP com Web Animations API)**: ao minimizar ou fechar, mede o quadro e o lugar do
  ícone. O quadro anima `transform` (translação + escala até o ícone, `transform-origin` no canto) e
  opacidade, e o contêiner anima a altura do quadro até a do ícone, para o conteúdo abaixo subir junto.
  Tudo em **320 ms**. Ao fim, o quadro fica `display: none` (via classe, para a impressão poder
  reabrir) e o ícone aparece. Abrir faz o inverso, também em 320 ms. Com `html:not(.motion)`, troca
  direto. Um clique no meio da animação conclui a atual (`finish()`) e vai para o estado pedido.
- **Conteúdo ao reabrir**: o `useTerminalTyping` passa a devolver `{ complete, replay }`. Minimizar
  chama `complete()`: se estava digitando, completa, e a janela reabre completa (FR-004). Fechar
  marca `replayOnOpen`, e ao fim do crescimento chama `replay()`: os passos voltam a `pending` e a
  digitação roda de novo, com o mesmo plano e o mesmo teto (FR-005). Sem movimento, `replay()` não faz
  nada.
- **Foco**: depois de minimizar ou fechar, vai para o ícone. Depois de abrir, vai para o botão de
  minimizar da janela.
- **Impressão**: `@media print` mostra todo quadro e esconde os ícones (FR-011).

**Racional**: o quadro visual (borda, sombra, brilho do `SpotlightCard`) fica fora do
`TerminalWindow`, então o encolhimento tem de agir no embrulho. `provide/inject` evita passar
callbacks por três componentes. FLIP com WAAPI anima só `transform` e `opacity` (compositor) e a altura
do contêiner, sem biblioteca. O `motion-v` já está no projeto, mas fica no chunk separado do
`BlurText` (39,9 KB gzip), e trazê-lo para o bundle principal custaria mais do que as ~60 linhas de
WAAPI.

**Alternativas**: `motion-v` com `layout` (peso no bundle principal); ícone num "desktop" separado
(contraria "no lugar da janela"); `v-if` no quadro (a impressão não teria como reabrir, e o estado da
digitação se perderia).

## R9 — Fitas das skills de borda a borda, texto 2× e direção por grupo

**Decisão**:

- **Largura total**: `main` vira contêiner de consulta (`container-type: inline-size`), e a fita usa
  `margin-inline: calc(50% - 50cqw)`. O `cqw` mede a largura do `main`, que não inclui a barra de
  rolagem. Com `100vw`, a fita passaria 10px por baixo da barra e ficaria cortada à direita. Os títulos
  das sub-partes continuam no contêiner de 1100px.
- **Tamanho**: `.loop-item` passa de `0.85rem` para `1.7rem`. O ícone é `--icon-tech: 1em`, então
  dobra junto. O máscara das bordas passa de 2.5rem para 4rem, proporcional. A velocidade continua
  40 px/s (FR-046: o resto não muda).
- **Direção**: o campo opcional `loopDirection?: 'to-left' | 'to-right'` em `SkillGroup` (padrão
  `to-left`), com `to-right` em `conceitos_web` e `desenho_de_processos`. O `SkillLoop` recebe a
  direção e aplica `animation-direction: reverse` na mesma trilha. A trilha vai de `-shift` a 0, e as
  cópias continuam cobrindo a largura, sem buraco.

**Alternativas**: `100vw` (corte sob a barra de rolagem); `transform: scale(2)` (embaça e não muda o
layout); duas animações (duplica CSS sem ganho).

## R10 — Caracteres da chuva

**Decisão**: `MATRIX_CHARS` em `src/lib/matrix-rain.ts` com `A–Z`, `a–z`, `0–9` e
`*&%$#@!?+=-<>[]{}()/\|~^;:`. Um teste de unidade garante que não há nenhum caractere fora do ASCII
imprimível, o que exclui o katakana.

**Racional**: é o pedido literal (item 6), e os caracteres do teclado combinam com a metáfora de
terminal. O ASCII também desenha igual em qualquer fonte monoespaçada, sem depender de fonte japonesa
do sistema.

## R11 — Logotipo do Valkey (homarr-labs/dashboard-icons)

**Decisão**: o `tools/build-tech-icons.mjs` ganha uma quarta fonte, **dashboard-icons**
(homarr-labs, Apache-2.0), com o arquivo `svg/valkey.svg` baixado de um commit fixo pelo jsDelivr
(`cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@<sha>/svg/valkey.svg`). O símbolo vira
`dashboard-valkey`, e `TechIconId` aceita o prefixo `dashboard-`. O ícone passa pelo mesmo svgo e
pela mesma troca de cor por `currentColor`. O SVG tem um único caminho, `#123678`, com
`fill-rule: evenodd` **dentro do `style`**: como o `decolor()` apaga o `style` inteiro, a regra vira o
atributo `fill-rule="evenodd"` antes (sem ela, o furo do miolo some). Numa cor só, o logotipo
continua legível. A entrada `database` sai do manifesto do Lucide, porque o Valkey era o único
usuário. O `NOTICE.md` ganha a seção da fonte, com o
texto da licença Apache-2.0 e o commit.

O sprite é regenerado inteiro. O diff tem de mostrar só o símbolo novo (e a data no `NOTICE`).
**Feito (T059–T060)**: commit `57e939e504eda0ea764098015da93aa666ad6f31` do dashboard-icons; o diff
do sprite foi só `+dashboard-valkey` e `−lucide-database` (nenhum outro símbolo mudou), e o logotipo
ficou legível em 16 e 32 px, com o miolo vazado. Se o
vectorlogo.zone (sem versão fixa) tiver mudado algum arquivo, o diff aponta, e o símbolo antigo é
mantido.

**Alternativas**: copiar o SVG à mão para o sprite (contraria "não edite o sprite à mão"); buscar o
logotipo durante a visita (Princípio III).

## R12 — Rodapé, chip JSON, papel do ItaliaMi, sublinhados dos badges

**Decisão**:

- **Rodapé**: só `<p><span class="prompt-dollar">$ </span>echo "© {{ year }} Vittorio Perotto"</p>`.
  O ano corrente continua corrigido no cliente (FR-013 da 001). Sai a linha `process finished`.
- **JSON**: `'JSON de tema'` → `'JSON'` em `TechName`, `TECH_ICONS` (mesmo `devicon-json`) e nos
  dados.
- **ItaliaMi**: `role: 'Autor e desenvolvedor'`.
- **Sublinhados**: tokens novos `--grape: #852ffc` e `--sith-badge: #d90404`, as cores dos próprios
  badges (`color=%23852ffc` e `color=%23D90404` na URL do shields.io). A borda tracejada sob
  `.evidence-grape img`, `.evidence-sith img` e o domínio que aparece quando o badge falha passa a
  usar o token do tema. O sublinhado é decorativo; o contraste das duas cores sobre `--surface` é
  3,4:1 (grape) e 3,5:1 (sith), acima do mínimo de 3:1 para elemento gráfico.

## R13 — Contraste do hero sobre o CRT (FR-038, SC-005)

**Decisão**: a chuva entra no tubo com intensidade própria, `uIntensity = 0.6`. Na implementação, os
35% de opacidade do canvas antigo deixaram a chuva quase invisível: na escala 0,75 e com scanlines de
força 1, os traços finos dos glifos somem. Atrás do `.hero-content` entra uma penumbra radial,
`--hero-scrim` (o fundo da página a 80% no centro, esmaecendo até 0; começou em 72%, e a tagline em `--text-dim` ficou em 4,3:1 nos quadros com glifo atrás). A verificação é um e2e que
captura 10 quadros do hero com o texto transparente, mede a luminância máxima do fundo sob cada caixa
de texto e calcula o contraste com a cor do texto (≥ 4,5:1).

**Botões (revisão na implementação, T040)**: o contorno do botão principal (`--purple-light` sobre
`--bg`) já tinha 2,9:1 sobre o fundo liso, antes desta feature. Como o rótulo de texto identifica o
botão, o WCAG 1.4.11 não exige 3:1 no contorno. O critério passou a ser: o fundo CRT não deixa o
contorno menos visível do que no fundo estático (≥ 95% do contraste original), medido fora do brilho
do botão e contra o fundo típico ao lado dele (quantil 90 da luminância, porque o grão de ruído do
tubo, `Noise = 0.125`, põe pixels isolados mais claros); o texto continua medido pelo pixel mais claro.

**Racional**: com `bloom 3`, o brilho em volta dos glifos aumenta. A penumbra garante o contraste sem
apagar o efeito nas bordas, onde não há texto.

## R14 — Dependências (item 15, clarify Q2)

**Decisão** (registro npm, 2026-10-09):

| Pacote | De | Para | |
|--------|----|------|--|
| @playwright/test | ^1.63.0 | ^1.64.0 | atualiza (e `npx playwright install chromium`) |
| happy-dom | ^20.14.5 | ^20.14.6 | atualiza |
| vite | ^8.3.3 | ^8.3.4 | atualiza |
| typescript | ~6.0.3 | **~6.0.3** | fica: o 7.0.2 é o compilador nativo e só exporta `version` e uma API `unstable/*`; o `vue-tsc` 3.3.12 (o mais novo) usa a API em JavaScript do TypeScript, que não existe no 7. Revisitar quando o `vue-tsc` declarar suporte ao TypeScript 7 |
| @unhead/vue | ^2.1.17 | **^2.1.17** (o mais novo da 2.x) | fica: o `vite-ssg` 28.3.0 (o mais novo) depende de `@unhead/vue ^2` e instala o cabeçalho com ele; com a 3 no projeto, o `useHead` do site falaria com outra instância, e os metadados sumiriam do HTML. Revisitar quando o `vite-ssg` passar para a 3 |
| beasties | ^0.3.5 | **^0.3.5** (o mais novo da 0.3) | fica: o `vite-ssg` 28.3.0 declara `peerDependencies: beasties ^0.3.5`; o `npm ci` recusaria a 0.5 (ERESOLVE). Revisitar com o `vite-ssg` |

As demais (vue 3.5.43, @lucide/vue 1.53.0 — atualizado para 1.54.0 na implementação, publicado em
2026-10-09 —, @vueuse/core 15.0.0, motion-v 2.6.0, tailwindcss e
@tailwindcss/vite 4.3.3, @vitejs/plugin-vue 6.0.9, vite-ssg 28.3.0, vitest 5.0.3, vue-tsc 3.3.12,
@vue/test-utils 2.5.1, @axe-core/playwright 4.13.0, @types/node 26.6.4) já estão na mais nova.

Os dois lockfiles são atualizados: `npm install` (gera o `package-lock.json`, do CI) e
`pnpm install` (gera o `pnpm-lock.yaml`). O `pnpm-workspace.yaml` tem `minimumReleaseAge` (pnpm 11):
versões publicadas há menos de 24 h (vite 8.3.4, happy-dom 20.14.6) entram na lista
`minimumReleaseAgeExclude`, como já foi feito com o vite 8.3.3. A versão de cada pacote é conferida
de novo no dia da implementação.

**Verificação (T063, 2026-10-09)**: `npm outdated` lista só `typescript` (7.0.2), `@unhead/vue`
(3.4.2) e `beasties` (0.5.4), as três exceções. Em cópias limpas, `npm ci` e
`pnpm install --frozen-lockfile` passam e resolvem as mesmas versões (vite 8.3.4, happy-dom 20.14.6,
@playwright/test 1.64.0, @lucide/vue 1.54.0, typescript 6.0.3, @unhead/vue 2.1.17, beasties 0.3.5).
O sprite continua com os ícones Lucide renderizados da 1.53.0, como o `NOTICE.md` registra.

**Alternativas**: forçar as três majors (rejeitado no Q2).

## R15 — Peso (SC-006)

**Linha de base** (build da 003, gzip -9, conferida no T001): HTML 16,5 KB + JS 51,7 KB + CSS 9,1 KB
= **77,3 KB** iniciais; `BlurText` (motion-v) 39,9 KB à parte; sprite 24,6 KB bruto. **LCP** do hero
(`npm run preview` local, "reduzir movimento" para não contar o boot, mediana de 5 cargas):
**272 ms** em 1440×900 e **208 ms** em 390×844.

**Medido no fim (T067)**: HTML 17,1 KB + JS 60,9 KB + CSS 10,5 KB = **88,5 KB** gzip iniciais (teto
95,3 KB); `weight.spec.ts`: 299,7 KB com tudo carregado (teto 500 KB). Chunks à parte: worker do
Faulty Terminal 8,9 KB e do CRT 8,6 KB (brutos), `HeroCrt` 3,5 KB, cenas para a thread principal
5,4–5,7 KB. **LCP**: 232–244 ms em 1440×900 e 204 ms em 390×844 (linha de base 272 e 208 ms): dentro
dos ±10%. Nenhuma requisição a terceiros além dos badges (novo teste em `weight.spec.ts`).

**Estimativa** (do plano): helper WebGL + Faulty Terminal no bundle principal (o boot começa na montagem, e um
chunk a mais custaria um round-trip dentro do prazo) ~3 KB; dock + terminal + `lib/terminal` ~4 KB;
`DesktopWindow` + barra ~2 KB; CSS ~1,5 KB. O CRT + a chuva vão num **chunk separado**
(`import()` depois do boot, só com movimento e WebGL), ~4 KB. Inicial ≈ 88 KB gzip, dentro do teto
de 95,3 KB da 003. Com tudo carregado, fica longe dos 500 KB do `weight.spec.ts`.

## R16 — Testes afetados

- **Boot sem pulo**: os helpers `skipBoot` (Esc) de `terminals.spec.ts`, `skills.spec.ts`,
  `reduced-motion.spec.ts`, `a11y.spec.ts` e `motion.spec.ts` passam a **esperar o fim do boot**
  (`tests/e2e/support/boot.ts`, `waitBootEnd`, até 7,5 s), ou usam movimento reduzido quando o
  teste não depende de animação. O teste "boot é pulado com qualquer tecla" vira "nem tecla nem
  clique pulam o boot". Os limites de 5 s viram 7 s.
- **Dados**: `resume.data.spec.ts` (JSON, papel do ItaliaMi, `loopDirection`); `tech-icons.spec.ts`
  (Valkey → `dashboard-valkey`, prefixo novo); `TagChip.spec.ts` (`#dashboard-valkey`).
- **Header**: `links.spec.ts` (menu do celular) e `layout.spec.ts` (itens da navegação) precisam
  rolar para fora do hero antes de interagir com o header.
- **Novos**: `boot.spec.ts` (US1), `dock-terminal.spec.ts` (US2), `header.spec.ts` (US3),
  `desktop-windows.spec.ts` (US4), `hero-crt.spec.ts` (US5, inclusive contraste e sem WebGL),
  `skills.spec.ts` ampliado (US6), `content-polish.spec.ts` (US7). No Vitest: `terminal.spec.ts`,
  `boot.spec.ts`, `matrix-rain.spec.ts`, `DesktopWindow.spec.ts` e `DockTerminal.spec.ts`.
- **Sem WebGL**: um `addInitScript` faz `HTMLCanvasElement.prototype.getContext` devolver `null`
  para `webgl`/`webgl2`. O boot e o hero têm de cair no fundo estático sem erro no console.

## R17 — Inspeção manual (T071, 2026-10-09)

Build de produção servido localmente (`vite preview`), em 1440×900 e 390×844: boot (início, meio e
fim), hero com o CRT, header surgindo no espaço vazio, terminal com `help` e `find`, janelas
minimizada e fechada, skills (com e sem movimento), sem JavaScript, com "reduzir movimento" e na
impressão. Console sem erros nem avisos em todos os modos. Ajustes feitos na inspeção:

- a penumbra do hero tinha bordas verticais visíveis (o degradê elíptico não chegava a transparente
  dentro da caixa): passou a `radial-gradient(closest-side, …)`, só com movimento, e o hero estático
  (sem JS, movimento reduzido) ficou igual ao de antes da feature;
- com o loop parado, um item de 1,7rem ("Design Patterns ✦") vazava em 320px: parado, o item quebra
  dentro da fita.

Limitação do ambiente de teste: no Chromium headless o WebGL é por software, e o Faulty Terminal e o
CRT pesam na CPU. Por isso o projeto `webgl` do Playwright roda um teste por vez. Numa GPU de verdade,
o custo é outro; a validação visual final em navegador com GPU fica com o autor.
