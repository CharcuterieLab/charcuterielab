// Pairings Hub: /pairings/ plus drink, food, combo, rules and chart pages.
//
// Content lives in content/pairings/:
//   drinks.json  - 12 wines, 6 beers, cocktails, zero-proof (source: make_drinks.py)
//   foods.json   - editorial layer for the 25 "What goes with X" pages (make_foods.py)
//   combos.json  - Perfect Pairs, Trios, Quartets, Perfect Plates and Ladders (edit the JSON; make_combos.py is stale since 15 Nov 2026)
//   rules.json   - the six pairing rules
// Everything else comes from the ingredient pages: pairs_with, avoid_with and the
// "What it pairs with - and why" table. The build refuses to run if the data
// disagrees with itself (see validate()).
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { HOLIDAY_CALENDAR } from "./holidays.mjs";
import { pickFits } from "./boards.mjs";

// The bottle to buy for a drink page, from the Best Buys wine guides (8 Nov 2026).
// Names and prices are copied from those posts; update them together.
const BOTTLES = {
  "champagne-prosecco": [
    ["Segura Viudas Brut Reserva Cava", "about $11", "/blog/best-wine-for-charcuterie-board/#pick-1", "Best sparkling under $20"],
    ["Mionetto Prosecco Brut", "", "/blog/best-prosecco/", "Best prosecco"],
    ["Kirkland Signature Champagne Brut", "$20 at Costco", "/blog/best-champagne-under-30/", "Real Champagne for less"]
  ],
  "sauvignon-blanc": [["Kim Crawford Sauvignon Blanc", "about $14", "/blog/best-wine-for-charcuterie-board/#pick-2", "Best white under $20"]],
  rose: [["Bieler Père & Fils Sabine Rosé", "", "/blog/best-wine-for-charcuterie-board/#pick-3", "Best rosé under $20"]],
  "pinot-noir": [["Mark West California Pinot Noir", "about $11", "/blog/best-wine-for-charcuterie-board/#pick-4", "Best light red under $20"]],
  riesling: [["Dr. Loosen Dr. L Riesling", "about $15", "/blog/best-wine-for-charcuterie-board/#pick-7", "Best off-dry under $20"]],
  port: [
    ["Graham's Six Grapes Reserve Port", "about $27, less at Costco", "/blog/best-port-wine/", "Ruby port for Stilton"],
    ["Kirkland 10 Year Tawny", "$17 at Costco", "/blog/best-port-wine/", "Tawny for aged Gouda and nuts"]
  ]
};
// Titles matched to how people search for drink pairings ("rosé cheese pairing
// ideas", "port and cheese"). drinks.json seo_title still wins.
const DRINK_TITLE = {
  rose: "Rosé Cheese Pairing: 11 Ideas + What to Skip",
  port: "Port and Cheese Pairing: Stilton First + 10 More",
  "champagne-prosecco": "Champagne & Prosecco Cheese Pairing: 11 Best Matches"
};

const UPDATED = "2026-09-24";

export async function loadPairings(root) {
  const dir = join(root, "content", "pairings");
  try {
    const read = async (f) => JSON.parse(await readFile(join(dir, f), "utf8"));
    const [drinks, foods, combos, rules] = await Promise.all(["drinks.json", "foods.json", "combos.json", "rules.json"].map(read));
    // per-ingredient diet verdicts for the Combination Lab badges (optional)
    const diets = await readFile(join(root, "content", "dietary", "ingredient-diets.json"), "utf8").then(JSON.parse, () => ({}));
    // meat x cheese families for /pairings/meat-and-cheese-chart/ (optional)
    const mc = await read("meat-cheese.json").catch(() => null);
    return { drinks, foods, combos, rules, diets, mc };
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
  for (const s of data.drinks.spirits || []) drinks.push({ ...s, url: `/pairings/spirits/${s.slug}/`, familyLabel: "Spirits" });
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
  const explainedBy = new Set(); // "a>b": a's own page explains why b goes with it
  for (const i of ingredients) {
    for (const row of pairsTable(i.body)) {
      for (const mt of matchers) {
        if (mt.slug === i.slug || !graph.get(i.slug).has(mt.slug)) continue;
        if (mt.re.test(row.label)) explainedBy.add(`${i.slug}>${mt.slug}`);
        if (mt.re.test(row.label) && !reasons.has(key(i.slug, mt.slug))) reasons.set(key(i.slug, mt.slug), row.why);
      }
      for (const [re, ds] of DRINK_WORDS) {
        if (re.test(row.label)) addDrink(i.slug, drinkBySlug.get(ds), row.why);
      }
    }
  }
  for (const d of drinks) for (const m of d.matches) reasons.set(key(`drink:${d.slug}`, m.s), m.why);

  // foods.json display_name (13 Nov 2026) renames the food on its own guide, e.g. "Gouda" for the ingredient titled "Gouda (Young)".
  const foods = data.foods.map((f) => ({ ...f, item: f.display_name && bySlug.get(f.slug) ? { ...bySlug.get(f.slug), title: f.display_name } : bySlug.get(f.slug), url: `/pairings/food/${f.slug}/` }));
  const foodPage = new Map(foods.map((f) => [f.slug, f]));
  const combos = COMBO_KINDS.flatMap((k) => data.combos[k.key].map((c) => ({ ...c, kind: k.key, kindLabel: k.label, id: c.foods.join("-") })));
  // two-food combos explain their own pair when an ingredient page doesn't
  // (15 Nov 2026: pairs only, since a trio's line talks about all three foods)
  for (const c of combos.filter((x) => x.kind === "pairs"))
    for (let i = 0; i < c.foods.length; i++)
      for (let j = i + 1; j < c.foods.length; j++)
        if (!reasons.has(key(c.foods[i], c.foods[j]))) reasons.set(key(c.foods[i], c.foods[j]), c.why);
  const rules = data.rules.map((r) => ({ ...r, post: r.posts.find((p) => blogSlugs.has(p)) || "" }));
  const ruleById = new Map(rules.map((r) => [r.id, r]));

  // Perfect Plates (five foods) and ladders (pair -> trio -> quartet -> plate), 15 Nov 2026
  const plates = (data.combos.plates || []).map((c) => ({ ...c, kind: "plates", kindLabel: "Perfect Plates" }));
  const ladders = data.combos.ladders || [];
  const idx = { data, bySlug, graph, drinks, extras, drinkBySlug, drinksFor, reasons, explainedBy, foods, foodPage, combos, plates, ladders, rules, ruleById, blogSlugs };
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
  for (const c of idx.plates) {
    for (const s of c.foods) if (!idx.bySlug.has(s)) errors.push(`plate ${c.id}: unknown ingredient ${s}`);
    for (const s of c.foods) if (idx.bySlug.has(s) && c.foods.filter((o) => o !== s && idx.graph.get(s).has(o)).length < 2) errors.push(`plate ${c.id}: ${s} pairs with fewer than 2 of the other foods`);
    if (!idx.ruleById.has(c.rule)) errors.push(`plate ${c.id}: unknown rule ${c.rule}`);
  }
  const ids = new Set([...idx.combos.map((c) => c.id), ...idx.plates.map((c) => `plate:${c.id}`)]);
  for (const l of idx.ladders) for (const s of [...l.steps, ...(l.branches || []).flatMap((b) => [b.id, b.from])]) if (!ids.has(s)) errors.push(`ladder ${l.name}: unknown step ${s}`);
  for (const c of [...idx.combos, ...idx.plates]) if (c.drink && !idx.drinkBySlug.has(c.drink)) errors.push(`combo ${c.id}: unknown drink ${c.drink}`);
  mcValidate(idx, errors);
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
    if (ca != null && cb != null && !ca.includes("undefined") && !cb.includes("undefined")) reasons[[ca, cb].sort().join("-")] = v.replace(/\*\*?([^*]+)\*\*?/g, "$1");
  }
  return JSON.stringify({
    c: cats.map((c) => ({ n: c, t: categoryArt(c).tint, g: categoryArt(c).glyph })),
    i: items.map((it) => [it.slug, it.title, cats.indexOf(it.category), it.image || "", [...idx.graph.get(it.slug)].map((s) => pos.get(s)), it.avoidWith.filter((s) => pos.has(s)).map((s) => pos.get(s)), idx.foodPage.has(it.slug) ? 1 : 0, it.boardRole || ""]),
    d: drinks.map((d) => [d.slug, d.name, d.familyLabel, d.url, d.color, d.matches.map((m) => pos.get(m.s)).filter((x) => x != null), d.matches.map((m) => m.why), d.family]),
    df: Object.fromEntries([...idx.drinksFor].map(([s, list]) => [pos.get(s), list.map((x) => dpos.get(x.d.slug)).filter((x) => x != null)])),
    r: reasons,
    // [foods, name, why, kind, Combination Lab card id]; plates included (15 Nov 2026)
    k: [...idx.combos, ...idx.plates].map((c) => [c.foods.map((s) => pos.get(s)), c.name, c.why, c.kind, labId(c), [c.drink, c.beer, c.zero && `zero-${slugify(c.zero)}`].map((x) => (x ? dpos.get(x) : null)).filter((x) => x != null)]),
    top: Object.fromEntries(idx.foods.map((f) => [pos.get(f.slug), f.top.map((s) => pos.get(s))]))
  });
}

// ------------------------------------------------------------- snippets ---
function thumb(h, item, art, size = "") {
  if (!item) return "";
  const a = art(item.category);
  return item.image
    ? `<span class="pr-thumb${size}" style="--t:${a.tint}"><img src="${h.escapeHtml(h.thumb ? h.thumb(item.image, "s") : item.image)}" alt="${h.escapeHtml(item.title)}"${h.imageSize ? h.imageSize(h.thumb ? h.thumb(item.image, "s") : item.image) : ""} loading="lazy" decoding="async"></span>`
    : `<span class="pr-thumb${size} pr-thumb-art" style="--t:${a.tint}" role="img" aria-label="${h.escapeHtml(item.title)}">${a.glyph}</span>`;
}

