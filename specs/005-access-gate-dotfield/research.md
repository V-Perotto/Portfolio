# Research: Porta de acesso no boot, IP real, Dot Field no hero e ajustes nas janelas

**Feature**: `005-access-gate-dotfield` | **Date**: 2026-10-09 | **Spec**: [spec.md](spec.md)

Cada decisão segue o formato Decisão / Racional / Alternativas. O Vue Bits consultado é
`DavidHDev/vue-bits@07c0f76d5567db022c2e3185dd97a2311e056c0c`, o mesmo commit dos quatro componentes
já vendorizados (`SpotlightCard`, `BlurText`, `FaultyTerminal`, `CrtWarp`). Constituição em vigor:
**v3.0.0** (emendada em 2026-10-09 para esta feature, Princípio IV).

## R1 — A porta de acesso substitui o `BootScreen`, reaproveitando o ícone e a janela da 004

**Decisão**: o `BootScreen.vue` vira `AccessGate.vue` (mesmo lugar no `App.vue`, só no cliente). Ele
monta, numa camada fixa de tela cheia (z 9999, acima da capa `html.booting::before`):

- o **Faulty Terminal** ao fundo (só com movimento; sem ele, o fundo liso `--bg`);
- um **palco** em grade com uma única célula (`grid-area: 1 / 1`), em que o ícone com a dica e a
  janela se sobrepõem, os dois centralizados sem `transform` (o FLIP fica livre para usar o
  `transform`);
- o **ícone** `acessar_portfolio.sh`: o botão de área de trabalho da 004 extraído para
  `DesktopIcon.vue` (quadrado, glifo `FileTerminal`, nome embaixo), usado também pelo
  `DesktopWindow`;
- a **janela**: o `TerminalWindow` existente com `animate=false`, dentro de um `provide` de
  `WINDOW_CONTROLS` (o mesmo contrato do `DesktopWindow`), o que dá de graça os botões funcionais com
  nome acessível; ganha a prop `maximizable` (falsa aqui), repassada ao `TerminalBar`, que então não
  desenha o `□` (FR-006).

As animações de crescer e encolher são o mesmo FLIP de 320 ms da 004. A conta
(`toward(from, to)`) e o "terminar a animação em curso" saem do `DesktopWindow` para
`src/lib/flip.ts`, usado pelos dois.

**Racional**: o pedido é literalmente "faça igual os ícones quando o terminal é minimizado". Reusar o
ícone, a janela e o FLIP garante o mesmo desenho e o mesmo tempo (Princípio V) e evita um segundo
conjunto de botões a manter acessíveis. O `DesktopWindow` não serve inteiro: ele começa aberto, põe
o ícone no fluxo da página no lugar da janela e anima a altura do contêiner. Na porta, o ícone e a
janela ficam no centro da tela, um sobre o outro.

**Alternativas**: estender o `DesktopWindow` com `initialState` e um modo "centralizado" (mistura dois
layouts e dois ciclos de vida num componente que já tem 200 linhas); uma janela própria com
controles desenhados à mão (duplica o `TerminalBar`).

**Revisões na implementação (2026-10-09)**:

- **WebGL desligado na página, mas não no `OffscreenCanvas`.** No Chromium com `--disable-webgl` (o
  projeto `chromium` dos e2e, e um visitante que desligou o WebGL), o `OffscreenCanvas` ainda cria
  um contexto WebGL, por um caminho de software. O Faulty Terminal rodava no worker por ele, e a página
  inteira parava de desenhar quadros (sem `requestAnimationFrame`, o Playwright nunca via os
  botões "estáveis" e os cliques travavam). Com a porta, que espera sem teto, o efeito virou
  permanente. Correção: `hasOffscreenWebGL()` exige também WebGL na página (`hasWebGL()`); sem ele,
  a porta fica com o fundo liso.
