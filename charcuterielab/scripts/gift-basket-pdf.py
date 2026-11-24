"""Free printable for the DIY charcuterie gift basket post (24 Nov 2026).

  python3 scripts/gift-basket-pdf.py
  -> public/downloads/diy-gift-basket-shopping-lists.pdf (2 pages)

Page 1: the three shopping lists ($25, $50, $100) as checklists, with the
amounts and estimated costs from content/blog/charcuterie-gift-basket.md.
Page 2: packing order, the gift tag, and Christmas 2026 ship-by dates.
Offered as the email freebie on that post (offers.mjs FREEBIES.giftbasket).
Keep the lists in step with the post's tables when the post changes.
"""
import importlib.util, os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("lp", os.path.join(ROOT, "scripts", "lead-pdfs.py"))
lp = importlib.util.module_from_spec(spec); spec.loader.exec_module(lp)
pp = lp.pp
GREEN, DEEP, CREAM, GOLD, GOLDD, INK, MUTED, W, H, M = pp.GREEN, pp.DEEP, pp.CREAM, pp.GOLD, pp.GOLDD, pp.INK, pp.MUTED, pp.W, pp.H, pp.M
URL = "charcuterielab.com/blog/charcuterie-gift-basket  ·  Refrigerate cheese and opened meat."

BOXES = [
    ("The $25 starter box", "A board for 2 to 4. A small kraft box or lined shoebox-size crate.", "About $25 to $35", [
        ("Whole dry salami (Genoa or hard salami)", "1 small chub, 6–8 oz", "$6–9"),
        ("Pasteurized aged cheddar", "1 block, 7–8 oz", "$4–6"),
        ("Water crackers or butter crackers", "1 box", "$3–4"),
        ("Fig jam", "1 small jar", "$4–6"),
        ("Cornichons", "1 small jar", "$3–4"),
        ("Mixed nuts or Marcona almonds", "1 small bag", "$4–6"),
    ]),
    ("The $50 classic basket", "A board for 6. A shallow wicker basket or wooden crate.", "About $45 to $60", [
        ("Whole dry salami, 2 kinds (Genoa and finocchiona)", "2 chubs", "$12–18"),
        ("Pasteurized aged cheddar", "1 block", "$4–6"),
        ("Aged Gouda or Manchego", "1 wedge, 6–8 oz", "$7–10"),
        ("Crackers, 2 kinds (water crackers, fruit and nut crisps)", "2 boxes", "$7–10"),
        ("Fig jam or honey", "1 jar", "$4–7"),
        ("Whole-grain mustard", "1 small jar", "$3–5"),
        ("Castelvetrano olives", "1 jar", "$4–6"),
        ("Marcona almonds", "1 bag", "$5–7"),
        ("Dark chocolate", "1 bar", "$3–4"),
    ]),
    ("The $100 luxury box", "The board is the container, so the gift lasts after the food is gone.", "About $95 to $130", [
        ("Wooden board, 12–16 in (acacia or walnut)", "1", "$20–35"),
        ("Cheese knife set", "3 or 4 pieces", "$15–25"),
        ("Whole Spanish chorizo plus a whole salami", "2", "$14–20"),
        ("Parmigiano-Reggiano", "1 wedge, 6–8 oz", "$10–14"),
        ("Manchego or aged Gouda", "1 wedge", "$8–12"),
        ("Truffle honey or hot honey", "1 jar", "$8–14"),
        ("Membrillo (quince paste)", "1 package", "$5–7"),
        ("Fruit and nut crisps", "1 box", "$5–7"),
        ("Marcona almonds", "1 bag", "$5–7"),
        ("Good dark chocolate", "1 bar", "$4–6"),
    ]),
]


def lists_page(c):
    lp.head(c, "DIY Charcuterie Gift Basket", "Three shopping lists: tick off each item as you shop. Prices are typical US grocery prices, fall 2026.", 1, 2, "FREE PRINTABLE", URL)
    y = H - 122
    for title, sub, total, rows in BOXES:
        c.setFillColor(GREEN); c.setFont("Serif", 13); c.drawString(M, y, title)
        c.setFillColor(GOLDD); c.setFont("PopB", 9); c.drawRightString(W - M, y, total)
        y -= 13
        c.setFillColor(MUTED); c.setFont("Pop", 8.5); c.drawString(M, y, sub)
        y -= 15
        for item, amt, cost in rows:
            pp.box(c, M, y - 1)
            c.setFillColor(INK); c.setFont("Pop", 9.3); c.drawString(M + 16, y, lp.fit(c, item, "Pop", 9.3, 300))
            c.setFillColor(MUTED); c.setFont("Pop", 8.8); c.drawString(M + 330, y, amt)
            c.setFillColor(INK); c.setFont("PopB", 8.8); c.drawRightString(W - M, y, cost)
            c.setStrokeColor(HexColor("#e5dccb")); c.setLineWidth(0.4); c.line(M + 16, y - 5, W - M, y - 5)
            y -= 15.5
        y -= 14
    c.setFillColor(MUTED); c.setFont("Pop", 8.3)
    pp.wrap(c, "Buy whole salami, not sliced packs: a whole, unopened dry salami keeps about 6 weeks in the pantry (USDA). Add the cheese last, right before you hand it over.", M, y, W - 2 * M, 11)
    c.showPage()


