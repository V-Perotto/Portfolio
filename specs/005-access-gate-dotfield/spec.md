# Feature Specification: Porta de acesso no boot, IP real, Dot Field no hero e ajustes nas janelas

**Feature Branch**: `001-vue-resume-refactor` (nenhum branch criado: não há hook `before_specify`
configurado, e a 005 parte do estado da 004, que ainda não foi para a `main`)

**Created**: 2026-10-09

**Status**: Draft

**Input**: User description: sete pedidos do autor, enviados de uma vez:

1. "Na tela de carregamento da página, invés de ser um card que vai crescendo conforme o que é
   escrito, faça igual os ícones quando o terminal é minimizado (exemplo do sobre). Fazendo com que o
   usuário tenha que clicar em um ícone de item `acessar_portfolio.sh`. O terminal deverá ter o ícone
   de fechar e minimizar somente, sendo funcionais (se fechar, ele não deve abrir o portfolio e
   encerra a tentativa de acesso)."
2. "No caso do anon@127.0.0.1, use o IP real da pessoa que está acessando. Corrija o Conectando a
   portfolio na porta 22... para Conectando ao portfolio... e atualize a versão do portfolio baseado
   na versionamento desse repositório. Siga o padrão abaixo como exemplo:

   ```text
   anon@X.X.X.X:~$ ssh viper@portfolio
   Conectando ao portfolio...
   viper@portfolio password: ••••••••
   Autenticado. Bem-vindo ao Portfolio vX.X
   Last login: 09/10/2026, 00:34:04 from X.X.X.X
   ```"
3. "Na parte do contato, quando aparece o item para abrir, deixe ele para esquerda, igual está sendo
   feito na seção de projetos e sobre, pra não fugir do padrão"
4. "Nos terminais invés de usar aqueles símbolos padrão para o minimizar, maximizar e fechar, use os
   ícones do lucide e deixe todos eles centralizados dentro do círculo igualmente: minimizar: minus;
   maximizar: maximize-2; fechar: x"
5. "Diminua um pouco o tempo da escrita da tela de carregamento, use o TextType"
6. "Invés de usar o CRT e o Matrix no Hero, use o Dot Field do Vue-Bits com as cores roxo e verde do
   projeto. Dot Radius: 2; Cursor Force: 0; Bulge Only: off; Sparkle: on; Glow Radius: 80 (Use as
   cores do tema para o gradient from e gradient to e glow color)"
7. "Quando os terminais de projetos são minimizados ou fechados, faça com que os itens sejam
   responsivos, ocupando a linha vertical corretamente dentro do tamanho especificado por
   dispositivo usado (mobile, desktop, notebook etc)."

## Contexto

### Situação atual

- **Tela de boot** (feature 004): cobre a página desde o primeiro paint, com o Faulty Terminal do Vue
  Bits ao fundo. No centro, um painel sem barra de título **cresce linha a linha** enquanto a sessão
  SSH é digitada:

  ```text
  anon@127.0.0.1:~$ ssh viper@portfolio
  Conectando a portfolio na porta 22...
  viper@portfolio's password: ••••••••
  Autenticado. Bem-vindo ao PortfolioOS 1.0 LTS
  Last login: <data e hora locais> from 127.0.0.1
  viper@portfolio:~$ ./iniciar_portfolio.sh
  ```

  A sequência dura 3,9 s e não é pulável; a saída (fade de 0,5 s) começa sozinha, e a página fica
  descoberta em até 7 s contados do início da navegação (constituição v2.3.0, Princípio IV). O boot
  não aparece com "reduzir movimento", sem JavaScript, nem quando o JavaScript monta depois de
  ~2,1 s (aí a sequência não caberia inteira no teto); sem WebGL, aparece com o fundo liso. O IP
  (`127.0.0.1`) e a versão (`PortfolioOS 1.0 LTS`) são texto fixo.
- **Janelas de área de trabalho** (feature 004): Sobre (`sobre.txt`), os seis projetos e Contato
  (`contato.sh`) minimizam e fecham até um ícone (quadrado com o ícone do tipo de arquivo e o título
  embaixo); o ícone reabre a janela com uma animação de 320 ms. O terminal da dock só fecha.
- **Controles das janelas**: `−`, `□` e `✕` são caracteres da fonte, dentro de círculos de 20 px. Os
  glifos assentam em alturas diferentes (o `□` precisou de um ajuste para não ficar baixo), e não
  ficam centrados por igual.
- **Contato minimizado**: a janela é centralizada numa caixa de até 720 px, e o ícone aparece no
  canto esquerdo **dessa caixa** (a 323 px da borda da tela, numa janela de 1366 px), e não no
  alinhamento da seção (157 px, a borda do título), onde ficam os ícones do Sobre e dos projetos.
- **Projetos minimizados**: cada projeto ocupa uma linha inteira da lista; minimizado ou fechado,
  o ícone continua sozinho na linha. Com os seis minimizados, os ícones ficam empilhados numa coluna
  à esquerda (~150 px por ícone, ~900 px no total), com o resto da largura vazio, em qualquer tela.
- **Fundo do hero** (feature 004): com movimento e WebGL, depois do boot, o CRT Warp do Vue Bits
  exibe a chuva Matrix (letras latinas, verde e roxo); sem isso, degradês radiais estáticos roxo e
  verde. Uma penumbra sob o texto garante o contraste.