- **Quadros parados ao abrir a janela com WebGL por software.** No Chromium dos testes, o WebGL é o
  SwiftShader (por software). Com o Faulty Terminal ligado, abrir a janela da porta parava os quadros
  por 1,5 a 2,5 s, em qualquer largura. Nenhuma tarefa longa na thread principal: era a composição
  esperando o WebGL. Com a GPU de verdade (`--ignore-gpu-blocklist --enable-gpu --use-angle=gl`,
  Radeon da máquina), o maior intervalo entre quadros foi de 18 a 74 ms, em 6 medidas a 390 e a 1366
  px. Não é defeito do site; os e2e que medem tempo usam relógio (timers e `MutationObserver`), não
  quadros, e os screenshots de conferência usam a GPU real.

## R2 — Capa, prazos e o script inline sem o teto de 7 s

**Decisão**: o script inline de `index.html` passa a ser:

- `js` sempre; `motion` só sem "reduzir movimento" (como hoje); **`booting` sempre com JavaScript**
  (antes, só com movimento): a porta vale para todos (FR-010, FR-012).
- **2055 ms** (`GATE_LATEST_START_MS`, o mesmo limite da 004): sem o app montado, `booting` sai e não
  haverá porta (FR-011). O número deixa de ser derivado da sequência: agora é a regra de nunca
  cobrir de repente uma página que o visitante já vê, e a capa só existe até aqui sem o app.
- **3900 ms** (`APP_FAILED_MS`, sem mudança): sem o app, `app-failed`; **e**, com o app montado mas
  sem `html.gate` (a porta não chegou a aparecer, por exemplo por erro no componente), `booting` sai.
- O **teto de 7000 ms sai**: com a porta na tela (`html.gate`), a capa fica até o fim do acesso
  (constituição v3.0.0).

O `AccessGate`, ao montar: se `booting` não existe mais ou `performance.now() > 2055`, tira `booting`
e não aparece; senão, põe `html.gate`, mostra a porta e começa a consulta do IP (R5). No fim do acesso,
tira `gate` e `booting` juntos.

**Racional**: a constituição v3.0.0 tira o teto, mas mantém "se o JavaScript chegar tarde demais, a
porta não aparece". Os 2055 ms já eram o instante em que a capa sai sem o app. Manter o mesmo número
evita uma nova janela de risco. A segurança aos 3900 ms troca o teto de 7 s: sem ela, um erro no
componente deixaria a página coberta para sempre.

**Alternativas**: manter o teto de 7 s só para quando a porta não apareceu (equivale à segurança dos
3900 ms, só que mais tarde); deixar o app decidir tudo sem script inline (a capa precisa existir
antes do primeiro paint, e o app pode nem carregar).

## R3 — Sessão guiada pelo relógio, com o TextType vendorizado

**Decisão**: vendorizar o TextType em `src/components/vendor/vue-bits/TextType.vue`, com
modificações locais registradas no cabeçalho:

1. **Sem GSAP**: o cursor pisca com a classe `.cursor` do site (`@keyframes blink`), que já para com
   movimento reduzido. O caractere padrão do cursor passa a ser `▊`.
2. **Guiado pelo relógio**: a quantidade de caracteres visíveis é
   `min(n, floor((agora − início − initialDelay) / typingSpeed) + 1)`, recalculada a cada tique de
   16 ms. Um timer atrasado não acumula atraso (o mesmo princípio do R4 da 004). A prop nova
   `startAt` (instante `performance.now()` em que a digitação deveria começar; padrão: a montagem)
   deixa a sessão inteira num relógio só.
3. **Evento `complete`**, emitido uma vez quando o texto termina (o original só avisava no loop de
   apagar).
4. **`instant`**: mostra o texto inteiro na hora, sem cursor piscando (movimento reduzido, FR-012).
5. **`reserve`**: o resto do texto ainda não digitado fica no DOM com `visibility: hidden`, e a linha
   já ocupa o tamanho final (R4).
6. `loop` desligado por padrão aqui. As props de apagar e repetir continuam, mas a sessão não as usa.

A linha do tempo fica em `src/lib/boot.ts`, ainda pura e testável: `SESSION_LINES` descreve cada linha
(instante em que aparece, trechos fixos, trecho digitado com velocidade), e `sessionAt(ms)` diz
quais linhas estão visíveis. O `AccessGate` mede o relógio desde o início da sessão (o fim da animação
de abrir), mostra as linhas pelo `sessionAt` e entrega a cada `TextType` o seu
`startAt = início + at`. A sessão termina em `início + SESSION_MS`, mesmo com timers atrasados.