// "Skip these with X" (15 Nov 2026): avoid_with holds ingredient slugs or
// group words like "delicate-fresh-cheese" (the board builder's GROUPS). The
// guides printed the group words raw; now each group reads as words with up to
// three examples, leaving out anything this food is listed as pairing with
// (pepperoni's "delicate fresh cheeses other than mozzarella").
const SKIP_GROUPS = {
  "delicate-fresh-cheese": ["Delicate fresh cheese", (i) => i.category === "Cheese" && i.roleGroup === "Soft & fresh"],
  "delicate-bloomy-cheese": ["Delicate bloomy-rind cheese", (i) => i.category === "Cheese" && /brie|camembert|triple|coulommiers/.test(i.slug)],
  "mild-brie": ["Mild brie", (i) => i.category === "Cheese" && /brie/.test(i.slug)],
  "blue-cheese": ["Blue cheese", (i) => i.category === "Cheese" && i.roleGroup === "Blue"],
  "smoked-cheese": ["Smoked cheese", (i) => i.category === "Cheese" && (/smoked/.test(i.slug) || (i.tags || []).includes("smoked"))],
  "aged-hard-cheese": ["Aged hard cheese", (i) => i.category === "Cheese" && i.roleGroup === "Aged & hard"],
  "dry-aged-cheese": ["Dry aged cheese", (i) => i.category === "Cheese" && i.roleGroup === "Aged & hard"],
  "strong-aged-cheese": ["Strong aged cheese", (i) => i.category === "Cheese" && i.roleGroup === "Aged & hard"],
  "delicate-aged-cheese": ["Delicate aged cheese", (i) => i.category === "Cheese" && i.roleGroup === "Aged & hard"],
  "cured-meat": ["Cured meat", (i) => i.category === "Cured Meat & Seafood" && i.roleGroup !== "Smoked & tinned fish"],
  "strong-cured-meat": ["Strong cured meat", (i) => i.category === "Cured Meat & Seafood" && (i.roleGroup === "Salami" || i.roleGroup === "Spreadable")],
  "smoked-fish": ["Smoked fish", (i) => i.category === "Cured Meat & Seafood" && i.roleGroup === "Smoked & tinned fish"]
};
// clear examples first: the "Soft & fresh" role group also holds brie and camembert
const SKIP_EXAMPLES = {
  "delicate-fresh-cheese": ["burrata", "ricotta", "fresh-chevre", "fresh-mozzarella", "stracciatella", "mascarpone", "feta"],
  "delicate-bloomy-cheese": ["brie", "camembert", "triple-creme"],
  "blue-cheese": ["gorgonzola", "stilton", "roquefort"],
  "smoked-cheese": ["smoked-gouda", "idiazabal", "smoked-mozzarella"],
  "cured-meat": ["prosciutto-di-parma", "genoa-salami", "soppressata", "chorizo"],
  "strong-cured-meat": ["soppressata", "pepperoni", "nduja", "chorizo"],
  "smoked-fish": ["smoked-salmon", "smoked-trout"],
  "aged-hard-cheese": ["parmigiano-reggiano", "aged-cheddar", "manchego"]
};
function skipList(h, idx, slug, avoid) {
  const B = (t) => h.escapeHtml(t);
  const partners = idx.graph.get(slug) || new Set();
  const items = avoid.map((s) => {
    if (idx.bySlug.has(s)) return `<li>${pairLink(h, idx, s)}</li>`;
    const g = SKIP_GROUPS[s];
    const label = g ? g[0] : s.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
    const ok = (i) => i && i.slug !== slug && !partners.has(i.slug) && g[1](i);
    const pref = (SKIP_EXAMPLES[s] || SKIP_EXAMPLES[s.replace(/^(dry|strong|delicate)-aged/, "aged-hard")] || []).map((x) => idx.bySlug.get(x)).filter(ok);
    const eg = g ? [...pref, ...[...idx.bySlug.values()].filter((i) => ok(i) && !pref.includes(i)).sort((a, b) => (idx.foodPage.has(b.slug) ? 1 : 0) - (idx.foodPage.has(a.slug) ? 1 : 0) || a.title.localeCompare(b.title))].slice(0, 3) : [];
    return `<li><strong>${B(label)}</strong>${eg.length ? `, such as ${eg.map((i) => pairLink(h, idx, i.slug)).join(", ")}` : ""}</li>`;
  });
  return `<ul class="pr-skip">${items.join("")}</ul>`;
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
    : d.family === "spirits"
    ? [["Body", p.body], ["Smoke", p.smoke], ["Sweetness", p.sweet], ["Strength", p.heat]]
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
    <p class="pr-combo-why">${h.escapeHtml(c.why)}</p>
    <p class="pr-combo-items">${c.foods.map((s) => pairLink(h, idx, s)).join(" + ")}</p>
    <p class="pr-combo-links"><a class="pr-more" href="${builderPreset(c.foods, 6, `pairings_combo_${c.id}`)}">Build a board with this &rarr;</a>${post ? ` <a class="pr-more" href="/blog/${post}/">Why it works</a>` : ""}</p>
  </li>`;
}

function faqHtml(h, faq, id = "faq") {
  return `<div class="ebook-faq-list" id="${id}-list">
        ${faq.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${h.escapeHtml(f.q)}</summary><p>${h.escapeHtml(f.a)}</p></details>`).join("\n        ")}
      </div>`;
}

function schema(h, { name, url, description, crumbs, faq, list, updated = "" }) {
  const out = [
    { "@context": "https://schema.org", "@type": "Article", headline: name, description, url: h.absoluteUrl(url), dateModified: updated || UPDATED, datePublished: UPDATED, author: h.authorRef || { "@type": "Organization", name: "Charcuterie Lab" }, publisher: { "@type": "Organization", name: "Charcuterie Lab" } },
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
  const links = [["/pairings/", "Finder"], ["/pairings/wine/", "Wine"], ["/pairings/beer/", "Beer & Cider"], ["/pairings/cocktails/", "Cocktails"], ["/pairings/zero-proof/", "Zero-Proof"], ["/pairings/drinks/", "All Drinks"], ["/pairings/food/", "Food"], ["/pairings/classics/", "Combination Lab"], ["/pairings/wine-and-cheese-chart/", "Wine Chart"], ["/pairings/meat-and-cheese-chart/", "Meat & Cheese"], ["/pairings/how-pairing-works/", "The Rules"]];
  return `<nav class="pr-subnav" aria-label="Pairings sections">${links.map(([u, l]) => `<a href="${u}"${u === current ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav>`;
}

function page(h, { url, title, description, crumbs, faq = [], list = [], name, body, script = "", image = "", updated = "" }) {
  return h.layout({
    title,
    description,
    canonical: url,
    // 14 Nov 2026: 35 pairing pages were sharing the book cover as their
    // og:image, which told Google Images and every social share nothing.
    image: image || (url.startsWith("/pairings/food/") ? "/images/per-food-pairings.webp" : "/images/pairings-hub.webp"),
    head: schema(h, { name: name || title, url, description, crumbs, faq, list, updated }),
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
  const spirits = idx.drinks.filter((d) => d.family === "spirits");
  const featured = (kind, n = 4) => idx.combos.filter((c) => c.kind === kind && c.featured).slice(0, n);
  // hub picks for "Build it up" (15 Nov 2026): ladders that end in a plate
  const hubLadders = ["gorgonzola-honey", "manchego-membrillo", "summer-sausage-colby-jack"].map((id) => idx.ladders.find((l) => l.id === id)).filter(Boolean);
  const hubPlates = ["spanish-plate", "italian-summer-plate", "holiday-brie-plate", "game-day-plate"];
  const boardsFor = (slugs, n = 3) => {
    const score = new Map();
    for (const s of slugs) for (const b of boardsUsing.get(s) || []) score.set(b.slug, (score.get(b.slug) || 0) + 1);
    return [...score].filter(([, v]) => v >= 2).sort((a, b) => b[1] - a[1]).slice(0, n).map(([s]) => boardsBySlug.get(s)).filter(Boolean);
  };
  const boardList = (bs) => (bs.length ? `<ul class="pr-boards">${bs.map((b) => `<li><a href="/boards/${b.slug}/"><img src="${B((h.thumb || ((x) => x))(b.image))}" alt="" width="600" height="400" loading="lazy" decoding="async"><span>${B(b.h1 || b.title)}</span></a></li>`).join("")}</ul>` : "");

  // ------------------------------------------------------------ the hub ---
  const hubFaq = [
    { q: "What are the basic rules of charcuterie pairing?", a: "Balance fat with acid or tannin, pair salty with sweet, match light foods with light drinks and bold with bold, and put foods from the same region together." },
    { q: "What drink goes with a charcuterie board?", a: "Sparkling wine is the most versatile, followed by dry rosé and Pinot Noir. For beer, choose a lager or dry cider; without alcohol, sparkling apple cider." },
    { q: "What fruit goes with charcuterie?", a: "Grapes, pears, apples, figs and melon. Juicy, sweet fruit balances salty meat and rich cheese." },
    { q: "What cheese goes with prosciutto?", a: "Burrata, Parmigiano-Reggiano, fresh mozzarella and mild creamy cheeses. Prosciutto's silky salt suits milky or nutty cheese. The meat and cheese pairing chart covers every cured meat." },
    { q: "What are the best charcuterie combinations?", a: "Brie with fig jam, prosciutto with melon, manchego with quince paste, aged cheddar with apple and gorgonzola with honey. Add walnuts, a pickle or a second cheese to turn a pair into a trio or a whole plate." },
    { q: "How many pairings should a board have?", a: "Aim for every cheese to have one sweet partner and one crunchy one, and every meat to have one acidic or briny partner." },
    { q: "Do I need wine for a charcuterie board?", a: "No. Tea, sparkling cider, kombucha and sparkling water with citrus follow the same pairing rules as wine." }
  ];
  const upcoming = HOLIDAY_CALENDAR.filter((x) => ["halloween", "thanksgiving", "christmas", "new-years-eve", "super-bowl", "st-patricks-day", "valentines-day"].includes(x.slug));
  const drinksForHoliday = (slug) => idx.drinks.filter((d) => (d.holidays || []).includes(slug));
  add("pairings/index.html", page(h, {
    url: "/pairings/",
    title: "Charcuterie Pairing Guide: Wine, Beer & Food Pairings",
    name: "Charcuterie Pairings: Find What Goes With Anything",
    description: "Find what goes with any cheese, meat, wine or beer. An interactive pairing finder for 375 ingredients and 20 drinks, plus the six rules that explain why pairings work.",
    crumbs: [["Pairings", "/pairings/"]],
    image: "/images/pairings-hub.webp",
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
        <button type="button" role="tab" class="pr-tab" aria-selected="false" data-mode="check">Check or complete a bite</button>
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

    <section class="bl-section hub-tools-sec" aria-labelledby="tools-h">
      <h2 id="tools-h" class="sr-only">Pairing tools</h2>
      <ul class="hub-tools">
        <li><a href="/pairings/classics/"><strong>Combination Lab</strong><span>${idx.combos.length + idx.plates.length} pairs, trios, quartets and plates, with ${idx.ladders.length} ladders, filters and print cards</span></a></li>
        ${idx.data.mc ? `<li><a href="/pairings/meat-and-cheese-chart/"><strong>Meat &amp; cheese chart</strong><span>Which cheese goes with prosciutto, salami, chorizo and more</span></a></li>` : ""}
        <li><a href="/pairings/wine-and-cheese-chart/"><strong>Wine &amp; cheese chart</strong><span>${wines.length} wines against every cheese, printable</span></a></li>
        <li><a href="/pairings/how-pairing-works/"><strong>The six rules</strong><span>Why any pairing works, with examples</span></a></li>
      </ul>
    </section>

    <section class="bl-section" aria-labelledby="drinks-h">
      <h2 id="drinks-h">Start with your drink</h2>
      <ul class="pr-tiles">
        ${[["wine", "Wine", `${wines.length} styles, from Champagne to port`, "#7a2432"], ["beer", "Beer & Cider", `${beers.length} styles, from lager to stout`, "#c9772b"], ["cocktails", "Cocktails & Spirits", "Martinis, spritzes, whisky, sherry", "#b5651d"], ["zero-proof", "Zero-Proof", "Tea, cider, kombucha and spritzes", "#c08a4a"]].map(([u, t, s, c]) => `<li><a href="/pairings/${u}/" style="--t:${c}"><strong>${t}</strong><span>${s}</span></a></li>`).join("")}
      </ul>
      <p class="pr-chips">${wines.map((w) => `<a class="pr-chip" href="${w.url}"><i style="background:${w.color}"></i>${B(w.name)}</a>`).join("")}${beers.map((w) => `<a class="pr-chip" href="${w.url}"><i style="background:${w.color}"></i>${B(w.name)}</a>`).join("")}${spirits.map((w) => `<a class="pr-chip" href="${w.url}"><i style="background:${w.color}"></i>${B(w.name)}</a>`).join("")}</p>
    </section>

    <section class="bl-section" aria-labelledby="food-h">
      <h2 id="food-h">Start with your food</h2>
      <ul class="pr-foodgrid">
        ${idx.foods.slice(0, 12).map((f) => `<li><a href="${f.url}">${thumb(h, f.item, art)}<span>What goes with <strong>${B(f.item.title)}</strong></span></a></li>`).join("")}
      </ul>
      <p><a class="pr-more" href="/pairings/food/">All ${idx.foods.length} food pairing guides &rarr;</a></p>
    </section>

    <section class="bl-section" aria-labelledby="combos-h">
      <h2 id="combos-h">Build it up: from a pair to a whole plate</h2>
      <p class="bl-note">Start with two foods that work, then add one at a time. Every step stays a tested match with everything before it. These are ${hubLadders.length} of our ${idx.ladders.length} ladders.</p>
      <ul class="lab-ladders">
${hubLadders.map((l) => ladderRow(h, idx, l, "/pairings/classics/")).join("\n")}
      </ul>
      <h3 class="pr-kind">Perfect Plates <span>Five foods on one plate, each one pairing with the others.</span></h3>
      <ul class="pr-combos">
${idx.plates.filter((c) => hubPlates.includes(c.id)).map((c) => comboCard(h, idx, art, c)).join("\n")}
      </ul>
      <h3 class="pr-kind">Perfect Pairs <span>Two foods that make each other better.</span></h3>
      <ul class="pr-combos">
${featured("pairs", 4).map((c) => comboCard(h, idx, art, c)).join("\n")}
      </ul>
      <p class="bl-cta-row"><a class="button primary" href="/pairings/classics/">Open the Combination Lab: all ${idx.combos.length + idx.plates.length} combinations</a> <a class="button" href="/pairings/?check=brie#finder" data-check-start>Build your own bite</a></p>
    </section>

    <section class="bl-section" id="rules" aria-labelledby="rules-h">
      <h2 id="rules-h">The six rules behind every pairing</h2>
      <ol class="pr-rules">
        ${idx.rules.map((r, n) => `<li id="rule-${r.id}"><span class="pr-rule-n">${n + 1}</span><h3>${B(r.name)}</h3><p>${B(r.line)}</p><a class="pr-more" href="/pairings/how-pairing-works/#${r.id}">Examples &rarr;</a> <a class="pr-more" href="/pairings/classics/?rule=${r.id}#lab-find">${[...idx.combos, ...idx.plates].filter((c) => c.rule === r.id).length} combinations &rarr;</a></li>`).join("\n        ")}
      </ol>
      <p class="bl-note">The numbers behind the rules: <a href="/blog/charcuterie-pairing-data-study/">we mapped 2,521 charcuterie pairings</a> to find what goes with everything.</p>
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

    <section class="bl-section" aria-labelledby="chart-h">
      <h2 id="chart-h">Printable pairing charts</h2>
      <ul class="hub-charts">
        ${idx.data.mc ? `<li><a href="/pairings/meat-and-cheese-chart/"><img src="/images/meat-and-cheese-chart.png" alt="Meat and cheese pairing chart: six cured meat families rated against seven cheese families" width="1200" height="646" loading="lazy"><strong>Meat and cheese pairing chart</strong><span>Which cheese goes with prosciutto, salami, pepperoni, chorizo, summer sausage, ham and bresaola, rated and explained.</span></a></li>` : ""}
        <li><a href="/pairings/wine-and-cheese-chart/">${photo("pairings-chart") ? `<img src="${photo("pairings-chart")}" alt="Wine and cheese pairing chart" loading="lazy">` : ""}<strong>Wine and cheese pairing chart</strong><span>${wines.length} wines, every cheese on our list. Tap a wine to see its cheeses, or print it for the fridge.</span></a></li>
      </ul>
    </section>

    ${h.bookBar("pairings_hub", "Every board in the book comes with its pairing science")}
    ${h.printCard ? h.printCard("pairing-card-deck", "pairings_hub_print") : ""}

    <section class="bl-section" id="faq" aria-labelledby="faq-h">
      <h2 id="faq-h">Pairing questions</h2>
      ${faqHtml(h, hubFaq)}
    </section>`
  }));

  // ------------------------------------------------------- drink pages ---
  const listWords = (a) => (a.length < 2 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);
  const lowerFirst = (t) => t.replace(/^./, (c) => c.toLowerCase());
  // A reason line comes from an ingredient page's own table, so it can carry
  // page-bound phrases ("the pairing", "the best bite on this page"). Keep the
  // sentences that explain the match, at most two.
  const QA_DROP = /this page|^the (canonical |great |definitive |classic |original )?(pairing|one|original)$|^the (bagel board|accessible version.*|elegant version|default)$|^(the original|why .* exist)$|^this is why/i;
  // hand-written answers may carry [text](/internal/) links
  // Quick answers read as short bullets (15 Nov 2026), not paragraphs. A
  // hand-written answer is a list of points; "Label: text" bolds the label.
  const mdLinks = (t) => h.escapeHtml(t).replace(/\[([^\]]+)\]\((\/[^)\s]*)\)/g, (_, a, u) => `<a href="${u}">${a}</a>`);
  const qaList = (rows) => `<ul class="pr-qa-list">${rows.filter(Boolean).map(([l, x]) => `<li class="pr-qa-li">${l ? `<b>${h.escapeHtml(l)}:</b> ` : ""}${x}</li>`).join("")}</ul>`;
  const splitLabel = (t) => { const m = String(t).match(/^([^:\[\]]{2,28}):\s+(.*)$/); return m ? [m[1], m[2]] : ["", String(t)]; };
  const qaHtml = (t) => (Array.isArray(t) ? qaList(t.map((x) => { const [l, r] = splitLabel(x); return [l, mdLinks(r)]; })) : `<p class="pr-qa-p">${mdLinks(t)}</p>`);
  const qaText = (t) => (Array.isArray(t) ? t.map((x) => String(x).replace(/[.]?$/, ".")).join(" ") : String(t)).replace(/\[([^\]]+)\]\((\/[^)\s]*)\)/g, "$1");
  const qaWhy = (t) => {
    const parts = String(t || "").split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean)
      .map((x) => x.replace(/[.!?]$/, "").split(/(?<=^[^:]{0,40}):\s+|\s+—\s+/).filter((y) => !QA_DROP.test(y.trim())).join(": "))
      .filter((x) => x && !QA_DROP.test(x));
    return parts.slice(0, 2).join(". ").replace(/^./, (c) => c.toUpperCase());
  };
  // Quick answers on drink guides (15 Nov 2026): "pinot noir cheese pairing",
  // "rosé cheese pairing ideas", "what cheese goes with sauvignon blanc".
  function drinkAnswers(d, matches) {
    const out = [];
    const cat = (m) => (m.item || idx.bySlug.get(m.s) || {}).category;
    const own = (k) => (d.qa || []).find((x) => x.k === k);
    const block = (k, q, list) => {
      const o = own(k);
      if (o?.a) return out.push({ k, q: o.q || q, html: qaHtml(o.a), text: qaText(o.a), own: !!o.q });
      if (!list.length) return;
      const [best, ...rest] = list;
      const why = qaWhy(best.why);
      out.push({ k, q: o?.q || q, own: !!o?.q,
        html: qaList([["Best match", `<strong>${pairLink(h, idx, best.s)}</strong>${why ? ` — ${h.escapeHtml(why)}` : ""}`], rest.length && ["Also good", rest.slice(0, 5).map((m) => pairLink(h, idx, m.s)).join(", ")]]),
        text: `The best match is ${best.item.title}.${why ? ` ${why}.` : ""}${rest.length ? ` Also good: ${listWords(rest.slice(0, 5).map((m) => m.item.title))}.` : ""}` });
    };
    block("cheese", `What cheese goes with ${d.name}?`, matches.filter((m) => cat(m) === "Cheese"));
    block("meat", `What charcuterie goes with ${d.name}?`, matches.filter((m) => cat(m) === "Cured Meat & Seafood"));
    const skip = (d.avoid || []).map((m) => ({ ...m, item: idx.bySlug.get(m.s) })).filter((m) => m.item);
    const ownSkip = own("skip");
    if (ownSkip?.a) out.push({ k: "skip", q: ownSkip.q || `What cheese should you avoid with ${d.name}?`, html: qaHtml(ownSkip.a), text: qaText(ownSkip.a) });
    else if (skip.length) out.push({ k: "skip", q: ownSkip?.q || `What should you avoid with ${d.name}?`,
      html: qaList(skip.map((m) => ["", `<strong>${ingLink(h, idx, m.s)}</strong> — ${h.escapeHtml(lowerFirst(qaWhy(m.why) || ""))}`])),
      text: skip.map((m) => `${m.item.title}: ${lowerFirst(qaWhy(m.why) || "")}.`).join(" ") });
    for (const x of (d.qa || []).filter((y) => !y.k)) out.push({ k: "custom", q: x.q, html: qaHtml(x.a), text: qaText(x.a) });
    return out;
  }
  const sameQ = (a, b) => a.toLowerCase().replace(/[^a-z]/g, "") === b.toLowerCase().replace(/[^a-z]/g, "");
  const drinkFaqLeft = (faq, qa) => (faq || []).filter((x) => !qa.some((y) => sameQ(y.q, x.q))).filter((x) => {
    const a = qa.find((y) => (y.k === "cheese" && /^what cheese/i.test(x.q)) || (y.k === "meat" && /^what (charcuterie|meat)/i.test(x.q)));
    if (!a) return true;
    if (!a.renamed && !a.own) { a.q = x.q; a.renamed = true; }
    return false;
  });

  // Extra written sections for a drink guide (16 Nov 2026, port first): drinks.json
  // "sections": [{ id, h, p, table: { head, rows }, list: ["Label: text"] }]. Text may
  // carry [label](/internal/) links; lists render as the same bullets as quick answers.
  const guideSection = (x) => `<section class="bl-section pr-guide" aria-labelledby="${x.id}-h">
      <h2 id="${x.id}-h">${h.escapeHtml(x.h)}</h2>
      ${x.p ? `<p class="pr-guide-p">${mdLinks(x.p)}</p>` : ""}
      ${x.table ? `<div class="pr-table-wrap"><table class="pr-guide-table"><thead><tr>${x.table.head.map((c) => `<th>${h.escapeHtml(c)}</th>`).join("")}</tr></thead><tbody>${x.table.rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${mdLinks(c)}</th>` : `<td data-l="${h.escapeHtml(x.table.head[i])}">${mdLinks(c)}</td>`)).join("")}</tr>`).join("")}</tbody></table></div>` : ""}
      ${x.list ? qaHtml(x.list) : ""}
      ${x.after ? `<p class="pr-guide-p">${mdLinks(x.after)}</p>` : ""}
    </section>`;

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
    const fam = d.family === "wine" ? ["Wine", "/pairings/wine/"] : d.family === "spirits" ? ["Cocktails & Spirits", "/pairings/cocktails/"] : ["Beer & Cider", "/pairings/beer/"];
    const boards = boardsFor(d.matches.map((m) => m.s));
    const rulesUsed = [...new Set(d.matches.map((m) => m.rule))].map((r) => idx.ruleById.get(r)).filter(Boolean);
    const qa = drinkAnswers(d, matches);
    const faqRest = drinkFaqLeft(d.faq, qa);
    return page(h, {
      url: d.url,
      // Optional per-drink overrides in drinks.json, matched to how people search
      // ("best cheese pairing with sauvignon blanc").
      title: d.seo_title || DRINK_TITLE[d.slug] || (d.family === "wine" ? (`${d.name} Cheese Pairing: ${matches.length} Matches + What to Skip`.length <= 60 ? `${d.name} Cheese Pairing: ${matches.length} Matches + What to Skip` : `${d.name} Cheese Pairing: ${matches.length} Best Matches`) : (title.length > 60 ? `${d.name} Pairings: ${matches.length} Best Matches` : title)),
      name: `${d.name} pairings`,
      description: d.seo_description || d.answer,
      crumbs: [["Pairings", "/pairings/"], fam, [d.name, d.url]],
      image: photo(`pairings-${d.family}-${d.slug}`),
      faq: [...qa.map((x) => ({ q: x.q, a: x.text })), ...faqRest],
      list: matches.map((m) => [m.item.title, `/ingredients/${m.s}/`]),
      script,
      body: `
    <header class="pr-drink-hero" style="--d:${d.color}">
      ${photo(`pairings-${d.family}-${d.slug}`) ? `<img class="pr-drink-photo" src="${photo(`pairings-${d.family}-${d.slug}`)}" alt="A glass of ${B(d.name)} with ${B(top[0].item.title)}" width="800" height="1000" fetchpriority="high">` : `<div class="pr-drink-card" aria-hidden="true"><span class="pr-glass"></span><strong>${B(d.name)}</strong><span>${B(d.familyLabel)}</span></div>`}
      <div>
        <p class="section-kicker">${B(d.familyLabel)} pairing guide</p>
        <h1>${d.h1 ? B(d.h1) : `${B(d.name)} pairings: cheese, charcuterie &amp; more`}</h1>
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

    ${(d.sections || []).map((x) => guideSection(x)).join("\n")}

    ${qa.length ? `<section class="bl-section pr-qa" aria-labelledby="qa-h">
      <h2 id="qa-h">${B(d.name)} pairing: quick answers</h2>
      ${qa.map((x) => `<div class="pr-qa-item"><h3>${B(x.q)}</h3><div class="pr-qa-a">${x.html}</div></div>`).join("\n      ")}
    </section>` : ""}

    <section class="bl-section pr-two" aria-label="Skip and swap">
      <div>
        <h2>Skip these with ${B(d.name)}</h2>
        <ul class="pr-avoid">${d.avoid.map((m) => `<li><strong>${ingLink(h, idx, m.s)}</strong> ${B(m.why)}</li>`).join("")}</ul>
      </div>
      <div${BOTTLES[d.slug] ? ` class="pr-buy-box"` : ""}>
        ${BOTTLES[d.slug] ? `<h2>The bottle to buy</h2>
        <ul class="pr-bottles">${BOTTLES[d.slug].map(([n, p, u, k]) => `<li><span class="pr-bottle-k">${B(k)}</span><a href="${u}">${B(n)}</a>${p ? ` <span class="pr-bottle-p">${B(p)}</span>` : ""}</li>`).join("")}</ul>
        <p><strong>Budget swap:</strong> ${B(d.swap)}</p>` : `<h2>Budget swap</h2>
        <p>${B(d.swap)}</p>`}
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
      <h2 id="faq-h">More ${B(d.name)} questions</h2>
      ${faqHtml(h, faqRest)}
    </section>
    ${h.bookBar(`pairings_${d.slug}`, "50 boards, each with a drink pairing")}
    ${h.printCard ? h.printCard("wine-cheese-pairing-guide", `pairings_print_${d.slug}`) : ""}`
    });
  };
  for (const d of idx.drinks) add(`${d.url.slice(1)}index.html`, drinkPage(d));

  // ---------------------------------------------------- family landings ---
  const familyLanding = (fam, list, { url, title, h1, answer, intro, note, faq, img }) => page(h, {
    url, title, name: h1, description: answer, crumbs: [["Pairings", "/pairings/"], [fam, url]], faq, script, image: photo(img),
    list: list.map((d) => [`${d.name} pairings`, d.url]),
    body: `
    <header class="pr-hero${photo(img) ? " pr-hero-photo" : ""}">
      <div>
      <p class="section-kicker">${B(fam)} pairings</p>
      <h1>${B(h1)}</h1>
      <p class="pr-answer">${B(answer)}</p>
      <p>${B(intro)}</p>${note ? `
      <p class="bl-note">${note}</p>` : ""}
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
    // 16 Nov 2026: the full charcuterie guide owns "wine with charcuterie"; this page is the by-bottle index
    note: `Pouring for a whole charcuterie board? Start with the <a href="/blog/wine-and-charcuterie-board/">charcuterie board wine pairing guide</a>: one, two or three bottles, meat by meat and cheese by cheese.`,
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
    url, title, name: pageData.name, description: pageData.seo_description || pageData.answer, crumbs: [["Pairings", "/pairings/"], [pageData.name, url]], faq: [...(pageData.qa || []).map((x) => ({ q: x.q, a: qaText(x.a) })), ...(pageData.faq || [])], script, image: photo(img),
    list: pageData.items.map((it) => [it.name, `${url}#${slugify(it.name)}`]),
    body: `
    <header class="pr-hero${photo(img) ? " pr-hero-photo" : ""}">
      <div>
      <p class="section-kicker">${B(FAMILY[fam].label)}</p>
      <h1>${B(pageData.h1 || `${pageData.name} for charcuterie boards`)}</h1>
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
    ${fam === "zero" ? `<p class="pr-buy"><span>The bottle to buy:</span> <a href="/blog/best-sparkling-cider/">Martinelli's Sparkling Cider</a> <em>Our Best Buys pick</em></p>
    <p class="bl-note">More ideas for Dry January: <a href="/blog/non-alcoholic-charcuterie-pairings/">zero-proof pairings that actually work</a>, with teas, shrubs and NA wines.</p>
    <p class="bl-note">Every drink on this page follows the same rules as wine: <a href="/pairings/how-pairing-works/#acid">acid</a>, <a href="/pairings/how-pairing-works/#texture">bubbles</a> and <a href="/pairings/how-pairing-works/#fat-tannin">tannin</a>.</p>` : `<p class="bl-note">Pouring whisky? See the full <a href="/pairings/spirits/whisky/">whisky and cheese pairing guide</a> &mdash; 13 matches with the reason behind each.</p>
    <p class="bl-note">Please drink responsibly. Looking for alcohol-free options? See <a href="/pairings/zero-proof/">zero-proof pairings</a>.</p>`}
    ${(pageData.qa || []).length ? `<section class="bl-section pr-qa" aria-labelledby="qa-h">
      <h2 id="qa-h">${B(pageData.qa_h2 || "Quick answers")}</h2>
      ${pageData.qa.map((x) => `<div class="pr-qa-item"><h3>${B(x.q)}</h3><div class="pr-qa-a">${qaHtml(x.a)}</div></div>`).join("\n      ")}
    </section>` : ""}
    <section class="bl-section" id="faq" aria-labelledby="faq-h"><h2 id="faq-h">${(pageData.qa || []).length ? "More questions" : "Questions"}</h2>${faqHtml(h, pageData.faq)}</section>`
  });
  add("pairings/cocktails/index.html", itemPage("cocktails", idx.data.drinks.cocktails, "/pairings/cocktails/", "Cocktails for a Charcuterie Board: 8 Drinks & Pairings", "pairings-cocktails"));
  add("pairings/zero-proof/index.html", itemPage("zero", idx.data.drinks.zero, "/pairings/zero-proof/", "Non-Alcoholic Drinks for a Charcuterie Board: 7 Picks", "pairings-zero-proof"));

  // "What to drink with a charcuterie board": a pick-by-situation table so the
  // page answers the question itself (8 Nov 2026).
  const dUrl = (slug) => idx.drinkBySlug.get(slug)?.url || "/pairings/drinks/";
  const SITUATIONS = [
    ["A mixed board, one bottle", "Dry sparkling wine: Cava, Prosecco or Champagne", [["Champagne & Prosecco", dUrl("champagne-prosecco")]], "Bubbles and acid suit soft cheese, hard cheese and salty meat alike."],
    ["Guests who drink red", "Pinot Noir or Beaujolais", [["Pinot Noir", dUrl("pinot-noir")], ["Beaujolais", dUrl("beaujolais")]], "Light reds with low tannin don't clash with soft cheese the way big reds do."],
    ["Guests who drink white", "Sauvignon Blanc or Chardonnay", [["Sauvignon Blanc", dUrl("sauvignon-blanc")], ["Chardonnay", dUrl("chardonnay")]], "Sauvignon Blanc for goat cheese; buttery Chardonnay for brie."],
    ["A summer or outdoor board", "Dry rosé", [["Rosé", dUrl("rose")]], "Chilled and fruity, it works with feta, prosciutto, chorizo and fruit."],
    ["Spicy salami or pepper jack", "Off-dry Riesling or an IPA", [["Riesling", dUrl("riesling")], ["IPA", dUrl("ipa")]], "A little sweetness or hop bitterness calms the heat."],
    ["Blue cheese or a dessert board", "Port, or a stout for beer drinkers", [["Port", dUrl("port")], ["Stout & Porter", dUrl("stout-porter")]], "Sweet and roasty drinks balance salty blue cheese and dark chocolate."],
    ["Beer drinkers", "Pilsner, lager or dry hard cider", [["Lager & Pilsner", dUrl("lager-pilsner")], ["Hard Cider", dUrl("hard-cider")]], "Crisp and bubbly, they scrub fat between bites."],
    ["A cocktail party", "Aperol spritz, dry martini or an old fashioned", [["Cocktails", "/pairings/cocktails/"]], "Bitter, dry and spirit-forward drinks stand up to cured meat."],
    ["No alcohol", "Sparkling apple cider, black iced tea or kombucha", [["Zero-proof", "/pairings/zero-proof/"]], "Acid, bubbles and tannin do the same job as wine."]
  ];
  const drinksFaq = [
    { q: "What drinks go with a charcuterie board?", a: "Dry sparkling wine goes with almost everything. Pinot Noir and dry rosé are the next safest. For beer, a pilsner or dry cider; without alcohol, sparkling apple cider or iced tea." },
    { q: "Red or white wine with charcuterie?", a: "Either. A crisp white or sparkling wine for prosciutto and soft cheese, and a light red for salami and aged cheese. One of each covers most boards." },
    { q: "How much wine do I need for a charcuterie party?", a: "A 750 ml bottle pours five 5 oz glasses. A common rule is one bottle for every two guests over two to three hours, so about 6 bottles for 12 guests." },
    { q: "What is a good non-alcoholic drink for a charcuterie board?", a: "Sparkling apple cider, unsweetened black iced tea, kombucha or sparkling water with citrus. Bubbles and acid cut through salty meat and rich cheese." }
  ];
  add("pairings/drinks/index.html", page(h, {
    url: "/pairings/drinks/",
    title: "What to Drink With a Charcuterie Board: 9 Easy Picks",
    name: "What to drink with a charcuterie board",
    description: "What to drink with a charcuterie board: dry sparkling wine for a mixed board, Pinot Noir for red drinkers, rosé in summer, port with blue cheese, pilsner or cider for beer drinkers, and sparkling cider without alcohol.",
    crumbs: [["Pairings", "/pairings/"], ["Drinks", "/pairings/drinks/"]],
    image: "/images/drink-pairings.webp",
    faq: drinksFaq,
    list: SITUATIONS.map(([sit, , links]) => [sit, links[0][1]]),
    script,
    body: `
    <header class="pr-hero">
      <div>
      <p class="section-kicker">Drinks</p>
      <h1>What to drink with a charcuterie board</h1>
      <p class="pr-answer">For most boards, pour <strong>dry sparkling wine</strong>, then <strong>dry rosé</strong> or <strong>Pinot Noir</strong>. Beer drinkers: pilsner or dry cider. Without alcohol: sparkling apple cider or unsweetened black iced tea.</p>
      </div>
    </header>

    <section class="bl-section" aria-labelledby="sit-h">
      <h2 id="sit-h">Pick by your board and your guests</h2>
      <div class="pr-drink-table-wrap"><table class="pr-table pr-sit">
        <thead><tr><th scope="col">If you have…</th><th scope="col">Pour</th><th scope="col">Why</th></tr></thead>
        <tbody>
        ${SITUATIONS.map(([sit, pour, links, why]) => `<tr><th scope="row">${B(sit)}</th><td><strong>${B(pour)}</strong><span class="pr-sit-links">${links.map(([t, u]) => `<a href="${u}">${B(t)} pairings</a>`).join(" · ")}</span></td><td>${B(why)}</td></tr>`).join("\n        ")}
        </tbody>
      </table></div>
      <p class="bl-note"><strong>How much:</strong> a 750 ml bottle pours five glasses. Plan on one bottle for every two guests over two to three hours. Two bottles, one sparkling or crisp white and one light red, cover most boards.</p>
      <p class="bl-cta-row"><a class="button primary" href="/blog/best-wine-for-charcuterie-board/">The 8 best bottles under $20</a> <a class="button" href="/pairings/wine-and-cheese-chart/">Wine and cheese chart</a></p>
    </section>

    <section class="bl-section" aria-labelledby="all-drinks-h">
      <h2 id="all-drinks-h">Every drink we pair</h2>
      <ul class="pr-tiles">
      ${[["wine", "Wine", wines], ["beer", "Beer & Cider", beers]].map(([u, t, list]) => `<li><a href="/pairings/${u}/" style="--t:${list[0].color}"><strong>${t}</strong><span>${list.map((d) => B(d.name)).join(" · ")}</span></a></li>`).join("")}
      <li><a href="/pairings/cocktails/" style="--t:#b5651d"><strong>Cocktails &amp; Spirits</strong><span>${idx.data.drinks.cocktails.items.map((i) => B(i.name)).join(" · ")}</span></a></li>
      ${spirits.map((d) => `<li><a href="${d.url}" style="--t:${d.color}"><strong>${B(d.name)}</strong><span>${d.matches.slice(0, 4).map((m) => B(idx.bySlug.get(m.s)?.title || m.s)).join(" · ")}</span></a></li>`).join("")}
      <li><a href="/pairings/zero-proof/" style="--t:#c08a4a"><strong>Zero-Proof</strong><span>${idx.data.drinks.zero.items.map((i) => B(i.name)).join(" · ")}</span></a></li>
      </ul>
      <p class="bl-note">Whiskey drinkers: see <a href="/blog/whiskey-and-cheese-pairing/">whiskey and cheese pairing</a>.</p>
    </section>

    <section class="bl-section" id="faq" aria-labelledby="faq-h">
      <h2 id="faq-h">Drink questions</h2>
      ${faqHtml(h, drinksFaq)}
    </section>
    ${h.printCard ? h.printCard("wine-cheese-pairing-guide", "pairings_print_drinks") : ""}`
  }));

  // -------------------------------------------------------- food pages ---
  // Pairings are ranked (how strong the evidence is) and grouped by the job
  // they do on the plate, so a visitor sees "the best sweet thing, the best
  // crunchy thing..." instead of one long alphabetical wall of 50+ items.
  const foodCats = categories.filter((c) => [...idx.bySlug.values()].some((i) => i.category === c));
  const ROLE_GROUPS = [
    { id: "sweet", label: "Something sweet", hint: "Fruit, jam and honey balance salt and richness.", cats: ["Fruit", "Spreads, Jams & Honey"] },
    { id: "crunch", label: "Something crunchy", hint: "Crackers, bread and nuts carry it and add texture.", cats: ["Crackers & Breads", "Nuts & Seeds"] },
    { id: "salty", label: "Something salty or briny", hint: "Cured meat, olives and pickles bring salt and acid.", cats: ["Cured Meat & Seafood", "Pickles, Olives & Briny"] },
    { id: "cheese", label: "Another cheese", hint: "Cheeses that sit well next to it on the same board.", cats: ["Cheese"] },
    { id: "finish", label: "Finishing touches", hint: "Small extras that lift the bite.", cats: ["Finishing Touches"] }
  ];
  const TIERS = [
    { min: 100, stars: 3, label: "Top pick" },
    { min: 40, stars: 3, label: "Excellent" },
    { min: 22, stars: 2, label: "Great" },
    { min: 0, stars: 1, label: "Good" }
  ];
  const pairScore = (f, p) => {
    const it = f.item;
    let s = 0;
    const top = f.top.indexOf(p.slug);
    if (top >= 0) s += 100 - top;
    if (idx.explainedBy.has(`${f.slug}>${p.slug}`)) s += 30; // this food's own page explains it
    if (idx.explainedBy.has(`${p.slug}>${f.slug}`)) s += 15; // the partner's page explains it
    if (it.pairsWith.includes(p.slug) && p.pairsWith.includes(f.slug)) s += 20; // both pages list each other
    if (idx.combos.some((c) => c.foods.includes(f.slug) && c.foods.includes(p.slug))) s += 15; // a named combo
    if (idx.reasons.has(key(f.slug, p.slug))) s += 8;
    if (idx.foodPage.has(p.slug)) s += 4; // a staple with its own guide
    return s;
  };
  const tierOf = (s) => TIERS.find((t) => s >= t.min);
  const stars = (n) => `<span class="pr-stars" aria-label="${n} out of 3">${[1, 2, 3].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;
  const whyOf = (f, p) => idx.reasons.get(key(f.slug, p.slug)) || "";

  // Quick answers (15 Nov 2026): Search Console shows the guides rank 7-12 for
  // the exact questions people ask ("what fruit goes with brie", "what cheese
  // goes with smoked salmon", "what fruit goes with apples"). Each guide now
  // answers them in its own words, from its own ranked pairings: the best pick
  // with its reason, then the runners-up. foods.json "qa" adds hand-written ones.
  const QA_CATS = {
    fruit: { cats: ["Fruit"], q: (t, self) => self ? `What other fruit goes with ${t}?` : `What fruit goes with ${t}?` },
    meat: { cats: ["Cured Meat & Seafood"], q: (t, self) => self ? `What other meat or seafood goes with ${t}?` : `What meat goes with ${t}?` },
    cheese: { cats: ["Cheese"], q: (t, self) => self ? `What other cheeses go with ${t} on a board?` : `What cheese goes with ${t}?` },
    crackers: { cats: ["Crackers & Breads"], q: (t) => `What crackers and bread go with ${t}?` },
    sweet: { cats: ["Spreads, Jams & Honey"], q: (t) => `What jam, honey or spread goes with ${t}?` },
    nuts: { cats: ["Nuts & Seeds"], q: (t) => `What nuts go with ${t}?` },
    briny: { cats: ["Pickles, Olives & Briny"], q: (t) => `What pickles or olives go with ${t}?` }
  };
  const QA_ORDER = {
    "Cheese": ["fruit", "meat", "crackers", "sweet", "nuts", "cheese", "briny"],
    "Cured Meat & Seafood": ["cheese", "fruit", "crackers", "sweet", "briny", "nuts", "meat"],
    "Fruit": ["cheese", "fruit", "meat", "nuts", "sweet", "crackers"]
  };
  const QA_DEFAULT = ["cheese", "meat", "fruit", "crackers", "sweet", "nuts"];
  function quickAnswers(f, it, ranked, drinks) {
    const out = [];
    const order = QA_ORDER[it.category] || QA_DEFAULT;
    for (const k of order) {
      const qc = QA_CATS[k];
      const self = qc.cats.includes(it.category);
      const items = ranked.filter((r) => qc.cats.includes(r.p.category)).slice(0, 5);
      if (items.length < 2) continue;
      const [best, ...rest] = items;
      const own = (f.qa || []).find((x) => x.k === k);
      if (own?.a) { out.push({ k, q: own.q || qc.q(it.title, self), html: qaHtml(own.a), text: qaText(own.a), own: !!own.q }); continue; }
      const why = own?.why || qaWhy(best.why);
      const html = qaList([["Best match", `<strong>${pairLink(h, idx, best.p.slug)}</strong>${why ? ` — ${h.escapeHtml(why)}` : ""}`], ["Also good", rest.map((r) => pairLink(h, idx, r.p.slug)).join(", ")]]);
      const text = `The best match is ${best.p.title}.${why ? ` ${why}.` : ""} Also good: ${listWords(rest.map((r) => r.p.title))}.`;
      out.push({ k, q: own?.q || qc.q(it.title, self), html, text, own: !!own?.q });
    }
    const wines = drinks.filter((x) => x.d.family === "wine").slice(0, 3);
    const ownWine = (f.qa || []).find((x) => x.k === "wine");
    if (ownWine?.a) out.push({ k: "wine", q: ownWine.q || `What wine goes with ${it.title}?`, html: qaHtml(ownWine.a), text: qaText(ownWine.a), own: !!ownWine.q });
    else if (wines.length) {
      const [w, ...more] = wines;
      const zero = drinks.find((x) => x.d.family === "zero");
      const beer = drinks.find((x) => x.d.family === "beer");
      const ownW = (f.qa || []).find((x) => x.k === "wine");
      const why = ownW?.why || qaWhy(w.why);
      out.push({ k: "wine", q: ownW?.q || `What wine goes with ${it.title}?`,
        html: qaList([["Best match", `<strong><a href="${w.d.url}">${h.escapeHtml(w.d.name)}</a></strong>${why ? ` — ${h.escapeHtml(why)}` : ""}`], more.length && ["Also good", more.map((x) => `<a href="${x.d.url}">${h.escapeHtml(x.d.name)}</a>`).join(", ")], beer && ["Beer", `<a href="${beer.d.url}">${h.escapeHtml(beer.d.name)}</a>`], zero && ["No alcohol", `<a href="${zero.d.url}">${h.escapeHtml(zero.d.name)}</a>`]]),
        text: `Pour ${w.d.name}.${why ? ` ${why}.` : ""}${more.length ? ` Also good: ${listWords(more.map((x) => x.d.name))}.` : ""}${beer ? ` For beer, try ${beer.d.name}.` : ""}${zero ? ` Without alcohol: ${lowerFirst(zero.d.name)}.` : ""}` });
    }
    for (const x of (f.qa || []).filter((y) => !y.k)) out.push({ k: "custom", q: x.q, html: qaHtml(x.a), text: qaText(x.a) });
    return out;
  }
  // a hand-written FAQ that asks the same thing as a quick answer is dropped from the FAQ list
  const QA_WORDS = { fruit: /\bfruit/i, meat: /\b(meat|charcuterie|salami|prosciutto)/i, cheese: /\bcheese/i, crackers: /\b(cracker|bread)/i, sweet: /\b(jam|honey|spread)/i, nuts: /\bnut/i, briny: /\b(pickle|olive)/i, wine: /\bwine\b/i };
  // ...and its wording (often mined from Search Console, "sharp cheddar") becomes the quick answer's heading
  const faqLeft = (faq, qa) => (faq || []).filter((x) => {
    // test only the part of the question before "go/goes/pair", so "What wine goes with prosciutto?" is a wine question, not a meat one
    const head = x.q.split(/\b(?:go|goes|pair|pairs)\b/i)[0];
    const a = qa.find((y) => y.k !== "custom" && QA_WORDS[y.k] && QA_WORDS[y.k].test(head) && /^(what|which)\b/i.test(x.q) && !/\bor\b/i.test(x.q));
    if (!a) return true;
    if (!a.renamed && !a.own) { a.q = x.q; a.renamed = true; }
    return false;
  });

  const foodPageHtml = (f) => {
    const it = f.item;
    const all = [...idx.graph.get(f.slug)].map((s) => idx.bySlug.get(s)).filter(Boolean);
    const ranked = all
      .map((p) => ({ p, score: pairScore(f, p) }))
      .sort((a, b) => b.score - a.score || a.p.title.localeCompare(b.p.title))
      .map((r) => ({ ...r, tier: tierOf(r.score), why: whyOf(f, r.p) }));
    const topPicks = f.top.map((s) => ranked.find((r) => r.p.slug === s)).filter(Boolean);
    for (const r of ranked) { if (topPicks.length >= 5) break; if (!topPicks.includes(r)) topPicks.push(r); }
    const groups = ROLE_GROUPS.map((g) => ({ ...g, items: ranked.filter((r) => g.cats.includes(r.p.category)) })).filter((g) => g.items.length);
    const other = ranked.filter((r) => !ROLE_GROUPS.some((g) => g.cats.includes(r.p.category)));
    if (other.length) groups.push({ id: "other", label: "More ideas", hint: "", items: other });
    const drinks = (idx.drinksFor.get(f.slug) || []);
    // one best pick per job: the "perfect bite"
    // foods.json "bite" pins a pick so the plate keeps matching its perfect-bite photo
    const pick = (id) => (f.bite && f.bite[id] && groups.find((g) => g.id === id)?.items.find((r) => r.p.slug === f.bite[id])?.p) || groups.find((g) => g.id === id)?.items[0]?.p;
    const plate = ["sweet", "crunch", "salty"].map((id) => ({ id, p: pick(id), g: ROLE_GROUPS.find((g) => g.id === id) })).filter((x) => x.p);
    // up to 6 combos: featured first, then pairs before trios before quartets (15 Nov 2026, 126 combos)
    const combosAll = idx.combos.filter((c) => c.foods.includes(f.slug));
    const kindRank = (c) => COMBO_KINDS.findIndex((k) => k.key === c.kind);
    const combos = [...combosAll].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || kindRank(a) - kindRank(b)).slice(0, 6);
    const boards = (boardsUsing.get(f.slug) || []).slice(0, 3);
    const title = `What Goes With ${it.title}? ${all.length} Pairings & Drinks`;
    // "Perfect bite" photo (8 Nov 2026): drop pairings-bite-<slug>.webp into
    // public/images/pairings/ and it replaces the thumbnail row at the top.
    const bite = photo(`pairings-bite-${f.slug}`);
    const bf = h.bestFor ? h.bestFor(f.slug) : null;
    const buy = bf && pickFits(it.title, bf.pick) ? bf : null;
    const qa = quickAnswers(f, it, ranked, drinks);
    const faqRest = faqLeft(f.faq, qa);
    const SHOW = 4;
    const row = (r, n) => `<li class="pr-rank-row"><span class="pr-rank-n">${n}</span>${thumb(h, r.p, art, " pr-thumb-sm")}<div class="pr-rank-body"><p class="pr-rank-name">${pairLink(h, idx, r.p.slug)} ${stars(r.tier.stars)}<span class="pr-tier">${r.tier.label}</span></p>${r.why ? `<p class="pr-rank-why">${B(r.why)}</p>` : ""}</div></li>`;
    const chip = (r) => `<li><a href="${idx.foodPage.has(r.p.slug) ? `/pairings/food/${r.p.slug}/` : `/ingredients/${r.p.slug}/`}">${thumb(h, r.p, art, " pr-thumb-xs")}<span>${B(r.p.title)}</span>${stars(r.tier.stars)}</a></li>`;
    return page(h, {
      url: f.url,
      // foods.json seo_title / seo_description win when set (CTR round 3, 10 Nov 2026).
      title: f.seo_title || (title.length > 60 ? `What Goes With ${it.title}? Best Pairings` : title),
      name: `What goes with ${it.title}`,
      description: f.seo_description || f.answer,
      crumbs: [["Pairings", "/pairings/"], ["Food", "/pairings/food/"], [it.title, f.url]],
      faq: [...qa.map((x) => ({ q: x.q, a: x.text })), ...faqRest],
      list: ranked.slice(0, 12).map((r) => [r.p.title, `/ingredients/${r.p.slug}/`]),
      script,
      body: `
    <header class="pr-food-hero${bite ? " pr-has-bite" : ""}">
      ${bite ? "" : photoRow(h, idx, art, [f.slug, ...f.top], true)}
      <p class="section-kicker">${B(it.category)} pairing guide</p>
      <h1>What goes with ${B(it.title)}?</h1>
      <p class="pr-answer">${B(f.answer)}</p>
      ${bite ? `<img class="pr-bite-photo" src="${bite}" alt="${B(`${it.title} with ${plate.map((x) => x.p.title).join(", ")}${drinks[0] ? ` and a glass of ${drinks[0].d.name}` : ""}`)}" width="1024" height="572" fetchpriority="high" decoding="async">` : ""}
      ${buy ? `<p class="pr-buy"><span>The one to buy:</span> <a href="/blog/${buy.slug}/">${B(buy.pick)}</a> <em>Our Best Buys pick</em></p>` : ""}
      <p class="bl-cta-row"><a class="button primary" href="${builderPreset([f.slug, ...f.top, ...plate.map((x) => x.p.slug)], 6, `pairings_food_${f.slug}`)}">Build a board around ${B(it.title)}</a> <a class="button" href="/ingredients/${f.slug}/">Everything about ${B(it.title)}</a></p>
      <nav class="pr-jump" aria-label="On this page"><a href="#top-h">Top ${topPicks.length}</a><a href="#bite-h">The perfect bite</a>${qa.length ? `<a href="#qa-h">Quick answers</a>` : ""}${f.serve && f.serve.length ? `<a href="#serve-h">How to serve</a>` : ""}<a href="#all-h">All ${all.length}, ranked</a>${drinks.length ? `<a href="#drinks-h">Drinks</a>` : ""}${it.avoidWith.length ? `<a href="#skip-h">Skip these</a>` : ""}</nav>
    </header>

    <section class="bl-section" aria-labelledby="top-h">
      <h2 id="top-h">The ${topPicks.length} best pairings for ${B(it.title)}</h2>
      <ol class="pr-podium">
        ${topPicks.map((r, i) => `<li class="pr-podium-card"><span class="pr-podium-n">#${i + 1}</span>${thumb(h, r.p, art, " pr-thumb-big")}<h3>${pairLink(h, idx, r.p.slug)}</h3><p class="pr-cat">${B(r.p.category)}</p>${r.why ? `<p>${B(r.why)}</p>` : ""}</li>`).join("\n        ")}
      </ol>
    </section>

    ${plate.length >= 2 ? `<section class="bl-section" aria-labelledby="bite-h">
      <h2 id="bite-h">The perfect ${B(it.title)} bite</h2>
      <p class="pr-sub">One from each job on the board: ${plate.map((x) => B(x.g.label.toLowerCase())).join(", ")}${drinks[0] ? ", and a drink" : ""}.</p>
      <div class="pr-bite">
        <span class="pr-bite-item">${thumb(h, it, art, " pr-thumb-big")}<strong>${B(it.title)}</strong></span>
        ${plate.map((x) => `<span class="pr-plus" aria-hidden="true">+</span><span class="pr-bite-item">${thumb(h, x.p, art, " pr-thumb-big")}<strong>${pairLink(h, idx, x.p.slug)}</strong><em>${B(x.g.label.replace("Something ", ""))}</em></span>`).join("")}
        ${drinks[0] ? `<span class="pr-plus" aria-hidden="true">+</span><span class="pr-bite-item pr-bite-drink" style="--d:${drinks[0].d.color}"><span class="pr-drink-swatch pr-bite-swatch" aria-hidden="true"></span><strong><a href="${drinks[0].d.url}">${B(drinks[0].d.name)}</a></strong><em>To drink</em></span>` : ""}
      </div>
    </section>` : ""}

    ${qa.length ? `<section class="bl-section pr-qa" aria-labelledby="qa-h">
      <h2 id="qa-h">What to eat with ${B(it.title)}: quick answers</h2>
      ${qa.map((x) => `<div class="pr-qa-item"><h3>${B(x.q)}</h3><div class="pr-qa-a">${x.html}</div></div>`).join("\n      ")}
    </section>` : ""}

    ${f.serve && f.serve.length ? `<section class="bl-section" aria-labelledby="serve-h">
      <h2 id="serve-h">How to serve ${B(it.title)} on a board</h2>
      ${f.serve.map((t) => `<p>${B(t)}</p>`).join("\n      ")}${f.guide ? `\n      <p><a href="${f.guide[1]}">${B(f.guide[0])}</a></p>` : ""}
    </section>` : ""}

    <section class="bl-section" aria-labelledby="all-h">
      <h2 id="all-h">All ${all.length} pairings, ranked by type</h2>
      <p class="pr-sub">${stars(3)} excellent &nbsp; ${stars(2)} great &nbsp; ${stars(1)} good. Each list starts with the strongest matches. Stars show how well backed a pairing is: a named top pick, explained on both ingredient pages, or part of a proven combination.</p>
      <p class="pr-jump pr-jump-groups">${groups.map((g) => `<a href="#g-${g.id}">${B(g.label)} (${g.items.length})</a>`).join("")}</p>
      ${groups.map((g) => `<div class="pr-group" id="g-${g.id}">
        <h3>${B(g.label)} <span class="pr-count">${g.items.length}</span></h3>
        ${g.hint ? `<p class="pr-group-hint">${B(g.hint)}</p>` : ""}
        <ol class="pr-rank">${g.items.slice(0, SHOW).map((r, i) => row(r, i + 1)).join("")}</ol>
        ${g.items.length > SHOW ? `<details class="pr-more-box"><summary>${g.items.length - SHOW} more ${B(g.label.replace("Something ", "").replace("Another ", "").toLowerCase())} ${g.items.length - SHOW === 1 ? "option" : "options"}</summary><ul class="pr-chipgrid">${g.items.slice(SHOW).map(chip).join("")}</ul></details>` : ""}
      </div>`).join("\n      ")}
    </section>

    ${drinks.length ? `<section class="bl-section" aria-labelledby="drinks-h">
      <h2 id="drinks-h">Drinks that go with ${B(it.title)}</h2>
      <div class="pr-drink-table-wrap"><table class="pr-drink-table"><thead><tr><th scope="col">Drink</th><th scope="col">Why it works</th></tr></thead><tbody>${drinks.map((x) => `<tr style="--d:${x.d.color}"><th scope="row"><a href="${x.d.url}"><span class="pr-drink-swatch" aria-hidden="true"></span>${B(x.d.name)}</a></th><td>${B(x.why)}</td></tr>`).join("")}</tbody></table></div>
    </section>` : ""}

    ${it.avoidWith.length ? `<section class="bl-section" aria-labelledby="skip-h"><h2 id="skip-h">Skip these with ${B(it.title)}</h2>${skipList(h, idx, f.slug, it.avoidWith)}</section>` : ""}

    ${combos.length ? `<section class="bl-section" aria-labelledby="combo-h"><h2 id="combo-h">Combinations with ${B(it.title)}</h2><ul class="pr-combos">${combos.map((c) => comboCard(h, idx, art, c)).join("\n")}</ul>${combosAll.length > combos.length ? `<p><a class="pr-more" href="/pairings/classics/">See all ${combosAll.length} combinations with ${B(it.title)} &rarr;</a></p>` : ""}</section>` : ""}
    ${(() => { const fam = mcFamilyOf(idx, f.slug); if (!fam) return ""; const isMeat = idx.data.mc.meats.includes(fam); return `<p class="mc-food-link">${isMeat ? `Which cheese goes with ${B(it.title)}?` : `Which cured meat goes with ${B(it.title)}?`} See the <a href="/pairings/meat-and-cheese-chart/${isMeat ? `#mc-${fam.id}` : ""}">meat and cheese pairing chart</a>.</p>`; })()}
    ${(() => {
      // ladders that start with (or reach) this food, linked into the Lab (15 Nov 2026)
      const stepFoods = (st) => (st.startsWith("plate:") ? idx.plates.find((c) => `plate:${c.id}` === st) : idx.combos.find((c) => c.id === st))?.foods || [];
      const starts = idx.ladders.filter((l) => stepFoods(l.steps[0]).includes(f.slug));
      const reaches = idx.ladders.filter((l) => !starts.includes(l) && l.steps.some((st) => stepFoods(st).includes(f.slug)));
      const ls = [...starts, ...reaches].slice(0, 3);
      return ls.length ? `<section class="bl-section" aria-labelledby="ladder-h"><h2 id="ladder-h">Build it up from ${B(it.title)}</h2><p class="bl-note">Add one food at a time; every step is a tested match. Tap a step for its card in the <a href="/pairings/classics/">Combination Lab</a>.</p><ul class="lab-ladders">${ls.map((l) => ladderRow(h, idx, l, "/pairings/classics/")).join("")}</ul></section>` : "";
    })()}

    ${boards.length ? `<section class="bl-section" aria-labelledby="boards-h"><h2 id="boards-h">Boards that use ${B(it.title)}</h2>${boardList(boards)}</section>` : ""}

    ${faqRest.length ? `<section class="bl-section" id="faq" aria-labelledby="faq-h">
      <h2 id="faq-h">More ${B(it.title)} questions</h2>
      ${faqHtml(h, faqRest)}
    </section>` : ""}
    ${h.bookBar(`pairings_food_${f.slug}`, `Put ${it.title.toLowerCase()} on a full board`)}
    ${h.printCard ? h.printCard(it.category === "Cheese" ? "cheese-board-field-guide" : "pairing-card-deck", `pairings_print_food_${f.slug}`, { item: it }) : ""}`
    });
  };
  for (const f of idx.foods) add(`pairings/food/${f.slug}/index.html`, foodPageHtml(f));

  add("pairings/food/index.html", page(h, {
    url: "/pairings/food/",
    title: "Food Pairings for Charcuterie: What Goes With What",
    name: "Food pairings for charcuterie",
    description: `What goes with brie, prosciutto, Manchego and ${idx.foods.length - 3} more favorites, plus a finder for all ${idx.bySlug.size} ingredients.`,
    crumbs: [["Pairings", "/pairings/"], ["Food", "/pairings/food/"]],
    image: "/images/food-pairings.webp",
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
  // The Combination Lab (15 Nov 2026): every pair, trio, quartet and Perfect
  // Plate with filters, ladders, amounts for 8, drinks and print cards.
  add("pairings/list/index.html", listPage(h, idx));
  add("pairings/classics/index.html", labPage(h, idx, art, script, { image: photo("pairings-lab"), hero: heroImg("pairings-lab", "Charcuterie bites built up from a pair to a full plate") }));

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
      <p class="bl-note">See the rules at scale in our <a href="/blog/charcuterie-pairing-data-study/">charcuterie pairing data study</a>: 2,521 pairings across 375 ingredients.</p>
    </header>
    ${idx.rules.map((r, n) => {
      const drinkEx = idx.drinks.flatMap((d) => d.matches.filter((m) => m.rule === r.id).map((m) => ({ d, m }))).slice(0, 6);
      const comboEx = idx.combos.filter((c) => c.rule === r.id).slice(0, 3);
      return `<section class="bl-section pr-rule" id="${r.id}" aria-labelledby="${r.id}-h">
      <h2 id="${r.id}-h"><span class="pr-rule-n">${n + 1}</span> ${B(r.name)}</h2>
      <p>${B(r.line)}</p>
      ${drinkEx.length ? `<ul class="pr-examples">${drinkEx.map(({ d, m }) => `<li><a href="${d.url}">${B(d.name)}</a> + ${pairLink(h, idx, m.s)}: ${B(m.why)}</li>`).join("")}</ul>` : ""}
      ${comboEx.length ? `<ul class="pr-combos pr-combos-sm">${comboEx.map((c) => comboCard(h, idx, art, c)).join("\n")}</ul>` : ""}
      <p>${r.post ? `<a class="pr-more" href="/blog/${r.post}/">Read the full science &rarr;</a> ` : ""}<a class="pr-more" href="/pairings/classics/?rule=${r.id}#lab-find">All ${[...idx.combos, ...idx.plates].filter((c) => c.rule === r.id).length} combinations built on this rule &rarr;</a></p>
    </section>`;
    }).join("\n    ")}`
  }));

  // ------------------------------------------------------------- chart ---
  const chartCheeses = [...new Set(wines.flatMap((w) => w.matches.map((m) => m.s)))].map((s) => idx.bySlug.get(s)).filter((i) => i.category === "Cheese").sort((a, b) => a.title.localeCompare(b.title));
  const beerCols = beers;
  if (idx.data.mc) add("pairings/meat-and-cheese-chart/index.html", mcPage(h, idx, script));
  // Wine chart upgrade (15 Nov 2026): cheese-style sections, a cheese picker,
  // tap-to-read dots, serving table and FAQ, for "wine and cheese pairing
  // chart" and the cheese-to-wine searches ("what wine goes with brie").
  const WC_STYLES = [
    ["fresh", "Fresh cheese", "What wine goes with fresh cheese like burrata and feta?", "Milky, tangy and light. Crisp whites and dry rosé keep them fresh; tannic reds turn them bitter."],
    ["goat", "Goat cheese", "What wine goes with goat cheese?", "Tangy and chalky. Sauvignon Blanc is the classic match, because both are bright and grassy."],
    ["bloomy", "Brie and soft-ripened", "What wine goes with brie and camembert?", "Buttery and mushroomy. Bubbles and Chardonnay cut the richness; light reds work at room temperature. Big tannic reds erase them."],
    ["semi", "Semi-soft and mild", "What wine goes with mild cheese like havarti and fontina?", "Gentle and creamy. Soft reds and round whites suit them; anything too big takes over."],
    ["alpine", "Alpine and nutty", "What wine goes with Gruyère and Comté?", "Nutty, sweet and savory. The most wine-friendly cheeses there are: Pinot Noir, Chardonnay and bubbles all shine."],
    ["aged", "Aged and hard", "What wine goes with aged cheddar, manchego and Parmigiano?", "Salty, firm and full of flavor crystals. They can stand up to big reds like Cabernet and Malbec, and to Chianti for the Italian ones."],
    ["washed", "Washed-rind", "What wine goes with stinky washed-rind cheese?", "Pungent rind, sweet and meaty inside. Off-dry Riesling is the most reliable match; a light red like Pinot Noir or Beaujolais suits the milder ones."],
    ["blue", "Blue cheese", "What wine goes with blue cheese?", "Salty and sharp. Sweet wine is the answer: port with Stilton and gorgonzola. Most dry wines taste thin or bitter next to a strong blue."]
  ];
  const WC_EXTRA = { epoisses: "washed", limburger: "washed", taleggio: "washed", morbier: "washed", muenster: "washed", cabrales: "blue", mimolette: "aged", "pecorino-toscano": "aged", feta: "fresh", "whipped-feta": "fresh", "crottin-de-chavignol": "goat", "sainte-maure": "goat" };
  const wcStyleOf = (slug) => WC_EXTRA[slug] || (idx.data.mc ? idx.data.mc.cheeses.find((c) => c.foods.includes(slug))?.id : "") || "";
  const wcYes = (slug) => [...wines, ...beers].flatMap((w) => w.matches.filter((m) => m.s === slug).map((m) => ({ w, why: m.why })));
  const wcNo = (slug) => wines.flatMap((w) => (w.avoid || []).filter((a) => a.s === slug).map((a) => ({ w, why: a.why })));
  const wcPick = Object.fromEntries(chartCheeses.map((c) => [c.slug, { t: c.title, u: idx.foodPage.has(c.slug) ? `/pairings/food/${c.slug}/` : `/ingredients/${c.slug}/`, y: wcYes(c.slug).map(({ w, why }) => [w.name, w.url, why, w.family]), n: wcNo(c.slug).map(({ w, why }) => [w.name, w.url, why]) }]));
  const wcFaq = [
    { q: "What wine goes best with cheese?", a: "For one bottle on a mixed board, pour Pinot Noir or a dry sparkling wine. Both have bright acid and gentle tannin, so they suit brie, Comté, Gruyère and Parmigiano without flattening any of them." },
    { q: "Is red or white wine better with cheese?", a: "White works more often than people expect. Crisp whites and bubbles suit fresh, goat and soft cheeses; light reds suit nutty, firm cheeses; big tannic reds only suit hard, aged cheeses. Tannin clashes with soft and fresh cheese, which is why Cabernet with brie or goat cheese tastes bitter." },
    { q: "What wine goes with brie?", a: "Champagne or Prosecco, Chardonnay, Pinot Noir or Beaujolais. Skip big reds like Cabernet, Malbec and Chianti: their tannin erases a mild, buttery cheese." },
    { q: "What wine goes with goat cheese?", a: "Sauvignon Blanc first, then a dry rosé. Both are bright enough for the tang. Avoid Cabernet and Merlot, whose tannin turns metallic and bitter next to fresh goat cheese." },
    { q: "What wine goes with blue cheese?", a: "Port, or another sweet dessert wine. The sweetness balances the salt. Dry sparkling wine, Chardonnay, rosé and light reds tend to taste thin or bitter next to a strong blue like Roquefort or Stilton." },
    { q: "What wine goes with aged cheddar?", a: "Cabernet Sauvignon, Merlot or Malbec for a red, oaked Chardonnay for a white, and port for dessert. Aged cheddar is salty and firm enough to stand up to tannin." },
    { q: "How should I serve wine and cheese?", a: "Take the cheese out of the fridge ahead of time so it reaches room temperature. Chill whites and rosé to about 45–50°F and sparkling wine a little colder, and serve most reds slightly cool, around 60–65°F. Go from mild to strong, and from light wine to heavy." }
  ];
  const wcStyles = WC_STYLES.map(([id, name, q, line]) => [id, name, q, line, chartCheeses.filter((c) => wcStyleOf(c.slug) === id)]).filter((x) => x[4].length);
  const wcOther = chartCheeses.filter((c) => !wcStyles.some((x) => x[4].includes(c)));
  add("pairings/wine-and-cheese-chart/index.html", page(h, {
    url: "/pairings/wine-and-cheese-chart/",
    title: "Wine and Cheese Pairing Chart (Printable)",
    name: "Wine and cheese pairing chart",
    description: `A printable wine and cheese pairing chart: ${wines.length} wines against ${chartCheeses.length} cheeses, which wine goes with brie, goat cheese, cheddar and blue, and which pairings to skip.`,
    crumbs: [["Pairings", "/pairings/"], ["Wine & Cheese Chart", "/pairings/wine-and-cheese-chart/"]],
    image: photo("pairings-chart"),
    list: wcStyles.map(([id, , q]) => [q, `/pairings/wine-and-cheese-chart/#wc-${id}`]),
    faq: wcFaq,
    updated: "2026-11-15",
    script,
    body: `
    <header class="pr-hero">
      <p class="section-kicker">Printable chart</p>
      <h1>Wine and cheese pairing chart</h1>
      <p class="pr-answer">The safest matches: Champagne with brie, Sauvignon Blanc with goat cheese, Pinot Noir with Gruyère, Cabernet with aged cheddar, Chianti with Parmigiano and port with Stilton.</p>
      <p class="pr-chart-tools"><button type="button" class="button primary" data-print>Print the chart</button> <label><input type="checkbox" data-beer> Add beer &amp; cider columns</label></p>
      <p class="bl-note">Cured meat on the board too? See the <a href="/blog/wine-and-charcuterie-board/">charcuterie board wine pairing guide</a>, meat by meat.</p>
    </header>
    <section class="wc-pick" aria-labelledby="wc-pick-h">
      <h2 id="wc-pick-h">Find a wine for your cheese</h2>
      <label class="lab-sel"><span>Pick a cheese</span><select id="wc-cheese"><option value="">Choose…</option>${chartCheeses.map((c) => `<option value="${c.slug}">${B(c.title)}</option>`).join("")}</select></label>
      <div id="wc-result" aria-live="polite"></div>
    </section>
    <div class="pr-chart-wrap">
      <table class="pr-chart" id="pr-chart">
        <caption class="sr-only">Wine and cheese pairing chart: a dot marks a recommended pairing</caption>
        <thead><tr><th scope="col">Cheese</th>${wines.map((w) => `<th scope="col" data-col="${w.slug}" style="--d:${w.color}"><a href="${w.url}"><span>${B(w.name)}</span></a></th>`).join("")}${beerCols.map((w) => `<th scope="col" class="pr-beer" data-col="${w.slug}" style="--d:${w.color}"><a href="${w.url}"><span>${B(w.name)}</span></a></th>`).join("")}</tr></thead>
        <tbody>
        ${chartCheeses.map((c) => `<tr data-row="${c.slug}"><th scope="row">${pairLink(h, idx, c.slug)}</th>${[...wines, ...beerCols].map((w) => {
          const m = w.matches.find((x) => x.s === c.slug);
          return `<td class="${w.family === "beer" ? "pr-beer" : ""}" data-col="${w.slug}"${m ? ` data-tip="${B(w.name)} + ${B(c.title)}" data-why="${B(m.why)}" data-href="${w.url}"` : ""}>${m ? `<span class="pr-dot" style="--d:${w.color}" title="${B(m.why)}" aria-label="Yes: ${B(m.why)}"></span>` : ""}</td>`;
        }).join("")}</tr>`).join("\n        ")}
        </tbody>
      </table>
    </div>
    <div class="mc-panel" id="wc-panel" aria-live="polite" hidden></div>
    <p class="bl-note">Tap a wine or a cheese to highlight its matches, and tap a dot to read why it works. <a href="/images/wine-and-cheese-chart.png">Save the chart as an image</a> for your phone or Pinterest.</p>
    ${h.printCard ? h.printCard("wine-cheese-pairing-guide", "pairings_chart_print", { lead: "The free chart shows which wines match. The 3-page guide adds 20 wine styles, the cheeses to avoid with each, serving temperatures and a craft beer section. Designed to print." }) : ""}
    <section class="bl-section" aria-labelledby="how-h">
      <h2 id="how-h">How to read it</h2>
      <p>Light, fresh cheeses sit best with crisp whites and sparkling wine; nutty, firm cheeses with light reds and Chardonnay; hard, aged cheeses with bigger reds; blue cheese with sweet port. The <a href="/pairings/how-pairing-works/">six pairing rules</a> explain why.</p>
    </section>

    ${wcStyles.map(([id, name, q, line, list]) => {
      const no = list.flatMap((c) => wcNo(c.slug).map(({ w, why }) => ({ w, c, why })));
      return `<section class="bl-section mc-family" id="wc-${id}" aria-labelledby="wc-${id}-h">
      <h2 id="wc-${id}-h">${B(q)}</h2>
      <p>${B(line)}</p>
      <ul class="mc-rows">${list.map((c) => { const yes = wcYes(c.slug).filter((x) => x.w.family !== "beer"); const best = yes[0]; return `<li><strong>${pairLink(h, idx, c.slug)}</strong>: ${yes.map(({ w }) => `<a href="${w.url}">${B(w.name)}</a>`).join(", ")}${best ? ` <span class="mc-proven">Best bet, ${B(best.w.name)}: ${B(best.why)}</span>` : ""}</li>`; }).join("")}</ul>
      ${no.length ? `<p class="wc-skip"><strong>Skip:</strong> ${no.slice(0, 4).map(({ w, c, why }) => `${B(w.name)} with ${B(c.title)} (${B(why.replace(/\.$/, "").toLowerCase())})`).join("; ")}.</p>` : ""}
    </section>`;
    }).join("\n    ")}
    ${wcOther.length ? `<section class="bl-section" aria-labelledby="wc-other-h"><h2 id="wc-other-h">More cheeses on the chart</h2><ul class="mc-rows">${wcOther.map((c) => `<li><strong>${pairLink(h, idx, c.slug)}</strong>: ${wcYes(c.slug).filter((x) => x.w.family !== "beer").map(({ w }) => `<a href="${w.url}">${B(w.name)}</a>`).join(", ")}</li>`).join("")}</ul></section>` : ""}

    <section class="bl-section" aria-labelledby="wc-serve-h">
      <h2 id="wc-serve-h">Serving temperatures and best cheeses for each wine</h2>
      <div class="mc-wrap"><table class="wc-serve">
        <thead><tr><th scope="col">Wine</th><th scope="col">Serve at</th><th scope="col">Best cheeses</th></tr></thead>
        <tbody>${wines.map((w) => `<tr><th scope="row"><a href="${w.url}">${B(w.name)}</a></th><td>${B(w.serve || "")}</td><td>${w.matches.filter((m) => idx.bySlug.get(m.s)?.category === "Cheese").slice(0, 3).map((m) => pairLink(h, idx, m.s)).join(", ")}</td></tr>`).join("")}</tbody>
      </table></div>
      <p class="bl-note">Take the cheese out of the fridge ahead of time; our <a href="/blog/temperature-guide/">temperature guide</a> has the timings. For meats, see the <a href="/pairings/meat-and-cheese-chart/">meat and cheese pairing chart</a>. Need a bottle? Our tested picks: <a href="/blog/best-champagne-under-30/">Champagne under $30</a> and <a href="/blog/best-prosecco/">the best Prosecco</a>.</p>
    </section>

    <section class="bl-section" id="faq" aria-labelledby="faq-h">
      <h2 id="faq-h">Questions</h2>
      ${faqHtml(h, wcFaq)}
    </section>
    <script type="application/json" id="wc-data">${h.jsonForScript(wcPick)}</script>`
  }));

  return out;
}

