// Dietary Hub: /dietary/
//
// Every page is generated from two files:
//   content/dietary/ingredient-diets.json  a verdict (safe / check / skip) and
//                                          a reason per ingredient per diet,
//                                          made by scripts/make_ingredient_diets.py
//   content/dietary/pages.json             the copy: diet pages, answer pages,
//                                          sources
// The build fails if any ingredient is missing a verdict, a page names an
// unknown ingredient or source, or a quick answer runs past its word limit.
//
// Pages: the hub with the Diet Checker, one page per diet, answer pages under
// /dietary/questions/, /dietary/how-we-classify/ and /dietary/mixed-diets/.
// Also exports the "Diet notes" block shown on every ingredient page.

import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const DIET_ORDER = ["gluten-free", "nut-free", "vegetarian", "vegan", "dairy-free"];
const LABEL = { "gluten-free": "Gluten-free", "nut-free": "Nut-free", vegetarian: "Vegetarian", vegan: "Vegan", "dairy-free": "Dairy-free" };
const PAGE = { "gluten-free": "/dietary/gluten-free/", "nut-free": "/dietary/nut-free/", vegetarian: "/dietary/vegetarian/", vegan: "/dietary/vegan/", "dairy-free": "/dietary/vegan/" };
const VERDICT = {
  safe: { code: 0, label: "Safe", cls: "dt-safe" },
  check: { code: 1, label: "Check the label", cls: "dt-check" },
  skip: { code: 2, label: "Skip", cls: "dt-skip" }
};
const CODE = ["safe", "check", "skip"];
const MAX_ANSWER = 40;
const MAX_Q_ANSWER = 45;
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
const utm = (campaign) => `utm_source=charcuterielab&utm_medium=site&utm_campaign=${campaign}`;

export async function loadDietary(root) {
  try {
    const dir = join(root, "content", "dietary");
    const [pages, verdicts] = await Promise.all([
      readFile(join(dir, "pages.json"), "utf8").then(JSON.parse),
      readFile(join(dir, "ingredient-diets.json"), "utf8").then(JSON.parse)
    ]);
    return { pages, verdicts };
  } catch (e) {
    if (e.code === "ENOENT") return null;
    throw e;
  }
}

// ------------------------------------------------------------------ index ---
export function dietaryIndex(data, ingredients, boards = []) {
  const errors = [];
  const bySlug = new Map(ingredients.map((i) => [i.slug, i]));
  const { pages, verdicts } = data;
  for (const i of ingredients) {
    const v = verdicts[i.slug];
    if (!v) { errors.push(`no diet verdicts for ingredient "${i.slug}" (re-run scripts/make_ingredient_diets.py)`); continue; }
    for (const d of DIET_ORDER) {
      if (!v[d] || !VERDICT[v[d].v] || !v[d].why) errors.push(`${i.slug}: missing or bad "${d}" verdict`);
    }
  }
  for (const s of Object.keys(verdicts)) if (!bySlug.has(s)) errors.push(`verdicts for unknown ingredient "${s}"`);
  const need = (s, where) => { if (!bySlug.has(s)) errors.push(`${where}: unknown ingredient "${s}"`); };
  const src = (id, where) => { if (!pages.sources[id]) errors.push(`${where}: unknown source "${id}"`); };

  const diets = pages.diets;
  const dietBySlug = new Map(diets.map((d) => [d.slug, d]));
  for (const d of diets) {
    if (!DIET_ORDER.includes(d.key)) errors.push(`diet ${d.slug}: unknown key "${d.key}"`);
    if (words(d.answer) > MAX_ANSWER) errors.push(`diet ${d.slug}: quick answer is ${words(d.answer)} words (max ${MAX_ANSWER})`);
    d.swaps.forEach((s) => { need(s.from, `diet ${d.slug} swap`); s.to.forEach((t) => need(t, `diet ${d.slug} swap`)); });
    d.sources.forEach((id) => src(id, `diet ${d.slug}`));
  }
  const seen = new Set();
  for (const q of pages.questions) {
    if (seen.has(q.slug)) errors.push(`question ${q.slug}: duplicate slug`);
    seen.add(q.slug);
    if (!dietBySlug.has(q.diet)) errors.push(`question ${q.slug}: unknown diet "${q.diet}"`);
    if (words(q.answer) > MAX_Q_ANSWER) errors.push(`question ${q.slug}: answer is ${words(q.answer)} words (max ${MAX_Q_ANSWER})`);
    q.ingredients.forEach((s) => need(s, `question ${q.slug}`));
    q.swap.slugs.forEach((s) => need(s, `question ${q.slug} swap`));
    q.sources.forEach((id) => src(id, `question ${q.slug}`));
  }
  if (errors.length) throw new Error(`Dietary Hub data has ${errors.length} problem(s):\n - ${errors.join("\n - ")}`);

  // Board Builder reads item.diets: one code per DIET_ORDER entry
  for (const i of ingredients) i.diets = DIET_ORDER.map((d) => VERDICT[verdicts[i.slug][d].v].code);

  // Published boards that fit each diet: no "skip" item, fewest "check" items
  const fits = new Map(DIET_ORDER.map((d) => [d, []]));
  for (const b of boards) {
    const slugs = [...new Set(b.groups.flatMap((g) => g.items.map((x) => x.slug)).filter((s) => s && bySlug.has(s)))];
    if (slugs.length < 6) continue;
    for (const d of DIET_ORDER) {
      const codes = slugs.map((s) => VERDICT[verdicts[s][d].v].code);
      if (codes.includes(2)) continue;
      fits.get(d).push({ b, checks: codes.filter((c) => c === 1).length, slugs });
    }
  }
  for (const list of fits.values()) list.sort((a, b) => a.checks - b.checks || a.b.slug.localeCompare(b.b.slug));

  const counts = Object.fromEntries(DIET_ORDER.map((d) => [d, [0, 0, 0]]));
  for (const i of ingredients) DIET_ORDER.forEach((d, n) => counts[d][i.diets[n]]++);

  return { pages, verdicts, bySlug, diets, dietBySlug, questions: pages.questions, fits, counts, total: ingredients.length };
}