**Ritmo (FR-020)**: todas as velocidades e pausas da 004 × 0,7:

| Trecho | 004 | 005 |
|--------|-----|-----|
| `ssh viper@portfolio` | 42 ms/caractere | 29 ms |
| pausa → "Conectando" | 250 ms | 175 ms |
| pausa → senha | 500 ms | 350 ms |
| `••••••••` | 55 ms/caractere | 38 ms |
| pausa → "Autenticado" | 450 ms | 315 ms |
| pausa → "Last login" | 300 ms | 210 ms |
| pausa → `./iniciar_portfolio.sh` | 400 ms | 280 ms |
| `./iniciar_portfolio.sh` | 24 ms/caractere | 17 ms |
| pausa final | 350 ms | 245 ms |
| **total** | **3895 ms** | **2720 ms** (69,8%) |

Instantes: ssh 0; conectando 697; senha 1047; autenticado 1628; last login 1838; comando 2118; fim
2720. Do clique à página descoberta: 320 ms (abrir) + 2720 ms + 550 ms (saída) = **3590 ms ≤ 4 s**
(SC-002, constituição v3.0.0).

**Minimizada (clarify Q1)**: o relógio não para. A janela só some (`display: none`), e os
`TextType` continuam montados e calculando pelo relógio. Ao reabrir, eles mostram o ponto certo. Se
o fim chegar com a janela minimizada, a saída acontece igual.

**Racional**: o pedido é usar o TextType. Usá-lo como está traria o GSAP (~25 KB gzip) só para o
cursor, e a corrente de `setTimeout` por caractere atrasaria a sessão sob carga. A 004 mediu timers
~400 ms atrasados no headless (R4 da 004). Guiado pelo relógio, o componente mantém a API e o visual
do TextType, sem dependência e sem deriva.

**Alternativas**: TextType original com GSAP (dependência nova só pelo cursor); manter o `bootFrame`
da 004 sem TextType (não atende ao item 5); um TextType por sessão inteira com várias frases (o
TextType apaga entre frases, e as linhas da sessão têm cores e trechos fixos).

## R4 — Janela de tamanho fixo: reserva com o texto final invisível

**Decisão**: a janela tem largura `min(var(--gate-window-width), 100% − 2rem)` (token novo, 680 px,
a largura do painel da 004). A altura sai do próprio conteúdo: **todas as seis linhas existem no
DOM desde o primeiro quadro**, com o texto final. As linhas ainda não visíveis e o resto não
digitado de cada `TextType` ficam com `visibility: hidden`. A caixa nasce com a altura e as quebras de
linha finais, para qualquer largura e qualquer IP. O cursor `▊` tem largura de layout zero
(`display: inline-block; width: 0`, com o glifo transbordando para a direita, sobre o fantasma
invisível ou o padding), então a quebra de linha com ou sem cursor é a mesma.

**Racional**: com o painel da 004 crescendo linha a linha, a forma de "não crescer" mais robusta é
reservar o texto final. Uma altura fixa em `lh` erraria com IPs de tamanhos diferentes e com as
quebras a 320 px (a linha do `Last login` quebra em 2 nessa largura). O IP fica fixo do início ao fim
de cada sessão (R5).

**Alternativas**: altura fixa calculada (frágil às quebras); `min-height` grande (sobra espaço vazio no
desktop); rolagem interna (proibida pelo FR-005).

## R5 — IP do visitante: ipify, IPv4, com `127.0.0.1` de reserva

**Decisão**: `src/lib/visitor-ip.ts`, com `lookupVisitorIp()`. A consulta é
`fetch('https://api.ipify.org?format=json', { credentials: 'omit', referrerPolicy: 'no-referrer',
cache: 'no-store', signal })`, com um `AbortController` de 5 s. Ela começa quando a porta aparece
(FR-015). O resultado é validado como IPv4 (quatro octetos de 0 a 255). Fora disso (erro, tempo
esgotado, resposta inválida), devolve `null` em silêncio: nenhum `console.*` do site. A sessão lê o
valor no **início de cada tentativa**: se já chegou, usa; senão, `FALLBACK_IP = '127.0.0.1'`, sem
esperar. Uma nova tentativa depois de fechar já usa o IP, se ele tiver chegado. O IP fica só na
memória da página: não é guardado nem enviado a mais nada.

