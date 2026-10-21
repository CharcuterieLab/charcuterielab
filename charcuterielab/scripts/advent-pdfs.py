"""DIY cheese advent calendar printables (20 Oct 2026).

  python3 scripts/advent-pdfs.py

  public/downloads/diy-cheese-advent-calendar-starter.pdf   free, 1 page (email signup on the advent post)
  out/diy-cheese-advent-calendar-kit.pdf                    paid kit, 8 pages (Gumroad, not published on the site)

Fridge-out times and food safety follow claude/site-standards.md. Storage:
hard cheese 3-4 weeks once opened, soft cheese 1-2 weeks (American Dairy
Association storage guide); the plan uses soft and blue cheese within a week.
"""
import os
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
GREEN, DEEP, CREAM, GOLD, GOLDD, INK, MUTED, RED = (HexColor(x) for x in ["#113a27", "#0a261a", "#f7f2e7", "#caa652", "#8f6d2e", "#17130e", "#5e5547", "#8e2b22"])
LINE = HexColor("#e5dccb")
W, H = letter
M = 42

# --------------------------------------------------------------- the plan ---
# One row per role; the three lists line up so any night swaps straight across.
ROLES = ["Soft", "Firm", "Aged", "Blue", "Fun", "Alpine"]
CHEESE = {
    "Budget": ["Brie", "Sharp white cheddar", "Parmesan wedge", "Danish blue or gorgonzola", "Smoked Gouda", "Havarti or Swiss"],
    "Classic": ["Brie or Camembert", "Aged English-style cheddar", "Manchego", "Stilton", "Wensleydale with cranberries", "Gruyère"],
    "Splurge": ["Triple-crème (Brillat-Savarin style)", "Clothbound cheddar", "Parmigiano-Reggiano, 24 months", "Roquefort", "Truffle cheese (Sottocenere style)", "Comté, aged 18+ months"],
}
SPREAD_SLOTS = ["A", "B", "C", "D", "E", "F"]
SPREAD = {
    "Budget": ["Fig jam", "Honey", "Hot honey", "Strawberry jam", "Whole-grain mustard", "Apricot preserves"],
    "Classic": ["Fig jam", "Quince paste (membrillo)", "Hot honey", "Cherry preserves", "Onion jam", "Apricot preserves"],
    "Splurge": ["Fig spread", "Membrillo", "Chestnut honey", "Sour cherry preserves", "Fruit mostarda", "Truffle honey"],
}
# night: (cheese role index, spread slot index, with)
NIGHTS = [
    (0, 0, "Baguette slices and pear"),
    (2, 1, "Marcona almonds"),
    (3, 2, "Walnuts"),
    (1, 4, "Apple slices"),
    (0, 5, "Water crackers"),
    (4, 3, "Shortbread or oat crackers"),
    (3, 0, "Walnut or raisin bread"),
    (5, 4, "Pretzel crisps"),
    (2, 2, "Dried apricots"),
    (1, 1, "Oatcakes"),
    (5, 3, "Pear slices"),
    (4, 5, "Ginger snaps"),
]
SET2 = ["Camembert", "Fresh goat cheese (chèvre)", "Gorgonzola dolce", "Aged Gouda", "Double Gloucester", "Jarlsberg-style Swiss"]
# nights 13-24: soft and blue first (they are bought fresh on Dec 12)
NIGHTS2 = [(0, 3, "Baguette slices"), (1, 0, "Cucumber or crackers"), (2, 2, "Walnuts"), (3, 4, "Apple slices"), (0, 5, "Water crackers"),
           (1, 3, "Grapes"), (2, 0, "Raisin bread"), (4, 1, "Oatcakes"), (5, 5, "Pretzel crisps"), (3, 2, "Pecans"), (4, 4, "Apple slices"),
           (5, 3, "Everything left: Christmas Eve board")]

URL = "charcuterielab.com/blog/cheese-advent-calendars-2026"