- **Versão do repositório**: o `package.json` declara `0.0.0`, e não há tags no git. A `main` tem o
  site original em HTML/CSS/JS (3 commits, de 2026-07 a 2026-09); o branch atual traz a refatoração
  para Vue (feature 001) e as features 002, 003 e 004. A constituição está na v2.3.0.

### Fatos levantados em 2026-10-09

- **Dot Field** (Vue Bits, `Backgrounds/DotField`, commit `07c0f76`): grade de pontos desenhada em
  canvas 2D (não usa WebGL nem bibliotecas), pintada com um degradê linear do canto superior esquerdo
  ("gradient from") ao inferior direito ("gradient to"). O "glow" é um halo circular na cor "glow
  color", que segue o ponteiro do mouse e só aparece enquanto o ponteiro se move. "Cursor Force"
  empurra os pontos para longe do ponteiro: com **0** e **Bulge Only off**, os pontos não se mexem.
  "Sparkle" faz ~3% dos pontos, sorteados de novo a cada ~8 quadros, aparecerem maiores (cintilação).
  Demais padrões do componente: espaçamento 14 px, raio do cursor 500 px, onda 0. Em telas de toque
  não há ponteiro que se mova, então o halo não aparece. O componente original não remove os
  ouvintes de eventos ao sair da tela.
- **TextType** (Vue Bits, `TextAnimations/TextType`): digita um texto caractere a caractere num
  ritmo fixo (padrão 50 ms por caractere), com cursor piscando; aceita várias frases, que apaga e
  redigita em loop. O cursor pisca com GSAP, biblioteca que o site não usa (o site já tem cursor
  piscando em CSS).
- **IP real**: um site estático não tem servidor e não conhece o IP de quem o visita. Para exibi-lo,
  a página precisa consultar, durante a visita, um serviço público externo que devolve o IP de quem
  pergunta (esse serviço recebe o IP de qualquer forma, ao receber o pedido). Esse pedido pode falhar
  ou ser bloqueado (bloqueadores de anúncio, extensões de privacidade, rede fora do ar), e o
  navegador registra a falha de rede no console por conta própria. O IP é público para quem o
  serviço atende: em redes com IPv4 e IPv6, o serviço escolhido define qual dos dois aparece.
- **Licença do Vue Bits**: MIT + Commons Clause (o mesmo regime dos quatro componentes já
  vendorizados).

### Relação com a constituição (v2.3.0)

- **Princípio I (Fidelidade ao Currículo)**: nenhum dado do currículo muda.
- **Princípio II (Projetos Demonstráveis)**: minimizar ou fechar uma janela de projeto continua
  reversível; o reagrupamento dos ícones não muda a ordem dos projetos (relevância).
- **Princípio III (Saída Estática)**: a consulta do IP é um recurso de terceiro carregado durante a
  visita: por decisão do autor (Q3), é uma exceção justificada, que degrada com elegância para
  `127.0.0.1` (FR-015) e é registrada no plano. Sem
  JavaScript, nada desta feature existe e todo o conteúdo continua no HTML. Os componentes do Vue
  Bits são vendorizados (nenhum pedido ao Vue Bits durante a visita), e cada dependência nova é
  justificada no plano, com o peso.
- **Princípio IV (Acessibilidade e Desempenho)**: o item 1 **conflita** com a exceção da tela de boot
  ("a página fique totalmente descoberta em no máximo 7 segundos contados do início da navegação"):
  com a porta de acesso, a página só é descoberta depois de uma ação do visitante, e fechar o
  terminal a mantém coberta. Por decisão do autor (Q1), a constituição MUST ser emendada para a
  v3.0.0 antes do plano: a exceção da tela de boot passa a ser uma porta de acesso que espera a ação
  do visitante, sem teto de tempo, desde que continue omitida sem JavaScript, seja operável por
  teclado e por leitor de tela, e a sessão termine em até 4 s depois da ação. Com "reduzir
  movimento", a porta deixa de ser omitida (clarify): aparece para todos, sem nenhuma animação
  (fundo liso, sem transições, sessão exibida de uma vez), o que mantém a regra de desativar
  animações decorativas para quem pede. As demais animações de entrada seguem puláveis e com o teto
  de 5 s. O Dot Field respeita "reduzir movimento".
- **Princípio V (Identidade Visual Coerente)**: o ícone `acessar_portfolio.sh` reutiliza o ícone de
  área de trabalho da 004; os ícones dos controles vêm do Lucide, já usado no site; as cores do Dot
  Field vêm dos tokens.

### Requisitos de features anteriores que esta feature substitui

- **004 FR-030** (sessão inteira em toda visita com boot): continua valendo, a partir do clique no
  ícone (FR-019 desta spec).
- **004 FR-031** (sem pulo; "ritmo atual de digitação e de pausas"): o pulo continua proibido, mas o
  ritmo fica mais rápido (FR-020).
- **004 FR-032** (página descoberta em até 7 s do início da navegação): substituído pelas regras da
  porta de acesso (FR-001 a FR-012).
- **004 FR-033** e **001 FR-031** (sem boot com "reduzir movimento"): com "reduzir movimento", a
  porta aparece, sem animação (FR-012). Sem JavaScript continua sem boot; sem WebGL, fundo liso.