// Block for each ingredient page: drinks that match + link to the full guide.
// ------------------------------------------------------- Combination Lab ---
// 15 Nov 2026. /pairings/classics/ became the Combination Lab: 126 combos,
// 14 Perfect Plates and 43 ladders from combos.json, with filters (kind,
// season, occasion, diet, price, rule, effort), search, Surprise me, an
// in-season row (filled by pairings.js) and print cards.
const LAB_UPDATED = "2026-11-15";
const DIETS = [["vegetarian", "Vegetarian"], ["gluten-free", "Gluten-free"], ["nut-free", "Nut-free"], ["dairy-free", "Dairy-free"], ["vegan", "Vegan"]];
const SEASONS = [["spring", "Spring"], ["summer", "Summer"], ["fall", "Fall"], ["winter", "Winter"], ["holiday", "Holidays"]];
const OCCASIONS = [["party", "Party"], ["date-night", "Date night"], ["game-day", "Game day"], ["holiday", "Holiday"], ["brunch", "Brunch"], ["wine-night", "Wine night"], ["tapas-night", "Tapas night"], ["happy-hour", "Happy hour"], ["picnic", "Picnic"], ["dessert", "Dessert"], ["kids", "Kids"]];
const LEVELS = { easy: "Open and arrange", slice: "A little knife work", showpiece: "Showpiece" };
const PRICE_LABEL = { "$": "$ · budget", "$$": "$$ · mid-range", "$$$": "$$$ · splurge" };
const LAB_KINDS = [...COMBO_KINDS, { key: "plates", label: "Perfect Plates", n: 5, blurb: "Five foods for one plate. Every food pairs with at least two others on it." }];

