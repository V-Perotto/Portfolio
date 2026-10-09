# Data Model: Limpeza visual, links destacados, ícones devicon e skills em loops

**Feature**: `003-devicons-skill-loops` | **Date**: 2026-10-08

Tipos completos em [contracts/resume.schema.ts](contracts/resume.schema.ts). Este documento descreve
o que muda em relação ao modelo da 002 (`specs/002-projects-animated-terminals/data-model.md`), o
registro de ícones e as regras de validação. Nenhum dado factual do currículo muda.

## Entidades

### TechName (nova, união de strings)

Os 54 nomes de tecnologia exibidos hoje, com a grafia exata dos dados. É o tipo dos campos de
tecnologia abaixo; nome fora da união quebra o `vue-tsc` (FR-017, research R3).

### TechIconId (nova, união de strings)

Id de um `<symbol>` do sprite `src/assets/tech-icons/sprite.svg`, com prefixo da fonte:
`devicon-<nome>`, `vectorlogo-<nome>` ou `lucide-<nome>` (ex.: `devicon-python`, `vectorlogo-sap`,
`lucide-database`).

### Registro `TECH_ICONS` (novo, `src/lib/tech-icons.ts`)

`Record<TechName, TechIconId>`: toda tecnologia exibida tem exatamente um ícone (FR-012, FR-017).
Variações de nome apontam para o mesmo id.

### SkillItem (alterada)

| Campo | Tipo | Regra |
|-------|------|-------|
| `name` | `TechName` | era `string` |
| `featured` | — | **removido**: só servia à faixa contínua, que sai (FR-019) |

### SkillGroup (sem mudança de forma)

`id` vira o título da sub-parte (`### linguagens_frameworks/`); `icon` (Lucide, 002) vai ao lado do
título (FR-030); `items` alimenta o loop.

### Experience, Project, Challenge (alteradas)

| Entidade | Campo | Tipo | Mudança |
|----------|-------|------|---------|
| Experience | `tech` | `NonEmpty<TechName>` | era `NonEmpty<string>` |
| Project | `stack` | `NonEmpty<TechName>` | era `NonEmpty<string>` |
| Project | `command` | `string` | sem o prefixo `./run ` (FR-003) |
| Challenge | `stack` | `NonEmpty<TechName>` | era `NonEmpty<string>` |

O título da janela de projeto é o `name` que já existe (FR-011); não há campo novo.

## Inventário

### Comandos (FR-003)

| Projeto | Antes | Depois |
|---------|-------|--------|
| SRG | `./run srg --status` | `srg --status` |
| Temas VS Code | `ovsx get DistroLinux/* --describe` | (igual) |
| ItaliaMi | `./run italiami --describe` | `italiami --describe` |
| OCR de Prontuários | `./run ocr_para_br --describe` | `ocr_para_br --describe` |
| QClass-BOT | `./run qclass-bot --describe` | `qclass-bot --describe` |
| Monitor de Curso | `./run monitoria --describe` | `monitoria --describe` |

### Títulos das janelas (FR-011)

`sobre.txt` · `SRG` · `Temas VS Code` · `ItaliaMi` · `OCR de Prontuários` · `QClass-BOT` ·
`Monitor de Curso` · `contato.sh`

### Registro de ícones (FR-013, research R1)

**devicon v2.17.0** (variante entre parênteses) — 31 nomes, 28 ícones:

