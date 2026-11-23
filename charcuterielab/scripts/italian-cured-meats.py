#!/usr/bin/env python3
"""Writes content/blog/italian-cured-meats.md (Italian cured meats, region by region).

After adding card photos at public/images/<id>.webp (ids in PHOTO below):
  py scripts/make-thumbs.py
  py scripts/italian-cured-meats.py
"""
import json, os, html, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THUMBS = os.path.join(ROOT, "public/images/thumbs")
ING = os.path.join(ROOT, "..", "content/ingredients")

FAMC = {"whole": "#8e3b46", "salami": "#6e2a35", "cooked": "#a8503f", "fat": "#5b3a2a", "spread": "#b0432c"}
FAMW = {"whole": "Whole-muscle", "salami": "Salami", "cooked": "Cooked", "fat": "Cured fat", "spread": "Spreadable"}
SW = ["", "Mild", "Gentle", "Medium", "Bold", "Intense"]

# key, name, ingredient slug (or None), family, meat, strength, tastes like, try with, label, what it is, eat (ready/cook/warm)
M = {
 "speck": ("Speck Alto Adige", "speck", "whole", "Pork", 3, "Smoky, juniper, lightly spiced", "Apples and rye crackers", "IGP", "Ham that's lightly salted, cold-smoked and air-dried in Italy's German-speaking north. It's boned and pressed flat, so it slices into wide, smoky ribbons.", "ready"),
 "sandaniele": ("Prosciutto di San Daniele", "prosciutto-san-daniele", "whole", "Pork", 2, "Sweeter and softer than Parma", "Fresh figs", "DOP", "Ham from one hill town in Friuli, cured with sea salt only. The leg keeps its trotter, which gives a whole ham its guitar shape.", "ready"),
 "sopressa": ("Sopressa Vicentina", None, "salami", "Pork", 3, "Soft, garlicky, coarse", "Asiago and polenta", "DOP", "A big, soft salami from around Vicenza in the Veneto, seasoned with garlic, pepper and spices and aged for months.", "ready"),
 "bresaola": ("Bresaola della Valtellina", "bresaola", "whole", "Beef", 2, "Lean, sweet, deep red", "Arugula, lemon and Parmigiano", "IGP", "Salt-cured, air-dried beef from the Alpine valley of Valtellina. The leanest of the salumi and the one for guests who skip pork.", "ready"),
 "milano": ("Salame Milano", None, "salami", "Pork (often with beef)", 2, "Fine-grained, mild, garlicky", "Grissini", "", "Milan's salami has a fine, even grind, often described as grains of rice. Mild enough for anyone.", "ready"),
 "cacciatora": ("Salamini alla Cacciatora (Cacciatorini)", None, "salami", "Pork", 2, "Small, mild, garlicky", "Olives and Asiago", "DOP", "Hunter's salami: small enough to fit in a pocket, made across northern Italy. Slice into coins for a board.", "ready"),
 "parma": ("Prosciutto di Parma", "prosciutto-di-parma", "whole", "Pork", 2, "Sweet, silky, delicately salty", "Melon or Parmigiano", "DOP", "Pork legs, sea salt and at least 14 months of air. Nothing else is allowed in. Look for the five-point ducal crown branded on the skin.", "ready"),
 "culatello": ("Culatello di Zibello", "culatello", "whole", "Pork", 3, "Deep, sweet, almost winey", "Parmigiano and Lambrusco", "DOP", "The heart of the ham: the best muscle of the rear leg, tied in a bladder and aged in foggy cellars along the Po river. Italy's most prized salume.", "ready"),
 "mortadella": ("Mortadella Bologna", "mortadella", "cooked", "Pork", 2, "Silky, mild, pistachio-flecked", "Pistachios and Lambrusco", "IGP", "Finely ground pork studded with cubes of fat, often with pistachios, then slow-cooked. Bologna's gift to the world (and the grandparent of American bologna).", "ready"),
 "felino": ("Salame Felino", None, "salami", "Pork", 2, "Sweet, pure pork, peppercorns", "Parmigiano", "IGP", "Named for a town near Parma. Lightly seasoned with pepper and wine, so you taste the pork. Cut it on a slant into long oval slices.", "ready"),
 "coppa": ("Coppa Piacentina", "coppa", "whole", "Pork", 3, "Rich, marbled, warmly spiced", "Aged provolone", "DOP", "Cured pork neck and shoulder, marbled with fat. Piacenza and Parma both make famous ones; Americans know it as capicola.", "ready"),
 "pancetta": ("Pancetta Piacentina", "pancetta", "fat", "Pork belly", 3, "Rich, peppery, porky", "Thin slices on warm bread", "DOP", "Cured pork belly, rolled tight. In Piacenza the rolled kind is sliced thin and eaten as is; most pancetta sold in the US is meant for cooking, so follow the label.", "cook"),
 "finocchiona": ("Finocchiona", "finocchiona", "salami", "Pork", 3, "Fennel, soft, aromatic", "Pecorino and Chianti", "IGP", "Tuscany's fennel-seed salami: soft, coarse and fragrant. Slice it a little thicker than you would a firm salami.", "ready"),
 "toscano": ("Prosciutto Toscano", None, "whole", "Pork", 3, "Saltier, with pepper and herbs", "Pecorino and Chianti", "DOP", "Rubbed with salt, pepper, garlic and herbs, so it's saltier and more savory than Parma. Tuscans eat it with their famous unsalted bread.", "ready"),
 "lardo": ("Lardo di Colonnata", "lardo", "fat", "Pork back fat", 2, "Buttery, herby, melts on the tongue", "Warm toast and honey", "IGP", "Pork back fat cured with salt, herbs and spices in marble basins in the hills above Carrara. Sliced paper-thin, it melts on warm bread.", "ready"),
 "cinghiale": ("Wild Boar Salami (Salame di Cinghiale)", None, "salami", "Wild boar & pork", 4, "Gamey, dark, rich", "Pecorino and red wine", "", "Tuscany's hunting salami, made with wild boar and pork. Darker and gamier than pork salami.", "ready"),
 "norcia": ("Prosciutto di Norcia", None, "whole", "Pork", 4, "Lean, savory, peppery", "Pecorino and dry red wine", "IGP", "A bolder ham from the Umbrian mountains. Norcia's butchers were so famous that Italians still call a pork butcher a norcino.", "ready"),
 "ciauscolo": ("Ciauscolo", None, "spread", "Pork", 2, "Soft, spreadable, garlicky", "Crusty bread", "IGP", "A salami from Le Marche so finely ground and soft that you spread it on bread instead of slicing it.", "ready"),
 "lonzino": ("Lonzino", None, "whole", "Pork", 2, "Lean, delicate, fennel and pepper", "Pears and pecorino", "", "Cured pork loin from central Italy. Lean and delicate, it's the gentlest of the whole-muscle meats after prosciutto.", "ready"),
 "guanciale": ("Guanciale", "guanciale", "fat", "Pork cheek", 4, "Intensely porky, peppery, rich", "Carbonara and pecorino", "", "Cured pork cheek, the fat that makes Roman carbonara and amatriciana. Cook it until the fat turns clear and crisp.", "cook"),
 "porchetta": ("Porchetta", None, "cooked", "Pork", 3, "Herby, garlicky roast pork", "Crusty rolls", "IGP", "Boned, rolled pork roasted with garlic, rosemary and fennel until the skin crackles. The one from Ariccia, near Rome, has IGP status.", "warm"),
 "nduja": ("'Nduja", "nduja", "spread", "Pork", 5, "Fiery chile, spreadable, funky", "Burrata and toast", "", "Calabria's spreadable salami, red with chile. Spread a little on toast or melt it into pasta; it's not a DOP product, so quality varies by maker.", "ready"),
 "soppressata": ("Soppressata di Calabria", "soppressata", "salami", "Pork", 3, "Coarse, rustic, sweet or hot", "Provolone and peppers", "DOP", "A pressed, coarse salami made across southern Italy, sweet or hot. Calabria's version has DOP status.", "ready"),
 "capocollo": ("Capocollo di Calabria", None, "whole", "Pork", 4, "Spiced, marbled, peppery", "Provolone and olives", "DOP", "Calabria's coppa, rubbed with pepper or chile. One of four Calabrian cured meats with DOP status.", "ready"),
 "calabrese": ("Calabrese Salami", None, "salami", "Pork", 4, "Hot chile, smoky red pepper", "Honey and ricotta", "", "Hot salami in the Calabrian style, red with chile. In the US, \"Calabrese\" on a label simply means spicy.", "ready"),
}