const labId = (c) => (c.kind === "plates" ? `plate-${c.id}` : c.id);
const labAnchor = (step) => (step.startsWith("plate:") ? `plate-${step.slice(6)}` : step);

// worst verdict across the foods: skip beats check beats safe
function comboDiets(idx, c) {
  const all = idx.data.diets || {};
  const out = [];
  for (const [key, label] of DIETS) {
    const vs = c.foods.map((s) => all[s]?.[key]?.v || "check");
    if (vs.includes("skip")) continue;
    out.push({ key, label, check: vs.includes("check") });
  }
  return out;
}
function comboPrice(idx, c) {
  const tiers = c.foods.map((s) => idx.bySlug.get(s)?.priceTier || "").filter(Boolean);
  return tiers.length ? tiers.sort((a, b) => b.length - a.length)[0] : "";
}
function zeroFor(idx, name) {
  return idx.extras.find((x) => x.family === "zero" && x.name === name);
}

function labCard(h, idx, art, c) {
  const B = (t) => h.escapeHtml(t);
  const post = c.post && idx.blogSlugs.has(c.post) ? c.post : "";
  const rule = idx.ruleById.get(c.rule);
  const diets = comboDiets(idx, c);
  const price = comboPrice(idx, c);
  const drink = idx.drinkBySlug.get(c.drink);
  const beer = idx.drinkBySlug.get(c.beer);
  const zero = c.zero ? zeroFor(idx, c.zero) : null;
  const seasons = (c.season || []).filter((x) => x !== "year-round");
  const kindWord = c.kind === "plates" ? "Perfect Plate" : c.kindLabel.replace(/s$/, "");
  const search = [c.name, ...c.foods.map((s) => idx.bySlug.get(s)?.title || s), ...(c.occasion || []), ...seasons].join(" ").toLowerCase();
  const badges = [
    price ? `<span class="lab-badge lab-badge-price">${B(PRICE_LABEL[price] || price)}</span>` : "",
    ...diets.filter((d) => !d.check).map((d) => `<span class="lab-badge">${B(d.label)}</span>`),
    seasons.length ? `<span class="lab-badge lab-badge-season">${B(seasons.map((x) => SEASONS.find(([k]) => k === x)?.[1] || x).join(", "))}</span>` : `<span class="lab-badge lab-badge-season">Year-round</span>`
  ].join("");
  const checks = diets.filter((d) => d.check).map((d) => d.label.toLowerCase());
  return `<li class="pr-combo lab-card" id="c-${labId(c)}" data-kind="${c.kind}" data-season="${(c.season || []).join(" ")}" data-occ="${(c.occasion || []).join(" ")}" data-diet="${diets.map((d) => d.key).join(" ")}" data-price="${B(price)}" data-rule="${c.rule}" data-level="${c.level || ""}"${c.featured ? ' data-featured="1"' : ""} data-search="${B(search)}">
    ${photoRow(h, idx, art, c.foods)}
    <p class="pr-combo-kind">${B(kindWord)}${rule ? ` · <a href="/pairings/how-pairing-works/#${rule.id}">${B(rule.name)}</a>` : ""}</p>
    <h3>${B(c.name)}</h3>
    <p class="pr-combo-why">${B(c.why)}</p>
    <p class="pr-combo-items">${c.foods.map((s) => pairLink(h, idx, s)).join(" + ")}</p>
    ${c.bite ? `<p class="lab-bite"><b>Build the bite:</b> ${B(c.bite)}</p>` : ""}
    <p class="lab-badges">${badges}</p>
    <details class="lab-more">
      <summary>Amounts for 8, drinks &amp; tags</summary>
      ${c.for8 ? `<ul class="lab-amts">${c.foods.map((s, i) => `<li class="lab-amt"><b>${B(idx.bySlug.get(s)?.title || s)}</b> ${B(c.for8[i] || "")}</li>`).join("")}</ul>` : ""}
      <p class="lab-drinks">${drink ? `<span><b>Pour:</b> <a href="${drink.url}">${B(drink.name)}</a>${c.drink_note ? ` <em>${B(c.drink_note)}</em>` : ""}</span>` : ""}${beer && beer !== drink ? `<span><b>Beer:</b> <a href="${beer.url}">${B(beer.name)}</a></span>` : ""}${zero ? `<span><b>No alcohol:</b> <a href="${zero.url}">${B(zero.name)}</a></span>` : c.zero ? `<span><b>No alcohol:</b> ${B(c.zero)}</span>` : ""}</p>
      <p class="lab-tags">${c.level ? `<span><b>Effort:</b> ${B(LEVELS[c.level] || c.level)}</span>` : ""}${(c.occasion || []).length ? `<span><b>Good for:</b> ${B(c.occasion.map((o) => OCCASIONS.find(([k]) => k === o)?.[1] || o).join(", "))}</span>` : ""}${checks.length ? `<span><b>Check labels for:</b> ${B(checks.join(", "))}</span>` : ""}</p>
    </details>
    <p class="pr-combo-links"><a class="pr-more" href="${builderPreset(c.foods, 8, `pairings_lab_${labId(c)}`)}">Build a board with this &rarr;</a>${post ? ` <a class="pr-more" href="/blog/${post}/">Why it works</a>` : ""} <a class="lab-tweak" href="/pairings/?check=${c.foods.join(",")}#finder">Swap a food</a> <button type="button" class="lab-print" data-print="c-${labId(c)}">Print card</button> <a class="lab-list" href="/pairings/list/?c=${encodeURIComponent(labId(c))}" data-plate-list>Shopping list</a></p>
  </li>`;
}

