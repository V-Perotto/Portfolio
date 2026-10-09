# Page Contract: HTML publicado — revisão da feature 003

**Feature**: `003-devicons-skill-loops`

Complementa os contratos da 001 e da 002 (`specs/00{1,2}-*/contracts/page-contract.md`); o que não
está aqui continua valendo como lá. Os testes do [quickstart](../quickstart.md) verificam cada item.

## Fundo das seções (FR-001)

- Nenhum `.section-decor` nem `<img>` decorativo nas seções; nenhum `image{1,2,3}-bg*.webp` em
  `dist/`.

## Janelas de terminal (FR-003, FR-004, FR-011)

- `.terminal-title` = `sobre.txt`, o `name` de cada projeto e `contato.sh`; nenhum contém `bash`.
- Nenhum texto `./run` na página.
- Linha de comando (`[data-t-cmd]`): cor computada do texto = `--text-dim`; `.prompt-dollar` =
  `--purple-glow`; filhos com classe de destaque (ex.: `.hl-green`) mantêm a cor deles. A cópia que
  digita (`.t-typed`) tem a mesma cor da linha.

## Links de conteúdo (FR-006 a FR-010)

- Todo `<a target="_blank">` da página (os de conteúdo; todos passam pelo `ExternalLink`) tem
  `rel="noopener noreferrer"` e sublinhado tracejado de 1px na cor do link em repouso:
  - nos links de texto, `border-bottom` do próprio `<a>`;
  - nos links de projeto, `border-bottom` do `.evidence-url` (caminho, ou domínio quando o badge falha)
    ou da `img` do badge (a caixa reservada do badge passa a 29px fixos, com o sublinhado dentro);
    nunca dois sublinhados no mesmo link.
- Hover e `:focus-visible` acrescentam brilho (`text-shadow` no texto; `drop-shadow` no badge), sem
  mudar o sublinhado nem a posição (sem `transform`).
- Rótulo de link de projeto (`.t-theme-name` sem neon) na cor `--purple-glow`; os rótulos `.neon`
  (Grape Glass, Shadow Lord) mantêm cor e brilho próprios.
- Menu, logotipo, botões do hero, "▼ scroll" e link de pular para o conteúdo não mudam.

## Ícones de tecnologia (FR-012 a FR-018)

Cada chip e cada item de loop:

```html
<svg class="tech-icon" aria-hidden="true" focusable="false"><use href="/Portfolio/assets/sprite-[hash].svg#devicon-python"></use></svg>
```

- O `href` aponta para um arquivo do próprio site (mesmo domínio), nunca para devicon.dev,
  vectorlogo.zone, jsDelivr ou outro terceiro.
- Todo `#id` usado existe como `<symbol id>` no sprite publicado.
- Os símbolos não têm cor fixa: pintam com `currentColor`, então o ícone tem a cor do texto do chip,
  inclusive no hover e no alto contraste.
- O ícone vem antes do nome; o nome acessível do chip é só o nome da tecnologia.
- Altura do ícone = `1em` do texto do chip; a altura do chip não muda.

## Seção `#skills` (FR-019 a FR-030)

```text
<section id="skills">
  <h2>skills</h2>
  <p class="section-lead">$ ls -la /usr/lib/vittorio/</p>
  <div class="section-subpart">                    × 5, na ordem dos grupos
    <h3> <svg class="lucide …" aria-hidden> linguagens_frameworks / </h3>
    <div class="skill-loop" [data-loop-ready] [data-loop-visible]>
      <div class="loop-track">
        <ul role="list">                            a lista acessível: todas as skills, uma vez
          <li class="loop-item"> <svg.tech-icon/> <span>Python (Flask)</span> <span aria-hidden>✦</span> </li>
          …
        </ul>
        <ul aria-hidden="true" data-loop-copy> … </ul>   cópias, só depois de montar e com movimento
      </div>
    </div>
  </div>
</section>
```

- Nenhuma faixa (`.tech-marquee`) nem grade de cartões (`.skills-grid`).
- HTML pré-renderizado: só a primeira `<ul>`, com as 28 skills distribuídas pelos 5 grupos.
- `html:not(.motion)` (sem JS, "reduzir movimento") e impressão: a lista quebra em linhas dentro da
  fita, todas as skills visíveis; cópias com `display: none`.
- `html.motion`: uma linha, altura fixa, `overflow: hidden` desde o primeiro paint; a trilha anima
  `translateX` só com `[data-loop-ready]` e `[data-loop-visible]`, e pausa em `:hover`.
- Cada item: ícone + nome com no mínimo 0.75rem e contraste ≥ 4,5:1 sobre a fita.

## Requisições

- 0 requisições a devicon.dev, vectorlogo.zone, jsDelivr ou qualquer terceiro por causa dos ícones;
  1 requisição ao sprite (mesmo domínio).
- 0 requisições a `image{1,2,3}-bg*.webp`.
