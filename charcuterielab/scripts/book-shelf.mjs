// Book shelf (17 Nov 2026). One book promo per page, site-wide: all seven
// Charcuterie Lab books in a row, 40-60% of the way down the page, with an
// intro written for the page. It replaces the older book promos (the book bar,
// the "Board #N in the book" card, the book line, the book section on hubs,
// the book offer card, the footer book block and the phone sticky bar),
// because one good-looking shelf in the middle of the page does more than
// several small ones at the edges.
//
// The book that fits the page comes first, outlined, with a tag. Each cover
// links to that book's own page; on phones the row scrolls sideways.
// Book sales pages (shop, /ebook/, /books/*, /around-the-world/) and pages
// with nothing to read are left alone. Gift guides keep their numbered book
// picks, because those are items in the list.
// Plan: claude/book-shelf-2026-11-17.md
import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { BUDGET_BOOK, GUIDE_BOOK, IMPOSSIBLE_BOOK, KETO_BOOK, PLANT_BOOK, TWO_BOOK, WORLD_BOOK } from "./boards.mjs";
import { tagAmazonUrl } from "./affiliate.mjs";

// The shelf sells the paperbacks only (17 Nov 2026): every cover goes to the
// book's Amazon page with the Associates tag. No typed prices on Amazon links
// (site rule since 2 Nov 2026: Amazon may show a different price).
const MAIN_PAPERBACK = "https://www.amazon.com/dp/B0HLHVXRXK";

const track = (url, c) => `${url}${url.includes("?") ? "&" : "?"}utm_source=charcuterielab&utm_medium=site&utm_campaign=${c}`;

// Order here is the default order on the shelf after the matched book.
export const SHELF = [
  { key: "main", name: "50 Boards", full: "50 Boards, Built by Science", boards: 50, line: "50 boards for every party", cover: "/images/book-cover.jpg", amazon: MAIN_PAPERBACK, href: "/ebook/", price: "$14", paperback: "$25.99",
    head: "Every board, fully planned", sub: "50 Boards, Built by Science has the shopping list, the build order and the pairing logic for 50 boards, from budget to holiday." },
  { key: "impossible", name: "Impossible Boards", full: "Impossible Boards", boards: 25, line: "25 showstopper shapes", cover: IMPOSSIBLE_BOOK.cover, amazon: IMPOSSIBLE_BOOK.paperbackUrl, href: "/books/impossible-boards/", price: IMPOSSIBLE_BOOK.ebookPrice, paperback: IMPOSSIBLE_BOOK.paperbackPrice,
    head: "Make the board everyone photographs", sub: "Impossible Boards shows the one trick behind 25 showpiece boards, from a Thanksgiving turkey to a dragon's hoard." },
  // Book 9 (23 Nov 2026). Until the paperback clears KDP review there's no
  // Amazon link, so its cover goes to the book's own page.
  { key: "budget", name: "On Any Budget", full: "Charcuterie on Any Budget", boards: 24, line: "24 boards, $15 to $250", cover: BUDGET_BOOK.cover, amazon: BUDGET_BOOK.paperbackUrl, href: BUDGET_BOOK.path, price: BUDGET_BOOK.ebookPrice, paperback: BUDGET_BOOK.paperbackPrice,
    head: "Know the total before you shop", sub: "Charcuterie on Any Budget has 24 boards from $15 to $250, each with a shopping list printed like a store receipt." },
  { key: "guide", name: "Ingredient Guide", full: "The Ingredient Guide", line: "325 ingredients explained", cover: GUIDE_BOOK.cover, amazon: GUIDE_BOOK.paperbackUrl, href: GUIDE_BOOK.ebookUrl, external: true, price: GUIDE_BOOK.ebookPrice, paperback: GUIDE_BOOK.paperbackPrice,
    head: "Every ingredient in one book", sub: "The Ingredient Guide covers 325 cheeses, meats and extras: what each one tastes like, what it pairs with and why, and how much to buy." },
  { key: "world", name: "Around the World", full: "Around the World in 16 Boards", boards: 16, line: "16 countries, 16 boards", cover: WORLD_BOOK.cover, amazon: WORLD_BOOK.paperbackUrl, href: "/around-the-world/", price: WORLD_BOOK.ebookPrice, paperback: WORLD_BOOK.paperbackPrice,
    head: "Take the board around the world", sub: "Around the World in 16 Boards plans a board from each of 16 countries, with the shopping list and build steps for every one." },
  { key: "two", name: "Boards for Two", full: "Boards for Two", boards: 25, line: "25 date-night boards", cover: TWO_BOOK.cover, amazon: TWO_BOOK.paperbackUrl, href: "/books/boards-for-two/", price: TWO_BOOK.ebookPrice, paperback: TWO_BOOK.paperbackPrice,
    head: "Boards sized for two", sub: "Boards for Two has 25 date-night boards with the shopping list for two, a prep countdown and the drink to pour with each." },
  { key: "plant", name: "Plant-Based", full: "15 Show-Stopping Plant-Based Boards", boards: 15, line: "15 vegan boards", cover: PLANT_BOOK.cover, amazon: PLANT_BOOK.paperbackUrl, href: "/books/plant-based-charcuterie-boards/", price: PLANT_BOOK.ebookPrice, paperback: PLANT_BOOK.paperbackPrice,
    head: "Fully plant-based boards", sub: "15 vegan boards, from cashew brie and smoked tempeh to hummus spreads, each with a shopping list and build steps." },
  { key: "keto", name: "Keto & Low‑Carb", full: "Keto & Low-Carb Boards", boards: 20, line: "net carbs on every item", cover: KETO_BOOK.cover, amazon: KETO_BOOK.paperbackUrl, href: "/books/keto-charcuterie-boards/", price: KETO_BOOK.ebookPrice, paperback: KETO_BOOK.paperbackPrice,
    head: "Boards for low-carb guests", sub: "Keto & Low-Carb Boards: 4 to 9 g net carbs per serving, low-carb dippers in place of crackers, and the net carbs of every item." }
];
const BY = Object.fromEntries(SHELF.map((b) => [b.key, b]));

