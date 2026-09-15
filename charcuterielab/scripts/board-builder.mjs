// Board Builder: /board-builder/
//
// A "make your own board" tool. People add ingredients one category at a
// time, ask for recommendations, get advice as they go, and finally say how
// many people it's for and get a shopping list with prep and presentation
// steps (free, with a strong newsletter call to action).
//
// Everything it knows comes from the ingredient pages - category, role, price
// tier, serving size, allergens, pairs_with, avoid_with and the "Pair it with /
// Why it works" table - so editing an ingredient page updates the builder on
// the next build.
//
// Files:
//   scripts/board-builder.mjs            data + page HTML (this file)
//   src/board-builder/board-logic.js     scoring, advice, amounts, prep and
//                                        presentation (no DOM, reusable)
//   src/board-builder/board-builder.js   the page's behaviour
//   src/board-builder/board-builder.css  the page's styles
// Output: /assets/board-builder-data.json (loaded first) and
//         /assets/board-builder-prep.json (loaded when the list opens)

import { createHash } from "node:crypto";

// Categories in the order a board is shopped for. `category` must match the
// ingredient frontmatter exactly. `target` is the usual [min, max] count.
export const BOARD_CATEGORIES = [
  { key: "cheese", category: "Cheese", label: "Cheese", add: "Add cheese", tip: "Mix textures: one firm, one soft, one bold.", target: [2, 3], section: "Cheese counter" },
  { key: "meat", category: "Cured Meat & Seafood", label: "Meat & seafood", add: "Add meat", tip: "Pair a delicate slice with something spiced or smoky.", target: [2, 3], section: "Deli & seafood" },
  { key: "crackers", category: "Crackers & Breads", label: "Crackers & bread", add: "Add crackers", tip: "One neutral base and one with flavor covers every cheese.", target: [1, 2], section: "Bakery & cracker aisle" },
  { key: "fruit", category: "Fruit", label: "Fruit", add: "Add fruit", tip: "Acid and sweetness reset the palate between bites.", target: [1, 2], section: "Produce" },
  { key: "spreads", category: "Spreads, Jams & Honey", label: "Spreads & honey", add: "Add a spread", tip: "Something sweet next to the salty cheeses.", target: [1, 2], section: "Condiments & jams" },
  { key: "nuts", category: "Nuts & Seeds", label: "Nuts & seeds", add: "Add nuts", tip: "Nuts fill the gaps and add crunch.", target: [1, 1], section: "Snack aisle" },
  { key: "briny", category: "Pickles, Olives & Briny", label: "Pickles & olives", add: "Add pickles or olives", tip: "Vinegar and brine cut through the fat.", target: [1, 2], section: "Pickles & olives" },
  { key: "finish", category: "Finishing Touches", label: "Finishing touches", add: "Add a finishing touch", tip: "Optional: a garnish, a drizzle or a sweet bite.", target: [0, 1], section: "Spices & extras" }
];

// Suggested first picks when the board is still empty.
export const STARTERS = ["brie", "aged-cheddar", "manchego", "prosciutto-di-parma", "genoa-salami", "water-crackers", "grapes", "fig-jam", "marcona-almonds", "castelvetrano-olives"];

const stem = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const shortStem = (value = "") => {
  const s = stem(value);
  const cut = s.replace(/(ies|es|s)$/, "");
  return cut.length >= 3 ? cut : s;
};

const stripTags = (html = "") =>
  String(html)
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();

// Rows of the "Pair it with | Why it works" table on an ingredient page.
function pairingRows(html = "") {
  const rows = [];
  for (const table of html.match(/<table>[\s\S]*?<\/table>/g) || []) {
    const head = table.match(/<thead>([\s\S]*?)<\/thead>/);
    if (!head || !/pair/i.test(stripTags(head[1]))) continue;
    for (const tr of table.match(/<tr>[\s\S]*?<\/tr>/g) || []) {
      const cells = [...tr.matchAll(/<td>([\s\S]*?)<\/td>/g)].map((m) => stripTags(m[1]));
      if (cells.length >= 2 && cells[0] && cells[1]) rows.push({ label: stem(cells[0]), why: cells[1] });
    }
  }
  return rows;
}

// Steps of the "How to prep it for the board" list on an ingredient page as
// [bold lead, rest], minus the serving-size step (the shopping list already covers amounts).
function prepSteps(html = "") {
  const m = html.match(/How to prep it for the board<\/h2>\s*<ol>([\s\S]*?)<\/ol>/);
  if (!m) return [];
  return [...m[1].matchAll(/<li>([\s\S]*?)<\/li>/g)]
    .map((li) => {
      const bold = li[1].match(/^<strong>([\s\S]*?)<\/strong>\s*([\s\S]*)$/);
      // kept as written: "Temper 30 minutes." + "Cold cheddar..." or
      // "Decant into a small pot" + "with a honey dipper..."
      const title = stripTags(bold ? bold[1] : "");
      // drop asides that only make sense on the ingredient page itself
      const text = stripTags(bold ? bold[2] : li[1])
        .replace(/\s*This is the whole page\.?/g, "")
        .replace(/ on this page/g, "")
        .replace(/ from this page/g, "")
        .replace(/ on the page/g, "")
        .trim();
      return [title, text];
    })
    .filter(([title, text]) => (title || text) && !/^serve\b/i.test(title))
    .slice(0, 4);
}

