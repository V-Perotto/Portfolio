# Feature Specification: Certificados em pastas por plataforma e a foto do 1º dia na Prime Control

**Feature Branch**: `010-certificates-folders`, criada a partir da `main` (em 9dd2d52, o merge da 009), como
a 009 (não há hook `before_specify` configurado)

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: um pedido do autor, com três partes:

1. "Adicione no processo do specify uma aba de certificados, para isso, adicione os certificados presentes
   em /home/viper/Documents/certificados. Para isso, separe por plataforma (DIO, Prime Academy, Udemy, Senai,
   Promenady)."
2. "Faça essa aba parecida com o que já existe como o Educação, Comunitario, Challenges, ou seja, sendo cada
   uma das plataformas uma pasta (igual o formacao/). Além de ter a listagem de cada item dentro dessas
   pastas de plataforma, faça com que seja possível visualizar e passar por scroll na aba lateral, mas
   somente sendo possível fazer isso dentro da pasta, sendo necessário clicar em outra pasta para fazer o
   mesmo para ver os outros certificados."
3. "Para a foto DiaE-PrimeControl.jpeg que está em certificados, use ela junto da experiencia da Prime
   Control, indicando a data da imagem para indicar o início da carreira na Prime Control (15 de Outubro de
   2020)."

## Contexto

### Situação atual

- **Seções** (001 FR-008): `sobre`, `experiencia`, `skills`, `projetos`, `educacao` e `contato`, nessa ordem,
  no menu como `~/<seção>`. Não há seção nem item de certificados, e o PDF do currículo (2026-04-21) não tem
  uma seção de certificações.
- **Janelas de editor** (006, 008): Experiência (`~/carreira`), Challenges (`~/projetos/challenges`),
  Comunitário (`~/projetos/comunitario`) e Educação (`~/formacao`). Cada uma digita `code <pasta>` e mostra a
  árvore (Branched Menu) com **uma pasta só**, aberta, e um arquivo YAML por item; o arquivo aberto, com
  números de linha; e o rodapé com o caminho e a posição (`1 / 4`). A janela tem a altura do maior arquivo e
  não muda ao trocar de arquivo (006 SC-002). Maximizada, mostra a árvore e os cartões; sem JavaScript e na
  impressão, só os cartões. O nome que não cabe na árvore termina em reticências (008 FR-020; o rótulo tem
  ~18 caracteres em 320 px e ~28 em 390 px).
- **Experiência da Prime Control**: `Desenvolvedor RPA`, `Prime Control e Prime Robot`, `OUT 2020 — OUT 2022`,
  no arquivo `2020-10_prime-control.yml` (5º de 5). Nenhuma experiência mostra imagem.
- **Imagens de conteúdo**: só a captura do painel do DebianServer (009), na janela do projeto, com legenda
  datada (`# … · OUT 2026`) e um visualizador na própria página (diálogo modal; sem JavaScript, um link para a
  imagem em nova aba).
- **Comando `open`** (007 a 009): 11 opções, geradas dos dados: `experiencia`, os 7 projetos, `challenges`,
  `comunitario` e `educacao`.
- **Versão**: `package.json` em `2.8.0` (exibida `v2.8` na sessão da porta, 005 FR-016).
- **Arquivos do autor** (`/home/viper/Documents/certificados`, lidos em 2026-10-20): 62 arquivos, **61
  certificados** e **1 foto**. As plataformas foram identificadas pelo conteúdo de cada arquivo:

| Plataforma | Certificados | Formato | Datas | Verificação impressa no certificado |
|------------|--------------|---------|-------|-------------------------------------|
| DIO (Digital Innovation One) | 33 (31 cursos e 2 bootcamps) | PDF com texto | 13 ABR 2020 a 29 JUL 2020 | código de 8 caracteres |
| Prime Academy (Prime Control) | 20 (16 cursos e 4 webinars) | imagem PNG | 15 OUT 2020 a 29 OUT 2020 | link `academy.primecontrol.com.br/certificates/…` |
| Udemy | 2 | PDF com imagem | 11 e 13 NOV 2020 | nº e link `ude.my/UC-…` |
| SENAI (SENAI-PR, EAD do Sistema Fiep) | 1, com ementa na 2ª página | PDF com texto | 30 DEZ 2020 | código de identificação |
| Promenady | 5 (cursos de SAP) | PDF com imagem (e-certificado.com) | 16 JAN 2023 a 18 FEV 2023 | código e QR code |

  O **certificado do SENAI traz RG, CPF, naturalidade (cidade e UF) e data de nascimento** do autor. Nem os
  números nem a cidade são reproduzidos nesta spec, que fica num repositório público. Os outros certificados mostram só o nome do autor, o curso, a data, a carga
  horária, a assinatura de quem emite e o código ou link de verificação.

- **Foto `DiaE-PrimeControl.jpeg`** (1024 × 768, JPEG, sem EXIF): a sala de integração da Prime Control, com
  **6 pessoas** (o autor e mais 5) de máscara, a maioria de camiseta da Prime Control, ao redor de uma
  mesa com notebooks. Na projeção:
  "Integração Institucional de Prime Heroes — Bem-vindo Prime Hero! Hoje você integra ao time Prime Control,
  parabéns!". O autor informou a data: **15/10/2020**, o 1º dia na Prime Control. É também a data dos 4
  primeiros certificados da Prime Academy.

### Inventário dos certificados

Do mais recente para o mais antigo em cada plataforma. Título como está impresso no certificado. Carga
horária em horas. As cargas da Prime Academy foram lidas na imagem e MUST ser conferidas uma a uma na
implementação.

**DIO (33)**