// First rule that matches the post's slug, title or tags wins, so a vegan
// Christmas board goes to Plant-Based, and "brie vs camembert" goes to the
// Ingredient Guide rather than Around the World.
const MEATS_CHEESES = "bresaola|coppa|capicola|pancetta|mortadella|prosciutto|serrano|jamon|iberico|chorizo|salami|soppressata|nduja|kielbasa|sausage|cured meat|brie|camembert|gouda|cheddar|manchego|gruyere|comte|stilton|blue cheese|gorgonzola|parmesan|parmigiano|feta|ricotta|mozzarella|burrata|havarti|goat cheese|chevre|asiago|pecorino|fontina|swiss cheese|cheeses?";
const RULES = [
  ["plant", /\b(vegan|vegetarian|plant based|dairy free|hummus|meatless)\b/],
  ["keto", /\b(keto|low carb|carb|paleo|healthy|healthier)\b/],
  ["two", /\b(date night|for two|two people|valentine|valentines|anniversary|romantic|couple|galentine|mini charcuterie)\b/],
  // Price and store questions go to the budget book (23 Nov 2026). Slug and
  // title only (tags like "cheap" are on many posts); a "best X" guide counts only when it's a store guide.
  ["budget", (t) => { const h = t.split(" tagsfollow ")[0]; const store = /\b(aldi|lidl|walmart|kroger|sam s club|sams club|whole foods|trader joe s|trader joes|costco)\b/; return /^ best /.test(h) ? store.test(h) : store.test(h) || /\b(budget|cheap|cost|costs|price|prices|priced|price index|dollar|under \d+)\b/.test(h); }],
  ["guide", /\b(vs|versus|types of|difference|deep dive|what is)\b/],
  ["world", /\b(tapas|antipasto (board|platter)|mezze|meze|noche buena|smorgasbord|international|around the world|fusion|grazing around)\b|\b(spanish|italian|french|greek|mexican|japanese|korean|indian|british|german|mediterranean|middle eastern|scandinavian)\b.*\bboard\b/],
  // Holiday and themed words count only in the slug and title: a tag like
  // "christmas skewers" shouldn't send a general party post to Impossible.
  ["impossible", (t) => !/^ best /.test(t) && /\b(turkey|christmas|halloween|jack o|wreath|easter|super bowl|football|game day|new year|new years|nye|themed|unique|shaped|showstopper|showpiece|birthday|santa|pumpkin|candy|hot cocoa)\b/.test(t.split(" tagsfollow ")[0])],
  // Thanksgiving is Board 20 in 50 Boards, and amount questions are what its
  // shopping lists answer.
  ["main", /\b(thanksgiving|friendsgiving|fall|how much|per person)\b/],
  ["guide", new RegExp(`\\b(pairing|pairings|pairs|goes with|what goes|ingredient|ingredients|${MEATS_CHEESES}|fig jam|honey|honeycomb|crackers|olives|jam|mustard|nuts|dried fruit|wine|beer)\\b`)]
];