REGIONS = [
 ("northeast", "The Alps and the northeast", "Alto Adige, Friuli and the Veneto", "Cold, dry mountain air and a little smoke. Sweet hams and soft salami.", ["speck", "sandaniele", "sopressa"],
  "Speck comes from Alto Adige (Südtirol), where the food is half Italian and half Austrian. Its motto is a little salt, a little smoke and plenty of fresh air. San Daniele is Parma's main rival for Italy's best ham. Try both side by side: San Daniele is usually a touch sweeter and softer.",
  "Serve speck with apples, rye crackers and a mild mountain cheese like <a href=\"/ingredients/fontina/\">fontina</a>. Serve San Daniele with <a href=\"/ingredients/figs/\">fresh figs</a>."),
 ("lombardy", "Lombardy and the northwest", "Lombardy, Piedmont and the Valtellina", "Lean beef and mild, finely ground salami.", ["bresaola", "milano", "cacciatora"],
  "Lombardy gives you bresaola, Milan's mild salami and the little hunter's salami found all over the north. The region also makes Salame di Varzi DOP and Salame Brianza DOP, which you'll rarely see in the US.",
  "The classic way to eat bresaola is on a plate with arugula, lemon, olive oil and shaved <a href=\"/ingredients/parmigiano-reggiano/\">Parmigiano</a>."),
 ("emilia", "Emilia-Romagna: Italy's food valley", "Parma, Piacenza and Bologna", "The richest stretch of salumi in the world. Sweet hams, silky mortadella, marbled coppa.", ["parma", "culatello", "mortadella", "felino", "coppa", "pancetta"],
  "The plain between Piacenza and Bologna is the same land that makes Parmigiano-Reggiano and balsamic vinegar of Modena. The pigs are fed partly on whey left over from Parmigiano, and the Po river fog helps the hams and culatello cure slowly. Piacenza alone has three DOP salumi: coppa, pancetta and salame.",
  "In Emilia, salumi come with gnocco fritto (puffs of fried dough) or tigelle (small flatbreads), shards of Parmigiano and a cold glass of fizzy red Lambrusco. In Parma, culatello is often served with curls of sweet butter."),
 ("tuscany", "Tuscany", "Florence, Siena and the Carrara hills", "Fennel, black pepper, herbs and wild boar.", ["finocchiona", "toscano", "lardo", "cinghiale"],
  "Tuscan salumi are bolder and more herby than Emilia's. Fennel seed goes into finocchiona, pepper and garlic into the ham, and rosemary and spices into lardo. Wild boar runs all over the Tuscan hills, so it ends up in salami too.",
  "Tuscans eat their salty salumi with unsalted bread, plus <a href=\"/ingredients/pecorino-toscano/\">pecorino toscano</a> and a glass of <a href=\"/pairings/wine/chianti-sangiovese/\">Chianti</a>."),
 ("center", "Umbria and Le Marche", "Norcia and the Apennine hills", "Mountain hams and the softest salami in Italy.", ["norcia", "ciauscolo", "lonzino"],
  "This is pork country. Norcia, a mountain town in Umbria, has been famous for its butchers for centuries. Next door in Le Marche, ciauscolo is ground so fine that it's spread, not sliced.",
  "Serve these with crusty bread, <a href=\"/ingredients/pears/\">ripe pears</a> and a sheep's milk cheese."),
 ("lazio", "Rome and Lazio", "Rome and the Castelli Romani", "The cooking meats: guanciale and roast porchetta.", ["guanciale", "porchetta"],
  "Rome's two great pork products are both cooked before you eat them. Guanciale is cured raw and goes into carbonara, amatriciana and gricia. Porchetta is roasted whole and sold in thick slices from food trucks and market stalls.",
  "Porchetta is best warm or at room temperature in a crusty roll. Leave guanciale off the cold board."),
 ("south", "Calabria and the south", "Calabria, Basilicata, Puglia and Campania", "Heat. Red chile, smoked pepper and spreadable 'nduja.", ["nduja", "soppressata", "capocollo", "calabrese"],
  "Southern Italy is where the chile comes in. Calabria has four DOP cured meats (soppressata, capocollo, salsiccia and pancetta) and the famous 'nduja, which comes from the town of Spilinga. Soppressata is made all over the south, and most families have their own recipe.",
  "Cool the heat with something creamy and sweet: <a href=\"/ingredients/burrata/\">burrata</a>, <a href=\"/ingredients/ricotta/\">ricotta</a> or a drizzle of <a href=\"/ingredients/honey/\">honey</a>. Our <a href=\"/blog/nduja-charcuterie-board/\">'nduja board</a> is built around it."),
]

