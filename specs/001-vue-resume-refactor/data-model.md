# Data Model: `src/data/resume.ts`

**Feature**: `001-vue-resume-refactor` | **Date**: 2026-10-06

A fonte única de conteúdo (FR-001) é um módulo TypeScript que exporta `resume`, declarado com
`satisfies Resume`. Os tipos ficam em `src/types/resume.ts` e estão espelhados no contrato
[contracts/resume.schema.ts](contracts/resume.schema.ts). O tipo é o gate do FR-002; as regras que o
tipo não cobre estão em *Validação* e são testadas no Vitest.

## Entidades

### Resume (raiz)

| Campo | Tipo | Obrigatório | Origem atual |
|-------|------|-------------|--------------|
| `profile` | `Profile` | sim | hero + `#sobre` + `<head>` |
| `experiences` | `Experience[]` | sim (≥ 1) | `#experiencia` |
| `skillGroups` | `SkillGroup[]` | sim (≥ 1) | `#skills` |
| `projects` | `Project[]` | sim (≥ 1) | `#projetos` |
| `education` | `Education[]` | sim | `#educacao` |
| `contacts` | `Contact[]` | sim (≥ 1) | `extraLinks` em `js/main.js` |

### Profile

| Campo | Tipo | Regra |
|-------|------|-------|
| `name` | `string` | `h1` e título da página |
| `headline` | `string` | título profissional ("Desenvolvedor Fullstack") |
| `typedPhrases` | `string[]` | ≥ 1; frases do prompt digitado (FR-032) |
| `staticPhraseIndex` | `number` | índice exibido com movimento reduzido; deve existir em `typedPhrases` |
| `tagline` | `string` | frase revelada pelo `BlurText` (FR-015) |
| `about` | `RichText` | parágrafo do `sobre.txt`, com trechos destacados |
| `attributes` | `Attribute[]` | badges do `whois` (localização, cidadania, idiomas) |
| `seo` | `Seo` | `title`, `description`, `ogImage?` (FR-029) |

- **RichText**: `Array<string | { text: string; highlight: 'green' | 'purple' }>` — permite os
  realces atuais (`TypeScript`, `Vue` em verde) sem HTML nos dados.
- **Attribute**: `{ icon: string; label: string }` — `icon` é um emoji (renderizado com
  `aria-hidden`, o `label` carrega o significado).

### Experience

| Campo | Tipo | Regra |
|-------|------|-------|
| `id` | `string` | único, kebab-case |
| `role` | `string` | |
| `company` | `string` | nome exibido; se `confidential`, já anonimizado (FR-007) |
| `confidential` | `boolean?` | padrão `false` |
| `location` | `string` | "Cidade - UF" |
| `start` | `YearMonth` | `"AAAA-MM"` |
| `end` | `YearMonth?` | ausente = em andamento → "PRESENTE" + selo `HEAD` (FR-005) |
| `summary` | `string` | descrição de impacto |
| `highlights` | `Metric[]?` | FR-006; ausente ou vazio = bloco não renderizado |
| `tech` | `string[]` | ≥ 1 |

### Metric

`{ value: string; label: string }` — ex.: `{ value: '-40%', label: 'tempo de pesquisa manual' }`.
Só com números sustentados pelo currículo (Princípio I). Nenhum existe hoje.

### SkillGroup

| Campo | Tipo | Regra |
|-------|------|-------|
| `id` | `string` | vira o título `linguagens_frameworks/` |
| `icon` | `string` | glifo atual (`</>`, `⌁`, `▤`, `⬡`, `⚙`) |
| `items` | `SkillItem[]` | ≥ 1 |

**SkillItem**: `{ name: string; featured?: boolean }` — os `featured` alimentam a faixa contínua
(`TechMarquee`, FR-016), sem duplicar a lista.

### Project

