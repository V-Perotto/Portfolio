# Data Model: certificados em pastas por plataforma e a foto do 1º dia na Prime Control (feature 010)

Tipos novos e alterados em `src/types/resume.ts` e `src/lib/editor-files.ts`, os itens novos de
`src/data/resume.ts` e as regras que o tipo não expressa (verificadas em `tests/unit/resume.data.spec.ts`).
Decisões em [research.md](research.md).

## 1. Tipos de dados (`src/types/resume.ts`)

```ts
/** Imagem publicada em `public/`, gerada por `tools/` (009: captura; 010: foto). */
interface ImageFile {
  /** Versão exibida, relativa ao `base`: 'carreira/prime-control/integracao-2020-10-15-512.webp'. */
  src: string
  /** Largura da versão exibida, em px (512). */
  srcWidth: number
  /** Versão em tamanho real (a resolução da origem), relativa ao `base`. */
  full: string
  /** Dimensões do tamanho real: proporção reservada e tamanho no visualizador. */
  width: number
  height: number
  /** Texto alternativo (FR-019 da 010; FR-017 da 009). */
  alt: string
}

/** Captura de tela (009), sem mudança de campos: agora estende `ImageFile`. */
export interface Screenshot extends ImageFile {
  caption: string
  captured: YearMonth
}

/** Foto de uma experiência (010, FR-017 a FR-021): a legenda leva o dia (`15 OUT 2020`). */
export interface Photo extends ImageFile {
  /** Legenda sem a data: '1º dia na Prime Control'. */
  caption: string
  /** Dia da foto: '2020-10-15' (exibido `15 OUT 2020`, `formatDate`). */
  taken: YearMonthDay
}

export interface Experience {
  // … campos de hoje …
  /** Foto ao lado do arquivo `~/carreira/…yml` e no cartão (010). Hoje, só a Prime Control. */
  photo?: Photo
}

/** Verificação de um certificado (FR-008, research R5). */
export type CertificateVerification =
  /** Endereço que abre o certificado do autor; `code`, quando existe, vira o texto do link. */
  | { url: string; code?: string }
  /** Sem endereço que funcione: o código impresso, como texto. */
  | { code: string; url?: never }

export interface Certificate {
  /** Slug curto e fixo, único na plataforma: o nome do arquivo `AAAA-MM-DD_<id>.yml` (FR-006). */
  id: string
  /** Título como está impresso no certificado (Princípio I). */
  title: string
  /** Data de emissão. */
  issued: YearMonthDay
  /** Carga horária, em horas, como impressa. */
  hours: number
  /** Só quando o certificado declara o tipo e o título não o diz (FR-007). */
  kind?: 'bootcamp'
  /** Ementa, quando o certificado a traz (FR-007): só o SENAI. */
  syllabus?: NonEmpty<string>
  /** Ausente só quando publicar o código exporia dados pessoais (SENAI, C2). */
  verification?: CertificateVerification
}

export interface CertificatePlatform {
  /** Nome da pasta na árvore: 'dio', 'prime-academy'… (minúsculas, sem acento, com hífen). */
  id: string
  /** Nome exibido: 'DIO', 'Prime Academy', 'Udemy', 'SENAI', 'Promenady'. */
  name: string
  /** Dimensões do tamanho real das imagens desta plataforma (research R2, R4). */
  image: { width: number; height: number }
  certificates: NonEmpty<Certificate>
}

export interface Resume {
  // … campos de hoje …
  /** Na ordem das pastas (a do pedido do autor). Vazio = sem seção, sem menu, sem `open`. */
  certificatePlatforms: CertificatePlatform[]
}
```

## 2. Valores derivados (`src/lib/certificates.ts`)

Funções puras, usadas pelo `editor-files`, pelos cartões e pelos testes:

| Função | Resultado (ex.: DIO, Lógica de programação essencial) |
|--------|-------------------------------------------------------|
| `byIssuedDesc(certs)` | ordem da pasta: data desc., estável no mesmo dia |
| `certificateFileName(cert)` | `2020-04-13_logica-programacao.yml` |
| `certificateImage(platform, cert)` | `{ src: 'certificados/dio/2020-04-13_logica-programacao-640.webp', srcWidth: 640, full: 'certificados/dio/2020-04-13_logica-programacao-1200.webp', width: 1200, height: 849, alt: 'Certificado da DIO: Lógica de programação essencial, 4 h, 13/04/2020' }` |
| `verificationText(v)` | link: o endereço sem `https://` (`hermes.dio.me/certificates/F4F49CF0.pdf`); com `code` e `url`: `e-certificado.com · <código>`; só código: o código |
| `formatHours(h)` | `4 h` |