PHOTO = {"sopressa": "sopressa-vicentina", "milano": "milano-salami", "cacciatora": "cacciatorini", "felino": "salame-felino", "toscano": "prosciutto-toscano", "cinghiale": "wild-boar-salami", "norcia": "prosciutto-di-norcia", "ciauscolo": "ciauscolo", "lonzino": "lonzino", "porchetta": "porchetta", "capocollo": "capocollo-di-calabria", "calabrese": "calabrese-salami"}

MANIFEST = json.load(open(os.path.join(THUMBS, "manifest.json"), encoding="utf-8"))["thumbs"]

def photo_thumb(k):
    """Card photo for a meat with no ingredient page: /images/<id>.webp (or .jpg, or /images/cured-meat-types/<id>.jpg)."""
    i = PHOTO.get(k)
    for src in (f"/images/{i}.webp", f"/images/{i}.jpg", f"/images/cured-meat-types/{i}.jpg"):
        t = i and MANIFEST.get(src)
        if t and t.get("s"):
            return t["s"].rsplit("/", 1)[1][:-len("-s.webp")]
    return None

def has_thumb(slug):
    return slug and os.path.exists(os.path.join(THUMBS, f"ingredients__{slug}-jpg-s.webp"))

def has_ing(slug):
    return slug and os.path.exists(os.path.join(ING, f"{slug}.md"))