| Data | Título | h |
|------|--------|---|
| 29 JUL 2020 | Programa EmpregoTech Curitiba - Básico (bootcamp) | 39 |
| 29 JUL 2020 | Programa Empregotech Curitiba - Intermediário (bootcamp) | 79 |
| 07 JUL 2020 | Desafio prático: Arquitetura interna no Node e filas | 2 |
| 06 JUL 2020 | Desenvolvimento back-end com Node.js | 5 |
| 06 JUL 2020 | Desafio prático: Criando uma API em Node.js para gerenciar seus crushes | 3 |
| 03 JUL 2020 | Conceitos e melhores práticas com bancos de dados PostgreSQL | 9 |
| 03 JUL 2020 | Introdução ao Node.js com Express | 2 |
| 01 JUL 2020 | Desafio prático: Como gerenciar o estado das aplicações com Redux | 3 |
| 01 JUL 2020 | Desafio prático: Praticando JavaScript com React | 2 |
| 01 JUL 2020 | Desenvolvimento de aplicações para internet com ReactJS | 4 |
| 01 JUL 2020 | Desafio prático: React.js com TypeScript | 3 |
| 01 JUL 2020 | Introdução ao ReactJS | 3 |
| 30 JUN 2020 | Desafio prático: Performance Web Utilizando JavaScript | 2 |
| 30 JUN 2020 | Desafio prático: TDD com JavaScript | 3 |
| 29 JUN 2020 | Desenvolvimento avançado com JavaScript ES6 | 5 |
| 29 JUN 2020 | Desafio prático: Utilizando Styled Components (CSS-in-JS) | 2 |
| 24 JUN 2020 | JavaScript ES6 essencial | 4 |
| 22 JUN 2020 | Desafio prático: Entendendo Promises de uma vez por todas | 3 |
| 20 JUN 2020 | Modelagem de Negócios | 4 |
| 20 JUN 2020 | Programação para internet com JavaScript | 2 |
| 12 JUN 2020 | Fundamentos de Negócios Digitais Escaláveis | 6 |
| 19 MAI 2020 | Expert Lesson: Arquitetura Hexagonal: mantendo aplicações saudáveis | 3 |
| 18 MAI 2020 | Arquitetura de Sistemas Avançado | 3 |
| 18 MAI 2020 | Expert Lesson: DDD e arquitetura de software | 2 |
| 16 MAI 2020 | Construindo páginas para internet com Bootstrap | 4 |
| 13 MAI 2020 | Programação para internet com HTML5 e CSS3 | 6 |
| 21 ABR 2020 | Mentalidade Empreendedora | 3 |
| 21 ABR 2020 | Fundamentos do Intraempreendedorismo | 2 |
| 21 ABR 2020 | Projetos ágeis com SCRUM | 2 |
| 20 ABR 2020 | Introdução ao GitHub e comandos essenciais para trabalhar em equipe | 4 |
| 17 ABR 2020 | Introdução ao Git e Controle de Versões | 2 |
| 17 ABR 2020 | Fundamentos de Arquitetura de Sistemas | 7 |
| 13 ABR 2020 | Lógica de programação essencial | 4 |

**Prime Academy (20)**

| Data | Título | h |
|------|--------|---|
| 29 OUT 2020 | Metodologia Agile SCRUM | 8 |
| 27 OUT 2020 | APIs | 3 |
| 27 OUT 2020 | BDD – Behaviour Driven Development | 2 |
| 27 OUT 2020 | Convenções de codificação em C# | 2 |
| 27 OUT 2020 | Elaboração de Cenários de Testes HP ALM QC | 2 |
| 27 OUT 2020 | Rabbiit – Para que serve e como usar | 2 |
| 27 OUT 2020 | SQL Básico | 2 |
| 22 OUT 2020 | Chatbots – Como garantir a qualidade | 2 |
| 22 OUT 2020 | Automação de Testes com HP ALM e HP UFT | 2 |
| 22 OUT 2020 | Noções Básicas de Varejo | 8 |
| 21 OUT 2020 | Abertura de Bugs | 2 |
| 21 OUT 2020 | Automação Web com Ruby | 2 |
| 21 OUT 2020 | Produtividade pessoal com GTD | 2 |
| 21 OUT 2020 | Teste de Software | 2 |
| 19 OUT 2020 | Webinar – O papel de um testador em uma equipe ágil | 2 |
| 16 OUT 2020 | Especificação de Caso de Teste | 2 |
| 15 OUT 2020 | Webinar – Acelerando entregas com Continuous Testing | 1 |
| 15 OUT 2020 | Webinar – BDD não é Caso de Teste! | 2 |
| 15 OUT 2020 | Continous Testing Academy – Iniciante | 3 |
| 15 OUT 2020 | Webinar – Conhecendo a Prime Control | 1 |

**Udemy (2)**

| Data | Título | h |
|------|--------|---|
| 13 NOV 2020 | Automação de Testes com Robot Framework - Avançado | 7 |
| 11 NOV 2020 | Automação de Testes com Robot Framework - Básico | 4 |

**SENAI (1)**

| Data | Título | h |
|------|--------|---|
| 30 DEZ 2020 | Inteligência Artificial (EAD; ementa com 10 tópicos, de aprendizagem de máquina a robótica) | 40 |

**Promenady (5)**

| Data | Título | h |
|------|--------|---|
| 18 FEV 2023 | Visão de Abap para Funcionais | 8 |
| 11 FEV 2023 | TAXBRA - Nível Avançado | 8 |
| 28 JAN 2023 | TAXBRA - Nível Básico | 8 |
| 21 JAN 2023 | Localização Brasileira | 8 |
| 16 JAN 2023 | Formação de Consultores | 80 |

### Relação com a constituição (v3.1.0)

- **Princípio I (Fidelidade ao Currículo)**: "toda certificação exibida MUST corresponder ao currículo
  vigente", e o PDF de 2026-04-21 não lista certificações. Pelo precedente registrado desde a 002, o site
  está certo e o autor atualiza o PDF. Cada certificado aparece só com os fatos impressos nele (título,
  plataforma, data, carga horária, verificação), com o título como está impresso, sem nada inferido nem
  inflado. A data de emissão é uma data, não um período: segue o formato `DD MÊS AAAA` do `desde` da 009
  (`15 OUT 2020`). O período da Prime Control continua `OUT 2020 — OUT 2022`.
- **Princípio II (Projetos Demonstráveis)**: não se aplica diretamente (certificado não é projeto). Os links
  de verificação são links externos, com `target="_blank"` e `rel="noopener noreferrer"`.