def extras_page(c):
    lp.head(c, "Pack it, tag it, ship it", "The packing order, a gift tag to fill in, and the Christmas 2026 ship-by dates.", 2, 2, "FREE PRINTABLE", URL)
    y = H - 124
    y = pp.section(c, y, "Packing order")
    steps = ["Line the box with crinkle paper, tissue or a linen napkin.",
             "Heaviest first, at the back and bottom: jars of olives, jam, mustard and honey, each wrapped in tissue.",
             "Stand the whole salamis (and the board, if using) upright at the back.",
             "Fill the middle with nuts, chocolate and the knife set.",
             "Crackers on top and in front, where nothing can crush them.",
             "Cheese last, right before you hand it over, in a small insulated pouch.",
             "Wrap in clear cellophane gathered at the top with ribbon, and tie on the tag."]
    for i, s in enumerate(steps, 1):
        pp.box(c, M, y - 1)
        c.setFillColor(GREEN); c.setFont("PopB", 9.3); c.drawString(M + 16, y, f"{i}.")
        c.setFillColor(INK); c.setFont("Pop", 9.3)
        y = pp.wrap(c, s, M + 32, y, W - 2 * M - 32, 12.5) - 3.5
    y -= 8
    y = pp.section(c, y, "The gift tag (cut it out)")
    th = 150
    c.setStrokeColor(GOLD); c.setLineWidth(1); c.setDash(4, 3); c.rect(M, y - th, W - 2 * M, th, stroke=1, fill=0); c.setDash()
    ty = y - 20
    c.setFillColor(GREEN); c.setFont("Serif", 12); c.drawString(M + 14, ty, "A charcuterie board, packed for you")
    ty -= 18
    c.setFillColor(INK); c.setFont("PopB", 9); c.drawString(M + 14, ty, "Refrigerate the cheese (and the salami once it's opened).")
    ty -= 18
    c.setFont("Pop", 9)
    for label in ["Try:  ______________________  with  ______________________", "Try:  ______________________  with  ______________________", "Try:  ______________________  with  ______________________"]:
        c.drawString(M + 14, ty, label); ty -= 16
    c.drawString(M + 14, ty, "Take the cheese out 30 to 60 minutes before serving. Slice the salami thin.")
    ty -= 16
    c.drawString(M + 14, ty, "Contains:  ______________________________________  (nuts, gluten, dairy)")
    y -= th + 22
    y = pp.section(c, y, "Christmas 2026: ship by")
    rows = [("No cheese, USPS Ground Advantage", "Thu, Dec 17"),
            ("No cheese, USPS Priority Mail", "Fri, Dec 18"),
            ("With cheese: overnight, Monday to Wednesday only", "Mon Dec 21 to Wed Dec 23"),
            ("UPS Next Day Air, last day for Dec 24 arrival", "Wed, Dec 23")]
    for k, v in rows:
        c.setFillColor(INK); c.setFont("Pop", 9.3); c.drawString(M, y, k)
        c.setFont("PopB", 9.3); c.drawRightString(W - M, y, v)
        c.setStrokeColor(HexColor("#e5dccb")); c.setLineWidth(0.4); c.line(M, y - 6, W - M, y - 6)
        y -= 17
    c.setFillColor(MUTED); c.setFont("Pop", 8.3)
    pp.wrap(c, "USPS dates are its recommended send-by dates for delivery before Dec 25; UPS dates are for delivery by Dec 24. Carriers call these recommendations, not guarantees, so ship earlier if you can. With cheese, use an insulated mailer and frozen gel packs, and tell the recipient it's coming.", M, y - 4, W - 2 * M, 11)
    c.showPage()


def main():
    out = os.path.join(ROOT, "public", "downloads", "diy-gift-basket-shopping-lists.pdf")
    c = canvas.Canvas(out, pagesize=letter)
    c.setTitle("DIY Charcuterie Gift Basket: shopping lists"); c.setAuthor("Charcuterie Lab")
    lists_page(c); extras_page(c); c.save()
    print(out)


if __name__ == "__main__":
    main()