- **004 FR-035 a FR-037** (CRT Warp exibindo a chuva Matrix) e **001 FR-032** (chuva Matrix no
  hero): substituídos pelo Dot Field (FR-028 a FR-033). O 004 FR-034 (sem a grade de quadrados)
  continua valendo.
- **004 FR-001** e a premissa "`□` continua decorativo": o `□` continua decorativo; muda só o
  desenho dos três controles (FR-022).

## Clarifications

### Session 2026-10-09 (specify)

- Q1: A porta de acesso conflita com o Princípio IV (página descoberta em até 7 s sem ação do
  visitante), e fechar o terminal deixa a página coberta. Como resolver? → A: Emendar a constituição
  (v3.0.0): o boot vira uma porta que espera o clique, sem limite de tempo; continua omitida sem
  JavaScript, operável por teclado e leitor de tela, e a sessão termina em até 4 s depois do clique.
- Q2: Depois que o visitante fecha a janela `acessar_portfolio.sh`, o que acontece? → A: Pode tentar
  de novo: o ícone continua na tela, e clicar nele abre uma nova tentativa, com a sessão do zero. O
  portfólio só abre se alguma sessão chegar ao fim.
- Q3: Mostrar o IP real exige consultar um serviço externo durante a visita (exceção ao Princípio
  III; o serviço recebe o IP). Como fazer? → A: Consultar um serviço público sem chave (ex.: ipify,
  IPv4) ao carregar a página; se o IP não chegar até a janela abrir (falha, bloqueio ou lentidão), a
  sessão mostra `127.0.0.1`. Nada é guardado.

### Session 2026-10-09 (clarify)

- Q: O que acontece com a sessão SSH quando o visitante minimiza a janela `acessar_portfolio.sh` no
  meio da digitação? → A: Continua minimizada, como num terminal de verdade: a sessão segue rodando
  escondida, e o portfólio abre sozinho quando ela termina, mesmo com a janela minimizada.
- Q: Quem ativou "reduzir movimento" na configuração de acessibilidade do sistema operacional
  (repassada pelo navegador; não é um botão do site, e o botão "motion: on/off" removido na 001 não
  volta) também passa pela porta `acessar_portfolio.sh`? → A: Sim, porta para todos, sem animação:
  fundo liso, janela que abre sem animação e sessão exibida de uma vez; o resto do site continua
  respeitando a configuração.
- Q: De onde vem a versão exibida em "Bem-vindo ao Portfolio vX.X", e com qual número ela começa?
  → A: Do campo `version` do `package.json`, fonte única lida no build. Numeração: v1 = site
  original da `main`, 2.0 = refatoração em Vue (001), e cada feature sobe a versão menor (002 → 2.1,
  003 → 2.2, 004 → 2.3); esta feature fica 2.4.0, exibida como `v2.4`.
- Q: Como os ícones dos projetos minimizados ou fechados devem se dispor? → A: Lado a lado,
  quebrando: ícones minimizados em sequência ficam na mesma linha, alinhados à esquerda, e quebram
  para a linha de baixo quando não cabem (2 por linha no celular de 320 px, 5 no tablet, os 6 numa
  linha no notebook e no desktop); uma janela aberta entre eles ocupa a própria linha, e a ordem dos
  projetos se mantém.