- **Princípio III (Saída Estática)**: sem JavaScript, a seção mostra os 61 certificados, agrupados por
  plataforma. As imagens (a foto e os 61 certificados) são arquivos estáticos do próprio site, e nenhum
  recurso de terceiros é carregado.
- **Princípio IV (Acessibilidade e Desempenho)**: a árvore com pastas e a lista que rola dentro da pasta
  aberta precisam ser operáveis por teclado e leitor de tela. As imagens precisam de texto alternativo,
  formato moderno, carregamento só perto da tela e espaço reservado. Nada pode exigir rolagem horizontal, de
  320 px ao desktop.
- **Princípio V (Identidade Visual Coerente)**: a janela reaproveita a janela de editor (006, 008) e o
  visualizador de imagem (009), com os tokens existentes. As peças novas são a árvore com várias pastas
  (uma aberta por vez, com rolagem dentro da pasta), a miniatura do certificado no arquivo e a foto ao lado
  do arquivo da Prime Control.
- **Restrições de Conteúdo** ("telefone, endereço completo e documentos não são publicados"): o RG, o CPF,
  a naturalidade e a data de nascimento do certificado do SENAI MUST NOT ser publicados. A imagem dele sai
  com esses dados sob tarjas pretas (clarify, FR-010). Publicar a foto com 5 outras pessoas envolve o direito de imagem de
  terceiros: os rostos delas saem desfocados (Q2, FR-020). Como o repositório é público, os originais sem
  essas edições também não são versionados (FR-010, FR-020).

### Requisitos de features anteriores que esta feature substitui

- **001 FR-008** (ordem das seções): ganha a seção `certificados`, entre `educacao` e `contato` (FR-001).
- **006 FR-001 / 008 FR-001** (quatro janelas de editor): passam a ser cinco, com a de Certificados (FR-002).
- **006 FR-003** (a árvore com uma pasta): na janela de Certificados, a árvore tem uma pasta por plataforma,
  com uma aberta por vez (FR-003 a FR-005). As outras quatro janelas não mudam.
- **006 FR-016** (maximizada, todos os cartões): na janela de Certificados, maximizada, aparecem só os
  cartões da pasta aberta (FR-012).
- **006 FR-006** (fatos do arquivo da Experiência) e o cartão da Prime Control: ganham a foto do 1º dia
  (FR-017 a FR-021).
- **009 FR-018** (visualizador da captura): passa a servir também à foto e às imagens dos 61 certificados
  (FR-009, FR-018).
- **007 FR-001 a FR-008 / 008 FR-015 a FR-018 / 009 FR-023** (opções do `open`): passam a ser 12, com
  `certificados` depois de `educacao` (FR-022).
- **009 FR-025**: a versão sobe para `2.9.0` (FR-024).

## Clarifications

### Session 2026-10-20 (specify)

- Q1: Os certificados aparecem como imagem no site? → A: **Sim, miniatura + visualizador**. Cada arquivo
  YAML mostra, abaixo das linhas, a miniatura do certificado, que abre em tamanho real no visualizador da
  009. O certificado do SENAI sai com o RG, o CPF, a naturalidade e a data de nascimento cobertos (por
  tarja preta, clarify).
- Q2: A foto do 1º dia mostra outras pessoas (a pergunta dizia 6; contadas no plano, são 5). Como publicar? → A: **Com os rostos das outras pessoas
  desfocados**. Só o do autor fica nítido. O autor é a pessoa **na ponta direita da mesa, de frente**,
  de máscara preta e camiseta da Prime Control.
- Q3: Onde a foto aparece na janela de Experiência? → A: **Ao lado das linhas YAML** do arquivo
  `2020-10_prime-control.yml`. A partir de 900 px, a miniatura e a legenda datada ficam à direita das
  linhas. Abaixo disso, ficam embaixo delas.

### Session 2026-10-20 (clarify)

- Q: Como os dados pessoais do certificado do SENAI são escondidos na imagem publicada? → A: **Com tarja
  preta** (decisão do autor). O RG, o CPF, a data de nascimento e a naturalidade (a cidade e a UF) ficam,
  cada um, sob uma tarja preta opaca. O resto do certificado continua legível. A cidade não é escrita em
  nenhum texto do site nem do repositório.

### Session 2026-10-20 (plan)

Correções achadas no `/speckit-plan`, ao conferir os arquivos e os links (research R5, R15).

- C1: A foto tem **6 pessoas, o autor e mais 5**, e não 7 (contadas na grade da imagem). A decisão da Q2
  não muda: os rostos das 5 outras pessoas são desfocados.
- C2: O **código de identificação do SENAI** abre o certificado inteiro no site do emissor, com o RG, o
  CPF e a data de nascimento. Para a tarja da clarify valer, o código também fica sob tarja preta na imagem
  e não é publicado no arquivo nem no cartão (comentário `# código omitido por privacidade`).
- C3: O domínio de verificação da Prime Academy (`academy.primecontrol.com.br`) não existe mais (sem
  DNS em 2026-10-20). Pelo FR-008, os 20 certificados mostram o código como texto, sem link.
- C4: Os links da Udemy (`ude.my/UC-…`) não puderam ser conferidos de forma automática: o Cloudflare da
  Udemy recusa o curl e o navegador automatizado. O autor confere os 2 num navegador comum (quickstart).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver os certificados por plataforma (Priority: P1)

*Itens 1 e 2 do autor.* Um recrutador abre a seção Certificados e vê uma janela de editor como a da
Educação. Na árvore lateral há uma pasta por plataforma (DIO, Prime Academy, Udemy, SENAI, Promenady), e
só uma fica aberta por vez. Dentro da pasta aberta, a lista de certificados rola sem levar a página junto.
Para ver os de outra plataforma, ele clica na outra pasta: ela abre, e a anterior fecha. Escolher um
certificado mostra o arquivo dele: título, plataforma, data, carga horária e verificação.

**Why this priority**: é o pedido principal, e a seção nova inteira depende dele.