def strength(n):
    return f'<span class="tc-str" aria-label="Strength {n} of 5: {SW[n]}">' + "".join('<i class="on"></i>' if i < n else "<i></i>" for i in range(5)) + "</span>"

NOIMG = '<svg viewBox="0 0 64 48" aria-hidden="true"><circle cx="32" cy="24" r="19" fill="currentColor" opacity=".55"/><circle cx="32" cy="24" r="19" fill="none" stroke="currentColor" stroke-width="2.5" opacity=".85"/><g fill="#fff" opacity=".75"><circle cx="25" cy="17" r="2.4"/><circle cx="37" cy="15" r="1.8"/><circle cx="40" cy="27" r="2.6"/><circle cx="28" cy="31" r="2"/><circle cx="33" cy="23" r="1.5"/><circle cx="22" cy="25" r="1.6"/></g></svg>'

def card(k):
    name, slug, fam, meat, st, taste, pair, label, what, eat = M[k]
    e = html.escape
    t = f"ingredients__{slug}-jpg" if has_thumb(slug) else photo_thumb(k)
    pic = (f'<img src="/images/thumbs/{t}-s.webp" srcset="/images/thumbs/{t}-s.webp 240w, /images/thumbs/{t}-m.webp 640w" sizes="(max-width: 640px) 46vw, 240px" alt="{e(name)}" width="240" height="161" loading="lazy" decoding="async">'
           if t else f'<span class="tc-noimg" style="--fc:{FAMC[fam]}">{NOIMG}</span>')
    pill = ' <span class="tm-eat tm-eat-cook">Cook first</span>' if eat == "cook" else (' <span class="tm-eat tm-eat-warm">Serve warm</span>' if eat == "warm" else "")
    lab = f' · <b class="it-lab">{label}</b>' if label else ""
    body = (f'<span class="tc-card-body"><span class="tc-card-name">{e(name)}</span><span class="tc-card-meta">{FAMW[fam]} · {e(meat)}{lab}</span>'
            f'{strength(st)}{pill}<span class="tc-card-taste">{e(taste)}</span><span class="it-what">{e(what)}</span><span class="tc-card-pair"><b>Try with:</b> {e(pair)}</span></span>')
    inner = f'<span class="tc-card-pic">{pic}</span>{body}'
    return f'<a class="tc-card" href="/ingredients/{slug}/">{inner}</a>' if has_ing(slug) else f'<div class="tc-card">{inner}</div>'

def link(k, text=None):
    name, slug = M[k][0], M[k][1]
    t = text or name
    return f'[{t}](/ingredients/{slug}/)' if has_ing(slug) else t

FAQ = [
 ("What are Italian cured meats called?", "Salumi. It's the Italian word for all cured and preserved meats, from prosciutto to mortadella. Salami (salame in Italian) is just one kind of salumi: the ground, stuffed and dried sausages."),
 ("What is the most famous Italian cured meat?", "Prosciutto di Parma is the best known around the world, followed by mortadella from Bologna. Among Italians, culatello di Zibello is often called the finest, and it's the most expensive."),
 ("What Italian cured meats are best for a charcuterie board?", "Pick three that taste different: a sweet ham (Prosciutto di Parma or San Daniele), a salami (Felino, finocchiona or Genoa) and something bold (spicy soppressata or 'nduja). Add bresaola if a guest doesn't eat pork. Plan about 2 ounces of meat per person when there's a meal, and 3 to 4 when the board is the meal."),
 ("What is the difference between Genoa salami and Italian dry salami?", "Both are American labels for Italian-style salami, and recipes vary by brand. Genoa is usually the softer, milder one, seasoned with garlic, wine and whole peppercorns. Italian dry salami is usually drier, firmer and more peppery. Neither is a protected Italian name."),
 ("What is gabagool?", "Gabagool is the Italian-American way of saying capocollo, the cured pork neck and shoulder that's also sold as coppa or capicola. The name comes from southern Italian dialects, which soften and clip the ends of words."),
 ("Which Italian cured meats need to be cooked?", "Guanciale and most pancetta sold in the US are cured but still raw, so cook them first. Cotechino and zampone, the big holiday sausages from Modena, are also cooked before eating. Prosciutto, salami, coppa, bresaola, speck and mortadella are ready to eat."),
 ("Are Italian cured meats safe during pregnancy?", "The CDC advises people who are pregnant to heat deli meats, including cured meats, to 165°F or until steaming hot before eating. Prosciutto or salami baked on a pizza is fine. Ask your doctor if you're unsure."),
 ("What do DOP and IGP mean on Italian cured meats?", "They're EU protected names. DOP (PDO in English) means every step happens in the named region, with local raw ingredients. IGP (PGI) means at least one step of production happens there. Both come with written rules, inspections and a seal on the package."),
]