export function matchBook(text) {
  const t = ` ${String(text).toLowerCase().replace(/[-_]/g, " ").replace(/[^a-z0-9 ]+/g, " ")} `;
  for (const [key, re] of RULES) if (typeof re === "function" ? re(t) : re.test(t)) return key;
  return "main";
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// opts: eyebrow, head, sub, tag (label on the first cover), extra (HTML under
// the intro, such as the single-board plan line), gift (show paperback prices).
export function shelfHtml(first, campaign, thumb = (x) => x, opts = {}) {
  const lead = BY[first] || BY.main;
  const order = [lead, ...SHELF.filter((b) => b !== lead)];
  const tag = opts.tag === undefined ? (first !== "main" ? "Fits this page" : "") : opts.tag;
  const items = order.map((b, i) => {
    const href = b.amazon ? tagAmazonUrl(b.amazon, "&amp;") : b.href;
    const ext = b.amazon || b.external ? ' target="_blank" rel="noopener sponsored nofollow"' : "";
    const fit = i === 0 && tag ? `<span class="bs-fit">${esc(tag)}</span>` : "";
    const price = b.amazon ? "Paperback on Amazon" : "Ebook, paperback soon";
    return `<li${i === 0 ? ' class="bs-first"' : ""}><a href="${esc(href)}"${ext} data-book="${b.key}">
        <span class="bs-cover">${fit}<img src="${esc(thumb(b.cover))}" alt="${esc(b.name)} cover" width="150" height="196" loading="lazy" decoding="async"></span>
        <span class="bs-name">${esc(b.name)}</span>
        <span class="bs-line">${esc(b.line)}</span>
        <span class="bs-price">${esc(price)}</span>
      </a></li>`;
  }).join("\n      ");
  return `<aside class="book-shelf" aria-label="Charcuterie Lab books" data-campaign="${esc(campaign)}">
    <p class="bs-eyebrow">${esc(opts.eyebrow || "The Charcuterie Lab books")}</p>
    <p class="bs-title">${esc(opts.head || lead.head)}</p>
    <p class="bs-sub">${esc(opts.sub || lead.sub)}${opts.gift ? "" : " Full-colour paperback on Amazon."}</p>
    ${opts.extra || ""}
    <ul class="bs-row">
      ${items}
    </ul>
    <a class="bs-all" href="/shop/#ebooks">See all eight books &rarr;</a>
  </aside>\n`;
}

// ------------------------------------------------------------ removal ---

// The element that starts at `at` and its matching end tag, counting nested
// tags of the same name.
function elementEnd(html, at) {
  const name = /^<([a-z0-9]+)/i.exec(html.slice(at, at + 20))[1].toLowerCase();
  const re = new RegExp(`<${name}\\b|</${name}>`, "gi");
  re.lastIndex = at;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    depth += m[0][1] === "/" ? -1 : 1;
    if (depth === 0) return m.index + m[0].length;
  }
  return -1;
}

const SELLS = [
  /<aside\b[^>]*\bclass="fx-book[ "]/, // "Board #N in the book" card and the general book card
  /<p class="fx-line fx-book"/, // book line in a post
  /<aside class="fx-top[^"]*"[^>]*data-offer="book-/, // book offer card
  /<aside\b[^>]*\bclass="book-bar"/, // slim book bar (50 Boards / Ingredient Guide)
  /<section\b[^>]*\bclass="bl-book[ "]/, // book section on board and holiday pages
  /<section class="[^"]*\bbl-books"/, // books section on the boards hub
  /<section class="[^"]*\bdt-books"/, // diet books on the dietary hub
  /<article class="home-pick home-pick-book"/ // book card in the homepage shop row
];

