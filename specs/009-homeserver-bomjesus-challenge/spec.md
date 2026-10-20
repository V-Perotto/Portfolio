# Feature Specification: Challenge Bom Jesus (FAE) e o side-project DebianServer

**Feature Branch**: `009-homeserver-bomjesus-challenge`, criado a partir da `main` (em 965f4ee, o mesmo
commit da `001-vue-resume-refactor`), a pedido do autor

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: dois pedidos do autor:

1. "Adicione mais um projeto challenge de Gestão Acadêmica (Alunos e Professores):
   https://github.com/V-Perotto/bomjesus-challenge."
2. "Adicione um Side-Project (mas pode ficar na aba de projetos) que será referente ao meu servidor
   caseiro (em produção desde o dia 1 de Outubro), nesse caso, quero que seja colocado de exemplo a
   seguinte imagem em anexo como prova de existência. Além de explicar brevemente sobre cada um dos
   aplicativos usados no servidor (Ente Photos, OpenWebUI, Kiwix, Syncthing e SearXNG)."

O autor pediu que toda dúvida sobre o uso dos apps e os detalhes técnicos do servidor fosse perguntada
a ele. As respostas estão em Clarifications.

## Contexto

### Situação atual

- **Projetos** (`#projetos`): 6 janelas de projeto, uma por linha, na ordem de relevância (Princípio II):
  SRG → Temas VS Code → ItaliaMi → OCR de Prontuários → QClass-BOT → Monitor de Curso. Cada janela
  digita a linha de comando do projeto e mostra, como saída, o nome e o subtítulo (com o selo
  `EM DESENVOLVIMENTO` no SRG), o propósito, `papel`, `tipo` e `contexto` (quando existe), os chips de
  stack com ícone e, à direita a partir de 900 px, as evidências (links, badges, avisos de repositório
  privado). O rodapé tem a etiqueta (`[projeto pessoal]`) e `exit 0`. Minimizadas ou fechadas, viram
  ícones lado a lado (005 FR-026: 2 por linha em 320 px, 5 em 768 px, os 6 numa linha a partir de
  1024 px).
- **Tipos de projeto**: `pessoal`, `acadêmico`, `open source` e `profissional`. Nenhuma janela de
  projeto mostra imagem: as únicas imagens de conteúdo da página são os badges de downloads dos Temas
  VS Code (externos).
- **Challenges** (sub-parte de Projetos): janela de editor `~/projetos/challenges` com 7 arquivos YAML
  (`AAAA-MM_<slug>.yml`), do mais recente para o mais antigo pela data de criação; o primeiro é
  `2026-09_cieepr.yml` (CIEE-PR). Cada arquivo traz `nome`, `criado`, `resumo`, `stack` e `repositorio`;
  maximizada, a janela mostra os 7 cartões.
- **Comando `open`** (007, 008): 10 opções, geradas dos dados: `experiencia`, os 6 projetos pelo nome
  em slug, `challenges`, `comunitario` e `educacao`.
- **Versão**: `package.json` em `2.7.0` (exibida `v2.7` na sessão da porta, 005 FR-016).
- **Repositório do challenge** (lido em 2026-10-20): público, criado em 2026-10-19, descrição "Desafio
  Técnico para a vaga de Analista de Sistemas para o Bom Jesus (FAE Business)". O README o apresenta
  como "Bom Jesus — Gestão de Alunos e Professores": API REST em Java 21 + Spring Boot para cadastrar,
  consultar, atualizar e excluir alunos e professores, com interface web em Vue 3 + TypeScript, banco
  H2 em memória e Docker Compose.
- **Captura de tela do servidor** (anexo do autor, 1396 × 809 px, PNG de 883 KB): o painel do CasaOS em
  "Tuesday, October 20, 2026", 11:20. Mostra o relógio, o status do sistema (CPU 3%, 2,4 W, 35 °C; RAM
  26% de 11,6 GB), o disco ("Healthy", 122,07 GB usados de 459,64 GB), o gráfico de rede da interface
  `enp1s0` e os apps App Store, Files, OpenWebUI, Syncthing, Watchtower, SearXNG, Kiwix Server e Ente
  Photos. Não mostra IP, domínio, porta, usuário nem nome de rede.

### Relação com a constituição (v3.1.0)

- **Princípio I (Fidelidade ao Currículo)**: nem o challenge nem o servidor estão no PDF do currículo
  (2026-04-21), e as tecnologias novas também não (Spring Boot, H2, Debian, CasaOS, Tailscale, Ollama,
  Samba). Pelo precedente registrado desde a 002, o site está certo e o autor atualiza o PDF. Todo fato
  do servidor vem das respostas do autor (Clarifications) ou da captura; nada é inferido.
