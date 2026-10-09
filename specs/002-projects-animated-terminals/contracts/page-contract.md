# Page Contract: HTML publicado — revisão da feature 002

**Feature**: `002-projects-animated-terminals`

Complementa `specs/001-vue-resume-refactor/contracts/page-contract.md`; tudo o que não está aqui
continua valendo como lá. Os testes e2e do quickstart verificam cada item.

## Âncoras

Nenhuma âncora nova. Challenges e projeto comunitário ficam dentro de `#projetos` e não entram no
menu.

## Estrutura da seção `#projetos` (FR-001, FR-003)

```text
<section id="projetos">
  <h2>projetos</h2>
  <ul class="projects-grid">              uma coluna em todas as larguras
    <li> cartão de projeto (h3) </li>     ordem: SRG, Temas VS Code, ItaliaMi, OCR, QClass, Monitor
  </ul>
  <div class="project-subpart">           só se houver challenges
    <h3>challenges</h3>
    <ol> <li> challenge (h4) </li> </ol>  data de criação desc (lista ordenada: a ordem tem sentido)
  </div>
  <div class="project-subpart">           só se houver projeto comunitário
    <h3>comunitario</h3>
    <ul> <li> projeto comunitário (h4) </li> </ul>
  </div>
</section>
```

Os enfeites `##`, `/` e `$` dos títulos e linhas de comando das sub-partes ficam `aria-hidden`, como
nos títulos de seção (FR-036 da 001).

## Links privados (FR-005, FR-006)

- Cada `<a>` de repositório privado contém, visível, o ícone de cadeado (`aria-hidden`) e o texto
  `privado`; o nome acessível termina em "repositório privado, pode não abrir (abre em nova aba)".
- Cartão com ao menos um link privado tem a linha `# repositório privado: pode abrir uma página de
  "não encontrado" para quem não tem acesso.` (ou `# repositórios privados: podem abrir…`, com mais
  de um link privado).
- Links públicos não mudam.

## Selo de andamento (FR-013)

- `<span class="tag-now">EM DESENVOLVIMENTO</span>` junto ao nome do projeto, com o mesmo visual do
  selo `HEAD` da experiência. Texto real (não pseudo-elemento), então leitores de tela o anunciam.
- Só projetos com `inProgress: true`.

## Formação com observação e fontes (FR-021, FR-022)

- Observação em `<p>` logo abaixo da instituição.
- Fontes em `<ul aria-label="Fontes">`, cada uma um `ExternalLink` com o domínio como texto.

## Terminais animados (FR-025 a FR-033)

Atributos aplicados pelo JS **depois de montar**, nunca no HTML pré-renderizado:

| Atributo | Em | Efeito sob `html.motion` (fora de `@media print`) |
|----------|----|---------------------------------------------------|
| `data-t-anim` | `.terminal-window` | a janela está sob controle da animação |
| `data-t-cmd` | linha de comando (`TerminalLine`) | presente no HTML; marca o início de um passo |
| `data-t-state="pending"` | comando | texto real `color: transparent`; sobreposição vazia |
| `data-t-state="typing"` | comando | texto real transparente; sobreposição digitando |
| `data-t-state="pending"` | saída | `opacity: 0` |
| `data-t-state="done"` | comando ou saída | aparência normal |

- A sobreposição de digitação (`.t-typed`) é `aria-hidden="true"` e `position: absolute`; o texto
  real nunca sai do fluxo nem da árvore de acessibilidade.
- Sem JS, com movimento reduzido ou impresso: nenhum desses estados esconde nada.
- `pointerdown` ou `focusin` dentro da janela leva tudo a `done` na hora.

## Ícones das skills (FR-034 a FR-036)

- `<svg class="lucide lucide-…" aria-hidden="true" stroke="currentColor">` inline no HTML
  pré-renderizado, dentro do `h3` do grupo. Nenhuma requisição externa.