# ---------------------------------------------------------------- helpers ---
def wrap_lines(text, font, size, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if pdfmetrics.stringWidth(t, font, size) <= width:
            cur = t
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines


def para(c, text, x, y, width, font="Pop", size=9.5, lead=13.5, color=INK):
    c.setFillColor(color); c.setFont(font, size)
    for ln in wrap_lines(text, font, size, width):
        c.drawString(x, y, ln); y -= lead
    return y


def header(c, title, sub, page, total, kicker="DIY CHEESE ADVENT CALENDAR"):
    c.setFillColor(DEEP); c.rect(0, H - 96, W, 96, stroke=0, fill=1)
    c.setFillColor(GOLD); c.setFont("Serif", 15); c.drawString(M, H - 34, "Charcuterie Lab")
    c.setFont("PopB", 8); c.drawRightString(W - M, H - 34, kicker)
    c.setFillColor(HexColor("#fff9eb")); c.setFont("Serif", 21); c.drawString(M, H - 64, title)
    c.setFont("Pop", 9.5); c.setFillColor(HexColor("#e8dcb8")); c.drawString(M, H - 82, sub)
    footer(c, page, total)


def footer(c, page, total):
    c.setFillColor(MUTED); c.setFont("Pop", 7.5)
    c.drawString(M, 24, "charcuterielab.com  ·  Cheese out no more than 2 hours (1 hour above 90°F), per USDA guidance.")
    if total > 1:
        c.drawRightString(W - M, 24, f"Page {page} of {total}")


def section(c, y, text, x=M):
    c.setFillColor(GOLDD); c.setFont("PopB", 8.5); c.drawString(x, y, text.upper())
    c.setStrokeColor(GOLD); c.setLineWidth(1.2); c.line(x, y - 5, x + 40, y - 5)
    return y - 20


def box(c, x, y, s=9):
    c.setStrokeColor(GREEN); c.setLineWidth(0.9); c.rect(x, y, s, s, stroke=1, fill=0)


def rule(c, y, x0=M - 6, x1=W - M + 6):
    c.setStrokeColor(LINE); c.setLineWidth(0.5); c.line(x0, y, x1, y)


def table_head(c, y, cols, labels):
    c.setFillColor(CREAM); c.rect(M - 6, y - 6, W - 2 * M + 12, 20, stroke=0, fill=1)
    c.setFillColor(GREEN); c.setFont("PopB", 8.5)
    for x, t in zip(cols, labels):
        c.drawString(x, y, t.upper())
    return y - 22


def callout(c, y, title, text, h=None):
    lines = wrap_lines(text, "Pop", 9.5, W - 2 * M - 28)
    h = h or 30 + 13.5 * len(lines)
    c.setFillColor(CREAM); c.roundRect(M - 6, y - h, W - 2 * M + 12, h, 8, stroke=0, fill=1)
    c.setFillColor(GREEN); c.setFont("PopB", 10); c.drawString(M + 8, y - 18, title)
    para(c, text, M + 8, y - 33, W - 2 * M - 28)
    return y - h - 14


# ------------------------------------------------------------ free starter ---
def starter(path):
    c = canvas.Canvas(path, pagesize=letter)
    c.setTitle("DIY Cheese Advent Calendar: starter shopping list | Charcuterie Lab"); c.setAuthor("Charcuterie Lab")
    header(c, "Make your own cheese advent calendar", "12 nights, 6 cheeses, 6 spreads. Tick it off at the store.", 1, 1, kicker="FREE STARTER LIST")
    y = H - 130
    y = section(c, y, "How it works")
    steps = ["Buy six cheeses (about 6 oz or 170 g each) and six jams or spreads.",
             "Cut each cheese in two, so every cheese comes back a second time with a different spread.",
             "Wrap each portion in parchment, then foil or a small bag. Number them 1 to 12.",
             "Each night, take out one portion (soft 20–30 min, firm 30–45, aged 45–60 min before) and eat it with its spread and a few crackers."]
    for i, s in enumerate(steps, 1):
        c.setFillColor(GOLD); c.circle(M + 7, y + 3, 7, stroke=0, fill=1)
        c.setFillColor(DEEP); c.setFont("PopB", 8.5); c.drawCentredString(M + 7, y, str(i))
        y = para(c, s, M + 22, y, W - 2 * M - 22) - 5
    y -= 4
    y = section(c, y, "Shopping list (classic version)")
    colw = (W - 2 * M) / 2
    y0 = y
    c.setFillColor(GREEN); c.setFont("PopB", 9.5); c.drawString(M, y, "Cheeses (6 oz / 170 g each)")
    c.drawString(M + colw, y, "Spreads (one jar each)")
    y -= 18
    for i in range(6):
        box(c, M, y - 1); c.setFillColor(INK); c.setFont("Pop", 10); c.drawString(M + 16, y, CHEESE["Classic"][i])
        c.setFillColor(MUTED); c.setFont("Pop", 7.5); c.drawString(M + 16 + pdfmetrics.stringWidth(CHEESE["Classic"][i], "Pop", 10) + 6, y, ROLES[i].lower())
        box(c, M + colw, y - 1); c.setFillColor(INK); c.setFont("Pop", 10); c.drawString(M + colw + 16, y, SPREAD["Classic"][i])
        rule(c, y - 7, M, W - M); y -= 21
    y -= 2
    c.setFillColor(GREEN); c.setFont("PopB", 9.5); c.drawString(M, y, "Also")
    y -= 18
    for i, t in enumerate(["2 boxes of plain crackers", "Parchment paper and foil", "A marker or 12 number tags", "Nuts, fruit or bread for the side (optional)"]):
        x = M + (i % 2) * colw
        box(c, x, y - 1); c.setFillColor(INK); c.setFont("Pop", 10); c.drawString(x + 16, y, t)
        if i % 2: y -= 19
    y -= 10
    y = section(c, y, "Two rules that keep it good")
    y = para(c, "Eat the soft and blue cheeses in the first week. Wrapped firm and aged cheese keeps the full 12 nights in the fridge (about 3–4 weeks once cut, per the American Dairy Association). Pregnant? Choose pasteurized hard cheeses, per the CDC.", M, y, W - 2 * M) - 14
    y = callout(c, y, "Want the whole calendar planned?",
                "The DIY Cheese Advent Calendar Kit has budget, classic and splurge shopping lists, a night-by-night pairing schedule for 12 or 24 nights, cut-out number tags, a tasting card and a Christmas Eve finale board. Find it at charcuterielab.com/shop.")
    c.save()


# ------------------------------------------------------------------- kit ---
TOTAL = 8


def kit(path):
    c = canvas.Canvas(path, pagesize=letter)
    c.setTitle("The DIY Cheese Advent Calendar Kit | Charcuterie Lab"); c.setAuthor("Charcuterie Lab")

    # 1. cover
    c.setFillColor(DEEP); c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(GOLD); c.setFont("Serif", 18); c.drawString(M + 10, H - 70, "Charcuterie Lab")
    c.setFont("PopB", 9); c.drawRightString(W - M - 10, H - 70, "PRINTABLE KIT")
    # 4 x 6 door grid
    gx, gy, gw, gh = M + 10, H - 430, W - 2 * M - 20, 330
    cw, ch = gw / 6, gh / 4
    for r in range(4):
        for col in range(6):
            n = r * 6 + col + 1
            x, yy = gx + col * cw, gy + gh - (r + 1) * ch
            c.setFillColor(HexColor("#123b29") if (r + col) % 2 else HexColor("#0f3222"))
            c.rect(x + 3, yy + 3, cw - 6, ch - 6, stroke=0, fill=1)
            c.setStrokeColor(GOLD); c.setLineWidth(0.8); c.rect(x + 3, yy + 3, cw - 6, ch - 6, stroke=1, fill=0)
            c.setFillColor(GOLD if n <= 12 else HexColor("#e8dcb8")); c.setFont("Serif", 22); c.drawCentredString(x + cw / 2, yy + ch / 2 - 8, str(n))
    c.setFillColor(HexColor("#fff9eb")); c.setFont("Serif", 34)
    c.drawString(M + 10, H - 490, "The DIY Cheese")
    c.drawString(M + 10, H - 530, "Advent Calendar Kit")
    c.setFillColor(HexColor("#e8dcb8")); c.setFont("Pop", 12.5)
    c.drawString(M + 10, H - 560, "12 or 24 nights of cheese, planned night by night.")
    y = H - 600
    for t in ["Budget, classic and splurge shopping lists", "A pairing schedule for 12 nights, plus 12 more",
              "How to cut, wrap and store it so night 12 tastes like night 1", "Cut-out number tags, a tasting card and a Christmas Eve finale board"]:
        c.setFillColor(GOLD); c.circle(M + 15, y + 4, 3, stroke=0, fill=1)
        c.setFillColor(HexColor("#fff9eb")); c.setFont("Pop", 11); c.drawString(M + 26, y, t); y -= 20
    c.setFillColor(HexColor("#b9ad8f")); c.setFont("Pop", 8)
    c.drawString(M + 10, 40, "charcuterielab.com  ·  For personal use. Print as many copies as you like.")
    c.showPage()

    # 2. how it works
    header(c, "How it works", "Six cheeses, each cut in two, gives you 12 nights. Twelve cheeses gives you 24.", 2, TOTAL)
    y = H - 130
    y = section(c, y, "The formula")
    cols = [M, M + 150, M + 300, M + 420]
    y = table_head(c, y, cols, ["Calendar", "Cheeses", "Each cheese", "Spreads"])
    for row in [("12 nights for 1–2", "6", "6 oz (170 g)", "6 jars"), ("12 nights for 3–4", "6", "10 oz (280 g)", "6 jars"),
                ("24 nights for 1–2", "12", "6 oz (170 g)", "same 6 jars"), ("24 nights for 3–4", "12", "10 oz (280 g)", "6 jars + refills")]:
        c.setFont("PopB", 10); c.setFillColor(INK); c.drawString(cols[0], y, row[0])
        c.setFont("Pop", 10)
        for x, t in zip(cols[1:], row[1:]):
            c.drawString(x, y, t)
        rule(c, y - 8); y -= 23
    c.setFillColor(MUTED); c.setFont("Pop", 8)
    c.drawString(M, y + 2, "That's about 3 oz (85 g) a night for two, or 5 oz (140 g) for four: a tasting, not a meal.")
    y -= 24
    y = section(c, y, "The countdown")
    for when, what in [("Nov 28 or 29", "Shop for the first six cheeses and all the spreads (lists on page 3)."),
                       ("Nov 30", "Cut, wrap and number nights 1–12 (page 6). Clear one fridge drawer for the calendar."),
                       ("Dec 1", "Night 1. Take out the portion before you eat, then add the spread and crackers."),
                       ("Dec 12", "24-night calendar only: buy the second six cheeses (page 5) and wrap nights 13–24."),
                       ("Dec 24", "The last night is the finale board: everything that's left, on one board (page 8).")]:
        box(c, M, y - 1)
        c.setFillColor(GREEN); c.setFont("PopB", 10); c.drawString(M + 16, y, when)
        y = para(c, what, M + 120, y, W - M - (M + 120)) - 8
    y -= 4
    y = section(c, y, "When to take each portion out")
    cols = [M, M + 250]
    for t, v in [("Soft (brie, Camembert, triple-crème)", "20–30 minutes"), ("Fresh (chèvre)", "15–20 minutes"),
                 ("Semi-firm and blue (Havarti, Gruyère, Stilton)", "30–45 minutes"), ("Aged hard (cheddar, Manchego, Parmesan)", "45–60 minutes")]:
        c.setFillColor(INK); c.setFont("Pop", 10); c.drawString(cols[0], y, t)
        c.setFont("PopB", 10); c.drawString(cols[1] + 80, y, v); rule(c, y - 7); y -= 20
    y -= 10
    callout(c, y, "Why every cheese comes back twice",
            "Night 1 you taste the cheese with one spread. A few nights later it comes back with a different one, and you find out what each pairing does. By night 12 you know which cheese you'd buy a whole wedge of for Christmas Eve.")
    c.showPage()

    # 3. shopping lists
    header(c, "Shopping lists", "Pick one column. Each row is the same kind of cheese, so the schedule works with any list.", 3, TOTAL)
    y = H - 128
    tiers = ["Budget", "Classic", "Splurge"]
    colw = (W - 2 * M - 40) / 3
    xs = [M + 40 + i * colw for i in range(3)]
    sub = {"Budget": "Supermarket or Aldi", "Classic": "Good cheese case", "Splurge": "Cheese counter"}
    for x, t in zip(xs, tiers):
        c.setFillColor(GREEN); c.setFont("PopB", 11); c.drawString(x, y, t)
        c.setFillColor(MUTED); c.setFont("Pop", 8); c.drawString(x, y - 12, sub[t])
    y -= 34
    y = section(c, y, "Cheeses (6 oz / 170 g each, or 10 oz / 280 g for 3–4 people)")
    for i, role in enumerate(ROLES):
        c.setFillColor(GOLDD); c.setFont("PopB", 7.5); c.drawString(M, y, role.upper())
        hmax = y
        for x, t in zip(xs, tiers):
            box(c, x, y - 1, 8)
            yy = y
            c.setFillColor(INK); c.setFont("Pop", 9)
            for ln in wrap_lines(CHEESE[t][i], "Pop", 9, colw - 22):
                c.drawString(x + 13, yy, ln); yy -= 11.5
            hmax = min(hmax, yy)
        rule(c, hmax + 3); y = hmax - 9
    y -= 6
    y = section(c, y, "Spreads (one jar each; they last all 24 nights)")
    for i, slot in enumerate(SPREAD_SLOTS):
        c.setFillColor(GOLDD); c.setFont("PopB", 7.5); c.drawString(M, y, slot)
        for x, t in zip(xs, tiers):
            box(c, x, y - 1, 8); c.setFillColor(INK); c.setFont("Pop", 9); c.drawString(x + 13, y, SPREAD[t][i])
        rule(c, y - 7); y -= 19
    y -= 6
    y = section(c, y, "For every list")
    extras = ["2–3 boxes of plain crackers", "Parchment paper", "Foil or small zip bags", "A marker or the tags on page 7",
              "Nuts and fruit for the side (see the schedule)", "A small board or plate"]
    for i, t in enumerate(extras):
        x = M + (i % 2) * ((W - 2 * M) / 2)
        box(c, x, y - 1); c.setFillColor(INK); c.setFont("Pop", 9.5); c.drawString(x + 16, y, t)
        if i % 2: y -= 18
    y -= 8
    para(c, "Brand-name cheeses are listed as \"in the style of\". Any cheese of the same type works. Pregnant? Choose pasteurized hard cheeses and skip the soft and blue rows, per the CDC.", M, y, W - 2 * M, size=8.5, lead=12, color=MUTED)
    c.showPage()

    # 4. nights 1-12
    def schedule(page, title, sub, nights, cheeses, first):
        header(c, title, sub, page, TOTAL)
        y = H - 128
        cols = [M, M + 52, M + 230, M + 380]
        y = table_head(c, y, cols, ["Night", "Cheese", "Spread", "On the side"])
        for k, (ci, si, side) in enumerate(nights):
            n = first + k
            c.setFillColor(GOLD); c.circle(cols[0] + 12, y + 3, 11, stroke=0, fill=1)
            c.setFillColor(DEEP); c.setFont("PopB", 10); c.drawCentredString(cols[0] + 12, y - 0.5, str(n))
            box(c, cols[0] + 30, y - 1, 8)
            c.setFillColor(INK); c.setFont("PopB", 9.5)
            yy = y
            for ln in wrap_lines(cheeses[ci], "PopB", 9.5, 170):
                c.drawString(cols[1], yy, ln); yy -= 12
            c.setFont("Pop", 9.5); c.drawString(cols[2], y, SPREAD["Classic"][si])
            c.setFillColor(MUTED); c.setFont("Pop", 7.5); c.drawString(cols[2], y - 11, f"spread {SPREAD_SLOTS[si]}")
            c.setFillColor(INK); c.setFont("Pop", 9.5)
            yy2 = y
            for ln in wrap_lines(side, "Pop", 9.5, W - M - cols[3]):
                c.drawString(cols[3], yy2, ln); yy2 -= 12
            bottom = min(yy, yy2, y - 11)
            rule(c, bottom - 6); y = bottom - 22
        return y

    y = schedule(4, "Nights 1 to 12", "Classic list shown. On the budget or splurge list, swap straight across by row.", NIGHTS,
                 CHEESE["Classic"], 1)
    callout(c, y, "Soft and blue go first",
            "The brie and Stilton nights are all in the first week, while they're at their best. The firm and aged cheeses keep the full 12 nights wrapped in the fridge.")
    c.showPage()

    # 5. nights 13-24
    y = schedule(5, "Nights 13 to 24", "For a 24-night calendar. Buy these six on Dec 12, so the soft ones are fresh.", NIGHTS2, SET2, 13)
    c.setFillColor(GREEN); c.setFont("PopB", 9.5); c.drawString(M, y + 4, "Second shop (Dec 12)")
    y -= 14
    for i, t in enumerate(SET2):
        x = M + (i % 3) * ((W - 2 * M) / 3)
        box(c, x, y - 1, 8); c.setFillColor(INK); c.setFont("Pop", 9); c.drawString(x + 13, y, t)
        if i % 3 == 2: y -= 17
    c.showPage()

    # 6. wrap and store
    header(c, "Cut, wrap and store", "An hour on Nov 30 and the calendar runs itself.", 6, TOTAL)
    y = H - 130
    y = section(c, y, "Cutting")
    for t in ["Cut each cheese into two equal pieces with the rind on. A wedge splits tip to back; a block splits in half.",
              "For 3–4 people, cut each 10 oz piece into two 5 oz portions.",
              "Leave crumbly blues and Parmesan in chunks. Don't pre-crumble or grate them; they dry out."]:
        box(c, M, y - 1); y = para(c, t, M + 16, y, W - 2 * M - 16) - 6
    y -= 6
    y = section(c, y, "Wrapping")
    for t in ["Wrap each portion snugly in parchment (or cheese paper), then in foil or a small zip bag. Plastic wrap straight on the cheese makes it sweat.",
              "Stick a number tag (page 7) on each one, with the spread letter if you like.",
              "Put them in a box or a clean fridge drawer in order, night 1 on top."]:
        box(c, M, y - 1); y = para(c, t, M + 16, y, W - 2 * M - 16) - 6
    y -= 6
    y = section(c, y, "How long it keeps")
    cols = [M, M + 250]
    for t, v in [("Firm and aged cheese, cut and wrapped", "about 3–4 weeks"), ("Soft cheese (brie, Camembert, triple-crème)", "1–2 weeks: eat in week one"),
                 ("Blue cheese", "eat in week one"), ("Opened jams and spreads", "follow the jar's label")]:
        c.setFillColor(INK); c.setFont("Pop", 10); c.drawString(cols[0], y, t)
        c.setFont("PopB", 10); c.drawString(cols[1] + 40, y, v); rule(c, y - 7); y -= 20
    c.setFillColor(MUTED); c.setFont("Pop", 8); c.drawString(M, y + 2, "Storage times from the American Dairy Association's storage guide. Fridge at 40°F (4°C) or colder.")
    y -= 22
    y = section(c, y, "Food safety")
    for t in ["Back in the fridge within 2 hours (1 hour above 90°F). Leftover pieces get rewrapped in fresh parchment.",
              "Mold on a firm cheese: cut off at least 1 inch around it. Mold on a soft cheese you didn't expect: throw it out.",
              "Pregnant? Choose pasteurized hard cheeses and skip the soft and blue nights, per the CDC."]:
        box(c, M, y - 1); y = para(c, t, M + 16, y, W - 2 * M - 16) - 6
    y -= 8
    callout(c, y, "Giving it as a gift?",
            "Make it for someone else: wrap the 12 portions, tie the tags on with twine, and pack them in a box with the spreads and this schedule. Tell them to keep it in the fridge and start on December 1.")
    c.showPage()

    # 7. tags
    header(c, "Number tags", "Cut along the lines. Tape one to each portion, or punch a hole and tie it on.", 7, TOTAL)
    top = H - 120
    cols_n, rows_n = 4, 6
    tw = (W - 2 * M) / cols_n
    th = (top - 50) / rows_n
    c.setDash(3, 3)
    for r in range(rows_n):
        for col in range(cols_n):
            n = r * cols_n + col + 1
            x, yy = M + col * tw, top - (r + 1) * th
            c.setStrokeColor(HexColor("#b9ad8f")); c.setLineWidth(0.6); c.rect(x, yy, tw, th, stroke=1, fill=0)
            c.setDash()
            c.setFillColor(CREAM); c.roundRect(x + 8, yy + 8, tw - 16, th - 16, 6, stroke=0, fill=1)
            c.setFillColor(GREEN); c.setFont("Serif", 30); c.drawCentredString(x + tw / 2, yy + th / 2 + 2, str(n))
            c.setFillColor(GOLDD); c.setFont("PopB", 7); c.drawCentredString(x + tw / 2, yy + th - 22, "DECEMBER")
            c.setStrokeColor(HexColor("#cfc4ae")); c.setLineWidth(0.5); c.line(x + 20, yy + 22, x + tw - 20, yy + 22)
            c.setFillColor(MUTED); c.setFont("Pop", 6.5); c.drawCentredString(x + tw / 2, yy + 13, "cheese / spread")
            c.setDash(3, 3)
    c.setDash()
    c.showPage()

    # 8. tasting card + finale
    header(c, "Tasting card and the finale board", "Score each night, then build Christmas Eve around the winners.", 8, TOTAL)
    y = H - 128
    cols = [M, M + 40, M + 250, M + 360]
    y = table_head(c, y, cols, ["#", "Cheese and spread", "Score (1–5)", "Buy again?"])
    for n in range(1, 13):
        c.setFillColor(GREEN); c.setFont("PopB", 9.5); c.drawString(cols[0] + 2, y, f"{n} / {n + 12}")
        c.setStrokeColor(HexColor("#cfc4ae")); c.setLineWidth(0.5); c.line(cols[1], y - 2, cols[2] - 14, y - 2)
        for k in range(5):
            c.setStrokeColor(GREEN); c.circle(cols[2] + 6 + k * 16, y + 3, 5, stroke=1, fill=0)
        box(c, cols[3], y - 1); c.setFillColor(INK); c.setFont("Pop", 8.5); c.drawString(cols[3] + 13, y, "yes")
        box(c, cols[3] + 45, y - 1); c.drawString(cols[3] + 58, y, "no")
        rule(c, y - 8); y -= 22
    c.setFillColor(MUTED); c.setFont("Pop", 8); c.drawString(M, y + 4, "Doing 24 nights? Use the second number in each row for nights 13–24.")
    y -= 22
    y = section(c, y, "The Christmas Eve finale board")
    lx = M
    for t in ["Buy a full wedge (6–8 oz) of your top three scored cheeses, plus whatever portions are left.",
              "Put the cheeses on first, spaced apart. Each gets its winning spread in a small bowl beside it.",
              "Fill the gaps with the sides from the schedule: pear, apple, walnuts, Marcona almonds, dried apricots.",
              "Crackers go on last, around the edge. Take the firm cheeses out 45–60 minutes ahead and the soft ones 20–30."]:
        box(c, lx, y - 1); y = para(c, t, lx + 16, y, W - 2 * M - 16) - 6
    y -= 6
    para(c, "For 8 or more people, use about 3 oz of cheese per guest in total, per our board standard. charcuterielab.com/party-planner works out the rest.", M, y, W - 2 * M, size=8.5, lead=12, color=MUTED)
    c.showPage()
    c.save()


if __name__ == "__main__":
    os.makedirs(os.path.join(ROOT, "public", "downloads"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
    starter(os.path.join(ROOT, "public", "downloads", "diy-cheese-advent-calendar-starter.pdf"))
    kit(os.path.join(ROOT, "out", "diy-cheese-advent-calendar-kit.pdf"))
    print("ok")
