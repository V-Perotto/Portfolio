# Page Contract: HTML publicado

**Feature**: `001-vue-resume-refactor`

O que o `dist/index.html` gerado no build garante a visitantes, buscadores e links já
compartilhados. Os testes e2e (quickstart) verificam cada item.

## URL e publicação

- Publicado em `https://v-perotto.github.io/Portfolio/` (`base: '/Portfolio/'`).
- Um único documento, `index.html`; todos os assets com caminho sob `/Portfolio/`.

## Âncoras estáveis (FR-008, SC-010)

| Âncora | Seção | Elemento |
|--------|-------|----------|
| `#home` | Hero | `<header id="home">` |
| `#sobre` | Sobre | `<section id="sobre">` |
| `#experiencia` | Experiência | `<section id="experiencia">` |
| `#skills` | Skills | `<section id="skills">` |
| `#projetos` | Projetos | `<section id="projetos">` |
| `#educacao` | Educação | `<section id="educacao">` |
| `#contato` | Contato | `<section id="contato">` |

Uma seção cuja coleção esteja vazia não é renderizada e sai do menu (edge case da spec).

## Estrutura semântica (FR-023)

- `<html lang="pt-BR">`; um único `<h1>` (nome), `<h2>` por seção, `<h3>` por cartão.
- Landmarks: `<nav aria-label="Principal">`, `<header>`, `<main>`, `<footer>`.
- Botão do menu mobile: `aria-controls` + `aria-expanded` sincronizado.
- Experiências e formações em `<ol>` (ordem cronológica tem significado); chips em `<ul>`.

## Sem JavaScript (FR-012, Princípio III)

- Todo o texto do currículo está no HTML gerado e visível.
- Sem tela de boot, sem chuva matrix e sem elementos com `opacity: 0`.
- Prompt do hero mostra `typedPhrases[staticPhraseIndex]`.
- Navegação por âncoras funciona; no mobile, o menu fica exposto em lista (sem depender do toggle).

## Classes no `<html>` (aplicadas por script inline no `<head>`)

| Classe | Quando | Efeito |
|--------|--------|--------|
| `js` | JS executou | habilita estados que dependem de JS |
| `motion` | JS + sem `prefers-reduced-motion` | habilita estados iniciais escondidos das animações |
| `booting` | `motion` e boot ainda não terminou | cobre a página com o fundo; removida pelo `BootScreen` ou após 4,8 s |

## Metadados (FR-029)

`<title>`, `meta[name=description]`, `og:title`, `og:description`, `og:type=website`, `og:url`,
`og:locale=pt_BR` e, se houver, `og:image` — todos vindos de `resume.profile.seo`.

## Links externos (FR-011)

Todo `<a>` para outra origem tem `target="_blank"` e `rel="noopener noreferrer"`, e um texto
para leitores de tela indicando que abre em nova aba. Badges têm `alt` descritivo, `loading="lazy"`
e dimensões reservadas, para não deslocar o layout se falharem.

## Impressão (FR-027)

`@media print`: fundo claro, sem scanlines, matrix, boot ou animações; URLs dos links exibidas após
o texto.
