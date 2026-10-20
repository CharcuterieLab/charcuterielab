"""
to-skim.py - convert a ranked buying guide (Sep 29 / storelib house format) into
the scannable format (.sk-* components, piloted on best-cheese-knife-sets).

    py scripts/to-skim.py best-salami-brands best-fig-jam ...   (from the charcuterielab folder)

Reads content/blog/<slug>.md and rewrites it in place. Nothing is lost: every
product's full write-up and sources move into a fold on its card, the score
table and method move into the fold at the end, and any section the converter
doesn't recognise is kept as-is. Already-converted files (containing ":::html")
are skipped. Frontmatter is untouched, so titles, FAQ schema and URLs don't change.
"""
import html as H, json, re, sys
from pathlib import Path

BLOG = Path(__file__).resolve().parent.parent / "content" / "blog"
TAG_NOTE = "Links to Amazon are affiliate links."
# Guides where the products ship well and are sold on Amazon. Others (fresh
# cheese, sliced meat, single-store guides) keep "Where to buy" without a button.
AMAZON_OK = {"best-fig-jam", "best-salami-brands", "best-marcona-almonds", "best-summer-sausage",
             "best-olives-for-charcuterie", "best-honey-for-cheese", "best-mustard-for-charcuterie",
             # round 2 (Oct 20): jars, crackers, chips, sweets and dry-cured meats
             "best-balsamic-glaze", "best-crackers-for-charcuterie", "best-cranberry-sauce", "best-dark-chocolate",
             "best-gluten-free-crackers", "best-hot-honey", "best-kettle-chips", "best-meat-sticks", "best-mixed-nuts",
             "best-pepper-jelly", "best-pickles-for-charcuterie", "best-pita-chips", "best-pretzels-for-charcuterie",
             "best-quince-paste", "best-shortbread", "best-strawberry-jam", "best-tortilla-chips", "best-water-crackers",
             "best-salsa", "best-spanish-chorizo", "best-pepperoni-brands", "best-soppressata-brands", "best-sparkling-cider"}
STORE_BRANDS = re.compile(r"^(Trader Joe's|Kirkland|365 by Whole Foods|Member's Mark|Good & Gather|Private Selection|Simply Nature|Specially Selected|Publix|H-E-B|Wegmans|Signature Select)", re.I)


def esc(s):
    return H.escape(s, quote=True)