// Shopping list for one plate (15 Nov 2026): /pairings/list/?c=<Lab card id>
// or ?f=slug,slug[&d=drink,drink] from "Check or complete a bite". One noindex
// page, filled in by its own script from the data embedded below, so every one
// of the 150 Lab cards (and any bite) gets a printable checklist without 150
// thin pages. The Lab and the checker unlock it with an email (pairings.js).
const LIST_AISLE = { "Cheese": "Cheese counter", "Cured Meat & Seafood": "Deli & meat", "Fruit": "Produce", "Crackers & Breads": "Bakery & crackers", "Spreads, Jams & Honey": "Pantry", "Nuts & Seeds": "Pantry", "Pickles, Olives & Briny": "Pickles & olives", "Finishing Touches": "Extras" };
const LIST_AMOUNT = { "Cheese": "8 oz", "Cured Meat & Seafood": "6 oz", "Fruit": "2 cups", "Crackers & Breads": "1 box (about 40)", "Spreads, Jams & Honey": "1/2 cup", "Nuts & Seeds": "1 cup", "Pickles, Olives & Briny": "1 cup", "Finishing Touches": "a small handful" };
function listPage(h, idx) {
  const all = [...idx.drinks, ...idx.extras];
  const dn = new Map(all.map((d, i) => [d.slug, i]));
  const used = new Set();
  const cards = [...idx.combos, ...idx.plates].map((c) => {
    c.foods.forEach((s) => used.add(s));
    const z = c.zero ? zeroFor(idx, c.zero) : null;
    return [labId(c), c.name, c.why, c.bite || "", c.foods, c.for8 || [], [c.drink, c.beer, z && z.slug].map((x) => (x && dn.has(x) ? dn.get(x) : -1)), c.drink_note || ""];
  });
  for (const f of idx.foods) used.add(f.slug);
  const foods = {};
  for (const [slug, it] of idx.bySlug) foods[slug] = [it.title, LIST_AISLE[it.category] || "Extras", LIST_AMOUNT[it.category] || "", idx.foodPage.has(slug) ? 1 : 0, (idx.drinksFor.get(slug) || []).slice(0, 3).map((x) => dn.get(x.d.slug)).filter((n) => n !== undefined)];
  const data = { c: cards, f: foods, d: all.map((d) => [d.slug, d.name, d.url, d.family]) };
  const B = (t) => h.escapeHtml(t);
  return h.layout({
    title: "Your Charcuterie Shopping List | Charcuterie Lab",
    description: "A printable shopping list for one pairing from the Charcuterie Lab Combination Lab: amounts for 8, what to pour and how to build the bite.",
    canonical: "/pairings/list/",
    image: "/images/pairings-hub.webp",
    head: `  <meta name="robots" content="noindex, follow">`,
    body: `<main class="bl-main pr-main">
<!--no-offers-->
  <div class="bl-inner pr-inner pl-page">
    ${hubNav("/pairings/list/")}
    <header class="pr-hero pl-hero">
      <p class="section-kicker">Shopping list · for 8 guests</p>
      <h1 id="pl-title">Your shopping list</h1>
      <p class="pr-answer" id="pl-why">Pick a plate in the <a href="/pairings/classics/">Combination Lab</a>, or check a bite in the <a href="/pairings/#finder">Pairing Finder</a>, then tap <strong>Shopping list</strong>.</p>
    </header>
    <div id="pl-out" hidden>
      <section class="pl-list" aria-labelledby="pl-buy-h"><h2 id="pl-buy-h">What to buy</h2><div id="pl-buy"></div></section>
      <section class="pl-list" aria-labelledby="pl-drink-h" id="pl-drinks-sec"><h2 id="pl-drink-h">What to pour</h2><ul class="pl-checks" id="pl-drinks"></ul></section>
      <section class="pl-bite" id="pl-bite-sec" aria-labelledby="pl-bite-h"><h2 id="pl-bite-h">Build the bite</h2><p id="pl-bite"></p></section>
      <p class="pl-actions"><button type="button" class="button primary" data-pl-print>Print the list</button> <button type="button" class="button" data-pl-copy>Copy link</button> <a class="pr-more" id="pl-back" href="/pairings/classics/">Back to the card &rarr;</a></p>
      <p class="bl-note">Amounts are for 8 guests when this is one of several things on the board. A star ingredient and what to pair it with lands every Wednesday in the <a href="/newsletter/">Lab Report</a>.</p>
    </div>
    <p class="pl-print-foot">charcuterielab.com/pairings/classics/ · Charcuterie Lab</p>
  </div>
</main>
<script type="application/json" id="pl-data">${h.jsonForScript(data)}</script>
<script>${LIST_JS}</script>`
  });
}
const LIST_JS = `(function(){var D=JSON.parse(document.getElementById("pl-data").textContent),q=new URLSearchParams(location.search),$=function(i){return document.getElementById(i)},e=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
var c=q.get("c"),card=c&&D.c.find(function(x){return x[0]===c}),foods=[],drinks=[],title="",why="",bite="",note="";
if(card){title=card[1];why=card[2];bite=card[3];foods=card[4].map(function(s,i){return[s,card[5][i]]});drinks=card[6].filter(function(n){return n>=0});note=card[7];$("pl-back").href="/pairings/classics/#c-"+encodeURIComponent(c)}
else if(q.get("f")){foods=q.get("f").split(",").filter(function(s){return D.f[s]}).slice(0,6).map(function(s){return[s,""]});var ds=(q.get("d")||"").split(","),ix=D.d.map(function(d){return d[0]});drinks=ds.map(function(s){return ix.indexOf(s)}).filter(function(n){return n>=0});
 if(!drinks.length){var cnt={};foods.forEach(function(f){D.f[f[0]][4].forEach(function(n){cnt[n]=(cnt[n]||0)+1})});drinks=Object.keys(cnt).map(Number).sort(function(a,b){return cnt[b]-cnt[a]}).slice(0,3)}
 title=foods.map(function(f){return D.f[f[0]][0]}).join(" + ");$("pl-back").href="/pairings/?check="+foods.map(function(f){return f[0]}).join(",")+"#finder";$("pl-back").textContent="Back to the bite \u2192"}
if(!foods.length)return;
document.title="Shopping list: "+title+" | Charcuterie Lab";$("pl-title").textContent="Shopping list: "+title;$("pl-why").textContent=why||"Every food in this bite, with an amount for 8 guests, what to pour, and a box to tick at the store.";
var by={},order=[];foods.forEach(function(f){var x=D.f[f[0]];if(!by[x[1]]){by[x[1]]=[];order.push(x[1])}by[x[1]].push(f)});
$("pl-buy").innerHTML=order.map(function(a){return'<h3>'+e(a)+'</h3><ul class="pl-checks">'+by[a].map(function(f){var x=D.f[f[0]];return'<li><label><input type="checkbox"> <span><strong>'+e(x[0])+'</strong> <em>'+e(f[1]||x[2])+'</em></span></label> <a href="'+(x[3]?"/pairings/food/":"/ingredients/")+e(f[0])+'/">pairings</a></li>'}).join("")+'</ul>'}).join("");
if(drinks.length){$("pl-drinks").innerHTML=drinks.map(function(n,i){var d=D.d[n];return'<li><label><input type="checkbox"> <span><strong>'+e(d[1])+'</strong>'+(i===0&&note?' <em>'+e(note)+'</em>':'')+'</span></label> <a href="'+e(d[2])+'">why</a></li>'}).join("")}else $("pl-drinks-sec").hidden=true;
if(bite)$("pl-bite").textContent=bite;else $("pl-bite-sec").hidden=true;
$("pl-out").hidden=false;
document.querySelector("[data-pl-print]").addEventListener("click",function(){window.print()});
document.querySelector("[data-pl-copy]").addEventListener("click",function(ev){var b=ev.currentTarget;(navigator.clipboard?navigator.clipboard.writeText(location.href):Promise.reject()).then(function(){b.textContent="Link copied"},function(){b.textContent="Copy the address bar"})});
})();`;

