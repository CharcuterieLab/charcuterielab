// Pairings Hub: /pairings/ plus drink, food, combo, rules and chart pages.
//
// Content lives in content/pairings/:
//   drinks.json  - 12 wines, 6 beers, cocktails, zero-proof (source: make_drinks.py)
//   foods.json   - editorial layer for the 25 "What goes with X" pages (make_foods.py)
//   combos.json  - Perfect Pairs, Trios, Quartets (make_combos.py)
//   rules.json   - the six pairing rules
// Everything else comes from the ingredient pages: pairs_with, avoid_with and the
// "What it pairs with - and why" table. The build refuses to run if the data
// disagrees with itself (see validate()).
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { HOLIDAY_CALENDAR } from "./holidays.mjs";

const UPDATED = "2026-09-24";

export async function loadPairings(root) {
  const dir = join(root, "content", "pairings");
  try {
    const read = async (f) => JSON.parse(await readFile(join(dir, f), "utf8"));
    const [drinks, foods, combos, rules] = await Promise.all(["drinks.json", "foods.json", "combos.json", "rules.json"].map(read));
    return { drinks, foods, combos, rules };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- helpers ---
const FAMILY = {
  wine: { label: "Wine", base: "/pairings/wine/" },
  beer: { label: "Beer & Cider", base: "/pairings/beer/" },
  cocktails: { label: "Cocktails & Spirits", base: "/pairings/cocktails/" },
  zero: { label: "Zero-Proof", base: "/pairings/zero-proof/" }
};
const COMBO_KINDS = [
  { key: "pairs", label: "Perfect Pairs", n: 2, blurb: "Two foods that make each other better." },
  { key: "trios", label: "Trios", n: 3, blurb: "Add a third bite and the pairing gets a texture or a bridge." },
  { key: "quartets", label: "Quartets", n: 4, blurb: "Four-part bites: a whole board's worth of contrast on one cracker." }
];
const DRINK_WORDS = [
  [/champagne|prosecco|sparkling|cava|cr[eé]mant|bubbles/i, "champagne-prosecco"],
  [/pinot noir|burgundy/i, "pinot-noir"],
  [/cabernet/i, "cabernet-sauvignon"],
  [/sauvignon blanc|sancerre/i, "sauvignon-blanc"],
  [/chardonnay|chablis/i, "chardonnay"],
  [/ros[eé]\b/i, "rose"],
  [/riesling|gew[uü]rz/i, "riesling"],
  [/merlot/i, "merlot"],
  [/malbec/i, "malbec"],
  [/chianti|sangiovese/i, "chianti-sangiovese"],
  [/\bport\b/i, "port"],
  [/beaujolais|gamay/i, "beaujolais"],
  [/\bipa\b|pale ale/i, "ipa"],
  [/lager|pilsner/i, "lager-pilsner"],
  [/stout|porter/i, "stout-porter"],
  [/wheat beer|hefeweizen|witbier/i, "wheat-beer"],
  [/belgian|saison|dubbel|tripel|trappist/i, "belgian-ale"],
  [/cider/i, "hard-cider"]
];
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const key = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const slugify = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
const builderPreset = (items, guests, campaign) =>
  `/board-builder/?b=${items.join(",")}&g=${guests}&m=app&utm_source=charcuterielab&utm_medium=site&utm_campaign=${campaign}`;

function pairsTable(body = "") {
  const m = body.match(/## What it pairs with[^\n]*\n([\s\S]*?)(?=\n## |\n\*\*Skip|$)/);
  if (!m) return [];
  return m[1]
    .split("\n")
    .filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l) && !/Pair it with/i.test(l))
    .map((l) => l.split("|").slice(1, -1).map((c) => c.replace(/\*\*/g, "").trim()))
    .filter((c) => c.length >= 2 && c[0] && c[1])
    .map(([label, why]) => ({ label, why }));
}

// ------------------------------------------------------------------ index ---
export function pairingsIndex(data, ingredients, { blogSlugs = new Set() } = {}) {
  const bySlug = new Map(ingredients.map((i) => [i.slug, i]));
  const graph = new Map(ingredients.map((i) => [i.slug, new Set()]));
  for (const i of ingredients) {
    for (const p of i.pairsWith) {
      if (!graph.has(p)) continue;
      graph.get(i.slug).add(p);
      graph.get(p).add(i.slug);
    }
  }
  // drinks, flattened
  const drinks = [];
  for (const w of data.drinks.wines) drinks.push({ ...w, url: `/pairings/wine/${w.slug}/`, familyLabel: "Wine" });
  for (const b of data.drinks.beers) drinks.push({ ...b, url: `/pairings/beer/${b.slug}/`, familyLabel: b.slug === "hard-cider" ? "Cider" : "Beer" });
  const drinkBySlug = new Map(drinks.map((d) => [d.slug, d]));
  // cocktail and zero-proof items act as drinks too (anchored on their page)
  const extras = [];
  for (const fam of ["cocktails", "zero"]) {
    const page = data.drinks[fam];
    for (const it of page.items) {
      extras.push({ slug: `${fam}-${slugify(it.name)}`, name: it.name, family: fam, familyLabel: FAMILY[fam].label, url: `${FAMILY[fam].base}#${slugify(it.name)}`, color: page.color, matches: it.pairs.map((s) => ({ s, why: it.why, rule: "" })) });
    }
  }
  // food -> drinks
  const drinksFor = new Map();
  const addDrink = (food, d, why, rule = "") => {
    if (!bySlug.has(food)) return;
    const list = drinksFor.get(food) || [];
    if (!list.some((x) => x.d.slug === d.slug)) list.push({ d, why, rule });
    drinksFor.set(food, list);
  };
  for (const d of [...drinks, ...extras]) for (const m of d.matches) addDrink(m.s, d, m.why, m.rule);

  // reasons, from each ingredient's own "why" table
  const matchers = ingredients.map((i) => {
    const t = i.title.toLowerCase().replace(/[()]/g, "");
    const forms = new Set([t, t.replace(/s$/, ""), t.replace(/es$/, "")]);
    return { slug: i.slug, re: new RegExp(`\\b(${[...forms].filter((f) => f.length > 2).map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "i") };
  });
  const reasons = new Map();
  for (const i of ingredients) {
    for (const row of pairsTable(i.body)) {
      for (const mt of matchers) {
        if (mt.slug === i.slug || !graph.get(i.slug).has(mt.slug)) continue;
        if (mt.re.test(row.label) && !reasons.has(key(i.slug, mt.slug))) reasons.set(key(i.slug, mt.slug), row.why);
      }
      for (const [re, ds] of DRINK_WORDS) {
        if (re.test(row.label)) addDrink(i.slug, drinkBySlug.get(ds), row.why);
      }
    }
  }
  for (const d of drinks) for (const m of d.matches) reasons.set(key(`drink:${d.slug}`, m.s), m.why);

  const foods = data.foods.map((f) => ({ ...f, item: bySlug.get(f.slug), url: `/pairings/food/${f.slug}/` }));
  const foodPage = new Map(foods.map((f) => [f.slug, f]));
  const combos = COMBO_KINDS.flatMap((k) => data.combos[k.key].map((c) => ({ ...c, kind: k.key, kindLabel: k.label, id: c.foods.join("-") })));
  // combos explain their own pairs when an ingredient page doesn't
  for (const c of combos)
    for (let i = 0; i < c.foods.length; i++)
      for (let j = i + 1; j < c.foods.length; j++)
        if (!reasons.has(key(c.foods[i], c.foods[j]))) reasons.set(key(c.foods[i], c.foods[j]), c.why);
  const rules = data.rules.map((r) => ({ ...r, post: r.posts.find((p) => blogSlugs.has(p)) || "" }));
  const ruleById = new Map(rules.map((r) => [r.id, r]));

  const idx = { data, bySlug, graph, drinks, extras, drinkBySlug, drinksFor, reasons, foods, foodPage, combos, rules, ruleById, blogSlugs };
  validate(idx);
  return idx;
}

function validate(idx) {
  const errors = [];
  for (const d of idx.drinks) {
    if (d.matches.length < 6) errors.push(`${d.slug}: needs at least 6 matches`);
    if (words(d.answer) > 40) errors.push(`${d.slug}: answer is ${words(d.answer)} words (max 40)`);
    for (const m of [...d.matches, ...d.avoid]) if (!idx.bySlug.has(m.s)) errors.push(`${d.slug}: unknown ingredient ${m.s}`);
    for (const m of d.matches) if (!idx.ruleById.has(m.rule)) errors.push(`${d.slug}: unknown rule ${m.rule}`);
  }
  for (const x of idx.extras) for (const m of x.matches) if (!idx.bySlug.has(m.s)) errors.push(`${x.name}: unknown ingredient ${m.s}`);
  for (const f of idx.foods) {
    if (!f.item) { errors.push(`food page ${f.slug}: no ingredient page`); continue; }
    if (idx.graph.get(f.slug).size < 6) errors.push(`food page ${f.slug}: fewer than 6 pairings`);
    if (words(f.answer) > 40) errors.push(`food page ${f.slug}: answer is ${words(f.answer)} words`);
    for (const t of f.top) if (!idx.graph.get(f.slug).has(t)) errors.push(`food page ${f.slug}: top pick ${t} is not in its pairings`);
  }
  for (const c of idx.combos) {
    for (const s of c.foods) if (!idx.bySlug.has(s)) errors.push(`combo ${c.id}: unknown ingredient ${s}`);
    for (let i = 0; i < c.foods.length; i++)
      for (let j = i + 1; j < c.foods.length; j++)
        if (idx.bySlug.has(c.foods[i]) && !idx.graph.get(c.foods[i]).has(c.foods[j])) errors.push(`combo ${c.id}: ${c.foods[i]} and ${c.foods[j]} are not paired in the ingredient data`);
    if (!idx.ruleById.has(c.rule)) errors.push(`combo ${c.id}: unknown rule ${c.rule}`);
  }
  if (errors.length) throw new Error(`Pairings data check failed:\n  ${errors.join("\n  ")}`);
}

// Everything the Finder needs, as compact arrays.
export function pairingsClientData(idx, categoryArt, categories) {
  const items = [...idx.bySlug.values()];
  const pos = new Map(items.map((it, n) => [it.slug, n]));
  const cats = categories.filter((c) => items.some((i) => i.category === c));
  const drinks = [...idx.drinks, ...idx.extras];
  const dpos = new Map(drinks.map((d, n) => [d.slug, n]));
  const reasons = {};
  for (const [k, v] of idx.reasons) {
    const [a, b] = k.split("|");
    const code = (s) => (s.startsWith("drink:") ? `d${dpos.get(s.slice(6))}` : pos.has(s) ? `${pos.get(s)}` : null);
    const ca = code(a), cb = code(b);
    if (ca != null && cb != null && !ca.includes("undefined") && !cb.includes("undefined")) reasons[[ca, cb].sort().join("-")] = v;
  }
  return JSON.stringify({
    c: cats.map((c) => ({ n: c, t: categoryArt(c).tint, g: categoryArt(c).glyph })),
    i: items.map((it) => [it.slug, it.title, cats.indexOf(it.category), it.image || "", [...idx.graph.get(it.slug)].map((s) => pos.get(s)), it.avoidWith.filter((s) => pos.has(s)).map((s) => pos.get(s)), idx.foodPage.has(it.slug) ? 1 : 0, it.boardRole || ""]),
    d: drinks.map((d) => [d.slug, d.name, d.familyLabel, d.url, d.color, d.matches.map((m) => pos.get(m.s)).filter((x) => x != null), d.matches.map((m) => m.why), d.family]),
    df: Object.fromEntries([...idx.drinksFor].map(([s, list]) => [pos.get(s), list.map((x) => dpos.get(x.d.slug)).filter((x) => x != null)])),
    r: reasons,
    k: idx.combos.map((c) => [c.foods.map((s) => pos.get(s)), c.name, c.why, c.kind]),
    top: Object.fromEntries(idx.foods.map((f) => [pos.get(f.slug), f.top.map((s) => pos.get(s))]))
  });
}

// ------------------------------------------------------------- snippets ---
function thumb(h, item, art, size = "") {
  if (!item) return "";
  const a = art(item.category);
  return item.image
    ? `<span class="pr-thumb${size}" style="--t:${a.tint}"><img src="${h.escapeHtml(item.image)}" alt="${h.escapeHtml(item.title)}" loading="lazy" decoding="async"></span>`
    : `<span class="pr-thumb${size} pr-thumb-art" style="--t:${a.tint}" role="img" aria-label="${h.escapeHtml(item.title)}">${a.glyph}</span>`;
}

function photoRow(h, idx, art, slugs, big = false) {
  return `<span class="pr-row${big ? " pr-row-big" : ""}">${slugs.map((s) => thumb(h, idx.bySlug.get(s), art, big ? " pr-thumb-big" : "")).join('<span class="pr-plus" aria-hidden="true">+</span>')}</span>`;
}

const ingLink = (h, idx, s) => {
  const it = idx.bySlug.get(s);
  return it ? `<a href="/ingredients/${s}/">${h.escapeHtml(it.title)}</a>` : h.escapeHtml(s);
};
const pairLink = (h, idx, s) => {
  const it = idx.bySlug.get(s);
  if (!it) return h.escapeHtml(s);
  return idx.foodPage.has(s) ? `<a href="/pairings/food/${s}/">${h.escapeHtml(it.title)}</a>` : `<a href="/ingredients/${s}/">${h.escapeHtml(it.title)}</a>`;
};

function profileDots(d) {
  const p = d.profile || {};
  const rows = d.family === "beer"
    ? [["Body", p.body], ["Bitterness", p.bitter], ["Bubbles", p.carb], ["Sweetness", p.sweet]]
    : [["Body", p.body], ["Tannin", p.tannin], ["Acidity", p.acid], ["Sweetness", p.sweet]];
  return `<dl class="pr-profile">${rows
    .filter(([, v]) => v)
    .map(([l, v]) => `<div><dt>${l}</dt><dd aria-label="${v} out of 5">${[1, 2, 3, 4, 5].map((n) => `<i class="${n <= v ? "on" : ""}"></i>`).join("")}</dd></div>`)
    .join("")}</dl>`;
}

function comboCard(h, idx, art, c) {
  const post = c.post && idx.blogSlugs.has(c.post) ? c.post : "";
  const rule = idx.ruleById.get(c.rule);
  return `<li class="pr-combo" data-kind="${c.kind}" data-search="${h.escapeHtml([c.name, ...c.foods.map((s) => idx.bySlug.get(s)?.title || s)].join(" ").toLowerCase())}">
    ${photoRow(h, idx, art, c.foods)}
    <p class="pr-combo-kind">${h.escapeHtml(c.kindLabel.replace(/s$/, ""))}${rule ? ` · ${h.escapeHtml(rule.name)}` : ""}</p>
    <h3>${h.escapeHtml(c.name)}</h3>
    <p>${h.escapeHtml(c.why)}</p>
    <p class="pr-combo-items">${c.foods.map((s) => pairLink(h, idx, s)).join(" + ")}</p>
    <p class="pr-combo-links"><a class="pr-more" href="${builderPreset(c.foods, 6, `pairings_combo_${c.id}`)}">Build a board with this &rarr;</a>${post ? ` <a class="pr-more" href="/blog/${post}/">Why it works</a>` : ""}</p>
  </li>`;
}

function faqHtml(h, faq, id = "faq") {
  return `<div class="ebook-faq-list" id="${id}-list">
        ${faq.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${h.escapeHtml(f.q)}</summary><p>${h.escapeHtml(f.a)}</p></details>`).join("\n        ")}
      </div>`;
}

function schema(h, { name, url, description, crumbs, faq, list }) {
  const out = [
    { "@context": "https://schema.org", "@type": "Article", headline: name, description, url: h.absoluteUrl(url), dateModified: UPDATED, datePublished: UPDATED, author: { "@type": "Organization", name: "Charcuterie Lab" }, publisher: { "@type": "Organization", name: "Charcuterie Lab" } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map(([n, u], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: h.absoluteUrl(u) })) }
  ];
  if (faq?.length) out.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
  if (list?.length) out.push({ "@context": "https://schema.org", "@type": "ItemList", itemListElement: list.map(([n, u], i) => ({ "@type": "ListItem", position: i + 1, name: n, ...(u ? { url: h.absoluteUrl(u) } : {}) })) });
  return out.map((s) => `  <script type="application/ld+json">${h.jsonForScript(s)}</script>`).join("\n");
}

function crumbHtml(h, crumbs) {
  return `<p class="ing-crumb">${crumbs
    .map(([n, u], i) => (i === crumbs.length - 1 ? h.escapeHtml(n) : `<a href="${u}">${h.escapeHtml(n)}</a>`))
    .join(' <span aria-hidden="true">/</span> ')}</p>`;
}

function hubNav(current) {
  const links = [["/pairings/", "Finder"], ["/pairings/wine/", "Wine"], ["/pairings/beer/", "Beer & Cider"], ["/pairings/cocktails/", "Cocktails"], ["/pairings/zero-proof/", "Zero-Proof"], ["/pairings/food/", "Food"], ["/pairings/classics/", "Pairs & Trios"], ["/pairings/wine-and-cheese-chart/", "Chart"], ["/pairings/how-pairing-works/", "The Rules"]];
  return `<nav class="pr-subnav" aria-label="Pairings sections">${links.map(([u, l]) => `<a href="${u}"${u === current ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav>`;
}

function page(h, { url, title, description, crumbs, faq = [], list = [], name, body, script = "", image = "" }) {
  return h.layout({
    title,
    description,
    canonical: url,
    image: image || "/images/book-cover.jpg",
    head: schema(h, { name: name || title, url, description, crumbs, faq, list }),
    body: `<main class="bl-main pr-main">
  <div class="bl-inner pr-inner">
    ${crumbHtml(h, crumbs)}
    ${hubNav(url)}
${body}
  </div>
${h.newsletterPanel("pr-email", `pairings_${slugify(url) || "hub"}`)}
</main>
${script}`
  });
}

// ------------------------------------------------------------------ pages ---
export function pairingPages(h, idx, { categoryArt, categories, boardsUsing, boardsBySlug, scriptSrc, dataSrc, photos = new Set() }) {
  // Drink photos are optional: drop <name>.webp|jpg|png into public/images/pairings/
  // and the page switches from its colour card to the photo on the next build.
  const photo = (name) => {
    const f = ["webp", "jpg", "jpeg", "png"].map((e) => `${name}.${e}`).find((x) => photos.has(x));
    return f ? `/images/pairings/${f}` : "";
  };
  const heroImg = (name, alt) => {
    const src = photo(name);
    return src ? `<img class="pr-hero-img" src="${src}" alt="${h.escapeHtml(alt)}" width="1200" height="800" fetchpriority="high">` : "";
  };
  const art = categoryArt;
  const out = [];
  const add = (path, html) => out.push({ path, html });
  const script = `<script type="module" src="${scriptSrc}" data-src="${dataSrc}"></script>`;
  const B = h.escapeHtml;
  const wines = idx.drinks.filter((d) => d.family === "wine");
  const beers = idx.drinks.filter((d) => d.family === "beer");
  const featured = (kind) => idx.combos.filter((c) => c.kind === kind && c.featured).slice(0, 4);
  const boardsFor = (slugs, n = 3) => {
    const score = new Map();
    for (const s of slugs) for (const b of boardsUsing.get(s) || []) score.set(b.slug, (score.get(b.slug) || 0) + 1);
    return [...score].filter(([, v]) => v >= 2).sort((a, b) => b[1] - a[1]).slice(0, n).map(([s]) => boardsBySlug.get(s)).filter(Boolean);
  };
  const boardList = (bs) => (bs.length ? `<ul class="pr-boards">${bs.map((b) => `<li><a href="/boards/${b.slug}/"><img src="${B(b.image)}" alt="" width="600" height="400" loading="lazy" decoding="async"><span>${B(b.h1 || b.title)}</span></a></li>`).join("")}</ul>` : "");

  // ------------------------------------------------------------ the hub ---
  const hubFaq = [
    { q: "What are the basic rules of charcuterie pairing?", a: "Balance fat with acid or tannin, pair salty with sweet, match light foods with light drinks and bold with bold, and put foods from the same region together." },
    { q: "What drink goes with a charcuterie board?", a: "Sparkling wine is the most versatile, followed by dry rosé and Pinot Noir. For beer, choose a lager or dry cider; without alcohol, sparkling apple cider." },
    { q: "What fruit goes with charcuterie?", a: "Grapes, pears, apples, figs and melon. Juicy, sweet fruit balances salty meat and rich cheese." },
    { q: "What cheese goes with prosciutto?", a: "Burrata, Parmigiano-Reggiano, fresh mozzarella and mild creamy cheeses. Prosciutto's silky salt suits milky or nutty cheese." },
    { q: "How many pairings should a board have?", a: "Aim for every cheese to have one sweet partner and one crunchy one, and every meat to have one acidic or briny partner." },
    { q: "Do I need wine for a charcuterie board?", a: "No. Tea, sparkling cider, kombucha and sparkling water with citrus follow the same pairing rules as wine." }
  ];
  const upcoming = HOLIDAY_CALENDAR.filter((x) => ["halloween", "thanksgiving", "christmas", "new-years-eve", "super-bowl", "st-patricks-day", "valentines-day"].includes(x.slug));
  const drinksForHoliday = (slug) => idx.drinks.filter((d) => (d.holidays || []).includes(slug));
  add("pairings/index.html", page(h, {
    url: "/pairings/",
    title: "Charcuterie Pairing Guide: Wine, Beer & Food Pairings",
    name: "Charcuterie Pairings: Find What Goes With Anything",
    description: "Find what goes with any cheese, meat, wine or beer. An interactive pairing finder for 325 ingredients and 20 drinks, plus the six rules that explain why pairings work.",
    crumbs: [["Pairings", "/pairings/"]],
    image: photo("pairings-hero"),
    faq: hubFaq,
    list: [...wines.map((w) => [`${w.name} pairings`, w.url]), ...idx.foods.map((f) => [`What goes with ${f.item.title}`, f.url])],
    script,
    body: `
    <header class="pr-hero${photo("pairings-hero") ? " pr-hero-photo" : ""}">
      <div>
      <p class="section-kicker">The Pairings Hub</p>
      <h1>Find what goes with anything on your board</h1>
      <p class="pr-answer">The best charcuterie pairings balance <strong>fat with acid</strong>, <strong>salt with sweet</strong> and <strong>soft with crunchy</strong>. Search any of ${idx.bySlug.size} ingredients or ${idx.drinks.length} drinks to see what goes with it and why.</p>
      </div>
      ${heroImg("pairings-hero", "A charcuterie board with red, white and sparkling wine")}
    </header>

    <section class="pr-finder" id="finder" aria-label="Pairing finder">
      <div class="pr-tabs" role="tablist">
        <button type="button" role="tab" class="pr-tab" aria-selected="true" data-mode="find">What goes with…</button>
        <button type="button" role="tab" class="pr-tab" aria-selected="false" data-mode="check">Do these go together?</button>
      </div>
      <div class="pr-search">
        <label class="sr-only" for="pr-q">Search a cheese, meat, fruit, wine or beer</label>
        <input id="pr-q" type="search" autocomplete="off" placeholder="Try brie, prosciutto, Pinot Noir, IPA…" aria-autocomplete="list" aria-controls="pr-suggest" aria-expanded="false">
        <ul id="pr-suggest" class="pr-suggest" role="listbox" hidden></ul>
      </div>
      <div class="pr-starters" id="pr-starters">
        <span>Popular:</span>
        ${["brie", "prosciutto-di-parma", "manchego", "aged-cheddar", "gorgonzola", "fig-jam"].map((s) => `<button type="button" class="pr-chip" data-pick="${s}">${B(idx.bySlug.get(s)?.title || s)}</button>`).join("")}
        ${["pinot-noir", "champagne-prosecco", "ipa"].map((s) => `<button type="button" class="pr-chip pr-chip-drink" data-pick="drink:${s}">${B(idx.drinkBySlug.get(s).name)}</button>`).join("")}
        <button type="button" class="pr-chip pr-chip-surprise" data-surprise>Surprise me</button>
      </div>
      <div id="pr-result" class="pr-result" aria-live="polite">
        <noscript><p>The finder needs JavaScript. Browse <a href="/pairings/food/">food pairings</a> or <a href="/pairings/wine/">wine pairings</a> instead.</p></noscript>
      </div>
    </section>

    <section class="bl-section" aria-labelledby="drinks-h">
      <h2 id="drinks-h">Start with your drink</h2>
      <ul class="pr-tiles">
        ${[["wine", "Wine", `${wines.length} styles, from Champagne to port`, "#7a2432"], ["beer", "Beer & Cider", `${beers.length} styles, from lager to stout`, "#c9772b"], ["cocktails", "Cocktails & Spirits", "Martinis, spritzes, bourbon, sherry", "#b5651d"], ["zero-proof", "Zero-Proof", "Tea, cider, kombucha and spritzes", "#6aa37a"]].map(([u, t, s, c]) => `<li><a href="/pairings/${u}/" style="--t:${c}"><strong>${t}</strong><span>${s}</span></a></li>`).join("")}
      </ul>
      <p class="pr-chips">${wines.map((w) => `<a class="pr-chip" href="${w.url}"><i style="background:${w.color}"></i>${B(w.name)}</a>`).join("")}${beers.map((w) => `<a class="pr-chip" href="${w.url}"><i style="background:${w.color}"></i>${B(w.name)}</a>`).join("")}</p>
    </section>

    <section class="bl-section" aria-labelledby="food-h">
      <h2 id="food-h">Start with your food</h2>
      <ul class="pr-foodgrid">
        ${idx.foods.slice(0, 12).map((f) => `<li><a href="${f.url}">${thumb(h, f.item, art)}<span>What goes with <strong>${B(f.item.title)}</strong></span></a></li>`).join("")}
      </ul>
      <p><a class="pr-more" href="/pairings/food/">All ${idx.foods.length} food pairing guides &rarr;</a></p>
    </section>

    <section class="bl-section" aria-labelledby="combos-h">
      <h2 id="combos-h">Pairs, Trios &amp; Quartets</h2>
      <p class="bl-note">The most popular and most interesting combinations, each one tested against our ingredient data. Tap one to build a board around it.</p>
      ${COMBO_KINDS.map((k) => `<h3 class="pr-kind">${k.label} <span>${k.blurb}</span></h3>
      <ul class="pr-combos">
${featured(k.key).map((c) => comboCard(h, idx, art, c)).join("\n")}
      </ul>`).join("\n      ")}
      <p><a class="button" href="/pairings/classics/">See all ${idx.combos.length} combinations</a></p>
    </section>

    <section class="bl-section" id="rules" aria-labelledby="rules-h">
      <h2 id="rules-h">The six rules behind every pairing</h2>
      <ol class="pr-rules">
        ${idx.rules.map((r, n) => `<li id="rule-${r.id}"><span class="pr-rule-n">${n + 1}</span><h3>${B(r.name)}</h3><p>${B(r.line)}</p><a class="pr-more" href="/pairings/how-pairing-works/#${r.id}">Examples &rarr;</a></li>`).join("\n        ")}
      </ol>
    </section>

    <section class="bl-section pr-season" aria-labelledby="season-h" hidden>
      <h2 id="season-h">What to pour for <span data-season-name></span></h2>
      ${upcoming.map((x) => {
        const ds = drinksForHoliday(x.slug);
        if (!ds.length) return "";
        return `<div class="pr-season-card" data-dates='${JSON.stringify(x.dates)}' data-name="${B(x.name)}" hidden>
        <ul class="pr-chips">${ds.map((d) => `<li><a class="pr-chip" href="${d.url}"><i style="background:${d.color}"></i>${B(d.name)}</a></li>`).join("")}</ul>
        ${["halloween", "thanksgiving", "christmas"].includes(x.slug) ? `<p><a class="pr-more" href="/holidays/${x.slug}/">The full ${B(x.name)} board plan &rarr;</a></p>` : ""}
      </div>`;
      }).join("\n      ")}
    </section>

    <section class="bl-section pr-chart-teaser" aria-labelledby="chart-h">
      <div>
        <h2 id="chart-h">The wine and cheese pairing chart</h2>
        <p>Twelve wines, thirty cheeses, one chart. Tap a wine to see its cheeses, or print it for the fridge.</p>
        <a class="button primary" href="/pairings/wine-and-cheese-chart/">Open the chart</a>
      </div>
    </section>

    ${h.bookBar("pairings_hub", "Every board in the book comes with its pairing science")}

    <section class="bl-section" id="faq" aria-labelledby="faq-h">
      <h2 id="faq-h">Pairing questions</h2>
      ${faqHtml(h, hubFaq)}
    </section>`
  }));

  // ------------------------------------------------------- drink pages ---
  const drinkPage = (d) => {
    const matches = d.matches.map((m) => ({ ...m, item: idx.bySlug.get(m.s) }));
    const top = matches.slice(0, 3);
    const cheeses = matches.filter((m) => m.item.category === "Cheese");
    const title = `${d.name} ${d.family === "wine" ? "and Cheese" : "Pairings"}: ${matches.length} Best Matches`;
    const similar = idx.drinks
      .filter((x) => x.slug !== d.slug)
      .map((x) => [x, x.matches.filter((m) => d.matches.some((y) => y.s === m.s)).length])
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([x]) => x);
    const fam = d.family === "wine" ? ["Wine", "/pairings/wine/"] : ["Beer & Cider", "/pairings/beer/"];
    const boards = boardsFor(d.matches.map((m) => m.s));
    const rulesUsed = [...new Set(d.matches.map((m) => m.rule))].map((r) => idx.ruleById.get(r)).filter(Boolean);
    return page(h, {
      url: d.url,
      title: title.length > 60 ? `${d.name} Pairings: ${matches.length} Best Matches` : title,
      name: `${d.name} pairings`,
      description: d.answer,
      crumbs: [["Pairings", "/pairings/"], fam, [d.name, d.url]],
      image: photo(`pairings-${d.family}-${d.slug}`),
      faq: d.faq,
      list: matches.map((m) => [m.item.title, `/ingredients/${m.s}/`]),
      script,
      body: `
    <header class="pr-drink-hero" style="--d:${d.color}">
      ${photo(`pairings-${d.family}-${d.slug}`) ? `<img class="pr-drink-photo" src="${photo(`pairings-${d.family}-${d.slug}`)}" alt="A glass of ${B(d.name)} with ${B(top[0].item.title)}" width="800" height="1000" fetchpriority="high">` : `<div class="pr-drink-card" aria-hidden="true"><span class="pr-glass"></span><strong>${B(d.name)}</strong><span>${B(d.familyLabel)}</span></div>`}
      <div>
        <p class="section-kicker">${B(d.familyLabel)} pairing guide</p>
        <h1>${B(d.name)} pairings: cheese, charcuterie &amp; more</h1>
        <p class="pr-answer">${B(d.answer)}</p>
        ${profileDots(d)}
        <p class="pr-serve"><strong>Serve:</strong> ${B(d.serve)}</p>
      </div>
    </header>

    <section class="pr-top3" aria-label="Top picks">
      ${top.map((m, n) => `<a class="pr-pick" href="/ingredients/${m.s}/">${thumb(h, m.item, art, " pr-thumb-big")}<span class="pr-pick-n">#${n + 1}</span><strong>${B(m.item.title)}</strong><span>${B(m.why)}</span></a>`).join("")}
    </section>
    <p class="pr-intro">${B(d.intro)}</p>

    <section class="bl-section" aria-labelledby="best-h">
      <h2 id="best-h">The best pairings for ${B(d.name)}</h2>
      <table class="pr-table">
        <thead><tr><th>Pair it with</th><th>Why it works</th><th>Rule</th></tr></thead>
        <tbody>
        ${matches.map((m) => `<tr><td>${thumb(h, m.item, art, " pr-thumb-sm")}${pairLink(h, idx, m.s)}<span class="pr-cat">${B(m.item.category)}</span></td><td>${B(m.why)}</td><td><a href="/pairings/how-pairing-works/#${m.rule}">${B(idx.ruleById.get(m.rule)?.name || "")}</a></td></tr>`).join("\n        ")}
        </tbody>
      </table>
      <p class="bl-cta-row"><a class="button primary" href="${builderPreset(d.matches.slice(0, 8).map((m) => m.s), 6, `pairings_${d.slug}`)}">Build a board for this bottle</a> <a class="button" href="/pairings/?q=drink:${d.slug}">Open in the Pairing Finder</a></p>
    </section>

    <section class="bl-section pr-two" aria-label="Skip and swap">
      <div>
        <h2>Skip these with ${B(d.name)}</h2>
        <ul class="pr-avoid">${d.avoid.map((m) => `<li><strong>${ingLink(h, idx, m.s)}</strong> ${B(m.why)}</li>`).join("")}</ul>
      </div>
      <div>
        <h2>Budget swap</h2>
        <p>${B(d.swap)}</p>
        ${cheeses.length ? `<p class="bl-note">Cheeses on this page: ${cheeses.map((m) => pairLink(h, idx, m.s)).join(", ")}.</p>` : ""}
      </div>
    </section>

    ${boards.length ? `<section class="bl-section" aria-labelledby="boards-h"><h2 id="boards-h">Boards to pour ${B(d.name)} with</h2>${boardList(boards)}</section>` : ""}

    <section class="bl-section" aria-labelledby="why-h">
      <h2 id="why-h">Why these work</h2>
      <ul class="pr-rulelinks">${rulesUsed.map((r) => `<li><a href="/pairings/how-pairing-works/#${r.id}"><strong>${B(r.name)}</strong></a> ${B(r.line)}</li>`).join("")}</ul>
      ${similar.length ? `<p class="bl-note">Similar bottles: ${similar.map((x) => `<a href="${x.url}">${B(x.name)}</a>`).join(" · ")}</p>` : ""}
      ${(d.holidays || []).filter((x) => ["halloween", "thanksgiving", "christmas"].includes(x)).map((x) => `<p class="bl-note">Planning ${B(HOLIDAY_CALENDAR.find((c) => c.slug === x)?.name || x)}? <a href="/holidays/${x}/">See the full board plan</a>.</p>`).join("")}
    </section>

    <section class="bl-section" id="faq" aria-labelledby="faq-h">
      <h2 id="faq-h">${B(d.name)} pairing questions</h2>
      ${faqHtml(h, d.faq)}
    </section>
    ${h.bookBar(`pairings_${d.slug}`, "50 boards, each with a drink pairing")}`
    });
  };
  for (const d of idx.drinks) add(`${d.url.slice(1)}index.html`, drinkPage(d));

  // ---------------------------------------------------- family landings ---
  const familyLanding = (fam, list, { url, title, h1, answer, intro, faq, img }) => page(h, {
    url, title, name: h1, description: answer, crumbs: [["Pairings", "/pairings/"], [fam, url]], faq, script, image: photo(img),
    list: list.map((d) => [`${d.name} pairings`, d.url]),
    body: `
    <header class="pr-hero${photo(img) ? " pr-hero-photo" : ""}">
      <div>
      <p class="section-kicker">${B(fam)} pairings</p>
      <h1>${B(h1)}</h1>
      <p class="pr-answer">${B(answer)}</p>
      <p>${B(intro)}</p>
      </div>
      ${heroImg(img, `${fam} with cheese`)}
    </header>
    <div class="pr-filter" role="group" aria-label="Filter">
      <button type="button" class="pr-chip" aria-pressed="true" data-dfilter="all">All</button>
      ${list[0].family === "wine" ? `<button type="button" class="pr-chip" aria-pressed="false" data-dfilter="light">Light &amp; fresh</button><button type="button" class="pr-chip" aria-pressed="false" data-dfilter="bold">Rich &amp; bold</button><button type="button" class="pr-chip" aria-pressed="false" data-dfilter="sweet">Sweet</button>` : `<button type="button" class="pr-chip" aria-pressed="false" data-dfilter="light">Light &amp; crisp</button><button type="button" class="pr-chip" aria-pressed="false" data-dfilter="bold">Dark &amp; strong</button>`}
    </div>
    <ul class="pr-drinks">
      ${list.map((d) => `<li data-body="${d.profile.body}" data-sweet="${d.profile.sweet}" style="--d:${d.color}"><a href="${d.url}">
        <span class="pr-drink-swatch" aria-hidden="true"></span>
        <strong>${B(d.name)}</strong>
        ${profileDots(d)}
        <span class="pr-drink-best">Best with ${d.matches.slice(0, 3).map((m) => B(idx.bySlug.get(m.s).title)).join(", ")}</span>
      </a></li>`).join("\n      ")}
    </ul>
    <section class="bl-section" aria-labelledby="quick-h">
      <h2 id="quick-h">Quick answer table</h2>
      <table class="pr-table">
        <thead><tr><th>${B(fam)}</th><th>Best cheeses</th><th>Best meats &amp; extras</th></tr></thead>
        <tbody>
        ${list.map((d) => `<tr><td><a href="${d.url}"><strong>${B(d.name)}</strong></a></td><td>${d.matches.filter((m) => idx.bySlug.get(m.s).category === "Cheese").slice(0, 3).map((m) => pairLink(h, idx, m.s)).join(", ")}</td><td>${d.matches.filter((m) => idx.bySlug.get(m.s).category !== "Cheese").slice(0, 3).map((m) => pairLink(h, idx, m.s)).join(", ")}</td></tr>`).join("\n        ")}
        </tbody>
      </table>
    </section>
    <section class="bl-section" id="faq" aria-labelledby="faq-h"><h2 id="faq-h">Questions</h2>${faqHtml(h, faq)}</section>`
  });
  add("pairings/wine/index.html", familyLanding("Wine", wines, {
    url: "/pairings/wine/",
    img: "pairings-wine",
    title: "Wine and Cheese Pairing Guide: 12 Wines, Best Matches",
    h1: "Wine and cheese pairings, wine by wine",
    answer: "The easiest wines for a cheese board are Champagne, dry rosé and Pinot Noir. Match light wines with fresh, soft cheeses and bold reds with hard, aged cheeses; sweet port belongs with blue cheese.",
    intro: "Pick your bottle to see the cheeses, meats and extras that suit it, and the ones to skip.",
    faq: [
      { q: "What is the best all-round wine for a cheese board?", a: "Dry sparkling wine. Its acid and bubbles suit soft, hard and salty cheeses and cured meats alike." },
      { q: "Red or white wine with cheese?", a: "More cheeses pair well with whites and sparkling wine than with big reds. Choose light reds like Pinot Noir or Beaujolais for mixed boards." },
      { q: "What wine goes with blue cheese?", a: "Sweet wines: port, Sauternes or late-harvest Riesling. Salt and sweetness balance each other." }
    ]
  }));
  add("pairings/beer/index.html", familyLanding("Beer & Cider", beers, {
    url: "/pairings/beer/",
    img: "pairings-beer",
    title: "Beer and Cheese Pairing Guide: 6 Styles, Best Matches",
    h1: "Beer, cider and cheese pairings",
    answer: "Beer pairs with cheese as well as wine does. Crisp lager suits mild cheese and pretzels, IPA suits sharp cheddar and spicy salami, stout suits blue cheese and chocolate, and dry cider suits brie and cheddar.",
    intro: "Carbonation scrubs fat, malt matches nutty and caramel flavors, and hops cut through rich cheese.",
    faq: [
      { q: "What beer goes best with cheese?", a: "Belgian ales and dry cider are the most cheese-friendly. IPA is best with sharp cheddar; stout with blue cheese." },
      { q: "What beer goes with a charcuterie board?", a: "A crisp lager or pilsner for mixed boards; IPA for spicy salami; stout for a dessert board." },
      { q: "Is cider good with cheese?", a: "Dry cider is one of the best drinks for cheese, especially cheddar, brie and Camembert." }
    ]
  }));

  const itemPage = (fam, pageData, url, title, img) => page(h, {
    url, title, name: pageData.name, description: pageData.answer, crumbs: [["Pairings", "/pairings/"], [pageData.name, url]], faq: pageData.faq, script, image: photo(img),
    list: pageData.items.map((it) => [it.name, `${url}#${slugify(it.name)}`]),
    body: `
    <header class="pr-hero${photo(img) ? " pr-hero-photo" : ""}">
      <div>
      <p class="section-kicker">${B(FAMILY[fam].label)}</p>
      <h1>${B(pageData.name)} for charcuterie boards</h1>
      <p class="pr-answer">${B(pageData.answer)}</p>
      <p>${B(pageData.intro)}</p>
      </div>
      ${heroImg(img, pageData.name)}
    </header>
    <ul class="pr-items">
      ${pageData.items.map((it) => `<li id="${slugify(it.name)}">
        <h2>${B(it.name)}</h2>
        <p>${B(it.why)}</p>
        ${photoRow(h, idx, art, it.pairs.slice(0, 5))}
        <p class="pr-combo-items">${it.pairs.map((s) => pairLink(h, idx, s)).join(" · ")}</p>
        <a class="pr-more" href="${builderPreset(it.pairs, 6, `pairings_${fam}_${slugify(it.name)}`)}">Build this board &rarr;</a>
      </li>`).join("\n      ")}
    </ul>
    ${fam === "zero" ? `<p class="bl-note">Every drink on this page follows the same rules as wine: <a href="/pairings/how-pairing-works/#acid">acid</a>, <a href="/pairings/how-pairing-works/#texture">bubbles</a> and <a href="/pairings/how-pairing-works/#fat-tannin">tannin</a>.</p>` : `<p class="bl-note">Please drink responsibly. Looking for alcohol-free options? See <a href="/pairings/zero-proof/">zero-proof pairings</a>.</p>`}
    <section class="bl-section" id="faq" aria-labelledby="faq-h"><h2 id="faq-h">Questions</h2>${faqHtml(h, pageData.faq)}</section>`
  });
  add("pairings/cocktails/index.html", itemPage("cocktails", idx.data.drinks.cocktails, "/pairings/cocktails/", "Cocktails for a Charcuterie Board: 8 Drinks & Pairings", "pairings-cocktails"));
  add("pairings/zero-proof/index.html", itemPage("zero", idx.data.drinks.zero, "/pairings/zero-proof/", "Non-Alcoholic Drinks for Charcuterie: 7 Pairings", "pairings-zero-proof"));

  add("pairings/drinks/index.html", page(h, {
    url: "/pairings/drinks/",
    title: "Drink Pairings for Charcuterie: Wine, Beer, Cocktails",
    name: "Drink pairings for charcuterie",
    description: "Every drink we pair with charcuterie: 12 wines, 5 beers, dry cider, 8 cocktails and 7 zero-proof drinks, with the cheeses and meats that suit each one.",
    crumbs: [["Pairings", "/pairings/"], ["Drinks", "/pairings/drinks/"]],
    script,
    body: `
    <header class="pr-hero">
      <p class="section-kicker">Drinks</p>
      <h1>What to drink with charcuterie</h1>
      <p class="pr-answer">For most boards, pour dry sparkling wine, dry rosé or Pinot Noir. Beer drinkers: lager or dry cider. Without alcohol: sparkling apple cider or unsweetened black iced tea.</p>
    </header>
    <ul class="pr-tiles">
      ${[["wine", "Wine", wines], ["beer", "Beer & Cider", beers]].map(([u, t, list]) => `<li><a href="/pairings/${u}/" style="--t:${list[0].color}"><strong>${t}</strong><span>${list.map((d) => B(d.name)).join(" · ")}</span></a></li>`).join("")}
      <li><a href="/pairings/cocktails/" style="--t:#b5651d"><strong>Cocktails &amp; Spirits</strong><span>${idx.data.drinks.cocktails.items.map((i) => B(i.name)).join(" · ")}</span></a></li>
      <li><a href="/pairings/zero-proof/" style="--t:#6aa37a"><strong>Zero-Proof</strong><span>${idx.data.drinks.zero.items.map((i) => B(i.name)).join(" · ")}</span></a></li>
    </ul>`
  }));

  // -------------------------------------------------------- food pages ---
  const foodCats = categories.filter((c) => [...idx.bySlug.values()].some((i) => i.category === c));
  const foodPageHtml = (f) => {
    const it = f.item;
    const all = [...idx.graph.get(f.slug)].map((s) => idx.bySlug.get(s)).filter(Boolean);
    const withWhy = all.filter((p) => idx.reasons.has(key(f.slug, p.slug)) && !f.top.includes(p.slug));
    const tableRows = [...f.top.map((s) => idx.bySlug.get(s)), ...withWhy].slice(0, 12);
    const drinks = (idx.drinksFor.get(f.slug) || []);
    const combos = idx.combos.filter((c) => c.foods.includes(f.slug));
    const boards = (boardsUsing.get(f.slug) || []).slice(0, 3);
    const title = `What Goes With ${it.title}? ${all.length} Pairings & Drinks`;
    return page(h, {
      url: f.url,
      title: title.length > 60 ? `What Goes With ${it.title}? Best Pairings` : title,
      name: `What goes with ${it.title}`,
      description: f.answer,
      crumbs: [["Pairings", "/pairings/"], ["Food", "/pairings/food/"], [it.title, f.url]],
      faq: f.faq,
      list: tableRows.map((p) => [p.title, `/ingredients/${p.slug}/`]),
      script,
      body: `
    <header class="pr-food-hero">
      ${photoRow(h, idx, art, [f.slug, ...f.top], true)}
      <p class="section-kicker">${B(it.category)} pairing guide</p>
      <h1>What goes with ${B(it.title)}?</h1>
      <p class="pr-answer">${B(f.answer)}</p>
      <p class="bl-cta-row"><a class="button primary" href="${builderPreset([f.slug, ...f.top, ...withWhy.slice(0, 3).map((p) => p.slug)], 6, `pairings_food_${f.slug}`)}">Build a board around ${B(it.title)}</a> <a class="button" href="/ingredients/${f.slug}/">Everything about ${B(it.title)}</a></p>
    </header>

    <section class="bl-section" aria-labelledby="best-h">
      <h2 id="best-h">The best pairings for ${B(it.title)}, and why</h2>
      <table class="pr-table">
        <thead><tr><th>Pair it with</th><th>Why it works</th></tr></thead>
        <tbody>
        ${tableRows.map((p) => `<tr><td>${thumb(h, p, art, " pr-thumb-sm")}${pairLink(h, idx, p.slug)}<span class="pr-cat">${B(p.category)}</span></td><td>${B(idx.reasons.get(key(f.slug, p.slug)) || `${p.boardRole ? `${p.boardRole}. ` : ""}A proven match on our ${it.title} page.`)}</td></tr>`).join("\n        ")}
        </tbody>
      </table>
    </section>

    ${drinks.length ? `<section class="bl-section" aria-labelledby="drinks-h">
      <h2 id="drinks-h">Drinks that go with ${B(it.title)}</h2>
      <ul class="pr-drinklist">${drinks.map((x) => `<li style="--d:${x.d.color}"><a href="${x.d.url}"><span class="pr-drink-swatch" aria-hidden="true"></span><strong>${B(x.d.name)}</strong><span>${B(x.why)}</span></a></li>`).join("")}</ul>
    </section>` : ""}

    <section class="bl-section" aria-labelledby="all-h">
      <h2 id="all-h">Everything that goes with ${B(it.title)} (${all.length})</h2>
      <div class="pr-filter" role="group" aria-label="Filter by category">
        <button type="button" class="pr-chip" aria-pressed="true" data-cfilter="all">All</button>
        ${foodCats.filter((c) => all.some((p) => p.category === c)).map((c) => `<button type="button" class="pr-chip" aria-pressed="false" data-cfilter="${slugify(c)}">${B(c)} (${all.filter((p) => p.category === c).length})</button>`).join("")}
      </div>
      <ul class="pr-grid">
        ${all.sort((a, b) => foodCats.indexOf(a.category) - foodCats.indexOf(b.category) || a.title.localeCompare(b.title)).map((p) => `<li data-cat="${slugify(p.category)}"><a href="${idx.foodPage.has(p.slug) ? `/pairings/food/${p.slug}/` : `/ingredients/${p.slug}/`}">${thumb(h, p, art)}<span>${B(p.title)}</span></a></li>`).join("\n        ")}
      </ul>
    </section>

    ${it.avoidWith.length ? `<section class="bl-section" aria-labelledby="skip-h"><h2 id="skip-h">Skip these with ${B(it.title)}</h2><p>${it.avoidWith.map((s) => ingLink(h, idx, s)).join(" · ")}</p></section>` : ""}

    ${combos.length ? `<section class="bl-section" aria-labelledby="combo-h"><h2 id="combo-h">Combinations with ${B(it.title)}</h2><ul class="pr-combos">${combos.map((c) => comboCard(h, idx, art, c)).join("\n")}</ul></section>` : ""}

    ${boards.length ? `<section class="bl-section" aria-labelledby="boards-h"><h2 id="boards-h">Boards that use ${B(it.title)}</h2>${boardList(boards)}</section>` : ""}

    <section class="bl-section" id="faq" aria-labelledby="faq-h">
      <h2 id="faq-h">${B(it.title)} pairing questions</h2>
      ${faqHtml(h, f.faq)}
    </section>
    ${h.bookBar(`pairings_food_${f.slug}`, `Put ${it.title.toLowerCase()} on a full board`)}`
    });
  };
  for (const f of idx.foods) add(`pairings/food/${f.slug}/index.html`, foodPageHtml(f));

  add("pairings/food/index.html", page(h, {
    url: "/pairings/food/",
    title: "Food Pairings for Charcuterie: What Goes With What",
    name: "Food pairings for charcuterie",
    description: `What goes with brie, prosciutto, Manchego and ${idx.foods.length - 3} more favorites, plus a finder for all ${idx.bySlug.size} ingredients.`,
    crumbs: [["Pairings", "/pairings/"], ["Food", "/pairings/food/"]],
    list: idx.foods.map((f) => [`What goes with ${f.item.title}`, f.url]),
    script,
    body: `
    <header class="pr-hero">
      <p class="section-kicker">Food pairings</p>
      <h1>What goes with what on a charcuterie board</h1>
      <p class="pr-answer">Give every cheese a sweet partner and a crunchy one, and every cured meat something acidic or briny. Start with the guides below, or search any of ${idx.bySlug.size} ingredients in the <a href="/pairings/#finder">Pairing Finder</a>.</p>
    </header>
    ${foodCats.filter((c) => idx.foods.some((f) => f.item.category === c)).map((c) => `<section class="bl-section" aria-label="${B(c)}">
      <h2>${B(c)}</h2>
      <ul class="pr-foodgrid">${idx.foods.filter((f) => f.item.category === c).map((f) => `<li><a href="${f.url}">${thumb(h, f.item, art)}<span>What goes with <strong>${B(f.item.title)}</strong></span><em>${f.top.map((s) => B(idx.bySlug.get(s).title)).join(", ")}</em></a></li>`).join("")}</ul>
    </section>`).join("\n    ")}`
  }));

  // ------------------------------------------------------------ classics ---
  add("pairings/classics/index.html", page(h, {
    url: "/pairings/classics/",
    title: "Best Charcuterie Combinations: Pairs, Trios & Quartets",
    name: "Pairs, trios and quartets",
    description: `${idx.combos.length} charcuterie combinations that work, from brie and fig jam to the Spanish Four, with why each works and a board to build around it.`,
    crumbs: [["Pairings", "/pairings/"], ["Pairs & Trios", "/pairings/classics/"]],
    list: idx.combos.map((c) => [c.name]),
    script,
    body: `
    <header class="pr-hero">
      <p class="section-kicker">Combinations</p>
      <h1>The best charcuterie combinations: pairs, trios &amp; quartets</h1>
      <p class="pr-answer">The best-loved charcuterie combinations are brie with fig jam, prosciutto with melon, Manchego with membrillo, and aged cheddar with apple. Add walnuts, honey or a pickle to turn a pair into a trio.</p>
    </header>
    <div class="pr-filter" role="group" aria-label="Show">
      <button type="button" class="pr-chip" aria-pressed="true" data-kfilter="all">All (${idx.combos.length})</button>
      ${COMBO_KINDS.map((k) => `<button type="button" class="pr-chip" aria-pressed="false" data-kfilter="${k.key}">${k.label} (${idx.combos.filter((c) => c.kind === k.key).length})</button>`).join("")}
      <label class="sr-only" for="pr-kq">Search combinations</label><input id="pr-kq" class="pr-kq" type="search" placeholder="Search: honey, prosciutto…">
    </div>
    ${COMBO_KINDS.map((k) => `<section class="bl-section" data-kind-section="${k.key}" aria-labelledby="k-${k.key}">
      <h2 id="k-${k.key}">${k.label}</h2>
      <p class="bl-note">${k.blurb}</p>
      <ul class="pr-combos">
${idx.combos.filter((c) => c.kind === k.key).map((c) => comboCard(h, idx, art, c)).join("\n")}
      </ul>
    </section>`).join("\n    ")}
    <p class="bl-note">Want to test your own? Use <a href="/pairings/?check=brie,fig-jam">Do these go together?</a> in the Pairing Finder.</p>`
  }));

  // ------------------------------------------------------------- rules ---
  add("pairings/how-pairing-works/index.html", page(h, {
    url: "/pairings/how-pairing-works/",
    title: "How Food and Wine Pairing Works: The 6 Rules",
    name: "How pairing works: the six rules",
    description: "Six rules explain almost every good pairing: fat tames tannin, acid cuts richness, salt loves sweet, match the weight, what grows together goes together, and contrast the texture.",
    crumbs: [["Pairings", "/pairings/"], ["The Rules", "/pairings/how-pairing-works/"]],
    list: idx.rules.map((r) => [r.name, `/pairings/how-pairing-works/#${r.id}`]),
    script,
    body: `
    <header class="pr-hero">
      <p class="section-kicker">The science</p>
      <h1>How pairing works: the six rules</h1>
      <p class="pr-answer">Good pairings balance opposites or echo similar flavors. Six rules cover almost all of it: fat tames tannin, acid cuts richness, salt loves sweet, match the weight, what grows together goes together, and contrast the texture.</p>
    </header>
    ${idx.rules.map((r, n) => {
      const drinkEx = idx.drinks.flatMap((d) => d.matches.filter((m) => m.rule === r.id).map((m) => ({ d, m }))).slice(0, 6);
      const comboEx = idx.combos.filter((c) => c.rule === r.id).slice(0, 3);
      return `<section class="bl-section pr-rule" id="${r.id}" aria-labelledby="${r.id}-h">
      <h2 id="${r.id}-h"><span class="pr-rule-n">${n + 1}</span> ${B(r.name)}</h2>
      <p>${B(r.line)}</p>
      ${drinkEx.length ? `<ul class="pr-examples">${drinkEx.map(({ d, m }) => `<li><a href="${d.url}">${B(d.name)}</a> + ${pairLink(h, idx, m.s)}: ${B(m.why)}</li>`).join("")}</ul>` : ""}
      ${comboEx.length ? `<ul class="pr-combos pr-combos-sm">${comboEx.map((c) => comboCard(h, idx, art, c)).join("\n")}</ul>` : ""}
      ${r.post ? `<p><a class="pr-more" href="/blog/${r.post}/">Read the full science &rarr;</a></p>` : ""}
    </section>`;
    }).join("\n    ")}`
  }));

  // ------------------------------------------------------------- chart ---
  const chartCheeses = [...new Set(wines.flatMap((w) => w.matches.map((m) => m.s)))].map((s) => idx.bySlug.get(s)).filter((i) => i.category === "Cheese").sort((a, b) => a.title.localeCompare(b.title));
  const beerCols = beers;
  add("pairings/wine-and-cheese-chart/index.html", page(h, {
    url: "/pairings/wine-and-cheese-chart/",
    title: "Wine and Cheese Pairing Chart (Printable)",
    name: "Wine and cheese pairing chart",
    description: `A wine and cheese pairing chart for ${wines.length} wines and ${chartCheeses.length} cheeses. Tap a wine or a cheese to see its matches, or print it.`,
    crumbs: [["Pairings", "/pairings/"], ["Chart", "/pairings/wine-and-cheese-chart/"]],
    image: photo("pairings-chart"),
    list: wines.map((w) => [`${w.name} pairings`, w.url]),
    script,
    body: `
    <header class="pr-hero">
      <p class="section-kicker">Printable chart</p>
      <h1>Wine and cheese pairing chart</h1>
      <p class="pr-answer">The safest matches: Champagne with brie, Sauvignon Blanc with goat cheese, Pinot Noir with Gruyère, Cabernet with aged cheddar, Chianti with Parmigiano and port with Stilton.</p>
      <p class="pr-chart-tools"><button type="button" class="button primary" data-print>Print the chart</button> <label><input type="checkbox" data-beer> Add beer &amp; cider columns</label></p>
    </header>
    <div class="pr-chart-wrap">
      <table class="pr-chart" id="pr-chart">
        <caption class="sr-only">Wine and cheese pairing chart: a dot marks a recommended pairing</caption>
        <thead><tr><th scope="col">Cheese</th>${wines.map((w) => `<th scope="col" data-col="${w.slug}" style="--d:${w.color}"><a href="${w.url}"><span>${B(w.name)}</span></a></th>`).join("")}${beerCols.map((w) => `<th scope="col" class="pr-beer" data-col="${w.slug}" style="--d:${w.color}"><a href="${w.url}"><span>${B(w.name)}</span></a></th>`).join("")}</tr></thead>
        <tbody>
        ${chartCheeses.map((c) => `<tr data-row="${c.slug}"><th scope="row">${pairLink(h, idx, c.slug)}</th>${[...wines, ...beerCols].map((w) => {
          const m = w.matches.find((x) => x.s === c.slug);
          return `<td class="${w.family === "beer" ? "pr-beer" : ""}" data-col="${w.slug}">${m ? `<span class="pr-dot" style="--d:${w.color}" title="${B(m.why)}" aria-label="Yes: ${B(m.why)}"></span>` : ""}</td>`;
        }).join("")}</tr>`).join("\n        ")}
        </tbody>
      </table>
    </div>
    <p class="bl-note">Tap a wine or a cheese to highlight its matches. Hover a dot to read why, or open the wine's page for the full reasons.</p>
    <section class="bl-section" aria-labelledby="how-h">
      <h2 id="how-h">How to read it</h2>
      <p>Light, fresh cheeses sit best with crisp whites and sparkling wine; nutty, firm cheeses with light reds and Chardonnay; hard, aged cheeses with bigger reds; blue cheese with sweet port. The <a href="/pairings/how-pairing-works/">six pairing rules</a> explain why.</p>
    </section>`
  }));

  return out;
}

// Block for each ingredient page: drinks that match + link to the full guide.
export function ingredientPairingBlock(h, idx, item) {
  if (!idx) return "";
  const drinks = (idx.drinksFor.get(item.slug) || []).filter((x) => x.d.family === "wine" || x.d.family === "beer").slice(0, 6);
  const full = idx.foodPage.has(item.slug) ? `/pairings/food/${item.slug}/` : `/pairings/?q=${item.slug}`;
  return `<section class="ing-related pr-ing">
      <h2>Drinks that match</h2>
      ${drinks.length ? `<ul class="pr-drinklist pr-drinklist-sm">${drinks.map((x) => `<li style="--d:${x.d.color}"><a href="${x.d.url}"><span class="pr-drink-swatch" aria-hidden="true"></span><strong>${h.escapeHtml(x.d.name)}</strong><span>${h.escapeHtml(x.why)}</span></a></li>`).join("")}</ul>` : `<p class="ing-related-note">No drink guide lists ${h.escapeHtml(item.title.toLowerCase())} yet. Dry sparkling wine is the safest bet with almost anything on a board.</p>`}
      <p><a class="pr-more" href="${full}">See every pairing for ${h.escapeHtml(item.title.toLowerCase())}, with the reasons &rarr;</a></p>
    </section>`;
}

// "What to pour" block for holiday pages.
export function holidayPourBlock(h, idx, holidaySlug) {
  if (!idx) return "";
  const ds = idx.drinks.filter((d) => (d.holidays || []).includes(holidaySlug));
  if (!ds.length) return "";
  return `<section class="bl-section" id="pour" aria-labelledby="pour-h">
      <h2 id="pour-h">What to pour</h2>
      <ul class="pr-drinklist">${ds.map((d) => `<li style="--d:${d.color}"><a href="${d.url}"><span class="pr-drink-swatch" aria-hidden="true"></span><strong>${h.escapeHtml(d.name)}</strong><span>Best with ${d.matches.slice(0, 3).map((m) => h.escapeHtml(idx.bySlug.get(m.s).title)).join(", ")}</span></a></li>`).join("")}</ul>
      <p class="bl-note">No alcohol? See <a href="/pairings/zero-proof/">zero-proof pairings</a>. More in the <a href="/pairings/">Pairings Hub</a>.</p>
    </section>`;
}

export function pairingUrls(idx) {
  if (!idx) return [];
  return [
    { loc: "/pairings/", priority: "0.9" },
    ...["drinks", "wine", "beer", "cocktails", "zero-proof", "food", "classics", "how-pairing-works", "wine-and-cheese-chart"].map((s) => ({ loc: `/pairings/${s}/`, lastmod: UPDATED, priority: "0.8" })),
    ...idx.drinks.map((d) => ({ loc: d.url, lastmod: UPDATED, priority: "0.8" })),
    ...idx.foods.map((f) => ({ loc: f.url, lastmod: UPDATED, priority: "0.8" }))
  ];
}
