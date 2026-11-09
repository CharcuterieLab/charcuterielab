"""Nov 8 2026 guides: when a hero photo public/images/<slug>.jpg exists, point the post at it.
Until then each post keeps a stand-in photo. Safe to run any number of times."""
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parent.parent
for slug in ["best-port-wine-cheese", "best-beer-cheese", "best-spiral-ham", "best-smoked-oysters", "best-puff-pastry", "best-crab-dip", "best-cocktail-sauce", "best-peppermint-bark", "best-toffee", "best-fruitcake", "best-cheese-straws", "best-bacon-jam"]:
    if (ROOT / "public" / "images" / f"{slug}.jpg").exists():
        p = ROOT / "content" / "blog" / f"{slug}.md"
        s = p.read_text(encoding="utf-8")
        n = re.sub(r'^image: ".*"$', f'image: "/images/{slug}.jpg"', s, count=1, flags=re.M)
        if n != s:
            p.write_text(n, encoding="utf-8"); print("hero photo now used:", slug)
