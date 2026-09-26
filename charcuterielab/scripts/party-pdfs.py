"""Printable PDFs for the Party Planner.

  python3 scripts/party-pdfs.py            # 12 free shopping lists (public/downloads/party-planner/)
  python3 scripts/party-pdfs.py planner    # the paid Grazing Table Planner (out/ folder, not published)

Numbers come from scripts/party-export.mjs, i.e. the same plan() the web pages
use, so the PDFs and the site can never disagree.
"""
import json, os, subprocess, sys
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GF = "/usr/share/fonts/truetype/google-fonts/"
pdfmetrics.registerFont(TTFont("Pop", GF + "Poppins-Regular.ttf"))
pdfmetrics.registerFont(TTFont("PopB", GF + "Poppins-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Serif", "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"))

GREEN, DEEP, CREAM, GOLD, GOLDD, INK, MUTED = (HexColor(x) for x in ["#113a27", "#0a261a", "#f7f2e7", "#caa652", "#8f6d2e", "#17130e", "#5e5547"])
W, H = letter
M = 42

DATA = json.loads(subprocess.check_output(["node", os.path.join(ROOT, "scripts", "party-export.mjs")]))
MODES = DATA["modes"]
BOOK = {1: "The Classic American Starter Board", 6: "The Holiday Entertaining Board", 13: "The $25 Budget Board", 21: "The Valentine's Day Board", 30: "The Office Party Board", 49: "The Showstopper Grand Board"}


def header(c, title, sub, page, total, kicker="PARTY PLANNER"):
    c.setFillColor(DEEP); c.rect(0, H - 96, W, 96, stroke=0, fill=1)
    c.setFillColor(GOLD); c.setFont("Serif", 15); c.drawString(M, H - 34, "Charcuterie Lab")
    c.setFont("PopB", 8); c.drawRightString(W - M, H - 34, kicker)
    c.setFillColor(HexColor("#fff9eb")); c.setFont("Serif", 21); c.drawString(M, H - 64, title)
    c.setFont("Pop", 9.5); c.setFillColor(HexColor("#e8dcb8")); c.drawString(M, H - 82, sub)
    c.setFillColor(MUTED); c.setFont("Pop", 7.5)
    c.drawString(M, 24, "charcuterielab.com/party-planner  ·  Perishable food: no more than 2 hours out (1 hour above 90°F), per USDA guidance.")
    c.drawRightString(W - M, 24, f"Page {page} of {total}")


def box(c, x, y, s=9):
    c.setStrokeColor(GREEN); c.setLineWidth(0.9); c.rect(x, y, s, s, stroke=1, fill=0)


def section(c, y, text):
    c.setFillColor(GOLDD); c.setFont("PopB", 8.5); c.drawString(M, y, text.upper())
    c.setStrokeColor(GOLD); c.setLineWidth(1.2); c.line(M, y - 5, M + 40, y - 5)
    return y - 20


ROWS = [("Cured meat", "meat"), ("Cheese", "cheese"), ("Crackers and bread", "crackers"), ("Fresh and dried fruit", "fruit"), ("Nuts", "nuts"), ("Olives and pickles", "briny"), ("Spreads and honey", "spreads")]


def val(p, key):
    if key == "crackers":
        return f"{p['crackers'][0]}–{p['crackers'][1]}"
    if key == "spreads":
        return f"{p['spreads']} kinds"
    return p[key]