def faq_json():
    return json.dumps([{"question": q, "answer": a} for q, a in FAQ], ensure_ascii=False)

TAGS = json.dumps(["italian cured meats", "salumi", "italian salumi", "italian salami", "types of italian cured meat", "prosciutto", "italian charcuterie", "antipasto meats", "italian cold cuts"])

NDJ = "'nduja"
GRS = '<a href="/ingredients/grissini/">Grissini</a>'
out = []
w = out.append
w("---")
w('title: "Italian Cured Meats: A Region-by-Region Guide to Salumi"')
w('seo_title: "Italian Cured Meats: 25 Salumi, Region by Region"')
w('date: "2026-11-22"')
w('image: "/images/italian-cured-meats.jpg"')
w('excerpt: "Italian cured meats are called salumi, and every region has its own. Here are 25 of them, from the Alps to Calabria: what each tastes like, how Italians serve them, what DOP and IGP mean, and how to build an Italian board."')
w('description: "Italian cured meats (salumi) region by region: 25 from prosciutto and culatello to finocchiona and \'nduja, what DOP means, and how to build an Italian board."')
w(f'faq: "{faq_json()}"')
w('slug: "italian-cured-meats"')
w(f'tags: "{TAGS}"')
w("---")
w("")
w("# Italian Cured Meats: A Region-by-Region Guide to Salumi")
w("")
w("> **Quick Answer:** Italian cured meats are called **salumi**: whole-muscle hams like prosciutto, salami, cooked meats like mortadella, and cured fat like lardo. The north makes sweet, delicate hams, the center adds fennel and herbs, and the south adds chile.")
w("")

STYLE = """<style>
.post-body .it-lab { color: #7a4a12; font-weight: 700; letter-spacing: .02em; }
.post-body .it-what { display: block; margin: 6px 0 2px; font-size: 14px; line-height: 1.45; color: #4a3b33; }
.post-body .tm-eat { display: inline-block; margin: 4px 0 0; padding: 1px 7px; border-radius: 999px; font: 700 11px/1.5 var(--sans); letter-spacing: .02em; white-space: nowrap; align-self: flex-start; }
.post-body .tm-eat-cook { background: #f6dfd6; color: #8a2f1b; }
.post-body .tm-eat-warm { background: #f3e7cf; color: #6b4a12; }
.post-body .it-strip { display: grid; gap: 8px; margin: 0 0 30px; padding: 0; list-style: none; counter-reset: it; }
.post-body .it-strip li { display: grid; grid-template-columns: 34px 1fr; gap: 4px 12px; align-items: start; padding: 12px 14px; border-radius: 12px; background: #fff; border: 1px solid rgba(169, 87, 43, 0.14); border-left: 6px solid var(--ic, #8e3b46); font-family: var(--sans); }
.post-body .it-strip li::before { counter-increment: it; content: counter(it); grid-row: span 2; display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: var(--ic, #8e3b46); color: #fff; font: 700 15px/1 var(--sans); }
.post-body .it-strip b { font: 700 17px/1.3 var(--serif); color: var(--green-deep); }
.post-body .it-strip b a { color: inherit; }
.post-body .it-strip span { font-size: 15px; line-height: 1.45; }
.post-body .it-compass { margin: -18px 0 26px; font: 600 13px/1.4 var(--sans); color: #6b5a50; letter-spacing: .04em; text-transform: uppercase; }
.post-body .it-serve { padding: 12px 16px; margin: 10px 0 34px; border-radius: 12px; background: #f7f1e8; font-family: var(--sans); font-size: 15.5px; line-height: 1.55; }
.post-body .it-serve b { color: var(--green-deep); }
</style>"""

w(":::html")
w(STYLE)
w('<div class="sk-top"><p class="sk-top-label">Italian salumi in four answers</p>')
tops = [
 ("4", "Kinds of salumi", "Whole-muscle, salami, cooked, and fat and spreads.", "#kinds", "The four"),
 ("7", "Regions, north to south", "From smoky Alpine speck to fiery Calabrian 'nduja.", "#regions", "The map"),
 ("3", "Meats for an easy board", "A sweet ham, a mild salami and something spicy.", "#board", "Build it"),
 ("DOP", "The label to look for", "A protected name, made in its home region under strict rules.", "#dop", "What it means"),
]
for pill, name, line, href, btn in tops:
    w(f'<div class="sk-top-row"><div class="sk-top-text"><p class="sk-pill">{pill}</p><span class="sk-top-name">{name}</span><p class="sk-top-line">{line}</p></div><div class="sk-top-buy"><span class="sk-price"><a href="{href}">{btn}</a></span></div></div>')