function ladderRow(h, idx, l, base = "") {
  const B = (t) => h.escapeHtml(t);
  const byStep = new Map([...idx.combos.map((c) => [c.id, c]), ...idx.plates.map((c) => [`plate:${c.id}`, c])]);
  const title = (s) => idx.bySlug.get(s)?.title || s;
  let prev = [];
  const steps = l.steps.map((s, i) => {
    const c = byStep.get(s);
    const added = c.foods.filter((f) => !prev.includes(f));
    prev = c.foods;
    const label = i === 0 ? c.foods.map(title).join(" + ") : c.kind === "plates" ? c.name.replace(/^The /, "") : `+ ${added.map(title).join(" + ")}`;
    return `<li><a href="${base}#c-${labAnchor(s)}"><span class="lab-step-n">${c.foods.length}</span> ${B(label)}</a></li>`;
  });
  const branches = (l.branches || []).map((b) => {
    const c = byStep.get(b.id), from = byStep.get(b.from);
    return `<a href="${base}#c-${labAnchor(b.id)}">${B(c.name)}</a>`;
  });
  return `<li class="lab-ladder"><h3>${B(l.name)}</h3><ol class="lab-steps">${steps.join("")}</ol>${branches.length ? `<p class="lab-branch">Or try: ${branches.join(" · ")}</p>` : ""}</li>`;
}

