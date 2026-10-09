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

## Porta de acesso, terminal e efeitos

A página abre com uma porta de acesso: um ícone `acessar_portfolio.sh` sobre o Faulty Terminal do
Vue Bits. O clique (ou Enter, ou Espaço) abre uma janela onde uma sessão SSH é digitada pelo TextType
do Vue Bits; no fim dela, o portfólio aparece. Minimizar a janela não interrompe a sessão; fechar
encerra a tentativa, e o ícone abre outra. Com "reduzir movimento" no sistema, a porta aparece sem
animação e a página abre 1 s depois do clique. Sem JavaScript, não há porta: o conteúdo está todo no
HTML.

A sessão mostra o IP público do visitante, consultado uma vez por visita no
[ipify](https://www.ipify.org/) (`api.ipify.org`, sem cookies nem referer). Se o serviço falhar, for
bloqueado ou demorar, a sessão usa `127.0.0.1`. O IP só aparece na tela: não é guardado nem enviado
a mais nada. É o único pedido a terceiros do site além dos badges do shields.io.

Depois da porta, a dock no centro de baixo abre um terminal (também por Ctrl+Alt+T; no Ubuntu e em
outros Linux esse atalho é do sistema, então lá use a dock). `help` lista os comandos, e
`find <seção>` leva até a seção. O fundo do hero é o Dot Field do Vue Bits (canvas 2D), em roxo e
verde. Os componentes do Vue Bits (Faulty Terminal, TextType, Dot Field) foram adaptados no próprio
repositório, sem dependência nova: o Faulty Terminal roda num Web Worker com WebGL. Sem WebGL, com
"reduzir movimento" ou sem JavaScript, os fundos ficam estáticos.

Nos testes e2e, o projeto `webgl` do Playwright roda os arquivos que dependem de WebGL (porta de
acesso com o Faulty Terminal, `motion` e peso), com os testes de cada arquivo em série. Os demais
rodam no projeto `chromium` com WebGL desligado. O ipify é respondido dentro da página pelos testes
(`tests/e2e/support/test.ts`), sem pedido real.

## Versão

O campo `version` do `package.json` é a versão do portfólio. O build a injeta na sessão SSH da porta
de acesso (`Bem-vindo ao Portfolio v2.4`, só maior e menor). Cada feature sobe a versão menor: v1 é o
site original em HTML/CSS/JS, 2.0 a refatoração para Vue (001), 2.1 a 2.3 as features 002 a 004 e 2.4
a 005. Para subir: `npm version <x.y.z> --no-git-tag-version` (atualiza também o `package-lock.json`).

## Publicação

Cada push na `main` roda `.github/workflows/pages.yml`: instala, testa, faz o build e publica o
`dist/` no GitHub Pages (a fonte do Pages precisa estar configurada como "GitHub Actions").

## Documentação

Especificação, plano, decisões e cenários de validação de cada feature em `specs/`:
[`001-vue-resume-refactor/`](specs/001-vue-resume-refactor/) (a refatoração para Vue, com o roteiro
de validação completo em [`quickstart.md`](specs/001-vue-resume-refactor/quickstart.md)),
[`002-projects-animated-terminals/`](specs/002-projects-animated-terminals/),
[`003-devicons-skill-loops/`](specs/003-devicons-skill-loops/),
[`004-dock-windows-crt/`](specs/004-dock-windows-crt/) e
[`005-access-gate-dotfield/`](specs/005-access-gate-dotfield/).