// Removes every book promo; returns the page and what was learned from them
// (the board number from a Board #N card, any single-plan lines).
export function removeSells(html) {
  const found = { board: null, singles: [], n: 0 };
  for (const re of SELLS) {
    for (let guard = 0; guard < 20; guard++) {
      const m = re.exec(html);
      if (!m) break;
      const end = elementEnd(html, m.index);
      if (end < 0) break;
      const block = html.slice(m.index, end);
      const nn = /Board #(\d+) in the book|aria-label="Board (\d+) in the book"/.exec(block);
      if (nn && !found.board) found.board = Number(nn[1] || nn[2]);
      for (const s of block.match(/<p class="fx-single">[\s\S]*?<\/p>/g) || []) found.singles.push(s);
      html = html.slice(0, m.index) + html.slice(end);
      found.n++;
    }
  }
  // Footer "Keep going" block: drop just its book half.
  html = html.replace(/<!--lnb-->[\s\S]*?<!--\/lnb-->/g, () => { found.n++; return ""; });
  // Phone sticky "50 boards, fully planned" bar and its script.
  html = html.replace(/<div class="fx-sticky"[\s\S]*?<\/div>\s*<script>\(function\(\)\{var b=document\.querySelector\("\[data-fx-sticky\]"\)[\s\S]*?<\/script>/g, () => { found.n++; return ""; });
  // Wrappers the book bar sat in.
  html = html.replace(/<div class="ing-book-after">\s*<\/div>/g, "");
  return { html, found };
}

// ----------------------------------------------------------- placement ---

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
// Containers the shelf may sit directly inside: page layout, not cards or grids.
const LAYOUT = (t) => t.tag === "main" || t.tag === "section" ||
  (t.tag === "article" && /post-body|ing-article|ing-main|\barticle\b/.test(t.cls)) ||
  (t.tag === "div" && /(^|[\s-])(inner|body|content|wrap|container|main|page|col-main|group)([\s-]|$)/.test(t.cls) && !/card|grid|pick|row|list|finder|chip|form|qs-|fx-|faq|fold|table|step/.test(t.cls));
// Page-end blocks: nothing goes at or after them.
const HARD_STOP = /related|lab-next|newsletter|best-next|hol-next|fx-slide|gf-card|gf-related|footer|more-h|comments|lab-news|bb-keep/;
// The end of an article (FAQ, sources): nothing more goes inside that article.
const SOFT_STOP = /faq|^sources$|question/;

// Every spot inside <main> where a block can go: before an <h2>, <section>,
// <figure>, <table> or paragraph whose parents are all layout containers.
function candidates(html, b, e) {
  const out = [];
  const stack = [];
  const re = /<!--[\s\S]*?-->|<(script|style)\b[\s\S]*?<\/\1>|<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
  re.lastIndex = b;
  let m;
  let stop = e;
  while ((m = re.exec(html)) && m.index < stop) {
    if (!m[3]) continue;
    const tag = m[3].toLowerCase();
    if (m[2] === "/") {
      for (let i = stack.length - 1; i >= 0; i--) if (stack[i].tag === tag) { stack.length = i; break; }
      continue;
    }
    const attrs = m[4] || "";
    const cls = (/class="([^"]*)"/.exec(attrs) || [])[1] || "";
    const id = (/id="([^"]*)"/.exec(attrs) || [])[1] || "";
    const layout = stack.length >= 1 && stack.length <= 4 && stack.every(LAYOUT) && !stack.some((t) => t.closed);
    if (layout && /^(h2|section|aside|div|figure|p|table)$/.test(tag) && !/\bhidden\b/.test(attrs)) {
      if (HARD_STOP.test(cls) || HARD_STOP.test(id)) { stop = m.index; break; }
      if (SOFT_STOP.test(cls) || SOFT_STOP.test(id)) { if (stack.length > 1) stack[stack.length - 1].closed = true; }
      else if (tag === "h2" || tag === "section" || tag === "figure" || tag === "table" ||
        (tag === "aside" && !/fx-|book-shelf/.test(cls)) || (tag === "div" && /section|bl-|table-wrap/.test(cls)) || (tag === "p" && stack.length <= 3))
        out.push({ at: m.index, tag, depth: stack.length });
    }
    if (!VOID.has(tag) && !attrs.trim().endsWith("/")) stack.push({ tag, cls });
  }
  return out.filter((c) => c.at < stop);
}