A largura da miniatura é a constante `CERT_THUMB_WIDTH = 640`. A do tamanho real é `platform.image.width`.

## 3. Arquivos e pastas do editor (`src/lib/editor-files.ts`)

```ts
export interface EditorFigure extends ImageFile {
  /** Legenda no estilo `# …`; ausente nos certificados (o arquivo já diz o que é). */
  caption?: string
  /** 'below': abaixo das linhas (certificados); 'side': ao lado a partir de 900 px (foto). */
  placement: 'below' | 'side'
  /** Texto `.sr-only` do link: '(abre o certificado em tamanho real)'. */
  openLabel: string
  /** `sizes` do `<img>` (research R6, R8). */
  sizes: string
  /** Legenda do visualizador: '# DIO · <título> · 29 JUL 2020' (certificado) ou a da foto. */
  viewerCaption: string
}

export interface EditorFile {
  // … campos de hoje (id, name, path, position, total, lines) …
  /** Pasta do arquivo, quando a janela tem várias ('dio'); a posição é contada dentro dela. */
  group?: string
  figure?: EditorFigure
}

export interface EditorGroup {
  /** 'dio' (rótulo da pasta na árvore: 'dio/'). */
  label: string
  /** 'DIO': título do grupo de cartões. */
  title: string
  files: EditorFile[]
}

export interface EditorFolder {
  // … label, path, files (todos, na ordem das pastas) …
  /** Pastas da árvore (só Certificados). Sem `groups`, a árvore tem a pasta raiz, como hoje. */
  groups?: EditorGroup[]
}
```

- `certificateFolder(platforms)`: `label: 'certificados'`, `path: '~/certificados'`. Um grupo por
  plataforma, com arquivos de id `<plataforma>/<slug>`, caminho `~/certificados/<plataforma>/<nome>` e
  posição na pasta. As linhas são as de research R3. `figure` com `placement: 'below'`.
- `experienceFolder(experiences)`: igual a hoje. Quando a experiência tem `photo`, o arquivo ganha
  `figure` com `placement: 'side'` e `caption: '# 1º dia na Prime Control · 15 OUT 2020'`.

### Linhas de cada tipo de verificação

| Plataforma | Linha |
|------------|-------|
| DIO, Udemy | `verificacao: <endereço sem https://>` (link) |
| Promenady | `verificacao: e-certificado.com · <código>` (link para `…/login/autenticar?c=<código>`) |
| Prime Academy | `codigo: <hash de 32 caracteres>` (texto) |
| SENAI | `# código omitido por privacidade` (comentário) |

## 4. Foto da Prime Control (`experiences[prime-control].photo`)

| Campo | Valor |
|-------|-------|
| `src` / `srcWidth` | `carreira/prime-control/integracao-2020-10-15-512.webp` / `512` |
| `full` / `width` × `height` | `carreira/prime-control/integracao-2020-10-15-1024.webp` / `1024` × `768` |
| `alt` | `Integração dos novos funcionários na Prime Control em 15/10/2020: seis pessoas de máscara ao redor de uma mesa com notebooks, com Vittorio Perotto na ponta direita, de frente, e a projeção "Bem-vindo Prime Hero!". Os rostos das outras pessoas estão desfocados.` |
| `caption` | `1º dia na Prime Control` |
| `taken` | `2020-10-15` |

## 5. Edições das imagens (`tools/build-certificates.mjs`)

Ficam no manifesto do script, não nos dados.

- **SENAI** (`senai/ia`, origem `CERTIFICADO.pdf`, página 1): tarjas pretas opacas, em pt da página
  A4 (841,89 × 595,28), com margem. Medidas com `pdftotext -bbox-layout`:
  - naturalidade, cidade e UF: x 147–294, y 296–321;
  - RG, número e UF: x 325–447, y 296–321;
  - CPF, número: x 490–593, y 296–321;
  - data de nascimento: x 709–794, y 296–321;
  - código de identificação (C2): x 497–557, y 571–587.
