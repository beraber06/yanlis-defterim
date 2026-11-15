# Builds the app icon (design A "Döngü") as SVG sources + PNG files.
import pathlib, re
from playwright.sync_api import sync_playwright
SP = pathlib.Path(__file__).resolve().parent.parent
B, APP = SP / "src", SP / "docs"
src = (B / "icon-A.svg").read_text()

def with_ids(svg, suf):
    for i in ("bg", "hl", "ck", "sh"):
        svg = svg.replace(f'id="{i}"', f'id="yd{suf}-{i}"').replace(f"url(#{i})", f"url(#yd{suf}-{i})")
    return svg

def rounded(svg, suf, rx=116):
    # clip the full-bleed tile to a rounded square
    svg = svg.replace("<defs>", f'<defs><clipPath id="yd{suf}-clip"><rect width="512" height="512" rx="{rx}"/></clipPath>', 1)
    head, body = svg.split("</defs>", 1)
    body = body.replace("</svg>", "")
    return f'{head}</defs><g clip-path="url(#yd{suf}-clip)">{body}</g></svg>'

inline = lambda s: s.replace('xmlns="http://www.w3.org/2000/svg" ', '').replace("<svg ", '<svg aria-hidden="true" focusable="false" ', 1)
(B / "icon.svg").write_text(src)
(B / "logo_mark.svg").write_text(inline(rounded(with_ids(src, "m"), "m")))
(B / "logo_tile.svg").write_text(inline(with_ids(src, "t")))

full, round_ = src, rounded(src, "r")
jobs = [("icon-v2-192.png", round_, 192), ("icon-v2-512.png", round_, 512),
        ("icon-v2-maskable-512.png", full, 512), ("apple-touch-icon-v2.png", full, 180)]
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    for name, svg, n in jobs:
        pg.set_viewport_size({"width": n, "height": n})
        pg.set_content(f'<html><body style="margin:0;background:transparent">{svg.replace("<svg ", f"<svg width=\"{n}\" height=\"{n}\" ", 1)}</body></html>')
        pg.screenshot(path=str(APP / name), omit_background=True, clip={"x": 0, "y": 0, "width": n, "height": n})
    b.close()
print("icons ok")