// Fraction of the page's readable text that comes before each position.
function textFractions(html, b, e) {
  const re = /<(script|style)\b[\s\S]*?<\/\1>|<[^>]+>/g;
  const marks = []; // [htmlPos, textSoFar]
  let last = b, text = 0, m;
  re.lastIndex = b;
  while ((m = re.exec(html)) && m.index < e) {
    text += html.slice(last, m.index).replace(/\s+/g, " ").length;
    marks.push([m.index, text]);
    last = m.index + m[0].length;
  }
  text += html.slice(last, e).replace(/\s+/g, " ").length;
  const total = Math.max(1, text);
  return (pos) => {
    let lo = 0, hi = marks.length - 1, v = 0;
    while (lo <= hi) { const mid = (lo + hi) >> 1; if (marks[mid][0] <= pos) { v = marks[mid][1]; lo = mid + 1; } else hi = mid - 1; }
    return v / total;
  };
}

export function placeShelf(html, shelf, { from = 0.4, to = 0.6, aim = 0.48 } = {}) {
  if (html.includes('class="book-shelf"')) return null;
  const b = html.indexOf("<main");
  const e = html.lastIndexOf("</main>");
  if (b < 0 || e < 0) return null;
  const frac = textFractions(html, b, e);
  const before = (at) => html.slice(Math.max(b, at - 300), at);
  const stacked = (at) => /<\/aside>\s*$/.test(before(at)) || /class="fx-line[^"]*"[\s\S]*?<\/p>\s*$/.test(before(at));
  // A heading belongs with the text under it: never split an <h2> from the
  // paragraph after it, so a <p> right after an <h2>/<h3> is not a spot.
  const afterHeading = (at) => /<\/h[23]>\s*$/.test(before(at));
  // Nor split a table from the paragraph that introduces it (22 Nov 2026: the
  // drink pages' style tables had the shelf between the intro and the table).
  const tableAfterIntro = (at) => /^<(table|div[^>]*table-wrap)/.test(html.slice(at, at + 200)) && /<\/p>\s*$/.test(before(at));
  const all = candidates(html, b, e).filter((c) => !afterHeading(c.at) && !tableAfterIntro(c.at)).map((c) => ({ ...c, f: frac(c.at) }));
  if (!all.length) return null;
  const score = (c) => Math.abs(c.f - aim) + (stacked(c.at) ? 0.2 : 0) + (c.tag === "h2" || c.tag === "section" ? 0 : 0.03);
  const inRange = all.filter((c) => c.f >= from && c.f <= to);
  // Hubs that are one long filterable grid have no spot inside it: then the
  // nearest spot to the middle, which is right after the grid.
  let pool = inRange.length ? inRange : all.filter((c) => c.f >= 0.1);
  if (!pool.length) pool = all.filter((c) => c.f >= 0.03);
  if (!pool.length) return null;
  const pick = pool.sort((x, y) => score(x) - score(y))[0];
  return { html: html.slice(0, pick.at) + shelf + html.slice(pick.at), f: pick.f, inRange: inRange.length > 0 };
}

// --------------------------------------------------------------- pages ---

const SKIP = /^(shop|ebook|books|around-the-world|thanks|search|privacy|about|newsletter|404|downloads|assets|images|fonts|gifts\/charcuterie-books)(\/|$)/;

const HOLIDAY = { christmas: "impossible", halloween: "impossible", "new-years-eve": "impossible", "super-bowl": "impossible", easter: "impossible", "valentines-day": "two", thanksgiving: "main" };
const BOARD_CATS = { "by-price": "budget", "keto-low-carb": "keto", "plant-based": "plant", "around-the-world": "world", "for-two": "two", showpiece: "impossible", "seasonal-holiday": "impossible" };

async function frontMatter(root, slug) {
  try {
    const t = await readFile(join(root, "content", "blog", `${slug}.md`), "utf8");
    const fm = t.startsWith("---") ? t.slice(3, t.indexOf("\n---", 3)) : "";
    const get = (k) => ((new RegExp(`^${k}:\\s*(.*)$`, "m").exec(fm) || [])[1] || "");
    return `${slug} ${get("title")} tagsfollow ${get("tags")}`;
  } catch {
    return slug;
  }
}

