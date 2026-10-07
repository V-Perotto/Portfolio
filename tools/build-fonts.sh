#!/usr/bin/env bash
# Gera os .woff2 da Iosevka usados pelo site, com subset.
#
# Os arquivos oficiais do Fontsource têm ~1 MB por peso porque o subset "latin"
# deles não é realmente reduzido. Aqui cortamos para os caracteres que a página
# usa de fato (ver UNICODES abaixo), o que leva os 6 pesos de ~6,2 MB a ~100 KB.
#
# Uso: tools/build-fonts.sh    (a partir de qualquer diretório)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/public/fonts"
VERSION="5.3.0"

# ASCII + Latin-1/Ext-A (acentos PT/IT/EN, © ·) + pontuação tipográfica +
# setas + box drawing/blocos/formas geométricas (▊ □ ▤ ▼ ✕ ⬡ ⌁), a estética
# de terminal do tema. Emoji ficam de fora de propósito: a Iosevka não os tem
# e eles devem cair na fonte colorida do sistema.
UNICODES="U+0020-007E,U+00A0-00FF,U+0100-017F,U+2010-2015,U+2018-201D,U+2022,U+2026,U+2190-2193,U+2212,U+2248,U+2301,U+2500-257F,U+2580-259F,U+25A0-25FF,U+2715,U+2B21"

FEATURES="calt,clig,liga,rlig,ccmp,mark,mkmk,kern,locl"

# family:peso  ->  os pesos vêm da matriz em css/style.css (400 corpo, 600
# .hl-purple, 700 .section-title/.card-role, 800 .glitch)
TARGETS="iosevka:400 iosevka:600 iosevka:700 iosevka:800 iosevka-aile:400 iosevka-aile:700"

# O peso 800 só desenha o nome no <h1> do hero, que é o elemento de LCP. Com o subset
# completo ele pesa 32 KB; só com as letras do nome, ~3 KB, o que tirou o LCP móvel de
# 2,8 s para 2,4 s (SC-004, research R12). O nome vem de src/data/resume.ts; os caracteres
# usados ficam registrados em tools/iosevka-800.chars, que tests/unit/fonts.spec.ts compara
# com o nome atual: mudou o nome, rode este script de novo.
NAME="$(sed -n "s/^    name: '\(.*\)',\$/\1/p" "$ROOT/src/data/resume.ts" | head -1)"
if [ -z "$NAME" ]; then
  echo "não achei profile.name em src/data/resume.ts" >&2
  exit 1
fi
NAME_CHARS="$(printf '%s' "$NAME" | grep -o . | sort -u | tr -d '\n')"

# pyftsubset: usa o do PATH se existir, senão cria um venv descartável.
if command -v pyftsubset >/dev/null 2>&1; then
  PYFTSUBSET=pyftsubset
else
  VENV="$(mktemp -d)/venv"
  echo "pyftsubset não encontrado; criando venv temporário em $VENV"
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install --quiet --disable-pip-version-check "fonttools[woff]" brotli
  PYFTSUBSET="$VENV/bin/pyftsubset"
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"

for target in $TARGETS; do
  family="${target%%:*}"
  weight="${target##*:}"
  src="$TMP/$family-$weight.woff2"
  dst="$OUT/$family-$weight.woff2"

  url="https://cdn.jsdelivr.net/npm/@fontsource/$family@$VERSION/files/$family-latin-$weight-normal.woff2"
  echo "-> baixando $family $weight"
  curl -sfL --retry 3 -o "$src" "$url"

  # calt/liga preservam as ligaduras de código da Iosevka (=> != ->); kern é
  # essencial para a Aile (proporcional) e mark/mkmk posicionam os acentos.
  # Deliberadamente FORA: as features cv01-cv98 e ss01-ss20 de variantes de
  # glifo. Ninguém as ativa neste site, mas mantê-las arrasta os glifos
  # alternativos junto — 3626 glifos e 108 KB por peso, contra 971 e 32 KB.
  # Para desligar as ligaduras, use font-variant-ligatures no CSS em vez de
  # regerar sem a feature.
  if [ "$family:$weight" = "iosevka:800" ]; then
    subset=(--text="$NAME_CHARS")
    printf '%s\n' "$NAME_CHARS" > "$ROOT/tools/iosevka-800.chars"
  else
    subset=(--unicodes="$UNICODES")
  fi

  "$PYFTSUBSET" "$src" \
    --output-file="$dst" \
    --flavor=woff2 \
    --layout-features="$FEATURES" \
    "${subset[@]}"

  printf '   %-24s %8s -> %s\n' "$(basename "$dst")" \
    "$(du -h "$src" | cut -f1)" "$(du -h "$dst" | cut -f1)"
done

echo
echo "total em $OUT: $(du -sh "$OUT" | cut -f1)"
