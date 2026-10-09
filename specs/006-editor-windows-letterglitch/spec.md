# Feature Specification: Janelas de editor com Branched Menu, Letter Glitch no hero, Lattice Loader e correções das janelas

**Feature Branch**: `001-vue-resume-refactor` (nenhum branch criado: não há hook `before_specify`
configurado, e a 006 parte do estado da 005, que ainda não foi para a `main`)

**Created**: 2026-10-09

**Status**: Draft

**Input**: User description: dez pedidos do autor, enviados de uma vez:

1. "Nas seguintes seções (Experiencia / Challenges / Comunitario), siga esse padrão da imagem
   `Screenshot from 2026-10-09 10-59-26.png` (no estilo terminal com janela de editor de texto estilo
   VSCode aberto) para poder demonstrar a sequência. Para isso, use o Branched Menu para mudar dentro
   do mesmo terminal (que também terá as mesmas funções que os outros), o Branched Menu deverá usar
   radius 0px, o restante pode ser o padrão do componente ou do site
   (https://vue-bits.dev/micro/branched-menu). Diferente dos outros terminais que somente minimizam ou
   fecham, esse poderá ser maximizado, deixando grande parte da tela coberta pelo terminal e dando
   desfoque na tela principal. Para não jogar simplesmente fora o que já existe, ao maximizar, dentro
   do terminal, deverá estar presentes os cards atuais da seção maximizada."
2. "No hover do terminal da dock, no tooltip, adicione um customizado com base no tema do site e
   invés de ser `viper@portfolio:~$`, coloque o Ctrl + Alt + T"
3. "Alterar o favicon do site para o ícone de terminal (o mesmo da dock) na cor verde do tema com o
   glow/shadow de fundo em roxo do tema"
4. "Altere o fundo do hero para Letter Glitch, não gostei do que eu te pedi. Use as cores padrão do
   tema. Glitch Speed: 10; Smooth Animation: on; Show Center Vignette: on; Show Outer Vignette: on.
   Use a vinheta do background do Letter Glitch invés da que já está"
5. "Diminua a intensidade da vinheta do item da tela de carregamento, deixando similar com a vinheta
   de fundo do Letter Glitch."
6. "Corrija a curvatura do background da tela do mobile, diminuindo para ficar levemente curva."
7. "Quando o carregamento finaliza, ele não abre diretamente no Hero. Faça com que isso volte a
   ocorrer novamente."
8. "Ao fechar e abrir novamente um terminal, ele deve abrir o terminal e então carregar o comando. O
   que notei é que ele pisca todo o conteúdo e recarrega, isso não deve acontecer."
9. "Para os terminais que tem o maximizar e que não serão usados para maximizar, deixe o maximizar
   sem hover e desativado (como se tivesse deactivated)."
10. "O `[ OK ] Inicializando portfolio.service...` deve trocar lugar para o Lattice Loader que
    receberá Done assim que tudo do Hero carregar (podendo ser 3 segundos de carregamento padrão).
    Enquanto ele carrega, o texto deve ser: Inicializando portfolio.service. Quando estiver Done, o
    texto deve ser: portfolio.service carregado com sucesso! Depois de 3 segundos, o Lattice Loader
    deverá sumir (mas não deve afetar responsabilidade). Grid: 3x3; Gap: 1px; Idle Opacity: 0.15;
    Show Timer: off; Glow: on; Shape: square. A cor deve ser do roxo do tema no carregamento. Done
    fica em verde do tema."

## Contexto

### Situação atual

- **Experiência** (`#experiencia`, `$ git log --carreira --reverse=false`): linha do tempo vertical
  com os 5 vínculos, do mais recente ao mais antigo; cada um é um cartão (período, selo `HEAD` no
  vínculo atual, cargo, empresa e local, resumo, resultados e chips de tecnologia com ícone).
- **Challenges** (`### challenges/` dentro de `#projetos`, `$ ls -lt ~/projetos/challenges`): 7
  cartões, do mais recente ao mais antigo (data de criação, nome, descrição, stack, link do
  repositório).
- **Comunitário** (`### comunitario/` dentro de `#projetos`, `$ cat ~/projetos/comunitario/*.md`):
  1 cartão (Gincana Junina: data, nome, instituição e local, resumo, papel, fonte com link).
- Esses cartões **não** são janelas: não minimizam, não fecham e não têm barra de título. As janelas
  de terminal do site (Sobre `sobre.txt`, os 6 projetos e Contato `contato.sh`) minimizam e fecham
  até um ícone (004); o terminal da dock só fecha; a janela `acessar_portfolio.sh` da porta só
  minimiza e fecha (005). Em todas, o `□` (maximizar) é só desenho, mas reage ao hover como os
  botões de verdade (fica mais claro).
- **Janela fechada e reaberta** (004 FR-005): a janela cresce a partir do ícone já com todo o
  conteúdo visível; quando a animação termina, o conteúdo some e os comandos são digitados de novo.
  O visitante vê o conteúdo inteiro piscar antes de "recarregar".
- **Fim da porta de acesso** (005 FR-009): sem âncora no endereço, a página fica onde o navegador a
  deixou. Medido em 2026-10-09: na primeira visita, o topo (hero); ao **recarregar** depois de rolar,
  o navegador restaura a rolagem anterior por baixo da porta (ex.: 2.500 px), e a página aparece no
  meio. Com âncora no endereço (que os links do menu, os botões do hero e o `find` do terminal da
  dock deixam lá), a página abre na seção da âncora.
- **Hero**: fundo Dot Field (005), com uma penumbra escura sob o texto (`--hero-scrim`, 80%) para o
  contraste; sem movimento ou sem JavaScript, degradês radiais estáticos. A primeira linha é o texto
  fixo `[ OK ] Inicializando portfolio.service ...` em verde.
- **Porta de acesso** (005): o Faulty Terminal ao fundo, com curvatura 0,2 em todas as telas; no
  celular em retrato, a mesma curvatura, aplicada a uma tela alta e estreita, curva as linhas do
  fundo bem mais que no desktop. Sob o ícone e a dica há uma penumbra quase opaca (`--boot-panel`,
  92% do fundo, até ~5–7 rem além do ícone).
- **Dock**: o botão do terminal tem a dica nativa do navegador (`title`) com `viper@portfolio:~$`.
- **Favicon**: um SVG com o texto `>_` na fonte padrão do navegador, preto (quase invisível em abas
  escuras).
- **Versão**: `package.json` em `2.4.0` (exibida `v2.4` na sessão da porta, 005 FR-016).

### Fatos levantados em 2026-10-09 (Vue Bits, commit `07c0f76`)

- **Branched Menu** (`Micro/BranchedMenu`): menu em árvore. Seções com título que dobram e
  desdobram; cada seção tem filhos, ligados a um tronco vertical por ramos; o filho ativo recebe a cor
  de destaque, o ramo dele é desenhado até ele e um marcador desliza no trilho. Parâmetros: cores
  (tinta, destaque, linhas), largura máxima 240 px, altura da linha 36 px, recuo 40 px, tronco 14 px,
  **radius 10 px** (a curva de cada ramo; com 0, o ramo vira um ângulo reto), espessura 1,5, fonte
  14 px, desenho 400 ms, dobra 300 ms. Os ícones dos filhos vêm do Hugeicons, biblioteca que o site
  não usa (o site usa o Lucide). Emite "selecionou" e "dobrou/desdobrou".
- **Letter Glitch** (`Backgrounds/LetterGlitch`): grade de letras e símbolos (A–Z, `!@#$&*()-_+=/[]{};:<>,`
  e 0–9) desenhada em canvas 2D (sem WebGL), em monoespaçada de 16 px, células de 10 × 20 px. A cada
  "Glitch Speed" ms, ~5% das letras trocam de caractere e de cor, sorteada entre as "glitch colors"
  (padrão: verde-escuro `#2b4539`, verde `#61dca3` e azul `#61b3dc`); com "Smooth", a cor muda aos
  poucos (~20 quadros). "Center Vignette" escurece o centro (preto 80% no centro, some aos 60% do
  raio); "Outer Vignette" escurece as bordas (de 60% do raio até preto pleno nos cantos). Com Glitch
  Speed 10, há troca de letras em praticamente todo quadro. O original não pausa fora da tela nem com
  a aba em segundo plano, e a transição suave para de funcionar depois da primeira troca (converte a
  cor para `rgb()` e depois espera hexadecimal).
- **Lattice Loader** (`Micro/LatticeLoader`): indicador de carregamento com uma grade de células
  (3 × 3 ou 4 × 4) que acendem em onda (padrão 3 × 3: "orbit") e um rótulo ao lado. Estados
  "working" (onda na cor principal + rótulo), "done" (as células formam um ✓ na cor de "done" + rótulo
  de "done") e "error". Parâmetros: célula 6 px, gap 2 px, fonte 14 px, passo 90 ms, opacidade ociosa
  0,15, brilho opcional, forma redonda ou quadrada, cronômetro opcional. Anuncia o estado num
  `role="status"`. Com "reduzir movimento", a onda fica mais lenta e sem atraso entre as células.
- **Licença do Vue Bits**: MIT + Commons Clause (o mesmo regime dos componentes já vendorizados).

### Relação com a constituição (v3.0.0)

- **Princípio I (Fidelidade ao Currículo)**: nenhum dado muda. A visão de editor exibe os mesmos
  fatos dos cartões, com os períodos no formato único da página.
- **Princípio II (Projetos Demonstráveis)**: cada challenge continua com o link do repositório e o
  projeto comunitário com a fonte, nas duas visões (editor e cartões), abrindo em nova aba com
  `rel="noopener noreferrer"`. A ordem dos challenges (mais recente primeiro) se mantém.
- **Princípio III (Saída Estática)**: os três componentes do Vue Bits são vendorizados (nenhum pedido
  ao Vue Bits durante a visita) e adaptados aos tokens; o Hugeicons não entra (os ícones, se houver,
  vêm do Lucide, já usado). Sem JavaScript, todo o conteúdo das três seções continua no HTML e
  visível (FR-012). O favicon é um arquivo estático do site. Nenhum recurso novo de terceiros.
- **Princípio IV (Acessibilidade e Desempenho)**: a janela maximizada é um diálogo operável por
  teclado e leitor de tela (foco dentro dela, Esc restaura, o resto da página inalcançável enquanto
  ela está maximizada); o Letter Glitch e o Lattice Loader respeitam "reduzir movimento"; o texto do
  hero mantém 4,5:1 sobre o Letter Glitch; o Lattice Loader não bloqueia nem atrasa nenhum conteúdo;
  sem rolagem horizontal em nenhuma largura; console sem erros.
- **Princípio V (Identidade Visual Coerente)**: as janelas de editor reutilizam a janela de terminal
  (barra de título, controles, ícone de área de trabalho) e as cores vêm dos tokens. O "radius 0px" do
  Branched Menu é escolha do autor.

### Requisitos de features anteriores que esta feature substitui

- **005 FR-028 a FR-031 e FR-033** (Dot Field no hero): substituídos pelo Letter Glitch (FR-029 a
  FR-034 desta spec). O 005 FR-032 (contraste do texto do hero) continua valendo (FR-032).
- **005 FR-001**, quanto à penumbra sob o ícone e a dica da porta: fica mais leve (FR-035); o
  contraste mínimo de 4,5:1 continua.
- **004 FR-028** (parâmetros do Faulty Terminal): a curvatura muda no celular (FR-036).
- **004 FR-005** (janela fechada reabre "recarregando"): continua, mas a janela abre já sem o
  conteúdo e só então digita (FR-023).
- **005 FR-009** (foco e posição no fim da porta) e, com JavaScript, **001 SC-010** e **004 FR-015**
  quanto ao endereço com `#secao` na carga da página: a página abre sempre no hero, e a âncora do
  endereço é descartada (FR-020, FR-021; Q3). As âncoras continuam funcionando nos links da página, no
  `find` do terminal e sem JavaScript.
- **004 FR-001 e 005 FR-024** ("o `□` continua decorativo"): continua decorativo nas janelas que não
  maximizam, agora com aparência de desativado (FR-025); nas janelas de editor, maximiza (FR-013).
- **Linha `[ OK ] Inicializando portfolio.service ...`** do hero (001): substituída pelo Lattice
  Loader (FR-037 a FR-044).
- **Cartões de experiência, challenges e comunitário** (001, 002 FR-016 a FR-019): continuam
  existindo, dentro da janela maximizada (FR-016) e sem JavaScript (FR-012).

## Clarifications

### Session 2026-10-09 (specify)

- Q1: Quantas janelas de editor (Experiência é uma seção; Challenges e Comunitário são sub-partes de
  Projetos)? → A: Uma por seção (3): Experiência, Challenges e Comunitário, cada uma com a sua janela
  e o seu Branched Menu, no lugar dos cartões dela. A do Comunitário tem um item só.
- Q2: Ao maximizar, como os cartões atuais aparecem dentro da janela? → A: Árvore + cartões: a árvore
  continua à esquerda; à direita, no lugar do arquivo, a lista com todos os cartões da seção, rolando
  dentro da janela; escolher um item na árvore rola até o cartão dele.
- Q3: Quando o endereço tem uma âncora (`#projetos`), onde a página aparece no fim da porta? → A:
  Sempre no hero: toda visita abre no hero, e a âncora é limpa do endereço; links compartilhados para
  uma seção deixam de levar a ela (com JavaScript; sem JavaScript, a âncora continua funcionando).

### Session 2026-10-09 (clarify)

- Q: Quando o Lattice Loader some 3 s depois do "done", o que sai da tela? → A: A linha inteira (a
  grade e o texto `portfolio.service carregado com sucesso!`), com fade; o espaço da linha continua
  reservado, e nada no hero se mexe.
- Q: Quando o Lattice Loader passa para "done"? → A: Quando o hero terminou de carregar (fontes e fundo
  animado desenhando), mas nunca antes de 3 s de trabalho; se o hero demorar, espera por ele.
- Q: As janelas de editor devem ter a animação de "digitar" dos outros terminais (ao entrar na tela e
  ao reabrir depois de fechar)? → A: Sim, com um comando que abre o editor: a janela começa com uma
  linha de comando digitada (ex.: `$ code ~/carreira`) e, quando ela termina, o editor (abas, árvore,
  arquivo, rodapé) aparece como a saída do comando, como nos outros terminais, inclusive ao reabrir
  depois de fechar.
- Q: Em que formato o "arquivo" de cada item aparece no editor? → A: YAML (`.yml`): pares chave: valor,
  como os metadados das janelas de projeto (ex.: `cargo: Programador Full-Stack`,
  `periodo: MAR 2026 — JUL 2026`, `stack: [Angular, LLMs]`; o exemplo da pergunta usava `03/2026`, mas
  os períodos seguem o formato único da página, Princípio I).
- Q: A vinheta central padrão do Letter Glitch não garante sozinha o contraste de 4,5:1 do texto do
  hero; sem trazer de volta a penumbra antiga, o que ajustar? → A: Letras + vinheta: as letras ficam um
  pouco mais suaves (cores do tema com transparência) e a vinheta central do Letter Glitch um pouco
  mais forte e maior, calibradas juntas até o texto passar; o glitch continua visível em toda a tela,
  mais calmo no centro.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Experiência, challenges e comunitário numa janela de editor (Priority: P1)

*Item 1 do autor.* As seções Experiência, Challenges e Comunitário passam a ser janelas de editor
de texto no estilo VS Code, como na imagem do autor: abas de arquivo no topo, uma árvore de arquivos
à esquerda (o Branched Menu, com ramos em ângulo reto), o "arquivo" do item escolhido à direita, com
números de linha e cores de sintaxe, e um rodapé com dois rótulos. Escolher outro item na árvore
troca o arquivo exibido, dentro da mesma janela, e o visitante percorre a sequência item a item. A
janela minimiza e fecha como as outras e, diferente delas, maximiza: cobre a maior parte da tela,
desfoca a página por trás e mostra os cartões atuais da seção.

**Why this priority**: é o maior pedido e muda a apresentação de três blocos do currículo; o resto
são ajustes e correções.

**Independent Test**: em cada uma das janelas, percorrer todos os itens pela árvore (mouse e
teclado), conferir o conteúdo de cada um contra os cartões, minimizar, fechar, reabrir, maximizar e
restaurar; repetir no celular de 320 px e sem JavaScript.

**Acceptance Scenarios**:

1. **Given** a página com JavaScript, **When** o visitante chega à seção Experiência, **Then** vê, sob
   o título e a linha de comando da seção, uma janela com a barra de título (minimizar, maximizar,
   fechar) onde o comando `code ~/carreira` é digitado; terminado o comando, aparece o editor: a aba
   do arquivo aberto, a árvore com os 5 vínculos (do mais recente ao mais antigo), o arquivo do
   vínculo mais recente aberto à direita, com números de linha, e o rodapé.
2. **Given** a janela de editor, **When** o visitante escolhe outro item na árvore (clique, toque ou
   teclado), **Then** o arquivo à direita, a aba e o rodapé passam a ser os do item escolhido, o item
   fica destacado na árvore e a janela não muda de tamanho.
3. **Given** a janela de editor, **When** o visitante clica em maximizar, **Then** a janela cresce até
   cobrir a maior parte da tela, a página por trás fica desfocada e inalcançável, a árvore continua à
   esquerda e, no lugar do arquivo, aparecem os cartões atuais da seção; escolher um item na árvore
   rola até o cartão dele; Esc, o botão de restaurar ou um clique fora da janela a devolvem ao lugar,
   com o foco no botão de maximizar.
4. **Given** a janela de editor, **When** o visitante minimiza ou fecha, **Then** ela encolhe até o
   ícone de área de trabalho, como as demais janelas, e o ícone a reabre.
5. **Given** um celular de 320 px, **When** o visitante vê a janela de editor, **Then** a árvore fica
   acima do arquivo, todo o texto cabe sem rolagem horizontal (as linhas longas quebram) e a janela
   maximizada ocupa quase toda a tela.
6. **Given** a página sem JavaScript, **When** o visitante chega às três seções, **Then** todo o
   conteúdo de todos os itens está visível e legível.

---

### User Story 2 - A página abre no hero ao fim do carregamento (Priority: P1)

*Item 7 do autor.* Quando a sessão da porta de acesso termina, a página aparece no topo, com o hero
inteiro na tela, e não no meio da página onde o navegador restaurou a rolagem.

**Why this priority**: é uma regressão visível em toda visita que recarrega a página; o hero é a
apresentação do autor.

**Independent Test**: rolar a página, recarregar, passar pela porta e verificar a posição; repetir
com uma âncora no endereço.

**Acceptance Scenarios**:

1. **Given** um visitante que rolou a página e a recarregou, **When** a porta de acesso termina,
   **Then** a página aparece no topo, com o hero inteiro na tela.
2. **Given** uma primeira visita sem âncora, **When** a porta termina, **Then** a página aparece no
   topo (como hoje).
3. **Given** um endereço com âncora (`#projetos`), recarregado ou aberto de um link, **When** a porta
   termina, **Then** a página aparece no topo, no hero, e o endereço fica sem a âncora (Q3).

---

### User Story 3 - Reabrir uma janela fechada sem piscar (Priority: P1)

*Item 8 do autor.* Uma janela fechada e reaberta cresce a partir do ícone já "vazia" (só o que vem
antes do primeiro comando) e só então digita os comandos e mostra a saída, sem exibir o conteúdo
inteiro por um instante.

**Why this priority**: é um defeito visível em todas as janelas que fecham (8 hoje, 11 com as de
editor).

**Independent Test**: fechar e reabrir cada janela, gravando os quadros da animação, e verificar que
nenhum quadro mostra a saída antes de o comando ser digitado.

**Acceptance Scenarios**:

1. **Given** uma janela fechada, **When** o visitante abre o ícone, **Then** a janela cresce sem o
   conteúdo dos comandos; ao terminar de crescer, o primeiro comando é digitado, e a saída de cada
   comando só aparece depois dele.
2. **Given** uma janela minimizada, **When** o visitante abre o ícone, **Then** ela reabre completa,
   sem digitar de novo (como hoje, 004 FR-004).
3. **Given** "reduzir movimento", **When** o visitante reabre uma janela fechada, **Then** ela
   aparece completa, sem animação nem digitação (como hoje).

---

### User Story 4 - Fundo Letter Glitch no hero (Priority: P2)

*Item 4 do autor.* O Dot Field sai do hero; no lugar, o Letter Glitch do Vue Bits, com as cores do
tema, troca rápida de letras com transição suave, e as duas vinhetas do componente (centro e bordas)
no lugar da penumbra atual.

**Why this priority**: é a primeira tela depois da porta, mas o conteúdo do hero já é legível sem o
fundo.

**Independent Test**: abrir o hero com movimento e verificar as letras, as cores, a troca, as duas
vinhetas, o contraste do texto e o fundo estático com "reduzir movimento".

**Acceptance Scenarios**:

1. **Given** um visitante com movimento, **When** a página é descoberta, **Then** o fundo do hero é a
   grade de letras do Letter Glitch, nas cores do tema, trocando letras e cores continuamente, com
   transição suave de cor, o centro escurecido e as bordas escurecidas, e nenhum ponto do Dot Field.
2. **Given** o hero animado, **When** se amostra qualquer quadro, **Then** todo texto do hero mantém
   contraste mínimo de 4,5:1.
3. **Given** "reduzir movimento", sem JavaScript, o hero fora da tela ou a aba em segundo plano,
   **When** se observa o fundo, **Then** ele não anima.

---

### User Story 5 - Lattice Loader na primeira linha do hero (Priority: P2)

*Item 10 do autor.* No lugar de `[ OK ] Inicializando portfolio.service ...`, o hero mostra o
Lattice Loader roxo com o texto `Inicializando portfolio.service`; quando o hero termina de carregar,
o loader vira o ✓ verde com `portfolio.service carregado com sucesso!` e, 3 s depois, some sem mexer
no resto do hero.

**Why this priority**: acabamento da primeira tela; não muda conteúdo do currículo.

**Independent Test**: passar pela porta e cronometrar os três estados; verificar que nada no hero se
desloca quando o loader some; repetir com "reduzir movimento" e sem JavaScript.

**Acceptance Scenarios**:

1. **Given** a página recém-descoberta, **When** o hero aparece, **Then** a primeira linha mostra a
   grade 3 × 3 de quadrados roxos acendendo em onda, com brilho, e o texto
   `Inicializando portfolio.service`.
2. **Given** o loader trabalhando, **When** o hero termina de carregar (FR-039), **Then** a grade vira
   o ✓ em verde e o texto passa a `portfolio.service carregado com sucesso!`.
3. **Given** o loader em "done", **When** passam 3 s, **Then** a linha some, e nenhum outro elemento
   do hero muda de posição, em nenhuma largura de tela.

---

### User Story 6 - Porta de acesso mais leve: vinheta e curvatura (Priority: P3)

*Itens 5 e 6 do autor.* A penumbra sob o ícone `acessar_portfolio.sh` fica mais suave, parecida com a
vinheta central do Letter Glitch; no celular, o fundo do Faulty Terminal fica só levemente curvo.

**Why this priority**: acabamento visual da porta, sem mudar comportamento.

**Independent Test**: comparar a penumbra antes e depois; medir o contraste do nome do ícone e da
dica; comparar a curvatura do fundo no celular com a do desktop.

**Acceptance Scenarios**:

1. **Given** a porta de acesso, **When** o ícone está na tela, **Then** a penumbra sob ele é uma
   vinheta suave, que deixa ver o Faulty Terminal em volta do ícone, e o nome do ícone e a dica
   mantêm 4,5:1.
2. **Given** um celular em retrato, **When** a porta aparece, **Then** as linhas do Faulty Terminal
   ficam só levemente curvas, sem a curva acentuada de hoje.

---

### User Story 7 - Dock, maximizar desativado e favicon (Priority: P3)

*Itens 2, 9 e 3 do autor.* A dica do botão da dock vira uma dica do tema com `Ctrl + Alt + T`; o
`□` das janelas que não maximizam fica com aparência de desativado e sem reação ao hover; o favicon
vira o ícone de terminal da dock, verde, com brilho roxo.

**Why this priority**: acabamentos pequenos e independentes.

**Independent Test**: passar o mouse e o foco no botão da dock; passar o mouse no `□` de cada janela;
abrir o site numa aba clara e numa escura.

**Acceptance Scenarios**:

1. **Given** a dock na tela, **When** o mouse para sobre o botão do terminal ou ele recebe foco pelo
   teclado, **Then** aparece, acima do botão, uma dica no estilo do site com `Ctrl + Alt + T`, e não a
   dica nativa do navegador.
2. **Given** uma janela que não maximiza (Sobre, projetos, Contato, terminal da dock), **When** o
   mouse passa sobre o `□`, **Then** nada muda, e o `□` aparece esmaecido em relação aos outros dois
   controles.
3. **Given** o site aberto numa aba, **When** se observa a aba, **Then** o favicon é o ícone de
   terminal da dock, verde do tema, com um brilho roxo do tema atrás.

### Edge Cases

- **Item com muito texto na janela de editor** (o resumo mais longo, num celular de 320 px): o
  arquivo quebra as linhas dentro do painel, e a numeração continua por linha lógica; a janela tem a
  altura do maior item, para não pular quando o visitante troca de item.
- **Seção com um item só** (Comunitário hoje): a árvore mostra o único arquivo, já aberto; a janela
  funciona igual.
- **Trocar de item muito rápido** (cliques seguidos ou teclas): o arquivo exibido é sempre o do último
  item escolhido.
- **Maximizar com a janela meio fora da tela**: a janela maximizada ocupa a tela inteira do mesmo
  jeito; ao restaurar, a página volta à mesma posição de rolagem de antes.
- **Maximizar e a página por trás**: a página não rola enquanto a janela está maximizada; a rolagem
  acontece dentro da janela.
- **Minimizar ou fechar a janela maximizada**: ela sai do modo maximizado e encolhe até o ícone no
  lugar dela na página; o desfoque some.
- **Ctrl+Alt+T com uma janela maximizada**: o terminal da dock não abre por cima; o atalho só vale
  com a janela restaurada.
- **Redimensionar ou girar o celular** com a janela maximizada: ela continua cobrindo a maior parte
  da tela, sem rolagem horizontal.
- **Impressão**: as três seções saem como hoje (todos os cartões), sem janela de editor, sem
  desfoque, sem Lattice Loader animado.
- **Reabrir uma janela fechada e fechá-la de novo no meio da digitação**: ela encolhe até o ícone;
  ao reabrir, começa de novo sem piscar.
- **Fechar e reabrir uma janela que ainda não tinha digitado** (abaixo da dobra): ela reabre e digita,
  sem piscar.
- **Link compartilhado para uma seção** (`…/#projetos`): com JavaScript, abre no hero depois da porta
  (Q3); o visitante chega à seção pelo menu ou pelo `find`. Sem JavaScript, abre na seção.
- **Escolher na árvore, com a janela maximizada, um item cujo cartão já está na tela**: a lista não
  rola; o item fica destacado.
- **Hero fora da tela quando o loader termina** (visitante rolou rápido): o
  loader segue o mesmo tempo; quem voltar ao hero depois dos 3 s não vê mais a linha.
- **JavaScript que chega tarde** (sem porta, 005 FR-011): o loader começa quando o app monta.
- **Recarregar com a janela maximizada**: toda visita começa com as janelas restauradas e abertas
  (004 FR-010).
- **"Reduzir movimento" ligado no meio da visita**: o Letter Glitch para; o loader vai direto ao
  estado final.
- **Tela de toque**: a dica da dock não aparece (não há hover); o atalho não existe em teclado virtual.
- **Navegador sem favicon em SVG**: recebe uma versão em imagem comum, com o mesmo desenho.

## Requirements *(mandatory)*

### Functional Requirements

**Janelas de editor: Experiência, Challenges e Comunitário (item 1)**

- **FR-001**: As seções Experiência, Challenges e Comunitário MUST ser apresentadas em três janelas de
  editor de texto, uma por seção, cada uma com a sua árvore (Q1), posicionadas onde hoje ficam os
  cartões, sob o título e a linha de comando de cada seção (que não mudam).
- **FR-002**: A janela de editor MUST seguir o padrão da imagem do autor: (a) barra de título das
  janelas do site, com o título e os controles minimizar, maximizar e fechar; (b) no topo do corpo, a
  linha de comando que abre o editor (`code <pasta da seção>`, FR-019); como saída dela, o editor:
  (c) faixa de abas com a aba do arquivo aberto, destacada; (d) à esquerda, a árvore de arquivos;
  (e) à direita, o conteúdo do arquivo aberto, com números de linha numa coluna esmaecida; (f) rodapé
  com um rótulo à esquerda e outro à direita, em maiúsculas pequenas e esmaecidas.
- **FR-003**: A árvore de arquivos MUST ser o Branched Menu do Vue Bits, com **radius 0 px** (ramos
  em ângulo reto) e os demais parâmetros no padrão do componente (altura da linha, recuo, tronco,
  espessura 1,5, durações de desenho e dobra); as cores (tinta, destaque e linhas) MUST vir dos tokens
  do site. Cada item da seção é um arquivo da árvore, dentro de uma pasta com o nome da seção, na
  ordem da seção (experiência e challenges do mais recente ao mais antigo).
- **FR-004**: Escolher um arquivo na árvore (clique, toque, Enter ou Espaço) MUST abrir o item na
  mesma janela: o conteúdo, a aba e os rótulos do rodapé passam a ser os dele, o ramo até ele é
  destacado, e a janela MUST não mudar de tamanho (ela tem a altura do maior item, na largura atual).
  Na primeira exibição, o primeiro item da seção está aberto.
- **FR-005**: O nome de cada arquivo MUST identificar o item e a posição dele na sequência, com a
  extensão `.yml` (ex.: `2026-03_confidencial.yml`, `2025-10_executiva-service.yml`).
- **FR-006**: O conteúdo de cada arquivo MUST trazer todos os fatos do cartão do item, sem omitir nem
  acrescentar nada (Princípio I): experiência — período (no formato único da página, com o selo de
  vínculo atual quando houver), cargo, empresa, local, resumo, resultados e tecnologias; challenge —
  data de criação, nome, descrição, stack e o link do repositório; comunitário — data, nome,
  instituição, local, resumo, papel e o link da fonte.
- **FR-007**: O conteúdo MUST ser exibido como um arquivo YAML (clarify): uma chave por fato, em
  português e sem acento (ex.: `cargo`, `empresa`, `local`, `periodo`, `resumo`, `resultados`,
  `stack`, `repositorio`, `fonte`, `papel`), textos longos como texto corrido que quebra na largura do
  painel, listas curtas entre colchetes, com cores de sintaxe por tipo de trecho (chave, texto,
  número/data, pontuação, comentário), todas vindas dos tokens e com contraste mínimo de 4,5:1 sobre o
  fundo do painel; os números de linha MUST ser decorativos (fora da árvore de acessibilidade).
- **FR-008**: Os links do conteúdo (repositório do challenge, fonte do comunitário) MUST ser links de
  verdade, que abrem em nova aba com `rel="noopener noreferrer"`, com o mesmo estilo de link do site.
- **FR-009**: O rodapé MUST mostrar à esquerda o caminho do arquivo aberto e à direita a posição dele
  na sequência (ex.: `2 / 5`).
- **FR-010**: A árvore MUST ser operável por teclado (Tab chega a ela; os arquivos são botões com
  nome acessível; o arquivo aberto é marcado como atual) e por leitor de tela; trocar de arquivo MUST
  não tirar o foco do arquivo escolhido na árvore. A pasta da seção pode dobrar e desdobrar, como no
  componente.
- **FR-011**: Abaixo de 760 px, a árvore MUST ficar acima do conteúdo, e nada na janela MUST exigir
  rolagem horizontal, de 320 px até desktop: linhas longas do conteúdo quebram dentro do painel.
- **FR-012**: Sem JavaScript, as três seções MUST exibir todo o conteúdo de todos os itens, visível e
  legível, sem depender de clique, e cada conteúdo uma vez só (sem duplicar o texto para leitores de
  tela); na impressão, idem.
- **FR-013**: Além de minimizar e fechar (FR-014), a janela de editor MUST maximizar: o `□` é um botão
  funcional ("Maximizar <título>"; maximizada, "Restaurar <título>", com o ícone de restaurar).
- **FR-014**: Minimizar, fechar e reabrir a janela de editor MUST funcionar como nas demais janelas
  (004 FR-002 a FR-011): encolher e crescer a partir do ícone de área de trabalho em até 400 ms, foco
  no ícone e na janela, sem animação com "reduzir movimento", toda visita começa aberta.
- **FR-015**: Maximizada, a janela MUST cobrir a maior parte da tela (deixando uma margem de no máximo
  5% de cada lado no desktop e quase nenhuma no celular), centralizada e fixa na tela, com a página
  inteira por trás desfocada e escurecida, sem rolar; a transição de maximizar e de restaurar MUST
  durar no máximo 400 ms e não existir com "reduzir movimento".
- **FR-016**: Maximizada, a janela MUST manter a árvore à esquerda (acima, abaixo de 760 px) e, no
  lugar do arquivo, mostrar a lista com todos os cartões atuais da seção, como são hoje (a linha do
  tempo na Experiência), com rolagem dentro da janela (Q2). Escolher um item na árvore MUST rolar a
  lista até o cartão dele, com o título do cartão visível, e destacar o item na árvore; ao restaurar,
  o arquivo aberto é o do último item escolhido. A aba e o rodapé continuam mostrando o item escolhido.
- **FR-017**: Enquanto a janela está maximizada, ela MUST se comportar como um diálogo modal: o foco
  vai para dentro dela e não sai dela pelo Tab; o resto da página (inclusive o header e a dock) fica
  inalcançável por mouse, teclado e leitor de tela; Esc, o botão de restaurar e um clique fora da
  janela a restauram. Ao restaurar, a janela volta ao lugar na página, na mesma posição de rolagem de
  antes, com o foco no botão de maximizar.
- **FR-018**: Minimizar ou fechar a janela maximizada MUST primeiro sair do modo maximizado e então
  encolher até o ícone, no lugar dela na página.
- **FR-019**: Cada janela de editor MUST digitar, como os outros terminais (002 FR-025 a FR-033), o
  comando que abre o editor da sua pasta (`code ~/carreira`, `code ~/projetos/challenges`,
  `code ~/projetos/comunitario`) ao entrar na tela, e o editor inteiro (abas, árvore, arquivo, rodapé)
  é a saída do comando: aparece quando ele termina. Valem as mesmas regras: completa na hora com
  clique, toque ou foco dentro da janela; janela já vista acima da dobra fica completa; teto de 2,5 s;
  sem animação com "reduzir movimento" e sem JavaScript; minimizar completa; fechar e reabrir digita de
  novo sem piscar (FR-023). Enquanto o editor não apareceu, a janela já tem a altura final (nada abaixo
  dela se move quando ele aparece).

**Fim da porta de acesso no hero (item 7)**

- **FR-020**: Ao fim da porta de acesso, a página MUST aparecer no topo, com o hero inteiro na tela, em
  toda visita, inclusive ao recarregar depois de rolar: a rolagem que o navegador restaura por baixo
  da porta MUST ser descartada. O foco vai para o início do documento (005 FR-009, sem âncora).
- **FR-021**: Com âncora no endereço (`#secao`), recarregado ou aberto de um link, a página MUST
  também aparecer no hero ao fim da porta, e a âncora MUST sair do endereço sem criar uma entrada nova
  no histórico (Q3). As âncoras continuam funcionando depois disso (links da página, `find` do
  terminal da dock) e sem JavaScript.
- **FR-022**: Sem porta de acesso (JavaScript tarde ou ausente, 005 FR-011), o site MUST não mover a
  página: ela fica onde o navegador a mostrou (topo, rolagem restaurada ou âncora), para nunca pular
  sob quem já está lendo.

**Reabrir janela fechada (item 8)**

- **FR-023**: Uma janela fechada (Sobre, projetos, Contato, janelas de editor) MUST reabrir sem exibir,
  em nenhum quadro,
  o conteúdo que vem depois do primeiro comando: durante a animação de crescer, ela mostra só a moldura
  e o que vem antes do primeiro comando; terminada a animação, os comandos são digitados e a saída de
  cada um aparece depois dele (004 FR-005), no mesmo ritmo e no mesmo teto da primeira vez.
- **FR-024**: Reabrir uma janela minimizada continua mostrando tudo de uma vez (004 FR-004); com
  "reduzir movimento", reabrir continua sem animação e sem digitação (004 FR-008).

**Maximizar desativado (item 9)**

- **FR-025**: Nas janelas que não maximizam (Sobre, projetos, Contato, terminal da dock), o `□` MUST
  aparecer como controle desativado: esmaecido em relação a minimizar e fechar, sem nenhuma mudança no
  hover, sem cursor de clique, e continua fora da árvore de acessibilidade. A janela `acessar_portfolio.sh`
  continua sem o `□` (005 FR-006). Sem JavaScript, os três controles continuam desenho, e o `□`
  aparece igual (desativado).

**Dica do botão da dock (item 2)**

- **FR-026**: O botão do terminal da dock MUST ter uma dica própria, no estilo do site (fundo de
  superfície, borda, fonte monoespaçada e cores do tema), com o texto `Ctrl + Alt + T`, acima do
  botão; a dica nativa do navegador (`viper@portfolio:~$`) MUST sair.
- **FR-027**: A dica MUST aparecer quando o ponteiro para sobre o botão e quando o botão recebe foco
  pelo teclado; MUST continuar visível enquanto o ponteiro estiver sobre ela; MUST sumir ao tirar o
  ponteiro e o foco, ao apertar Esc e ao abrir o terminal; e MUST não aparecer em telas de toque. O
  nome acessível do botão continua o mesmo (já cita o atalho); a dica é decorativa para leitores de
  tela. Com "reduzir movimento", ela aparece sem transição.

**Favicon (item 3)**

- **FR-028**: O favicon MUST ser o ícone de terminal da dock, no verde do tema (o do ícone da dock),
  com um brilho difuso no roxo do tema atrás, legível em abas claras e escuras; navegadores sem
  suporte a favicon em SVG MUST receber uma versão em imagem com o mesmo desenho. Os arquivos são do
  próprio site (nenhum pedido a terceiros).

**Fundo Letter Glitch no hero (item 4)**

- **FR-029**: O Dot Field MUST sair do hero, em todos os modos, e o código que só servia a ele MUST
  sair do site.
- **FR-030**: Com JavaScript e movimento, depois da porta de acesso, o fundo do hero MUST ser o Letter
  Glitch do Vue Bits com: Glitch Speed 10, Smooth Animation ligado, Show Center Vignette ligado, Show
  Outer Vignette ligado; os demais parâmetros no padrão do componente (letras, símbolos e algarismos,
  célula de 10 × 20 px).
- **FR-031**: As "glitch colors" MUST ser três cores do tema, no lugar das três do padrão do
  componente e no mesmo papel delas (uma escura, duas de destaque): um tom escuro do tema, o verde do
  tema e o roxo do tema. A transição suave de cor MUST funcionar em todas as trocas (não só na
  primeira).
- **FR-032**: A penumbra atual sob o texto do hero MUST sair; as vinhetas do próprio Letter Glitch
  (centro e bordas) MUST ser as únicas. O texto do hero (inclusive o rótulo dos botões e o
  `▼ scroll`) MUST manter contraste mínimo de 4,5:1 em qualquer quadro (005 FR-032). Para isso, as
  letras MUST ficar um pouco mais suaves (as cores do tema com transparência) e a vinheta central MUST
  ficar um pouco mais escura e maior que a do padrão do componente, calibradas juntas pela medição
  (clarify); a vinheta das bordas fica no padrão. O glitch MUST continuar visível em toda a área do
  hero fora do bloco de texto.
- **FR-033**: O Letter Glitch MUST não animar com o hero fora da tela ou com a aba em segundo plano;
  com "reduzir movimento" (inclusive ligado no meio da visita) ou sem JavaScript, o fundo MUST ser
  estático (os degradês atuais do hero). Como não usa WebGL, aparece também sem WebGL.
- **FR-034**: O Letter Glitch MUST acompanhar o tamanho do hero (redimensionar, girar o celular) sem
  distorcer as letras e sem erro no console, e MUST não deixar ouvintes nem laços de animação depois
  que sai da tela ou da página.

**Porta de acesso: vinheta e curvatura (itens 5 e 6)**

- **FR-035**: A penumbra sob o ícone `acessar_portfolio.sh` e a dica MUST ficar mais leve, no desenho
  da vinheta central do Letter Glitch: mais escura no centro e sumindo aos poucos, deixando o Faulty
  Terminal visível em volta do ícone, em vez da mancha quase opaca de hoje. O nome do ícone e a dica
  MUST manter contraste mínimo de 4,5:1 em qualquer quadro do Faulty Terminal (005 FR-001).
- **FR-036**: No celular (telas estreitas ou em retrato), a curvatura do Faulty Terminal MUST ser
  leve: as linhas do fundo MUST se curvar no máximo tanto quanto se curvam no desktop (1366 × 768),
  proporcionalmente à largura da tela. No desktop 16:9 ou mais largo (1366 × 768, 1920 × 1080), a
  curvatura não muda (004 FR-028); telas mais altas que 16:9 recebem proporcionalmente menos (plano,
  research R15).

**Lattice Loader no hero (item 10)**

- **FR-037**: A linha `[ OK ] Inicializando portfolio.service ...` do hero MUST dar lugar ao Lattice
  Loader do Vue Bits com: grade 3 × 3, gap 1 px, opacidade ociosa 0,15, sem cronômetro, com brilho,
  forma quadrada; os demais parâmetros no padrão do componente (padrão de onda "orbit" da grade 3 × 3,
  célula de 6 px, passo de 90 ms), e o tamanho do texto o da linha atual.
- **FR-038**: Enquanto trabalha, o loader MUST usar o roxo do tema (células e brilho) e o texto
  `Inicializando portfolio.service`; em "done", o ✓ e o brilho MUST usar o verde do tema e o texto
  MUST ser `portfolio.service carregado com sucesso!`. Ambos os textos MUST ter contraste mínimo de
  4,5:1 sobre o fundo do hero.
- **FR-039**: O loader MUST começar a trabalhar quando a página é descoberta (fim da porta) e MUST
  passar a "done" quando tudo o que o hero carrega estiver pronto (fontes do hero e o fundo animado
  desenhando), nunca antes de 3 s de trabalho (clarify); se algo do hero falhar ou não existir no modo
  atual (sem fundo animado), conta como pronto. Se o hero demorar mais que 3 s, o loader espera por ele,
  até um teto de 10 s, depois do qual passa a "done" mesmo assim.
- **FR-040**: 3 s depois de "done", a linha inteira do loader (a grade e o texto) MUST sumir, com um
  fade de no máximo 0,6 s (sem fade com "reduzir movimento"), sem mover nenhum outro elemento do hero,
  em nenhuma largura de tela: o espaço dela continua reservado.
- **FR-041**: O loader MUST não atrasar nem bloquear nenhum conteúdo (a página fica utilizável desde o
  início) e MUST não anunciar cada troca de estado ao leitor de tela; o texto da linha continua legível
  para quem lê a página enquanto ela está na tela.
- **FR-042**: Com "reduzir movimento", o loader MUST mostrar direto o estado "done", sem onda, e
  sumir 3 s depois, sem transição.
- **FR-043**: Sem JavaScript, a linha MUST mostrar o estado final (o ✓ verde e
  `portfolio.service carregado com sucesso!`), estático, e MUST não sumir. Na impressão, a linha não
  aparece.
- **FR-044**: Com o hero fora da tela ou a aba em segundo plano, o tempo do loader continua contando
  (ele não espera o visitante voltar), mas a onda MUST não gastar processamento enquanto não é vista.

**Versão**

- **FR-045**: Esta feature MUST levar a versão do `package.json` a `2.5.0` (exibida `v2.5` na sessão
  da porta), como manda o 005 FR-016.

### Key Entities

- **Janela de editor**: título, a seção que apresenta, a lista ordenada de arquivos, o arquivo aberto,
  o estado da janela (aberta, minimizada, fechada) e o modo (normal ou maximizada).
- **Arquivo do item**: nome (com a posição na sequência), caminho, formato, as linhas de conteúdo
  (trechos com tipo de sintaxe, alguns com link) e a posição `n / total`; gerado dos dados do
  currículo, sem texto duplicado à mão.
- **Lattice Loader do hero**: estado (trabalhando, pronto, oculto), o instante em que começou, o
  instante em que ficou pronto.
- **Dica da dock**: texto `Ctrl + Alt + T`, visível ou não.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 320, 768, 1366 e 1920 px de largura, cada janela de editor mostra 100% dos itens da
  seção na árvore, e cada item aberto mostra 100% dos fatos do cartão dele (conferência automática
  campo a campo), sem rolagem horizontal da página.
- **SC-002**: Trocar de item na árvore não muda a altura da janela (0 px de diferença) e não desloca
  nada abaixo dela.
- **SC-003**: Maximizar e restaurar levam no máximo 400 ms cada; maximizada, a janela cobre pelo menos
  90% da largura e da altura da tela no desktop e 95% no celular, e o foco não sai dela em 20 Tabs
  seguidos.
- **SC-004**: Depois de rolar e recarregar, em 100% das tentativas a página aparece no topo ao fim da
  porta (rolagem 0, hero inteiro na tela), em desktop e celular.
- **SC-005**: Ao reabrir uma janela fechada, 0 quadros (amostrados a cada 16 ms durante a animação)
  mostram a saída de um comando antes de o comando terminar de ser digitado, nas 11 janelas (Sobre,
  6 projetos, Contato e as 3 de editor).
- **SC-006**: Em 10 quadros amostrados do hero animado, em desktop e celular, todo texto do hero tem
  contraste ≥ 4,5:1; o mesmo vale para o nome do ícone e a dica da porta, sobre o Faulty Terminal.
- **SC-007**: O loader passa a "done" entre 3 s e 3,5 s depois de a página ser descoberta numa conexão
  e num aparelho comuns, e some 3 s depois; nenhum elemento do hero se desloca mais de 0 px quando ele
  some.
- **SC-008**: O `□` das janelas que não maximizam tem o mesmo desenho com e sem o ponteiro sobre ele
  (diferença de 0 pixels entre as duas capturas).
- **SC-009**: A dica da dock aparece em até 300 ms depois de o ponteiro parar sobre o botão e com o
  foco pelo teclado, e some com Esc.
- **SC-010**: No celular em retrato (390 × 844), o desvio de uma linha horizontal do fundo da porta,
  entre o centro e a borda da tela, é no máximo o desvio equivalente no desktop (1366 × 768), medido
  em proporção da largura.
- **SC-011**: O carregamento inicial continua ≤ 500 KB (badges externos excluídos), e o HTML, o CSS e o
  JavaScript iniciais crescem no máximo 18 KB comprimidos em relação à 005; nenhum pedido novo a
  terceiros. (A estimativa do plano era +6 KB; medido na implementação, +16 KB: research R17.)
- **SC-012**: Zero violações na auditoria automática de acessibilidade e zero erros do site no
  console, nos modos: página descoberta, janela de editor normal e maximizada, minimizada, "reduzir
  movimento" e sem JavaScript.

## Assumptions

- **Numeração**: esta feature é a 006. O boot dentro de um dispositivo (`specs/insumos/
  002-boot-dispositivo.md`, plano 09), que estava reservado como 006, passa a ser a 007.
- **Imagem do autor**: é a referência de estrutura (abas, árvore, código numerado, rodapé), não de
  cores: as cores são as do tema do site.
- **Abas**: a faixa de abas mostra a aba do arquivo aberto (como um editor com um arquivo aberto);
  trocar de arquivo troca a aba. Não há várias abas abertas ao mesmo tempo nem fechar aba.
- **"As mesmas funções que os outros"**: minimizar, fechar e reabrir pelo ícone de área de trabalho,
  com as mesmas animações e regras (004), e a digitação de um comando que abre o editor (clarify); a
  linha de comando de cada seção continua acima da janela, como hoje.
- **Título da janela**: o caminho da pasta da seção (ex.: `~/carreira`, `~/projetos/challenges`,
  `~/projetos/comunitario`), coerente com as linhas de comando das seções; o ícone de área de
  trabalho é o de pasta de código.
- **Conteúdo dos arquivos**: YAML (clarify), gerado dos dados do currículo; os nomes exatos das chaves
  e a ordem delas ficam no plano.
- **Tecnologias no editor**: aparecem como texto; os ícones de tecnologia continuam nos cartões.
- **Cores do Letter Glitch**: "cores padrão do tema" = um tom escuro do tema no lugar do
  verde-escuro do componente, o verde do tema no lugar do verde e o roxo do tema no lugar do azul.
- **"Tudo do Hero carregar"**: as fontes do hero e o primeiro quadro do fundo animado; "podendo ser 3
  segundos de carregamento padrão" = o loader trabalha no mínimo 3 s (clarify). O teto de 10 s, para
  um hero que nunca termina de carregar, é premissa desta spec.
- **"Não deve afetar responsabilidade"**: lido como responsividade/layout: o sumiço do loader (a linha
  inteira, clarify) não move nada nem quebra o layout em nenhuma largura.
- **Dica da dock**: o texto é `Ctrl + Alt + T` em todos os sistemas (o atalho do site é o mesmo).
- **Favicon**: o "verde do tema" é o do ícone da dock (`--green-bright`), e o roxo do brilho, o
  `--purple-light`.
- **Curvatura no desktop**: não muda no 16:9 ou mais largo; o pedido é para o celular, e a regra
  proporcional (research R15) também suaviza tablets em retrato e desktops 16:10/4:3.
- **Dock**: continua escondida até a página ser descoberta; fica sob o desfoque da janela maximizada.