w("</div>")
jump = [("kinds", "The 4 kinds"), ("regions", "North to south")] + [(r[0], r[1].split(":")[0]) for r in REGIONS] + [("deli-names", "US deli names"), ("dop", "DOP and IGP"), ("serve", "How to serve"), ("board", "Build a board"), ("pairings", "Pairings"), ("buying", "Buying tips"), ("faq", "FAQ")]
w('<nav class="sk-jump" aria-label="On this page">' + "".join(f'<a href="#{i}">{t}</a>' for i, t in jump) + "</nav>")
w(":::")
w("")
w("Every region of Italy cures pork its own way, and the differences follow the map. The cool, dry north makes sweet, delicate hams. Central Italy adds fennel, pepper and herbs. The south adds chile. This guide goes region by region through 25 of the salumi you're most likely to find (or want to hunt down), then shows you how Italians serve them and how to build an Italian board at home.")
w("")
w("For every cured meat from every country in one searchable chart, see our [100 types of cured meat](/blog/types-of-cured-meat/). This page is the deep dive on Italy.")
w("")
w(":::html")
w('<h2 id="kinds">Salumi in 30 seconds: the four kinds</h2>')
w(":::")
w("")
w("| Kind | In Italian | What it is | Examples |")
w("|---|---|---|---|")
w(f"| **Whole-muscle** | Salumi crudi interi | A whole cut, salted and air-dried, never ground | {link('parma', 'Prosciutto')}, {link('culatello', 'culatello')}, {link('coppa', 'coppa')}, {link('bresaola', 'bresaola')}, {link('speck', 'speck')} |")
w(f"| **Salami** | Salame (plural salami) | Chopped meat and fat with spices, stuffed into a casing, fermented and dried | {link('felino', 'Felino')}, {link('finocchiona', 'finocchiona')}, {link('soppressata', 'soppressata')}, Milano |")
w(f"| **Cooked** | Salumi cotti | Cooked during making, so it's moist and mild | {link('mortadella', 'Mortadella')}, prosciutto cotto, porchetta |")
w(f"| **Cured fat and spreads** | Lardo, pancetta, spalmabili | Cured fat to slice or cook, and salami soft enough to spread | {link('lardo', 'Lardo')}, {link('guanciale', 'guanciale')}, {link('nduja', NDJ)}, ciauscolo |")
w("")
w("**A word to know:** in Italy, *prosciutto* just means ham. Ask for *prosciutto crudo* for the raw, air-dried kind and *prosciutto cotto* for cooked ham.")
w("")

w(":::html")
w('<h2 id="regions">Italian cured meats from north to south</h2>')
w('<p class="it-compass">North (Alps) ↓ South (Calabria)</p>')
w('<ol class="it-strip">')
RC = ["#5b6f8a", "#7a6a4f", "#8e3b46", "#6d7d3a", "#8a5a2b", "#a8503f", "#b0432c"]
for (rid, title, where, flavor, keys, *_), c in zip(REGIONS, RC):
    names = ", ".join(M[k][0] for k in keys)
    w(f'<li style="--ic:{c}"><b><a href="#{rid}">{title.split(":")[0]}</a></b><span>{flavor} <em>{names}.</em></span></li>')
w("</ol>")
w(":::")
w("")

for rid, title, where, flavor, keys, intro, serve in REGIONS:
    w(":::html")
    w(f'<h2 id="{rid}">{title}</h2>')
    w(f'<p class="sk-lede"><b>{where}.</b> {flavor}</p>')
    w(":::")
    w("")
    w(intro)
    w("")
    w(":::html")
    w('<div class="tc-cards">' + "".join(card(k) for k in keys) + "</div>")
    w(f'<p class="it-serve"><b>How it\'s served:</b> {serve}</p>')
    w(":::")
    w("")