| Campo | Tipo | Regra |
|-------|------|-------|
| `id` | `string` | único; vira o título da janela (`bash — <id>`) |
| `name` | `string` | |
| `subtitle` | `string` | "Sistema de Agendamento", "PUC-PR, Curitiba"… |
| `command` | `string` | linha de comando temática (`./run italiami --describe`) |
| `purpose` | `string` | |
| `stack` | `string[]` | ≥ 1; ver nota |
| `role` | `string` | papel do autor |
| `kind` | `'pessoal' \| 'academico' \| 'open-source' \| 'profissional'` | rótulo de tipo |
| `tag` | `string` | rodapé da janela (`[projeto pessoal]`) |
| `highlights` | `Metric[]?` | FR-006 |
| `evidence` | `Evidence[]` | vazio exige `noEvidenceReason` |
| `noEvidenceReason` | `string?` | obrigatório se `evidence` vazio (FR-010) |

**Nota de paridade**: hoje os projetos não exibem stack nem papel, mas o FR-010 e o Princípio II os
exigem. Por isso `role` é obrigatório e `stack` precisa de ≥ 1 item: o build falha até o autor
preencher esses campos a partir do currículo (ver *Pendências de conteúdo* no plan.md).

### Evidence

| Campo | Tipo | Regra |
|-------|------|-------|
| `label` | `string` | "Grape Glass Theme" |
| `url` | `string` | `https://` |
| `kind` | `'repositorio' \| 'demo' \| 'marketplace' \| 'artigo'` | |
| `badge` | `{ src: string; alt: string }?` | badge dinâmico; precisa de `alt` (FR-011) |
| `accent` | `'grape' \| 'sith'?` | cor do nome (`.neon-grape`/`.neon-sith` atuais) |

### Education

| Campo | Tipo | Regra |
|-------|------|-------|
| `course` | `string` | |
| `institution` | `string` | |
| `location` | `string` | |
| `startYear` | `number` | |
| `endYear` | `number` | ano previsto ou de conclusão |
| `status` | `'concluido' \| 'em-curso'` | `em-curso` → selo `EM CURSO` |

### Contact

`{ key: string; url: string; label?: string }` — `key` é o nome exibido no `contato.sh`
(`github = …`); `label` padrão é a URL sem protocolo, como hoje.

## Validação (Vitest, além do tipo)

1. `YearMonth` casa com `^\d{4}-(0[1-9]|1[0-2])$`; `start ≤ end` quando houver `end`.
2. No máximo uma experiência sem `end` (só vínculos reais recebem selo de atual, Princípio I).
3. `id` único dentro de cada coleção.
4. Toda URL começa com `https://`.
5. `staticPhraseIndex` válido; `typedPhrases` sem strings vazias.
6. Projeto com `evidence` vazio tem `noEvidenceReason`.
7. Paridade (SC-001): 5 experiências, 5 grupos de skills, 3 projetos, 3 formações, 5 atributos,
   2 contatos — o teste é atualizado junto com o currículo.

## Ordenação e transformações (camada de apresentação, não nos dados)

- `experiences` ordenadas por `start` decrescente; `education` por `startYear` decrescente (FR-004).
- `projects` mantêm a ordem do arquivo (relevância, Princípio II).
- `formatPeriod(start, end?)` → `MAR 2026 — JUL 2026` / `MAR 2026 — PRESENTE` (FR-005).

## Inventário de conteúdo (migração 1:1 da página atual)

### Profile

- `name`: Vittorio Perotto · `headline`: Desenvolvedor Fullstack
- `typedPhrases`: `whoami`, `Desenvolvedor Full-Stack`, `Analista de Sistemas`,
  `Arquiteto de Software`, `echo "TypeScript · Vue · PostgreSQL"` · `staticPhraseIndex`: 1