export function dietaryUrls(idx) {
  if (!idx) return [];
  return [
    { loc: "/dietary/", priority: "0.9" },
    ...idx.diets.map((d) => ({ loc: `/dietary/${d.slug}/`, priority: "0.8" })),
    { loc: "/dietary/questions/", priority: "0.6" },
    ...idx.questions.map((q) => ({ loc: `/dietary/questions/${q.slug}/`, priority: "0.7" })),
    { loc: "/dietary/mixed-diets/", priority: "0.7" },
    { loc: "/dietary/how-we-classify/", priority: "0.5" }
  ];
}

// Compact data for the Diet Checker. Reasons are de-duplicated into a list.
export function dietaryClientData(idx, categories) {
  const reasons = [];
  const rIdx = new Map();
  const r = (t) => { if (!rIdx.has(t)) { rIdx.set(t, reasons.length); reasons.push(t); } return rIdx.get(t); };
  const cats = categories.filter((c) => [...idx.bySlug.values()].some((i) => i.category === c));
  const items = [...idx.bySlug.values()]
    .sort((a, b) => cats.indexOf(a.category) - cats.indexOf(b.category) || a.title.localeCompare(b.title))
    .map((i) => [i.slug, i.title, cats.indexOf(i.category), i.diets, DIET_ORDER.map((d) => r(idx.verdicts[i.slug][d].why))]);
  return JSON.stringify({ diets: DIET_ORDER.map((d) => ({ key: d, label: LABEL[d], page: PAGE[d] })), cats, reasons, items });
}

// ----------------------------------------------------------- page helpers ---
const inline = (h, s = "") =>
  h.escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\((\/[^)\s]*)\)/g, '<a href="$2">$1</a>');

function badge(v, text = "") {
  const x = VERDICT[v];
  return `<span class="dt-badge ${x.cls}">${text || x.label}</span>`;
}

function crumbHtml(h, crumbs) {
  return `<p class="ing-crumb">${crumbs
    .map(([n, u], i) => (i === crumbs.length - 1 ? h.escapeHtml(n) : `<a href="${u}">${h.escapeHtml(n)}</a>`))
    .join(' <span aria-hidden="true">/</span> ')}</p>`;
}

