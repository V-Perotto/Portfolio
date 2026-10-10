# Data Model: Educação numa janela de editor (feature 008)

## 1. `Education` (src/types/resume.ts) — alterada

| Campo | Tipo | Regra |
|-------|------|-------|
| `id` | `string` | **novo**, obrigatório. Slug curto (`^[a-z0-9]+(-[a-z0-9]+)*$`), único na coleção; é o slug do nome do arquivo (research R3) |
| `course` | `string` | sem mudança |
| `institution` | `string` | sem mudança |
| `location` | `string` | sem mudança |
| `startYear` | `number` | sem mudança; é o prefixo do nome do arquivo |
| `endYear` | `number` | sem mudança |
| `status` | `'concluido' \| 'em-curso'` | sem mudança; `em-curso` gera a linha `em_curso` |
| `note?` | `string` | sem mudança; gera `observacao` |
| `sources?` | `NonEmpty<Link>` | sem mudança; gera `fontes` |

Valores em `src/data/resume.ts`: `ciberseguranca`, `sistemas-de-informacao`, `empregotech`, `tecnico-ads`.

**Validação** (`tests/unit/resume.data.spec.ts`): ids únicos (junto com as outras coleções no teste (3));
formato de slug; `${startYear}_${id}.yml` com no máximo 31 caracteres.

## 2. Pasta da Educação (`EditorFolder`, src/lib/editor-files.ts) — nova instância

`educationFolder(education: readonly Education[]): EditorFolder`

| Campo | Valor |
|-------|-------|
| `label` | `formacao` |
| `path` | `~/formacao` |
| `files` | um `EditorFile` por formação, na ordem de `byStartYearDesc` |

`EditorFile` (forma da 006, sem mudança):

| Campo | Valor na Educação |
|-------|-------------------|
| `id` | `education.id` |
| `name` | `${startYear}_${id}.yml` |
| `path` | `~/formacao/${name}` |
| `position` / `total` | 1…4 / 4 |
| `lines` | ver §3 |

## 3. Linhas do arquivo de uma formação

| # | Linha | Trechos | Quando |
|---|-------|---------|--------|
| 1 | `# <pos> / <total> · <curso>` | `comment` | sempre |
| 2 | `curso: <course>` | `key`, `punct`, `str` | sempre |
| 3 | `instituicao: <institution>` | idem | sempre |
| 4 | `local: <location>` | idem | sempre |
| 5 | `periodo: <AAAA — AAAA>` | `key`, `punct`, `date` | sempre (`formatYears`) |
| 6 | `em_curso: true  # EM CURSO` | `key`, `punct`, `str`, `comment` | só `status === 'em-curso'` |
| 7–8 | `observacao: >` + texto com recuo 1 | `key`, `punct` / `str` | só com `note` |
| 9… | `fontes:` + uma linha `- <label>` por fonte, recuo 1 | `key`, `punct` / `punct`, `link` (`href` = `url`) | só com `sources` |

Exemplo, a Pós-Graduação (`2025_ciberseguranca.yml`, `1 / 4`):

```yaml
# 1 / 4 · Pós-Graduação em Cibersegurança
curso: Pós-Graduação em Cibersegurança
instituicao: PUC-PR
local: Curitiba - PR
periodo: 2025 — 2027
em_curso: true  # EM CURSO
```

## 4. Alvo `educacao` do `open` (`OpenTarget`, src/lib/sections.ts) — novo

| Campo | Valor |
|-------|-------|
| `name` | `educacao` |
| `windowId` | `educacao` (o `window-id` do `EditorWindow` da seção) |
| `path` | `~/formacao` |
| `alias` | `formacao` |
| `mode` | `maximize` |

Posição: depois de `comunitario` (ordem da página). Só existe com `resume.education.length > 0`.

## 5. Estados da janela

Os da 006/007, sem mudança: `open` → `minimized` / `closed` (ícone de pasta de código com `~/formacao`) e,
aberta, `file` ↔ `cards` (maximizada, diálogo modal).