- **Foto** (`DiaE-PrimeControl.jpeg`, 1024 × 768): desfoque forte sobre os rostos das 5 outras pessoas,
  em px da origem, com margem, conferido na miniatura e no tamanho real:
  - frente, à esquerda: x 85–190, y 255–365;
  - atrás, à esquerda: x 175–250, y 215–300;
  - de pé, ao fundo: x 270–335, y 190–260;
  - camisa xadrez, ao fundo à direita: x 620–690, y 215–290;
  - máscara branca: x 690–770, y 230–335.

  O rosto do autor (x ~860–950) não é tocado.
- **Qualidade**: 0,80, com duas exceções: as miniaturas da Udemy (0,70) e o que a medida pedir para
  ficar sob o teto (SC-011).

## 6. Validação (`tests/unit/resume.data.spec.ts`)

1. 5 plataformas, na ordem `dio`, `prime-academy`, `udemy`, `senai`, `promenady`. Ids de plataforma em
   kebab-case e únicos.
2. 61 certificados (33 / 20 / 2 / 1 / 5). `issued` no formato `AAAA-MM-DD`, data válida, não futura.
   `hours` inteiro > 0. `title` não vazio.
3. `id` em kebab-case, com ≤ 20 caracteres, único na plataforma. `AAAA-MM-DD_<id>.yml` com ≤ 35
   caracteres.
4. Dentro de cada plataforma, os dados já estão do mais recente para o mais antigo (a ordem dos dados é
   a da pasta no mesmo dia).
5. `verification.url` começa com `https://`. Só o SENAI não tem `verification`.
6. Para cada certificado, `public/<src>` e `public/<full>` existem, e as dimensões lidas do cabeçalho do
   WebP batem: largura 640 e a altura proporcional (±1) na miniatura; `platform.image` no tamanho real.
7. Privacidade: nenhum texto de `certificatePlatforms` nem da foto casa com
   `\d{3}\.?\d{3}\.?\d{3}-?\d{2}` (CPF), `\bRG\b`, `\d{2}/\d{2}/\d{4}` junto de "nasc" ou "natural de".
8. A foto: os caminhos existem; `taken` válido; `alt` e `caption` não vazios. Só uma experiência tem
   `photo`.

## 7. Itens dos dados (`certificatePlatforms`)

| Plataforma | `id` | `name` | `image` |
|------------|------|--------|---------|
| 1 | `dio` | DIO | 1200 × 849 |
| 2 | `prime-academy` | Prime Academy | 1039 × 717 |
| 3 | `udemy` | Udemy | 1200 × 893 |
| 4 | `senai` | SENAI | 1200 × 849 |
| 5 | `promenady` | Promenady | 1200 × 849 |

As dimensões dos PDFs saem do `pdftoppm -scale-to-x 1200`. A altura exata (849 ou 848) é a do arquivo
gerado, e o teste 6 a confere.

### `dio/` — DIO (33)