**Independent Test**: na seção Certificados, abrir cada uma das 5 pastas e percorrer todos os certificados
dela pela árvore (mouse, toque e teclado). Conferir cada arquivo contra o inventário, a rolagem dentro da
pasta e que só uma pasta fica aberta. Repetir em 320 px, com "reduzir movimento", sem JavaScript e na
impressão.

**Acceptance Scenarios**:

1. **Given** a página com JavaScript, **When** o visitante chega à seção Certificados, **Then** vê, sob o
   título `certificados` e a linha de comando da seção, uma janela de editor que digita
   `code ~/certificados`. Terminado o comando, aparece o editor: na árvore, as 5 pastas, a primeira aberta
   com os certificados dela (do mais recente para o mais antigo) e as outras fechadas; o arquivo do 1º
   certificado aberto; e o rodapé com o caminho e a posição dele na pasta (`1 / 33`).
2. **Given** a pasta DIO aberta (33 certificados), **When** o visitante rola a lista com a roda do mouse, o
   toque ou o teclado, **Then** a lista rola dentro da árvore até o último certificado da pasta, a página
   não rola junto, e as outras pastas continuam à vista, fechadas.
3. **Given** a pasta DIO aberta, **When** o visitante clica na pasta Prime Academy (ou a escolhe com Enter
   ou Espaço), **Then** a Prime Academy abre com os 20 certificados dela, a DIO fecha, o arquivo aberto
   passa a ser o 1º da Prime Academy, o rodapé mostra `1 / 20`, e a janela não muda de altura.
4. **Given** a pasta aberta, **When** o visitante clica nela de novo, **Then** ela continua aberta: sempre
   há exatamente uma pasta aberta.
5. **Given** um certificado da Prime Academy aberto, **When** o visitante o lê, **Then** o arquivo traz o
   título como está impresso, `plataforma: Prime Academy`, a data de emissão (`27 OUT 2020`), a carga
   horária (`3 h`) e o link de verificação, que abre em nova aba. Abaixo das linhas, aparece a miniatura do
   certificado (Q1).
6. **Given** a miniatura de um certificado, **When** o visitante a escolhe (clique, toque, Enter), **Then**
   o visualizador abre por cima da página com o certificado em tamanho real (até o limite da tela). Esc, o
   ✕ ou um clique fora o fecham e devolvem o foco à miniatura, com a página na mesma posição.
7. **Given** a janela de Certificados, **When** o visitante a maximiza, **Then** ela cobre a maior parte da
   tela, a árvore continua à esquerda com a mesma pasta aberta, e no lugar do arquivo aparecem os cartões
   dos certificados dessa pasta. Abrir outra pasta troca os cartões, e escolher um certificado rola até o
   cartão dele. Esc, o `□` ou um clique fora restauram.
8. **Given** um celular de 320 px, **When** o visitante vê a janela, **Then** a árvore fica acima do
   arquivo, a lista da pasta aberta rola dentro de uma altura menor que a do desktop (o arquivo continua
   perto), os nomes longos terminam em reticências, a miniatura cabe na largura do painel, e nada exige
   rolagem horizontal.
9. **Given** a página sem JavaScript (ou impressa), **When** o visitante chega à seção Certificados,
   **Then** vê os 61 certificados em cartões, agrupados por plataforma, na ordem das pastas, cada um uma vez
   só e com um link para a imagem dele, que abre em nova aba.
10. **Given** o certificado do SENAI, **When** o visitante abre a imagem dele (miniatura ou tamanho real),
    **Then** o RG, o CPF, a data de nascimento e a naturalidade (cidade e UF) estão sob tarjas pretas, sem
    nada legível. O código de identificação do rodapé também está sob tarja (plano, C2). O nome, o curso, a
    data de conclusão e a carga horária continuam legíveis.

---

### User Story 2 - Ver o 1º dia na Prime Control junto da experiência (Priority: P2)

*Item 3 do autor.* Na janela de Experiência, a Prime Control ganha a foto da integração do 1º dia, com a
data, 15 OUT 2020, à vista. A foto marca o começo da carreira do autor. Ela pode ser vista em tamanho real
no visualizador da página.

**Why this priority**: é um acréscimo pequeno a uma janela que já existe, e não depende da seção nova.

**Independent Test**: na janela de Experiência, abrir o arquivo da Prime Control. Conferir a foto, a
legenda com a data, o texto alternativo, o visualizador e o carregamento só perto da tela. Conferir que as
outras experiências não mudam. Repetir sem JavaScript e na impressão.

**Acceptance Scenarios**:

1. **Given** a janela de Experiência em 900 px ou mais, **When** o visitante abre
   `2020-10_prime-control.yml`, **Then** vê a foto da integração à direita das linhas YAML (Q3), com a
   legenda `# 1º dia na Prime Control · 15 OUT 2020`, e o período continua `OUT 2020 — OUT 2022`. Abaixo de
   900 px, a foto e a legenda ficam embaixo das linhas.
2. **Given** a foto, **When** o visitante a escolhe (clique, toque, Enter), **Then** o visualizador abre por
   cima da página com a foto em tamanho real (até o limite da tela) e a legenda. Esc, o ✕ ou um clique fora
   o fecham e devolvem o foco à foto, com a página na mesma posição.
3. **Given** um leitor de tela, **When** o visitante chega à foto, **Then** ouve um texto alternativo que
   descreve a integração na Prime Control em 15/10/2020 e diz onde está o autor, sem identificar as outras
   pessoas.
4. **Given** a foto, em qualquer tamanho, **When** o visitante a vê, **Then** só o rosto do autor (na ponta
   direita da mesa) está nítido: os das outras 5 pessoas estão desfocados a ponto de não serem
   reconhecíveis (Q2).
5. **Given** a janela de Experiência maximizada (ou a página sem JavaScript ou impressa), **When** o
   visitante vê o cartão da Prime Control, **Then** a foto e a legenda datada estão nele.
6. **Given** as outras 4 experiências, **When** o visitante as abre, **Then** elas não têm foto e não
   mudam, e a janela tem a mesma altura em todas as 5.

---

### User Story 3 - Abrir os certificados pelo terminal da dock (Priority: P3)