Fatos verificados em 2026-10-09: `api.ipify.org` responde `{"ip":"…"}` (23 bytes) com
`access-control-allow-origin: *` (CORS liberado para o `github.io`), sem chave e sem cadastro.

**Racional**: o ipify é o serviço público mais usado para isso, responde só o IP (nada de
geolocalização), aceita CORS e devolve IPv4, como no exemplo do autor (`X.X.X.X`). O
`no-referrer` não entrega ao serviço a página de origem, e o `credentials: 'omit'` não manda cookies.
O serviço recebe o IP de qualquer forma, ao receber o pedido (fato registrado na spec, aceito no Q3).
No Princípio III, é a "exceção justificada" que degrada com elegância. A falha de rede que o próprio
navegador escreve no console (ex.: `ERR_BLOCKED_BY_CLIENT` com bloqueador) não é erro do site: o
código não lança nem registra nada (spec, FR-015).

**Alternativas**: `ipv4.icanhazip.com` (texto puro, também com CORS; mantido como plano B caso o ipify
saia do ar, sem uso agora); `api64.ipify.org` (devolveria IPv6 em redes com IPv6, fora do pedido);
WebRTC (os navegadores mascaram o IP local com mDNS e não revelam o público sem um servidor STUN de
terceiro); serviços com geolocalização (ipapi, ipinfo: mais dados pessoais que o necessário e limites
de uso).

## R6 — Versão do `package.json` no build

**Decisão**: `package.json` e a raiz do `package-lock.json` passam de `0.0.0` a **`2.4.0`**. O
`vite.config.ts` e o `vitest.config.ts` leem o `version` (`readFileSync` + `JSON.parse`) e o injetam
como a constante `__PORTFOLIO_VERSION__` (`define`), declarada em `src/env.d.ts`.
`src/lib/boot.ts` exporta `displayVersion(v)` (`'2.4.0'` → `'v2.4'`) e a linha 4 da sessão usa
`Portfolio ${displayVersion(__PORTFOLIO_VERSION__)}`. Um teste de unidade compara a versão exibida
com o `package.json` (SC-004).

**Racional**: o `define` põe no bundle só a string da versão. Importar o `package.json` no código do
cliente arriscaria levar o arquivo inteiro para o bundle (dependências e scripts). A política "cada
feature sobe a versão menor" (FR-016) fica registrada no README.

**Alternativas**: `import { version } from '../package.json'` (exige `resolveJsonModule` e depende do
tree-shaking do JSON); tags do git com `git describe` no build (o checkout do Actions é raso, e sem
tag a versão some, como dito ao autor no clarify).

## R7 — Acessibilidade e foco da porta

**Decisão**:

- A camada da porta é `role="dialog"` com `aria-modal="true"` e `aria-label="Acesso ao portfólio"`.
  Enquanto ela existe, todo irmão dela dentro de `#app` (navegação, hero, `main`, rodapé, dock,
  scanlines) recebe `inert`, que o `AccessGate` tira no fim. Somado à capa e ao `overflow: hidden`
  do `html.booting`, isso dá o FR-002 (nada visível, clicável, focável ou lido).
- Ao aparecer, o foco vai para o ícone (`Abrir acessar_portfolio.sh`), com
  `aria-describedby` apontando para a dica (o leitor de tela lê "clique no ícone para conectar").
- Ao abrir a janela, o foco vai para "Minimizar acessar_portfolio.sh". Ao minimizar ou fechar,
  volta para o ícone (como no `DesktopWindow`, FR-007, FR-008).
- O texto da sessão é decorativo (`aria-hidden`, como o boot da 004). Uma região `role="status"`
  só para leitores de tela anuncia "Conectando ao portfólio…" quando a sessão começa e "Conexão
  encerrada" quando ela é fechada.