| # | Arquivo | Título (`title`) | h | Extra | Verificação | Origem |
|---|---------|------------------|---|-------|-------------|--------|
| 1 | `2020-07-29_empregotech-basico.yml` | Programa EmpregoTech Curitiba - Básico | 39 | `tipo: bootcamp` | link `hermes.dio.me/certificates/207D7222.pdf` | `207D7222.pdf` |
| 2 | `2020-07-29_empregotech-inter.yml` | Programa Empregotech Curitiba - Intermediário | 79 | `tipo: bootcamp` | link `hermes.dio.me/certificates/E1741B9C.pdf` | `E1741B9C.pdf` |
| 3 | `2020-07-07_node-filas.yml` | Desafio prático: Arquitetura interna no Node e filas | 2 |  | link `hermes.dio.me/certificates/A35EA586.pdf` | `A35EA586.pdf` |
| 4 | `2020-07-06_node-backend.yml` | Desenvolvimento back-end com Node.js | 5 |  | link `hermes.dio.me/certificates/04197A25.pdf` | `04197A25.pdf` |
| 5 | `2020-07-06_node-api-crushes.yml` | Desafio prático: Criando uma API em Node.js para gerenciar seus crushes | 3 |  | link `hermes.dio.me/certificates/2A52F6C3.pdf` | `2A52F6C3.pdf` |
| 6 | `2020-07-03_postgresql.yml` | Conceitos e melhores práticas com bancos de dados PostgreSQL | 9 |  | link `hermes.dio.me/certificates/1D1848C9.pdf` | `1D1848C9.pdf` |
| 7 | `2020-07-03_node-express.yml` | Introdução ao Node.js com Express | 2 |  | link `hermes.dio.me/certificates/20FDACA9.pdf` | `20FDACA9.pdf` |
| 8 | `2020-07-01_redux.yml` | Desafio prático: Como gerenciar o estado das aplicações com Redux | 3 |  | link `hermes.dio.me/certificates/09DC6357.pdf` | `09DC6357.pdf` |
| 9 | `2020-07-01_js-com-react.yml` | Desafio prático: Praticando JavaScript com React | 2 |  | link `hermes.dio.me/certificates/37389BE3.pdf` | `37389BE3.pdf` |
| 10 | `2020-07-01_reactjs-web.yml` | Desenvolvimento de aplicações para internet com ReactJS | 4 |  | link `hermes.dio.me/certificates/63AD8F56.pdf` | `63AD8F56.pdf` |
| 11 | `2020-07-01_react-typescript.yml` | Desafio prático: React.js com TypeScript | 3 |  | link `hermes.dio.me/certificates/A37A0FDD.pdf` | `A37A0FDD.pdf` |
| 12 | `2020-07-01_intro-reactjs.yml` | Introdução ao ReactJS | 3 |  | link `hermes.dio.me/certificates/F95A98CB.pdf` | `F95A98CB.pdf` |
| 13 | `2020-06-30_performance-web.yml` | Desafio prático: Performance Web Utilizando JavaScript | 2 |  | link `hermes.dio.me/certificates/6302A4C9.pdf` | `6302A4C9.pdf` |
| 14 | `2020-06-30_tdd-javascript.yml` | Desafio prático: TDD com JavaScript | 3 |  | link `hermes.dio.me/certificates/83658A4D.pdf` | `83658A4D.pdf` |
| 15 | `2020-06-29_js-es6-avancado.yml` | Desenvolvimento avançado com JavaScript ES6 | 5 |  | link `hermes.dio.me/certificates/A505E509.pdf` | `A505E509.pdf` |
| 16 | `2020-06-29_styled-components.yml` | Desafio prático: Utilizando Styled Components (CSS-in-JS) | 2 |  | link `hermes.dio.me/certificates/FB4F39F0.pdf` | `FB4F39F0.pdf` |
| 17 | `2020-06-24_js-es6-essencial.yml` | JavaScript ES6 essencial | 4 |  | link `hermes.dio.me/certificates/AA7D3B45.pdf` | `AA7D3B45.pdf` |
| 18 | `2020-06-22_promises.yml` | Desafio prático: Entendendo Promises de uma vez por todas | 3 |  | link `hermes.dio.me/certificates/C162ED32.pdf` | `C162ED32.pdf` |
| 19 | `2020-06-20_modelagem-negocios.yml` | Modelagem de Negócios | 4 |  | link `hermes.dio.me/certificates/6C7F9089.pdf` | `6C7F9089.pdf` |
| 20 | `2020-06-20_javascript-web.yml` | Programação para internet com JavaScript | 2 |  | link `hermes.dio.me/certificates/EE630C61.pdf` | `EE630C61.pdf` |
| 21 | `2020-06-12_negocios-digitais.yml` | Fundamentos de Negócios Digitais Escaláveis | 6 |  | link `hermes.dio.me/certificates/B00E13E2.pdf` | `B00E13E2.pdf` |
| 22 | `2020-05-19_hexagonal.yml` | Expert Lesson: Arquitetura Hexagonal: mantendo aplicações saudáveis | 3 |  | link `hermes.dio.me/certificates/79B5C5C4.pdf` | `79B5C5C4.pdf` |
| 23 | `2020-05-18_arquitetura-avancado.yml` | Arquitetura de Sistemas Avançado | 3 |  | link `hermes.dio.me/certificates/61817017.pdf` | `61817017.pdf` |
| 24 | `2020-05-18_ddd-arquitetura.yml` | Expert Lesson: DDD e arquitetura de software | 2 |  | link `hermes.dio.me/certificates/DA144088.pdf` | `DA144088.pdf` |
| 25 | `2020-05-16_bootstrap.yml` | Construindo páginas para internet com Bootstrap | 4 |  | link `hermes.dio.me/certificates/79F59175.pdf` | `79F59175.pdf` |
| 26 | `2020-05-13_html5-css3.yml` | Programação para internet com HTML5 e CSS3 | 6 |  | link `hermes.dio.me/certificates/3085EBFF.pdf` | `3085EBFF.pdf` |
| 27 | `2020-04-21_mentalidade.yml` | Mentalidade Empreendedora | 3 |  | link `hermes.dio.me/certificates/265A8CDF.pdf` | `265A8CDF.pdf` |
| 28 | `2020-04-21_intraempreendedor.yml` | Fundamentos do Intraempreendedorismo | 2 |  | link `hermes.dio.me/certificates/4DD49C6E.pdf` | `4DD49C6E.pdf` |
| 29 | `2020-04-21_scrum.yml` | Projetos ágeis com SCRUM | 2 |  | link `hermes.dio.me/certificates/F861E33A.pdf` | `F861E33A.pdf` |
| 30 | `2020-04-20_github.yml` | Introdução ao GitHub e comandos essenciais para trabalhar em equipe | 4 |  | link `hermes.dio.me/certificates/4091DB01.pdf` | `4091DB01.pdf` |
| 31 | `2020-04-17_git.yml` | Introdução ao Git e Controle de Versões | 2 |  | link `hermes.dio.me/certificates/1D2A9D24.pdf` | `1D2A9D24.pdf` |
| 32 | `2020-04-17_arquitetura-sistemas.yml` | Fundamentos de Arquitetura de Sistemas | 7 |  | link `hermes.dio.me/certificates/B10F8D56.pdf` | `B10F8D56.pdf` |
| 33 | `2020-04-13_logica-programacao.yml` | Lógica de programação essencial | 4 |  | link `hermes.dio.me/certificates/F4F49CF0.pdf` | `F4F49CF0.pdf` |