def amounts_table(c, y, plans, cols=("app", "main", "meal")):
    xs = [M, M + 190, M + 300, M + 410]
    c.setFillColor(CREAM); c.rect(M - 6, y - 6, W - 2 * M + 12, 20, stroke=0, fill=1)
    c.setFillColor(GREEN); c.setFont("PopB", 8.5)
    c.drawString(xs[0] + 16, y, "BUY")
    for x, m in zip(xs[1:], cols):
        c.drawString(x, y, MODES[m]["label"].upper())
    y -= 24
    for label, key in ROWS:
        box(c, xs[0], y - 1)
        c.setFillColor(INK); c.setFont("PopB", 10); c.drawString(xs[0] + 16, y, label)
        c.setFont("Pop", 10)
        for x, m in zip(xs[1:], cols):
            c.drawString(x, y, val(plans[m], key))
        c.setStrokeColor(HexColor("#e5dccb")); c.setLineWidth(0.5); c.line(M - 6, y - 8, W - M + 6, y - 8)
        y -= 23
    c.setFillColor(MUTED); c.setFont("Pop", 8)
    c.drawString(M, y + 2, f"Per guest: {MODES['app']['meat']} oz each of meat and cheese before a meal, {MODES['main']['meat']} oz as the party food, {MODES['meal']['meat']} oz as the meal. +10% from 20 guests.")
    return y - 18


def picks(c, y, p):
    y = section(c, y, "Your picks")
    colw = (W - 2 * M) / 2
    nc = int(str(p["cheeses"])[-1]); nm = int(str(p["meats"])[-1])
    groups = [(f"Cheeses ({p['cheeses']})", nc), (f"Meats ({p['meats']})", nm), ("Crackers and bread", 2), ("Fruit", 3), ("Nuts, olives and pickles", 3), (f"Spreads ({p['spreads']})", p["spreads"])]
    tops = [y, y]
    for name, lines in groups:
        col = 0 if tops[0] >= tops[1] else 1
        x = M + col * colw
        yy = tops[col]
        c.setFillColor(GREEN); c.setFont("PopB", 9.5); c.drawString(x, yy, name)
        yy -= 16
        for _ in range(lines):
            box(c, x, yy - 1, 8)
            c.setStrokeColor(HexColor("#cfc4ae")); c.setLineWidth(0.5); c.line(x + 14, yy - 1, x + colw - 20, yy - 1)
            yy -= 16
        tops[col] = yy - 10
    return min(tops)


def shopping_list(n):
    d = DATA["counts"][str(n)]
    plans = d["plans"]
    dm = "main" if n >= 20 else "app"
    p = plans[dm]
    path = os.path.join(ROOT, "public", "downloads", "party-planner", f"charcuterie-shopping-list-{n}-people.pdf")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    c = canvas.Canvas(path, pagesize=letter)
    c.setTitle(f"Charcuterie shopping list for {n} people | Charcuterie Lab")
    c.setAuthor("Charcuterie Lab")
    # page 1
    header(c, f"Charcuterie shopping list for {n} people", "Tick it off at the store. Amounts for all three ways of serving.", 1, 2)
    y = H - 130
    y = section(c, y, "How much to buy")
    y = amounts_table(c, y, plans)
    y -= 6
    y = picks(c, y, p)
    c.showPage()
    # page 2
    header(c, f"Party plan for {n} people", p["setup"] + ".", 2, 2)
    y = H - 130
    y = section(c, y, "Timeline")
    for when, what in d["timeline"]:
        box(c, M, y - 1)
        c.setFillColor(GREEN); c.setFont("PopB", 10); c.drawString(M + 16, y, when)
        c.setFillColor(INK); c.setFont("Pop", 9.5)
        y = wrap(c, what, M + 150, y, W - M - (M + 150), 13) - 10
    y -= 6
    y = section(c, y, "Setup")
    c.setFillColor(INK); c.setFont("Pop", 10)
    tip = "Split the food into identical stations so guests don't queue at one end." if n >= 20 else "Keep bowls for olives, jams and honey on the board so nothing rolls into the crackers."
    y = wrap(c, f"{p['setup']}. {tip}", M, y, W - 2 * M, 14) - 14
    y = section(c, y, "Rough cost (food only)")
    c.setFont("PopB", 9); c.setFillColor(GREEN)
    cols = [M, M + 120, M + 240, M + 360]
    c.drawString(cols[0], y, "LEVEL")
    for x, m in zip(cols[1:], ["app", "main", "meal"]):
        c.drawString(x, y, MODES[m]["label"].upper())
    y -= 18
    for r, name in enumerate(["Budget", "Standard", "Splurge"]):
        c.setFont("PopB", 10); c.setFillColor(INK); c.drawString(cols[0], y, name)
        c.setFont("Pop", 10)
        for x, m in zip(cols[1:], ["app", "main", "meal"]):
            b = plans[m]["budget"][r]
            c.drawString(x, y, f"${b[1]}–${b[2]}")
        y -= 17
    c.setFillColor(MUTED); c.setFont("Pop", 8); c.drawString(M, y, "Estimates scaled from the boards in our book. Store, region and season change the total.")
    y -= 34
    # book box
    bn = d["board"]
    c.setFillColor(HexColor("#fbeedb")); c.roundRect(M, y - 78, W - 2 * M, 88, 10, stroke=0, fill=1)
    c.setFillColor(GOLDD); c.setFont("PopB", 8.5); c.drawString(M + 16, y - 8, f"THE FULL PLAN: BOARD #{bn:02d} IN THE BOOK")
    c.setFillColor(DEEP); c.setFont("Serif", 13); c.drawString(M + 16, y - 28, BOOK.get(bn, "50 Boards Built by Science"))
    c.setFillColor(INK); c.setFont("Pop", 9.5)
    wrap(c, "Exact shopping list with amounts and prices, a timed build, where every item goes and why, and a swap for every ingredient. 50 boards for $14 (ebook) at charcuterielab.com/ebook", M + 16, y - 46, W - 2 * M - 32, 13)
    c.showPage()
    c.save()
    return path