- **Princípio II (Projetos Demonstráveis)**: o challenge tem repositório público. O DebianServer **não
  cabe** em nenhuma das 3 exceções de hoje (confidencial, acadêmico, repositório privado): a evidência
  é uma captura de tela publicada no próprio site. Decisão do autor (specify Q3): **emendar a
  constituição para v3.1.0** (MINOR) com uma 4ª exceção, *infraestrutura pessoal sem acesso público,
  comprovada por captura de tela datada publicada no site*, antes do `/speckit-plan`, via
  `/speckit-constitution`, num commit dedicado. Feita em 2026-10-20 (commit `cbf86ae`). A ordem por relevância é do autor (DebianServer em 2º).
- **Princípio III (Saída Estática)**: a captura é um arquivo estático do próprio site; nenhum recurso de
  terceiros. Sem JavaScript, a janela do DebianServer, a captura e o challenge novo ficam visíveis.
- **Princípio IV (Acessibilidade e Desempenho)**: a captura precisa de texto alternativo descritivo,
  formato de imagem moderno e carregamento só perto da tela (`loading="lazy"`, fora da dobra), com
  espaço reservado para não deslocar o layout; sem rolagem horizontal de 320 px ao desktop.
- **Princípio V (Identidade Visual Coerente)**: a janela do DebianServer reaproveita a janela de
  projeto; o challenge novo reaproveita a janela de editor e o cartão de challenge. As peças novas são a
  captura dentro da janela de projeto, o visualizador dela (no padrão da janela maximizada) e a lista
  de apps com ícones (no padrão dos chips), todas com os tokens existentes (borda, raio, cores).

### Requisitos de features anteriores que esta feature substitui

- **002 FR-014 a FR-016 e 006 FR-001 a FR-019** (challenges): passam a ser 8, com o Bom Jesus (FAE) em 1º
  (FR-001 a FR-005).
- **Ordem dos projetos** (decisão da 002, "SRG → Temas VS Code → … → Monitor de Curso"): o DebianServer
  entra em 2º (FR-006).
- **Tipos de projeto** (001): ganha o tipo `side-project` (FR-008).
- **Princípio II / 002 FR-005 (evidência)**: ganha a evidência por captura de tela, depois da emenda
  v3.1.0 (FR-014 a FR-019).
- **005 FR-026** (ícones minimizados: 2 / 5 / 6 por linha): com 7 projetos, a quantidade por linha a
  partir de 1024 px passa a ser a que couber, ainda numa linha só se couber (FR-024).
- **007 FR-001 a FR-008 / 008 FR-015 a FR-018** (opções do `open`): passam a ser 11, com `debianserver`
  depois de `srg` (FR-023).
- **008 FR-019**: a versão sobe para `2.8.0` (FR-025).

## Clarifications

### Session 2026-10-20 (specify)