- No fim, o foco vai para o alvo da âncora (`location.hash`), se houver; sem âncora, volta ao início
  do documento (`blur` do controle focado), como numa carga normal: o primeiro Tab chega à navegação,
  que vem antes do hero no DOM. (Revisão na implementação: focar o `#home` fazia o Tab pular a
  navegação.) Na âncora, o
  `tabindex="-1"` é posto só para isso e sai no `blur`, e o foco é dado com `preventScroll` depois
  de rolar até a âncora. O `:focus-visible` não desenha anel num foco dado por programa depois de um
  clique.
- Sem atalhos de teclado próprios: Tab, Enter e Espaço nos botões bastam. O Esc não fecha (fechar
  encerra a tentativa e não deve acontecer por engano).

**Racional**: a constituição v3.0.0 exige a porta operável por teclado e por leitor de tela e a página
inalcançável por trás. O `inert` é suportado por todos os navegadores evergreen e resolve foco,
clique e árvore de acessibilidade de uma vez. O "Conectando" anunciado mostra a quem não vê a tela
que algo está acontecendo nos ~3 s da sessão.

**Alternativas**: `aria-hidden` nos irmãos (não bloqueia o foco); armadilha de foco manual (mais
código, e o `inert` já resolve); anunciar cada linha da sessão (verborrágico).

## R8 — Dica e contraste sobre o Faulty Terminal

**Decisão**: a dica é um `<p class="gate-hint mono">` esmaecido (`--text-dim`), com
`# clique no ícone para conectar`. Quando `matchMedia('(hover: none) and (pointer: coarse)')` casa
(tela de toque sem mouse), o texto vira `# toque no ícone para conectar`. O ícone e a dica ficam sobre
uma penumbra radial (`::before` do grupo, `radial-gradient(closest-side, var(--boot-panel) 70%,
transparent)`), a mesma técnica do hero da 004. Com `--boot-panel` a 92% de `--bg`, o `--text-dim`
fica ≥ 4,5:1 até sobre o dígito mais aceso (medido na 004, R2). O contraste é conferido por pixel no
e2e (`support/contrast.ts`), em 10 quadros.

**Racional**: o painel retangular da 004 era o "card que cresce" que o autor quer tirar. A penumbra
radial dá o contraste sem desenhar uma caixa em volta do ícone.

**Alternativas**: sombra de texto (não garante 4,5:1); painel retangular (volta ao visual rejeitado).

## R9 — Ícones Lucide nos controles das janelas

**Decisão**: o `TerminalBar` troca `−`, `□` e `✕` por `Minus`, `Maximize2` e `X` do `@lucide/vue` (já
instalado), com 12 px e traço 2,5, `display: block`, dentro do círculo de 20 px que já é
`display: grid; place-items: center`. Os três ícones Lucide são simétricos no `viewBox` de 24 px, e
o centro do SVG cai no centro do círculo. O ajuste `.t-max { padding-bottom }` sai. O mesmo vale nos
modos decorativo (HTML pré-renderizado, sem JavaScript) e funcional, e no terminal da dock. A prop
nova `maximizable` (padrão `true`) tira o `□` só na janela da porta.

**Racional**: os glifos da fonte assentam na linha de base e cada um tem uma altura, daí o
descentramento. Ícones SVG simétricos centram por construção, e o e2e mede (SC-005).

**Alternativas**: corrigir cada glifo com `padding` (frágil a fontes e tamanhos); SVG desenhado à mão
(o autor pediu o Lucide).

## R10 — Ícone do Contato à esquerda e FLIP que parte do layout novo

**Decisão**: o centralizado de 720 px do `.contact-slot` passa a valer só com a janela aberta
(`[data-window-state="open"]`). Minimizada ou fechada, a caixa ocupa a largura da seção, e o ícone
fica na borda esquerda, como no Sobre.

