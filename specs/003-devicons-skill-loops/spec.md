# Feature Specification: Limpeza visual, links destacados, ícones devicon e skills em loops

**Feature Branch**: `001-vue-resume-refactor` (nenhum branch criado: não há hook `before_specify`
configurado, e a 003 parte do estado da 002, que ainda não tem commit nem foi para a `main`)

**Created**: 2026-10-08

**Status**: Draft

**Input**: User description: sete pedidos do autor, enviados de uma vez (a mensagem anunciava 9; o
autor confirmou que são só estes 7):

1. "Remova as imagens de fundo (assets/img)"
2. "Troque a cor do `$ ./run srg --status` e derivados com esse run pela cor do (`# repositórios
   privados: podem abrir uma página de "não encontrado" para quem não tem acesso.`). Além disso,
   remova o `./run`, porque a aplicação cli não precisa ter o `./run` como foi colocado."
3. "Troque a cor do `> SRG-Vue · front-end` e derivados pela cor do `>` roxa, assim deixando
   destacado os links. Sobre os links, deixe todos com aquele sublinhado embaixo igual quando fica em
   hover na parte do contato, sendo o diferencial do hover o glow"
4. "Remova o `bash —` dos terminais, deixando somente sobre o que eles tratam (SRG, VSCode-Themes,
   ItaliaMi etc...)"
5. "Coloque o ícone de cada linguagem, framework etc, junto da badge no lado esquerdo. Para isso, use
   o svg do site https://devicon.dev/, por padrão, deixe todos na mesma cor do texto respeitando o
   hover das badges."
6. "Nos blocos das Skills, remova aquele carrossel automático que fica em cima dos blocos."
7. "Invés de separar por blocos na parte de Skills, separe por subpartes do skills e que usem o
   carrossel, mas somente com as imagens das ferramentas, frameworks etc. Para isso, use como exemplo
   o Text Loop do Vue-Bits para inserir as imagens das ferramentas com seus nomes."

## Contexto

### Situação atual

- **Imagens de fundo**: três imagens decorativas (`image1-bg`, `image2-bg` e `image3-bg`, ~181 KB no
  total) ficam atrás das seções Sobre, Skills e Projetos, tingidas e a 12% de opacidade (7% no
  celular).
- **Comandos dos projetos**: cada janela de projeto abre com uma linha de comando. Cinco usam o
  prefixo `./run` (`./run srg --status`, `./run italiami --describe`, `./run ocr_para_br --describe`,
  `./run qclass-bot --describe`, `./run monitoria --describe`); a dos Temas VS Code é
  `ovsx get DistroLinux/* --describe`. O texto do comando sai na cor de texto principal e o `$` em
  roxo. A nota `# repositórios privados: ...` sai em lilás apagado ("Dim Lilac"), em itálico.
- **Rótulos dos links dos projetos**: acima de cada link de projeto há uma linha `> rótulo` (ex.:
  `> SRG-Vue · front-end`): o `>` em roxo e o rótulo em verde, a mesma cor do link logo abaixo, o
  que faz rótulo e link competirem. Os nomes dos dois temas VS Code têm cor própria, com brilho de
  neon (verde-uva e vermelho).
- **Links**: os links de conteúdo (projetos, challenges, fonte do projeto comunitário, fontes da
  formação e contato) não têm sublinhado em repouso. Os de contato, challenges, comunitário e
  formação ganham um sublinhado tracejado e um brilho no hover; os dos projetos sobem 2px e ganham
  um halo roxo no hover.
- **Títulos das janelas**: `bash — sobre.txt`, `bash — <id do projeto>` (ex.: `bash — srg`,
  `bash — vscode-themes`) e `bash — contato.sh`.
- **Chips de tecnologia**: pílulas só com texto, em quatro lugares: skills, tecnologias de cada
  experiência, stack de cada projeto e stack de cada challenge. No hover o chip fica sólido, o texto
  muda de cor e entra um brilho.
- **Skills**: uma faixa contínua (carrossel automático de chips com as skills marcadas como
  destaque) fica acima de uma grade de 5 cartões, um por grupo (`linguagens_frameworks`,
  `conceitos_web`, `gestao_de_dados`, `desenho_de_processos`, `devops_qualidade`), cada um com um
  ícone Lucide e chips. São 28 skills no total.

### Fatos levantados em 2026-10-08

- **devicon** (devicon.dev, licença MIT): conjunto de ícones SVG de linguagens e ferramentas, com
  variantes de uma cor só ("plain"/"line") para a maioria. Cobre: Python, Flask, Java, Quarkus,
  TypeScript, Vue, React, Angular, Node.js, C#, .NET, MongoDB, PostgreSQL, SQL Server, MySQL, Git,
  Docker, Jenkins, RabbitMQ, Redis, Elasticsearch, Kibana, NestJS, Prisma, Nginx, Vite, Axios,
  JSON e VS Code. **Não cobre**: Valkey, Robot Framework, Robocorp, JSON Server, SAP, OCR e as
  skills que são conceitos ou práticas (Programação Web, APIs REST, Design Patterns, Singleton,
  Factory, MVC, DDD, TDD, Clean Code, Agile/Scrum, Arquitetura, Análise Funcional, Processos,
  Agentes de IA, LLMs).
- **vectorlogo.zone** (www.vectorlogo.zone/logos): coleção de logotipos SVG em cores de marca. Das
  tecnologias que faltam no devicon, tem só o SAP; não tem Valkey, Robot Framework, Robocorp nem JSON
  Server (nem Quarkus, C#, SQL Server e Prisma, que o devicon tem).
- **Cobertura nas skills**: das 28 skills, 17 têm ícone no devicon. Os grupos `conceitos_web` (2
  skills) e `desenho_de_processos` (6) não têm nenhuma; `devops_qualidade` tem 6 de 9 (sem Valkey,
  Clean Code e Agile/Scrum).
- **Text Loop do Vue Bits** (`TextAnimations/TextLoop`): um texto corre sem parar ao longo de um
  caminho (onda, círculo, infinito, arco ou linha), opcionalmente sobre uma fita colorida que
  acompanha o caminho. Pausa quando o ponteiro está em cima e fica parado com "reduzir movimento".
  Só aceita texto (não imagens).

### Relação com a constituição (v2.2.0)

- **Princípio I (Fidelidade ao Currículo)**: nenhum dado factual muda. Os comandos e os títulos das
  janelas são metáfora, não conteúdo do currículo; as 28 skills continuam todas lá.
- **Princípio II (Projetos Demonstráveis)**: os links ficam mais visíveis, e o aviso de repositório
  privado continua antes do clique.
- **Princípio III (Saída Estática)**: os ícones MUST estar nos arquivos publicados do site, sem
  carregar nada do devicon nem do vectorlogo.zone durante a visita. Os loops só acrescentam movimento: sem
  JavaScript, as skills aparecem completas e paradas.
- **Princípio IV (Acessibilidade e Desempenho)**: os loops são animação: respeitam "reduzir
  movimento", não podem esconder skill nenhuma, e o leitor de tela recebe a lista uma vez só. O
  sublinhado em repouso diferencia link de texto por forma, não só por cor. Remover as imagens tira
  ~181 KB da página.
- **Princípio V (Identidade Visual Coerente)**: as sub-partes das skills reutilizam o cabeçalho das
  sub-partes de projetos; cores dos ícones, da fita e dos links vêm dos tokens. "bash —" sai dos
  títulos, mas as janelas, os prompts e os comandos continuam.

## Clarifications

### Session 2026-10-08 (specify)

- Q: A mensagem anuncia 9 itens e traz 7. Há mais 2 pedidos? → A: Não, são só os 7.
- Q: Nos loops, o que fazer com as skills sem imagem no devicon, incluindo os grupos que não têm
  nenhuma? → A: Cada uma ganha um ícone genérico do Lucide no lugar da imagem; todo grupo tem loop.
  (Refinado no clarify: antes do genérico vem o vectorlogo.zone, e o genérico é escolhido pelo
  assunto.)

### Session 2026-10-08 (clarify)

- Q: Qual nome vai no título de cada janela de projeto, sem o "bash —"? → A: O nome do projeto, o
  mesmo do cartão (SRG, Temas VS Code, ItaliaMi, OCR de Prontuários, QClass-BOT, Monitor de Curso);
  Sobre e Contato ficam `sobre.txt` e `contato.sh`.
- Q: De onde vêm os ícones e como é o genérico? → A: Fontes em ordem: devicon; o que faltar nele vem
  do vectorlogo.zone; o que faltar nos dois usa um ícone genérico do Lucide escolhido pelo assunto da
  tecnologia. A regra vale para os loops e para todos os chips, então todo chip e todo item de loop
  tem ícone.
- Q: Quais linhas de comando passam para a cor da nota "# repositórios privados"? → A: Todas as
  linhas de comando de todas as janelas (Sobre, projetos e Contato); o `$` continua roxo.
- Q: Os nomes dos temas VS Code (neon verde-uva e vermelho) também passam para o roxo? → A: Não,
  mantêm a cor e o brilho de neon de cada tema; só os rótulos em verde passam para o roxo.
- Q: Qual forma o caminho dos loops deve ter? → A: Linha reta, com a fita do Text Loop por baixo dos
  itens.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Skills em sub-partes, cada uma com seu loop de ferramentas (Priority: P1)

*Item 7 do autor.* A seção de skills deixa de ser uma grade de cartões e passa a ter uma sub-parte
por grupo, com título próprio, e em cada sub-parte as ferramentas correm num loop, inspirado no Text
Loop do Vue Bits, com a imagem de cada ferramenta e o nome dela.

**Why this priority**: é a maior mudança visual da feature e muda como o visitante lê as skills.

**Independent Test**: abrir a seção de skills em desktop e celular e verificar uma sub-parte por
grupo, cada uma com o loop correndo, imagem e nome em cada item; repetir com "reduzir movimento" e
sem JavaScript e verificar todas as skills paradas e visíveis.

**Acceptance Scenarios**:

1. **Given** a seção de skills, **When** exibida, **Then** há 5 sub-partes, na ordem atual dos
   grupos, cada uma com título próprio abaixo do título da seção.
2. **Given** uma sub-parte, **When** está na tela e o movimento é permitido, **Then** os itens correm
   continuamente em linha reta sobre uma fita, cada um com a imagem da ferramenta à esquerda e o
   nome.
3. **Given** um loop em movimento, **When** o ponteiro fica sobre ele, **Then** ele pausa, e volta a
   correr quando o ponteiro sai.
4. **Given** "reduzir movimento" ativo, JavaScript desativado ou impressão, **When** a seção é
   exibida, **Then** todas as skills de cada grupo aparecem paradas, com imagem e nome, sem nenhuma
   cortada.
5. **Given** um leitor de tela, **When** passa pela seção, **Then** lê cada grupo como uma lista com
   todas as skills, uma vez só, sem as cópias que o loop usa para dar a volta.

---

### User Story 2 - Links destacados e sempre sublinhados (Priority: P1)

*Item 3 do autor.* Os rótulos em verde acima dos links dos projetos passam para o roxo do `>`, e o
link (em verde) fica como o elemento destacado; os nomes dos temas VS Code mantêm o neon. Todos os
links de conteúdo ficam com o sublinhado tracejado que hoje só aparece no hover do contato; o hover
passa a acrescentar só o brilho.

**Why this priority**: os links são as evidências do Princípio II. Hoje rótulo e link têm a mesma
cor, e o link só se revela no hover, o que não existe no celular.

**Independent Test**: percorrer projetos, challenges, comunitário, educação e contato; verificar que
todo link de conteúdo tem o sublinhado tracejado parado, que o hover ou o foco só acrescenta o
brilho, e que os rótulos dos projetos estão em roxo.

**Acceptance Scenarios**:

1. **Given** o cartão do SRG, **When** exibido, **Then** `SRG-Vue · front-end` e os demais rótulos
   aparecem no mesmo roxo do `>`, e os links abaixo deles em verde.
2. **Given** qualquer link de conteúdo, **When** em repouso, **Then** tem o sublinhado tracejado na
   cor do link.
3. **Given** um link de conteúdo, **When** o ponteiro passa sobre ele ou ele recebe foco pelo
   teclado, **Then** o sublinhado continua igual e o link ganha o brilho; o anel de foco continua
   visível.
4. **Given** um link de repositório privado, **When** exibido, **Then** o cadeado e a etiqueta
   "privado" continuam, e o sublinhado fica sob o caminho do repositório.
5. **Given** o cartão dos Temas VS Code, **When** exibido, **Then** os nomes Grape Glass e Shadow
   Lord mantêm a cor e o brilho de neon de cada tema.

---

### User Story 3 - Sem imagens de fundo (Priority: P2)

*Item 1 do autor.* As seções Sobre, Skills e Projetos perdem as imagens decorativas tingidas que
ficavam atrás delas.

**Why this priority**: deixa o fundo limpo e tira ~181 KB da página, sem tocar no conteúdo.

**Independent Test**: abrir a página e verificar que nenhuma seção tem imagem atrás do conteúdo e que
a página não pede nenhuma das três imagens.

**Acceptance Scenarios**:

1. **Given** as seções Sobre, Skills e Projetos, **When** exibidas em desktop e celular, **Then**
   nenhuma tem imagem de fundo, e o conteúdo fica no mesmo lugar.
2. **Given** o site publicado, **When** inspecionado, **Then** as três imagens não estão entre os
   arquivos publicados nem são pedidas pela página.

---

### User Story 4 - Ícones nos chips de tecnologia (Priority: P2)

*Item 5 do autor.* Cada chip de tecnologia ganha, à esquerda do nome, o ícone da linguagem ou
ferramenta, na mesma cor do texto do chip e acompanhando o hover. O ícone vem do devicon; o que
faltar nele vem do vectorlogo.zone; o que faltar nos dois usa um ícone genérico do Lucide pelo
assunto.

**Why this priority**: o visitante reconhece a stack pelo logotipo antes de ler, mas é acabamento.

**Independent Test**: percorrer experiências, projetos e challenges e verificar o ícone à esquerda em
todo chip, na cor do texto, mudando junto no hover; verificar que a página não pede nada ao devicon,
ao vectorlogo.zone nem a outro terceiro por causa dos ícones.

**Acceptance Scenarios**:

1. **Given** um chip de uma tecnologia coberta pelo devicon (ex.: TypeScript), **When** exibido,
   **Then** o ícone do devicon aparece à esquerda do nome, na mesma cor do texto do chip.
2. **Given** esse chip, **When** o ponteiro passa sobre ele, **Then** o ícone muda de cor junto com o
   texto.
3. **Given** um chip de tecnologia que falta no devicon mas está no vectorlogo.zone (SAP SD),
   **When** exibido, **Then** mostra o logotipo do vectorlogo.zone, na mesma cor do texto.
4. **Given** um chip de tecnologia que não está em nenhum dos dois (ex.: Valkey, OCR, LLMs),
   **When** exibido, **Then** mostra um ícone genérico do Lucide ligado ao assunto, na mesma cor.
5. **Given** um leitor de tela, **When** lê um chip, **Then** ouve só o nome da tecnologia.

---

### User Story 5 - Sem a faixa automática no topo das skills (Priority: P2)

*Item 6 do autor.* A faixa contínua de chips que corre acima dos grupos de skills sai.

**Why this priority**: com os loops por sub-parte (US1), a faixa repetiria as mesmas skills.

**Independent Test**: abrir a seção de skills e verificar que entre o título da seção e a primeira
sub-parte não há faixa nenhuma, com ou sem movimento.

**Acceptance Scenarios**:

1. **Given** a seção de skills, **When** exibida, **Then** depois do título e da linha de comando
   vem direto a primeira sub-parte.

---

### User Story 6 - Comandos sem `./run` e em tom de comentário (Priority: P3)

*Item 2 do autor.* Os comandos das janelas de projeto perdem o `./run` (ex.: `$ srg --status`), e o
texto dos comandos de todas as janelas (Sobre, projetos e Contato) passa para a cor da nota de
repositórios privados.

**Why this priority**: ajuste de tom da metáfora; o comando passa a ser contexto, e o conteúdo da
janela ganha destaque.

**Independent Test**: abrir cada janela de terminal e verificar os comandos na cor da nota de
repositórios privados, inclusive durante e depois da digitação, e os de projeto sem `./run`.

**Acceptance Scenarios**:

1. **Given** a janela do SRG, **When** exibida, **Then** o comando é `$ srg --status`, e o texto
   está na cor da nota `# repositórios privados: ...`.
2. **Given** as janelas Sobre e Contato, **When** exibidas, **Then** `cat sobre.txt`,
   `whois vittorio --info` e `./contato.sh --all` estão na mesma cor.
3. **Given** uma janela em animação, **When** o comando está sendo digitado, **Then** a parte
   digitada já está na cor final, sem troca de cor no fim.

---

### User Story 7 - Títulos das janelas sem `bash —` (Priority: P3)

*Item 4 do autor.* As barras de título das janelas mostram só o assunto da janela.

**Why this priority**: limpeza de texto repetido, sem efeito no conteúdo.

**Independent Test**: verificar o título de todas as janelas (Sobre, cada projeto e Contato).

**Acceptance Scenarios**:

1. **Given** qualquer janela de projeto, **When** exibida, **Then** o título é só o nome do projeto
   (ex.: `SRG`, `Temas VS Code`, `ItaliaMi`), sem `bash —`.
2. **Given** as janelas Sobre e Contato, **When** exibidas, **Then** os títulos são `sobre.txt` e
   `contato.sh`.

---

### Edge Cases

- **Tecnologia sem logotipo no devicon nem no vectorlogo.zone** (Valkey, OCR, Robot Framework,
  Robocorp, JSON Server, LLMs, conceitos como DDD e TDD): ícone genérico do Lucide pelo assunto,
  alinhado com os demais.
- **Logotipo de várias cores** (vectorlogo.zone e algumas variantes do devicon): reduzido a uma cor
  só, ele continua reconhecível (sem virar um borrão); se não der, usa-se outra variante do mesmo
  logotipo.
- **Variações de nome da mesma tecnologia** ("Vue 3" e "Vue.js"; "Python (Flask)"): usam o mesmo
  ícone da tecnologia principal (Vue; Python).
- **Grupo de skills com poucos itens** (`conceitos_web` tem 2): o loop repete os itens até preencher
  o caminho, sem buracos.
- **Grupo de skills sem nenhuma ferramenta no devicon** (`conceitos_web`, `desenho_de_processos`):
  o loop existe do mesmo jeito, com os ícones genéricos do Lucide (FR-022).
- **Tela de 320px**: os loops cabem na largura, sem rolagem horizontal, e os nomes continuam
  legíveis (no mínimo o tamanho do texto dos chips).
- **"Reduzir movimento" ligado no meio da visita**: os loops param na hora e mostram todas as skills.
- **Loop fora da tela**: não anima enquanto não está visível.
- **Link que quebra em duas linhas** (caminhos longos no celular): o sublinhado acompanha as duas
  linhas.
- **Badge do Open VSX que não carrega**: o domínio que aparece no lugar fica sublinhado como os
  outros links.
- **Toque (sem hover)**: o sublinhado parado identifica o link; o brilho só aparece no foco.
- **Alto contraste do sistema**: ícones, sublinhados e itens dos loops continuam visíveis.
- **Impressão**: sem brilho; sublinhados, ícones e todas as skills visíveis e paradas.

## Requirements *(mandatory)*

### Functional Requirements

**Imagens de fundo (item 1)**

- **FR-001**: Nenhuma seção MUST exibir imagem decorativa de fundo; as três imagens MUST sair do site
  publicado.
- **FR-002**: Remover as imagens MUST não deslocar o conteúdo das seções nem deixar espaço reservado
  no lugar delas.

**Comandos dos projetos (item 2)**

- **FR-003**: Os comandos das janelas de projeto MUST perder o prefixo `./run `: `srg --status`,
  `italiami --describe`, `ocr_para_br --describe`, `qclass-bot --describe` e
  `monitoria --describe`.
- **FR-004**: O texto de toda linha de comando de toda janela de terminal (Sobre, projetos e Contato)
  MUST usar a cor da nota de repositórios privados (Dim Lilac), com contraste mínimo de 4,5:1 sobre o
  fundo da janela; o `$` continua roxo, como em todos os prompts. Trechos com destaque próprio dentro
  de uma linha (a mensagem verde "Conexão estabelecida..." do Contato e o rodapé verde dos projetos)
  mantêm o destaque.
- **FR-005**: Durante a digitação (feature 002), o trecho digitado MUST já estar na cor final do
  comando.

**Rótulos e links (item 3)**

- **FR-006**: Os rótulos dos links de projeto (a linha `> rótulo` acima de cada link) que hoje saem em
  verde MUST usar o roxo do `>`. Os nomes dos temas VS Code (Grape Glass e Shadow Lord) mantêm a cor
  e o brilho de neon de cada tema.
- **FR-007**: Todo link de conteúdo (links dos projetos, challenges, fonte do projeto comunitário,
  fontes da formação e contato) MUST exibir em repouso o sublinhado tracejado de 1px, na cor do
  link, que hoje aparece no hover do contato.
- **FR-008**: No hover e no foco pelo teclado, o link de conteúdo MUST manter o sublinhado e ganhar
  o brilho (halo luminoso na cor do link; no badge dos Temas VS Code, na cor do tema do badge); o
  brilho é a única diferença em relação ao repouso. O anel de foco continua visível.
- **FR-009**: No link de repositório privado, o sublinhado MUST ficar sob o caminho do repositório; o
  cadeado e a etiqueta "privado" continuam como estão. No link com badge (Temas VS Code), o
  sublinhado MUST ficar sob o badge, ou sob o domínio quando o badge não carrega.
- **FR-010**: Os controles de navegação (menu, logotipo, botões do hero, "▼ scroll" e link de pular
  para o conteúdo) não são links de conteúdo: MUST não receber o sublinhado e mantêm o visual atual
  (confirmado pelo autor no analyze).

**Títulos das janelas (item 4)**

- **FR-011**: O título de toda janela de terminal MUST não conter `bash —`. Nas janelas de projeto, o
  título MUST ser o nome do projeto, o mesmo exibido no cartão; nas janelas Sobre e Contato, o nome
  do arquivo (`sobre.txt`, `contato.sh`).

**Ícones nos chips (item 5)**

- **FR-012**: Todo chip de tecnologia (experiências, stack dos projetos e dos challenges) MUST exibir
  um ícone à esquerda do nome.
- **FR-013**: O ícone de cada tecnologia MUST vir, nesta ordem: do devicon; se faltar nele, do
  vectorlogo.zone; se faltar nos dois, de um ícone genérico do Lucide escolhido pelo assunto da
  tecnologia (ex.: Valkey → banco de dados, TDD → teste). Os ícones MUST estar nos arquivos
  publicados do próprio site e aparecer sem JavaScript, sem nenhuma requisição a terceiros durante a
  visita (Princípio III), e a licença e a origem de cada fonte MUST ficar registradas no
  repositório.
- **FR-014**: Os ícones MUST ter uma cor só, a mesma do texto do chip (sem as cores das marcas, venham
  do devicon, do vectorlogo.zone ou do Lucide), e MUST acompanhar a mudança de cor do texto no hover
  do chip.
- **FR-015**: Os ícones MUST ser decorativos: o nome acessível do chip continua sendo só o nome da
  tecnologia.
- **FR-016**: Nenhum chip nem item de loop MUST mostrar imagem quebrada ou espaço vazio no lugar do
  ícone.
- **FR-017**: A associação tecnologia → ícone MUST ficar num registro único, usado pelos chips e
  pelos loops; variações de nome da mesma tecnologia ("Vue 3", "Vue.js") usam o mesmo ícone, e
  "Linguagem (Framework)" usa o ícone da linguagem. Toda tecnologia exibida MUST ter entrada no
  registro: tecnologia nova sem entrada MUST ser apontada na verificação automática antes da
  publicação.
- **FR-018**: O ícone MUST ter a altura do texto do chip e não aumentar a altura do chip.

**Faixa das skills (item 6)**

- **FR-019**: A faixa contínua acima dos grupos de skills MUST ser removida, com e sem movimento, sem
  nada no lugar.

**Skills em sub-partes com loops (item 7)**

- **FR-020**: A seção de skills MUST apresentar cada grupo como uma sub-parte, com título no nível
  abaixo do título da seção, no mesmo visual das sub-partes de projetos e na ordem atual dos grupos.
  Os cartões de grupo saem.
- **FR-021**: Cada sub-parte MUST mostrar suas skills num loop inspirado no Text Loop do Vue Bits, na
  forma "linha": os itens correm continuamente em linha reta, da direita para a esquerda, sobre uma
  fita na cor do tema que atravessa a largura do loop, e cada item é a imagem da ferramenta (FR-013,
  mesma regra de cor do FR-014) seguida do nome.
- **FR-022**: As skills seguem a mesma ordem de fontes do FR-013. As que não estão no devicon nem no
  vectorlogo.zone (hoje: Programação Web, APIs REST, Design Patterns, Singleton, Factory, MVC, DDD,
  TDD, Valkey, Clean Code e Agile/Scrum) MUST entrar no loop com o ícone genérico do Lucide pelo
  assunto, na mesma regra de cor do FR-014. Todo grupo tem loop, inclusive `conceitos_web` e
  `desenho_de_processos`, que não têm nenhuma skill com logotipo.
- **FR-023**: O loop MUST pausar enquanto o ponteiro estiver sobre ele e retomar quando sair.
- **FR-024**: O loop MUST ficar parado enquanto estiver fora da tela.
- **FR-025**: Sem JavaScript, com "reduzir movimento" (inclusive se ativado no meio da visita) e na
  impressão, cada sub-parte MUST mostrar todas as suas skills paradas, com imagem e nome, sem nenhuma
  cortada ou escondida.
- **FR-026**: Tecnologias assistivas MUST receber cada grupo como uma lista com todas as skills, uma
  vez só; as cópias que o loop usa para dar a volta MUST ficar fora da árvore de acessibilidade.
- **FR-027**: Os nomes nos loops MUST ter, em qualquer largura de tela, no mínimo o tamanho do texto
  dos chips, com contraste mínimo de 4,5:1 sobre a fita ou o fundo.
- **FR-028**: A velocidade do loop MUST permitir ler os nomes: um item leva no mínimo 6 s para
  atravessar a largura visível do loop.
- **FR-029**: O loop MUST ter altura fixa desde o primeiro paint: começar, pausar ou parar não
  desloca nada abaixo dele. A escolha entre o loop e a versão parada (FR-025) MUST acontecer antes do
  primeiro paint, para a página nunca trocar de uma para a outra durante o carregamento.
- **FR-030**: O ícone Lucide de cada grupo (feature 002) MUST continuar, ao lado do título da
  sub-parte.

**Transversais**

- **FR-031**: Todo o conteúdo (skills, rótulos, títulos, comandos) MUST continuar no HTML
  pré-renderizado e legível sem JavaScript.
- **FR-032**: Cores, tamanhos e espaçamentos novos (ícones, fita, sublinhados, brilho) MUST vir dos
  tokens do tema (Princípio V).
- **FR-033**: O layout MUST continuar sem rolagem horizontal a partir de 320px, e o console MUST
  continuar sem erros nem avisos.
- **FR-034**: No modo de alto contraste do sistema, ícones, sublinhados e itens dos loops MUST
  continuar visíveis.

### Key Entities

- **Ícone de tecnologia**: nome da tecnologia (como aparece nos chips e nas skills) → ícone e sua
  fonte (devicon, vectorlogo.zone ou Lucide pelo assunto, nessa ordem de preferência). Um registro
  único, usado pelos chips e pelos loops; toda tecnologia exibida tem entrada.
- **Grupo de skills**: id (título da sub-parte), ícone Lucide do grupo e skills. A marcação de
  "destaque" de cada skill existia só para a faixa removida (FR-019) e deixa de ter uso.
- **Projeto**: o comando temático perde o `./run`; o título da janela passa a ser o nome do
  projeto (campo que já existe, sem campo novo).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A página faz 0 requisições às três imagens de fundo, e os arquivos publicados ficam
  ~181 KB menores.
- **SC-002**: A página tem 0 ocorrências de `./run` e de `bash —`.
- **SC-003**: 100% dos links de conteúdo têm o sublinhado em repouso e ganham o brilho no hover e no
  foco; 100% dos rótulos de link de projeto sem neon estão no roxo do `>`, e os 2 nomes de tema
  continuam com o neon.
- **SC-004**: 100% dos chips e dos itens de loop mostram um ícone (devicon quando existe), 0 mostram
  ícone quebrado ou espaço vazio, e a página faz 0 requisições a terceiros por causa dos ícones.
- **SC-005**: A seção de skills tem 5 sub-partes com loop, 0 faixas acima delas e as 28 skills de
  hoje.
- **SC-006**: Com JavaScript desativado, com "reduzir movimento" e na impressão, 100% das skills
  aparecem paradas e inteiras na primeira exibição.
- **SC-007**: Os loops causam 0 de deslocamento de layout medível, e a seção não tem rolagem
  horizontal em 320px.
- **SC-008**: A auditoria automática de acessibilidade continua com 0 violações, e o console com 0
  erros e 0 avisos, em desktop e mobile.
- **SC-009**: O peso da página entregue (HTML, CSS e JS iniciais) cresce no máximo 15 KB comprimidos
  em relação à versão anterior a esta feature.

## Assumptions

- **Escopo**: uma só feature cobre os itens, com uma história de usuário por item (6 e 7 em
  histórias separadas, porque são testáveis em separado) e a rastreabilidade abaixo.
- **Rótulos (item 3)**: "derivados" são todos os rótulos `> rótulo` dos projetos que hoje saem em
  verde (SRG, ItaliaMi, OCR, QClass-BOT).
- **"Todos os links" (item 3)**: os links de conteúdo do FR-007. Menu, botões e o link de pular para
  o conteúdo são controles de navegação com visual próprio (FR-010).
- **Chips (item 5)**: "badge" é o chip de tecnologia, nos lugares onde aparece (as skills deixam de
  ter chips com a US1). Variante do ícone: a de uma cor só do devicon quando existe; senão, a
  original reduzida a uma cor.
- **Imagens dos loops (item 7)**: são os mesmos ícones do item 5 (mesmo registro), na cor do texto.
- **Visual do loop (item 7)**: do Text Loop vêm a fita, o separador entre os itens e a pausa ao
  passar o ponteiro; a forma é a "linha" (decisão do autor). Os nomes mantêm a grafia original
  (sem caixa alta), porque a grafia faz parte do nome das tecnologias.
- **Pausa dos loops**: pausa ao passar o ponteiro, como o Text Loop, e parada total com "reduzir
  movimento". A página não tem um botão para pausar os loops, a mesma limitação aceita na 001 quando
  o autor retirou o controle de movimento (FR-035 da 001).
- **Numeração**: esta feature usa o número 003; o insumo do boot em dispositivo
  (`specs/insumos/002-boot-dispositivo.md`) passa a ser a 004.
- **PDF do currículo**: nada muda no conteúdo factual, então o PDF não precisa de atualização por
  esta feature.

## Rastreabilidade

| Item do autor | História | Requisitos |
|---|---|---|
| 1. Remover imagens de fundo | US3 | FR-001, FR-002 |
| 2. Cor dos comandos (todas as janelas) e fim do `./run` | US6 | FR-003 a FR-005 |
| 3. Rótulos roxos e links sublinhados | US2 | FR-006 a FR-010 |
| 4. Títulos sem `bash —` | US7 | FR-011 |
| 5. Ícones nos chips (devicon, vectorlogo.zone, Lucide) | US4 | FR-012 a FR-018 |
| 6. Sem faixa no topo das skills | US5 | FR-019 |
| 7. Skills em sub-partes com loops | US1 | FR-020 a FR-030 |