- Q: Onde fica o ícone `acessar_portfolio.sh` na tela de carregamento, e ele vem com alguma
  instrução para quem nunca viu o site? → A: No centro da tela, com uma dica discreta embaixo, numa
  linha esmaecida no estilo terminal (`# clique no ícone para conectar`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Porta de acesso `acessar_portfolio.sh` (Priority: P1)

*Itens 1 e 5 do autor.* Ao carregar a página, o visitante vê, sobre o Faulty Terminal, só um ícone de
área de trabalho chamado `acessar_portfolio.sh`, igual aos das janelas minimizadas. Ao clicar nele,
uma janela de terminal de tamanho fixo cresce a partir do ícone, com só os controles de minimizar e
fechar, e a sessão SSH é digitada dentro dela, mais rápido que hoje. Quando a sessão termina, a tela
de boot sai e o portfólio aparece. Fechar a janela encerra a tentativa de acesso: o portfólio não
abre.

**Why this priority**: é a primeira coisa que todo visitante vê e decide se ele chega ao conteúdo.
Muda a natureza da entrada (de automática para uma ação do visitante) e exige emenda da constituição.

**Independent Test**: carregar a página com movimento e verificar que só o ícone aparece; clicar e
verificar a janela fixa com dois controles, a sessão completa e a página descoberta ao fim; repetir
minimizando e fechando no meio da sessão.

**Acceptance Scenarios**:

1. **Given** um visitante com JavaScript, **When** a página carrega,
   **Then** a tela de boot mostra o Faulty Terminal e, no centro, só o ícone `acessar_portfolio.sh`
   (quadrado com o ícone de script e o nome embaixo), com o foco nele, e a dica
   `# clique no ícone para conectar` embaixo; a página continua coberta.
2. **Given** o ícone na tela, **When** o visitante clica, toca ou aperta Enter ou Espaço nele,
   **Then** uma janela de terminal intitulada `acessar_portfolio.sh` cresce a partir do ícone em até
   400 ms, já no tamanho final, e a sessão SSH começa a ser digitada dentro dela.
3. **Given** a janela aberta, **When** a sessão é digitada, **Then** a janela não muda de tamanho, e
   a barra de título tem só os botões de minimizar e fechar (nada de maximizar).
4. **Given** a sessão em curso, **When** o visitante minimiza a janela, **Then** ela encolhe até o
   ícone em até 400 ms e a sessão continua rodando escondida: clicar no ícone antes do fim reabre a
   janela com as linhas já digitadas e a digitação em curso; se ninguém reabrir, o portfólio abre
   sozinho quando a sessão termina.
5. **Given** a sessão em curso, **When** o visitante fecha a janela, **Then** ela encolhe até o
   ícone, a sessão é descartada, e o portfólio **não** abre; clicar de novo no ícone começa uma nova
   tentativa, com a sessão desde a primeira linha.
6. **Given** a sessão digitada até o fim (`./iniciar_portfolio.sh` inteiro), **When** termina a
   pausa final, **Then** a tela de boot sai com um fade e a página aparece, com o foco no início da
   página.
7. **Given** um visitante com "reduzir movimento" ligado no sistema, **When** a página carrega e ele
   abre o ícone, **Then** a porta aparece sobre um fundo liso, a janela abre sem animação com a
   sessão inteira já exibida, e a página aparece 1 s depois, sem fade.

---

### User Story 2 - Sessão SSH com o IP do visitante e a versão do portfólio (Priority: P1)

*Item 2 do autor.* A sessão mostra o IP público de quem acessa (no prompt e no "Last login"), a
mensagem "Conectando ao portfolio..." e a versão real do portfólio, tirada do versionamento do
repositório.

**Why this priority**: é o texto da porta de acesso (US1); sem ele, a sessão continua com dados
fixos e a correção de texto pedida não acontece.

**Independent Test**: abrir a sessão e comparar cada linha com o padrão do autor; repetir com o
serviço de IP fora do ar.

**Acceptance Scenarios**:

1. **Given** o serviço de IP respondendo, **When** a sessão é digitada, **Then** as linhas são, em
   ordem: `anon@<IP>:~$ ssh viper@portfolio`, `Conectando ao portfolio...`,
   `viper@portfolio password: ••••••••`, `Autenticado. Bem-vindo ao Portfolio v<versão>`,
   `Last login: <data e hora locais> from <IP>` e `viper@portfolio:~$ ./iniciar_portfolio.sh`,
   com o mesmo IP nas duas posições.
2. **Given** o serviço de IP fora do ar, bloqueado ou lento, **When** a sessão é digitada, **Then**
   ela aparece inteira e no mesmo ritmo, com `127.0.0.1` no lugar do IP, sem erro do site no
   console.
3. **Given** uma nova versão do portfólio publicada, **When** a sessão é exibida, **Then** a linha
   "Bem-vindo" mostra a versão nova sem que ninguém edite o texto da sessão.

---

### User Story 3 - Fundo Dot Field no hero (Priority: P2)

*Item 6 do autor.* O tubo CRT e a chuva Matrix saem do hero; no lugar, o Dot Field do Vue Bits: uma
grade de pontos em degradê roxo → verde que cintila, com um halo que segue o mouse.

**Why this priority**: é a primeira tela depois da porta de acesso, mas o conteúdo do hero já é
legível sem o fundo.

**Independent Test**: abrir o hero com movimento e verificar os pontos, o degradê, a cintilação, o
halo no movimento do mouse, o contraste do texto e o fundo estático com "reduzir movimento".

**Acceptance Scenarios**:

1. **Given** um visitante com movimento, **When** a página é descoberta, **Then** o fundo do hero é
   a grade de pontos (raio 2) em degradê do roxo do tema (canto superior esquerdo) ao verde do tema
   (canto inferior direito), com pontos cintilando, e nenhum tubo CRT nem chuva Matrix.
2. **Given** o hero na tela, **When** o mouse se move sobre ele, **Then** um halo de raio 80 na cor
   de brilho do tema acompanha o ponteiro, e os pontos não se deslocam.
3. **Given** o hero animado, **When** se amostra qualquer quadro, **Then** todo texto do hero mantém
   contraste mínimo de 4,5:1.
4. **Given** "reduzir movimento", sem JavaScript ou com o hero fora da tela, **When** se observa o
   fundo, **Then** ele não anima.

---

### User Story 4 - Controles das janelas com ícones centrados (Priority: P2)

*Item 4 do autor.* Em todas as janelas de terminal, os controles minimizar, maximizar e fechar passam
a ser os ícones `minus`, `maximize-2` e `x` do Lucide, cada um centrado por igual no seu círculo.

**Why this priority**: acabamento visível em todas as janelas do site, sem mudar comportamento.

**Independent Test**: medir, em cada janela, o centro de cada ícone em relação ao centro do círculo.

**Acceptance Scenarios**:

1. **Given** qualquer janela de terminal (Sobre, projetos, Contato, terminal da dock, janela de
   acesso), **When** ela é exibida, **Then** cada controle presente mostra o ícone Lucide
   correspondente, centrado na horizontal e na vertical do círculo, com o mesmo tamanho nos três.
2. **Given** a página sem JavaScript, **When** ela é exibida, **Then** os controles mostram os
   mesmos ícones, decorativos.

---

### User Story 5 - Ícones minimizados alinhados e responsivos (Priority: P2)

*Itens 3 e 7 do autor.* O ícone do Contato minimizado fica à esquerda, no mesmo alinhamento do Sobre e
dos projetos; os ícones dos projetos minimizados ou fechados se reorganizam de acordo com a largura
do dispositivo, sem deixar uma coluna de ícones isolados.

**Why this priority**: corrige inconsistências de layout de um recurso novo (004); não bloqueia o
acesso ao conteúdo.

**Independent Test**: minimizar o Contato e comparar a posição do ícone com a do título da seção;
minimizar os seis projetos em celular, notebook e desktop e verificar a disposição dos ícones.

**Acceptance Scenarios**:

1. **Given** a janela do Contato minimizada ou fechada, **When** se observa a seção, **Then** o
   ícone fica alinhado à borda esquerda do conteúdo da seção, como o do Sobre.
2. **Given** a janela do Contato aberta, **When** se observa a seção, **Then** ela continua
   centralizada, com até 720 px.
3. **Given** os seis projetos minimizados ou fechados, **When** se observa a seção, **Then** os
   ícones ficam lado a lado, alinhados à esquerda, na ordem dos projetos: 2 por linha no celular de
   320 px, 5 por linha com 768 px e os 6 numa linha só a partir de 1024 px, sem rolagem horizontal.
4. **Given** projetos abertos e minimizados misturados, **When** se observa a seção, **Then** os
   ícones de projetos minimizados em sequência dividem a mesma linha, e cada janela aberta ocupa a
   própria linha, entre eles, na ordem dos projetos.

### Edge Cases

- **JavaScript que chega tarde**: se o app monta depois do limite atual (~2,1 s do início da
  navegação), a porta não aparece e a página é descoberta direto, para nunca cobrir de repente uma
  página que o visitante já está lendo. Se o JavaScript não roda, a capa sai sozinha (como hoje).
- **Clique repetido no ícone** enquanto a janela cresce: não abre uma segunda janela nem reinicia a
  sessão.
- **Minimizar ou fechar durante a animação de abrir**: a animação em curso termina na hora, e o
  novo pedido é atendido (como nas janelas da 004).
- **Fechar no último instante**, depois de `./iniciar_portfolio.sh` digitado e antes da saída: a
  tentativa é encerrada e o portfólio não abre.
- **Sessão que termina minimizada**: a tela de boot sai do mesmo jeito, e o foco, que estava no
  ícone, vai para o início da página (FR-009).
- **Minimizar e reabrir várias vezes**: a sessão não recomeça nem perde linhas; o tempo total, do
  clique à página descoberta, é o mesmo de quem não minimizou.
- **Visitante que nunca clica**: a página continua coberta; o Faulty Terminal não pode pesar no
  aparelho indefinidamente (não anima com a aba em segundo plano).
- **Endereço com âncora** (`#projetos`, link compartilhado): a porta aparece do mesmo jeito; ao fim
  do acesso, a página mostra a seção da âncora.
- **IP do serviço chega depois que a janela abriu**: a sessão não espera nem muda de ritmo; usa
  `127.0.0.1` (FR-015). Uma nova tentativa (depois de fechar) já usa o IP, se ele tiver chegado.
- **IPv6**: o serviço consultado devolve só IPv4 (FR-015); qualquer resposta que não seja um IPv4
  válido (inclusive um IPv6) vale como falha e a sessão usa `127.0.0.1`. A janela comporta o IPv4
  mais longo (`255.255.255.255`, 15 caracteres) (FR-021).
- **Tela estreita (320 px)**: a janela de acesso cabe inteira, sem rolagem horizontal; linhas longas
  quebram dentro da janela, que mantém o tamanho fixo.
- **"Reduzir movimento" ligado no meio da visita**: o Dot Field para (fica o fundo estático).
- **Toque** (celular): o halo do Dot Field não aparece (não há ponteiro em movimento); os pontos e a
  cintilação continuam.
- **Impressão**: sem porta de acesso, sem janela de acesso e sem Dot Field.
- **Todos os projetos abertos**: a lista fica como hoje (um projeto por linha).
- **Projetos abertos e minimizados misturados**: a ordem dos projetos é mantida; uma janela aberta
  interrompe a linha de ícones (os ícones antes dela ficam numa linha, os depois, em outra); nenhum
  ícone fica sobre uma janela aberta.
- **Animação de minimizar um projeto**: a janela encolhe até a posição final do ícone na linha (ao
  lado dos ícones anteriores), e os itens seguintes sobem; ao reabrir, a janela cresce a partir do
  ícone e volta a ocupar a própria linha.

## Requirements *(mandatory)*

### Functional Requirements

**Porta de acesso (itens 1 e 5)**

- **FR-001**: Com JavaScript, ao carregar a página, a tela de boot MUST exibir sobre o Faulty
  Terminal (004 FR-028, sem mudança; com "reduzir movimento", sobre o fundo liso, FR-012) só um
  ícone de área de trabalho `acessar_portfolio.sh`, com o mesmo desenho dos ícones de janela
  minimizada (quadrado com o ícone de script e o nome embaixo), no centro da tela, e, embaixo dele,
  uma dica numa linha esmaecida no estilo terminal: `# clique no ícone para conectar` (em telas de
  toque, `# toque no ícone para conectar`). A dica fica visível sempre que o ícone está na tela sem a
  janela aberta (inclusive depois de minimizar ou fechar). O painel que crescia com o texto MUST
  sair. O nome do ícone e a dica MUST ter contraste mínimo de 4,5:1 com o fundo imediato, em
  qualquer quadro do Faulty Terminal.
- **FR-002**: Enquanto a porta estiver na tela, a página MUST continuar coberta: nada dela fica
  visível, clicável ou alcançável pelo teclado ou por leitor de tela.
- **FR-003**: Ao aparecer a porta, o foco MUST ir para o ícone, que MUST ser um botão com nome
  acessível ("Abrir acessar_portfolio.sh").
- **FR-004**: Clicar, tocar ou apertar Enter ou Espaço no ícone MUST abrir uma janela de terminal
  intitulada `acessar_portfolio.sh`, que cresce a partir do ícone com a animação das janelas da 004
  (no máximo 400 ms), e começar a sessão SSH dentro dela. Cliques repetidos durante a abertura MUST
  não abrir outra janela nem reiniciar a sessão.
- **FR-005**: A janela MUST abrir já no tamanho final e MUST não mudar de tamanho enquanto a sessão
  é digitada; o tamanho comporta a sessão inteira sem rolagem, de 320 px de largura até desktop.
- **FR-006**: A barra de título da janela MUST ter só dois controles, minimizar e fechar, ambos
  botões funcionais com nome acessível ("Minimizar acessar_portfolio.sh", "Fechar
  acessar_portfolio.sh"). Não há controle de maximizar.
- **FR-007**: Minimizar MUST encolher a janela até o ícone (no máximo 400 ms), com o foco no ícone,
  e a sessão MUST continuar rodando escondida, no mesmo ritmo, como num terminal de verdade. Abrir o
  ícone antes do fim MUST reabrir a janela mostrando as linhas já digitadas e a digitação em curso
  (sem recomeçar). Se a sessão terminar com a janela minimizada, o portfólio MUST abrir do mesmo
  jeito (FR-009).
- **FR-008**: Fechar MUST encolher a janela até o ícone, descartar a sessão e encerrar a tentativa
  de acesso: o portfólio MUST não abrir, mesmo que a sessão estivesse no fim. O ícone MUST continuar
  na tela, com o foco nele, e abri-lo de novo MUST começar uma nova tentativa, com a sessão desde a
  primeira linha (Q2). O portfólio só abre quando uma sessão chega ao fim.
- **FR-009**: Ao fim da sessão (`./iniciar_portfolio.sh` digitado por completo e a pausa final), a
  tela de boot MUST sair com um fade de no máximo 0,6 s e descobrir a página; o foco MUST ir para o
  início da página (ou para a seção da âncora, se o endereço tiver uma).
- **FR-010**: A porta MUST aparecer em toda visita com JavaScript, com ou sem "reduzir movimento"
  (o estado de "já acessou" não é guardado).
- **FR-011**: Se o JavaScript montar tarde demais (depois do limite atual, ~2,1 s do início da
  navegação), a porta MUST não aparecer e a página MUST ser descoberta direto; se o JavaScript não
  rodar, a capa MUST sair sozinha (como hoje). Sem WebGL, a porta aparece com o fundo liso
  (004 FR-033). Sem JavaScript e na impressão, não há porta.
- **FR-012**: Com "reduzir movimento" (a configuração de acessibilidade do sistema), a porta MUST
  aparecer do mesmo jeito, mas sem nenhuma animação: fundo liso (sem Faulty Terminal); a janela abre,
  minimiza e fecha sem transição; a sessão MUST ser exibida inteira de uma vez, sem digitação nem
  cursor piscando; e a página MUST ser descoberta 1 s depois de a sessão aparecer, sem fade.
  Minimizar e fechar valem como nos FR-007 e FR-008 (fechar dentro desse 1 s encerra a tentativa).

**Sessão SSH (itens 2 e 5)**

- **FR-013**: A sessão MUST exibir, nesta ordem, as linhas:
  1. `anon@<IP>:~$ ssh viper@portfolio` (o comando é digitado);
  2. `Conectando ao portfolio...`;
  3. `viper@portfolio password: ••••••••` (os pontos são digitados);
  4. `Autenticado. Bem-vindo ao Portfolio v<versão>`;
  5. `Last login: <data e hora locais, dd/mm/aaaa, hh:mm:ss> from <IP>`;
  6. `viper@portfolio:~$ ./iniciar_portfolio.sh` (o comando é digitado).
  As cores de cada trecho seguem as de hoje (prompt, texto esmaecido, "Autenticado." em verde).
- **FR-014**: `<IP>` MUST ser o IP público do visitante, o mesmo nas linhas 1 e 5, obtido durante a
  visita sem atrasar a abertura da porta.
- **FR-015**: A consulta do IP MUST ser a única exceção de recurso de terceiro desta feature e MUST
  degradar com elegância: se o IP não estiver disponível quando a janela abrir (falha, bloqueio ou
  lentidão), a sessão MUST usar `127.0.0.1` no lugar dele, sem esperar e sem erro do site no console
  (Q3). A consulta é a um serviço público, sem chave e sem cadastro, que devolve o IPv4 de quem
  pergunta, e começa quando a porta aparece. O IP MUST não ser guardado nem enviado a nenhum outro
  lugar.
- **FR-016**: `<versão>` MUST vir do campo `version` do `package.json`, a fonte única da versão do
  repositório, lida no build; a sessão MUST exibir `v<maior>.<menor>`, sem texto fixo para atualizar
  à mão. Esta feature MUST levar a versão a `2.4.0` (exibida `v2.4`): v1 é o site original, 2.0 a
  refatoração em Vue (001), e cada feature sobe a versão menor (002 → 2.1, 003 → 2.2, 004 → 2.3,
  005 → 2.4). Cada feature futura MUST subir a versão menor.
- **FR-017**: As partes digitadas (linhas 1, 3 e 6) MUST usar o TextType do Vue Bits, adaptado ao
  site (sem bibliotecas novas; o cursor pisca como os demais cursores do site).
- **FR-018**: O cursor `▊` MUST ficar só na linha em curso.
- **FR-019**: A sessão MUST chegar ao fim, até o último caractere de `./iniciar_portfolio.sh`, antes
  de a tela de boot sair; com a janela aberta, ela é exibida inteira (004 FR-030). Nenhum gesto MUST
  pular nem acelerar a sessão (004 FR-031); minimizar só a esconde (FR-007).
- **FR-020**: A sessão MUST durar no máximo 75% da atual (3,9 s → no máximo 2,9 s, do primeiro
  caractere ao fim da pausa final), mantendo a ordem e a proporção entre digitação e pausas.
- **FR-021**: O texto da sessão MUST ter contraste mínimo de 4,5:1 com o fundo da janela, que é
  opaco (o Faulty Terminal fica só atrás do ícone e da dica, cobertos pelo FR-001), e MUST caber na
  janela sem rolagem horizontal; com o IPv4 mais longo (15 caracteres), as linhas quebram dentro da
  janela.

**Controles das janelas (item 4)**

- **FR-022**: Em toda janela de terminal (Sobre, projetos, Contato, terminal da dock e janela de
  acesso), os controles MUST usar os ícones do Lucide: `minus` (minimizar), `maximize-2`
  (maximizar) e `x` (fechar), no lugar dos caracteres `−`, `□` e `✕`. Os círculos e as cores ficam
  como hoje.
- **FR-023**: Cada ícone MUST ficar centrado na horizontal e na vertical do seu círculo (diferença
  máxima de 0,5 px entre os centros) e com o mesmo tamanho nos três controles.
- **FR-024**: Os ícones dos controles MUST ser decorativos (fora da árvore de acessibilidade); os
  nomes acessíveis dos botões não mudam. Sem JavaScript, os três controles continuam desenho, com os
  mesmos ícones (004 FR-009). O `□` (maximizar) continua decorativo.

**Ícones minimizados (itens 3 e 7)**

- **FR-025**: Com a janela do Contato minimizada ou fechada, o ícone MUST ficar alinhado à borda
  esquerda do conteúdo da seção (a mesma do título "## contato/" e a do ícone do Sobre, ±1 px). A
  janela aberta continua centralizada, com até 720 px, e as animações de encolher e crescer partem e
  chegam ao ícone na posição nova.
- **FR-026**: Ícones de projetos minimizados ou fechados que estão em sequência na lista MUST ficar
  lado a lado na mesma linha, alinhados à borda esquerda da seção, e MUST quebrar para a linha de
  baixo quando não cabem, sem rolagem horizontal e na ordem dos projetos. A quantidade por linha
  segue a largura: 2 no celular de 320 px, 5 com 768 px, e os 6 numa linha a partir de 1024 px
  (notebook e desktop). Uma janela aberta MUST ocupar a própria linha inteira, interrompendo a
  sequência de ícones. O espaço vertical entre linhas de ícones MUST ser menor que o espaço entre
  janelas.
- **FR-027**: Com todos os projetos abertos, a lista MUST ficar como hoje (um projeto por linha).

**Fundo Dot Field no hero (item 6)**

- **FR-028**: O CRT Warp e a chuva Matrix MUST sair do hero, em todos os modos, e o código que só
  servia a eles MUST sair do site.
- **FR-029**: Com JavaScript e movimento, depois da porta de acesso, o fundo do hero MUST ser o Dot
  Field do Vue Bits com: Dot Radius 2, Cursor Force 0, Bulge Only desligado, Sparkle ligado, Glow
  Radius 80; os demais parâmetros nos padrões do componente (espaçamento 14 px, raio do cursor
  500 px, onda 0).
- **FR-030**: As cores MUST vir dos tokens do tema: "gradient from" = roxo do tema, "gradient to" =
  verde do tema, "glow color" = cor de brilho do tema (roxo).
- **FR-031**: Os pontos MUST não se deslocar com o ponteiro; o halo MUST seguir o mouse enquanto ele
  se move sobre o hero e sumir quando ele para.
- **FR-032**: O texto do hero (inclusive o rótulo dos botões) MUST manter contraste mínimo de 4,5:1
  sobre o Dot Field, em qualquer quadro (004 FR-038).
- **FR-033**: O Dot Field MUST não animar com o hero fora da tela ou com a aba em segundo plano; com
  "reduzir movimento" (inclusive se ligado no meio da visita) ou sem JavaScript, o fundo MUST ser
  estático (os degradês atuais). Como o Dot Field não usa WebGL, ele aparece também sem WebGL. MUST
  não haver erro no console e MUST não sobrar ouvinte de evento depois que ele sai da tela.

### Key Entities

- **Tentativa de acesso**: estado (aguardando o clique, conectando com a janela aberta, conectando
  minimizada, encerrada, concluída), a sessão em curso e o ponto em que ela está (que avança também
  com a janela minimizada).
- **Sessão SSH**: as seis linhas do FR-013, com o IP do visitante (ou `127.0.0.1`), a versão do
  portfólio e a data e hora locais da visita.
- **Versão do portfólio**: `maior.menor.correção` no `version` do `package.json` (2.4.0 nesta
  feature), exibida como `v<maior>.<menor>`.
- **Janela de terminal** (004): ganha os ícones nos controles; a janela de acesso é uma janela só
  com minimizar e fechar.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das visitas com JavaScript em que o app monta a tempo (com ou sem "reduzir
  movimento"), a página só é descoberta depois do clique no ícone `acessar_portfolio.sh` e da sessão
  completa; fechar a janela mantém a página coberta em 100% das tentativas.
- **SC-002**: Do clique no ícone à página descoberta, no máximo 4 s (abertura da janela ≤ 0,4 s,
  sessão ≤ 2,9 s, saída ≤ 0,6 s), em desktop e em celular com CPU 4× mais lenta; com "reduzir
  movimento", no máximo 1,2 s.
- **SC-003**: Com o serviço de IP respondendo, 100% das sessões mostram o IP público do visitante
  nas duas linhas; com o serviço fora do ar ou bloqueado, 100% das sessões aparecem inteiras, no
  mesmo ritmo, com `127.0.0.1`.
- **SC-004**: A versão exibida é igual à maior e à menor do `version` do `package.json` em 100% dos
  builds (nesta feature, `v2.4`).
- **SC-005**: Em todas as janelas, o centro de cada ícone de controle fica a no máximo 0,5 px do
  centro do seu círculo, e os três ícones têm o mesmo tamanho.
- **SC-006**: O ícone do Contato minimizado fica a no máximo 1 px da borda esquerda do título da
  seção, em 320 px, 768 px, 1366 px e 1920 px de largura.
- **SC-007**: Com os seis projetos minimizados, os ícones ocupam 3 linhas em 320 px, 2 linhas em
  768 px e 1 linha em 1024 px, 1366 px e 1920 px, alinhados à esquerda, na ordem dos projetos e sem
  rolagem horizontal; a altura da área de ícones cai de ~900 px para no máximo a de 3 linhas de
  ícones no celular e 1 linha no desktop.
- **SC-008**: Em 10 quadros amostrados do hero animado, em desktop e celular, todo texto do hero tem
  contraste ≥ 4,5:1.
- **SC-009**: O carregamento inicial continua ≤ 500 KB (badges externos excluídos), e o HTML, o CSS
  e o JavaScript iniciais crescem no máximo 3 KB comprimidos em relação à 004; o único pedido novo a
  terceiros é a consulta do IP.
- **SC-010**: Zero violações na auditoria automática de acessibilidade e zero erros do site no
  console, nos modos: porta de acesso, janela de acesso aberta e minimizada, página descoberta,
  "reduzir movimento" e sem JavaScript.

## Assumptions

- **Numeração**: esta feature é a 005. O boot dentro de um dispositivo (`specs/insumos/
  002-boot-dispositivo.md`, plano 09), que estava reservado como 005, passa a ser a 006, e terá de
  ser revisto à luz da porta de acesso.
- **Abertura do ícone**: um clique (ou toque) abre, como nos ícones da 004 (clique duplo não existe
  no toque). A dica é descrição do botão para leitores de tela, não um segundo elemento a focar.
- **Linha `password`**: segue o exemplo do autor (`viper@portfolio password:`, sem o `'s`).
- **Última linha**: o exemplo do autor termina no "Last login"; a linha
  `viper@portfolio:~$ ./iniciar_portfolio.sh` continua, porque é ela que "abre" o portfólio.
- **Data do "Last login"**: a data e a hora locais do visitante no momento da visita, no formato do
  exemplo (`09/10/2026, 00:34:04`), como hoje.
- **"Diminuir um pouco"**: a sessão passa a durar no máximo 75% da atual (2,9 s em vez de 3,9 s).
- **Cores do Dot Field**: "gradient from" = roxo, "gradient to" = verde, na mesma diagonal dos
  degradês do hero (roxo em cima à esquerda, verde embaixo à direita); "glow color" = roxo de
  brilho, o mesmo dos realces das janelas. As transparências são calibradas no plano para o
  contraste do FR-032.
- **Faulty Terminal**: continua ao fundo da porta, com os parâmetros da 004.
- **Dock**: continua escondida até a página ser descoberta.
- **Sem JavaScript**: nada desta feature existe além dos ícones dos controles; a página é a de hoje.