async function loadBoardBooks(root) {
  const map = new Map();
  try {
    const dir = join(root, "content", "boards");
    for (const f of await readdir(dir)) {
      if (!f.endsWith(".json")) continue;
      const d = JSON.parse(await readFile(join(dir, f), "utf8"));
      if (d.slug && d.book) map.set(d.slug, { book: d.book, n: Number(String(d.number || "").slice(3)) || null });
    }
  } catch {}
  return map;
}

async function htmlFiles(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) await htmlFiles(f, out);
    else if (e.name === "index.html") out.push(f);
  }
  return out;
}

const title = (html) => ((/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html) || [])[1] || "").replace(/<[^>]+>/g, " ");

// Which book leads and what the intro says, for one page.
async function planFor(path, html, found, root, boardBooks) {
  const [sec, slug = "", sub = ""] = path.split("/");
  const camp = `shelf_${(path || "home").replace(/\//g, "_")}`;
  const boardIntro = (key, n, label) => {
    const B = BY[key];
    return { first: key, opts: { tag: "This board's book", head: `${label || "This board"} is Board ${n} in ${B.name.replace("‑", "-")}`, sub: `${B.full} has its full shopping list with amounts, the build steps and the swaps${B.boards ? `, plus ${B.boards - 1} more boards` : ""}.` } };
  };
  if (path === "") return { first: "main", camp };
  if (sec === "blog" && !slug) return { first: "main", camp };
  if (sec === "blog") {
    if (found.board) return { ...boardIntro("main", found.board, "The board in this post"), camp };
    const key = matchBook(await frontMatter(root, slug));
    return { first: key, opts: { tag: key === "main" ? "" : "Fits this post" }, camp };
  }
  if (sec === "boards" && slug && !sub) {
    const bb = boardBooks.get(slug);
    if (bb && bb.n) return { ...boardIntro(bb.book, bb.n), camp };
    return { first: BOARD_CATS[slug] || "main", camp };
  }
  if (sec === "boards") return { first: "main", camp };
  if (sec === "holidays") return { first: HOLIDAY[slug] || "main", camp };
  if (sec === "ingredients" || sec === "pairings") return { first: "guide", camp };
  if (sec === "gifts") {
    const key = slug ? matchBook(`${slug} ${title(html)}`) : "main";
    return { first: ["plant", "keto", "two"].includes(key) ? key : "main", camp, opts: { gift: true, eyebrow: "Give a Charcuterie Lab book", head: "A gift for anyone who hosts", sub: "Full-colour paperbacks on Amazon, ready to wrap. Every board in them comes with its shopping list.", tag: ["plant", "keto", "two"].includes(key) ? "Fits this gift" : "" } };
  }
  if (sec === "dietary") {
    const key = slug ? matchBook(slug) : "plant";
    return { first: ["plant", "keto"].includes(key) ? key : "main", camp, opts: slug ? {} : { head: "The diet books", sub: "Two complete books for guests who eat differently: 15 fully vegan boards, and 20 keto boards with the net carbs of every item.", tag: "" } };
  }
  return { first: "main", camp };
}

export async function injectBookShelf(dist, root, thumb = (x) => x) {
  const boardBooks = await loadBoardBooks(root);
  const counts = {}, bySec = {}, off = [], none = [];
  let pages = 0, removed = 0;
  for (const f of await htmlFiles(dist)) {
    const path = relative(dist, f).split(sep).slice(0, -1).join("/");
    if (SKIP.test(path)) continue;
    const src = await readFile(f, "utf8");
    if (!src.includes("<main")) continue;
    const { html, found } = removeSells(src);
    const plan = await planFor(path, html, found, root, boardBooks);
    const extra = found.singles.length ? `<div class="bs-singles">${found.singles.join("")}</div>` : "";
    const shelf = shelfHtml(plan.first, plan.camp, thumb, { ...(plan.opts || {}), extra });
    const placed = placeShelf(html, shelf);
    if (!placed) {
      none.push(path || "/"); // nowhere sensible to put it: keep the page as it was
      continue;
    }
    if (!placed.inRange) off.push(`${path || "/"} ${placed.f.toFixed(2)}`);
    await writeFile(f, placed.html);
    pages++;
    removed += found.n;
    counts[plan.first] = (counts[plan.first] || 0) + 1;
    const s = path.split("/")[0] || "home";
    bySec[s] = (bySec[s] || 0) + 1;
  }
  return { pages, removed, counts, bySec, off, none };
}