def wrap(c, text, x, y, width, lead):
    words = text.split()
    line = ""
    for w in words:
        t = (line + " " + w).strip()
        if c.stringWidth(t, c._fontname, c._fontsize) > width and line:
            c.drawString(x, y, line); y -= lead; line = w
        else:
            line = t
    if line:
        c.drawString(x, y, line); y -= lead
    return y


# ------------------------------------------------------ Grazing Table Planner

def planner():
    out = os.path.join(ROOT, "..", "..", "printables-src")
    os.makedirs(out, exist_ok=True)
    path = os.path.abspath(os.path.join(out, "grazing-table-planner.pdf"))
    c = canvas.Canvas(path, pagesize=letter)
    c.setTitle("The Grazing Table Planner | Charcuterie Lab"); c.setAuthor("Charcuterie Lab")
    TOTAL = 7
    K = "GRAZING TABLE PLANNER"
    sizes = [25, 50, 75, 100, 150]

    # 1 cover
    c.setFillColor(DEEP); c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(GOLD); c.setFont("Serif", 16); c.drawString(M, H - 60, "Charcuterie Lab")
    c.setFont("PopB", 10); c.drawString(M, H - 250, "PRINTABLE PLANNER")
    c.setFillColor(HexColor("#fff9eb")); c.setFont("Serif", 40); c.drawString(M, H - 300, "The Grazing")
    c.drawString(M, H - 346, "Table Planner")
    c.setFillColor(HexColor("#e8dcb8")); c.setFont("Pop", 13)
    y = wrap(c, "How much to buy, how to lay it out and when to do what, for a charcuterie spread that feeds 25 to 150 people.", M, H - 390, W - 2 * M - 80, 19)
    y -= 20
    for t in ["Quantities for 25, 50, 75, 100 and 150 guests", "Station plan and a table map", "Shopping checklist with your picks", "Two-week countdown to serving", "Refill plan that respects the 2-hour rule", "Budget worksheet"]:
        c.setFillColor(GOLD); c.circle(M + 4, y + 4, 2.5, stroke=0, fill=1)
        c.setFillColor(HexColor("#fff9eb")); c.setFont("Pop", 11.5); c.drawString(M + 16, y, t); y -= 22
    c.setFillColor(GOLD); c.setFont("Pop", 9); c.drawString(M, 40, "charcuterielab.com")
    c.showPage()

    # 2 quantities
    header(c, "How much to buy", "Totals for the whole table, including a 10% crowd buffer.", 2, TOTAL, K)
    y = H - 130
    for mode in ["main", "app"]:
        y = section(c, y, f"{MODES[mode]['long']}: {MODES[mode]['meat']} oz meat + {MODES[mode]['cheese']} oz cheese per guest")
        cols = [M, M + 150] + [M + 150 + 70 * i for i in range(1, 5)]
        c.setFillColor(CREAM); c.rect(M - 6, y - 6, W - 2 * M + 12, 20, stroke=0, fill=1)
        c.setFillColor(GREEN); c.setFont("PopB", 8.5); c.drawString(M, y, "GUESTS")
        for i, n in enumerate(sizes):
            c.drawString(M + 150 + 70 * i, y, str(n))
        y -= 22
        for label, key in ROWS + [("Setup", "setup")]:
            if key == "setup":
                break
            c.setFillColor(INK); c.setFont("PopB", 9.5); c.drawString(M, y, label)
            c.setFont("Pop", 9.5)
            for i, n in enumerate(sizes):
                c.drawString(M + 150 + 70 * i, y, val(DATA["counts"][str(n)]["plans"][mode], key))
            c.setStrokeColor(HexColor("#e5dccb")); c.setLineWidth(0.5); c.line(M - 6, y - 7, W - M + 6, y - 7)
            y -= 20
        c.setFont("PopB", 9.5); c.drawString(M, y, "Kinds (cheese / meat)")
        c.setFont("Pop", 9.5)
        for i, n in enumerate(sizes):
            p = DATA["counts"][str(n)]["plans"][mode]
            c.drawString(M + 150 + 70 * i, y, f"{p['cheeses']} / {p['meats']}")
        y -= 34
    c.setFillColor(MUTED); c.setFont("Pop", 8.5)
    wrap(c, "If a full meal is also served, use the appetizer column. If the table is dinner, use 4 oz each of meat and cheese per guest: double the appetizer amounts.", M, y, W - 2 * M, 12)
    c.showPage()

    # 3 station plan + table map
    header(c, "Stations and table map", "Identical stations stop the queue at one end of the table.", 3, TOTAL, K)
    y = H - 130
    y = section(c, y, "How many stations")
    for guests, st, note in [("25–30", "2", "Both ends of one long table"), ("40–50", "3", "Two ends and the middle, or three small tables"), ("75–100", "4", "Two tables, two stations each"), ("150", "5–6", "Spread around the room; add a crackers-only table")]:
        c.setFillColor(INK); c.setFont("PopB", 10); c.drawString(M, y, f"{guests} guests")
        c.setFont("Pop", 10); c.drawString(M + 110, y, f"{st} stations"); c.setFillColor(MUTED); c.drawString(M + 210, y, note)
        y -= 18
    y -= 10
    y = section(c, y, "Map: one station, repeated along the table")
    # draw table map
    tx, ty, tw, th = M, y - 190, W - 2 * M, 170
    c.setFillColor(HexColor("#efe4cf")); c.roundRect(tx, ty, tw, th, 8, stroke=0, fill=1)
    sw = tw / 2
    for s in range(2):
        ox = tx + s * sw
        c.setStrokeColor(GOLDD); c.setDash(3, 3); c.line(ox + sw, ty + 8, ox + sw, ty + th - 8) if s == 0 else None; c.setDash()
        items = [("Cheese 1", 0.14, 0.72, CREAM), ("Cheese 2", 0.5, 0.72, CREAM), ("Cheese 3", 0.84, 0.72, CREAM),
                 ("Meat river", 0.3, 0.46, HexColor("#e8b7ad")), ("Meat folds", 0.72, 0.46, HexColor("#e8b7ad")),
                 ("Jam", 0.1, 0.2, HexColor("#f1d58c")), ("Olives", 0.3, 0.2, HexColor("#c9d6a3")), ("Crackers", 0.55, 0.2, HexColor("#e6cfa5")), ("Fruit", 0.82, 0.2, HexColor("#e7b3c5"))]
        for name, fx, fy, col in items:
            cx, cy = ox + fx * sw, ty + fy * th
            c.setFillColor(col); c.setStrokeColor(GREEN); c.setLineWidth(0.6)
            c.roundRect(cx - 34, cy - 12, 68, 24, 10, stroke=1, fill=1)
            c.setFillColor(INK); c.setFont("Pop", 7.5); c.drawCentredString(cx, cy - 3, name)
        c.setFillColor(GOLDD); c.setFont("PopB", 8); c.drawString(ox + 10, ty + th - 14, f"STATION {s + 1}")
    y = ty - 22
    c.setFillColor(INK); c.setFont("Pop", 9.5)
    for t in ["Anchor the cheeses first, spaced evenly, each with its own knife.", "Run the meat between them: a salami river down the middle, prosciutto folded loosely.", "Bowls go next: jams, honey, olives, mustard. Then crackers in several small piles, not one big one.", "Fill every gap with fruit and nuts last. Leave space at the front edge for plates."]:
        box(c, M, y - 1, 8); y = wrap(c, t, M + 14, y, W - 2 * M - 14, 13) - 5
    c.showPage()

    # 4 shopping checklist
    header(c, "Shopping checklist", "Write your picks, tick them off. Buy cheese in larger pieces for a crowd.", 4, TOTAL, K)
    y = H - 130
    groups = [("Cheeses", 6), ("Cured meats", 5), ("Crackers and bread", 4), ("Fresh fruit", 4), ("Dried fruit and nuts", 4), ("Olives and pickles", 3), ("Spreads, honey and mustard", 4), ("Garnish and extras", 3), ("Serving gear: boards, knives, bowls, picks, napkins", 4)]
    colw = (W - 2 * M) / 2
    tops = [y, y]
    for i, (name, lines) in enumerate(groups):
        col = 0 if tops[0] >= tops[1] else 1
        x = M + col * colw
        yy = tops[col]
        c.setFillColor(GREEN); c.setFont("PopB", 9.5); c.drawString(x, yy, name)
        yy -= 16
        for _ in range(lines):
            box(c, x, yy - 1, 8)
            c.setStrokeColor(HexColor("#cfc4ae")); c.setLineWidth(0.5); c.line(x + 14, yy - 1, x + colw - 60, yy - 1)
            c.line(x + colw - 50, yy - 1, x + colw - 16, yy - 1)
            yy -= 17
        tops[col] = yy - 12
    c.setFillColor(MUTED); c.setFont("Pop", 8); c.drawString(M, min(tops) - 4, "Right-hand blank: the amount. Get it from page 2.")
    c.showPage()

    # 5 countdown
    header(c, "Countdown to serving", "Tick each line as you go.", 5, TOTAL, K)
    y = H - 130
    steps = [("2 weeks before", "Confirm the guest count and whether a meal is served. Pick the stations layout."),
             ("1 week before", "Order large cheese pieces and deli-sliced meat. Borrow or rent boards, platters and knives."),
             ("3 days before", "Buy crackers, nuts, dried fruit, jams, honey and olives."),
             ("2 days before", "Buy the cheese, meat and fresh fruit. Clear fridge space: one shelf per station."),
             ("The night before", "Cut firm cheeses. Portion every station into its own covered containers, plus one full refill set."),
             ("Morning of", "Wash grapes and berries. Prep garnish. Set out empty boards and label where each station goes."),
             ("1 hour before", "Take the first round of cheese out to warm up."),
             ("45 minutes before", "Build the stations: cheese, meat, bowls, crackers, fruit, nuts."),
             ("Guests arrive", "Note the time the food went out."),
             ("Before 2 hours", "Swap each station for its fridge-cold refill. Discard what was out; don't top it up.")]
    for when, what in steps:
        box(c, M, y - 1)
        c.setFillColor(GREEN); c.setFont("PopB", 10); c.drawString(M + 16, y, when)
        c.setFillColor(INK); c.setFont("Pop", 9.5)
        y = wrap(c, what, M + 150, y, W - M - (M + 150), 13) - 10
    c.showPage()

    # 6 refill + safety
    header(c, "The refill plan", "Long parties need a second round, not a bigger first one.", 6, TOTAL, K)
    y = H - 130
    y = section(c, y, "Why refill")
    c.setFillColor(INK); c.setFont("Pop", 10)
    y = wrap(c, "USDA guidance says perishable food shouldn't sit out more than 2 hours, or 1 hour above 90°F. A grazing table usually runs longer than that. So put out about half at the start and keep the rest cold as ready-made refill trays.", M, y, W - 2 * M, 14) - 14
    y = section(c, y, "Refill log")
    c.setFont("PopB", 9); c.setFillColor(GREEN)
    xs = [M, M + 110, M + 230, M + 350]
    for x, t in zip(xs, ["STATION", "OUT AT", "SWAP BY", "SWAPPED"]):
        c.drawString(x, y, t)
    y -= 20
    for s in range(1, 7):
        c.setFillColor(INK); c.setFont("Pop", 10); c.drawString(xs[0], y, f"Station {s}")
        c.setStrokeColor(HexColor("#cfc4ae")); c.line(xs[1], y - 2, xs[1] + 90, y - 2); c.line(xs[2], y - 2, xs[2] + 90, y - 2)
        box(c, xs[3], y - 1)
        y -= 22
    y -= 10
    y = section(c, y, "What travels well")
    c.setFillColor(INK); c.setFont("Pop", 10)
    y = wrap(c, "Hard and aged cheeses, dry-cured salami, nuts, dried fruit, crackers and olives hold up best over a long party. Put soft cheeses, sliced prosciutto and cut fruit in the refill trays and bring them out fresh.", M, y, W - 2 * M, 14)
    c.showPage()

    # 7 budget
    header(c, "Budget worksheet", "Food only. Estimates scaled from the boards in our book.", 7, TOTAL, K)
    y = H - 130
    y = section(c, y, "Rough totals: party spread (no meal)")
    c.setFont("PopB", 9); c.setFillColor(GREEN)
    cols = [M] + [M + 110 + 80 * i for i in range(5)]
    c.drawString(M, y, "LEVEL")
    for i, n in enumerate(sizes):
        c.drawString(cols[i + 1], y, f"{n} GUESTS")
    y -= 18
    for r, name in enumerate(["Budget", "Standard", "Splurge"]):
        c.setFillColor(INK); c.setFont("PopB", 10); c.drawString(M, y, name); c.setFont("Pop", 9.5)
        for i, n in enumerate(sizes):
            b = DATA["counts"][str(n)]["plans"]["main"]["budget"][r]
            c.drawString(cols[i + 1], y, f"${b[1]}–${b[2]}")
        y -= 17
    y -= 16
    y = section(c, y, "My budget")
    for item in ["Cheese", "Cured meat", "Crackers and bread", "Fruit", "Nuts and dried fruit", "Olives and pickles", "Spreads and honey", "Garnish", "Serving gear", "Total"]:
        c.setFillColor(INK); c.setFont("PopB" if item == "Total" else "Pop", 10); c.drawString(M, y, item)
        c.setStrokeColor(HexColor("#cfc4ae")); c.line(M + 200, y - 2, M + 300, y - 2); c.line(M + 330, y - 2, M + 430, y - 2)
        y -= 20
    c.setFillColor(MUTED); c.setFont("Pop", 8); c.drawString(M + 200, y + 4, "Planned"); c.drawString(M + 330, y + 4, "Spent")
    y -= 24
    c.setFillColor(HexColor("#fbeedb")); c.roundRect(M, y - 60, W - 2 * M, 70, 10, stroke=0, fill=1)
    c.setFillColor(DEEP); c.setFont("Serif", 12.5); c.drawString(M + 16, y - 14, "Want the whole board planned for you?")
    c.setFillColor(INK); c.setFont("Pop", 9.5)
    wrap(c, "Board #49, The Showstopper Grand Board, serves 20 to 30 and is in 50 Boards Built by Science, with 49 more. charcuterielab.com/ebook", M + 16, y - 34, W - 2 * M - 32, 13)
    c.showPage()
    c.save()
    return path


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "planner":
        print(planner())
    else:
        for n in [4, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 100]:
            print(shopping_list(n))
