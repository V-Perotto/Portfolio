#!/usr/bin/env python3
"""Recomprime as imagens decorativas das seções para caber no orçamento de peso (research R12).

As imagens aparecem com tint, máscara radial e opacidade de 7–12%, então a perda de qualidade
não é perceptível. Reduz qualidade e, se preciso, largura, até cada arquivo ter ≤ 60 KB.

Uso: python3 tools/reencode-images.py    (a partir de qualquer diretório; requer Pillow)
"""
import io
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMAGES = sorted((ROOT / "src/assets/img").glob("image*-bg.webp"))
LIMIT = 60 * 1024
MAX_WIDTH = 1600


def encode(img: Image.Image, quality: int) -> bytes:
    buf = io.BytesIO()
    img.save(buf, "WEBP", quality=quality, method=6)
    return buf.getvalue()


for path in IMAGES:
    before = path.stat().st_size
    img = Image.open(path)
    img.load()
    if img.width > MAX_WIDTH:
        img = img.resize((MAX_WIDTH, round(img.height * MAX_WIDTH / img.width)), Image.LANCZOS)

    data = b""
    while True:
        for quality in range(80, 29, -5):
            data = encode(img, quality)
            if len(data) <= LIMIT:
                break
        if len(data) <= LIMIT or img.width <= 640:
            break
        img = img.resize((int(img.width * 0.85), int(img.height * 0.85)), Image.LANCZOS)

    if len(data) < before:
        path.write_bytes(data)
    print(f"{path.name}: {before // 1024} KB -> {path.stat().st_size // 1024} KB ({img.width}x{img.height}, q={quality})")