w(":::html")
w('<h2 id="deli-names">Italian-American deli names, decoded</h2>')
w(":::")
w("")
w("Many \"Italian\" meats at a US deli counter are Italian-American: made in the US, in the Italian style, and sometimes with names you won't hear in Italy.")
w("")
w("| On the US label | What it is | Closest Italian cousin | Read more |")
w("|---|---|---|---|")
w("| **Genoa salami** | Mild, soft pork salami (sometimes with beef) with garlic, wine and peppercorns | Salame genovese, Salame Milano | [Genoa vs hard salami](/blog/genoa-salami-vs-hard-salami/) |")
w("| **Italian dry salami** | A US label for a drier, firmer, peppery pork salami | Most northern salami | [Best salami brands](/blog/best-salami-brands/) |")
w("| **Hard salami** | American: firmer, drier, often smoky, often with beef | None really | [Genoa vs hard salami](/blog/genoa-salami-vs-hard-salami/) |")
w("| **Capicola / gabagool** | Coppa: cured pork neck and shoulder, sweet or hot | Coppa, capocollo | [What is capicola?](/blog/capicola/) |")
w("| **Pepperoni** | An Italian-American creation. In Italy, *peperoni* means bell peppers | Salame piccante (spicy salami) | [Salami vs pepperoni](/blog/salami-vs-pepperoni/) |")
w("| **Soppressata** | Coarse, pressed salami, sold sweet or hot | Soppressata di Calabria | [Soppressata vs salami](/blog/soppressata-vs-salami/) |")
w("| **Calabrese** | Any hot, chile-red salami | Salame calabrese | [Types of salami](/blog/types-of-salami/) |")
w("| **Bologna** | The American descendant of mortadella, without the cubes of fat | Mortadella Bologna | [Mortadella vs bologna](/blog/mortadella-vs-bologna/) |")
w("")

w(":::html")
w('<h2 id="dop">DOP and IGP: what the labels mean</h2>')
w(":::")
w("")
w("Italy has more protected food and wine names than any other country in Europe, and dozens of them are cured meats. Two EU labels do the work:")
w("")
w("- **DOP** (*Denominazione di Origine Protetta*, or PDO in English): the raw ingredients come from the region and every step of production happens there. Examples: Prosciutto di Parma, San Daniele, culatello di Zibello, Coppa Piacentina.")
w("- **IGP** (*Indicazione Geografica Protetta*, or PGI): at least one step of production, processing or preparation happens in the region. Examples: mortadella Bologna, bresaola della Valtellina, speck Alto Adige, finocchiona.")
w("- **On the package:** the DOP seal is red and yellow; the IGP seal is blue and yellow. Prosciutto di Parma also carries a five-point ducal crown branded on the skin, and San Daniele carries an \"SD\" brand.")
w("- **Without a seal:** \"Italian-style\", \"Genoa\" or \"Calabrese\" tells you the style, not where it was made. Look for \"Product of Italy\" if that matters to you. Many good US makers produce Italian-style salumi too.")
w("")

w(":::html")
w('<h2 id="serve">How Italians serve salumi</h2>')
w(":::")
w("")
w("In Italy a board of mixed sliced meats is called an *affettato misto*, served on a *tagliere* (a wooden cutting board) as an antipasto. A few habits make it taste better at home:")
w("")
w("- **Slice it thin and serve it soon.** Prosciutto should be almost see-through. Have the deli slice it, lay it on parchment, and eat it within a day or two.")
w("- **Take it out 20 to 30 minutes early.** Fat tastes of nothing when it's cold. Room temperature lets the sweetness come through. Don't leave it out more than 2 hours.")
w("- **Go from mild to strong.** Start with mortadella, prosciutto and bresaola, then salami, then spicy soppressata or 'nduja.")
w("- **Peel the salami.** Most casings on larger salami aren't meant to be eaten. Thin casings on small salami are fine.")
w(f"- **Serve bread, not just crackers.** {GRS}, focaccia, crusty bread, flatbreads or fried dough. See [the best bread for a charcuterie board](/blog/what-bread-for-charcuterie-board/).")
w("- **Fold, don't fan.** Loose folds of prosciutto look generous and are easy to pick up. For a showpiece, try a [prosciutto rose](/blog/prosciutto-rose/) or a [salami rose](/blog/how-to-make-a-salami-rose/).")
w("")

w(":::html")
w('<h2 id="board">Build an Italian salumi board</h2>')
w(":::")
w("")
w("Three ways to do it, from easy to showpiece. Plan about **2 ounces of meat per person** when there's a meal, and **3 to 4 ounces** when the board is the meal.")
w("")
w("| Board | Meats | Add |")
w("|---|---|---|")
w(f"| **Easy (3 meats)** | {link('parma', 'Prosciutto di Parma')}, Genoa or Felino salami, spicy {link('soppressata', 'soppressata')} | Parmigiano, fresh mozzarella, Castelvetrano olives, fig jam, grissini |")
w(f"| **North-to-south tour (5)** | {link('sandaniele', 'San Daniele')}, {link('bresaola', 'bresaola')}, {link('mortadella', 'mortadella')}, {link('finocchiona', 'finocchiona')}, {link('nduja', NDJ)} | Taleggio, pecorino, burrata, pistachios, honey, focaccia |")
w(f"| **Showpiece (5)** | {link('culatello', 'Culatello')}, {link('speck', 'speck')}, Prosciutto Toscano, wild boar salami, {link('lardo', 'lardo')} on warm toast | Parmigiano with aged balsamic, gorgonzola, figs, roasted chestnuts |")
w("")
w("Want it all planned? Our [Italian antipasto board](/boards/italian-antipasto-board/) has the full shopping list and layout, the [Italian board for two](/boards/italian-board-for-two/) is the date-night size, and the [antipasto skewer board](/boards/antipasto-skewer-board/) does it on sticks.")
w("")

