"""Section-matched free printables for the email signup (12 Oct 2026).

  python3 scripts/lead-pdfs.py   # writes 3 PDFs to public/downloads/

  best-buys-top-picks.pdf        the #1 pick from every buying guide (Best buys)
  holiday-board-countdown.pdf    countdown plans + shopping lists (holiday pages)
  pairing-cheat-sheet.pdf        what to pour with what (pairing pages)

Data comes from the site's own files, so the PDFs match the pages.
"""
import importlib.util, json, os, re
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("pp", os.path.join(ROOT, "scripts", "party-pdfs.py"))
pp = importlib.util.module_from_spec(spec); spec.loader.exec_module(pp)
GREEN, DEEP, CREAM, GOLD, GOLDD, INK, MUTED, W, H, M = pp.GREEN, pp.DEEP, pp.CREAM, pp.GOLD, pp.GOLDD, pp.INK, pp.MUTED, pp.W, pp.H, pp.M
OUT = os.path.join(ROOT, "public", "downloads")
ING_DIRS = [os.path.join(ROOT, "content", "ingredients"), os.path.join(os.path.dirname(ROOT), "content", "ingredients")]


def titles():
    t = {}
    for d in ING_DIRS:
        if not os.path.isdir(d):
            continue
        for f in os.listdir(d):
            if f.endswith(".md"):
                m = re.search(r'^title:\s*"?(.*?)"?\s*$', open(os.path.join(d, f), encoding="utf-8").read(), re.M)
                if m:
                    t[f[:-3]] = m.group(1)
    return t


def head(c, title, sub, page, total, kicker, url):
    pp.header(c, title, sub, page, total, kicker=kicker)
    c.setFillColor(HexColor("#fffcf4")); c.rect(0, 14, W, 20, stroke=0, fill=1)
    c.setFillColor(MUTED); c.setFont("Pop", 7.5); c.drawString(M, 24, url)
    c.drawRightString(W - M, 24, f"Page {page} of {total}")


def fit(c, text, font, size, width):
    c.setFont(font, size)
    while c.stringWidth(text, font, size) > width and len(text) > 4:
        text = text[:-2].rstrip() + "…" if not text.endswith("…") else text[:-2].rstrip() + "…"
    return text


# ------------------------------------------------------------ top picks
def top_picks():
    md = open(os.path.join(ROOT, "content", "blog", "best-charcuterie-brands.md"), encoding="utf-8").read()
    sections, cur = [], None
    for line in md.split("\n"):
        h = re.match(r"^##\s+(.+)", line)
        if h:
            name = h.group(1).strip()
            cur = None if re.search(r"value|rank|work", name, re.I) else (name, [])
            if cur:
                sections.append(cur)
            continue
        r = cur and re.match(r"^\|\s*\[([^\]]+)\]\(/blog/[^)]+\)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|", line)
        if r:
            name = re.sub(r"^(The )?Best ", "", r.group(1))
            name = re.sub(r" (for a|at the|by|for) .*$", "", name, flags=re.I).replace("Store-Bought ", "")
            name = re.sub(r" Brands$", "", name)
            cur[1].append((name, r.group(2).replace(" (best cheese)", ""), r.group(3).split()[-1]))
    path = os.path.join(OUT, "best-buys-top-picks.pdf")
    c = canvas.Canvas(path, pagesize=letter)
    c.setTitle("Charcuterie Lab Top Picks"); c.setAuthor("Charcuterie Lab")
    rows = [("H", s) for s, _ in sections for _ in [0]]
    flat = []
    for s, items in sections:
        flat.append(("H", s))
        flat += [("R", it) for it in items]
    pages, page, y0 = [], [], H - 128
    y = y0
    for kind, v in flat:
        need = 30 if kind == "H" else 17
        if y - need < 60:
            pages.append(page); page = []; y = y0
        page.append((kind, v)); y -= need
    pages.append(page)
    total = len(pages)
    for i, pg in enumerate(pages, 1):
        head(c, "Top Picks: the best brand of everything", "Our #1 pick from every Charcuterie Lab buying guide. Take it to the store.", i, total, "FREE PRINTABLE", "charcuterielab.com/blog/best-charcuterie-brands  ·  Researched picks, scored out of 5. Prices and stock change.")
        y = y0
        for kind, v in pg:
            if kind == "H":
                y -= 6
                y = pp.section(c, y, v)
                continue
            name, pick, score = v
            pp.box(c, M, y - 1)
            c.setFillColor(INK); c.drawString(M + 16, y, fit(c, name, "PopB", 9.5, 150))
            c.setFillColor(GREEN); c.drawString(M + 172, y, fit(c, pick, "Pop", 9.5, 300))
            c.setFillColor(GOLDD); c.setFont("PopB", 9); c.drawRightString(W - M, y, score)
            c.setStrokeColor(HexColor("#e5dccb")); c.setLineWidth(0.4); c.line(M, y - 6, W - M, y - 6)
            y -= 17
        c.showPage()
    c.save()
    return path