- `tagline`: Transformando processos em sistemas escaláveis — de APIs a agentes de IA.
- `about`: texto do `sobre.txt`, com `TypeScript` e `Vue` destacados em verde
- `attributes`: 📍 Curitiba - PR, Brasil · 🇮🇹 Dupla cidadania (Italiana) · 🇧🇷 Português: nativo ·
  🇬🇧 Inglês: avançado · 🇮🇹 Italiano: básico
- `seo.title` / `seo.description`: os atuais do `<head>`

### Experiences

| id | role | company | location | start | end | tech |
|----|------|---------|----------|-------|-----|------|
| `confidencial-2026` | Programador Full-Stack | Empresa de Tecnologia (Confidencial) · `confidential: true` | Curitiba - PR | 2026-03 | 2026-07 | Angular, Agentes de IA, LLMs |
| `osuper` | Programador Full-Stack | Osuper Sistemas LTDA | São Miguel do Oeste - SC | 2025-04 | 2025-09 | React, TypeScript, PostgreSQL, RabbitMQ, Redis |
| `quadritech` | Engenheiro de Software | Quadritech Tecnologia | Curitiba - PR | 2023-10 | 2024-12 | Java, Quarkus, Arquitetura, APIs REST |
| `coinov` | Consultor SAP SD | COINOV Consultoria e Serviços LTDA | Curitiba - PR | 2023-01 | 2023-07 | SAP SD, Análise Funcional, Processos |
| `prime-control` | Desenvolvedor RPA | Prime Control e Prime Robot | Curitiba - PR | 2020-10 | 2022-10 | Python, OCR, Jenkins, Elasticsearch, Kibana |

`summary` de cada uma: texto atual do `.card-desc`, sem alteração.

### Skill groups

| id | icon | items |
|----|------|-------|
| `linguagens_frameworks` | `</>` | Python (Flask), Java (Quarkus), TypeScript, Vue.js, React, Node.js, C# |
| `conceitos_web` | `⌁` | Programação Web, APIs REST |
| `gestao_de_dados` | `▤` | MongoDB, PostgreSQL, SQL Server |
| `desenho_de_processos` | `⬡` | Design Patterns, Singleton, Factory, MVC, DDD, TDD |
| `devops_qualidade` | `⚙` | Git, Docker, Jenkins, RabbitMQ, Redis, Elasticsearch, Clean Code, Agile/Scrum |

`featured` sugerido (a confirmar pelo autor): TypeScript, Vue.js, React, Java (Quarkus),
Python (Flask), Node.js, PostgreSQL, MongoDB, Docker, RabbitMQ, Redis.

### Projects

| id | name | subtitle | kind | evidence |
|----|------|----------|------|----------|
| `italiami` | ItaliaMi | Sistema de Agendamento | pessoal | nenhuma → `noEvidenceReason` a definir pelo autor |
| `monitoria` | Monitor de Curso | PUC-PR, Curitiba | academico | nenhuma → "experiência acadêmica, sem artefato público" |
| `vscode-themes` | Temas VS Code | Open VSX Registry | open-source | 2 × marketplace (Grape Glass Theme, Shadow Lord - Son of Dathomir Theme) com badges atuais |

`command`, `purpose` e `tag` copiados das janelas atuais.

### Education

| course | institution | location | startYear | endYear | status |
|--------|-------------|----------|-----------|---------|--------|
| Pós-Graduação em Cibersegurança | PUC-PR | Curitiba - PR | 2025 | 2027 | em-curso |
| Bacharelado em Sistemas de Informação | PUC-PR | Curitiba - PR | 2020 | 2024 | concluido |
| Técnico em Análise e Desenvolvimento de Sistemas | SENAI-PR | Curitiba - PR | 2018 | 2019 | concluido |

### Contacts

| key | url |
|-----|-----|
| `github` | https://github.com/V-Perotto |
| `linkedin` | https://www.linkedin.com/in/vittorioperotto/ |

A página atual não publica e-mail; o contrato permite incluí-lo depois (`mailto:` passa a ser aceito
na regra 4 se isso acontecer).