Com isso, o `hide()` do `DesktopWindow` precisa de um FLIP que **parta da posição do quadro depois
da mudança de layout**. Hoje o quadro que encolhe vira `position: absolute` no canto da caixa, e a
animação supõe que ele continua onde estava. Se a caixa muda de largura (Contato) ou de lugar
(projetos, R11), ele "pula". A animação passa a medir o retângulo do quadro já no layout novo
(`now`) e a ir de `toward(now, first)` (onde ele estava) a `toward(now, alvo)` (o ícone).

**Racional**: a mesma correção serve aos itens 3 e 7 e mantém a animação de 320 ms fiel ao ponto de
partida em qualquer layout.

**Alternativas**: deixar o centralizado no quadro interno (o FLIP escalaria a caixa de largura total,
e a janela terminaria menor que o ícone); um ícone com margem negativa (acoplado à largura da
seção).

## R11 — Ícones dos projetos lado a lado

**Decisão**: a `.projects-grid` (hoje uma grade de uma coluna) vira
`display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 2)`, com `align-items: flex-start`.

- O item com a janela aberta (`li:has(> .desktop-window[data-window-state="open"])`) ocupa a linha
  toda (`flex: 1 0 100%`) e ganha `margin-block: calc(var(--spacing) * 1.8)`. Entre duas janelas:
  7,2 + 8 + 7,2 = 22,4 px, o espaço de hoje (FR-027).
- Os demais itens ficam com `flex: 0 0 auto`, com a largura do ícone (8rem = 128 px). Entre ícones: 8
  px na horizontal e na vertical, menor que entre janelas (FR-026).
- A margem de cima da lista cai 7,2 px, para a primeira janela continuar no mesmo lugar.

Quantos cabem (largura útil = tela − 3rem de padding da seção, até 1052 px):

| Tela | Largura útil | Ícones por linha | 6 minimizados |
|------|--------------|------------------|---------------|
| 320 px | 272 px | 2 (264 px) | 3 linhas |
| 768 px | 720 px | 5 (672 px) | 2 linhas |
| 1024 px | 976 px | 7 (cabem os 6, 808 px) | 1 linha |
| 1366/1920 px | 1052 px | 7 | 1 linha |

O FLIP do R10 cobre o caso em que o projeto minimizado sobe para a linha dos ícones anteriores. A
largura absoluta do quadro que encolhe nunca produz rolagem horizontal: a área rolável conta a caixa
transformada, que começa na posição antiga e termina no ícone (o e2e confere `scrollWidth` durante a
animação).

**Racional**: `:has()` deixa a regra no CSS da seção, sem o `ProjectCard` precisar avisar o estado. É
suportado por Chrome 105+, Safari 15.4+ e Firefox 121+. Sem suporte, a lista cai em itens de largura
automática e as janelas abertas continuam visíveis (degradação aceitável). As contagens batem com o
clarify (2 / 5 / 6).

**Alternativas**: grade de colunas fixas (rejeitada no clarify); o `ProjectCard` emitir o estado para
a seção (mais código para o mesmo resultado).

## R12 — Dot Field vendorizado, com redesenho só quando muda

**Decisão**: vendorizar `Backgrounds/DotField` em `src/components/vendor/vue-bits/DotField.vue` com
os parâmetros do autor (Dot Radius 2, Cursor Force 0, Bulge Only off, Sparkle on, Glow Radius 80,
demais padrões: espaçamento 14, raio do cursor 500, Bulge Strength 67, onda 0). Modificações locais,
registradas no cabeçalho:

1. **Ouvintes removidos de verdade**: o original chama `removeEventListener` com funções novas e não
   tira nada (vazamento, FR-033).
2. **Desenho só quando muda**: com Cursor Force 0 e sem onda, os pontos não se movem. O canvas só
   muda quando o sorteio do Sparkle troca (a cada 8 quadros) ou quando a tela muda de tamanho. O
   laço continua a 60 quadros por segundo para o halo, mas o canvas só é redesenhado quando
   `frameCount >> 3` muda (~7,5 vezes por segundo), com o mesmo resultado visual.
3. **Parado fora da tela e com a aba oculta**: um `IntersectionObserver` no hero liga e desliga o
   laço e o `setInterval` da velocidade do mouse (o `requestAnimationFrame` já para com a aba
   oculta).
