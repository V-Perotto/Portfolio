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

Tecnologia nova nos chips ou nas skills precisa de um nome na união `TechName`
(`src/types/resume.ts`) e de um ícone em `src/lib/tech-icons.ts`; sem isso o build falha.

## Fontes e ícones

As fontes Iosevka em `public/fonts/` são geradas com subset por `tools/build-fonts.sh`.

Os ícones de tecnologia (chips e loops de skills) vêm de um sprite SVG versionado em
`src/assets/tech-icons/sprite.svg`, gerado por `node tools/build-tech-icons.mjs` a partir do
devicon, do vectorlogo.zone, do homarr-labs/dashboard-icons (o logotipo do Valkey) e do Lucide, em
uma cor só. Rode o script só quando um ícone novo
entrar no manifesto dele; precisa de rede e do `npx` (o svgo roda com versão fixa). Origem e
licença de cada ícone ficam em `src/assets/tech-icons/NOTICE.md`.

## Terminal e efeitos

Depois da tela de boot, a dock no centro de baixo abre um terminal (também por Ctrl+Alt+T; no
Ubuntu e em outros Linux esse atalho é do sistema, então lá use a dock). `help` lista os comandos, e
`find <seção>` leva até a seção. Os fundos animados do boot (Faulty Terminal) e do hero (CRT Warp
com a chuva Matrix) vêm do Vue Bits, adaptados para rodar num Web Worker com WebGL, sem
dependência nova. Sem WebGL, com "reduzir movimento" ou sem JavaScript, o site fica com os fundos
estáticos.

Nos testes e2e, o projeto `webgl` do Playwright roda os arquivos que dependem de WebGL (boot, hero,
`motion` e peso), com os testes de cada arquivo em série. Os demais rodam no projeto `chromium` com
WebGL desligado.

## Publicação

Cada push na `main` roda `.github/workflows/pages.yml`: instala, testa, faz o build e publica o
`dist/` no GitHub Pages (a fonte do Pages precisa estar configurada como "GitHub Actions").

## Documentação

Especificação, plano, decisões e cenários de validação de cada feature em `specs/`:
[`001-vue-resume-refactor/`](specs/001-vue-resume-refactor/) (a refatoração para Vue, com o roteiro
de validação completo em [`quickstart.md`](specs/001-vue-resume-refactor/quickstart.md)),
[`002-projects-animated-terminals/`](specs/002-projects-animated-terminals/),
[`003-devicons-skill-loops/`](specs/003-devicons-skill-loops/) e
[`004-dock-windows-crt/`](specs/004-dock-windows-crt/).
