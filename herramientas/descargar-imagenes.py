#!/usr/bin/env python3
"""
Descarga a tu computadora las imágenes que Stitch dejó alojadas en sus
servidores (lh3.googleusercontent.com) y reescribe las rutas del sitio
para que apunten a archivos locales.

POR QUÉ ES NECESARIO
--------------------
Las imágenes que ves ahora NO están en tu proyecto: son enlaces temporales
a los servidores de Google. Si Google las borra, tu sitio se queda sin fotos.
Este script las baja y las guarda dentro de tu repositorio.

CÓMO USARLO
-----------
1. Abre una terminal dentro de la carpeta del proyecto.
2. Ejecuta:   python3 herramientas/descargar-imagenes.py
3. Revisa el sitio. Si todo se ve igual, haz commit y push.

Requiere Python 3. No necesita instalar nada más.
"""

import json
import os
import re
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DESTINO = RAIZ / "img" / "seccion"
DESTINO_PORTAFOLIO = RAIZ / "img" / "portafolio"
PATRON = re.compile(r"https://lh3\.googleusercontent\.com/aida-public/[A-Za-z0-9_\-]+")


def bajar(url: str, carpeta: Path, nombre: str) -> str | None:
    carpeta.mkdir(parents=True, exist_ok=True)
    destino = carpeta / nombre
    if destino.exists():
        print(f"  ya existe   {nombre}")
        return destino.name
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            destino.write_bytes(r.read())
        kb = destino.stat().st_size // 1024
        print(f"  descargada  {nombre}  ({kb} KB)")
        return destino.name
    except Exception as e:
        print(f"  ERROR       {nombre}: {e}")
        return None


def main() -> None:
    print("\n== 1. Imágenes del portafolio (data/proyectos.json) ==")
    ruta_json = RAIZ / "data" / "proyectos.json"
    proyectos = json.loads(ruta_json.read_text(encoding="utf-8"))
    cambios = 0
    for p in proyectos:
        url = p.get("imagen", "")
        if not url.startswith("http"):
            continue
        nombre = re.sub(r"[^a-z0-9]+", "-", p.get("id", "proyecto").lower()) + ".jpg"
        if bajar(url, DESTINO_PORTAFOLIO, nombre):
            p["imagen"] = f"/img/portafolio/{nombre}"
            cambios += 1
    if cambios:
        ruta_json.write_text(
            json.dumps(proyectos, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(f"  -> proyectos.json actualizado ({cambios} rutas)")

    print("\n== 2. Imágenes de las páginas (.html) ==")
    paginas = sorted(RAIZ.glob("*.html"))
    # mapa global url -> nombre de archivo, para no bajar dos veces la misma
    mapa: dict[str, str] = {}
    for pagina in paginas:
        html = pagina.read_text(encoding="utf-8")
        urls = list(dict.fromkeys(PATRON.findall(html)))
        if not urls:
            continue
        print(f"\n  [{pagina.name}]")
        for url in urls:
            if url not in mapa:
                nombre = f"fondo-{len(mapa) + 1:02d}.jpg"
                if bajar(url, DESTINO, nombre):
                    mapa[url] = nombre
                else:
                    continue
            html = html.replace(url, f"img/seccion/{mapa[url]}")
        pagina.write_text(html, encoding="utf-8")
        print(f"  -> {pagina.name} actualizado")
    if not mapa:
        print("  no quedan imágenes remotas")

    print("\nListo. Abre el sitio y verifica que todo se vea igual.")
    print("Después:  git add . && git commit -m 'Imágenes locales' && git push\n")


if __name__ == "__main__":
    main()