Perguntas feitas ao autor antes de escrever a spec, a pedido dele ("quaisquer dúvidas de como eu estou
usando esses apps no servidor e quais detalhes técnicos sobre ele, peço que interrompa com uma
pergunta").

- Q1: Qual nome o servidor tem na janela do projeto? → A: **DebianServer**, com o subtítulo **Meu
  homeserver** (título da janela `DebianServer`, opção do `open` `debianserver`).
- Q2: Em que posição ele entra na lista de Projetos? → A: **2º, depois do SRG**.
- Q3: A captura de tela é a única evidência? → A: **Sim, e a constituição é emendada** (v3.1.0) com
  uma 4ª exceção do Princípio II: infraestrutura pessoal sem acesso público, comprovada por captura de
  tela datada publicada no site.
- Q4: Como o autor acessa o servidor? → A: **Tailscale** (VPN), sem porta aberta na internet. Nenhum
  IP, domínio, porta ou nome de rede vai para o site.
- Q5: Qual é o sistema? → A: **CasaOS sobre Debian 13** (trixie), gerenciando os apps em containers
  Docker.
- Q6: Qual é o hardware? → A: **notebook reaproveitado**, Lenovo ideapad 330-15IKB (81FE), com CPU
  Intel Core i5-8250U.
- Q7: O Watchtower, que aparece na captura, entra na explicação dos apps? → A: **Sim, como 6º app.**
- Q8: Como o autor usa o Ente Photos? → A: **backup automático das fotos e vídeos do celular**, com as
  fotos guardadas (criptografadas de ponta a ponta) no disco do próprio servidor, sem nuvem de
  terceiros.
- Q9: Como usa o OpenWebUI? → A: interface de chat com **modelos locais (Ollama)**: o OpenWebUI do
  servidor serve de **ponte para o desktop do autor**, que roda a IA local numa **RTX 3060 de 12 GB**;
  e faz **busca na web pelo SearXNG** do servidor.
- Q10: O que o Kiwix serve? → A: **por enquanto, só uma cópia da Wikipedia em português**.
- Q11: O que o Syncthing sincroniza? → A: **o cofre do Obsidian, entre o desktop, o celular e o
  servidor** (o celular roda o Syncthing só para o cofre).
- Q12: Como o celular chega aos outros arquivos do servidor? → A: **por SMB (Samba)**, no app Meus
  Arquivos da Samsung (Armazenamento em rede), à parte do Syncthing.
- Q13: Como usa o SearXNG? → A: **só como fonte de busca web do OpenWebUI**, não direto no navegador.
- Q14: Quais tecnologias são os chips de stack? → A: **Debian, CasaOS, Docker, Tailscale, Ollama e
  Samba**.

### Session 2026-10-20 (clarify)

- Q: Quando o visitante clica no print do painel, como ele abre em tamanho real? → A: **Num
  visualizador na própria página**, por cima dela, como a janela maximizada: diálogo modal que fecha
  com Esc, ✕ ou clique fora e devolve o foco ao print. Sem JavaScript, o print é um link para a imagem
  original em nova aba.
- Q: Qual nome o challenge tem no cartão e no arquivo da árvore? → A: **Bom Jesus (FAE)**, citando a
  FAE Business, como na descrição do repositório; arquivo `2026-10_bom-jesus-fae.yml`.
- Q: O que a linha `papel =` do DebianServer diz? → A: **`Autor: instalação, configuração e
  manutenção`**, no formato do papel do SRG.
- Q: Na lista dos 6 apps, cada app aparece com ícone? → A: **Sim, o ícone de cada app, monocromático,
  na cor do texto**, como os chips de stack (6 ícones novos, pela regra de ícones da 003).

### Session 2026-10-20 (analyze)

Correções autorizadas pelo autor depois do `/speckit-analyze`.

- C1: O Princípio II exige que a exceção fique explícita no projeto, e nada dizia que o DebianServer é a
  exceção "sem acesso público". → A: uma linha de comentário gerada acima da captura,
  `# sem acesso público: a evidência é a captura do painel`, no estilo do aviso de repositório privado
  (FR-015).
- I1: O FR-018 pedia que a captura abrisse também com Espaço, mas ela é um link, que só abre com Enter.
  → A: clique, toque e Enter, como no cenário 4 da US1 (FR-018).
- I2: A versão exibida com 700 px faria o desktop a 2× baixar a de 1396 px (a coluna pede ~722–768 px).
  → A: a versão exibida passa a ter 800 px (research R4, R5).

### Session 2026-10-20 (depois da implementação)

- Q: A data de entrada em produção do DebianServer leva o dia? → A: **Sim, `desde = 01 OUT 2026`**
  (pedido do autor). A legenda da captura continua só com o mês (`· OUT 2026`): o dia vale só para o
  `desde`. O campo `inProductionSince` passa a guardar `AAAA-MM-DD`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver o servidor caseiro como projeto, com a prova (Priority: P1)

*Item 2 do autor.* Um recrutador que chega a Projetos vê, logo depois do SRG, a janela do
DebianServer: um servidor caseiro em produção desde outubro de 2026, num notebook reaproveitado, com o
sistema, a forma de acesso e a stack. A janela explica em uma linha cada app que roda nele (Ente
Photos, OpenWebUI, Kiwix, Syncthing, SearXNG e Watchtower) e mostra, no lugar dos links, a captura de
tela datada do painel como prova de que ele existe. A captura pode ser vista em tamanho real.

**Why this priority**: é o item novo de maior valor. Mostra infraestrutura, self-hosting e IA local,
que nenhum outro projeto mostra, e depende da emenda da constituição.

**Independent Test**: em Projetos, abrir a janela do DebianServer em 320, 768, 1366 e 1920 px; conferir
cada fato contra as Clarifications, a captura (texto alternativo, data, tamanho real), o carregamento
só perto da tela e a ausência de rolagem horizontal; repetir sem JavaScript, com "reduzir movimento" e
na impressão.

**Acceptance Scenarios**:

1. **Given** a página com JavaScript, **When** o visitante chega a Projetos, **Then** as janelas
   aparecem na ordem SRG → DebianServer → Temas VS Code → ItaliaMi → OCR de Prontuários → QClass-BOT →
   Monitor de Curso.
2. **Given** a janela do DebianServer, **When** ela termina de digitar o comando, **Then** a saída
   mostra `DebianServer — Meu homeserver` com o selo `EM PRODUÇÃO`, o propósito, `papel`,
   `tipo = side-project`, `desde = 01 OUT 2026`, o hardware, o sistema e o acesso, os 6 chips de stack
   (Debian, CasaOS, Docker, Tailscale, Ollama, Samba), cada um com ícone, e a lista dos 6 apps, cada um
   com o ícone dele e uma explicação de uma linha; o rodapé é `[side-project]  exit 0`.
3. **Given** a janela do DebianServer em 900 px ou mais, **When** o visitante a vê, **Then** a captura
   fica na coluna da direita (onde os outros projetos têm os links), inteira, sem cortes, com a linha
   `# sem acesso público: a evidência é a captura do painel` acima e a legenda que diz que é o painel do
   servidor e a data da captura; abaixo de 900 px, ela fica depois das
   informações, na largura da janela.
4. **Given** a captura, **When** o visitante a escolhe (clique, toque, Enter), **Then** um visualizador
   abre por cima da página com a imagem em tamanho real (até o limite da tela), a página por trás fica
   desfocada e inalcançável, e Esc, o ✕ ou um clique fora fecham o visualizador, com o foco de volta
   no print e a página na mesma posição.
5. **Given** um leitor de tela, **When** o visitante chega à captura, **Then** ouve um texto
   alternativo que descreve o painel (data, uso de CPU, RAM e disco, e os apps visíveis).
6. **Given** uma conexão lenta, **When** a página carrega, **Then** a captura só é baixada quando a
   janela se aproxima da tela, e o espaço dela já está reservado (nada se desloca quando ela chega).
7. **Given** a página sem JavaScript (ou impressa), **When** o visitante chega a Projetos, **Then** a
   janela do DebianServer está completa, com a captura e os 6 apps visíveis.
8. **Given** a janela do DebianServer, **When** o visitante a minimiza ou fecha, **Then** ela encolhe
   até o ícone de projeto, ao lado dos outros, como as demais janelas de projeto.

---

### User Story 2 - Ver o challenge Bom Jesus (FAE) (Priority: P2)

*Item 1 do autor.* Na janela de Challenges, o desafio do Bom Jesus aparece primeiro, por ser o mais
recente: gestão acadêmica de alunos e professores, com a stack e o link para o repositório público.

**Why this priority**: é um item de dados, no mesmo formato dos 7 challenges existentes; não tem peça
nova, só a stack com 2 tecnologias novas.

**Independent Test**: abrir a janela de Challenges, conferir que `2026-10_bom-jesus-fae.yml` é o 1º arquivo
(`1 / 8`) com todos os fatos do cartão, maximizar e conferir o cartão; repetir sem JavaScript.

**Acceptance Scenarios**:

1. **Given** a janela de Challenges, **When** ela termina de digitar `code ~/projetos/challenges`,
   **Then** a árvore tem 8 arquivos, o primeiro é `2026-10_bom-jesus-fae.yml`, aberto, e o rodapé mostra
   `1 / 8`.
2. **Given** o arquivo do Bom Jesus, **When** o visitante o lê, **Then** ele traz `nome: Bom Jesus (FAE)`,
   `criado: OUT 2026`, o resumo (gestão acadêmica: API REST e interface web para cadastrar, consultar,
   atualizar e excluir alunos e professores), a stack (Java, Spring Boot, Vue 3, TypeScript, H2,
   Docker) e `repositorio: github.com/V-Perotto/bomjesus-challenge`, como link que abre em nova aba.
3. **Given** a janela de Challenges maximizada (ou a página sem JavaScript), **When** o visitante vê os
   cartões, **Then** o do Bom Jesus é o 1º dos 8, com data, nome, resumo, os 6 chips com ícone e o link.

---

### User Story 3 - Abrir o DebianServer pelo terminal da dock (Priority: P3)

*Decorre do item 2.* Como todo projeto, o DebianServer vira opção do `open`: `open debianserver` leva a
página até a janela dele e a abre.

**Why this priority**: as opções do `open` já são geradas dos dados (007), então a opção nova vem quase
sozinha; o que muda é a lista do `help` e do Tab.

**Independent Test**: no terminal da dock, rodar `open debianserver` com a janela aberta, minimizada e
fechada; conferir a saída, o `help`, o Tab e o foco.

**Acceptance Scenarios**:

1. **Given** o terminal da dock aberto no hero, **When** o visitante roda `open debianserver`, **Then**
   a saída mostra `→ ~/projetos/debianserver`, o terminal minimiza sozinho, a página vai até a janela do
   DebianServer e ela fica aberta, com o foco nela.
2. **Given** o terminal da dock, **When** o visitante roda `help` ou digita `open deb` e aperta Tab,
   **Then** `debianserver` aparece na lista de opções depois de `srg`, e o Tab completa `open
   debianserver`.

---

### Edge Cases

- **A captura não carrega** (arquivo ausente, rede caída): o texto alternativo aparece no espaço
  reservado; o resto da janela continua igual e o console não ganha erro do site. O visualizador, se
  aberto, mostra o mesmo texto alternativo.
- **Visualizador no celular**: a imagem cabe na largura da tela (sem rolagem horizontal) e o ✕ fica ao
  alcance do toque (alvo de no mínimo 44 × 44 px); o "voltar" do navegador não precisa fechá-lo.
- **Visualizador aberto e o terminal da dock**: valem as regras da janela maximizada (Ctrl+Alt+T não
  abre o terminal por cima; a dock fica inalcançável).
- **Celular de 320 px**: a captura encolhe até a largura da janela (fica pequena, mas abre em tamanho
  real); as linhas de hardware, sistema e acesso e as explicações dos apps quebram dentro da janela, sem
  rolagem horizontal.
- **"Reduzir movimento"**: nenhuma animação nova; a janela do DebianServer se comporta como as outras
  (digitação desligada, troca direta ao minimizar).
- **Impressão**: a janela do DebianServer sai completa, com a captura; o challenge novo sai entre os
  cartões, como os outros.
- **Captura desatualizada** (o painel muda, um app entra ou sai): a captura é uma prova datada; a legenda
  diz a data dela, e trocar a captura é trocar o arquivo e a data, sem mexer no resto. Um app novo na
  lista não exige captura nova.
- **App na captura e não na lista** (App Store e Files, que são do próprio CasaOS): não ganham
  explicação; a lista tem só os 6 apps instalados pelo autor.
- **Privacidade**: nenhuma informação publicada (texto, texto alternativo, nome de arquivo, metadados da
  imagem) permite localizar ou acessar o servidor: sem IP, domínio, porta, nome do tailnet, usuário ou
  coordenadas. A interface `enp1s0` visível na captura não identifica nada e fica.
- **Metadados da imagem**: a captura publicada sai sem metadados (EXIF, nome do arquivo de origem,
  caminho local).
- **7 projetos minimizados**: os ícones continuam lado a lado e quebram de linha conforme a largura, sem
  rolagem horizontal (FR-024).
- **Tecnologias sem logotipo disponível** (ex.: H2, Samba): seguem a regra de ícones da 003, com um
  ícone pelo assunto como último recurso; todo chip tem ícone.
- **Nome do arquivo do challenge na árvore** (`2026-10_bom-jesus-fae.yml`, 25 caracteres): em 320 px termina
  em reticências, como os outros (008 FR-020); o rodapé mostra o nome inteiro.
- **Prefixo `open deb`**: nenhuma outra opção começa com `deb`, então o Tab completa direto para
  `debianserver`.

## Requirements *(mandatory)*

### Functional Requirements

**Challenge Bom Jesus (FAE)**

- **FR-001**: A coleção de challenges MUST ganhar o desafio **Bom Jesus (FAE)** (clarify): nome
  `Bom Jesus (FAE)`, criado em
  **2026-10** (exibido `OUT 2026`), repositório público
  `https://github.com/V-Perotto/bomjesus-challenge`.
- **FR-002**: O resumo MUST dizer, em uma frase, que é gestão acadêmica: uma API REST e uma interface
  web para cadastrar, consultar, atualizar e excluir alunos e professores de uma instituição de ensino
  (fiel ao README do repositório, sem métricas).
- **FR-003**: A stack MUST ser **Java, Spring Boot, Vue 3, TypeScript, H2 e Docker**, nessa ordem
  (camadas do README: back-end, front-end, banco, containers). Spring Boot e H2 são tecnologias novas e
  MUST ganhar ícone pela regra de ícones da 003 (logotipo da marca quando existir; senão, um ícone pelo
  assunto).
- **FR-004**: Por ser o mais recente, o Bom Jesus MUST ser o 1º challenge: na árvore, o arquivo
  `2026-10_bom-jesus-fae.yml`, aberto na primeira exibição, com o rodapé `1 / 8`; nos cartões (janela
  maximizada, sem JavaScript, impressão), o 1º cartão.
- **FR-005**: O arquivo e o cartão MUST ser gerados dos mesmos dados, sem texto escrito à mão (006
  FR-006), com as mesmas chaves dos outros challenges (`nome`, `criado`, `resumo`, `stack`,
  `repositorio`).

**Janela do DebianServer**

- **FR-006**: Projetos MUST ganhar a janela **DebianServer**, em **2º lugar**, logo depois do SRG
  (Q2), com o título `DebianServer` e o subtítulo `Meu homeserver` (Q1).
- **FR-007**: A janela MUST ter o selo `EM PRODUÇÃO` ao lado do nome (como o `EM DESENVOLVIMENTO` do
  SRG) e a linha `desde = 01 OUT 2026` (em produção desde 2026-10-01, com o dia; pedido do autor depois da
  implementação). A legenda da captura continua só com o mês (FR-016).
- **FR-008**: A janela MUST ter um tipo novo, `side-project` (`tipo = side-project`), e o rodapé
  `[side-project]`, como pediu o autor ("Side-Project, mas pode ficar na aba de projetos").
- **FR-009**: O propósito MUST dizer, em uma ou duas frases, que é um servidor caseiro self-hosted, num
  notebook reaproveitado, que guarda as fotos do celular, dá acesso à IA local, a uma Wikipedia offline
  e à sincronização de notas, sem depender de nuvem de terceiros. O papel MUST ser
  `Autor: instalação, configuração e manutenção` (clarify).
- **FR-010**: A janela MUST mostrar, como as linhas `papel` e `tipo`, os fatos técnicos das
  Clarifications, e só eles:
  - `hardware`: notebook reaproveitado, Lenovo ideapad 330-15IKB, Intel Core i5-8250U (Q6);
  - `sistema`: CasaOS sobre Debian 13, com os apps em containers Docker (Q5);
  - `acesso`: de fora de casa pelo Tailscale (VPN), sem porta aberta na internet; no celular, os
    arquivos do servidor por SMB (Q4, Q12).
- **FR-011**: Os chips de stack MUST ser **Debian, CasaOS, Docker, Tailscale, Ollama e Samba** (Q14),
  nessa ordem, cada um com ícone pela regra de ícones da 003 (FR-003).
- **FR-012**: A janela MUST listar os **6 apps**, nesta ordem, cada um com o nome e uma explicação de
  uma linha, fiel às Clarifications:
  1. **Ente Photos**: backup automático das fotos e vídeos do celular, criptografados de ponta a ponta e
     guardados no próprio servidor, no lugar de uma nuvem de terceiros (Q8);
  2. **OpenWebUI**: interface de chat com IA; serve de ponte para os modelos locais (Ollama) que rodam
     no desktop do autor, numa RTX 3060 de 12 GB, e pesquisa na web pelo SearXNG (Q9);
  3. **Kiwix**: cópia offline da Wikipedia em português (Q10);
  4. **Syncthing**: mantém o cofre do Obsidian sincronizado entre o desktop, o celular e o servidor
     (Q11);
  5. **SearXNG**: metabuscador próprio, usado como fonte de busca na web do OpenWebUI (Q13);
  6. **Watchtower**: atualiza sozinho os containers dos outros apps quando sai uma versão nova (Q7).
- **FR-013**: A lista de apps MUST ser texto (lido pelo leitor de tela e presente sem JavaScript), com o
  nome de cada app destacado e a explicação ao lado ou abaixo, e MUST caber sem rolagem horizontal de
  320 px ao desktop. Cada app MUST ter, antes do nome, o ícone dele (clarify), monocromático, na cor do
  texto e decorativo (escondido do leitor de tela), pela mesma regra e fonte de ícones dos chips de
  stack (003); um app sem logotipo disponível ganha um ícone pelo assunto.

**Captura de tela como evidência (depois da emenda v3.1.0)**

- **FR-014**: Antes do `/speckit-plan`, a constituição MUST ser emendada para **v3.1.0** (Q3; feito em
  2026-10-20, commit `cbf86ae`), com uma
  4ª exceção no Princípio II: *infraestrutura pessoal sem acesso público, comprovada por uma captura de
  tela datada publicada no próprio site, com texto alternativo descritivo e sem nenhum dado que permita
  localizar ou acessar a infraestrutura*. A emenda vai num commit próprio, antes do commit da spec.
- **FR-015**: A evidência do DebianServer MUST ser a captura do painel enviada pelo autor, no lugar dos
  links (a coluna da direita a partir de 900 px; depois das informações abaixo disso), mostrada inteira,
  sem cortes nem distorção, com borda e raio dos tokens existentes. Acima da captura, a janela MUST
  mostrar a linha `# sem acesso público: a evidência é a captura do painel`, no estilo do aviso de
  repositório privado, para a exceção do Princípio II ficar explícita no projeto (analyze C1).
- **FR-016**: A captura MUST ter uma legenda visível, no estilo dos comentários das janelas
  (`# …`), que diga que é o painel do CasaOS do servidor e a data da captura (`OUT 2026`; o dia exato,
  20/10/2026, está no próprio painel).
- **FR-017**: A captura MUST ter texto alternativo descritivo: painel do CasaOS do DebianServer em
  20/10/2026, com CPU a 3%, RAM a 26% de 11,6 GB, disco com 122 GB usados de 460 GB, e os apps visíveis
  (App Store, Files, OpenWebUI, Syncthing, Watchtower, SearXNG, Kiwix Server e Ente Photos).
- **FR-018**: A captura MUST abrir em tamanho real num **visualizador na própria página** (clarify)
  quando o visitante a escolhe (clique, toque, Enter; analyze I1): um diálogo modal por cima da página, no
  padrão da janela maximizada (006 FR-017, FR-018), com a imagem original inteira, reduzida só se não
  couber na tela, a legenda e um botão ✕. Enquanto ele está aberto, a página, o header e a dock ficam
  inalcançáveis e o foco fica preso nele; Esc, o ✕ ou um clique fora da imagem o fecham e devolvem o
  foco ao print. Abrir e fechar levam no máximo 400 ms, sem animação com "reduzir movimento". O
  elemento que o abre MUST ter nome acessível que diga que a captura abre em tamanho real. Sem
  JavaScript, o print MUST ser um link para a imagem original, que abre em nova aba.
- **FR-019**: A captura MUST ser publicada em formato de imagem moderno, sem metadados, com as
  dimensões declaradas (espaço reservado antes de carregar) e carregada só perto da tela; a versão
  exibida na janela MUST ter no máximo o tamanho necessário para a maior largura em que aparece (com
  densidade de tela 2×), e a versão em tamanho real é a resolução original (1396 × 809).
- **FR-020**: Nenhum conteúdo publicado da feature (textos, texto alternativo, nomes de arquivo,
  metadados) MUST conter IP, domínio, porta, nome do tailnet, usuário ou qualquer dado que permita
  localizar ou acessar o servidor (Q4).

**Dados e comportamento comuns**

- **FR-021**: O DebianServer MUST ser gerado dos dados, como os outros projetos: nada de texto escrito à
  mão no componente além dos rótulos genéricos (`hardware`, `sistema`, `acesso`, apps). Os campos novos
  (data de produção, hardware, sistema, acesso, apps, captura) são opcionais para os outros projetos e
  não mudam a janela deles.
- **FR-022**: A linha de comando digitada pela janela do DebianServer MUST seguir o padrão temático dos
  outros projetos (`<nome> --status`): `debianserver --status`.
- **FR-023**: `debianserver` MUST ser opção do `open`, como todo projeto (007 FR-002): na lista de
  opções (saída do `open` sem opção, de opção inválida e do `help`), no Tab e nos atalhos de toque,
  depois de `srg`, na ordem da página; `open debianserver` abre a janela como abre os outros projetos,
  com a saída `→ ~/projetos/debianserver`.
- **FR-024**: Com 7 projetos, os ícones de projetos minimizados ou fechados MUST continuar lado a lado,
  na ordem dos projetos, quebrando de linha só quando não cabem, sem rolagem horizontal (005 FR-026);
  a partir de 1024 px, os 7 numa linha se couberem.
- **FR-025**: Esta feature MUST levar a versão do `package.json` a `2.8.0` (exibida `v2.8` na sessão da
  porta), como manda o 005 FR-016.
- **FR-026**: O DESIGN.md e o README MUST registrar as peças novas (a captura dentro da janela de
  projeto, o visualizador e a lista de apps com ícones) e o tipo `side-project`, como nas features
  anteriores.

### Key Entities

- **Challenge**: nome, data de criação, resumo, stack e repositório. Sem campos novos; ganha um item.
- **Projeto**: ganha o tipo `side-project` e, opcionais, a data de entrada em produção, o hardware, o
  sistema, o acesso, a lista de apps e a evidência por captura de tela.
- **App do servidor**: nome, ícone e explicação de uma linha. Pertence ao projeto, na ordem dos dados.
- **Evidência por captura de tela**: a imagem (exibida e em tamanho real), as dimensões, o texto
  alternativo, a legenda e a data da captura. É o 4º caso do Princípio II (v3.1.0).
- **Tecnologia**: ganha 7 nomes (Spring Boot, H2, Debian, CasaOS, Tailscale, Ollama e Samba), cada um
  com ícone; Java, Vue 3, TypeScript e Docker já existem.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 320, 768, 1366 e 1920 px, a janela do DebianServer mostra 100% dos fatos das
  Clarifications pedidos em FR-007 a FR-012 (selo, desde, tipo, hardware, sistema, acesso, 6 chips com
  ícone, 6 apps com ícone e explicação) e a captura inteira, sem rolagem horizontal da página.
- **SC-002**: A janela de Challenges mostra 8 arquivos, com o do Bom Jesus em `1 / 8` e 100% dos fatos
  do cartão dele (nome, `OUT 2026`, resumo, 6 tecnologias, repositório) no arquivo e no cartão.
- **SC-003**: A captura exibida na janela pesa no máximo 120 KB e a de tamanho real no máximo 300 KB;
  nenhuma das duas entra no carregamento inicial da página (só baixam perto da tela ou por pedido), e
  a chegada da captura não desloca nada na página (deslocamento de layout 0 na janela).
- **SC-004**: O carregamento inicial continua ≤ 500 KB (badges externos excluídos), e o HTML, o CSS e o
  JavaScript iniciais crescem no máximo 6 KB comprimidos em relação à 008 (revisado na implementação de
  4 KB: o texto novo vai no HTML e de novo nos dados do JS; research R10); nenhum pedido novo a
  terceiros.
- **SC-005**: Zero violações na auditoria automática de acessibilidade e zero erros do site no console,
  com a janela do DebianServer aberta, minimizada, com o visualizador da captura aberto, com "reduzir
  movimento" e sem JavaScript, e com a janela de Challenges aberta e maximizada.
- **SC-006**: Sem JavaScript e na impressão, 100% do conteúdo do DebianServer (com a captura) e do
  challenge Bom Jesus (FAE) está visível, cada conteúdo uma vez só.
- **SC-007**: Com a janela do DebianServer aberta, minimizada e fechada, em 1366 × 768 e 390 × 844, em
  100% das execuções `open debianserver` deixa a janela aberta e à vista em até 1 s, com o terminal
  minimizado (007 SC-001).
- **SC-008**: Zero ocorrências, no site publicado (HTML, texto alternativo, nomes e metadados da
  imagem), de IP, domínio, porta, nome do tailnet ou usuário do servidor.
- **SC-009**: O visualizador abre e fecha em no máximo 400 ms cada; aberto, a imagem fica inteira à
  vista (sem cortes nem rolagem) em 320, 768, 1366 e 1920 px, e o foco volta ao print em 100% dos
  fechamentos (Esc, ✕, clique fora).

## Assumptions

- **Numeração**: esta feature é a 009. O boot dentro de um dispositivo (`specs/insumos/
  002-boot-dispositivo.md`, plano 09), que estava reservado como 009, passa a ser a 010.
- **Nome do challenge**: `Bom Jesus (FAE)` (clarify), com o nome da empresa, como os outros challenges
  (CIEE-PR, Mobiis, Econet); "Gestão Acadêmica (Alunos e Professores)" vira o assunto do resumo. Slug
  do arquivo: `bom-jesus-fae`, gerado do nome como nos outros.
- **Data do challenge**: o mês de criação do repositório (2026-10), como nos outros.
- **Selo e data do DebianServer**: `EM PRODUÇÃO` + `desde = 01 OUT 2026`. No plano, o dia ficava de fora
  (os períodos da página usam só mês e ano); depois da implementação, o autor pediu o dia, e a data de
  entrada em produção não é um período (Princípio I): é uma data só, no formato `DD MÊS AAAA`.
- **Apps de fábrica do CasaOS** (App Store, Files): aparecem só na captura e no texto alternativo; não
  são explicados.
- **Ollama no desktop**: o Ollama roda no desktop do autor (RTX 3060 12 GB), não no notebook; ele
  entra nos chips porque é parte da arquitetura que o OpenWebUI do servidor usa.
- **RAM e disco**: aparecem só na captura e no texto alternativo (11,6 GB; 459,64 GB); a linha
  `hardware` fica com o modelo e a CPU que o autor informou.
- **Captura**: a enviada pelo autor em 2026-10-20 é publicada como está (sem recortes nem edições),
  convertida para formato moderno e redimensionada para a versão exibida; o original fica versionado
  como fonte, como as outras fontes de assets do projeto.
- **Visualizador da captura**: mostra uma imagem só (sem galeria, zoom nem gestos de pinça além dos do
  navegador) e não usa dependência nova.
- **Currículo**: o challenge, o servidor e as 7 tecnologias novas não estão no PDF de 2026-04-21; o
  autor atualiza o PDF (precedente da 002).
- **Validação com GPU real e celular físico** fica com o autor (quickstart), como nas features
  anteriores.