def inline(s):
    """Our markdown subset -> HTML, for copy moved inside :::html blocks."""
    s = esc(s)
    s = re.sub(r"\[(.+?)\]\((https?://[^\s)]+|/[^\s)]*)\)",
               lambda m: f'<a href="{m.group(2)}"' + ("" if m.group(2).startswith("/") else ' target="_blank" rel="noopener"') + f">{m.group(1)}</a>", s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    return re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", s)


def split_sections(body):
    """Return (preamble_lines, [(heading, lines), ...]) split on '## '."""
    pre, secs, cur = [], [], None
    for line in body.split("\n"):
        if line.startswith("## "):
            cur = (line[3:].strip(), [])
            secs.append(cur)
        elif cur is None:
            pre.append(line)
        else:
            cur[1].append(line)
    return pre, secs


def paras(lines):
    out, buf = [], []
    for l in lines + [""]:
        if l.strip():
            buf.append(l.strip())
        elif buf:
            out.append(" ".join(buf) if not buf[0].startswith(("|", "- ", "!")) else "\n".join(buf))
            buf = []
    return out


SCORE = re.compile(r"^\*\*([★½☆]+)\s+([\d.]+) out of 5\*\*(.*)$")


LABEL_LINE = re.compile(r"^\*\*([^*]+)\*\*\s*·\s*(.*)$")


def parse_items(lines):
    items, cur = [], None
    for line in lines:
        m = re.match(r"^### (\d+)\. (.+)$", line)
        u = None if m else re.match(r"^### (.+)$", line)
        if m or u:
            cur = {"n": int(m.group(1)) if m else len(items) + 1, "name": (m.group(2) if m else u.group(1)).strip(), "body": []}
            items.append(cur)
        elif cur is not None:
            cur["body"].append(line)
    for it in items:
        desc, rest = [], []
        for p in paras(it.pop("body")):
            sm = SCORE.match(p)
            lm = None if sm else (LABEL_LINE.match(p) if "stars" not in it and "label" not in it and "Best for:" in p else None)
            if sm or lm:
                if sm:
                    it["stars"], it["score"] = sm.group(1), float(sm.group(2))
                    bits = [b.strip() for b in sm.group(3).split("·") if b.strip()]
                else:
                    it["label"] = lm.group(1).strip()
                    bits = [b.strip() for b in lm.group(2).split("·") if b.strip()]
                for b in bits:
                    if b.startswith("Best for:"):
                        it["for"] = b[len("Best for:"):].strip()
                    elif re.match(r"^\$+\s", b):
                        it["tier"] = b
                    else:
                        it["label"] = b
            elif p.startswith("- "):
                for b in p.split("\n"):
                    bm = re.match(r"^- \*\*(Why we like it|Keep in mind|Where to buy|Where to find it):\*\*\s*(.*)$", b.strip())
                    if bm:
                        it[{"Why we like it": "why", "Keep in mind": "mind"}.get(bm.group(1), "where")] = bm.group(2)
                    else:
                        rest.append(b)
            else:
                desc.append(p)
        it["desc"] = desc
        it["extra"] = rest
    return items


def score_table(lines):
    rows = [l for l in lines if l.startswith("|")]
    scores = {}
    for r in rows[2:]:
        cells = [c.strip().strip("*") for c in r.strip("|").split("|")]
        scores[cells[0]] = cells[1:6]
    intro = " ".join(l for l in lines if l.strip() and not l.startswith("|"))
    return intro, rows, scores


def table_html(rows):
    head = [c.strip() for c in rows[0].strip("|").split("|")]
    body = [[c.strip() for c in r.strip("|").split("|")] for r in rows[2:]]
    th = "".join(f"<th scope=\"col\">{esc(c)}</th>" for c in head)
    tb = "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in body)
    return f'<div class="sk-table-wrap"><table class="sk-table"><thead><tr>{th}</tr></thead><tbody>{tb}</tbody></table></div>'


def convert(slug):
    path = BLOG / f"{slug}.md"
    src = path.read_text(encoding="utf-8")
    if ":::html" in src:
        return f"{slug}: already converted, skipped"
    fm_end = src.index("\n---", 4) + 4
    front, body = src[:fm_end], src[fm_end:]
    pre, secs = split_sections(body)
    # ---------------------------------------------------------------- preamble
    title = next(l for l in pre if l.startswith("# "))
    qa = next(l for l in pre if l.startswith("> **Quick Answer:**"))
    ranked_note = ""
    m = re.search(r"\s(We ranked \d+ [^.]*\.)\s*$", qa)
    if m:
        ranked_note, qa = m.group(1), qa[: m.start()].rstrip()
    rest_pre = [p for p in paras([l for l in pre if l not in (title, qa) and not l.startswith("> **Quick Answer:**")])]
    method = next((p for p in rest_pre if p.startswith("*How we ranked")), "")
    intro = [p for p in rest_pre if p != method and not p.startswith("# ")]
    method = re.sub(r"^How we (ranked|picked) these:\s*", "", method.strip("*").strip())
    method = method[:1].upper() + method[1:]
    # ---------------------------------------------------------------- sections
    by = {h: ls for h, ls in secs}
    order = [h for h, _ in secs]
    glance = [l for l in by.get("Our picks at a glance", []) if l.startswith("| **")]
    picks = []  # (label, name)
    for r in glance:
        pm = re.match(r"^\| \*\*(.+?):\*\* (.+?) \((\$+)\) \|", r)
        if pm:
            picks.append((pm.group(1), pm.group(2)))
    scored = "The full ranking" in by
    full = by.get("The full ranking") or by.get("Our picks at a glance", [])
    pin = next((l for l in full if l.startswith("![")), "")
    items = parse_items(full)
    s_intro, s_rows, scores = score_table(by.get("How the scores break down", []))
    faq_h = next((h for h in order if re.search(r"questions$|^FAQ", h, re.I)), None)
    known = {"Our picks at a glance", "The full ranking", "How the scores break down", "What to look for on the label", "Sources", faq_h}
    amazon = slug in AMAZON_OK
    noun = slug.replace("best-", "").replace("-brands", "").replace("-for-charcuterie", "").replace("-for-cheese", "").replace("-", " ")
    # ---------------------------------------------------------------- build
    def buy(it, small=False):
        if amazon and not STORE_BRANDS.match(it["name"]):
            q = re.sub(r"\s*\(.*?\)", "", it["name"])
            url = "https://www.amazon.com/s?k=" + "+".join(q.replace("&", "and").split())
            cls = "button sk-buy-sm" if small else "button primary sk-buy"
            return f'<a class="{cls}" href="{esc(url)}" target="_blank" rel="noopener">Check price on Amazon</a>'
        if small:
            return f'<a class="button sk-buy-sm" href="#pick-{it["n"]}">See details</a>'
        return ""

    def bar(it):
        if "score" not in it:
            return ""
        pct = max(0, min(100, round(it["score"] / 5 * 100)))
        return (f'<div class="sk-score" aria-label="Rated {it["score"]} out of 5"><span class="sk-stars" aria-hidden="true">{it["stars"]}</span>'
                f'<b>{it["score"]}</b><span class="sk-of">/ 5</span><span class="sk-bar" aria-hidden="true"><i style="width:{pct}%"></i></span></div>')

    by_name = {it["name"]: it for it in items}
    top_rows = []
    for label, name in picks[:3]:
        it = by_name.get(name)
        if not it:
            continue
        line = it.get("why", "")
        top_rows.append(f'<div class="sk-top-row"><div class="sk-top-text"><p class="sk-pill">{esc(label)}</p><a class="sk-top-name" href="#pick-{it["n"]}">{esc(name)}</a>'
                        f'<p class="sk-top-line">{inline(line)}</p></div><div class="sk-top-buy"><span class="sk-price">{("★ %s · " % it["score"]) if "score" in it else ""}{esc(it.get("tier", "").split(" ")[0])}</span>{buy(it, small=True)}</div></div>')
    jump = [(("All %d, ranked" if scored else "All %d picks") % len(items), "picks"), ("What to look for", "what-to-look-for")]
    extra_secs = [h for h in order if h not in known]
    if faq_h:
        jump.append(("FAQ", "faq"))
    jump_html = "".join(f'<a href="#{a}">{esc(t)}</a>' for t, a in jump)

    cards = []
    crit = ["On the board", "Reviews", "Ingredients", "Value", "Easy to find"]
    for it in items:
        pill_html = f'<p class="sk-pill">{esc(it["label"])}</p>' if it.get("label") else ""
        facts = [("Best for", it.get("for", "")), ("Price", it.get("tier", "")), ("Where", it.get("where", ""))]
        facts_html = "".join(f"<div><dt>{esc(k)}</dt><dd>{inline(v)}</dd></div>" for k, v in facts if v)
        sc = scores.get(it["name"])
        sc_line = (" <span class=\"sk-subscores\">Scores: " + " · ".join(f"{c} {v}" for c, v in zip(crit, sc)) + "</span>") if sc else ""
        evidence = "".join(f"<p>{inline(p)}</p>" for p in it["desc"]) + "".join(f"<p>{inline(x)}</p>" for x in it["extra"])
        b = buy(it)
        cards.append(f'''<article class="sk-card" id="pick-{it["n"]}">
<div class="sk-card-head"><span class="sk-num" aria-hidden="true">{it["n"]}</span><div>{pill_html}<h3>{esc(it["name"])}</h3></div></div>
{bar(it)}
<dl class="sk-facts">{facts_html}</dl>
<p class="sk-why"><strong>Why it's here:</strong> {inline(it.get("why", ""))}</p>
<p class="sk-mind"><strong>Watch out:</strong> {inline(it.get("mind", ""))}</p>
{('<div class="sk-actions">' + b + '</div>') if b else ''}
<details class="sk-more"><summary>{"Why we ranked it here" if scored else "Why we picked it"} (sources)</summary>{evidence}<p>{sc_line}</p></details>
</article>''')

    L = [front.rstrip("\n"), "", title, "", qa, "", ":::html",
         f'<div class="sk-top"><p class="sk-top-label">Our top picks</p>{"".join(top_rows)}</div>',
         f'<nav class="sk-jump" aria-label="On this page">{jump_html}</nav>', ":::", ""]
    L += [p for p in intro] + [""]
    lede = ('Scored out of 5 on how each works on a board, reviews and awards, ingredients, value and how easy it is to find. Tap "Why we ranked it here" for the details.'
            if scored else 'Not scored: no side-by-side test of these exists yet, so each is picked for a job. Tap "Why we picked it" for the sources.')
    L += [":::html", f'<h2 id="picks">All {len(items)}{", ranked" if scored else " picks"}</h2>',
          f'<p class="sk-lede">{lede}</p>',
          '<div class="sk-cards">'] + cards + ["</div>", ":::", ""]
    # What to look for: the label check and skip become a checklist; anything after stays as text.
    look = paras(by.get("What to look for on the label", []))
    checks, after = [], []
    for p in look:
        lm = re.match(r"^\*\*(Label check|Skip|Check):\*\*\s*(.*)$", p)
        if lm:
            checks.append(("Look for" if lm.group(1) != "Skip" else "Skip", lm.group(2)))
        else:
            after.append(p)
    if checks:
        skipcls = ' class="sk-x"'
        lis = "".join(f'<li{skipcls if k == "Skip" else ""}><strong>{k}:</strong> {inline(v)}</li>' for k, v in checks)
        L += [":::html", '<h2 id="what-to-look-for">What to look for</h2>', f'<ul class="sk-checks">{lis}</ul>', ":::", ""]
    else:
        jump_html = jump_html.replace('<a href="#what-to-look-for">What to look for</a>', "")
    L += after + [""]
    for h in extra_secs:
        L += [f"## {h}", ""] + by[h] + [""]
    if faq_h:
        L += [":::html", f'<h2 id="faq">{esc(faq_h)}</h2>', ":::", ""] + by[faq_h] + [""]
    # Method, scores and sources, folded.
    srcs = [l for l in by.get("Sources", []) if l.startswith("- ")]
    tail = [l for l in by.get("Sources", []) if l.strip() and not l.startswith("- ")]
    src_html = "".join(f"<li>{inline(l[2:])}</li>" for l in srcs)
    pin_html = ""
    pm = re.match(r"^!\[(.*?)\]\((.+?)\)$", pin)
    if pm:
        pin_html = f'<img src="{esc(pm.group(2))}" alt="{esc(pm.group(1))}" width="1000" height="1500" loading="lazy" decoding="async" class="sk-pin">'
    method_txt = " ".join(x for x in [method, ranked_note, TAG_NOTE if amazon else ""] if x)
    L += [":::html", f'<details class="sk-method"><summary>{"How we ranked these, full scores and sources" if scored else "How we picked these, and sources"}</summary>',
          f"<p>{inline(method_txt)}</p>", f"<p>{inline(s_intro)}</p>" if s_intro else "", table_html(s_rows) if len(s_rows) > 2 else "",
          f'<ul class="sk-src">{src_html}</ul>', pin_html, "</details>", ":::", ""]
    L += tail + [""]
    out = "\n".join(L)
    out = re.sub(r"\n{3,}", "\n\n", out)
    # The top card's jump list may have lost "What to look for".
    if not checks:
        out = out.replace('<a href="#what-to-look-for">What to look for</a>', "")
    path.write_text(out, encoding="utf-8")
    return f"{slug}: {len(items)} items, {len(top_rows)} top picks, {'Amazon' if amazon else 'no Amazon'}, extra sections {extra_secs}"


if __name__ == "__main__":
    for s in sys.argv[1:]:
        print(convert(s))