### `prime-academy/` — Prime Academy (20)

| # | Arquivo | Título (`title`) | h | Extra | Verificação | Origem |
|---|---------|------------------|---|-------|-------------|--------|
| 1 | `2020-10-29_scrum.yml` | Metodologia Agile SCRUM | 8 |  | `codigo: 168f93bcd15b398af83a157e33202ad8` | `CertificadoSCRUM.png` |
| 2 | `2020-10-27_apis.yml` | APIs | 3 |  | `codigo: 666923b8ee6805a1a5040c2ddcb47d02` | `CertificadoAPI.png` |
| 3 | `2020-10-27_bdd.yml` | BDD – Behaviour Driven Development | 2 |  | `codigo: 5bf3c2add2d82159cec7ac218a11230d` | `CertificadoBDD.png` |
| 4 | `2020-10-27_csharp-convencoes.yml` | Convenções de codificação em C# | 2 |  | `codigo: e5785b86ff4d61433754503c05ccb18d` | `certificadoC#.png` |
| 5 | `2020-10-27_hp-alm-qc.yml` | Elaboração de Cenários de Testes HP ALM QC | 2 |  | `codigo: d20273ae5ee5a86c82cbabdb01780bb6` | `CertificadoHP-ALM-QC.png` |
| 6 | `2020-10-27_rabbiit.yml` | Rabbiit – Para que serve e como usar | 2 |  | `codigo: a5f54e2556ca25bea1fac3c2f80e8683` | `CertificadoRabbiit.png` |
| 7 | `2020-10-27_sql-basico.yml` | SQL Básico | 2 |  | `codigo: 48bf6fbc0f69c700e8ec0d17659578cc` | `CertificadoSQL.png` |
| 8 | `2020-10-22_chatbots.yml` | Chatbots – Como garantir a qualidade | 2 |  | `codigo: 2ee613c0e8e285565a7e880cb5060649` | `CertificadoChatbot.png` |
| 9 | `2020-10-22_hp-alm-uft.yml` | Automação de Testes com HP ALM e HP UFT | 2 |  | `codigo: 4b4cee33d2026da828dfd05894890a92` | `CertificadoHP_ALM-HP_UFT.png` |
| 10 | `2020-10-22_varejo.yml` | Noções Básicas de Varejo | 8 |  | `codigo: 8092f935cfd11640ec458190b391dbd0` | `CertificadoNocoesBasicasVarejo.png` |
| 11 | `2020-10-21_abertura-bugs.yml` | Abertura de Bugs | 2 |  | `codigo: 4724401e92e002d48f8c50f37f8a9505` | `CertificadoAberturaBugs.png` |
| 12 | `2020-10-21_web-ruby.yml` | Automação Web com Ruby | 2 |  | `codigo: 6f86d57c6a499535e099e5ef4c427074` | `CertificadoAutomarWebRuby.png` |
| 13 | `2020-10-21_gtd.yml` | Produtividade pessoal com GTD | 2 |  | `codigo: 3243d5b2b9c88cfe9a5537e757589162` | `CertificadoGTD.png` |
| 14 | `2020-10-21_teste-software.yml` | Teste de Software | 2 |  | `codigo: 081e713f457f669896bc2b0b21332a36` | `CertificadoTesteSoftware.png` |
| 15 | `2020-10-19_testador-agil.yml` | Webinar – O papel de um testador em uma equipe ágil | 2 |  | `codigo: 6e95244e8d13a7803111187d00dab2e7` | `CertificadoTestadorAgil.png` |
| 16 | `2020-10-16_casos-de-teste.yml` | Especificação de Caso de Teste | 2 |  | `codigo: 1bc03e7949ee25c72bcc1e95fcde174a` | `CertificadoEspecificacaoCasosTeste.png` |
| 17 | `2020-10-15_continuous-testing.yml` | Webinar – Acelerando entregas com Continuous Testing | 1 |  | `codigo: e63ee59d496e845ace929922e769290b` | `CertificadoAcelerarEntregasTesting.png` |
| 18 | `2020-10-15_bdd-caso-de-teste.yml` | Webinar – BDD não é Caso de Teste! | 2 |  | `codigo: 469d097f2798061c2c8a485859ef7544` | `CertificadoBDDn.png` |
| 19 | `2020-10-15_ct-academy.yml` | Continous Testing Academy – Iniciante | 3 |  | `codigo: d9983eba12ca8d6bda0a706e770963d5` | `CertificadoContinousTestingAcademy.png` |
| 20 | `2020-10-15_conhecendo-prime.yml` | Webinar – Conhecendo a Prime Control | 1 |  | `codigo: 2ee8f214754d929af93616eb9336e781` | `CertificadoWebinarConhecerPrime.png` |