*Decorre do item 2.* Como as outras janelas de editor, a de Certificados vira opção do `open`:
`open certificados` leva a página até a seção, minimiza o terminal e abre a janela maximizada.

**Why this priority**: mantém a regra da 007 e da 008 (toda janela de editor abre pelo `open`). Sem ela, o
conteúdo continua acessível pelo menu e pelo `find`.

**Independent Test**: no terminal da dock, rodar `open certificados` com a janela aberta, minimizada e
fechada. Conferir a saída, o `help`, o Tab e o foco.

**Acceptance Scenarios**:

1. **Given** o terminal da dock aberto no hero, **When** o visitante roda `open certificados`, **Then** a
   saída mostra `→ ~/certificados`, o terminal minimiza sozinho, a página vai até a seção Certificados e a
   janela abre maximizada, com o foco dentro dela.
2. **Given** o terminal da dock, **When** o visitante roda `help` ou digita `open cert` e aperta Tab,
   **Then** `certificados` aparece na lista de opções depois de `educacao`, e o Tab completa
   `open certificados`.
3. **Given** o terminal da dock, **When** o visitante roda `find certificados`, **Then** a página vai até a
   seção Certificados, como nas outras seções.

---

### Edge Cases

- **Pasta com um certificado só** (SENAI): a lista não rola, e o rodapé mostra `1 / 1`.
- **Pasta com poucos certificados** (Udemy 2, Promenady 5): a lista não rola se couber na altura reservada,
  e a janela continua com a mesma altura das outras pastas.
- **Muitos certificados no mesmo dia** (DIO: 5 em 01 JUL 2020; Prime Academy: 6 em 27 OUT 2020 e 4 em
  15 OUT 2020): a ordem é a dos dados, e os nomes de arquivo continuam únicos na pasta pelo slug.
- **Grafia do certificado**: o título fica como está impresso, mesmo quando o emissor errou ou usou um nome
  incomum ("Continous Testing Academy – Iniciante"; "Rabbiit", que é o nome de uma ferramenta, não o
  RabbitMQ; "EmpregoTech" e "Empregotech" nos dois bootcamps da DIO).
- **Títulos longos** ("Desafio prático: Criando uma API em Node.js para gerenciar seus crushes"): no
  arquivo e no cartão, o texto quebra dentro do painel. Na árvore, o nome do arquivo usa um slug curto e
  termina em reticências se não couber (008 FR-020).
- **Link de verificação fora do ar**: o certificado mostra o código como texto, sem link, e o console não
  ganha erro. Um link que não abre o certificado do autor não é publicado.
- **Bootcamps EmpregoTech da DIO**: são certificados do programa 1º Empregotech da Educação. Ficam na pasta
  da DIO, e a Educação não muda.
- **Certificado do SENAI com dados pessoais**: nenhum dado de documento aparece em texto, imagem, texto
  alternativo, nome de arquivo ou metadado (FR-010). A imagem publicada é só a 1ª página, com os dados
  sob tarjas pretas; a ementa, que está na 2ª, entra como texto no arquivo.
- **Miniaturas dos arquivos fechados**: só a miniatura do certificado aberto é baixada. A de outro
  certificado só baixa quando ele é aberto, e entrar na seção não baixa as 61 (FR-009).
- **Imagem de certificado não carrega**: o texto alternativo aparece no espaço reservado, e o arquivo
  continua legível.
- **Certificado em PDF**: a DIO, a Udemy, o SENAI e a Promenady emitem PDF. O site publica uma imagem da
  página do certificado, não o PDF (os da DIO têm 3,7 MB cada).
- **Teclado na árvore**: as pastas são botões (Enter e Espaço abrem). Os certificados da pasta aberta são
  alcançáveis por Tab, e o certificado focado rola para dentro da área visível da lista. Os da pasta
  fechada não recebem foco.
- **Pasta aberta e arquivo aberto**: o arquivo aberto é sempre de um certificado da pasta aberta. Abrir
  outra pasta abre o 1º certificado dela.
- **Maximizada e troca de pasta**: os cartões passam a ser os da nova pasta, e a lista volta ao topo.
- **Plataforma nova nos dados**: vira uma pasta sozinha. Um certificado novo vira um arquivo e um cartão
  sozinho.
- **Nenhum certificado**: a seção some da página e do menu, e não há janela nem opção do `open` (como a
  Educação na 008).
- **Foto não carrega**: o texto alternativo aparece no espaço reservado, e o resto da janela fica igual.
- **"Reduzir movimento"**: nenhuma animação nova. Abrir e fechar pastas e o visualizador são instantâneos.
- **Âncora `#certificados`**, menu e `find certificados`: levam à seção.
- **Prefixo `open cert`**: nenhuma outra opção começa com `cert`, então o Tab completa direto.

## Requirements *(mandatory)*

### Functional Requirements

**Seção e janela de Certificados**

- **FR-001**: A página MUST ganhar a seção **Certificados** (`#certificados`), com o título `certificados`
  e a linha de comando `ls -R ~/certificados`, depois de Educação e antes de Contato. No menu, ela é
  `~/certificados`. Sem certificados nos dados, a seção some da página e do menu.
- **FR-002**: A seção MUST ser uma janela de editor igual à da Educação (006 FR-001 a FR-019, 008 FR-020),
  com a pasta `~/certificados`: título da janela, comando digitado (`code ~/certificados`) e começo dos
  caminhos no rodapé.
- **FR-003**: A árvore MUST ter **uma pasta por plataforma**, na ordem dada pelo autor: `dio/`,
  `prime-academy/`, `udemy/`, `senai/` e `promenady/`. Dentro de cada pasta fica um arquivo por
  certificado, do mais recente para o mais antigo pela data de emissão (no mesmo dia, na ordem dos dados).
- **FR-004**: **Só uma pasta MUST ficar aberta por vez**. Na primeira exibição, a primeira pasta está
  aberta, com o 1º certificado dela aberto. Abrir outra pasta (clique, toque, Enter ou Espaço) fecha a
  anterior e abre o 1º certificado da nova. Clicar na pasta já aberta não a fecha. As pastas fechadas
  mostram só o nome, e os certificados delas não ficam visíveis nem recebem foco.