4. **Cores dos tokens**: `tokenRgb` lê `--dots-from`, `--dots-to` e `--dots-glow` (aliases de
   `--purple-glow`, `--green-bright` e `--purple-light`), e a transparência vem dos tokens
   `--dots-from-alpha`, `--dots-to-alpha` e `--dots-glow-alpha`, montando `rgba()`, que todo canvas
   entende (`color-mix()` no `fillStyle` não é garantido em todos os navegadores).
5. Sem as classes do Tailwind do original (CSS com escopo), `aria-hidden` na raiz, `pointer-events:
   none` (o mouse é lido na `window`, como no original).

O `HeroSection` carrega o `HeroDots.vue` (o wrapper que lê os tokens) num pedaço à parte, só no
cliente, com movimento e depois da porta (`useBootDone`), **sem exigir WebGL** (o Dot Field é canvas
2D). Com "reduzir movimento", inclusive ligado no meio da visita (`useMotion` é reativo), o
componente sai e ficam os degradês estáticos (FR-033). A penumbra `--hero-scrim` continua sob o texto
do hero (FR-032).

**Racional**: o canvas 2D com ~8 mil arcos por quadro custa pouco, mas redesenhar 60 vezes por
segundo algo que muda 7,5 vezes é desperdício de bateria. O resultado na tela é idêntico. As
transparências iniciais (0,45 / 0,35 / 0,35) seguem a ordem de grandeza dos padrões do componente
(0,35 / 0,25) e serão calibradas por screenshot e pela medida de contraste.

**Alternativas**: copiar como está (vazamento de ouvintes, canvas redesenhado à toa, cores fixas em
verde); rodar num worker como o CRT (desnecessário: o canvas 2D sem WebGL não trava os timers, e o
hero só anima depois da porta).

**Calibração (T031, 2026-10-09)**: com 0,45 / 0,35 / 0,35, os pontos de 2 px ficavam quase cinza, e
o degradê roxo → verde mal se percebia nos screenshots de 1366 × 800 e 390 × 844 (GPU real). Valores
finais: `--dots-from-alpha: 0.7`, `--dots-to-alpha: 0.55`, `--dots-glow-alpha: 0.4`. O texto do hero
continua ≥ 4,5:1 em 10 quadros nas duas larguras (`hero-dots.spec.ts`), porque a penumbra
`--hero-scrim` fica sob o texto.

## R13 — Saem o CRT Warp e a chuva Matrix

**Decisão**: removidos `src/components/vendor/vue-bits/CrtWarp.vue`,
`src/components/terminal/HeroCrt.vue`, `src/lib/scenes/crt.ts`, `src/workers/crt.worker.ts`,
`src/lib/matrix-rain.ts`, `tests/unit/matrix-rain.spec.ts` e `tests/e2e/hero-crt.spec.ts` (que vira
`hero-dots.spec.ts`). Ficam `src/lib/webgl.ts`, `src/lib/scene-host.ts` e `src/lib/scenes/faulty.ts`
(o Faulty Terminal da porta). O `tokenRgb` e o `hasWebGL` continuam no `webgl.ts`. O cabeçalho do
arquivo deixa de citar o CRT, e o `hasWebGL` passa a ser usado só pela porta. Os textos do
`DESIGN.md` e do README sobre CRT e Matrix são reescritos.

**Racional**: FR-028 ("o código que só servia a eles MUST sair do site").

## R14 — Testes: IP simulado, entrar pela porta e o que muda nos e2e

**Decisão**:

- **Fixture comum** `tests/e2e/support/test.ts`: reexporta `test` e `expect` do Playwright com uma
  fixture automática que responde `https://api.ipify.org/**` com `{"ip":"203.0.113.7"}` (faixa de
  documentação TEST-NET-3). Nenhum teste depende da rede, e o IP é previsível. Todos os specs passam
  a importar dali. Um teste próprio usa `route.abort()` para o caso de falha.
- **`enterPortfolio(page)`** (troca o `waitBootEnd`): espera o ícone, clica, espera `booting` e a porta
  saírem; sem porta (JavaScript atrasado), volta na hora.