function subnav(idx, current) {
  const links = [["/dietary/", "Diet Checker"], ...idx.diets.map((d) => [`/dietary/${d.slug}/`, d.name]), ["/dietary/mixed-diets/", "Mixed diets"], ["/dietary/questions/", "Questions"], ["/dietary/how-we-classify/", "How we classify"]];
  return `<nav class="pr-subnav" aria-label="Dietary Hub sections">${links.map(([u, l]) => `<a href="${u}"${u === current ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav>`;
}

function schema(h, idx, { name, url, description, crumbs, faq = [], list = [], howto = null }) {
  const updated = idx.pages.updated;
  const out = [
    { "@context": "https://schema.org", "@type": "Article", headline: name, description, url: h.absoluteUrl(url), datePublished: updated, dateModified: updated, author: h.authorRef || { "@type": "Organization", name: "Charcuterie Lab" }, publisher: { "@type": "Organization", name: "Charcuterie Lab" } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map(([n, u], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: h.absoluteUrl(u) })) }
  ];
  if (faq.length) out.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
  if (list.length) out.push({ "@context": "https://schema.org", "@type": "ItemList", itemListElement: list.map(([n, u], i) => ({ "@type": "ListItem", position: i + 1, name: n, ...(u ? { url: h.absoluteUrl(u) } : {}) })) });
  if (howto) out.push({ "@context": "https://schema.org", "@type": "HowTo", name: howto.name, step: howto.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.lead.replace(/\.$/, ""), text: s.text })) });
  return out.map((s) => `  <script type="application/ld+json">${h.jsonForScript(s)}</script>`).join("\n");
}

function page(h, idx, { url, title, description, crumbs, faq, list, howto, name, body, script = "" }) {
  return h.layout({
    title,
    description,
    canonical: url,
    type: "article",
    published: idx.pages.updated,
    modified: idx.pages.updated,
    head: schema(h, idx, { name: name || title, url, description, crumbs, faq, list, howto }),
    body: `<main class="bl-main pr-main dt-main">
  <div class="bl-inner pr-inner">
    ${crumbHtml(h, crumbs)}
    ${subnav(idx, url)}
${body}
  </div>
${h.newsletterPanel("dt-email", `dietary_${url.replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "hub"}`)}
</main>
${script}`
  });
}

function faqHtml(h, faq) {
  return `<div class="ebook-faq-list">
        ${faq.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${h.escapeHtml(f.q)}</summary><p>${inline(h, f.a)}</p></details>`).join("\n        ")}
      </div>`;
}

function sourcesHtml(h, idx, ids) {
  return `<section class="bl-section dt-sources" aria-labelledby="src-h">
      <h2 id="src-h">Sources</h2>
      <ul>${ids.map((id) => idx.pages.sources[id]).map((s) => `<li><a href="${h.escapeHtml(s.url)}" rel="noopener" target="_blank">${h.escapeHtml(s.name)}</a></li>`).join("")}</ul>
      <p class="dt-reviewed">Reviewed ${h.escapeHtml(longDate(idx.pages.updated))}. Brands change their recipes, so we re-check these pages every 6 months. For a serious allergy or celiac disease, read every label and ask your guest. <a href="/dietary/how-we-classify/">How we classify ingredients</a>.</p>
    </section>`;
}

function longDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m - 1]} ${d}, ${y}`;
}

const LABELS_PDF = "/downloads/dietary/diet-label-cards.pdf";

function labelsLead(h, id, campaign) {
  return `<aside class="dt-lead" aria-labelledby="${id}-h">
      <div>
        <p class="eyebrow">Free printable</p>
        <h2 id="${id}-h">Diet label cards for your board</h2>
        <p>Fold-over tent cards for Gluten-free, Nut-free, Contains nuts, Vegetarian, Vegan, Dairy-free and Contains pork, plus blanks. Print, cut, fold.</p>
      </div>
      <form class="fx-sample-form fx-lead-form" action="${h.newsletterUrl}" method="get" target="_blank" rel="noopener" data-fx-sample>
        <label class="sr-only" for="${id}">Email address</label>
        <input id="${id}" name="email" type="email" autocomplete="email" placeholder="Email address" required>
        <input type="hidden" name="utm_source" value="charcuterielab">
        <input type="hidden" name="utm_medium" value="site">
        <input type="hidden" name="utm_campaign" value="${h.escapeHtml(campaign)}">
        <button class="button primary" type="submit">Email me the label cards</button>
        <p class="fx-sample-done" hidden>Your cards are ready: <a class="button" href="${LABELS_PDF}" download>Download the PDF (2 pages)</a><span>You're also on the weekly Lab Report. Confirm in the tab that just opened.</span></p>
      </form>
      <script>(function(){document.querySelectorAll("[data-fx-sample]").forEach(function(f){if(f.dataset.bound)return;f.dataset.bound=1;f.addEventListener("submit",function(){var d=f.querySelector(".fx-sample-done");setTimeout(function(){d.hidden=false},200)})})})();</script>
    </aside>`;
}

const ingLink = (h, idx, s) => {
  const it = idx.bySlug.get(s);
  return it ? `<a href="/ingredients/${s}/">${h.escapeHtml(it.title)}</a>` : h.escapeHtml(s);
};

// Verdict tables by category, server-rendered so they work with JS off.
function verdictTables(h, idx, categories, keys, { open = ["Cheese", "Cured Meat & Seafood", "Crackers & Breads"] } = {}) {
  const items = [...idx.bySlug.values()];
  return categories
    .filter((c) => items.some((i) => i.category === c))
    .map((cat) => {
      const rows = items
        .filter((i) => i.category === cat)
        .sort((a, b) => a.diets[DIET_ORDER.indexOf(keys[0])] - b.diets[DIET_ORDER.indexOf(keys[0])] || a.title.localeCompare(b.title));
      const n = (code) => rows.filter((i) => i.diets[DIET_ORDER.indexOf(keys[0])] === code).length;
      return `<details class="dt-cat"${open.includes(cat) ? " open" : ""}>
        <summary><strong>${h.escapeHtml(cat)}</strong> <span class="dt-cat-count">${n(0)} safe · ${n(1)} check · ${n(2)} skip</span></summary>
        <div class="dt-table-wrap"><table class="dt-table">
          <thead><tr><th scope="col">Ingredient</th>${keys.map((k) => `<th scope="col">${LABEL[k]}</th>`).join("")}</tr></thead>
          <tbody>${rows.map((i) => `<tr><th scope="row"><a href="/ingredients/${i.slug}/">${h.escapeHtml(i.title)}</a></th>${keys.map((k) => { const v = idx.verdicts[i.slug][k]; return `<td data-label="${LABEL[k]}">${badge(v.v)}<span class="dt-why">${h.escapeHtml(v.why)}</span></td>`; }).join("")}</tr>`).join("")}</tbody>
        </table></div>
      </details>`;
    })
    .join("\n      ");
}

function boardCards(h, idx, key, n = 3) {
  const fits = idx.fits.get(key).slice(0, n);
  if (!fits.length) return "";
  const B = (s) => h.escapeHtml(s);
  return `<ul class="pr-boards dt-boards">${fits.map(({ b, checks }) => `<li><a href="/boards/${b.slug}/"><img src="${B((h.thumb || ((x) => x))(b.image))}" alt="" width="600" height="400" loading="lazy" decoding="async"><span>${B(b.h1 || b.title)}</span><small>${checks ? `${checks} item${checks > 1 ? "s" : ""} to check on the label` : "Every item fits as listed"}</small></a></li>`).join("")}</ul>`;
}

function kitCard(h, slug, campaign) {
  return h.printCard ? h.printCard(slug, campaign) : "";
}

// ------------------------------------------------------------------ pages ---
export function dietaryPages(h, idx, { categories, scriptSrc, dataSrc }) {
  const out = [];
  const add = (path, html) => out.push({ path: `${path.replace(/^\//, "")}index.html`, html });
  const B = (s) => h.escapeHtml(s);
  const dietName = (d) => d.name.toLowerCase();

  // ---------------------------------------------------------------- hub
  {
    const url = "/dietary/";
    const crumbs = [["Home", "/"], ["Dietary Hub", url]];
    const faq = [
      { q: "How do I make a charcuterie board for mixed diets?", a: "Plan for the strictest need first. Allergies and celiac disease need their own plate, built first. Vegetarian and vegan guests need clear labels. Most parties work as one board plus a small safe plate." },
      { q: "What's on a gluten-free charcuterie board?", a: "Plain cheese, whole cured ham like prosciutto, fruit, olives, nuts and crackers labeled gluten-free, served on their own plate." },
      { q: "Which cheeses aren't vegetarian?", a: "Parmigiano-Reggiano, Pecorino Romano, Gruyère, Gorgonzola and Roquefort are usually made with animal rennet. Look for vegetarian or microbial rennet on the label." },
      { q: "What replaces nuts on a nut-free board?", a: "Roasted pumpkin and sunflower seeds, bought from a nut-free facility." }
    ];
    const swaps = idx.diets.flatMap((d) => d.swaps.slice(0, 2).map((s) => ({ ...s, d })));
    const body = `
    <header class="pr-hero dt-hero">
      <p class="eyebrow">Dietary Hub</p>
      <h1>Charcuterie Boards for Every Diet</h1>
      <p class="pr-answer">Pick the diets at your party and see all ${idx.total} ingredients in our library sorted into <strong>Safe</strong>, <strong>Check the label</strong> and <strong>Skip</strong>, with the reason for each. Then build the board for your guest count.</p>
    </header>

    <section class="dt-checker" id="checker" aria-labelledby="checker-h" data-src="${dataSrc}">
      <h2 id="checker-h">Diet Checker</h2>
      <div class="dt-controls">
        <div class="dt-diets" role="group" aria-label="Diets at your party">
          ${DIET_ORDER.map((d) => `<button type="button" class="pr-chip" data-diet="${d}" aria-pressed="false">${LABEL[d]}</button>`).join("\n          ")}
        </div>
        <div class="dt-row">
          <label class="dt-field">Guests <input id="dt-guests" type="number" min="2" max="200" value="12" inputmode="numeric"></label>
          <label class="dt-field dt-grow"><span class="sr-only">Search ingredients</span><input id="dt-q" type="search" placeholder="Search: brie, salami, crackers…" autocomplete="off"></label>
        </div>
      </div>
      <div id="dt-result" class="dt-result" aria-live="polite">
        <p class="dt-hint">Choose one or more diets above.</p>
      </div>
      <noscript><p class="dt-hint">The checker needs JavaScript. Every verdict is also listed on the diet pages: ${idx.diets.map((d) => `<a href="/dietary/${d.slug}/">${B(d.name)}</a>`).join(", ")}.</p></noscript>
    </section>

    <section class="bl-section" aria-labelledby="diets-h">
      <h2 id="diets-h">Guides by diet</h2>
      <ul class="pr-tiles dt-tiles">
        ${idx.diets.map((d) => `<li><a href="/dietary/${d.slug}/" style="--t:${d.color}"><strong>${B(d.name)}</strong><span>${B(d.description)}</span><em>${idx.counts[d.key][0]} safe · ${idx.counts[d.key][1]} check · ${idx.counts[d.key][2]} skip</em></a></li>`).join("\n        ")}
      </ul>
      <p class="bl-note">Several diets at one party? Read <a href="/dietary/mixed-diets/">one board or two</a> first.</p>
    </section>

    <section class="bl-section" aria-labelledby="swaps-h">
      <h2 id="swaps-h">The swap chart</h2>
      <div class="dt-table-wrap"><table class="dt-table dt-swaps">
        <thead><tr><th scope="col">Instead of</th><th scope="col">Use</th><th scope="col">For</th><th scope="col">Why</th></tr></thead>
        <tbody>${swaps.map((s) => `<tr><th scope="row">${ingLink(h, idx, s.from)}</th><td>${s.to.map((t) => ingLink(h, idx, t)).join(", ")}</td><td><a href="/dietary/${s.d.slug}/">${B(s.d.name)}</a></td><td>${B(s.note)}</td></tr>`).join("")}</tbody>
      </table></div>
    </section>

    ${labelsLead(h, "dt-labels-hub", "diet_labels_hub")}
    ${kitCard(h, "mixed-diet-party-planner", "diet_checker")}

    <section class="bl-section" aria-labelledby="qs-h">
      <h2 id="qs-h">Most-asked questions</h2>
      <ul class="dt-qlist">${idx.questions.map((q) => `<li><a href="/dietary/questions/${q.slug}/">${B(q.q)}</a> <span class="dt-verdict-sm">${B(q.verdict)}</span></li>`).join("")}</ul>
    </section>

    <section class="bl-section" id="faq" aria-labelledby="faq-h">
      <h2 id="faq-h">Questions</h2>
      ${faqHtml(h, faq)}
    </section>
    <p class="dt-reviewed">Reviewed ${B(longDate(idx.pages.updated))}. Verdicts are a starting point for shopping. For a serious allergy or celiac disease, read every label and ask your guest. <a href="/dietary/how-we-classify/">How we classify ingredients</a>.</p>`;
    add(url, page(h, idx, {
      url,
      title: "Charcuterie for Every Diet: Diet Checker & Swaps",
      description: `Check ${idx.total} charcuterie ingredients against gluten-free, nut-free, vegetarian, vegan and dairy-free diets, with the reason for each verdict and swaps that work.`,
      name: "Charcuterie Boards for Every Diet",
      crumbs,
      faq,
      list: idx.diets.map((d) => [d.h1, `/dietary/${d.slug}/`]),
      body,
      script: `<script type="module" src="${scriptSrc}"></script>`
    }));
  }

  // ------------------------------------------------------------ diet pages
  for (const d of idx.diets) {
    const url = `/dietary/${d.slug}/`;
    const crumbs = [["Home", "/"], ["Dietary Hub", "/dietary/"], [d.name, url]];
    const keys = d.key === "vegan" ? ["vegan", "dairy-free"] : [d.key];
    const c = idx.counts[d.key];
    const qs = idx.questions.filter((q) => q.diet === d.slug);
    const boards = boardCards(h, idx, d.key);
    const builder = `/board-builder/?d=${keys[0]}&g=8&${utm(`diet_${d.slug}_builder`)}`;
    const body = `
    <header class="pr-hero dt-hero" style="--t:${d.color}">
      <p class="eyebrow">Dietary Hub · ${B(d.name)}</p>
      <h1>${B(d.h1)}</h1>
      <p class="pr-answer">${inline(h, d.answer)}</p>
      <p class="dt-stats"><span>${badge("safe", `${c[0]} safe`)}</span><span>${badge("check", `${c[1]} check the label`)}</span><span>${badge("skip", `${c[2]} skip`)}</span> <span class="dt-of">of ${idx.total} ingredients</span></p>
      <nav class="dt-jump" aria-label="On this page"><a href="#list">Safe, check, skip</a><a href="#swaps">Swaps</a>${boards ? `<a href="#boards">Boards</a>` : ""}<a href="#setup">Setup</a><a href="#labels">Labels</a><a href="#faq">Questions</a></nav>
    </header>

    <section class="bl-section dt-intro">
      ${d.intro.map((p) => `<p>${inline(h, p)}</p>`).join("\n      ")}
    </section>

    <section class="bl-section" id="list" aria-labelledby="list-h">
      <h2 id="list-h">What's ${dietName(d)}, what to check, what to skip</h2>
      <p class="bl-note"><strong>Safe</strong>: nothing in the usual recipe breaks the diet. <strong>Check the label</strong>: some brands or recipes do. <strong>Skip</strong>: the usual recipe does. Tap a category to open it, or use the <a href="/dietary/?d=${keys[0]}#checker">Diet Checker</a> to combine diets.</p>
      ${verdictTables(h, idx, categories, keys)}
    </section>

    <section class="bl-section" id="swaps" aria-labelledby="swaps-h">
      <h2 id="swaps-h">Swaps</h2>
      <div class="dt-table-wrap"><table class="dt-table dt-swaps">
        <thead><tr><th scope="col">Instead of</th><th scope="col">Use</th><th scope="col">Why</th></tr></thead>
        <tbody>${d.swaps.map((s) => `<tr><th scope="row">${ingLink(h, idx, s.from)}</th><td>${s.to.map((t) => ingLink(h, idx, t)).join(", ")}</td><td>${B(s.note)}</td></tr>`).join("")}</tbody>
      </table></div>
    </section>

    ${kitCard(h, d.kit, `diet_${d.slug}`)}

    ${boards ? `<section class="bl-section" id="boards" aria-labelledby="boards-h">
      <h2 id="boards-h">Boards from our library that fit</h2>
      <p class="bl-note">Checked item by item against the list above.</p>
      ${boards}
      <p><a class="pr-more" href="${builder}">Or build your own ${dietName(d)} board for your guest count &rarr;</a></p>
    </section>` : `<section class="bl-section" id="boards"><p><a class="pr-more" href="${builder}">Build a ${dietName(d)} board for your guest count in the Board Builder &rarr;</a></p></section>`}

    <section class="bl-section" id="setup" aria-labelledby="setup-h">
      <h2 id="setup-h">How to set up the board</h2>
      <ol class="dt-steps">${d.setup.map((s) => `<li><strong>${B(s.lead)}</strong> ${inline(h, s.text)}</li>`).join("")}</ol>
      <p class="bl-note">Food safety for every board: perishable food out no more than 2 hours, or 1 hour above 90°F (USDA).</p>
    </section>

    <section class="bl-section" id="labels" aria-labelledby="labels-h">
      <h2 id="labels-h">What to read on the label</h2>
      <ul class="dt-checklist">${d.labels.map((l) => `<li>${inline(h, l)}</li>`).join("")}</ul>
    </section>

    ${labelsLead(h, `dt-labels-${d.slug}`, `diet_labels_${d.slug}`)}

    ${qs.length ? `<section class="bl-section" aria-labelledby="qs-h">
      <h2 id="qs-h">Quick answers</h2>
      <ul class="dt-qlist">${qs.map((q) => `<li><a href="/dietary/questions/${q.slug}/">${B(q.q)}</a> <span class="dt-verdict-sm">${B(q.verdict)}</span></li>`).join("")}</ul>
    </section>` : ""}

    <section class="bl-section" id="faq" aria-labelledby="faq-h">
      <h2 id="faq-h">Questions</h2>
      ${faqHtml(h, d.faq)}
    </section>

    ${sourcesHtml(h, idx, d.sources)}`;
    add(url, page(h, idx, {
      url,
      title: d.title,
      description: d.description,
      name: d.h1,
      crumbs,
      faq: d.faq,
      howto: { name: `How to set up a ${dietName(d)} charcuterie board`, steps: d.setup },
      body
    }));
  }

  // -------------------------------------------------------- answer pages
  for (const q of idx.questions) {
    const d = idx.dietBySlug.get(q.diet);
    const url = `/dietary/questions/${q.slug}/`;
    const crumbs = [["Home", "/"], ["Dietary Hub", "/dietary/"], ["Questions", "/dietary/questions/"], [q.q, url]];
    const keys = d.key === "vegan" ? ["vegan", "dairy-free"] : [d.key];
    const slugs = q.ingredientsFromCategory ? [...idx.bySlug.values()].filter((i) => i.category === q.ingredientsFromCategory).sort((a, b) => a.diets[DIET_ORDER.indexOf(keys[0])] - b.diets[DIET_ORDER.indexOf(keys[0])] || a.title.localeCompare(b.title)).map((i) => i.slug) : q.ingredients;
    const body = `
    <header class="pr-hero dt-hero dt-q-hero" style="--t:${d.color}">
      <p class="eyebrow">Quick answer · <a href="/dietary/${d.slug}/">${B(d.name)}</a></p>
      <h1>${B(q.q)}</h1>
      <p class="dt-verdict">${B(q.verdict)}</p>
      <p class="pr-answer">${inline(h, q.answer)}</p>
    </header>

    <section class="bl-section dt-intro">
      ${q.body.map((p) => `<p>${inline(h, p)}</p>`).join("\n      ")}
    </section>

    <section class="bl-section" aria-labelledby="check-h">
      <h2 id="check-h">What to check</h2>
      <ul class="dt-checklist">${q.check.map((c) => `<li>${inline(h, c)}</li>`).join("")}</ul>
    </section>

    <section class="bl-section" aria-labelledby="tbl-h">
      <h2 id="tbl-h">Our verdicts</h2>
      <div class="dt-table-wrap"><table class="dt-table">
        <thead><tr><th scope="col">Ingredient</th>${keys.map((k) => `<th scope="col">${LABEL[k]}</th>`).join("")}</tr></thead>
        <tbody>${slugs.map((s) => `<tr><th scope="row">${ingLink(h, idx, s)}</th>${keys.map((k) => { const v = idx.verdicts[s][k]; return `<td data-label="${LABEL[k]}">${badge(v.v)}<span class="dt-why">${B(v.why)}</span></td>`; }).join("")}</tr>`).join("")}</tbody>
      </table></div>
    </section>

    <section class="bl-section" aria-labelledby="swap-h">
      <h2 id="swap-h">What to use instead</h2>
      <p>${inline(h, q.swap.text)}</p>
      <p class="pr-chips">${q.swap.slugs.map((s) => `<a class="pr-chip" href="/ingredients/${s}/">${B(idx.bySlug.get(s).title)}</a>`).join("")}</p>
      <p><a class="pr-more" href="/dietary/${d.slug}/">The full ${dietName(d)} guide: every ingredient, swaps and setup &rarr;</a></p>
    </section>

    ${kitCard(h, d.kit, `diet_q_${q.slug}`)}

    ${sourcesHtml(h, idx, q.sources)}`;
    add(url, page(h, idx, {
      url,
      title: q.title,
      description: q.description,
      name: q.q,
      crumbs,
      faq: [{ q: q.q, a: q.answer }],
      body
    }));
  }

  // ------------------------------------------------------ questions index
  {
    const url = "/dietary/questions/";
    const crumbs = [["Home", "/"], ["Dietary Hub", "/dietary/"], ["Questions", url]];
    const body = `
    <header class="pr-hero dt-hero">
      <p class="eyebrow">Dietary Hub</p>
      <h1>Charcuterie Diet Questions, Answered</h1>
      <p class="pr-answer">Short, sourced answers to the questions hosts ask most about gluten, nuts, rennet and honey on a charcuterie board.</p>
    </header>
    ${idx.diets.map((d) => { const qs = idx.questions.filter((q) => q.diet === d.slug); return qs.length ? `<section class="bl-section">
      <h2><a href="/dietary/${d.slug}/">${B(d.name)}</a></h2>
      <ul class="dt-qlist">${qs.map((q) => `<li><a href="/dietary/questions/${q.slug}/">${B(q.q)}</a> <span class="dt-verdict-sm">${B(q.verdict)}</span><br><span class="dt-why">${B(q.answer)}</span></li>`).join("")}</ul>
    </section>` : ""; }).join("\n    ")}`;
    add(url, page(h, idx, { url, title: "Charcuterie Diet Questions, Answered", description: "Is salami gluten-free? Is Parmesan vegetarian? Does mortadella have nuts? Short, sourced answers for hosts.", crumbs, list: idx.questions.map((q) => [q.q, `/dietary/questions/${q.slug}/`]), body }));
  }

  // ------------------------------------------------------- mixed diets
  {
    const url = "/dietary/mixed-diets/";
    const m = idx.pages.mixed;
    const crumbs = [["Home", "/"], ["Dietary Hub", "/dietary/"], ["Mixed diets", url]];
    const conflicts = [
      ["Vegan", "Nut-free", "Most plant cheeses are made from cashews or almonds.", "Use hummus (contains sesame), baba ganoush, marinated vegetables and olives as the vegan center.", "/dietary/?d=vegan,nut-free#checker"],
      ["Gluten-free", "Nut-free", "Nut-Thins and almond-flour crackers are gluten-free but full of nuts.", "Use rice or cassava crackers labeled gluten-free.", "/dietary/?d=gluten-free,nut-free#checker"],
      ["Vegetarian", "Gluten-free", "Few conflicts, but vegetarian guests eat more crackers when there's no meat.", "Buy extra gluten-free crackers and an extra cheese.", "/dietary/?d=vegetarian,gluten-free#checker"],
      ["Vegan", "Gluten-free", "Crackers have to pass two checks: no wheat, no butter or honey.", "Rice, cassava and chickpea crackers usually pass both. Read the label.", "/dietary/?d=vegan,gluten-free#checker"],
      ["Nut-free", "Sesame allergy", "Hummus, tahini, za'atar and sesame crackers all contain sesame.", "Ask about every allergy, not just the one you were told.", "/dietary/?d=nut-free#checker"]
    ];
    const faq = [
      { q: "Should I make separate boards for different diets?", a: "For allergies and celiac disease, give the guest their own plate, built first. For vegetarian and vegan guests, one labeled board usually works." },
      { q: "How do I label food for dietary needs?", a: "Put a small card on or next to every item: Gluten-free, Nut-free, Contains nuts, Vegetarian, Vegan. Keep the packaging nearby so guests can read the labels." },
      { q: "How many boards do I need for a big party?", a: "Our Party Planner uses one station below 20 guests, two up to 30, three up to 50 and four above that. Make one station the allergy-safe one." }
    ];
    const body = `
    <header class="pr-hero dt-hero">
      <p class="eyebrow">Dietary Hub</p>
      <h1>${B(m.title)}</h1>
      <p class="pr-answer">${inline(h, m.answer)}</p>
    </header>

    <section class="bl-section" aria-labelledby="order-h">
      <h2 id="order-h">Plan in this order</h2>
      <ol class="dt-steps">
        <li><strong>Ask every guest.</strong> One line on the invitation: "Anything you can't eat?" Allergies first, then diets.</li>
        <li><strong>Allergies and celiac disease get separation.</strong> Their own plate or small board, built first with clean hands and knives, on a different part of the table.</li>
        <li><strong>Then pick ingredients that pass every diet.</strong> Open the <a href="/dietary/#checker">Diet Checker</a>, choose all the diets at once, and shop from the Safe list.</li>
        <li><strong>Vegetarian and vegan guests need labels.</strong> A card on every cheese and spread answers the questions before they're asked.</li>
        <li><strong>Size it with the Party Planner.</strong> The usual amounts apply: 2 oz of meat and cheese each per guest before a meal, 3 oz when the board is the party food. <a href="/party-planner/">Party Planner</a>.</li>
      </ol>
    </section>

    <section class="bl-section" aria-labelledby="conf-h">
      <h2 id="conf-h">Where diets collide</h2>
      <div class="dt-table-wrap"><table class="dt-table">
        <thead><tr><th scope="col">Diets</th><th scope="col">The conflict</th><th scope="col">The fix</th></tr></thead>
        <tbody>${conflicts.map(([a, b, c, f, link]) => `<tr><th scope="row"><a href="${link}">${B(a)} + ${B(b)}</a></th><td>${B(c)}</td><td>${B(f)}</td></tr>`).join("")}</tbody>
      </table></div>
    </section>

    ${kitCard(h, "mixed-diet-party-planner", "diet_mixed")}
    ${labelsLead(h, "dt-labels-mixed", "diet_labels_mixed")}

    <section class="bl-section" id="faq" aria-labelledby="faq-h">
      <h2 id="faq-h">Questions</h2>
      ${faqHtml(h, faq)}
    </section>
    ${sourcesHtml(h, idx, ["fda-faster", "fda-label", "fda-gf"])}`;
    add(url, page(h, idx, { url, title: m.title, description: m.description, name: m.title, crumbs, faq, body }));
  }

  // --------------------------------------------------- how we classify
  {
    const url = "/dietary/how-we-classify/";
    const k = idx.pages.classify;
    const crumbs = [["Home", "/"], ["Dietary Hub", "/dietary/"], ["How we classify", url]];
    const body = `
    <header class="pr-hero dt-hero">
      <p class="eyebrow">Dietary Hub</p>
      <h1>${B(k.title)}</h1>
      <p class="pr-answer">${inline(h, k.intro)}</p>
    </header>

    <section class="bl-section" aria-labelledby="v-h">
      <h2 id="v-h">The three verdicts</h2>
      <div class="dt-table-wrap"><table class="dt-table">
        <tbody>
          <tr><th scope="row">${badge("safe")}</th><td>Nothing in the usual recipe breaks the diet. Example: prosciutto for gluten-free.</td></tr>
          <tr><th scope="row">${badge("check")}</th><td>Some brands or recipes break the diet and others don't, so the label decides. Example: salami for gluten-free, cheddar for vegetarian.</td></tr>
          <tr><th scope="row">${badge("skip")}</th><td>The usual recipe breaks the diet. Example: Parmigiano-Reggiano for vegetarian, because its official recipe requires calf rennet.</td></tr>
        </tbody>
      </table></div>
    </section>

    <section class="bl-section" aria-labelledby="how-h">
      <h2 id="how-h">How the verdicts are made</h2>
      <ol class="dt-steps">
        <li><strong>Start from the ingredient page.</strong> Each of our ${idx.total} ingredient pages lists its category, its type and its allergens.</li>
        <li><strong>Apply the rules.</strong> Wheat, rye or oats means skip for gluten-free. Tree nuts or peanuts means skip for nut-free. Whole-muscle cured meats are safe for gluten-free; salami and sausages are check, because some brands add binders.</li>
        <li><strong>Hand-check the exceptions.</strong> Cheeses with animal rennet, nuts hiding in mortadella and pink peppercorns, malt vinegar in chutney and more. Each exception has its own reason.</li>
        <li><strong>Re-check every 6 months.</strong> Recipes change. The reviewed date is at the bottom of every page.</li>
      </ol>
    </section>

    <section class="bl-section" aria-labelledby="n-h">
      <h2 id="n-h">The numbers</h2>
      <div class="dt-table-wrap"><table class="dt-table">
        <thead><tr><th scope="col">Diet</th><th scope="col">Safe</th><th scope="col">Check the label</th><th scope="col">Skip</th></tr></thead>
        <tbody>${DIET_ORDER.map((d) => `<tr><th scope="row"><a href="${PAGE[d]}">${LABEL[d]}</a></th><td>${idx.counts[d][0]}</td><td>${idx.counts[d][1]}</td><td>${idx.counts[d][2]}</td></tr>`).join("")}</tbody>
      </table></div>
    </section>

    <section class="bl-section" aria-labelledby="l-h">
      <h2 id="l-h">What this isn't</h2>
      <p>These verdicts help you shop and plan. They aren't medical advice and they can't see the package in your hand. For a serious allergy or celiac disease, read every label, keep the packaging, and ask your guest what they need.</p>
    </section>

    ${sourcesHtml(h, idx, Object.keys(idx.pages.sources))}`;
    add(url, page(h, idx, { url, title: k.title, description: k.description, name: k.title, crumbs, body }));
  }

  return out;
}

// "Diet notes" block for an ingredient page
export function ingredientDietBlock(h, idx, item) {
  if (!idx || !idx.verdicts[item.slug]) return "";
  const v = idx.verdicts[item.slug];
  return `<section class="ing-related dt-ing" aria-labelledby="dt-ing-h">
      <h2 id="dt-ing-h">Diet notes</h2>
      <ul class="dt-inglist">${DIET_ORDER.map((d) => `<li><a href="${PAGE[d]}">${LABEL[d]}</a> ${badge(v[d].v)} <span class="dt-why">${h.escapeHtml(v[d].why)}</span></li>`).join("")}</ul>
      <p><a class="pr-more" href="/dietary/#checker">Check a whole board against several diets &rarr;</a></p>
    </section>`;
}