function labPage(h, idx, art, script, { image = "", hero = "" } = {}) {
  const B = (t) => h.escapeHtml(t);
  const all = [...idx.combos, ...idx.plates];
  const n = (k) => all.filter((c) => c.kind === k).length;
  const has = (field, key) => all.some((c) => (c[field] || []).includes(key));
  const dietCount = (key) => all.filter((c) => comboDiets(idx, c).some((d) => d.key === key)).length;
  const sel = (id, label, opts) => `<label class="lab-sel"><span>${label}</span><select id="${id}"><option value="">Any</option>${opts.map(([v, l]) => `<option value="${v}">${B(l)}</option>`).join("")}</select></label>`;
  const faq = [
    { q: "What are the best charcuterie combinations?", a: "The most loved are brie with fig jam, prosciutto with melon, Manchego with membrillo (quince paste), aged cheddar with apple, and gorgonzola with honey. Each one pairs a salty or rich food with something sweet, tart or crunchy." },
    { q: "What is a charcuterie trio?", a: "A trio is three foods eaten in one bite, where each one pairs with the other two. The third food usually adds what the pair is missing: crunch (walnuts, almonds), sweetness (honey, jam) or acid (a pickle or fruit)." },
    { q: "How much of each food do I need for 8 people?", a: "Every card in the Combination Lab lists amounts for 8 when the combination is one feature among several on the board. For a whole board, the Party Planner works out cheese and meat by guest count." },
    { q: "Which charcuterie combinations work without alcohol?", a: "All of them. Every card names a no-alcohol drink, such as sparkling apple cider with brie, tart cherry spritz with blue cheese, or unsweetened iced tea with smoked sausage." },
    { q: "Why do these combinations work?", a: "Six rules explain almost all of them: fat tames tannin, acid cuts richness, salt loves sweet, match the weight, what grows together goes together, and contrast the texture. Each card names the rule it uses." }
  ];
  const body = `
    <header class="pr-hero lab-hero${hero ? " pr-hero-photo" : ""}">
      <div>
      <p class="section-kicker">The Combination Lab</p>
      <h1>The best charcuterie combinations: ${all.length} pairs, trios, quartets &amp; plates</h1>
      <p class="pr-answer">The best-loved charcuterie combinations are brie with fig jam, prosciutto with melon, Manchego with membrillo, and aged cheddar with apple. Add walnuts, honey or a pickle to turn a pair into a trio, and keep going to build a whole plate.</p>
      <ul class="lab-stats">
        <li><b>${n("pairs")}</b> pairs</li><li><b>${n("trios")}</b> trios</li><li><b>${n("quartets")}</b> quartets</li><li><b>${n("plates")}</b> Perfect Plates</li><li><b>${idx.ladders.length}</b> ladders</li>
      </ul>
      <p class="bl-note">Every food in every combination is a tested pairing with the others, taken from our ingredient pages. Each card has how to build the bite, amounts for 8, a wine, a beer and a no-alcohol drink.</p>
      </div>
      ${hero}
    </header>

    <nav class="lab-jump" aria-label="On this page"><a href="#lab-season">In season</a><a href="#lab-ladders">Ladders</a>${LAB_KINDS.map((k) => `<a href="#k-${k.key}">${k.label}</a>`).join("")}<a href="#faq">Questions</a></nav>

    <section class="bl-section lab-season" id="lab-season" aria-labelledby="lab-season-h" hidden>
      <h2 id="lab-season-h">In season now</h2>
      <p class="bl-note" id="lab-season-note">Combinations built around what's good right now.</p>
      <ul class="pr-combos" id="lab-season-list"></ul>
    </section>

    <section class="bl-section" id="lab-ladders" aria-labelledby="lab-ladders-h">
      <h2 id="lab-ladders-h">Build it up: ${idx.ladders.length} ladders</h2>
      <p class="bl-note">Start with a pair, then add one food at a time. Each step stays a tested match with everything before it. Tap a step to jump to its card.</p>
      <ul class="lab-ladders">
${idx.ladders.slice(0, 9).map((l) => ladderRow(h, idx, l)).join("\n")}
      </ul>
      <details class="lab-all-ladders"><summary>Show all ${idx.ladders.length} ladders</summary>
      <ul class="lab-ladders">
${idx.ladders.slice(9).map((l) => ladderRow(h, idx, l)).join("\n")}
      </ul>
      </details>
    </section>

    <section class="bl-section lab-tools" id="lab-find" aria-labelledby="lab-find-h">
      <h2 id="lab-find-h">Find a combination</h2>
      <div class="pr-filter" role="group" aria-label="Show">
        <button type="button" class="pr-chip" aria-pressed="true" data-lfilter="all">All (${all.length})</button>
        ${LAB_KINDS.map((k) => `<button type="button" class="pr-chip" aria-pressed="false" data-lfilter="${k.key}">${k.label} (${n(k.key)})</button>`).join("")}
      </div>
      <div class="lab-filters">
        <label class="lab-sel lab-q"><span>Search</span><input id="lab-q" type="search" placeholder="honey, prosciutto, brunch…"></label>
        ${sel("lab-season-f", "Season", SEASONS.filter(([k]) => has("season", k)))}
        ${sel("lab-occ", "Occasion", OCCASIONS.filter(([k]) => has("occasion", k)))}
        ${sel("lab-diet", "Diet", DIETS.filter(([k]) => dietCount(k)).map(([k, l]) => [k, `${l} (${dietCount(k)})`]))}
        ${sel("lab-price", "Price", Object.entries(PRICE_LABEL))}
        ${sel("lab-rule", "Why it works", idx.rules.map((r) => [r.id, r.name]))}
        ${sel("lab-level", "Effort", Object.entries(LEVELS))}
      </div>
      <p class="lab-bar"><span id="lab-count" aria-live="polite">Showing all ${all.length}</span> <button type="button" class="pr-chip pr-chip-surprise" id="lab-surprise">Surprise me</button> <button type="button" class="pr-chip" id="lab-reset">Reset</button> <button type="button" class="pr-chip" id="lab-print-all">Print the cards shown</button></p>
      <p class="bl-note lab-dietnote">Diet tags follow our ingredient diet guide: a food marked "check labels" (like cheese rennet for vegetarians) still counts, and the card says what to check.</p>
    </section>

    ${LAB_KINDS.map((k) => `<section class="bl-section" data-kind-section="${k.key}" id="k-${k.key}" aria-labelledby="k-${k.key}-h">
      <h2 id="k-${k.key}-h">${k.label} <span class="lab-n">(${n(k.key)})</span></h2>
      <p class="bl-note">${k.blurb}</p>
      <ul class="pr-combos lab-cards">
${all.filter((c) => c.kind === k.key).map((c) => labCard(h, idx, art, c)).join("\n")}
      </ul>
    </section>`).join("\n    ")}
    <p class="lab-empty" id="lab-empty" hidden>Nothing matches all of those. Try removing a filter.</p>

    <section class="bl-section" id="faq" aria-labelledby="faq-h">
      <h2 id="faq-h">Questions</h2>
      ${faqHtml(h, faq)}
    </section>
    <p class="bl-note">Want to build your own? Pick a food or two in <a href="/pairings/?check=brie,fig-jam#finder">Check or complete a bite</a> and it suggests what to add, or read <a href="/pairings/how-pairing-works/">the six rules</a>.</p>`;
  return page(h, {
    url: "/pairings/classics/",
    title: `Best Charcuterie Combinations: ${all.length} Pairs, Trios & Plates`,
    name: "The Combination Lab: charcuterie pairs, trios, quartets and plates",
    description: `${all.length} charcuterie combinations that work, from brie and fig jam to five-food plates, with how to build each bite, amounts for 8 and what to pour.`,
    crumbs: [["Pairings", "/pairings/"], ["Combination Lab", "/pairings/classics/"]],
    list: all.map((c) => [c.name, `/pairings/classics/#c-${labId(c)}`]),
    faq,
    updated: LAB_UPDATED,
    image,
    script,
    body
  });
}