export const hash = (value) => createHash("sha1").update(value).digest("hex").slice(0, 12);

export function boardBuilderData(ingredients, { categoryArt }) {
  const bySlug = new Map(ingredients.map((item) => [item.slug, item]));
  // item.c is an index into BOARD_CATEGORIES
  const catIndex = new Map(BOARD_CATEGORIES.map((c, i) => [c.category, i]));
  const usable = ingredients.filter((item) => catIndex.has(item.category));

  const missing = STARTERS.filter((s) => !bySlug.has(s));
  if (missing.length) console.warn(`board-builder: unknown starter ingredients: ${missing.join(", ")}`);

  // Pairing notes: "why it works" text for each pair that one of the two pages
  // explains. Keyed "a|b" with the slugs sorted.
  const notes = {};
  for (const item of usable) {
    const rows = pairingRows(item.html);
    if (!rows.length) continue;
    for (const otherSlug of item.pairsWith) {
      const other = bySlug.get(otherSlug);
      if (!other) continue;
      const full = stem(other.title);
      const short = shortStem(other.title);
      let best = null;
      let bestScore = 0;
      for (const row of rows) {
        const score = row.label.includes(full) ? 2 : row.label.includes(short) ? 1 : 0;
        if (score > bestScore) {
          best = row;
          bestScore = score;
        }
      }
      if (!best) continue;
      const key = [item.slug, otherSlug].sort().join("|");
      // prefer an exact-title match, otherwise keep whichever page got there first
      if (!notes[key] || bestScore === 2) notes[key] = best.why;
    }
  }

  const items = usable.map((item) => ({
    s: item.slug,
    t: item.title,
    c: catIndex.get(item.category),
    r: item.roleGroup,
    b: item.boardRole,
    p: item.priceTier,
    v: item.serving,
    m: item.prepTime,
    a: item.allergens.map((a) => a.toLowerCase()),
    g: item.tags,
    w: item.pairsWith.filter((s) => bySlug.has(s)),
    x: item.avoidWith || [],
    i: item.image || ""
  }));

  const data = {
    categories: BOARD_CATEGORIES.map((c) => ({ ...c, tint: categoryArt(c.category).tint, glyph: categoryArt(c.category).glyph })),
    starters: STARTERS.filter((s) => bySlug.has(s)),
    items,
    notes
  };

  const prep = {};
  for (const item of usable) {
    const steps = prepSteps(item.html);
    if (steps.length) prep[item.slug] = steps;
  }

  const json = JSON.stringify(data);
  const prepJson = JSON.stringify(prep);
  return {
    json,
    version: hash(json),
    prepJson,
    prepVersion: hash(prepJson),
    stats: { items: items.length, notes: Object.keys(notes).length, prep: Object.keys(prep).length }
  };
}

export function boardBuilderPage({ layout, escapeHtml, dataVersion, prepVersion, scriptVersion, styleVersion, newsletterUrl, itemCount }) {
  const description =
    "Build your own charcuterie board one ingredient at a time. Get pairing ideas and advice as you go, then a free shopping list with prep and presentation steps for your guest count.";
  return layout({
    title: "Charcuterie Board Builder: Make Your Own Board | Charcuterie Lab",
    canonical: "/board-builder/",
    image: "/images/50-boards-01-classic-american-starter.webp",
    description,
    head: `  <link rel="stylesheet" href="/assets/board-builder.css?v=${styleVersion}">
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Charcuterie Board Builder",
    url: "https://charcuterielab.com/board-builder/",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description
  }).replaceAll("<", "\\u003c")}</script>`,
    body: `<main class="bb-main" id="bb" data-src="/assets/board-builder-data.json?v=${dataVersion}" data-prep="/assets/board-builder-prep.json?v=${prepVersion}" data-newsletter="${escapeHtml(newsletterUrl)}">
  <section class="bb-intro">
    <div class="bb-wrap">
      <p class="bb-kicker">Board Builder</p>
      <h1>Make your own charcuterie board</h1>
      <p class="bb-lede">Add what you like, one category at a time. The Lab recommends what pairs with it and explains why, drawing on ${escapeHtml(String(itemCount))} ingredient profiles. When you're done, tell us how many people it's for and get a free shopping list, with how to prep and present every item.</p>
    </div>
  </section>

  <div class="bb-wrap bb-app" id="bb-app">
    <noscript><p class="bb-note">The board builder needs JavaScript turned on. You can still browse every ingredient on the <a href="/ingredients/">ingredients page</a>.</p></noscript>
    <p class="bb-loading">Loading the builder…</p>
  </div>
  <div class="bb-bar" id="bb-bar" hidden></div>
  <dialog class="bb-picker" id="bb-picker" aria-labelledby="bb-picker-title"></dialog>
</main>
<script type="module" src="/assets/board-builder.js?v=${scriptVersion}"></script>`
  });
}