### `udemy/` — Udemy (2)

| # | Arquivo | Título (`title`) | h | Extra | Verificação | Origem |
|---|---------|------------------|---|-------|-------------|--------|
| 1 | `2020-11-13_robot-avancado.yml` | Automação de Testes com Robot Framework - Avançado | 7 |  | link `ude.my/UC-fa70c848-4678-4ccd-a50e-b92905d589f5` | `CertificadoRobotAvançado.pdf` |
| 2 | `2020-11-11_robot-basico.yml` | Automação de Testes com Robot Framework - Básico | 4 |  | link `ude.my/UC-6d75d1fc-c72a-4df4-8cf1-9b572b69e489` | `CertificadoRobotBasico.pdf` |

### `senai/` — SENAI (1)

| # | Arquivo | Título (`title`) | h | Extra | Verificação | Origem |
|---|---------|------------------|---|-------|-------------|--------|
| 1 | `2020-12-30_ia.yml` | Inteligência Artificial | 40 | `ementa` (10 itens) | — (`# código omitido por privacidade`) | `CERTIFICADO.pdf` |

### `promenady/` — Promenady (5)

| # | Arquivo | Título (`title`) | h | Extra | Verificação | Origem |
|---|---------|------------------|---|-------|-------------|--------|
| 1 | `2023-02-18_abap-funcionais.yml` | Visão de Abap para Funcionais | 8 |  | link · `1641746ADFBD682A10825550` | `certificado-visao-abap-funcionais.pdf` |
| 2 | `2023-02-11_taxbra-avancado.yml` | TAXBRA - Nível Avançado | 8 |  | link · `1638164AC6232AEC10825550` | `certificado-taxbra-avancado.pdf` |
| 3 | `2023-01-28_taxbra-basico.yml` | TAXBRA - Nível Básico | 8 |  | link · `1638154ABCB3441910825550` | `certificado-taxbra-basico.pdf` |
| 4 | `2023-01-21_localizacao-br.yml` | Localização Brasileira | 8 |  | link · `1629842A7AF02A6B10825550` | `certificado-localizacao-brasileira.pdf` |
| 5 | `2023-01-16_formacao-consultores.yml` | Formação de Consultores | 80 |  | link · `1641756A81BF361B10825550` | `certificado-formacao-consultores.pdf` |