| Tecnologia | Id | | Tecnologia | Id |
|------------|----|-|------------|----|
| Python, Python (Flask) | `devicon-python` (plain) | | MongoDB | `devicon-mongodb` (plain) |
| Flask | `devicon-flask` (original) | | PostgreSQL | `devicon-postgresql` (plain) |
| Java, Java (Quarkus) | `devicon-java` (plain) | | SQL Server | `devicon-microsoftsqlserver` (plain) |
| Quarkus | `devicon-quarkus` (plain) | | MySQL | `devicon-mysql` (original) |
| TypeScript | `devicon-typescript` (plain) | | Git | `devicon-git` (plain) |
| Vue.js, Vue 3 | `devicon-vuejs` (plain) | | Docker | `devicon-docker` (plain) |
| React | `devicon-react` (original) | | Jenkins | `devicon-jenkins` (plain) |
| Angular | `devicon-angular` (plain) | | RabbitMQ | `devicon-rabbitmq` (original) |
| Node.js | `devicon-nodejs` (plain) | | Redis | `devicon-redis` (plain) |
| C# | `devicon-csharp` (plain) | | Elasticsearch | `devicon-elasticsearch` (plain) |
| .NET | `devicon-dot-net` (plain) | | Kibana | `devicon-kibana` (plain) |
| NestJS | `devicon-nestjs` (original) | | Vite | `devicon-vitejs` (plain) |
| Prisma | `devicon-prisma` (original) | | Axios | `devicon-axios` (plain) |
| VS Code Extension API | `devicon-vscode` (plain) | | JSON de tema | `devicon-json` (plain) |

**vectorlogo.zone** — 2 nomes: SAP SD → `vectorlogo-sap` (`sap-icon.svg`) e Nginx →
`vectorlogo-nginx` (`nginx-icon.svg`; o devicon só tem o logotipo escrito, ilegível no chip — research
R1). O desenho branco de cada um vira recorte.

**Lucide** (pelo assunto) — 21 nomes, 20 ícones:

| Tecnologia | Id | | Tecnologia | Id |
|------------|----|-|------------|----|
| Valkey | `lucide-database` | | Programação Web | `lucide-app-window` |
| OCR | `lucide-scan-text` | | Análise Funcional | `lucide-clipboard-list` |
| LLMs | `lucide-brain-circuit` | | Processos | `lucide-workflow` |
| Agentes de IA | `lucide-bot` | | Open VSX Registry | `lucide-package` |
| Robocorp (RPA Framework) | `lucide-bot` | | JSON Server | `lucide-server` |
| Robot Framework | `lucide-list-checks` | | Design Patterns | `lucide-shapes` |
| Arquitetura | `lucide-blocks` | | Singleton | `lucide-circle-dot` |
| APIs REST | `lucide-webhook` | | Factory | `lucide-factory` |
| MVC | `lucide-panels-top-left` | | DDD | `lucide-boxes` |
| TDD | `lucide-flask-conical` | | Clean Code | `lucide-brush-cleaning` |
| Agile/Scrum | `lucide-iteration-cw` | | | |

Sprite: 28 + 2 + 20 = **50 símbolos**.

### Skills por sub-parte (FR-020 a FR-022; ordem atual, 28 skills)

| Sub-parte | Skills (fonte do ícone) |
|-----------|-------------------------|
| `linguagens_frameworks` | Python (Flask), Java (Quarkus), TypeScript, Vue.js, React, Angular, Node.js, C# — devicon |
| `conceitos_web` | Programação Web, APIs REST — Lucide |
| `gestao_de_dados` | MongoDB, PostgreSQL, SQL Server — devicon |
| `desenho_de_processos` | Design Patterns, Singleton, Factory, MVC, DDD, TDD — Lucide |
| `devops_qualidade` | Git, Docker, Jenkins, RabbitMQ, Redis, Elasticsearch — devicon; Valkey, Clean Code, Agile/Scrum — Lucide |

## Validação

| Regra | Onde |
|-------|------|
| Todo nome de tecnologia nos dados existe em `TechName` | `vue-tsc` (build) |
| Todo `TechName` tem entrada em `TECH_ICONS` | `vue-tsc` (`Record`) |
| Todo id de `TECH_ICONS` existe como `<symbol id>` no sprite, e todo símbolo é usado | Vitest |
| Nenhum `command` começa com `./run` | Vitest |
| As 28 skills e os 5 grupos continuam (inventário) | Vitest (`resume.data.spec.ts`) |
| Nenhum `<symbol>` do sprite tem cor fixa (`fill`/`stroke` diferentes de `none`/`currentColor`) | Vitest |
