# Data Model: Projetos ampliados, terminais animados e ícones nas skills

**Feature**: `002-projects-animated-terminals` | **Date**: 2026-10-08

Tipos completos em [contracts/resume.schema.ts](contracts/resume.schema.ts). Este documento descreve
o que muda em relação ao modelo da 001 (`specs/001-vue-resume-refactor/data-model.md`), o inventário
de conteúdo a gravar em `src/data/resume.ts` e as regras de validação.

## Entidades

### Evidence (alterada)

| Campo | Tipo | Regra |
|-------|------|-------|
| `private` | `true?` | **novo**. Só com `kind: 'repositorio'`. Exibe cadeado + "privado" (FR-005, FR-006) |

Um projeto cujos links são **todos** `private` é a exceção "código em repositório privado" do
Princípio II (v2.2.0). Todo cartão com ao menos um link `private` deriva dos próprios links o aviso
"pode não abrir" (FR-005); não há campo extra.

### Project (alterada)

| Campo | Tipo | Regra |
|-------|------|-------|
| `relatedTo` | `string?` | **novo**. Empresa relacionada, exibida em `contexto = …` (FR-009) |
| `inProgress` | `true?` | **novo**. Selo "EM DESENVOLVIMENTO", sem data (FR-013) |

A união de três formas (com evidência / confidencial / acadêmico) não muda. O ItaliaMi sai da forma
"confidencial" para a forma "com evidência" (3 links privados).

### Challenge (nova)

| Campo | Tipo | Regra |
|-------|------|-------|
| `id` | `string` | único entre challenges |
| `name` | `string` | nome da empresa ou do desafio |
| `created` | `YearMonth` | mês de criação do repositório; ≤ mês atual |
| `summary` | `string` | uma frase, o que o desafio pede |
| `stack` | `NonEmpty<string>` | tecnologias do repositório |
| `url` | `string` | `https://github.com/…`, público |

Ordem de exibição: `created` desc; empate → `name` asc (`byCreatedDesc`, FR-015).

### CommunityProject (nova)

| Campo | Tipo | Regra |
|-------|------|-------|
| `id` | `string` | único |
| `name`, `institution`, `location` | `string` | — |
| `date` | `YearMonth` | — |
| `summary`, `role` | `string` | — |
| `source` | `Link` | notícia que comprova; `https://` |

Sem `stack`: projeto não técnico (Princípio II v2.2.0, FR-019).

### Education (alterada)

| Campo | Tipo | Regra |
|-------|------|-------|
| `note` | `string?` | **novo**. Uma ou duas frases |
| `sources` | `NonEmpty<Link>?` | **novo**. Links `https://` |

Ordem: `startYear` desc; empate → `endYear` desc (FR-024).

### SkillGroup (alterada)

`icon` passa de caractere solto a `SkillIconName` (nome de ícone Lucide). Registro `nome →
componente` em `src/lib/icons.ts`, tipado como `Record<SkillIconName, Component>`.

### Resume (alterada)

Ganha `challenges: Challenge[]` e `community: CommunityProject[]`. Sub-partes vazias não são
renderizadas; a seção `#projetos` continua dependendo só de `projects`.

## Estados da animação de terminal (não persistidos)

Por janela: `idle` (completa, fora do controle) → `armed` (pré-escondida, esperando entrar na tela
ou o boot sair) → `running` → `done`. De `armed` ou `running`, qualquer pulo (clique, toque, foco,
movimento reduzido) vai direto a `done`. `done` é final: a animação não se repete (FR-027).

Por passo: comando `pending` → `typing` → `done`; saída `pending` → `done` quando o comando dela
termina.

## Inventário de conteúdo

### Projetos (ordem = relevância, FR-004)

| # | id | Nome / subtítulo | Tipo · rodapé | Links | Extras |
|---|----|------------------|---------------|-------|--------|
| 1 | `srg` | SRG — Demonstrativo de Aluguéis | pessoal · `[projeto pessoal]` | 5 privados: SRG-Vue, SRG-Admin, SRG-Node, SRG-Core, SRG-DEVOPS | `inProgress` |
| 2 | `vscode-themes` | Temas VS Code — Open VSX Registry | open-source · inalterado | 2 públicos (inalterados) | — |
| 3 | `italiami` | ItaliaMi — Sistema de Agendamento | pessoal · `[projeto pessoal]` | 3 privados: ItaliaMi-Back, ItaliaMi-Front, ItaliaMi-BOT | — |
| 4 | `ocr-prontuarios` | OCR de Prontuários — Prontuários civil e criminal | profissional · `[privado · Quadritech]` | 1 privado: OCR_Para_BR | `relatedTo` |
| 5 | `qclass-bot` | QClass-BOT — Aulas por CFC | profissional · `[privado · Quadritech]` | 1 privado: QClass-BOT | `relatedTo` |
| 6 | `monitoria` | Monitor de Curso — PUC-PR, Curitiba | acadêmico · inalterado | nenhum (exceção acadêmica) | — |