// ------------------------------------------------- meat & cheese chart ---
// 15 Nov 2026. /pairings/meat-and-cheese-chart/: 6 cured-meat families x 7
// cheese families from content/pairings/meat-cheese.json, rated 0-3 with a
// reason, plus the proven pairs (both foods list each other or one explains
// the other) from the ingredient pages. Built for "meat and cheese pairing
// chart", which Google was sending to /blog/charcuterie-chart/.
const MC_UPDATED = "2026-11-15";
const MC_SCORE = [
  { word: "Skip", cls: "mc-s0" },
  { word: "With a bridge", cls: "mc-s1" },
  { word: "Good", cls: "mc-s2" },
  { word: "Classic", cls: "mc-s3" }
];
export function mcFamilyOf(idx, slug) {
  const mc = idx.data.mc;
  if (!mc) return null;
  return mc.meats.find((m) => m.foods.includes(slug)) || mc.cheeses.find((c) => c.foods.includes(slug)) || null;
}
function mcProven(idx, meat, cheese, max = 3) {
  const out = [];
  for (const a of meat.foods) for (const b of cheese.foods) {
    if (!idx.bySlug.has(a) || !idx.bySlug.has(b) || !idx.graph.get(a).has(b)) continue;
    out.push({ a, b, why: idx.reasons.get(key(a, b)) || "", s: (idx.explainedBy.has(`${a}>${b}`) ? 2 : 0) + (idx.explainedBy.has(`${b}>${a}`) ? 2 : 0) + (idx.foodPage.has(a) ? 1 : 0) + (idx.foodPage.has(b) ? 1 : 0) });
  }
  return out.sort((x, y) => y.s - x.s).slice(0, max);
}
function mcValidate(idx, errors) {
  const mc = idx.data.mc;
  if (!mc) return;
  for (const f of [...mc.meats, ...mc.cheeses]) for (const s of f.foods) if (!idx.bySlug.has(s)) errors.push(`meat-cheese ${f.id}: unknown ingredient ${s}`);
  for (const m of mc.meats) for (const c of mc.cheeses) {
    const cell = mc.cells[m.id]?.[c.id];
    if (!cell || !(cell[0] >= 0 && cell[0] <= 3) || !cell[1]) errors.push(`meat-cheese: missing or bad cell ${m.id} x ${c.id}`);
  }
}
function mcPage(h, idx, script) {
  const B = (t) => h.escapeHtml(t);
  const mc = idx.data.mc;
  const title = (s) => idx.bySlug.get(s)?.title || s;
  const cell = (m, c) => mc.cells[m.id][c.id];
  const classics = mc.meats.map((m) => [m, mc.cheeses.filter((c) => cell(m, c)[0] === 3)]);
  const faq = [
    { q: "What cheese goes best with salami?", a: "Firm and semi-soft cheeses: provolone, havarti, aged cheddar, manchego and Parmigiano. They are salty and firm like the salami, so neither gets lost. Fresh mozzarella works too on an antipasto plate." },
    { q: "What cheese goes with prosciutto?", a: "Burrata and fresh mozzarella for contrast, or Parmigiano-Reggiano for a same-region match. Goat cheese and brie work with a sweet extra like fig jam or melon. Avoid strong blues, which drown the ham." },
    { q: "What cheese goes with pepperoni or chorizo?", a: "Something cool and creamy to calm the heat (fresh mozzarella, burrata, havarti, provolone) or something firm enough to stand up to it, like manchego. Go easy on blue cheese with hot salami." },
    { q: "Which meat and cheese pairings should I avoid?", a: "Hot salami with a strong blue cheese, and delicate prosciutto with a strong blue or a very smoky cheese. When two loud flavors meet, add a sweet bridge such as honey or fig jam, or keep them apart on the board." },
    { q: "How many meats and cheeses should a charcuterie board have?", a: "Three meats and three cheeses cover most boards: one ham, one salami and one spicy or smoked meat, with one soft, one semi-soft and one aged cheese. That gives every meat at least one classic partner on this chart." }
  ];
  const used = new Set(mc.meats.flatMap((m) => mc.cheeses.map((c) => cell(m, c)[0])));
  const legend = `<ul class="mc-legend">${[3, 2, 1, 0].filter((n) => used.has(n)).map((n) => `<li><span class="mc-chip ${MC_SCORE[n].cls}">${MC_SCORE[n].word}</span> ${["Skip it", "Works with honey, jam or fruit in the bite", "A good match", "A classic: always works"][n]}</li>`).join("")}</ul>`;
  const table = `<div class="mc-wrap"><table class="mc-chart" id="mc-chart">
        <caption class="sr-only">Meat and cheese pairing chart: each cell rates a cured meat family with a cheese family</caption>
        <thead><tr><th scope="col" class="mc-corner">Meat ↓ · Cheese →</th>${mc.cheeses.map((c) => `<th scope="col" data-mcol="${c.id}"><strong>${B(c.name)}</strong><span>${B(c.short)}</span></th>`).join("")}</tr></thead>
        <tbody>
        ${mc.meats.map((m) => `<tr data-mrow="${m.id}"><th scope="row"><a href="#mc-${m.id}"><strong>${B(m.name)}</strong><span>${B(m.short)}</span></a></th>${mc.cheeses.map((c) => { const [n, why] = cell(m, c); return `<td data-mcol="${c.id}"><button type="button" class="mc-chip ${MC_SCORE[n].cls}" data-mc="${m.id}|${c.id}" title="${B(why)}">${MC_SCORE[n].word}</button></td>`; }).join("")}</tr>`).join("\n        ")}
        </tbody>
      </table></div>`;
  // per-cell details for the tap panel (script reads this)
  const detail = Object.fromEntries(mc.meats.flatMap((m) => mc.cheeses.map((c) => [`${m.id}|${c.id}`, { t: `${m.name} + ${c.name}`, s: MC_SCORE[cell(m, c)[0]].word, w: cell(m, c)[1], p: mcProven(idx, m, c).map((x) => `${title(x.a)} + ${title(x.b)}`), q: mcProven(idx, m, c, 1).map((x) => `/pairings/?check=${x.a},${x.b}#finder`)[0] || "" }])));
  const body = `
    <header class="pr-hero">
      <p class="section-kicker">Printable chart</p>
      <h1>Meat and cheese pairing chart</h1>
      <p class="pr-answer">Match the meat's style to the cheese's: silky prosciutto with burrata or Parmigiano, salami with provolone or aged cheddar, spicy chorizo with manchego or fresh mozzarella, and smoked sausage with colby jack or sharp cheddar.</p>
      <p class="pr-chart-tools"><button type="button" class="button primary" data-mc-print>Print the chart</button> <a class="pr-more" href="/pairings/wine-and-cheese-chart/">Wine and cheese chart &rarr;</a></p>
    </header>
    ${legend}
    ${table}
    <div class="mc-panel" id="mc-panel" aria-live="polite" hidden></div>
    <p class="bl-note">Tap any square for the reason and the exact pairs our ingredient guides back up. Rows are families of cured meat; columns are families of cheese.</p>

    <section class="bl-section" aria-labelledby="mc-quick-h">
      <h2 id="mc-quick-h">The classic pairings at a glance</h2>
      <ul class="mc-quick">${classics.map(([m, cs]) => `<li><a href="#mc-${m.id}"><strong>${B(m.name)}</strong></a>: ${cs.map((c) => B(c.name.toLowerCase())).join(", ")}</li>`).join("")}</ul>
    </section>

    ${mc.meats.map((m) => {
      const rows = [...mc.cheeses].sort((a, b) => cell(m, b)[0] - cell(m, a)[0]);
      const foodLinks = m.foods.filter((s) => idx.bySlug.has(s)).map((s) => pairLink(h, idx, s));
      return `<section class="bl-section mc-family" id="mc-${m.id}" aria-labelledby="mc-${m.id}-h">
      <h2 id="mc-${m.id}-h">${B(m.q || `What cheese goes with ${m.name.toLowerCase()}?`)}</h2>
      <p>${B(m.line)} Includes ${foodLinks.join(", ")}.</p>
      <ul class="mc-rows">${rows.map((c) => {
        const [n, why] = cell(m, c);
        const proven = mcProven(idx, m, c);
        return `<li class="${MC_SCORE[n].cls}-row"><span class="mc-chip ${MC_SCORE[n].cls}">${MC_SCORE[n].word}</span> <strong>${B(c.name)}</strong> <em>(${B(c.short)})</em>: ${B(why)}${proven.length ? ` <span class="mc-proven">Proven: ${proven.map((x) => `<a href="/pairings/?check=${x.a},${x.b}#finder">${B(title(x.a))} + ${B(title(x.b))}</a>`).join(", ")}</span>` : ""}</li>`;
      }).join("")}</ul>
    </section>`;
    }).join("\n    ")}

    <section class="bl-section" aria-labelledby="mc-how-h">
      <h2 id="mc-how-h">How the chart works</h2>
      <p>Two rules do most of the work. <a href="/pairings/how-pairing-works/#weight">Match the weight</a>: delicate ham with gentle cheese, bold salami with firm, aged cheese. And <a href="/pairings/how-pairing-works/#texture">contrast the texture</a>: cool, creamy cheese against chewy or <a href="/blog/spicy-salami-and-wine/">spicy meat</a>. Same-region pairs, like jamón with manchego or Parma ham with Parmigiano, work for a third reason: <a href="/pairings/how-pairing-works/#place">what grows together goes together</a>. When a square says "with a bridge", add a sweet note such as <a href="/ingredients/honey/">honey</a>, <a href="/ingredients/fig-jam/">fig jam</a> or <a href="/ingredients/pears/">pear</a>. Build whole combinations in the <a href="/pairings/classics/">Combination Lab</a>, or test your own in <a href="/pairings/?check=prosciutto-di-parma,burrata#finder">Check or complete a bite</a>.</p>
    </section>

    <section class="bl-section" id="faq" aria-labelledby="faq-h">
      <h2 id="faq-h">Questions</h2>
      ${faqHtml(h, faq)}
    </section>
    <script type="application/json" id="mc-data">${h.jsonForScript(detail)}</script>`;
  return page(h, {
    url: "/pairings/meat-and-cheese-chart/",
    title: "Meat and Cheese Pairing Chart (Printable)",
    name: "Meat and cheese pairing chart",
    description: "A printable meat and cheese pairing chart: which cheeses go with prosciutto, salami, pepperoni, chorizo, summer sausage, ham and bresaola, with the reason for each.",
    crumbs: [["Pairings", "/pairings/"], ["Meat & Cheese Chart", "/pairings/meat-and-cheese-chart/"]],
    image: "/images/meat-and-cheese-chart.png",
    list: mc.meats.map((m) => [m.q || `What cheese goes with ${m.name.toLowerCase()}`, `/pairings/meat-and-cheese-chart/#mc-${m.id}`]),
    faq,
    updated: MC_UPDATED,
    script,
    body
  });
}

export function ingredientPairingBlock(h, idx, item) {
  if (!idx) return "";
  const drinks = (idx.drinksFor.get(item.slug) || []).filter((x) => x.d.family === "wine" || x.d.family === "beer" || x.d.family === "spirits").slice(0, 6);
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
    ...["drinks", "wine", "beer", "cocktails", "zero-proof", "food", "classics", "how-pairing-works", "wine-and-cheese-chart", ...(idx.data.mc ? ["meat-and-cheese-chart"] : [])].map((s) => ({ loc: `/pairings/${s}/`, lastmod: UPDATED, priority: "0.8" })),
    ...idx.drinks.map((d) => ({ loc: d.url, lastmod: UPDATED, priority: "0.8" })),
    ...idx.foods.map((f) => ({ loc: f.url, lastmod: UPDATED, priority: "0.8" }))
  ];
}

// ------------------------------------------------------ blog post links ---
// Up to `max` Pairings Hub pages that fit one blog post: a topic guide when the
// post is about wine, beer, cocktails or pairing, the "What goes with X" page
// for ingredients the post talks about most, and the page for any drink the
// post names. Every post gets at least one link (the hub itself as fallback).
// `mentions` is a Map ingredient slug -> times the post mentions it.
const HUB_TOPICS = [
  [/wine/i, "/pairings/wine/", "Wine and cheese pairing guide", "pairings-wine.webp"],
  [/wine|chart/i, "/pairings/wine-and-cheese-chart/", "Wine and cheese pairing chart", "pairings-chart.webp"],
  [/beer|cider|oktoberfest/i, "/pairings/beer/", "Beer and cheese pairing guide", "pairings-beer.webp"],
  [/cocktail|spirit|whiske?y|bourbon|gin\b|martini/i, "/pairings/cocktails/", "Cocktails for a charcuterie board", "pairings-cocktails.webp"],
  [/mocktail|non.?alcoholic|zero.?proof|kids|baby shower/i, "/pairings/zero-proof/", "Non-alcoholic drinks for charcuterie", "pairings-zero-proof.webp"],
  [/drink/i, "/pairings/drinks/", "Drink pairings for charcuterie", "pairings-wine.webp"],
  [/pair|combination|combo|flavor|science|contrast|bridge/i, "/pairings/how-pairing-works/", "How food and wine pairing works", "pairings-hero.webp"],
  [/pair|combination|combo/i, "/pairings/classics/", "Best charcuterie combinations", "pairings-hero.webp"]
];

export function postPairingLinks(idx, { title, text, mentions }, max = 4) {
  if (!idx) return [];
  const out = [];
  const seen = new Set();
  const add = (x) => { if (x && !seen.has(x.url) && out.length < max) { seen.add(x.url); out.push(x); } };
  const hub = (u, label, img) => ({ url: u, label, kicker: "Pairing guide", image: `/images/pairings/${img}` });
  const t = String(title);
  const hubs = HUB_TOPICS.filter(([re]) => re.test(t)).map(([, u, label, img]) => hub(u, label, img));
  const titleLow = t.toLowerCase();
  const foods = [...mentions]
    .filter(([s]) => idx.foodPage.has(s))
    .map(([s, n]) => ({ s, n: n + (titleLow.includes(idx.bySlug.get(s).title.toLowerCase()) ? 100 : 0) }))
    .sort((a, b) => b.n - a.n || a.s.localeCompare(b.s))
    .map(({ s }) => {
      const it = idx.bySlug.get(s);
      return { url: `/pairings/food/${s}/`, label: `What goes with ${it.title}`, kicker: "Food pairing", image: it.image || "" };
    });
  const drinkCount = new Map();
  for (const [re, slug] of DRINK_WORDS) {
    const n = (String(text).match(new RegExp(re.source, "gi")) || []).length + (re.test(t) ? 100 : 0);
    if (n) drinkCount.set(slug, (drinkCount.get(slug) || 0) + n);
  }
  const drinks = [...drinkCount]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([slug]) => idx.drinkBySlug.get(slug))
    .filter(Boolean)
    .map((d) => ({ url: d.url, label: `${d.name} and cheese`, kicker: d.familyLabel === "Wine" ? "Wine pairing" : "Beer pairing", image: `/images/pairings/pairings-${d.url.split("/")[2]}-${d.slug}.webp` }));
  hubs.slice(0, 2).forEach(add);
  foods.slice(0, 2).forEach(add);
  drinks.slice(0, 1).forEach(add);
  [...foods.slice(2), ...drinks.slice(1)].forEach(add);
  if (out.length < 2) add(hub("/pairings/", "The Charcuterie Pairings Hub", "pairings-hero.webp"));
  if (out.length < 2) add(hub("/pairings/classics/", "Best charcuterie combinations", "pairings-hero.webp"));
  return out;
}
