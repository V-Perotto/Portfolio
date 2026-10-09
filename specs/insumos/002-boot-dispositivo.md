# Insumo para `/speckit-specify`: boot dentro de um dispositivo (feature 002)

> Resumo para gerar a especificação da feature 002. O plano técnico completo, com geometria
> medida, linha do tempo, mudanças por arquivo e verificação, está em
> `plans/09 - Nono Plano.md`. Decisões tomadas com o autor em 2026-10-07.

## Descrição da feature (texto para colar no `/speckit-specify`)

A tela de boot SSH deixa de ocupar a viewport inteira e passa a aparecer **dentro da tela de um
dispositivo fotografado**. Em orientação paisagem, o dispositivo é um notebook. Em retrato, é um
celular. As fotos têm fundo de estúdio cinza, e a tela branca delas é trocada pelo fundo do boot
(Void Plum `#0a0612`), no próprio arquivo de imagem.

Quando o boot termina, o terminal some da tela do dispositivo e a página real já aparece por ela.
Em seguida, **a tela do dispositivo se expande até ocupar toda a viewport** enquanto **a foto do
dispositivo faz zoom e some aos poucos**, até restar só a página carregada. A animação de expansão
usa como base o componente **ScrollExpand** do Vue Bits (`Animations/ScrollExpand`), adaptado para
ser dirigido pelo tempo, logo depois do boot, em vez da rolagem.

## Requisitos já decididos

- **Teto de tempo inalterado.** Boot mais expansão somam no máximo 4,8 s (FR-031 do spec 001,
  Princípio IV). O boot é comprimido para no máximo 3,4 s, a passagem dura 180 ms e a expansão
  1,2 s. Qualquer tecla ou clique pula direto para a expansão, que então dura 600 ms.
- **Expansão automática,** nunca dependente de o visitante rolar a página (SC-003).
- **Orientação define o dispositivo:** `(orientation: portrait)` usa o celular e paisagem usa o
  notebook. Se a orientação mudar durante o boot, a cena se recalcula.
- **Notch do celular preservado** durante o boot.
- **Fotos mantidas como estão** (cinza e prateado), como exceção registrada no DESIGN.md, válida
  só na cena de boot.
- **Sem flash antes da hidratação:** a capa `html.booting::before` já mostra a foto do
  dispositivo.
- **Sem mudança para quem pede movimento reduzido ou está sem JavaScript:** não há boot nem
  dispositivo, e o conteúdo é o de hoje.
- **A dica "pressione qualquer tecla para pular" fica dentro da tela do dispositivo,** para manter
  contraste AA.
- **ScrollExpand vendorizado** com origem, licença e modificações locais no cabeçalho, como o
  `SpotlightCard`. Não entra dependência npm nova.
- **Peso:** uma imagem WebP por visita, entre 8 e 12 KB, pré-carregada conforme a orientação.

## Critérios de aceite (rascunho)

1. Em 1440×900, a primeira pintura mostra o notebook com a tela escura, e o terminal digita
   dentro dela.
2. Em 360×800, aparece o celular com o notch visível e o terminal legível em ~40 colunas.
3. Ao fim do boot, a página aparece pela tela, a tela cresce até a viewport e o dispositivo some.
   O hero final é idêntico ao atual.
4. O tempo total, do carregamento ao hero livre, é de no máximo 4,8 s. Com tecla ou clique, a
   expansão termina em até 0,8 s.
5. Com movimento reduzido ou sem JS, nenhum elemento da cena existe.
6. O axe não aponta violações, e o console fica sem erros.