w(":::html")
w('<h2 id="pairings">What goes with Italian cured meats</h2>')
w(":::")
w("")
w("The easy rule: pair salumi with the cheese, bread and wine from the same region. They've been eaten together for centuries.")
w("")
w("| Meat | Cheese | Something sweet or fresh | Wine |")
w("|---|---|---|---|")
w("| Prosciutto di Parma | [Parmigiano-Reggiano](/pairings/food/parmigiano-reggiano/) | Cantaloupe or melon | Prosecco or Lambrusco |")
w("| Culatello | Parmigiano-Reggiano | Sweet butter | Lambrusco |")
w("| Mortadella | Fresh mozzarella | Pistachios | Lambrusco or Prosecco |")
w("| Bresaola | Shaved Parmigiano | Arugula and lemon | Light red, like Pinot Noir |")
w("| Speck | Fontina or Asiago | Apples | Pinot Noir or a dry white |")
w("| Finocchiona | Pecorino toscano | Pears | Chianti |")
w("| Soppressata | Aged provolone | Roasted red peppers | Chianti or Montepulciano |")
w("| 'Nduja | Burrata or ricotta | Honey | Chilled Lambrusco or a fruity red |")
w("")
w("More detail on each: [what goes with prosciutto](/pairings/food/prosciutto-di-parma/), [what goes with soppressata](/pairings/food/soppressata/), [what goes with mortadella](/pairings/food/mortadella/), [what goes with coppa](/pairings/food/coppa/) and our [Chianti pairing guide](/pairings/wine/chianti-sangiovese/).")
w("")

w(":::html")
w('<h2 id="buying">Buying Italian cured meats in the US</h2>')
w(":::")
w("")
w("- **Deli counter or pre-sliced?** Freshly sliced wins for prosciutto, culatello and mortadella. Pre-sliced packs are fine for salami and convenient for a party.")
w("- **Ask for it thin.** Paper-thin for prosciutto, bresaola and speck; about 1/16 inch for salami.")
w("- **Read the label.** \"Product of Italy\" and a DOP or IGP seal mean imported and protected. \"Italian-style\" means made elsewhere in the style.")
w("- **How long it keeps:** eat opened sliced meats within 3 to 5 days. A whole, uncut dry salami keeps for weeks in the fridge.")
w("- **Our tested picks:** [best prosciutto brands](/blog/best-prosciutto-brands/), [best salami brands](/blog/best-salami-brands/), [best mortadella brands](/blog/best-mortadella-brands/), [best capicola and coppa](/blog/best-capicola-coppa/), [best soppressata](/blog/best-soppressata-brands/) and [best 'nduja](/blog/best-nduja/).")
w("- **Cook-first list:** guanciale, most US pancetta, cotechino and zampone. If you're pregnant, the CDC advises heating deli and cured meats until steaming hot (165°F); see [can you eat prosciutto while pregnant](/blog/can-you-eat-prosciutto-while-pregnant/).")
w("")
w("**Head to head:** [prosciutto vs pancetta](/blog/prosciutto-vs-pancetta/), [prosciutto vs serrano](/blog/prosciutto-vs-serrano/), [bresaola vs prosciutto](/blog/bresaola-vs-prosciutto/), [soppressata vs pepperoni](/blog/soppressata-vs-pepperoni/) and [mortadella vs bologna](/blog/mortadella-vs-bologna/).")
w("")

w(":::html")
w('<h2 id="faq">Italian cured meats: FAQ</h2>')
w(":::")
w("")
for q, a in FAQ:
    w(f"**{q}**")
    w("")
    w(a)
    w("")

w("## Sources")
w("")
w("- European Commission, [Geographical indications for food and drink](https://agriculture.ec.europa.eu/farming/geographical-indications-and-quality-schemes/geographical-indications-food-and-drink_en) (what PDO and PGI mean).")
w("- Consorzio del Prosciutto di Parma, [prosciuttodiparma.com](https://www.prosciuttodiparma.com/) (ingredients, aging, the ducal crown).")
w("- CDC, [Listeria and food safety](https://www.cdc.gov/listeria/) (heating deli meats during pregnancy).")
w("")

open(os.path.join(ROOT, "content/blog/italian-cured-meats.md"), "w", encoding="utf-8", newline="\n").write("\n".join(out) + "\n")
print("written", len(out), "lines; cards w/o page:", [k for k in M if not has_ing(M[k][1])], "no thumb:", [k for k in M if M[k][1] and not has_thumb(M[k][1])])