- **FR-005**: A lista da pasta aberta MUST rolar **dentro da árvore**, numa altura limitada (**8 linhas** no
  desktop e **4** abaixo de 760 px; analyze U1), quando os certificados não couberem nela. A rolagem MUST funcionar por
  roda do mouse, toque e teclado (o certificado focado entra na área visível) e MUST NOT levar a página
  junto enquanto houver o que rolar na lista. As outras pastas continuam à vista, acima e abaixo da lista.
  A lista que cabe inteira não rola.
- **FR-006**: O nome de cada arquivo MUST ser `AAAA-MM-DD_<slug>.yml`: a data de emissão e um slug curto,
  fixo nos dados de cada certificado (minúsculas, sem acentos, com hífen, no máximo 20 caracteres), único
  na pasta. O que não couber na largura da árvore termina em reticências (008 FR-020).
- **FR-007**: O arquivo de cada certificado MUST trazer só os fatos impressos nele (Princípio I), no
  formato YAML das outras janelas (006 FR-007). A 1ª linha é o comentário com a posição na pasta e o
  título. Depois, uma chave por fato: `curso` (o título como está impresso), `plataforma`, `emitido` (a
  data, `DD MÊS AAAA`), `carga_horaria` (`4 h`) e a verificação. O tipo aparece só quando o certificado o
  declara e o título não o diz (`tipo: bootcamp` nos dois da DIO). A ementa aparece só quando o
  certificado a traz (o do SENAI, numa lista `ementa:`).
- **FR-008**: A verificação MUST ser, quando o certificado imprime um endereço que ainda abre o certificado
  do autor, um link (`verificacao:`) que abre em nova aba com `rel="noopener noreferrer"`, no estilo dos
  links das outras janelas (006 FR-008). Sem endereço que funcione, MUST ser o código impresso
  (`codigo:`), como texto. Os endereços MUST ser conferidos na implementação. O certificado do SENAI
  MUST NOT ter verificação publicada (nem link nem código), porque o código abre o certificado inteiro,
  com os documentos, no site do emissor. No lugar, o arquivo tem o comentário
  `# código omitido por privacidade` (plano, C2).