- **Projeto `webgl`** do Playwright: `boot`, `motion` e `weight` continuam (Faulty Terminal na
  porta); `hero-crt` sai da lista, e o `hero-dots` roda no projeto comum (canvas 2D).
- **Novos**: `access-gate.spec.ts` (estados, minimizar continuando, fechar e tentar de novo, foco,
  `inert`, movimento reduzido, JS atrasado, âncora, 320 px, contraste da dica), `session.spec.ts` (ou
  dentro do `boot.spec.ts`: linhas, IP simulado, falha → `127.0.0.1`, versão, tempo do clique à
  página com CPU 4× mais lenta), `window-controls.spec.ts` (centro dos ícones ±0,5 px),
  `minimized-layout.spec.ts` (Contato ±1 px; projetos 3/2/1 linhas; sem rolagem horizontal durante a
  animação), `hero-dots.spec.ts` (canvas presente, degradê roxo → verde, halo com o mouse, parado fora
  da tela, contraste em 10 quadros, nada com movimento reduzido).
- **Unidade**: `boot.spec.ts` reescrito (linhas, instantes, total ≤ 2900, proporção 0,7,
  `displayVersion`, prazos do script inline), `visitor-ip.spec.ts` (válido, inválido, erro, tempo
  esgotado, sem `console`), `TextType.spec.ts` (componente: relógio, `startAt`, `complete` uma vez,
  `instant`, `reserve`), `AccessGate.spec.ts` (componente: transições de estado com timers falsos),
  `DesktopWindow.spec.ts` (ajuste do ícone extraído).
- A checagem "sem requisição a terceiros" (`weight.spec.ts`) passa a aceitar só o `api.ipify.org`
  além dos badges.

**Racional**: a porta muda a entrada de todos os e2e (hoje 13 arquivos esperam o boot sozinho). A
fixture garante que nenhum teste faça um pedido real ao ipify. Cada cenário do quickstart tem teste.

## R15 — Peso

**Decisão**: entram no pedaço inicial o `AccessGate` (substitui o `BootScreen`), o `TextType`,
o `DesktopIcon` (extraído, sem código novo), `flip.ts` (extraído), `visitor-ip.ts` e três ícones
Lucide. Estimativa: +2 a +3 KB gzip. Saem `bootFrame` e as constantes do teto. O CRT e a chuva, que
iam num pedaço à parte, dão lugar ao `HeroDots` + `DotField` (~2 KB gzip, também à parte, carregado
depois da porta). A linha de base é medida no início da implementação (a 004 fechou em 88,5 KB gzip
de HTML + CSS + JS iniciais). Teto desta feature: **+3 KB gzip** sobre a linha de base, e o total
continua ≤ 500 KB (SC-009). A consulta do IP soma 23 bytes de resposta.

**Racional**: o Princípio III pede o impacto de cada item no peso. Os pedaços à parte não contam no
inicial porque só são pedidos depois da porta.

**Linha de base medida (T001, 2026-10-09, build da 004)**: `gzip -9c` de `dist/index.html` 17.130 B,
`dist/assets/app-*.js` 60.891 B e `dist/assets/app-*.css` 10.550 B, total **88.571 B (86,5 KB)**.
Teto da 005: **91.643 B** (+3 KB = 3.072 B). Pedaços à parte da 004 que saem: `HeroCrt` 3,5 KB,
`crt` 5,4 KB e `crt.worker` 8,6 KB (sem compressão).

**Medida final (T040, 2026-10-09)**: HTML 17.418 B, JS 63.368 B, CSS 10.832 B, total **91.618 B**
(+3.047 B, 25 B abaixo do teto). O crescimento vem da porta (`AccessGate`, `TextType`, `DesktopIcon`,
`visitor-ip`, `flip`) e dos três ícones Lucide nos controles. À parte, carregados depois da porta:
`HeroDots` 2,6 KB + 0,2 KB de CSS (no lugar de `HeroCrt` + `crt` + `crt.worker`); `faulty` 2,3 KB e o
worker 3,6 KB, sem mudança. A margem é pequena: a próxima feature que mexer no pedaço inicial
precisa de linha de base própria.
