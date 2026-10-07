# Portfólio — Vittorio Perotto

Portfólio pessoal com tema de terminal, publicado em
[v-perotto.github.io/Portfolio](https://v-perotto.github.io/Portfolio/).

Vue 3 + TypeScript, Tailwind CSS 4 e componentes do [Vue Bits](https://vue-bits.dev). A página é
pré-renderizada no build ([vite-ssg](https://github.com/antfu-collective/vite-ssg)): o que vai para
o ar é HTML estático com todo o conteúdo, legível mesmo sem JavaScript.

## Pré-requisitos

- Node ≥ 22 e npm
- Para os testes e2e: `npx playwright install chromium`

## Comandos

| Comando | O que faz |
|---------|-----------|
| `npm ci` | instala as dependências exatas do `package-lock.json` |
| `npm run dev` | servidor de desenvolvimento em `http://localhost:5173/Portfolio/` |
| `npm run build` | checagem de tipos + build estático em `dist/` (**único comando de build**) |
| `npm run preview` | serve o `dist/` em `http://localhost:4173/Portfolio/` |
| `npm run test` | testes unitários e de componente (Vitest) |
| `npm run test:e2e` | build + testes de ponta a ponta (Playwright + axe) |

## Editar o conteúdo

Todo o texto do currículo fica em **`src/data/resume.ts`** — é o único arquivo a editar para
atualizar experiências, projetos, skills, formação ou contatos. O guia de edição está no topo do
arquivo. Um campo obrigatório faltando ou com tipo errado faz o `npm run build` falhar apontando o
campo.

## Fontes

As fontes Iosevka em `public/fonts/` são geradas com subset por `tools/build-fonts.sh`. As imagens
decorativas em `src/assets/img/` podem ser recomprimidas com `python3 tools/reencode-images.py`.

## Publicação

Cada push na `main` roda `.github/workflows/pages.yml`: instala, testa, faz o build e publica o
`dist/` no GitHub Pages (a fonte do Pages precisa estar configurada como "GitHub Actions").

## Documentação da refatoração

Especificação, plano, decisões e cenários de validação em
[`specs/001-vue-resume-refactor/`](specs/001-vue-resume-refactor/) — o roteiro de validação
completo está em [`quickstart.md`](specs/001-vue-resume-refactor/quickstart.md).