# ------------------------------------------------------ holiday countdown
def holiday_countdown():
    T = titles()
    path = os.path.join(OUT, "holiday-board-countdown.pdf")
    c = canvas.Canvas(path, pagesize=letter)
    c.setTitle("Holiday Board Countdown Plans"); c.setAuthor("Charcuterie Lab")
    slugs = ["thanksgiving", "hanukkah", "christmas", "new-years-eve"]
    hols = [json.load(open(os.path.join(ROOT, "content", "holidays", f"{s}.json"), encoding="utf-8")) for s in slugs]
    hols = [h for h in hols if h.get("plan")]
    for i, h in enumerate(hols, 1):
        n = (h.get("builder") or {}).get("guests") or 12
        head(c, f"{h['name']} board countdown", f"A plan for {n} guests: when to shop, prep and build, and what to buy.", i, len(hols), "FREE PRINTABLE", f"charcuterielab.com/holidays/{h['slug']}  ·  Perishable food: no more than 2 hours out (1 hour above 90°F), per USDA guidance.")
        y = H - 128
        y = pp.section(c, y, "Countdown")
        for step in h["plan"]:
            pp.box(c, M, y - 1)
            c.setFillColor(GREEN); c.setFont("PopB", 9.5); c.drawString(M + 16, y, step["when"])
            c.setFillColor(INK); c.setFont("Pop", 9.5)
            y = pp.wrap(c, step["what"], M + 150, y, W - 2 * M - 150, 13) - 6
        y -= 8
        y = pp.section(c, y, f"How much to buy for {n} (the board is the party food)")
        p = pp.DATA["counts"].get(str(n), pp.DATA["counts"]["12"])["plans"]["main"]
        for label, key in pp.ROWS:
            c.setFillColor(INK); c.setFont("PopB", 9.5); c.drawString(M + 16, y, label)
            c.setFont("Pop", 9.5); c.drawString(M + 200, y, pp.val(p, key))
            pp.box(c, M, y - 1)
            y -= 17
        y -= 10
        items = [T.get(s, s.replace("-", " ").title()) for s in (h.get("builder") or {}).get("items", [])]
        if items:
            y = pp.section(c, y, "Shopping list for this board")
            colw = (W - 2 * M) / 2
            for k, it in enumerate(items):
                x = M + (k % 2) * colw
                yy = y - (k // 2) * 17
                pp.box(c, x, yy - 1)
                c.setFillColor(INK); c.setFont("Pop", 9.5); c.drawString(x + 16, yy, fit(c, it, "Pop", 9.5, colw - 30))
            y -= ((len(items) + 1) // 2) * 17 + 10
        if y > 120:
            c.setFillColor(HexColor("#fbeedb")); c.roundRect(M, y - 52, W - 2 * M, 56, 10, stroke=0, fill=1)
            c.setFillColor(DEEP); c.setFont("Serif", 12); c.drawString(M + 14, y - 14, "Need ideas and shapes?")
            c.setFillColor(INK); c.setFont("Pop", 9)
            pp.wrap(c, f"Board ideas, shapes and what to pour for {h['name']} are free at charcuterielab.com/holidays/{h['slug']}.", M + 14, y - 32, W - 2 * M - 28, 12)
        c.showPage()
    c.save()
    return path


# ------------------------------------------------------- pairing sheet
def pairing_sheet():
    T = titles()
    d = json.load(open(os.path.join(ROOT, "content", "pairings", "drinks.json"), encoding="utf-8"))
    drinks = (d.get("wines") or []) + (d.get("beers") or [])
    path = os.path.join(OUT, "pairing-cheat-sheet.pdf")
    c = canvas.Canvas(path, pagesize=letter)
    c.setTitle("The Pairing Cheat Sheet"); c.setAuthor("Charcuterie Lab")
    per = 9
    chunks = [drinks[i:i + per] for i in range(0, len(drinks), per)]
    for pi, chunk in enumerate(chunks, 1):
        head(c, "The Pairing Cheat Sheet", "What to put out with the wine or beer you're pouring. Best matches first.", pi, len(chunks), "FREE PRINTABLE", "charcuterielab.com/pairings  ·  The reasons behind every match are on the Pairings Hub.")
        y = H - 124
        for dr in chunk:
            names = [T.get(m["s"], m["s"].replace("-", " ").title()) for m in dr.get("matches", [])[:5]]
            c.setFillColor(CREAM); c.rect(M - 6, y - 52, W - 2 * M + 12, 60, stroke=0, fill=1)
            c.setFillColor(HexColor(dr.get("color") or "#113a27")); c.rect(M - 6, y - 52, 5, 60, stroke=0, fill=1)
            c.setFillColor(DEEP); c.setFont("Serif", 12.5); c.drawString(M + 6, y - 8, dr["name"])
            if dr.get("serve"):
                c.setFillColor(MUTED); c.setFont("Pop", 8); c.drawRightString(W - M, y - 8, f"Serve {dr['serve']}")
            c.setFillColor(GREEN); c.setFont("PopB", 9.5)
            c.drawString(M + 6, y - 26, fit(c, "  ·  ".join(names), "PopB", 9.5, W - 2 * M - 12))
            why = (dr.get("matches") or [{}])[0].get("why", "")
            c.setFillColor(INK); c.setFont("Pop", 8.5)
            c.drawString(M + 6, y - 42, fit(c, f"Why the first one works: {why}", "Pop", 8.5, W - 2 * M - 12))
            y -= 70
        c.showPage()
    c.save()
    return path


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for f in (top_picks, holiday_countdown, pairing_sheet):
        print(f())