- **FR-009**: Cada arquivo MUST mostrar, abaixo das linhas YAML, a **miniatura do certificado** (Q1),
  inteira, sem cortes nem distorção, com borda e raio dos tokens existentes. Escolher a miniatura (clique,
  toque, Enter) MUST abrir o certificado em tamanho real no visualizador da 009 (FR-018 de lá: diálogo
  modal, Esc, ✕ ou clique fora fecham, foco de volta à miniatura, até 400 ms, sem animação com "reduzir
  movimento"). Sem JavaScript, a miniatura MUST ser um link para a imagem em tamanho real, em nova aba. O
  elemento que a abre MUST ter nome acessível que diga qual certificado abre em tamanho real. Só a
  miniatura do certificado aberto MUST ser baixada; a de outro certificado baixa quando ele é aberto. Cada
  imagem MUST ter texto alternativo gerado dos dados: plataforma, título, carga horária e data (ex.:
  "Certificado da DIO: Lógica de programação essencial, 4 h, 13/04/2020"). As imagens MUST ser publicadas
  em formato moderno, sem metadados, com as dimensões declaradas (espaço reservado). A miniatura MUST ter no
  máximo o tamanho necessário para a maior largura em que aparece (com densidade 2×). Nos certificados da
  Prime Academy, que já são imagens, o tamanho real é o original (1039 × 717). Nos que são PDF, é uma
  imagem da página numa resolução legível, definida no plano.
- **FR-010**: Nenhum conteúdo publicado da feature (texto, imagem, texto alternativo, nome de arquivo,
  metadado) MUST conter o RG, o CPF, a naturalidade ou a data de nascimento do autor que estão no
  certificado do SENAI. A imagem publicada dele MUST ser a 1ª página com cada um desses dados (o RG, o
  CPF, a data de nascimento e a naturalidade, cidade e UF) sob uma **tarja preta opaca** (clarify), sem
  nada legível em nenhum tamanho. O **código de identificação** do rodapé também fica sob tarja, porque ele
  abre o certificado inteiro no site do emissor (plano, C2). O resto do certificado (nome, curso, data de
  conclusão, carga horária) continua legível. A tarja é aplicada antes de gerar qualquer versão publicada, e não por cima
  na página. Nem o PDF original nem uma imagem sem a tarja MUST ser versionados no repositório, que é
  público.
- **FR-011**: O rodapé MUST mostrar à esquerda o caminho do arquivo aberto
  (`~/certificados/dio/2020-07-29_<slug>.yml`) e à direita a posição dele **na pasta** (`1 / 33`).
- **FR-012**: Maximizada, a janela MUST mostrar a árvore e os **cartões dos certificados da pasta aberta**,
  com rolagem dentro da janela. Abrir outra pasta troca os cartões, e escolher um certificado rola até o
  cartão dele. Valem as regras de diálogo modal da 006 (FR-017, FR-018).
- **FR-013**: O cartão de cada certificado MUST trazer os mesmos fatos do arquivo (data, título, plataforma
  · carga horária, tipo e ementa quando houver, verificação) e caber de 320 px ao desktop. No lugar da
  miniatura, o cartão MUST ter um link `ver certificado` para a imagem em tamanho real: com JavaScript, ele
  abre o visualizador; sem JavaScript, abre a imagem em nova aba. Assim, a janela maximizada e a página
  sem JavaScript não baixam dezenas de miniaturas de uma vez.
- **FR-014**: Sem JavaScript e na impressão, a seção MUST mostrar os 61 certificados em cartões, agrupados
  por plataforma (um título por grupo, com o nome da plataforma e a quantidade), na ordem das pastas, cada
  um uma vez só e sem depender de clique (006 FR-012).
- **FR-015**: Abaixo de 760 px, a árvore MUST ficar acima do arquivo, e nada na janela MUST exigir rolagem
  horizontal, de 320 px ao desktop (006 FR-011). A janela MUST NOT mudar de altura ao trocar de
  certificado nem de pasta.
- **FR-016**: A pasta, os arquivos, os cartões e os grupos MUST ser gerados dos dados, sem texto escrito à
  mão além do slug de cada certificado: um certificado novo vira arquivo e cartão sozinho, e uma plataforma
  nova vira uma pasta. Minimizar, fechar, reabrir e digitar o comando seguem as regras das outras janelas
  de editor (006 FR-014, FR-019). O ícone minimizado é o de pasta de código, com o nome da pasta.

**Foto do 1º dia na Prime Control**

- **FR-017**: A experiência da Prime Control MUST mostrar a foto `DiaE-PrimeControl.jpeg` com uma legenda
  no estilo dos comentários das janelas: `# 1º dia na Prime Control · 15 OUT 2020`. A data 15 OUT 2020 MUST
  ficar visível ao lado da foto. O período da experiência continua `OUT 2020 — OUT 2022`. No arquivo
  `2020-10_prime-control.yml`, a foto e a legenda MUST ficar **à direita das linhas YAML** a partir de
  900 px e embaixo delas abaixo disso (Q3). No desktop (1366 px e 1920 px), a foto MUST aumentar a altura
  da janela de Experiência em no máximo 2 linhas do editor em relação à 009 (o resumo quebra mais, por ter
  menos largura). A janela continua com a mesma altura nos 5 arquivos (006 SC-002).
- **FR-018**: A foto MUST abrir em tamanho real no visualizador da 009 (FR-018 de lá) quando o visitante a
  escolhe (clique, toque, Enter). Sem JavaScript, MUST ser um link para a imagem, que abre em nova aba.
- **FR-019**: A foto MUST ter texto alternativo descritivo, que não identifica as outras pessoas: a
  integração dos novos funcionários na Prime Control em 15/10/2020, com o autor na ponta direita da mesa,
  de frente, e a projeção "Bem-vindo Prime Hero!".
- **FR-020**: Na foto publicada, os rostos das **5 outras pessoas MUST estar desfocados** a ponto de não
  serem reconhecíveis, em qualquer tamanho (miniatura e tamanho real); só o rosto do autor, na ponta
  direita da mesa, fica nítido (Q2). O resto da foto (a sala, a mesa, a projeção, as camisetas) não muda.
  O original sem desfoque MUST NOT ser publicado nem versionado no repositório, que é público.
- **FR-021**: A foto MUST aparecer também no cartão da Prime Control (janela maximizada, sem JavaScript,
  impressão). Ela MUST ser publicada em formato moderno, sem metadados, com as dimensões declaradas
  (espaço reservado) e carregada só perto da tela. A versão exibida MUST ter no máximo o tamanho
  necessário para a maior largura em que aparece (com densidade 2×). A versão em tamanho real tem a
  resolução original (1024 × 768), já com o desfoque (FR-020).

**Comando `open`, versão e documentação**

- **FR-022**: `certificados` MUST ser opção do `open`, como as outras janelas de editor (008 FR-015 a
  FR-018): `open certificados` maximiza a janela, com a saída `→ ~/certificados`. Ela aparece na lista de
  opções (no `open` sem opção, numa opção inválida e no `help`), no Tab e nos atalhos de toque, depois de
  `educacao`. O `help` MUST citar os certificados entre as janelas que abrem maximizadas. Sem certificados
  nos dados, a opção não existe.
- **FR-023**: `find certificados` MUST levar à seção, como nas outras seções.
- **FR-024**: Esta feature MUST levar a versão do `package.json` a `2.9.0` (exibida `v2.9` na sessão da
  porta), como manda o 005 FR-016.
- **FR-025**: O DESIGN.md e o README MUST registrar as peças novas (a árvore com várias pastas, uma aberta
  por vez e com rolagem dentro da pasta; o cartão de certificado; a foto na Experiência) e o guia de edição
  dos dados MUST explicar como acrescentar um certificado e uma plataforma.

### Key Entities

- **Certificado**: título (como impresso), plataforma, data de emissão (dia, mês e ano), carga horária em
  horas, tipo (opcional, só quando o certificado o declara), ementa (opcional), verificação (link ou
  código), slug curto único na plataforma e a imagem (miniatura e tamanho real, dimensões e texto
  alternativo gerado dos dados).
- **Plataforma**: nome exibido (DIO, Prime Academy, Udemy, SENAI, Promenady), nome da pasta (`dio`,
  `prime-academy`…), a ordem na árvore e os certificados dela.
- **Pasta de certificados**: o caminho exibido (`~/certificados`), as pastas de plataforma, qual delas
  está aberta, e os arquivos de cada uma, com o caminho e a posição na pasta.
- **Foto de experiência**: a imagem já com os rostos de terceiros desfocados (exibida e em tamanho real),
  as dimensões, o texto alternativo, a legenda e a data (15 OUT 2020). Pertence à experiência da Prime
  Control e é opcional para as outras.
- **Opção `certificados` do `open`**: o nome digitável, a janela de Certificados como alvo, o caminho
  `~/certificados` mostrado na saída e o modo maximizado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 320, 768, 1366 e 1920 px, a janela de Certificados mostra as 5 pastas e, em cada uma,
  100% dos certificados dela (33, 20, 2, 1 e 5, total de 61). Cada arquivo traz 100% dos fatos do
  certificado no inventário, e nenhum fato a mais. A página não rola na horizontal.
- **SC-002**: Em 100% das tentativas (mouse, toque e teclado), abrir uma pasta deixa exatamente uma pasta
  aberta, e a árvore nunca mostra certificados de duas pastas ao mesmo tempo. Na pasta DIO, o visitante
  chega ao 33º certificado rolando só a lista, com a página parada.
- **SC-003**: Trocar de certificado ou de pasta não muda a altura da janela (0 px de diferença, com
  tolerância de subpixel de 0,5 px, como na 006).
- **SC-004**: Sem JavaScript e na impressão, 100% dos 61 certificados estão visíveis, agrupados nas 5
  plataformas, cada um uma vez só.
- **SC-005**: Zero ocorrências, no site publicado e no repositório (HTML, JS, imagens, texto alternativo,
  nomes de arquivo e metadados), do RG, do CPF, da naturalidade (cidade e UF) ou da data de nascimento do
  certificado do SENAI; nas imagens publicadas dele, os 4 dados estão sob tarjas pretas, ilegíveis também
  no tamanho real, assim como o código de identificação, que também não aparece em nenhum texto. Zero rostos de terceiros reconhecíveis na foto publicada, na miniatura e no tamanho real, e o
  original sem desfoque fora do repositório. Os rostos e as tarjas são conferidos por inspeção visual, minha
  na implementação e do autor no quickstart (analyze A1); os pixels das tarjas também são conferidos por teste.
- **SC-006**: Na Experiência, a foto da Prime Control mostra a data 15 OUT 2020 à vista, e a janela de
  Experiência cresce, em 1366 e 1920 px, no máximo 2 linhas do editor em relação à 009. O visualizador (da foto e de
  cada certificado) abre e fecha em no máximo 400 ms cada, com a imagem inteira à vista em 320, 768, 1366
  e 1920 px, e o foco volta à miniatura em 100% dos fechamentos. A chegada de uma imagem não desloca nada
  (deslocamento de layout 0).
- **SC-007**: O carregamento inicial continua ≤ 500 KB (badges externos excluídos). O HTML, o CSS e o
  JavaScript iniciais crescem no máximo 13 KB comprimidos em relação à 009 (revisado na implementação de
  10 KB: medido +12,7 KB, os 61 certificados vão nos cartões do HTML e de novo nos dados do JS; research
  R11). Nenhuma imagem nova entra no carregamento inicial, e não há nenhum
  pedido novo a terceiros.
- **SC-008**: Zero violações na auditoria automática de acessibilidade e zero erros do site no console,
  com a janela de Certificados aberta (em cada pasta), maximizada, minimizada, com "reduzir movimento" e
  sem JavaScript, e com a foto da Prime Control à vista e no visualizador.
- **SC-009**: Com a janela de Certificados aberta, minimizada e fechada, em 1366 × 768 e 390 × 844, em 100%
  das execuções, `open certificados` deixa a janela maximizada em até 1 s (cobrindo ≥ 90% da tela no
  desktop e ≥ 95% no celular), com o terminal minimizado e o foco dentro da janela.
- **SC-010**: 100% dos links de verificação publicados abrem o certificado do autor na conferência da
  implementação.
- **SC-011**: Cada miniatura de certificado pesa no máximo 40 KB, e cada imagem em tamanho real no máximo
  200 KB; a foto exibida pesa no máximo 60 KB, e a de tamanho real no máximo 150 KB (tetos a revisar no
  plano pela medida). Abrir um certificado baixa só a miniatura dele, e maximizar a janela de Certificados
  não baixa nenhuma imagem.

## Assumptions

- **Numeração**: esta feature é a 010. O boot dentro de um dispositivo (`specs/insumos/
  002-boot-dispositivo.md`, plano 09), que estava reservado como 010, passa a ser a 011.
- **"Aba de certificados"**: uma seção nova da página, com item no menu (`~/certificados`), como Educação,
  e não uma sub-parte de outra seção.
- **"Visualizar e passar por scroll na aba lateral, só dentro da pasta"**: lido assim: a árvore lateral é
  um acordeão, com uma pasta aberta por vez, e a lista da pasta aberta rola dentro de uma altura limitada.
  Para ver os certificados de outra plataforma, é preciso abrir a pasta dela. A altura limitada é o que
  mantém a janela de um tamanho razoável com 33 certificados na DIO.
- **Ordem das pastas**: a do pedido do autor (DIO, Prime Academy, Udemy, SENAI, Promenady). Ela coincide
  com a data do 1º certificado de cada plataforma, da mais antiga para a mais recente. Dentro da pasta, a
  ordem é a do resto do site (o mais recente primeiro).
- **Nomes das plataformas**: `DIO`, `Prime Academy` (a academia da Prime Control, que emite os
  certificados), `Udemy`, `SENAI` e `Promenady`. As pastas são `dio/`, `prime-academy/`, `udemy/`,
  `senai/` e `promenady/`.
- **Linha de comando da seção**: `ls -R ~/certificados`, temática como `apt list --installed | grep
  formacao` da Educação.
- **Datas**: o formato `DD MÊS AAAA` do `desde` da 009. A data de emissão é uma data, não um período, então
  não muda o formato único dos períodos (Princípio I).
- **Legenda da foto**: "1º dia na Prime Control" vem do pedido ("início da carreira na Prime Control") e da
  projeção na foto ("Hoje você integra ao time Prime Control"). O nome do arquivo ("Dia E") não vai para o
  site.
- **Miniatura só no arquivo**: a miniatura (Q1) fica no arquivo YAML aberto. Nos cartões (janela
  maximizada, sem JavaScript, impressão), o certificado tem o link `ver certificado` (FR-013). Uma pasta da
  DIO maximizada com 33 miniaturas pesaria ~1 MB de uma vez.
- **Posição da miniatura do certificado**: abaixo das linhas YAML, como na prévia da Q1. Na janela de
  Certificados, a árvore (5 pastas e a lista limitada) já é mais alta que o arquivo no desktop, então a
  miniatura cabe sem aumentar a janela. A foto da Prime Control fica ao lado das linhas (Q3), porque na
  Experiência a árvore é curta.
- **Arquivos originais**: os PDFs não são versionados (`*.pdf` no `.gitignore`, pela constituição). O
  plano define que fontes das imagens publicadas ficam no repositório (como `tools/source/` na 009) e como
  os 61 certificados são lidos para os dados. A foto sem desfoque e o certificado do SENAI sem a tarja ficam
  fora do repositório (FR-010, FR-020).
- **Currículo**: os 61 certificados não estão no PDF de 2026-04-21. O autor atualiza o PDF (precedente da
  002).
- **Validação com GPU real e celular físico** fica com o autor (quickstart), como nas features anteriores.