Textos novos:

- **SRG**: comando `./run srg --status`; propósito "Sistema de demonstrativo de aluguéis: imóveis,
  inquilinos, despesas e resultados num painel, com um console de administração separado para
  operar a plataforma."; stack Vue 3, TypeScript, NestJS, PostgreSQL, Prisma, Valkey, Docker, Nginx;
  papel "Autor: front-end, back-end e infraestrutura". Rótulos dos links: "SRG-Vue · front-end",
  "SRG-Admin · console de administração", "SRG-Node · API", "SRG-Core · núcleo compartilhado",
  "SRG-DEVOPS · infraestrutura".
- **ItaliaMi**: propósito, stack e papel inalterados; sai `confidential` e `noEvidenceReason`.
  Rótulos: "ItaliaMi-Back · back-end", "ItaliaMi-Front · front-end", "ItaliaMi-BOT · bot".
- **OCR de Prontuários**: comando `./run ocr_para_br --describe`; propósito "Leitura de prontuários
  civis e criminais via OCR, transformando documentos digitalizados em texto."; stack Python, OCR;
  papel "Autor e desenvolvedor"; `relatedTo` "Quadritech Tecnologia". Rótulo do link: "OCR_Para_BR".
- **QClass-BOT**: comando `./run qclass-bot --describe`; propósito "Bot que coleta e analisa os dados
  das aulas realizadas em cada CFC (Centro de Formação de Condutores) registrado."; stack Python;
  papel "Autor e desenvolvedor"; `relatedTo` "Quadritech Tecnologia". Rótulo do link: "QClass-BOT".

URLs: as do FR-007, FR-009 e FR-012 da spec.

### Challenges (7; exibidos por `created` desc)

Descrições, datas e stacks em [research.md R10](research.md#r10-fatos-dos-challenges-para-os-dados).
Nomes: CIEE-PR, Mobiis, Econet, Executiva Service, PandaVideo, NY Times (RPA), Axya. URLs: FR-014.

### Projeto comunitário (1)

- `gincana-junina`: "Gincana Junina" · PUC-PR · Curitiba - PR · `2023-06`.
- Resumo: "Projeto comunitário da PUC-PR: estudantes organizaram uma gincana junina na Escola
  Municipal Professora Nansyr Cecato Cavichiolo, no Parolin, com brincadeiras e distribuição de doces
  para as crianças."
- Papel: "Um dos estudantes organizadores (Sistemas de Informação)".
- Fonte: "pucpr.br" → URL do FR-018.

### Formação nova (1)

- "1º Empregotech" · Prefeitura de Curitiba · Curitiba - PR · 2020–2020 · concluído.
- Observação: "Programa de capacitação em tecnologia para jovens. Foi por meio dele que entrou na
  Prime Control, uma das patrocinadoras do programa."
- Fontes: "overbr.com.br" e "curitiba.pr.gov.br" → URLs do FR-022.

Ordem final: Pós (2025–2027) → Bacharelado (2020–2024) → 1º Empregotech (2020–2020) → Técnico
(2018–2019).

### Grupos de skills

| id | ícone |
|----|-------|
| `linguagens_frameworks` | `code-xml` |
| `conceitos_web` | `globe` |
| `gestao_de_dados` | `database` |
| `desenho_de_processos` | `workflow` |
| `devops_qualidade` | `server-cog` |

## Validação (Vitest, `tests/unit/resume.data.spec.ts`)

Regras da 001 continuam; mudam ou entram:

1. Datas `AAAA-MM` válidas também em `challenges[].created` e `community[].date`; `created` ≤ mês
   atual.
2. Ids únicos também em `challenges` e `community`.
3. Toda URL começa com `https://`, incluindo challenges, fonte do comunitário e fontes de formação.
4. Projeto sem evidência continua só confidencial ou acadêmico, com motivo (inalterada).
5. `private` só em evidência `kind: 'repositorio'`.
6. Inventário (substitui a "paridade" da 001): 5 experiências, 5 grupos de skills, 6 projetos na
   ordem `srg, vscode-themes, italiami, ocr-prontuarios, qclass-bot, monitoria`, 7 challenges, 1
   projeto comunitário, 4 formações, 5 atributos, 2 contatos; só `srg` com `inProgress`; 10 links
   privados.
